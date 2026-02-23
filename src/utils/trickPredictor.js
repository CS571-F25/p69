import * as ort from "onnxruntime-web/wasm";

const SEQ_LEN = 30;

// Skill level → tier directory mapping
const TIER_MAP = {
  beginner: "0_1k",
  intermediate: "1k_2k",
  advanced: "2k_7k",
  pro: "7k_plus",
};

// Per-tier caches: { sessionPromise, stoi, itos }
const tierCache = {};

// Mutex to prevent concurrent inference calls per tier
const inferenceState = {};

// Use local WASM files and single-threaded mode (Capacitor WebViews lack SharedArrayBuffer)
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = "/";

/**
 * Get or create the ONNX session + vocab for a specific tier
 */
function getTierResources(tier) {
  if (!tierCache[tier]) {
    tierCache[tier] = (async () => {
      const basePath = `/model/${tier}`;

      // Fetch stoi and itos vocab files
      const [stoiRes, itosRes] = await Promise.all([
        fetch(`${basePath}/stoi.json`),
        fetch(`${basePath}/itos.json`),
      ]);

      if (!stoiRes.ok || !itosRes.ok) {
        throw new Error(`Failed to fetch vocab for tier ${tier}`);
      }

      const [stoi, itos] = await Promise.all([stoiRes.json(), itosRes.json()]);

      // Fetch ONNX model and its external data file in parallel
      const modelName = `tricks_gru_${tier}`;
      const modelUrl = `${basePath}/${modelName}.onnx`;
      const dataUrl = `${basePath}/${modelName}.onnx.data`;
      console.log("Loading ONNX model from:", modelUrl);

      const [modelRes, dataRes] = await Promise.all([
        fetch(modelUrl),
        fetch(dataUrl),
      ]);
      if (!modelRes.ok) {
        throw new Error(`Failed to fetch model: ${modelRes.status} ${modelRes.statusText}`);
      }
      if (!dataRes.ok) {
        throw new Error(`Failed to fetch model data: ${dataRes.status} ${dataRes.statusText}`);
      }

      const [modelBuffer, dataBuffer] = await Promise.all([
        modelRes.arrayBuffer(),
        dataRes.arrayBuffer(),
      ]);

      const session = await ort.InferenceSession.create(modelBuffer, {
        externalData: [
          { path: `${modelName}.onnx.data`, data: dataBuffer },
        ],
      });
      console.log(`ONNX session created for tier: ${tier}`);

      return { session, stoi, itos };
    })();
  }
  return tierCache[tier];
}

// Apply softmax to convert logits to probabilities
function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sumExps);
}

/**
 * Run inference with mutex to prevent "Session already started" errors
 * ONNX Runtime doesn't support concurrent run() calls on the same session
 */
async function runInferenceWithLock(tier, sess, feeds) {
  if (!inferenceState[tier]) {
    inferenceState[tier] = { inProgress: false, queue: [] };
  }
  const state = inferenceState[tier];

  if (state.inProgress) {
    return new Promise((resolve, reject) => {
      state.queue.push({ feeds, resolve, reject });
    });
  }

  state.inProgress = true;
  try {
    const result = await sess.run(feeds);
    return result;
  } finally {
    state.inProgress = false;
    if (state.queue.length > 0) {
      const next = state.queue.shift();
      runInferenceWithLock(tier, sess, next.feeds)
        .then(next.resolve)
        .catch(next.reject);
    }
  }
}

export function preloadTier(skillLevel) {
  const tier = TIER_MAP[skillLevel || "beginner"];
  if (tier) getTierResources(tier);
}

/**
 * Predict the next tricks based on current trick history
 * @param {Array<{abbr: string}>} trickHistory - Array of tricks performed
 * @param {string} skillLevel - One of "beginner", "intermediate", "advanced", "pro"
 * @returns {Promise<Array<{abbr: string, probability: number}>>} - Top predictions with probabilities
 */
export async function predictNextTricks(trickHistory, skillLevel = "beginner") {
  try {
    const tier = TIER_MAP[skillLevel] || TIER_MAP.beginner;
    const { session, stoi, itos } = await getTierResources(tier);

    // Convert trick history to IDs using tier-specific vocab
    const ids = trickHistory
      .map((t) => {
        const cleanAbbr = t.abbr.replace(/ \(NC\)$/, "");
        return stoi[cleanAbbr] ?? null;
      })
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
    const results = await runInferenceWithLock(tier, session, { input_ids: inputTensor });
    const logits = Array.from(results.logits.data);

    // Apply softmax
    const probabilities = softmax(logits);

    // Create predictions array with trick names and probabilities
    const predictions = probabilities
      .map((prob, idx) => ({
        abbr: itos[String(idx)] ?? null,
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

  return {
    top5: filtered.slice(0, 5),
    heatmap,
    totalFiltered: filtered.length,
  };
}
