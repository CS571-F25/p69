// Structural tokens get 2x weight in Jaccard scoring — they carry more discriminating power
const STRUCTURAL = new Set([
  "wake", "toe", "reverse", "flip", "somersault",
  "180", "360", "540", "720", "900",
  "stepover", "line", "double", "ski",
]);

// Hard-coded spoken short-forms per base abbreviation
const ABBR_SHORT = {
  S:       ["side", "side slide"],
  B:       ["back", "one eighty"],
  F:       ["front", "back front"],
  O:       ["three sixty"],
  BB:      ["back back"],
  "5B":    ["five forty", "five back"],
  "5F":    ["five front"],
  "7F":    ["seven twenty", "seven front"],
  "7B":    ["seven back"],
  LB:      ["stepover back", "line back"],
  LF:      ["stepover front", "line front"],
  WB:      ["wake back"],
  WF:      ["wake front"],
  WO:      ["wake three sixty"],
  WBB:     ["wake back back"],
  W5B:     ["wake five forty", "wake five back"],
  W5F:     ["wake five front"],
  W7F:     ["wake seven twenty", "wake seven"],
  W7B:     ["wake seven back"],
  W9B:     ["wake nine hundred", "wake nine"],
  W9F:     ["wake nine front"],
  WLB:     ["wake stepover back", "wake line back"],
  WLF:     ["wake stepover front", "wake line front"],
  WLO:     ["wake three sixty stepover"],
  WLBB:    ["wake back back stepover"],
  WL5B:    ["wake five forty stepover", "wake five stepover"],
  WL5F:    ["wake five front stepover"],
  WL7F:    ["wake seven stepover"],
  WL7B:    ["wake seven back stepover"],
  WL9B:    ["wake nine stepover"],
  WL9F:    ["wake nine front stepover"],
  WL5LB:   ["double stepover back", "five double stepover back"],
  WL5LF:   ["double stepover front", "five double stepover front"],
  BFL:     ["back flip", "backflip", "backward flip", "backward somersault"],
  BFLB:    ["flip half twist back", "wake flip half twist"],
  BFLBB:   ["flip full twist back back"],
  BFLO:    ["flip full twist front"],
  "BFL5B": ["flip five forty back"],
  "BFL5F": ["flip five forty front"],
  BFLLB:   ["flip twist line back"],
  BFLSLB:  ["flip ski line back"],
  BFLSLBB: ["flip ski line back back"],
  BFLSLO:  ["flip ski line three sixty"],
  BFLSL5F: ["flip ski line five front"],
  FFL:     ["front flip", "frontflip", "forward flip", "forward somersault"],
  FFLB:    ["forward flip back", "front flip back"],
  FFLF:    ["forward flip front"],
  FFLBB:   ["forward flip back back"],
  "FFL5F": ["forward flip five front"],
  FFLSL5F: ["forward flip ski line five front"],
  DBFL:    ["double flip", "double back flip"],
  TS:      ["toe side", "toe side slide"],
  TB:      ["toe back"],
  TF:      ["toe front"],
  TO:      ["toe three sixty"],
  TBB:     ["toe back back"],
  T5B:     ["toe five forty", "toe five back"],
  T5F:     ["toe five front"],
  T7F:     ["toe seven twenty", "toe seven"],
  TWLB:    ["toe wake stepover back", "toe wake line back"],
  TWLF:    ["toe wake stepover front", "toe wake line front"],
  TWLO:    ["toe wake three sixty stepover"],
  TWLBB:   ["toe wake back back stepover"],
  TWL5B:   ["toe wake five stepover"],
  TWL5F:   ["toe wake five front stepover"],
  TWL7F:   ["toe wake seven stepover"],
  TWB:     ["toe wake back"],
  TWF:     ["toe wake front"],
  TWO:     ["toe wake three sixty"],
  TWBB:    ["toe wake back back"],
  TW5B:    ["toe wake five forty", "toe wake five"],
  TW5F:    ["toe wake five front"],
  TW7F:    ["toe wake seven"],
  TW7B:    ["toe wake seven back"],
  SLB:     ["ski line back", "line back"],
  SLF:     ["ski line front", "line front"],
  SLO:     ["ski line three sixty", "three sixty line"],
  SLBB:    ["ski line back back", "back back line"],
  SL5B:    ["five forty ski line", "ski line five back"],
  SL5F:    ["ski line five front"],
  SL7B:    ["seven twenty ski line back", "seven ski line back"],
  SL7F:    ["seven twenty ski line", "seven ski line"],
};

// Tokenize a trick description string
function descToTokens(desc) {
  let s = desc.toLowerCase();
  s = s.replace(/\bf-b\b/g, "front back");
  s = s.replace(/\bb-f\b/g, "back front");
  s = s.replace(/\bf-f\b/g, "front front");
  s = s.replace(/\bb-b\b/g, "back back");
  s = s.replace(/\btoehold\b/g, "toe");
  return s.split(/[\s\-\/]+/).filter((t) => t.length > 0);
}

// Normalize a raw speech transcript to a token array
export function normalizeTranscript(raw) {
  let s = raw.toLowerCase().trim();
  s = s.replace(/\bone[\s-]?eighty\b/g, "180");
  s = s.replace(/\bthree[\s-]?sixty\b/g, "360");
  s = s.replace(/\bfive[\s-]?forty\b/g, "540");
  s = s.replace(/\bseven[\s-]?twenty\b/g, "720");
  s = s.replace(/\bnine[\s-]?hundred\b/g, "900");
  s = s.replace(/\bbackflip\b/g, "back flip");
  s = s.replace(/\bfrontflip\b/g, "front flip");
  s = s.replace(/[^\w\s]/g, " ");
  s = s.replace(/\b(the|a|an|and|of)\b/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s.split(" ").filter(Boolean);
}

// Generate all alias token arrays for a trick
function getAliasTokenArrays(trick) {
  const aliases = [];
  const isReverse = trick.abbr.startsWith("R");
  const baseAbbr = isReverse ? trick.abbr.slice(1) : trick.abbr;

  // 1. From description
  aliases.push(descToTokens(trick.description));

  // 2. Hard-coded short forms for base abbr
  const shorts = ABBR_SHORT[baseAbbr] || [];
  for (const phrase of shorts) {
    const tokens = normalizeTranscript(phrase);
    aliases.push(isReverse ? ["reverse", ...tokens] : tokens);
  }

  // 3. Extra semantic aliases from description keywords
  const desc = trick.description;
  if (!isReverse) {
    if (desc.includes("Backward Somersault")) {
      aliases.push(["back", "flip"]);
      aliases.push(["backflip"]);
    }
    if (desc.includes("Forward Somersault")) {
      aliases.push(["front", "flip"]);
      aliases.push(["frontflip"]);
    }
    if (desc.includes("Wake Double Flip")) {
      aliases.push(["double", "flip"]);
    }
  }

  return aliases;
}

// Build the alias index from all tricks. Call once per tricks list change.
// Returns a Map<abbr, { trick, aliases: string[][] }>
export function buildAliasIndex(tricks) {
  const index = new Map();
  for (const trick of tricks) {
    index.set(trick.abbr, {
      trick,
      aliases: getAliasTokenArrays(trick),
    });
  }
  return index;
}

// Compute weighted token frequency map
function weightedMap(tokens) {
  const map = new Map();
  for (const t of tokens) {
    const w = STRUCTURAL.has(t) ? 2 : 1;
    map.set(t, (map.get(t) || 0) + w);
  }
  return map;
}

// Weighted Jaccard similarity between two token arrays
function jaccardScore(inputTokens, aliasTokens) {
  const inputMap = weightedMap(inputTokens);
  const aliasMap = weightedMap(aliasTokens);

  let intersection = 0;
  for (const [token, weight] of inputMap) {
    if (aliasMap.has(token)) {
      intersection += Math.min(weight, aliasMap.get(token));
    }
  }

  let union = 0;
  const allTokens = new Set([...inputMap.keys(), ...aliasMap.keys()]);
  for (const token of allTokens) {
    union += Math.max(inputMap.get(token) || 0, aliasMap.get(token) || 0);
  }

  return union === 0 ? 0 : intersection / union;
}

const COMMIT_THRESHOLD = 0.45;
// Longest real alias phrase is ~5 tokens (e.g. "toe wake five front stepover");
// cap search a bit above that so we don't waste work on huge windows.
const MAX_ALIAS_TOKENS = 6;

// Score one fixed token window (no transcript normalization) against every
// trick legal for the current orientation. Returns the best { trick, score,
// displayText } or an { isReverse: true } marker, or null if nothing matched.
function scoreTokenWindow(windowTokens, orientation, aliasIndex) {
  if (windowTokens.length === 1 && windowTokens[0] === "reverse") {
    return { isReverse: true, trick: null, score: 1, displayText: "Reverse" };
  }

  let best = null;
  for (const [, entry] of aliasIndex) {
    if (entry.trick.startPos !== orientation) continue;

    let bestForTrick = 0;
    for (const aliasTokens of entry.aliases) {
      const s = jaccardScore(windowTokens, aliasTokens);
      if (s > bestForTrick) bestForTrick = s;
    }

    if (bestForTrick > 0 && (!best || bestForTrick > best.score)) {
      best = {
        trick: entry.trick,
        score: bestForTrick,
        displayText: `${entry.trick.abbr} — ${entry.trick.description} — ${entry.trick.points} pts`,
      };
    }
  }
  return best;
}

// Find the longest-scoring prefix of pendingTokens, trying every window
// length from 1 up to MAX_ALIAS_TOKENS. Ties favor the SHORTER window
// (strict `>` below) — when a short window is already a perfect match,
// don't let a longer window that merely ties hijack it.
function bestPrefixMatch(pendingTokens, orientation, aliasIndex) {
  const maxLen = Math.min(pendingTokens.length, MAX_ALIAS_TOKENS);
  let best = null;
  for (let len = 1; len <= maxLen; len++) {
    const result = scoreTokenWindow(pendingTokens.slice(0, len), orientation, aliasIndex);
    if (!result) continue;
    const score = result.isReverse ? 1 : result.score;
    if (score >= COMMIT_THRESHOLD && (!best || score > best.score)) {
      best = { length: len, result, score };
    }
  }
  return best;
}

// Number-phrase starter words that are meaningless alone — they only become
// a real token ("180"/"360"/"540"/"720"/"900") once normalizeTranscript sees
// both halves together. Until the second half arrives, a trailing starter
// word must never count as "proof" that the previous word's trick is done.
const NUMBER_PHRASE_STARTERS = new Set(["one", "three", "five", "seven", "nine"]);

function splitAmbiguousTail(tokens) {
  if (tokens.length > 0 && NUMBER_PHRASE_STARTERS.has(tokens[tokens.length - 1])) {
    return { safeTokens: tokens.slice(0, -1), hasAmbiguousTail: true };
  }
  return { safeTokens: tokens, hasAmbiguousTail: false };
}

// True if pendingTokens' words are all contained in some legal alias that is
// STRICTLY longer — i.e. more words could still plausibly arrive and change
// which trick this becomes (e.g. "wake" is a prefix of "wake back", "wake
// front", "wake 360" ...). Used to decide whether a pause should be treated
// as "done talking" or "just a breath mid-word" and wait longer.
export function isPlausiblePrefixOfLonger(pendingTokens, orientation, aliasIndex) {
  if (!aliasIndex || pendingTokens.length === 0) return false;
  const pendingMap = weightedMap(pendingTokens);

  for (const [, entry] of aliasIndex) {
    if (entry.trick.startPos !== orientation) continue;
    for (const aliasTokens of entry.aliases) {
      if (aliasTokens.length <= pendingTokens.length) continue;
      const aliasMap = weightedMap(aliasTokens);
      let isSubset = true;
      for (const [token, weight] of pendingMap) {
        if ((aliasMap.get(token) || 0) < weight) {
          isSubset = false;
          break;
        }
      }
      if (isSubset) return true;
    }
  }
  return false;
}

// Call on every partial-transcript update with the tokens not yet applied.
// Only commits a chunk when there's a token AFTER it proving the trick
// boundary already passed — otherwise the match might still be incomplete
// (e.g. "wake" alone vs. "wake back"), so this returns null and the caller
// keeps buffering. This is what lets tricks apply the instant the next
// trick's first word arrives, with no pause required in between.
export function pickCommittableChunk(pendingTokens, calcState, aliasIndex) {
  if (!aliasIndex || pendingTokens.length === 0) return null;

  // An incomplete number word (e.g. "three" before "sixty" lands) can't be
  // trusted as the "next token" proving a boundary — work off the tokens
  // before it instead, and wait for it to resolve.
  const { safeTokens } = splitAmbiguousTail(pendingTokens);
  if (safeTokens.length === 0) return null;

  const best = bestPrefixMatch(safeTokens, calcState.orientation, aliasIndex);
  if (best && best.length < safeTokens.length) return best;
  return null;
}

// True if a pause right now should be treated as "still mid-word" (needs a
// longer wait) rather than "done talking."
export function needsExtendedPause(pendingTokens, calcState, aliasIndex) {
  if (!aliasIndex || pendingTokens.length === 0) return false;
  const { hasAmbiguousTail } = splitAmbiguousTail(pendingTokens);
  if (hasAmbiguousTail) return true;
  return isPlausiblePrefixOfLonger(pendingTokens, calcState.orientation, aliasIndex);
}

// Call once speech has paused (or the user stopped listening) to make a
// final decision on whatever's left, since there's no next word left to
// disambiguate further.
export function forceCommitChunk(pendingTokens, calcState, aliasIndex) {
  if (!aliasIndex || pendingTokens.length === 0) return null;
  return bestPrefixMatch(pendingTokens, calcState.orientation, aliasIndex);
}
