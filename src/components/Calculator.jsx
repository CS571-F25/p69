import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import TrickButton, { getHeatmapStyle } from "./TrickButton.jsx";
import ToggleButton from "./ToggleButton.jsx";
import TrickListSidebar from "./TrickListSidebar.jsx";
import TrickRecommendations from "./TrickRecommendations.jsx";
import TutorialOverlay, { ALL_STEPS } from "./TutorialOverlay.jsx";
import { getTricks, getAllTricksForSkiCount } from "../data/tricks.js";
import { calculatePassTotal } from "../utils/trickUtils.js";
import { preloadTier } from "../utils/trickPredictor.js";

export default function Calculator({
  addTrick,
  undoTrick,
  trickList,
  allTricks,
  currentPass,
  startSecondPass,
  clearAll,
  clearCurrentPass,
  calcState,
  setCalcState,
  calcStateHistory,
  setCalcStateHistory,
  passesForDisplay,
  skillLevel,
  onSkillLevelChange,
  customTricks = [],
  onAddCustomTrick,
  onRemoveCustomTrick,
  onUpdateCustomTrick,
  showSetup,
  setShowSetup,
  tutorialEnabled,
  setTutorialEnabled,
  onTutorialComplete,
  navRef,
  numRuns = 2,
  onNumRunsChange,
  tutorialTrigger = 0,
  onTutorialTriggered,
  helpButtonRef,
}) {
  const SKILL_LEVELS = [
    { key: "beginner",     label: "Beginner",     range: numRuns === 1 ? "0-500 pts"   : "0-1k pts"   },
    { key: "intermediate", label: "Intermediate", range: numRuns === 1 ? "500-1k pts"  : "1k-2k pts"  },
    { key: "advanced",     label: "Advanced",     range: numRuns === 1 ? "1k-3.5k pts" : "2k-7k pts"  },
    { key: "pro",          label: "Pro",          range: numRuns === 1 ? "3.5k+ pts"   : "7k+ pts"    },
  ];
  const { orientation, skiCount, lastReversibleTrick, secondLastReversibleTrick, modifier, isWake, isToe, noCredit, passStarted } = calcState;

  const [tutorialStep, setTutorialStep] = useState(null);

  const scoreRef = useRef(null);
  const controlsRef = useRef(null);
  const passCounterRef = useRef(null);
  const settingsRef = useRef(null);
  const aiRef = useRef(null);
  const gridRef = useRef(null);
  const modRef = useRef(null);
  const ncRef = useRef(null);
  const revRef = useRef(null);

  // Fallback ref: points to "Start Pass 2" when visible, else the "Pass X of Y" counter
  const controlsFallbackRef = { get current() { return controlsRef.current || passCounterRef.current; } };

  useEffect(() => {
    preloadTier(skillLevel);
  }, [skillLevel]);

  useEffect(() => {
    if (tutorialTrigger > 0) {
      setTutorialStep(0);
      onTutorialTriggered?.();
    }
  }, [tutorialTrigger]);

  const isMobile = window.matchMedia?.("(pointer: coarse)").matches;
  const activeSteps = ALL_STEPS.filter(s => !s.mobileOnly || isMobile);
  const tutorialRefMap = {
    score: scoreRef, controls: controlsFallbackRef, settings: settingsRef, ai: aiRef,
    grid: gridRef, modifiers: modRef, nc: ncRef, reverse: revRef, tabs: navRef, help: helpButtonRef,
  };

  // Heatmap state - only updated when predictions change
  const [heatmapData, setHeatmapData] = useState({ map: new Map(), total: 0 });

  // Custom trick form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingTrickId, setEditingTrickId] = useState(null);
  const [customForm, setCustomForm] = useState({
    description: "",
    abbr: "",
    points: "",
    startPos: "front",
    endPos: "front",
    skiCount: 1,
    modifier: "spins",
    isWake: false,
    isToe: false,
  });

  const updateState = (updates) => setCalcState(prev => ({ ...prev, ...updates }));

  // Save current state to history before making changes
  const saveStateToHistory = () => {
    setCalcStateHistory(prev => [...prev, calcState]);
  };

  // Callback for heatmap updates from predictions
  const handleHeatmapUpdate = (newHeatmap, total) => {
    setHeatmapData({ map: newHeatmap, total });
  };

  const tricks = getTricks(skiCount, modifier, isWake, isToe, customTricks);
  const allTricksForSki = getAllTricksForSkiCount(skiCount, customTricks);

  const handleTrickClick = (trick) => {
    const { abbr, points, endPos } = trick;

    // Save state before making changes (for undo)
    saveStateToHistory();

    // Mark pass as started (locks ski count)
    if (!passStarted) {
      updateState({ passStarted: true });
    }

    // Check if trick has already been performed in ANY pass - if so, it's worth 0 points
    const alreadyPerformed = allTricks.some(t => t.abbr === abbr);

    // Handle no credit modifier
    let finalPoints;
    let displayAbbr = abbr;

    if (noCredit) {
      finalPoints = 0;
      displayAbbr = abbr + " (NC)";
    } else {
      finalPoints = alreadyPerformed ? 0 : points;
    }

    addTrick({ abbr: displayAbbr, points: finalPoints });

    // Reset no credit modifier after use
    const newState = { orientation: endPos, noCredit: false };

    // Check if this trick can be reversed (default true if not specified)
    const canBeReversed = trick.canReverse !== false;

    // Handle reverse trick availability tracking
    // Per IWWF 9.21h: a 180° turn is allowed between a trick and its reverse
    if (lastReversibleTrick?.changesOrientation && trick.is180Turn) {
      newState.secondLastReversibleTrick = lastReversibleTrick;
    } else {
      newState.secondLastReversibleTrick = null;
    }
    newState.lastReversibleTrick = canBeReversed ? trick : null;

    updateState(newState);
  };

  const handleUndo = () => {
    if (calcStateHistory.length > 0 && undoTrick()) {
      const previousState = calcStateHistory[calcStateHistory.length - 1];
      setCalcState(previousState);
      setCalcStateHistory(prev => prev.slice(0, -1));
    }
  };

  const handleModifierChange = (newModifier) => {
    const updates = { modifier: newModifier };
    if (modifier === "lines" && newModifier !== "lines") {
      updates.isWake = false;
    }
    if (newModifier === "flips") {
      updates.isWake = false;
      updates.isToe = false;
    }
    if (newModifier === "lines") {
      updates.isWake = false;
      if (isToe) updates.isWake = true;
    }
    if (newModifier === "steps" && isToe) {
      updates.isToe = false;
    }
    updateState(updates);
  };

  // Resolve which trick (if any) can be reversed right now
  const canReverseLast = lastReversibleTrick && (
    !lastReversibleTrick.changesOrientation || lastReversibleTrick.startPos === orientation
  );
  const canReverseSecondLast = secondLastReversibleTrick && (
    !secondLastReversibleTrick.changesOrientation || secondLastReversibleTrick.startPos === orientation
  );
  const trickToReverse = canReverseLast ? lastReversibleTrick
    : canReverseSecondLast ? secondLastReversibleTrick : null;
  const availableReverseAbbrs = trickToReverse ? ["R" + trickToReverse.abbr] : [];

  const handleReverse = () => {
    if (!trickToReverse) return;
    saveStateToHistory();

    const reverseAbbr = "R" + trickToReverse.abbr;
    const alreadyPerformed = allTricks.some(trick => trick.abbr === reverseAbbr);
    const finalPoints = alreadyPerformed ? 0 : trickToReverse.points;

    addTrick({ abbr: reverseAbbr, points: finalPoints });

    // Grid tricks don't carry modifier/isWake/isToe — look up the tagged version
    const tagged = allTricksForSki.find(t => t.abbr === trickToReverse.abbr);
    const modifierUpdate = tagged ? {
      modifier: tagged.modifier,
      isWake: !!tagged.isWake,
      isToe: !!tagged.isToe,
    } : {};

    if (trickToReverse === secondLastReversibleTrick) {
      updateState({ orientation: trickToReverse.endPos, secondLastReversibleTrick: null, ...modifierUpdate });
    } else {
      updateState({ orientation: trickToReverse.endPos, lastReversibleTrick: null, secondLastReversibleTrick: null, ...modifierUpdate });
    }
  };

  const passTotal = calculatePassTotal(trickList);
  const allTotal = calculatePassTotal(allTricks);

  const scoreBox = (
    <Link ref={scoreRef} to="/trick-pass" className="flex-shrink-0 rounded-lg bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 p-0.5 block">
      <div className="rounded-[calc(0.5rem-2px)] bg-slate-800 h-full min-w-[8rem] sm:min-w-[10rem] relative flex flex-col">
        <div className="pt-1.5 pl-2 sm:pt-2 sm:pl-3 text-white font-semibold text-xs sm:text-sm">Total: <span className="text-green-400 font-bold text-sm sm:text-base">{allTotal}</span></div>
        <div className="flex-1 flex items-center justify-center text-4xl sm:text-5xl font-semibold tracking-wider text-blue-400">{passTotal}</div>
        <div className="flex justify-end pb-1 pr-1.5 sm:pb-1.5 sm:pr-2">
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-blue-400 ${allTricks.length > 0 ? "animate-[chevron-pulse_2s_ease-in-out_infinite]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );

  // Check if lines/flips should be disabled
  const linesDisabled = skiCount === 2;
  const toeDisabled = skiCount === 2;

  const trickDefMap = new Map(allTricksForSki.map(t => [t.abbr, t]));
  const ranked = [...heatmapData.map.entries()]
    .sort(([, a], [, b]) => a - b)
    .slice(0, 5);
  const modWeights = { spins: 0, steps: 0, lines: 0, flips: 0 };
  let wakeWeight = 0, toeWeight = 0;
  const N = ranked.length;
  let maxWeight = 0;
  for (let i = 0; i < N; i++) {
    const t = trickDefMap.get(ranked[i][0]);
    if (!t) continue;
    const w = Math.pow(2, N - 1 - i);
    maxWeight += w;
    modWeights[t.modifier] = (modWeights[t.modifier] || 0) + w;
    if (t.isWake) wakeWeight += w;
    if (t.isToe) toeWeight += w;
  }
  const MAX_WEIGHT = maxWeight || 1;
  const weightToHeat = (weight) => {
    if (heatmapData.total === 0 || N === 0) return {};
    const score = Math.pow(weight / MAX_WEIGHT, 0.25);
    const steps = MAX_WEIGHT;
    return getHeatmapStyle(Math.round((1 - score) * steps), steps);
  };

  const getModifierHeat = (modKey) => weightToHeat(modWeights[modKey] || 0);

  const wakeDisabled = modifier === "flips" || modifier === "lines";
  const wakeHeatStyle = !wakeDisabled ? weightToHeat(wakeWeight) : {};

  const toeHeatStyle = !(toeDisabled || modifier === "flips" || modifier === "steps")
    ? weightToHeat(toeWeight)
    : {};

  const modifiers = [
    { key: "spins", label: "Spins", disabled: false },
    { key: "steps", label: "Steps", disabled: false },
    { key: "lines", label: "Lines", disabled: linesDisabled },
    { key: "flips", label: "Flips", disabled: false },
  ];

  const endTutorial = () => { setTutorialStep(null); onTutorialComplete(); };
  const nextTutorialStep = () => {
    if (tutorialStep >= activeSteps.length - 1) endTutorial();
    else setTutorialStep(tutorialStep + 1);
  };
  const prevTutorialStep = () => {
    if (tutorialStep > 0) setTutorialStep(tutorialStep - 1);
  };
  return (
    <div className="max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:pt-2 sm:pb-6">
      <h1 className="sr-only">Trick Calculator</h1>
      <div className="flex gap-6">
        {/* Main Calculator Section */}
        <div className="flex-1 min-w-0">
          {showSetup ? (
            <>
              {/* Score Box + Pass indicator row */}
              <div className="flex items-stretch gap-3 sm:gap-6 mb-3">
                {scoreBox}
                <div className="flex flex-col items-end gap-2 ml-auto">
                  <div className="flex gap-2">
                    <button disabled className="px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg font-semibold rounded-lg border bg-slate-900 text-white border-slate-800 cursor-not-allowed">Undo</button>
                    <button disabled className="px-5 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg font-semibold rounded-lg border bg-slate-900 text-white border-slate-800 cursor-not-allowed">Clear</button>
                  </div>
                </div>
              </div>

              {/* Setup View */}
              <div className="flex flex-col py-1">
                {/* Starting Position */}
                <div className="w-full mb-2 sm:mb-4">
                  <div className="text-xs sm:text-base text-white font-bold mb-1.5">Starting Position</div>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleButton
                      active={orientation === "front"}
                      onClick={() => updateState({ orientation: "front" })}
                      className="!py-1.5 sm:!py-3 !text-base sm:!text-xl"
                    >
                      Front
                    </ToggleButton>
                    <ToggleButton
                      active={orientation === "back"}
                      onClick={() => updateState({ orientation: "back" })}
                      className="!py-1.5 sm:!py-3 !text-base sm:!text-xl"
                    >
                      Back
                    </ToggleButton>
                  </div>
                </div>

                {/* Skis */}
                <div className="w-full mb-2 sm:mb-4">
                  <div className="text-xs sm:text-base text-white font-bold mb-1.5">Skis</div>
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleButton
                      active={skiCount === 1}
                      onClick={() => updateState({ skiCount: 1 })}
                      className="!py-1.5 sm:!py-3 !text-base sm:!text-xl"
                    >
                      1 Ski
                    </ToggleButton>
                    <ToggleButton
                      active={skiCount === 2}
                      onClick={() => updateState({ skiCount: 2 })}
                      className="!py-1.5 sm:!py-3 !text-base sm:!text-xl"
                    >
                      2 Skis
                    </ToggleButton>
                  </div>
                </div>

                {/* Number of Runs — pass 1 only */}
                {currentPass === 1 && (
                  <div className="w-full mb-2 sm:mb-4">
                    <div className="text-xs sm:text-base text-white font-bold mb-1.5">Number of Runs</div>
                    <div className="grid grid-cols-2 gap-2">
                      <ToggleButton active={numRuns === 1} onClick={() => onNumRunsChange(1)} className="!py-1.5 sm:!py-3 !text-base sm:!text-xl">1 Run</ToggleButton>
                      <ToggleButton active={numRuns === 2} onClick={() => onNumRunsChange(2)} className="!py-1.5 sm:!py-3 !text-base sm:!text-xl">2 Runs</ToggleButton>
                    </div>
                  </div>
                )}

                {/* Skill Level — pass 1 only */}
                {currentPass === 1 && (
                  <div className="w-full mb-2 sm:mb-4">
                    <div className="text-xs sm:text-base text-white font-bold mb-1.5">
                      Skill Level
                      <span className="text-[9px] sm:text-sm text-white font-medium ml-1">
                        : helps us suggest tricks based off passes at your level
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SKILL_LEVELS.map((level) => (
                        <ToggleButton
                          key={level.key}
                          active={skillLevel === level.key}
                          onClick={() => onSkillLevelChange(level.key)}
                          className="!py-1.5 sm:!py-3 !text-base sm:!text-xl"
                        >
                          <div>{level.label}</div>
                          <div className="text-xs sm:text-base text-white font-medium">{level.range}</div>
                        </ToggleButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tutorial slider */}
                <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
                  <span className="text-xs sm:text-sm text-white font-medium">Tutorial</span>
                  <button
                    role="switch"
                    aria-checked={tutorialEnabled}
                    onClick={() => setTutorialEnabled(!tutorialEnabled)}
                    className={`relative w-8 h-[18px] sm:w-10 sm:h-[22px] rounded-full transition-colors ${
                      tutorialEnabled ? "bg-blue-600" : "bg-slate-600"
                    }`}
                  >
                    <span className={`absolute top-[3px] left-[3px] w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white transition-transform ${
                      tutorialEnabled ? "translate-x-[12px] sm:translate-x-[18px]" : ""
                    }`} />
                  </button>
                </label>

                {/* Start Button */}
                <button
                  onClick={() => {
                    setShowSetup(false);
                    if (tutorialEnabled) setTutorialStep(0);
                  }}
                  className="w-full py-2 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-base sm:text-2xl font-bold tracking-wider transition-all shadow-lg shadow-blue-900/30"
                >
                  Start
                </button>
              </div>
            </>
          ) : (
            <div className={tutorialStep !== null ? "pointer-events-none" : ""}>
              {/* Compact Status Row — score + info */}
              <div className="flex items-stretch gap-3 sm:gap-6 mb-4 sm:mb-6">
                {scoreBox}
                <div className="flex-1 min-w-0 flex flex-col items-end justify-between">
                  {/* Undo + Clear + Settings */}
                  <div className="flex gap-2 w-full mb-2">
                    <button
                      onClick={handleUndo}
                      disabled={calcStateHistory.length === 0}
                      aria-label="Undo last trick"
                      className={`flex-1 px-2 py-3.5 sm:py-4 ${currentPass === 2 ? "text-base" : "text-lg"} sm:text-xl font-semibold rounded-lg border whitespace-nowrap ${
                        calcStateHistory.length === 0
                          ? "bg-slate-900 text-white border-slate-800 cursor-not-allowed"
                          : "bg-amber-900 hover:bg-amber-700 text-white border-amber-800 hover:border-amber-600"
                      }`}
                    >
                      Undo
                    </button>
                    {currentPass === 2 ? (
                      <>
                        <button
                          onClick={clearCurrentPass}
                          aria-label="Clear current pass"
                          className="flex-1 px-2 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-lg leading-tight bg-red-900 hover:bg-red-700 text-white border border-red-800 hover:border-red-600 focus:outline-none"
                        >
                          Clear Pass
                        </button>
                        <button
                          onClick={clearAll}
                          aria-label="Clear all passes"
                          className="flex-1 px-2 py-3.5 sm:py-4 text-sm sm:text-base font-semibold rounded-lg leading-tight bg-red-950 hover:bg-red-900 text-white border border-red-900 hover:border-red-700 focus:outline-none"
                        >
                          Clear All
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={clearAll}
                        aria-label="Clear all tricks"
                        className="flex-1 px-2 py-3.5 sm:py-4 text-lg sm:text-xl font-semibold rounded-lg bg-red-900 hover:bg-red-700 text-white border border-red-800 hover:border-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex flex-col gap-1 w-full">
                    {/* Stats row — only shown alongside Start Pass 2 */}
                    {numRuns === 2 && currentPass === 1 && (
                      <div ref={passCounterRef} className="flex items-center justify-center w-full">
                        <div className="flex items-center gap-x-2 sm:gap-x-3">
                          <span><span className="text-[10px] sm:text-sm text-white font-semibold"><span className="sm:hidden">Pos: </span><span className="hidden sm:inline">Position: </span></span><span className="text-xs sm:text-base font-bold text-blue-400 capitalize">{orientation}</span></span>
                          <span><span className="text-[10px] sm:text-sm text-white font-semibold">Skis: </span><span className="text-xs sm:text-base font-bold text-blue-400">{skiCount}</span></span>
                          <span><span className="text-[10px] sm:text-sm text-white font-semibold"><span className="sm:hidden">Lvl: </span><span className="hidden sm:inline">Level: </span></span><span className="text-xs sm:text-base font-bold text-blue-400 capitalize">{skillLevel}</span></span>
                        </div>
                      </div>
                    )}
                    {/* Controls row — always visible */}
                    {numRuns === 2 && currentPass === 1 ? (
                      <div className="flex gap-2 w-full items-center">
                        <button
                          ref={settingsRef}
                          onClick={() => setShowSetup(true)}
                          aria-label="Open settings"
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 flex items-center justify-center flex-shrink-0"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <div ref={controlsRef} className="flex-1">
                          <ToggleButton
                            active={true}
                            variant="green"
                            onClick={startSecondPass}
                            ariaLabel="Start second pass"
                            className="!py-1.5 !text-xs w-full"
                          >
                            Start Pass 2
                          </ToggleButton>
                        </div>
                      </div>
                    ) : (
                      <div ref={controlsRef} className="flex w-full items-center justify-center gap-2">
                        <button
                          ref={settingsRef}
                          onClick={() => setShowSetup(true)}
                          aria-label="Open settings"
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500 flex items-center justify-center flex-shrink-0"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <div className="flex items-center gap-x-2 sm:gap-x-3">
                          <span><span className="text-[10px] sm:text-sm text-white font-semibold"><span className="sm:hidden">Pos: </span><span className="hidden sm:inline">Position: </span></span><span className="text-xs sm:text-base font-bold text-blue-400 capitalize">{orientation}</span></span>
                          <span><span className="text-[10px] sm:text-sm text-white font-semibold">Skis: </span><span className="text-xs sm:text-base font-bold text-blue-400">{skiCount}</span></span>
                          <span><span className="text-[10px] sm:text-sm text-white font-semibold"><span className="sm:hidden">Lvl: </span><span className="hidden sm:inline">Level: </span></span><span className="text-xs sm:text-base font-bold text-blue-400 capitalize">{skillLevel}</span></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* AI Suggestions */}
              <div ref={aiRef} className="mb-4 sm:mb-6">
                <TrickRecommendations
                  trickHistory={allTricks}
                  currentOrientation={orientation}
                  allPerformedTricks={allTricks}
                  availableTricks={allTricksForSki}
                  availableReverseAbbrs={availableReverseAbbrs}
                  onTrickClick={(abbr) => {
                    if (abbr.startsWith("R") && trickToReverse && "R" + trickToReverse.abbr === abbr) {
                      handleReverse();
                      return;
                    }
                    const trick = allTricksForSki.find((t) => t.abbr === abbr);
                    if (trick && trick.startPos === orientation) {
                      handleModifierChange(trick.modifier);
                      updateState({ isWake: !!trick.isWake, isToe: !!trick.isToe });
                      handleTrickClick(trick);
                    }
                  }}
                  onHeatmapUpdate={handleHeatmapUpdate}
                  skillLevel={skillLevel}
                />
              </div>
              {/* Main Layout: Modifiers on left, Tricks in center, Wake on right */}
              <div className="flex gap-2.5 sm:gap-4 mb-4 sm:mb-6">
                {/* Category Modifier Buttons (left) */}
                <div ref={modRef} className="flex flex-col gap-1.5 sm:gap-2 w-[4.5rem] sm:w-20 flex-shrink-0">
                  {modifiers.map((mod) => {
                    const isActive = modifier === mod.key;
                    return (
                      <ToggleButton
                        key={mod.key}
                        active={isActive}
                        disabled={mod.disabled}
                        onClick={() => !mod.disabled && handleModifierChange(mod.key)}
                        style={!mod.disabled ? getModifierHeat(mod.key) : {}}
                        className={isActive ? "!font-bold" : ""}
                      >
                        {mod.label}
                      </ToggleButton>
                    );
                  })}
                </div>

                {/* Trick Buttons Grid (center) */}
                <div ref={gridRef} className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 items-start">
                  {tricks.map((trick) => {
                    const isAvailable = trick.startPos === orientation;
                    const alreadyPerformed = allTricks.some(t => t.abbr === trick.abbr);
                    const heatRank = heatmapData.map.get(trick.abbr);
                    const displayPoints = noCredit ? 0 : trick.points;
                    return (
                      <TrickButton
                        key={trick.isCustom ? trick.id : trick.abbr}
                        abbr={trick.abbr}
                        points={displayPoints}
                        onClick={() => handleTrickClick(trick)}
                        disabled={!isAvailable}
                        alreadyPerformed={alreadyPerformed}
                        heatRank={heatRank}
                        heatTotal={heatmapData.total}
                        description={trick.description}
                        isCustom={trick.isCustom}
                      />
                    );
                  })}
                </div>

                {/* Wake/Toe/NC Modifier Buttons (right) */}
                <div className="flex flex-col gap-1.5 sm:gap-2 w-[4.5rem] sm:w-20 flex-shrink-0">
                  <ToggleButton
                    active={isWake}
                    variant="orange"
                    disabled={wakeDisabled}
                    onClick={() => updateState({ isWake: !isWake })}
                    style={wakeHeatStyle}
                    className={isWake ? "!font-bold" : ""}
                  >
                    Wake
                  </ToggleButton>
                  <ToggleButton
                    active={isToe}
                    variant="purple"
                    disabled={modifier === "flips" || modifier === "steps" || toeDisabled}
                    onClick={() => {
                      const updates = { isToe: !isToe };
                      if (!isToe) {
                        if (modifier === "lines") updates.isWake = true;
                      } else {
                        if (modifier === "lines") updates.isWake = false;
                      }
                      updateState(updates);
                    }}
                    style={toeHeatStyle}
                    className={isToe ? "!font-bold" : ""}
                  >
                    Toe
                  </ToggleButton>
                  <div ref={ncRef} className="flex flex-col">
                    <ToggleButton
                      active={noCredit}
                      variant="yellow"
                      onClick={() => updateState({ noCredit: !noCredit })}
                      className={noCredit ? "!font-bold" : ""}
                    >
                      NC
                    </ToggleButton>
                  </div>

                  {/* Reverse Button */}
                  {trickToReverse ? (() => {
                    const heatStyle = getHeatmapStyle(heatmapData.map.get("R" + trickToReverse.abbr) ?? heatmapData.total - 1, Math.max(heatmapData.total, 1));
                    return (
                      <button
                        ref={revRef}
                        onClick={handleReverse}
                        aria-label={`Reverse ${trickToReverse.abbr}, ${trickToReverse.points} points`}
                        style={{
                          "--rev-color": heatStyle.backgroundColor,
                          animation: "rev-pulse 1.5s ease-in-out infinite",
                          borderColor: heatStyle.borderColor,
                          containerType: "inline-size",
                        }}
                        className="text-white hover:shadow-md px-1.5 py-2.5 sm:px-4 sm:py-3 rounded-lg border-2 border-blue-400"
                      >
                        <div className="font-bold leading-none" style={{ fontSize: `clamp(0.75rem, ${130 / Math.max(("R" + trickToReverse.abbr).length, 1.5)}cqw, 2rem)` }}>R{trickToReverse.abbr}</div>
                        <div className="text-[9px] font-semibold text-white/80 mt-0.5">{trickToReverse.points} pts</div>
                      </button>
                    );
                  })() : (
                    <button
                      ref={revRef}
                      disabled
                      aria-label="Reverse trick, unavailable"
                      className="bg-slate-900/80 text-white cursor-not-allowed px-1.5 py-2.5 sm:px-4 sm:py-3 rounded-lg border-2 border-blue-400/30"
                      style={{ containerType: "inline-size" }}
                    >
                      <div className="font-semibold leading-none" style={{ fontSize: `clamp(0.5rem, ${110 / Math.max(3, 1.5)}cqw, min(1.25rem + 1vw, 1.75rem))` }}>REV</div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Trick — only shown when not in setup */}
          {!showSetup && (<>
          <button
            onClick={() => {
              setEditingTrickId(null);
              setCustomForm({
                description: "",
                abbr: "",
                points: "",
                startPos: orientation,
                endPos: orientation,
                skiCount,
                modifier,
                isWake,
                isToe: skiCount === 1 ? isToe : false,
              });
              setShowCustomForm(!showCustomForm);
            }}
            className="mt-3 sm:mt-4 w-full py-2 sm:py-3 rounded-lg border-2 border-dashed border-slate-600 text-white hover:border-slate-500 hover:text-white transition-all text-sm sm:text-base font-semibold"
          >
            {showCustomForm ? "Cancel" : "+ Custom Tricks"}
          </button>

          {showCustomForm && (
            <div className="mt-2 p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-white font-semibold block mb-1">Name</label>
                  <input
                    type="text"
                    value={customForm.description}
                    onChange={(e) => setCustomForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Front Flip 540 Back Landing"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Abbreviation</label>
                  <input
                    type="text"
                    value={customForm.abbr}
                    onChange={(e) => setCustomForm(f => ({ ...f, abbr: e.target.value.toUpperCase() }))}
                    placeholder="e.g. FFL5LB"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Points</label>
                  <input
                    type="number"
                    value={customForm.points}
                    onChange={(e) => setCustomForm(f => ({ ...f, points: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white font-medium text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Start Position</label>
                  <div className="flex gap-1">
                    <ToggleButton active={customForm.startPos === "front"} onClick={() => setCustomForm(f => ({ ...f, startPos: "front" }))} className="flex-1 !py-1.5">Front</ToggleButton>
                    <ToggleButton active={customForm.startPos === "back"} onClick={() => setCustomForm(f => ({ ...f, startPos: "back" }))} className="flex-1 !py-1.5">Back</ToggleButton>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white font-semibold block mb-1">End Position</label>
                  <div className="flex gap-1">
                    <ToggleButton active={customForm.endPos === "front"} onClick={() => setCustomForm(f => ({ ...f, endPos: "front" }))} className="flex-1 !py-1.5">Front</ToggleButton>
                    <ToggleButton active={customForm.endPos === "back"} onClick={() => setCustomForm(f => ({ ...f, endPos: "back" }))} className="flex-1 !py-1.5">Back</ToggleButton>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Ski Count</label>
                  <div className="flex gap-1">
                    <ToggleButton active={customForm.skiCount === 1} onClick={() => setCustomForm(f => {
                      const updates = { ...f, skiCount: 1 };
                      return updates;
                    })} className="flex-1 !py-1.5">1 Ski</ToggleButton>
                    <ToggleButton active={customForm.skiCount === 2} onClick={() => setCustomForm(f => {
                      const updates = { ...f, skiCount: 2, isToe: false };
                      if (f.modifier === "lines") updates.modifier = "spins";
                      return updates;
                    })} className="flex-1 !py-1.5">2 Skis</ToggleButton>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Category</label>
                  <div className="flex gap-1">
                    {["spins", "steps", "lines", "flips"].map(m => {
                      const catDisabled =
                        (m === "lines" && customForm.skiCount === 2) ||
                        (m === "steps" && customForm.isToe);
                      return (
                        <ToggleButton key={m} active={customForm.modifier === m} disabled={catDisabled} onClick={() => setCustomForm(f => {
                          const updates = { ...f, modifier: m };
                          if (m === "flips") { updates.isWake = false; updates.isToe = false; }
                          if (m === "lines") { updates.isWake = f.isToe ? true : false; }
                          return updates;
                        })} className="flex-1 !py-1.5 !px-1 !text-xs">
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </ToggleButton>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Wake</label>
                  {(() => {
                    const wakeForced = customForm.modifier === "flips" || customForm.modifier === "lines";
                    return (
                      <div className="flex gap-1">
                        <ToggleButton active={!customForm.isWake} disabled={wakeForced} onClick={() => setCustomForm(f => ({ ...f, isWake: false }))} className="flex-1 !py-1.5">No</ToggleButton>
                        <ToggleButton active={customForm.isWake} variant="orange" disabled={wakeForced} onClick={() => setCustomForm(f => ({ ...f, isWake: true }))} className="flex-1 !py-1.5">Yes</ToggleButton>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="text-xs text-white font-semibold block mb-1">Toe</label>
                  <div className="flex gap-1">
                    <ToggleButton active={!customForm.isToe} disabled={customForm.skiCount === 2 || customForm.modifier === "flips"} onClick={() => setCustomForm(f => {
                      const updates = { ...f, isToe: false };
                      if (f.modifier === "lines") updates.isWake = false;
                      return updates;
                    })} className="flex-1 !py-1.5">No</ToggleButton>
                    <ToggleButton active={customForm.isToe} variant="purple" disabled={customForm.skiCount === 2 || customForm.modifier === "flips"} onClick={() => setCustomForm(f => {
                      const updates = { ...f, isToe: true };
                      if (f.modifier === "steps") updates.modifier = "spins";
                      if (f.modifier === "lines") updates.isWake = true;
                      return updates;
                    })} className="flex-1 !py-1.5">Yes</ToggleButton>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    if (!customForm.abbr.trim() || !customForm.points) return;
                    const trickData = {
                      abbr: customForm.abbr.trim(),
                      description: customForm.description.trim() || customForm.abbr.trim(),
                      points: Number(customForm.points),
                      startPos: customForm.startPos,
                      endPos: customForm.endPos,
                      skiCount: customForm.skiCount,
                      modifier: customForm.modifier,
                      isWake: customForm.isWake,
                      isToe: customForm.isToe,
                    };
                    if (editingTrickId) {
                      onUpdateCustomTrick(editingTrickId, trickData);
                    } else {
                      onAddCustomTrick(trickData);
                    }
                    setEditingTrickId(null);
                    setShowCustomForm(false);
                  }}
                  disabled={!customForm.abbr.trim() || !customForm.points}
                  className="flex-1 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-white text-white text-sm font-semibold transition-all"
                >
                  {editingTrickId ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => { setShowCustomForm(false); setEditingTrickId(null); }}
                  className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Custom Tricks Management List */}
          {customTricks.length > 0 && (
            <div className="mt-3 sm:mt-4 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700">
                <span className="text-xs sm:text-sm text-white font-semibold">Custom Tricks ({customTricks.length})</span>
              </div>
              <div className="divide-y divide-slate-700/50">
                {customTricks.map((trick) => (
                  <div key={trick.id} className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{trick.abbr}</span>
                        <span className="text-xs text-white font-medium truncate">{trick.description !== trick.abbr ? trick.description : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs font-bold text-blue-400">{trick.points} pts</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-white font-semibold">{trick.skiCount === 1 ? "1 Ski" : "2 Skis"}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-white font-semibold capitalize">{trick.modifier}</span>
                        {trick.isWake && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-400 font-semibold">Wake</span>}
                        {trick.isToe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-400 font-semibold">Toe</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTrickId(trick.id);
                        setCustomForm({
                          description: trick.description || "",
                          abbr: trick.abbr,
                          points: trick.points,
                          startPos: trick.startPos,
                          endPos: trick.endPos,
                          skiCount: trick.skiCount,
                          modifier: trick.modifier,
                          isWake: trick.isWake,
                          isToe: trick.isToe,
                        });
                        setShowCustomForm(true);
                      }}
                      className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveCustomTrick(trick.id)}
                      className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-red-900 text-white hover:text-red-300 font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          </>)}

        </div>

        {/* Trick List Sidebar - hidden on small screens */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <TrickListSidebar
            pass1={passesForDisplay.pass1}
            pass2={passesForDisplay.pass2}
            currentPass={currentPass}
            pass1SkiCount={passesForDisplay.pass1SkiCount}
            pass2SkiCount={passesForDisplay.pass2SkiCount}
          />
        </div>
      </div>

      {tutorialStep !== null && (
        <TutorialOverlay
          step={tutorialStep}
          steps={activeSteps}
          targetRef={tutorialRefMap[activeSteps[tutorialStep]?.key]}
          onNext={nextTutorialStep}
          onBack={prevTutorialStep}
          onSkip={endTutorial}
        />
      )}
    </div>
  );
}
