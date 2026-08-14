import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { Capacitor } from "@capacitor/core";

export function voiceInputAvailable() {
  const p = Capacitor.getPlatform();
  if (p === "ios") return "native";
  if (p === "android") return "android";
  return "unsupported";
}

export async function requestSpeechPermission() {
  try {
    const perms = await SpeechRecognition.requestPermissions();
    return perms.speechRecognition === "granted" ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

// Starts listening. Returns a cleanup function that stops the session.
// onResult(transcript, isFinal) — called for each partial and the final result
// onError(message) — called on failure
export async function startListening(onResult, onError) {
  const platform = Capacitor.getPlatform();
  if (platform === "android" && !navigator.onLine) {
    onError("Voice requires internet on this Android device.");
    return () => {};
  }

  let lastTranscript = "";
  let active = true;
  let partialHandle, stateHandle;

  const cleanup = async () => {
    active = false;
    try { await SpeechRecognition.stop(); } catch {}
    partialHandle?.remove();
    stateHandle?.remove();
  };

  partialHandle = await SpeechRecognition.addListener("partialResults", (data) => {
    if (!active) return;
    if (data.matches && data.matches.length > 0) {
      lastTranscript = data.matches[0];
      onResult(lastTranscript, false);
    }
  });

  stateHandle = await SpeechRecognition.addListener("listeningState", (data) => {
    if (!active) return;
    if (data.status === "stopped") {
      if (lastTranscript) {
        onResult(lastTranscript, true);
      } else {
        onError("No speech detected.");
      }
    }
  });

  try {
    await SpeechRecognition.start({
      language: "en-US",
      partialResults: true,
      popup: false,
    });
  } catch (err) {
    await cleanup();
    onError(err.message || "Speech recognition failed to start.");
    return () => {};
  }

  return cleanup;
}
