// Shared trick definitions for calculator and guide
// All point values are from IWWF 2025 Rules

// ============================================
// 2 SKI TRICK DEFINITIONS
// ============================================

export const twoSkiSpinTricks = [
  { abbr: "S", points: 20, description: "Side Slide", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "B", points: 30, description: "180 F-B", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "F", points: 30, description: "B-F", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "O", points: 40, description: "360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "BB", points: 40, description: "B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "5B", points: 50, description: "540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "5F", points: 50, description: "B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "7F", points: 60, description: "720 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "7B", points: 60, description: "B-B", startPos: "back", endPos: "back", changesOrientation: false },
];

export const twoSkiStepTricks = [
  { abbr: "LB", points: 70, description: "180 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "LF", points: 70, description: "B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
];

export const twoSkiWakeSpinTricks = [
  { abbr: "WB", points: 50, description: "Wake 180 F-B", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "WF", points: 50, description: "Wake B-F", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "WO", points: 110, description: "Wake 360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "WBB", points: 110, description: "Wake B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "W5B", points: 310, description: "Wake 540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "W5F", points: 310, description: "Wake B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "W7F", points: 800, description: "Wake 720 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "W7B", points: 480, description: "Wake B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "W9B", points: 850, description: "Wake 900 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "W9F", points: 850, description: "Wake B-F", startPos: "back", endPos: "front", changesOrientation: true },
];

export const twoSkiWakeStepTricks = [
  { abbr: "WLB", points: 110, description: "Wake 180 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "WLF", points: 110, description: "Wake B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "WLO", points: 200, description: "Wake 360 F-F Stepover", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "WLBB", points: 200, description: "Wake B-B Stepover", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "WL5B", points: 300, description: "Wake 540 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "WL5F", points: 300, description: "Wake 540 B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "WL7F", points: 700, description: "Wake 720 F-F Stepover", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "WL7B", points: 550, description: "Wake 720 B-B Stepover", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "WL9B", points: 800, description: "Wake 900 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "WL9F", points: 800, description: "Wake 900 B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true },
];

export const twoSkiFlipTricks = [
  { abbr: "BFL", points: 500, description: "Backward Somersault", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "BFLB", points: 750, description: "Wake Flip Half Twist F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "BFLBB", points: 800, description: "Wake Flip Full Twist B-B", startPos: "back", endPos: "back", changesOrientation: false, canReverse: false },
  { abbr: "FFL", points: 800, description: "Forward Somersault", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "FFLB", points: 850, description: "Forward Somersault F-B", startPos: "front", endPos: "back", changesOrientation: true, canReverse: false },
  { abbr: "FFLF", points: 850, description: "Forward Somersault B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "FFLBB", points: 900, description: "Forward Somersault B-B", startPos: "back", endPos: "back", changesOrientation: false, canReverse: false },
  { abbr: "FFL5F", points: 950, description: "Forward Somersault 540 B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "DBFL", points: 1000, description: "Wake Double Flip", startPos: "front", endPos: "front", changesOrientation: false, canReverse: false },
  { abbr: "BFLLB", points: 800, description: "Wake Flip Twist Line Back", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "BFLSLBB", points: 900, description: "Wake Flip Ski Line 360 B-B", startPos: "back", endPos: "back", changesOrientation: false, canReverse: false },
  { abbr: "BFLSL5F", points: 950, description: "Wake Flip Ski Line 540 B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
];

// ============================================
// 1 SKI TRICK DEFINITIONS
// ============================================

export const oneSkiSpinTricks = [
  { abbr: "S", points: 40, description: "Side Slide", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "B", points: 60, description: "180 F-B", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "F", points: 60, description: "B-F", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "O", points: 90, description: "360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "BB", points: 90, description: "B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "5B", points: 110, description: "540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "5F", points: 110, description: "B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "7F", points: 130, description: "720 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "7B", points: 130, description: "B-B", startPos: "back", endPos: "back", changesOrientation: false },
];

export const oneSkiStepTricks = [
  { abbr: "LB", points: 110, description: "180 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true, canReverse: false },
  { abbr: "LF", points: 110, description: "B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true, canReverse: false },
];

export const oneSkiLineTricks = [
  { abbr: "SLB", points: 350, description: "F-B Ski Line", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "SLF", points: 400, description: "B-F Ski Line", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "SLO", points: 400, description: "360 F-F Ski Line", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "SLBB", points: 450, description: "B-B Ski Line", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "SL5B", points: 550, description: "540 F-B Ski Line", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "SL5F", points: 550, description: "B-F Ski Line", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "SL7B", points: 750, description: "720 B-B Ski Line", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "SL7F", points: 800, description: "F-F Ski Line", startPos: "front", endPos: "front", changesOrientation: false },
];

export const oneSkiFlipTricks = [
  { abbr: "BFL", points: 500, description: "Backward Somersault", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "BFLB", points: 750, description: "Wake Flip Half Twist F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "BFLF", points: 550, description: "Wake Flip Half Twist B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "BFLBB", points: 800, description: "Wake Flip Full Twist B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "BFLO", points: 800, description: "Wake Flip Full Twist F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "BFL5B", points: 900, description: "Wake Flip 540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "BFL5F", points: 850, description: "Wake Flip 540 B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "FFL", points: 800, description: "Forward Somersault", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "FFLB", points: 850, description: "Forward Somersault F-B", startPos: "front", endPos: "back", changesOrientation: true, canReverse: false },
  { abbr: "FFLF", points: 850, description: "Forward Somersault B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "FFLBB", points: 900, description: "Forward Somersault B-B", startPos: "back", endPos: "back", changesOrientation: false, canReverse: false },
  { abbr: "FFL5F", points: 950, description: "Forward Somersault 540 B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "DBFL", points: 1000, description: "Wake Double Flip", startPos: "front", endPos: "front", changesOrientation: false, canReverse: false },
  { abbr: "BFLLB", points: 800, description: "Wake Flip Twist Line Back", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "BFLSLB", points: 850, description: "Wake Flip Ski Line 180 F-B", startPos: "front", endPos: "back", changesOrientation: true, canReverse: false },
  { abbr: "BFLSLBB", points: 900, description: "Wake Flip Ski Line 360 B-B", startPos: "back", endPos: "back", changesOrientation: false, canReverse: false },
  { abbr: "BFLSLO", points: 900, description: "Wake Flip Ski Line 360 F-F", startPos: "front", endPos: "front", changesOrientation: false, canReverse: false },
  { abbr: "BFLSL5F", points: 950, description: "Wake Flip Ski Line 540 B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "FFLSL5F", points: 950, description: "Forward Somersault Ski Line 540 B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
];

export const oneSkiWakeSpinTricks = [
  { abbr: "WB", points: 80, description: "Wake 180 F-B", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "WF", points: 80, description: "Wake B-F", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "WO", points: 150, description: "Wake 360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "WBB", points: 150, description: "Wake B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "W5B", points: 310, description: "Wake 540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "W5F", points: 310, description: "Wake B-F", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "W7F", points: 800, description: "Wake 720 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "W7B", points: 480, description: "Wake B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "W9B", points: 850, description: "Wake 900 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "W9F", points: 850, description: "Wake B-F", startPos: "back", endPos: "front", changesOrientation: true },
];

export const oneSkiWakeStepTricks = [
  { abbr: "WLB", points: 160, description: "Wake 180 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true, canReverse: false },
  { abbr: "WLF", points: 160, description: "Wake B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true, canReverse: false },
  { abbr: "WLO", points: 260, description: "Wake 360 F-F Stepover", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "WLBB", points: 260, description: "Wake B-B Stepover", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "WL5B", points: 420, description: "Wake 540 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "WL5F", points: 420, description: "Wake 540 B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "WL5LB", points: 500, description: "Wake F-B Double Stepover", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "WL5LF", points: 500, description: "Wake B-F Double Stepover", startPos: "back", endPos: "front", changesOrientation: true },
  { abbr: "WL7F", points: 700, description: "Wake 720 F-F Stepover", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "WL7B", points: 550, description: "Wake 720 B-B Stepover", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "WL9B", points: 800, description: "Wake 900 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "WL9F", points: 800, description: "Wake 900 B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true },
];

// Toe tricks - 1 ski only
export const toeSpinTricks = [
  { abbr: "TS", points: 130, description: "Toehold Side Slide", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "TB", points: 100, description: "Toe 180 F-B", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "TF", points: 100, description: "Toe B-F", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "TO", points: 200, description: "Toe 360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "TBB", points: 200, description: "Toe B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "T5B", points: 350, description: "Toe 540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "T5F", points: 350, description: "Toe 540 B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "T7F", points: 450, description: "Toe 720 F-F", startPos: "front", endPos: "front", changesOrientation: false, canReverse: false },
];

export const toeStepTricks = [
  { abbr: "TWLB", points: 320, description: "Toe Wake 180 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true, canReverse: false },
  { abbr: "TWLF", points: 380, description: "Toe Wake B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true, canReverse: false },
  { abbr: "TWLO", points: 480, description: "Toe Wake 360 F-F Stepover", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "TWLBB", points: 480, description: "Toe Wake B-B Stepover", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "TWL5B", points: 600, description: "Toe Wake 540 F-B Stepover", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "TWL5F", points: 700, description: "Toe Wake B-F Stepover", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "TWL7F", points: 800, description: "Toe Wake 720 F-F Stepover", startPos: "front", endPos: "front", changesOrientation: false, canReverse: false },
];

export const toeWakeSpinTricks = [
  { abbr: "TWB", points: 150, description: "Toe Wake 180 F-B", startPos: "front", endPos: "back", changesOrientation: true, is180Turn: true },
  { abbr: "TWF", points: 150, description: "Toe Wake B-F", startPos: "back", endPos: "front", changesOrientation: true, is180Turn: true },
  { abbr: "TWO", points: 300, description: "Toe Wake 360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "TWBB", points: 330, description: "Toe Wake B-B", startPos: "back", endPos: "back", changesOrientation: false },
  { abbr: "TW5B", points: 500, description: "Toe Wake 540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
  { abbr: "TW5F", points: 500, description: "Toe Wake B-F", startPos: "back", endPos: "front", changesOrientation: true, canReverse: false },
  { abbr: "TW7F", points: 650, description: "Toe Wake 720 F-F", startPos: "front", endPos: "front", changesOrientation: false },
  { abbr: "TW7B", points: 650, description: "Toe Wake B-B", startPos: "back", endPos: "back", changesOrientation: false, canReverse: false },
];

// Generate reverse versions of tricks (for AI predictions heatmap)
function generateReverseTricks(tricks) {
  return tricks
    .filter(t => t.canReverse !== false)
    .map(t => ({
      ...t,
      abbr: "R" + t.abbr,
      description: "Reverse " + t.description,
    }));
}

// Hydrate a stored custom trick with computed runtime fields
function hydrateCustomTrick(t) {
  return {
    ...t,
    changesOrientation: t.startPos !== t.endPos,
    is180Turn: false,
    canReverse: true,
    isCustom: true,
  };
}

// Tag each trick with its modifier/wake/toe category
function tagTricks(tricks, modifier, isWake = false, isToe = false) {
  return tricks.map(t => ({ ...t, modifier, isWake, isToe }));
}

// Helper to get ALL tricks for a given ski count (for AI predictions)
export function getAllTricksForSkiCount(skiCount, customTricks = []) {
  if (skiCount === 2) {
    const baseTricks = [
      ...tagTricks(twoSkiSpinTricks, "spins"),
      ...tagTricks(twoSkiStepTricks, "steps"),
      ...tagTricks(twoSkiWakeSpinTricks, "spins", true),
      ...tagTricks(twoSkiWakeStepTricks, "steps", true),
      ...tagTricks(twoSkiFlipTricks, "flips"),
    ];
    const reverseTricks = generateReverseTricks(baseTricks);
    const custom = customTricks.filter(t => t.skiCount === 2).map(hydrateCustomTrick);
    return [...baseTricks, ...reverseTricks, ...custom];
  }
  const baseTricks = [
    ...tagTricks(oneSkiSpinTricks, "spins"),
    ...tagTricks(oneSkiStepTricks, "steps"),
    ...tagTricks(oneSkiLineTricks, "lines"),
    ...tagTricks(oneSkiFlipTricks, "flips"),
    ...tagTricks(oneSkiWakeSpinTricks, "spins", true),
    ...tagTricks(oneSkiWakeStepTricks, "steps", true),
    ...tagTricks(toeSpinTricks, "spins", false, true),
    ...tagTricks(toeStepTricks, "lines", true, true),
    ...tagTricks(toeWakeSpinTricks, "spins", true, true),
  ];
  const reverseTricks = generateReverseTricks(baseTricks);
  const custom = customTricks.filter(t => t.skiCount === 1).map(hydrateCustomTrick);
  return [...baseTricks, ...reverseTricks, ...custom];
}

// Helper to get tricks by ski count, modifier, wake, and toe state
export function getTricks(skiCount, modifier, isWake, isToe, customTricks = []) {
  let baseTricks;
  if (skiCount === 2) {
    if (isWake) {
      switch (modifier) {
        case "spins": baseTricks = twoSkiWakeSpinTricks; break;
        case "steps": baseTricks = twoSkiWakeStepTricks; break;
        default: baseTricks = [];
      }
    } else {
      switch (modifier) {
        case "spins": baseTricks = twoSkiSpinTricks; break;
        case "steps": baseTricks = twoSkiStepTricks; break;
        case "flips": baseTricks = twoSkiFlipTricks; break;
        default: baseTricks = twoSkiSpinTricks;
      }
    }
  } else if (isToe && isWake) {
    switch (modifier) {
      case "spins": baseTricks = toeWakeSpinTricks; break;
      case "lines": baseTricks = toeStepTricks; break;
      default: baseTricks = [];
    }
  } else if (isToe) {
    switch (modifier) {
      case "spins": baseTricks = toeSpinTricks; break;
      default: baseTricks = [];
    }
  } else if (isWake) {
    switch (modifier) {
      case "spins": baseTricks = oneSkiWakeSpinTricks; break;
      case "steps": baseTricks = oneSkiWakeStepTricks; break;
      default: baseTricks = [];
    }
  } else {
    switch (modifier) {
      case "spins": baseTricks = oneSkiSpinTricks; break;
      case "steps": baseTricks = oneSkiStepTricks; break;
      case "lines": baseTricks = oneSkiLineTricks; break;
      case "flips": baseTricks = oneSkiFlipTricks; break;
      default: baseTricks = oneSkiSpinTricks;
    }
  }

  const matchingCustom = customTricks
    .filter(t => t.skiCount === skiCount && t.modifier === modifier && t.isWake === isWake && t.isToe === isToe)
    .map(hydrateCustomTrick);

  return matchingCustom.length > 0 ? [...baseTricks, ...matchingCustom] : baseTricks;
}
