import { useState, useRef, useCallback, useEffect } from "react";
import { voiceInputAvailable, requestSpeechPermission, startListening } from "../utils/speechPlugin.js";
import { buildAliasIndex, normalizeTranscript, pickCommittableChunk, forceCommitChunk, needsExtendedPause } from "../utils/voiceTrickMatcher.js";

const FINAL_PAUSE_MS = 600; // silence before force-committing an unambiguous chunk
const EXTENDED_PAUSE_MS = 1500; // longer wait when the pending words could still extend into something else
const INACTIVITY_TIMEOUT_MS = 20000; // fully stop after this long with zero progress
const RESTART_DELAY_MS = 200; // buffer before restarting the native engine so it fully releases first
const APPLIED_FLASH_MS = 1200;
const MISMATCH_FLASH_MS = 1800;

// Continuous voice dictation: tap once, read off a whole list of tricks back
// to back with no gaps needed. One native session stays open the whole time;
// words are greedily chunked off the front of the live transcript as soon as
// it's unambiguous a trick boundary passed (the next word doesn't fit the
// current match any better), so most tricks apply the instant the next word
// starts — only the very last trick in a run needs a short pause to commit.
// "Reverse" said alone triggers the same logic as the REV button.
export function useVoiceInput({ tricks, calcState, onTrickRecognized, onReverse }) {
  const [voiceState, setVoiceState] = useState("idle"); // "idle" | "listening" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [lastApplied, setLastApplied] = useState(null);

  const stopFnRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const appliedTimerRef = useRef(null);
  const errorTimerRef = useRef(null);
  const aliasIndexRef = useRef(null);
  const continuousRef = useRef(false);
  const consumedCountRef = useRef(0);
  const fullTranscriptRef = useRef("");

  // Keep fresh refs so callbacks always see current values
  const calcStateRef = useRef(calcState);
  calcStateRef.current = calcState;
  const onTrickRecognizedRef = useRef(onTrickRecognized);
  onTrickRecognizedRef.current = onTrickRecognized;
  const onReverseRef = useRef(onReverse);
  onReverseRef.current = onReverse;

  // Rebuild alias index when the tricks list changes
  useEffect(() => {
    if (tricks && tricks.length > 0) {
      aliasIndexRef.current = buildAliasIndex(tricks);
    }
  }, [tricks]);

  const platform = voiceInputAvailable();

  const flashApplied = useCallback((displayText) => {
    clearTimeout(errorTimerRef.current);
    setErrorMessage("");
    clearTimeout(appliedTimerRef.current);
    setLastApplied({ displayText });
    appliedTimerRef.current = setTimeout(() => setLastApplied(null), APPLIED_FLASH_MS);
  }, []);

  const flashMismatch = useCallback((text) => {
    clearTimeout(errorTimerRef.current);
    setErrorMessage(`Didn't catch that: "${text}"`);
    errorTimerRef.current = setTimeout(() => setErrorMessage(""), MISMATCH_FLASH_MS);
  }, []);

  // Apply one resolved chunk exactly like a grid tap would.
  const applyChunk = useCallback((result) => {
    if (result.isReverse) {
      onReverseRef.current?.();
      flashApplied("Reverse");
    } else if (result.trick) {
      onTrickRecognizedRef.current(result.trick);
      flashApplied(result.displayText);
    }
  }, [flashApplied]);

  const endSession = useCallback(async () => {
    clearTimeout(pauseTimerRef.current);
    clearTimeout(inactivityTimerRef.current);
    if (stopFnRef.current) {
      const fn = stopFnRef.current;
      stopFnRef.current = null;
      await fn();
    }
  }, []);

  const stopAll = useCallback(async (message) => {
    continuousRef.current = false;
    const pending = normalizeTranscript(fullTranscriptRef.current).slice(consumedCountRef.current);
    await endSession();
    if (pending.length > 0) {
      const forced = forceCommitChunk(pending, calcStateRef.current, aliasIndexRef.current);
      if (forced) applyChunk(forced.result);
    }
    setVoiceState("idle");
    setLiveTranscript("");
    if (message) {
      clearTimeout(errorTimerRef.current);
      setErrorMessage(message);
      errorTimerRef.current = setTimeout(() => setErrorMessage(""), 3000);
    }
  }, [endSession, applyChunk]);

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      stopAll("Stopped listening — no speech detected.");
    }, INACTIVITY_TIMEOUT_MS);
  }, [stopAll]);

  const startVoice = useCallback(async () => {
    if (platform === "unsupported" || continuousRef.current) return;

    const permStatus = await requestSpeechPermission();
    if (permStatus !== "granted") {
      setErrorMessage("Microphone permission denied — enable in Settings.");
      setVoiceState("error");
      setTimeout(() => setVoiceState((s) => (s === "error" ? "idle" : s)), 3000);
      return;
    }

    continuousRef.current = true;

    // Runs one native listening session. The on-device recognizer can decide
    // on its own to finalize (e.g. it detected a pause) and stop capturing
    // audio — independent of our own pause timers — especially when talking
    // slowly. When that happens (isFinal fires without us having asked for
    // it) we transparently start a fresh session so the mic never goes deaf
    // while the UI still shows "listening".
    const beginSession = async () => {
      if (!continuousRef.current) return;

      consumedCountRef.current = 0;
      fullTranscriptRef.current = "";
      setLiveTranscript("");
      setVoiceState("listening");

      const armPauseTimer = () => {
        clearTimeout(pauseTimerRef.current);

        const pendingNow = normalizeTranscript(fullTranscriptRef.current).slice(consumedCountRef.current);
        // If these words could still turn into something longer (e.g. "wake"
        // ahead of "back"/"front"/"360"...), give it more time before giving
        // up and committing the short interpretation.
        const delay = needsExtendedPause(pendingNow, calcStateRef.current, aliasIndexRef.current)
          ? EXTENDED_PAUSE_MS
          : FINAL_PAUSE_MS;

        pauseTimerRef.current = setTimeout(() => {
          const pending = normalizeTranscript(fullTranscriptRef.current).slice(consumedCountRef.current);
          if (pending.length === 0) return;
          const forced = forceCommitChunk(pending, calcStateRef.current, aliasIndexRef.current);
          if (forced) {
            consumedCountRef.current += forced.length;
            applyChunk(forced.result);
          } else {
            flashMismatch(pending.join(" "));
            consumedCountRef.current += pending.length; // don't get stuck retrying unrecognized words
          }
          setLiveTranscript("");
        }, delay);
      };

      stopFnRef.current = await startListening(
        async (transcript, isFinal) => {
          fullTranscriptRef.current = transcript;
          resetInactivityTimer();

          const allTokens = normalizeTranscript(transcript);
          let pending = allTokens.slice(consumedCountRef.current);
          setLiveTranscript(pending.join(" "));

          const chunk = pickCommittableChunk(pending, calcStateRef.current, aliasIndexRef.current);
          if (chunk) {
            consumedCountRef.current += chunk.length;
            applyChunk(chunk.result);
            pending = allTokens.slice(consumedCountRef.current);
            setLiveTranscript(pending.join(" "));
          }

          if (isFinal) {
            // The native session just ended on its own — commit whatever's
            // left, tear its listeners down properly, then quietly restart
            // so listening keeps going.
            clearTimeout(pauseTimerRef.current);
            if (pending.length > 0) {
              const forced = forceCommitChunk(pending, calcStateRef.current, aliasIndexRef.current);
              if (forced) applyChunk(forced.result);
              else flashMismatch(pending.join(" "));
            }
            const fn = stopFnRef.current;
            stopFnRef.current = null;
            setLiveTranscript("");
            if (fn) await fn();
            if (continuousRef.current) {
              setTimeout(beginSession, RESTART_DELAY_MS);
            }
            return;
          }

          armPauseTimer();
        },
        () => {
          if (continuousRef.current) {
            stopAll("Speech recognition hiccuped — tap the mic to restart.");
          }
        }
      );

      resetInactivityTimer();
    };

    beginSession();
  }, [platform, applyChunk, flashMismatch, resetInactivityTimer, stopAll]);

  const toggleListening = useCallback(() => {
    if (continuousRef.current) stopAll();
    else startVoice();
  }, [stopAll, startVoice]);

  useEffect(() => () => { stopAll(); }, [stopAll]);

  return {
    voiceState,
    liveTranscript,
    errorMessage,
    lastApplied,
    platform,
    toggleListening,
  };
}
