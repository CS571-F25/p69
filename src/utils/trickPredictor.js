import * as ort from "onnxruntime-web/wasm";
import stoi from "../model/stoi.json";
import itos from "../model/itos.json";

const SEQ_LEN = 100;
const VOCAB_SIZE = 78;

// Singleton pattern: store the PROMISE, not the result
// This prevents race conditions from React double-renders
let sessionPromise = null;

// Mutex to prevent concurrent inference calls
let inferenceInProgress = false;
let inferenceQueue = [];

// Use local WASM files and single-threaded mode (Capacitor WebViews lack SharedArrayBuffer)
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = "/";

// Initialize the ONNX session (lazy load with singleton promise)
function getSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      // Fetch from public folder - Vite serves public/ at root
      const modelUrl = "/model/tricks_gru.onnx";
      console.log("Loading ONNX model from:", modelUrl);

      // Fetch the model as ArrayBuffer and create session from it
      const response = await fetch(modelUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
      }
      const modelBuffer = await response.arrayBuffer();
      const session = await ort.InferenceSession.create(modelBuffer);
      console.log("ONNX session created successfully");
      return session;
    })();
  }
  return sessionPromise;
}

// Apply softmax to convert logits to probabilities
function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sumExps);
}

// Convert trick abbreviation to model ID
function trickToId(abbr) {
  // Strip any modifiers like " (NC)" from the abbreviation
  const cleanAbbr = abbr.replace(/ \(NC\)$/, "");
  return stoi[cleanAbbr] ?? null;
}

// Convert model ID to trick abbreviation
function idToTrick(id) {
  return itos[String(id)] ?? null;
}

/**
 * Run inference with mutex to prevent "Session already started" errors
 * ONNX Runtime doesn't support concurrent run() calls on the same session
 */
async function runInferenceWithLock(sess, feeds) {
  // If inference is already running, wait in queue
  if (inferenceInProgress) {
    return new Promise((resolve, reject) => {
      inferenceQueue.push({ feeds, resolve, reject });
    });
  }

  inferenceInProgress = true;
  try {
    const result = await sess.run(feeds);
    return result;
  } finally {
    inferenceInProgress = false;
    // Process next item in queue if any
    if (inferenceQueue.length > 0) {
      const next = inferenceQueue.shift();
      runInferenceWithLock(sess, next.feeds)
        .then(next.resolve)
        .catch(next.reject);
    }
  }
}

/**
 * Predict the next tricks based on current trick history
 * @param {Array<{abbr: string}>} trickHistory - Array of tricks performed
 * @returns {Promise<Array<{abbr: string, probability: number}>>} - Top predictions with probabilities
 */
export async function predictNextTricks(trickHistory) {
  try {
    const sess = await getSession();

    // Convert trick history to IDs
    const ids = trickHistory
      .map((t) => trickToId(t.abbr))
      .filter((id) => id !== null);

    // Pad sequence to SEQ_LEN (left-pad with zeros)
    const paddedIds = new Array(SEQ_LEN).fill(0);
    const startIdx = Math.max(0, SEQ_LEN - ids.length);
    ids.slice(-SEQ_LEN).forEach((id, i) => {
      paddedIds[startIdx + i] = id;
    });

    // Create input tensor (BigInt64Array for int64)
    const inputTensor = new ort.Tensor(
      "int64",
      BigInt64Array.from(paddedIds.map((x) => BigInt(x))),
      [1, SEQ_LEN]
    );

    // Run inference with lock to prevent concurrent calls
    const results = await runInferenceWithLock(sess, { input_ids: inputTensor });
    const logits = Array.from(results.logits.data);

    // Apply softmax
    const probabilities = softmax(logits);

    // Create predictions array with trick names and probabilities
    const predictions = probabilities
      .map((prob, idx) => ({
        abbr: idToTrick(idx),
        probability: prob,
      }))
      .filter((p) => p.abbr !== null && p.abbr !== "END" && p.abbr !== "FALL")
      .sort((a, b) => b.probability - a.probability);

    return predictions;
  } catch (error) {
    console.error("Prediction error:", error);
    return [];
  }
}

/**
 * Filter predictions by orientation and available reverses, add rank for heatmap
 * @param {Array<{abbr: string, probability: number}>} predictions - Raw predictions (sorted by probability)
 * @param {string} currentOrientation - "front" or "back"
 * @param {Array<{abbr: string}>} allPerformedTricks - All tricks done in both passes
 * @param {Array} availableTricks - All available tricks for current ski count
 * @param {Array<string>} availableReverseAbbrs - Array of reverse abbreviations currently available (e.g., ["RBB", "RLB"])
 * @returns {{top5: Array, heatmap: Map<string, number>}} - Top 5 for display + heatmap ranks for all tricks
 */
export function filterLegalPredictions(
  predictions,
  currentOrientation,
  allPerformedTricks,
  availableTricks,
  availableReverseAbbrs = []
) {
  // Get set of already performed trick abbreviations (without NC modifier)
  const performedSet = new Set(
    allPerformedTricks.map((t) => t.abbr.replace(/ \(NC\)$/, ""))
  );

  // Create a map of available tricks by abbreviation
  const availableMap = new Map(availableTricks.map((t) => [t.abbr, t]));

  // Create set of available reverse abbreviations for quick lookup
  const availableReverseSet = new Set(availableReverseAbbrs);

  // Filter to only tricks matching current orientation AND valid reverses
  const filtered = predictions
    .filter((pred) => {
      const trickDef = availableMap.get(pred.abbr);
      if (!trickDef) return false;

      // Check if this is a reverse trick (starts with R followed by a letter)
      const isReverseTrick = /^R[A-Z]/.test(pred.abbr);

      if (isReverseTrick) {
        // Only allow this reverse if it's in the available reverse options
        return availableReverseSet.has(pred.abbr);
      }

      // Non-reverse tricks: filter by orientation
      return trickDef.startPos === currentOrientation;
    })
    .map((pred, index) => {
      const trickDef = availableMap.get(pred.abbr);
      const alreadyDone = performedSet.has(pred.abbr);
      return {
        ...pred,
        rank: index, // Position in sorted list (0 = best)
        points: alreadyDone ? 0 : trickDef.points,
        alreadyPerformed: alreadyDone,
      };
    });

  // Build heatmap: abbr -> rank (0 = hottest/red, higher = cooler/blue)
  const heatmap = new Map();
  filtered.forEach((pred) => {
    heatmap.set(pred.abbr, pred.rank);
  });

  // Only suggest tricks that haven't been performed yet
  const unperformed = filtered.filter((pred) => !pred.alreadyPerformed);

  return {
    top5: unperformed.slice(0, 5),
    heatmap,
    totalFiltered: filtered.length,
  };
}
