import Foundation
import Capacitor
import Speech
import AVFoundation

// SPM-compatible speech recognition plugin.
// jsName must match the JS registerPlugin("SpeechRecognition") call in the community package.
// requiresOnDeviceRecognition = true ensures fully offline operation on iOS 13+.
@objc(SpeechRecognitionPlugin)
public class SpeechRecognitionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechRecognitionPlugin"
    public let jsName = "SpeechRecognition"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available",            returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start",                returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop",                 returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSupportedLanguages",returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isListening",          returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermissions",     returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions",   returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hasPermission",        returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission",    returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAllListeners",   returnType: CAPPluginReturnPromise),
    ]

    private var speechRecognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?

    @objc func available(_ call: CAPPluginCall) {
        guard let recognizer = SFSpeechRecognizer() else {
            call.resolve(["available": false])
            return
        }
        call.resolve(["available": recognizer.isAvailable])
    }

    @objc func start(_ call: CAPPluginCall) {
        if let engine = self.audioEngine, engine.isRunning {
            call.reject("Ongoing speech recognition")
            return
        }

        let status = SFSpeechRecognizer.authorizationStatus()
        guard status == .authorized else {
            call.reject("Missing permission")
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            guard granted else {
                call.reject("User denied access to microphone")
                return
            }

            let language: String = call.getString("language") ?? "en-US"
            let maxResults: Int = call.getInt("maxResults") ?? 5
            let partialResults: Bool = call.getBool("partialResults") ?? false

            self.recognitionTask?.cancel()
            self.recognitionTask = nil

            self.audioEngine = AVAudioEngine()
            self.speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: language))

            do {
                let session = AVAudioSession.sharedInstance()
                try session.setCategory(.playAndRecord, options: .defaultToSpeaker)
                try session.setMode(.default)
                try session.setActive(true, options: .notifyOthersOnDeactivation)
            } catch {
                call.reject("Audio session error: \(error.localizedDescription)")
                return
            }

            self.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let request = self.recognitionRequest else {
                call.reject("Failed to create recognition request")
                return
            }

            request.shouldReportPartialResults = partialResults
            // Force on-device recognition for offline support (iOS 13+)
            if #available(iOS 13, *) {
                request.requiresOnDeviceRecognition = true
            }

            let inputNode = self.audioEngine!.inputNode
            let format = inputNode.outputFormat(forBus: 0)

            self.recognitionTask = self.speechRecognizer?.recognitionTask(with: request) { result, error in
                if let result = result {
                    let resultArray = NSMutableArray()
                    for (i, transcription) in result.transcriptions.enumerated() {
                        if maxResults > 0 && i < maxResults {
                            resultArray.add(transcription.formattedString)
                        }
                    }

                    if partialResults {
                        self.notifyListeners("partialResults", data: ["matches": resultArray])
                    } else {
                        call.resolve(["matches": resultArray])
                    }

                    if result.isFinal {
                        self.stopAudioEngine()
                        self.notifyListeners("listeningState", data: ["status": "stopped"])
                        self.recognitionTask = nil
                        self.recognitionRequest = nil
                    }
                }

                if let error = error {
                    self.stopAudioEngine()
                    self.recognitionRequest = nil
                    self.recognitionTask = nil
                    self.notifyListeners("listeningState", data: ["status": "stopped"])
                    // Error code 1110 = no speech detected (not a real error)
                    let nsError = error as NSError
                    if nsError.code != 1110 {
                        call.reject(error.localizedDescription)
                    }
                }
            }

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                self.recognitionRequest?.append(buffer)
            }

            self.audioEngine?.prepare()
            do {
                try self.audioEngine?.start()
                self.notifyListeners("listeningState", data: ["status": "started"])
                if partialResults { call.resolve() }
            } catch {
                call.reject("Failed to start audio engine: \(error.localizedDescription)")
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .default).async {
            if let engine = self.audioEngine, engine.isRunning {
                self.recognitionRequest?.endAudio()
                engine.stop()
                self.notifyListeners("listeningState", data: ["status": "stopped"])
            }
            call.resolve()
        }
    }

    @objc func isListening(_ call: CAPPluginCall) {
        call.resolve(["listening": self.audioEngine?.isRunning ?? false])
    }

    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        let langs = SFSpeechRecognizer.supportedLocales().map { $0.identifier }
        call.resolve(["languages": langs])
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        let status = SFSpeechRecognizer.authorizationStatus()
        let permission: String
        switch status {
        case .authorized:   permission = "granted"
        case .denied, .restricted: permission = "denied"
        default:            permission = "prompt"
        }
        call.resolve(["speechRecognition": permission])
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                guard status == .authorized else {
                    self.checkPermissions(call)
                    return
                }
                AVAudioSession.sharedInstance().requestRecordPermission { granted in
                    call.resolve(["speechRecognition": granted ? "granted" : "denied"])
                }
            }
        }
    }

    // Legacy aliases
    @objc func hasPermission(_ call: CAPPluginCall) { checkPermissions(call) }
    @objc func requestPermission(_ call: CAPPluginCall) { requestPermissions(call) }
    @objc override public func removeAllListeners(_ call: CAPPluginCall) { call.resolve() }

    private func stopAudioEngine() {
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
