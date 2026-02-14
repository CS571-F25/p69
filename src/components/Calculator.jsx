import { useState } from "react";
import TrickButton, { getHeatmapStyle } from "./TrickButton.jsx";
import ToggleButton from "./ToggleButton.jsx";
import StatsCard from "./StatsCard.jsx";
import TrickListSidebar from "./TrickListSidebar.jsx";
import TrickRecommendations from "./TrickRecommendations.jsx";
import { getTricks, getAllTricksForSkiCount } from "../data/tricks.js";
import { calculatePassTotal } from "../utils/trickUtils.js";

const SKILL_LEVELS = [
  { key: "beginner", label: "Beginner", range: "0-1000" },
  { key: "intermediate", label: "Intermediate", range: "1-2k" },
  { key: "advanced", label: "Advanced", range: "2-7k" },
  { key: "pro", label: "Pro", range: "7k+" },
];

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
}) {
  const { orientation, skiCount, lastReversibleTrick, secondLastReversibleTrick, modifier, isWake, isToe, noCredit, passStarted } = calcState;

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
    if (lastReversibleTrick) {
      if (lastReversibleTrick.changesOrientation) {
        // Last trick changed orientation, check if this is any type of 180° turn
        // Per IWWF Rule 9.21h: "any type of 180º turn is allowed between two such turns"
        if (trick.is180Turn) {
          // This is a 180° turn, so now we can reverse the previous trick
          newState.secondLastReversibleTrick = lastReversibleTrick;
          newState.lastReversibleTrick = canBeReversed ? trick : null;
        } else {
          // We did something other than a 180° turn, lose the chance to reverse the last trick
          newState.secondLastReversibleTrick = null;
          newState.lastReversibleTrick = canBeReversed ? trick : null;
        }
      } else {
        // Last trick doesn't change orientation, it must be reversed immediately
        // We're doing another trick, so we lose the chance
        newState.secondLastReversibleTrick = null;
        newState.lastReversibleTrick = canBeReversed ? trick : null;
      }
    } else {
      // No previous reversible trick, this becomes the first (if it can be reversed)
      newState.lastReversibleTrick = canBeReversed ? trick : null;
      newState.secondLastReversibleTrick = null;
    }

    updateState(newState);
  };

  const handleReverse = (trickToReverse) => {
    if (!trickToReverse) return;

    // Save state before making changes (for undo)
    saveStateToHistory();

    const reverseAbbr = "R" + trickToReverse.abbr;
    const reversePoints = trickToReverse.points;

    // Check if this specific reverse has already been performed in ANY pass
    const alreadyPerformed = allTricks.some(trick => trick.abbr === reverseAbbr);
    const finalPoints = alreadyPerformed ? 0 : reversePoints;

    addTrick({ abbr: reverseAbbr, points: finalPoints });

    // After doing a reverse, update the reversible tricks
    if (trickToReverse === secondLastReversibleTrick) {
      updateState({
        orientation: trickToReverse.endPos,
        secondLastReversibleTrick: null,
      });
    } else if (trickToReverse === lastReversibleTrick) {
      updateState({
        orientation: trickToReverse.endPos,
        lastReversibleTrick: null,
        secondLastReversibleTrick: null,
      });
    }
  };

  const handleUndo = () => {
    if (calcStateHistory.length > 0 && undoTrick()) {
      // Restore previous state
      const previousState = calcStateHistory[calcStateHistory.length - 1];
      setCalcState(previousState);
      setCalcStateHistory(prev => prev.slice(0, -1));
    }
  };

  const handleModifierChange = (newModifier) => {
    const updates = { modifier: newModifier };
    // Auto-disable wake/toe for invalid combinations
    if (newModifier === "flips") {
      updates.isWake = false;
      updates.isToe = false;
    }
    if (newModifier === "lines") {
      updates.isWake = false;
      // Toe lines are all wake tricks
      if (isToe) updates.isWake = true;
    }
    if (newModifier === "steps" && isToe) {
      // Steps not available for toe, switch won't happen due to disabled state
      // but guard against it
      return;
    }
    updateState(updates);
  };

  // Determine if each reverse button should be enabled
  const canReverseLastTrick = lastReversibleTrick && (
    !lastReversibleTrick.changesOrientation ||
    lastReversibleTrick.startPos === orientation
  );
  const canReverseSecondLastTrick = secondLastReversibleTrick && (
    !secondLastReversibleTrick.changesOrientation ||
    secondLastReversibleTrick.startPos === orientation
  );

  // Build array of available reverse abbreviations for AI suggestions
  const availableReverseAbbrs = [];
  if (canReverseLastTrick) {
    availableReverseAbbrs.push("R" + lastReversibleTrick.abbr);
  }
  if (canReverseSecondLastTrick) {
    availableReverseAbbrs.push("R" + secondLastReversibleTrick.abbr);
  }

  const passTotal = calculatePassTotal(trickList);
  const allTotal = calculatePassTotal(allTricks);

  // Count flips for 6-flip limit warning
  const flipCount = trickList.filter(t => t.abbr.includes("FL")).length;

  // Check if lines/flips should be disabled
  const linesDisabled = skiCount === 2;
  const toeDisabled = skiCount === 2;

  const stepsDisabled = isToe;

  // Compute average heatmap style for a set of tricks
  const getAvgHeatStyle = (tricks) => {
    if (heatmapData.total === 0 || tricks.length === 0) return {};
    const ranks = [];
    for (const trick of tricks) {
      const rank = heatmapData.map.get(trick.abbr);
      if (rank !== undefined) ranks.push(rank);
    }
    if (ranks.length === 0) return {};
    const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    return getHeatmapStyle(avgRank, heatmapData.total);
  };

  // Compute heat for each modifier tab (simulate auto-adjustments from handleModifierChange)
  const getModifierHeat = (modKey) => {
    let simWake = isWake, simToe = isToe;
    if (modKey === "flips") { simWake = false; simToe = false; }
    if (modKey === "lines") { simWake = isToe ? true : false; }
    return getAvgHeatStyle(getTricks(skiCount, modKey, simWake, simToe, customTricks));
  };

  // Heat for Wake button: heat of wake tricks for current modifier/toe
  const wakeDisabled = modifier === "flips" || (modifier === "lines" && !isToe);
  const wakeHeatStyle = !wakeDisabled
    ? getAvgHeatStyle(getTricks(skiCount, modifier, true, isToe, customTricks))
    : {};

  // Heat for Toe button: heat of toe tricks (simulate side-effects of toggling toe on)
  const toeHeatStyle = !toeDisabled && modifier !== "flips"
    ? (() => {
        let simMod = modifier, simWake = isWake;
        if (modifier === "steps") simMod = "spins";
        if (modifier === "lines") simWake = true;
        return getAvgHeatStyle(getTricks(skiCount, simMod, simWake, true, customTricks));
      })()
    : {};

  const modifiers = [
    { key: "spins", label: "Spins", disabled: false },
    { key: "steps", label: "Steps", disabled: stepsDisabled },
    { key: "lines", label: "Lines", disabled: linesDisabled },
    { key: "flips", label: "Flips", disabled: false },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 sm:p-6">
      <h1 className="sr-only">Trick Calculator</h1>
      <div className="flex gap-6">
        {/* Main Calculator Section */}
        <div className="flex-1 min-w-0">
          {/* Total Display */}
          <div className="bg-slate-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-700">
            <div className="flex justify-between items-end">
              <StatsCard label={`Pass ${currentPass} Points`} value={passTotal} variant="primary" size="large" />
              {currentPass === 2 && (
                <StatsCard label="Total (Both Passes)" value={allTotal} variant="secondary" size="medium" />
              )}
            </div>
          </div>

          {/* Skill Level Selector */}
          {!passStarted && (
            <div className="mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Skill Level</div>
              <div className="flex gap-1 sm:gap-2">
                {SKILL_LEVELS.map((level) => (
                  <ToggleButton
                    key={level.key}
                    active={skillLevel === level.key}
                    onClick={() => onSkillLevelChange(level.key)}
                    className="flex-1 py-1.5 sm:py-2"
                  >
                    <div>{level.label}</div>
                    <div className="text-[10px] sm:text-xs text-gray-400">{level.range}</div>
                  </ToggleButton>
                ))}
              </div>
            </div>
          )}

          {/* Starting Configuration - Expanded before pass starts */}
          {!passStarted ? (
            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
              {/* Ski Count Selector */}
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Skis</div>
                <div className="flex gap-1 sm:gap-2">
                  <ToggleButton
                    active={skiCount === 1}
                    onClick={() => updateState({ skiCount: 1 })}
                    className="flex-1 py-1.5 sm:py-2"
                  >
                    1 Ski
                  </ToggleButton>
                  <ToggleButton
                    active={skiCount === 2}
                    onClick={() => updateState({ skiCount: 2 })}
                    className="flex-1 py-1.5 sm:py-2"
                  >
                    2 Skis
                  </ToggleButton>
                </div>
              </div>

              {/* Starting Orientation */}
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Starting Position</div>
                <div className="flex gap-1 sm:gap-2">
                  <ToggleButton
                    active={orientation === "front"}
                    onClick={() => updateState({ orientation: "front" })}
                    className="flex-1 py-1.5 sm:py-2"
                  >
                    Front
                  </ToggleButton>
                  <ToggleButton
                    active={orientation === "back"}
                    onClick={() => updateState({ orientation: "back" })}
                    className="flex-1 py-1.5 sm:py-2"
                  >
                    Back
                  </ToggleButton>
                </div>
              </div>
            </div>
          ) : (
            /* Compact Status - After pass starts */
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex gap-4 sm:gap-6">
                <div>
                  <span className="text-xs sm:text-sm text-gray-400">Position: </span>
                  <span className="text-sm sm:text-lg font-medium text-blue-400 capitalize">{orientation}</span>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-400">Skis: </span>
                  <span className="text-sm sm:text-lg font-medium text-blue-400">{skiCount}</span>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-400">Level: </span>
                  <span className="text-sm sm:text-lg font-medium text-blue-400 capitalize">{skillLevel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-400">Pass {currentPass} of 2</span>
                {currentPass === 1 && (
                  <ToggleButton
                    active={true}
                    variant="green"
                    onClick={startSecondPass}
                    ariaLabel="Start second pass"
                  >
                    Start Pass 2
                  </ToggleButton>
                )}
              </div>
            </div>
          )}

          {/* Main Layout: Modifiers on left, Tricks in center, Wake on right */}
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
            {/* Category Modifier Buttons (left) */}
            <div className="flex flex-col gap-1 sm:gap-2 w-[4.5rem] sm:w-20 flex-shrink-0">
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
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-4">
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
                    isCustom={trick.isCustom}
                  />
                );
              })}
            </div>

            {/* Wake/Toe/NC Modifier Buttons (right) */}
            <div className="flex flex-col gap-1 sm:gap-2 w-[4.5rem] sm:w-20 flex-shrink-0">
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
                disabled={modifier === "flips" || toeDisabled}
                onClick={() => {
                  const updates = { isToe: !isToe };
                  if (!isToe) {
                    // Turning toe ON
                    if (modifier === "steps") updates.modifier = "spins";
                    if (modifier === "lines") updates.isWake = true;
                  }
                  updateState(updates);
                }}
                style={toeHeatStyle}
                className={isToe ? "!font-bold" : ""}
              >
                Toe
              </ToggleButton>
              <ToggleButton
                active={noCredit}
                variant="yellow"
                onClick={() => updateState({ noCredit: !noCredit })}
                className={noCredit ? "!font-bold" : ""}
              >
                NC
              </ToggleButton>
            </div>
          </div>

          {/* REV, Undo, and Clear Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {/* Show second-last reverse if available */}
            {canReverseSecondLastTrick && (() => {
              const revAbbr = "R" + secondLastReversibleTrick.abbr;
              const heatRank = heatmapData.map.get(revAbbr);
              const heatStyle = heatRank !== undefined ? getHeatmapStyle(heatRank, heatmapData.total) : {};
              const hasHeat = heatRank !== undefined && heatmapData.total > 0;
              return (
                <button
                  onClick={() => handleReverse(secondLastReversibleTrick)}
                  aria-label={`Reverse ${secondLastReversibleTrick.abbr}, ${secondLastReversibleTrick.points} points`}
                  style={hasHeat ? heatStyle : {}}
                  className={`flex-1 min-w-[60px] font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                    hasHeat
                      ? "text-white hover:opacity-90 hover:shadow-md"
                      : "bg-slate-800 hover:bg-blue-800 text-gray-100 border-slate-700 hover:border-blue-700 hover:shadow-md hover:shadow-blue-900/20"
                  }`}
                >
                  <div className="text-sm sm:text-base">R{secondLastReversibleTrick.abbr}</div>
                  <div className={`text-xs sm:text-sm ${hasHeat ? "text-white/80" : "text-gray-300"}`}>{secondLastReversibleTrick.points} pts</div>
                </button>
              );
            })()}

            {/* Show last reverse if available */}
            {canReverseLastTrick && (() => {
              const revAbbr = "R" + lastReversibleTrick.abbr;
              const heatRank = heatmapData.map.get(revAbbr);
              const heatStyle = heatRank !== undefined ? getHeatmapStyle(heatRank, heatmapData.total) : {};
              const hasHeat = heatRank !== undefined && heatmapData.total > 0;
              return (
                <button
                  onClick={() => handleReverse(lastReversibleTrick)}
                  aria-label={`Reverse ${lastReversibleTrick.abbr}, ${lastReversibleTrick.points} points`}
                  style={hasHeat ? heatStyle : {}}
                  className={`flex-1 min-w-[60px] font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                    hasHeat
                      ? "text-white hover:opacity-90 hover:shadow-md"
                      : "bg-slate-800 hover:bg-blue-800 text-gray-100 border-slate-700 hover:border-blue-700 hover:shadow-md hover:shadow-blue-900/20"
                  }`}
                >
                  <div className="text-sm sm:text-base">R{lastReversibleTrick.abbr}</div>
                  <div className={`text-xs sm:text-sm ${hasHeat ? "text-white/80" : "text-gray-300"}`}>{lastReversibleTrick.points} pts</div>
                </button>
              );
            })()}

            {/* Disabled REV button when none available */}
            {!canReverseSecondLastTrick && !canReverseLastTrick && (
              <button
                disabled
                aria-label="Reverse trick, unavailable"
                className="flex-1 min-w-[60px] bg-slate-900 text-gray-500 border-slate-800 cursor-not-allowed opacity-50 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border"
              >
                <div className="text-sm sm:text-base">REV</div>
                <div className="text-xs sm:text-sm">&nbsp;</div>
              </button>
            )}

            {/* Undo button */}
            <button
              onClick={handleUndo}
              disabled={calcStateHistory.length === 0}
              aria-label="Undo last trick"
              className={`flex-1 min-w-[60px] font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                calcStateHistory.length === 0
                  ? "bg-slate-900 text-gray-500 border-slate-800 cursor-not-allowed opacity-50"
                  : "bg-amber-900 hover:bg-amber-700 text-gray-100 border-amber-800 hover:border-amber-600"
              }`}
            >
              <div className="text-sm sm:text-base">Undo</div>
            </button>

            {/* Clear buttons - show two options on pass 2 */}
            {currentPass === 2 ? (
              <>
                <button
                  onClick={clearCurrentPass}
                  aria-label="Clear current pass"
                  className="flex-1 min-w-[60px] bg-red-900 hover:bg-red-700 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border border-red-800 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
                >
                  <span className="hidden sm:inline">Clear Pass</span>
                  <span className="sm:hidden">Clear<br/>Pass</span>
                </button>
                <button
                  onClick={clearAll}
                  aria-label="Clear all passes"
                  className="flex-1 min-w-[60px] bg-red-950 hover:bg-red-900 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border border-red-900 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
                >
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear<br/>All</span>
                </button>
              </>
            ) : (
              <button
                onClick={clearAll}
                aria-label="Clear all tricks"
                className="flex-1 min-w-[60px] bg-red-900 hover:bg-red-700 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border border-red-800 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* Custom Trick */}
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
            className="mt-3 sm:mt-4 w-full py-2 sm:py-3 rounded-lg border-2 border-dashed border-slate-600 text-gray-400 hover:border-slate-500 hover:text-gray-300 transition-all text-sm sm:text-base"
          >
            {showCustomForm ? "Cancel" : "+ Custom"}
          </button>

          {showCustomForm && (
            <div className="mt-2 p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs text-gray-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={customForm.description}
                    onChange={(e) => setCustomForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Front Flip 540 Back Landing"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Abbreviation</label>
                  <input
                    type="text"
                    value={customForm.abbr}
                    onChange={(e) => setCustomForm(f => ({ ...f, abbr: e.target.value.toUpperCase() }))}
                    placeholder="e.g. FFL5LB"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Points</label>
                  <input
                    type="number"
                    value={customForm.points}
                    onChange={(e) => setCustomForm(f => ({ ...f, points: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Start Position</label>
                  <div className="flex gap-1">
                    <ToggleButton active={customForm.startPos === "front"} onClick={() => setCustomForm(f => ({ ...f, startPos: "front" }))} className="flex-1 !py-1.5">Front</ToggleButton>
                    <ToggleButton active={customForm.startPos === "back"} onClick={() => setCustomForm(f => ({ ...f, startPos: "back" }))} className="flex-1 !py-1.5">Back</ToggleButton>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">End Position</label>
                  <div className="flex gap-1">
                    <ToggleButton active={customForm.endPos === "front"} onClick={() => setCustomForm(f => ({ ...f, endPos: "front" }))} className="flex-1 !py-1.5">Front</ToggleButton>
                    <ToggleButton active={customForm.endPos === "back"} onClick={() => setCustomForm(f => ({ ...f, endPos: "back" }))} className="flex-1 !py-1.5">Back</ToggleButton>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">Ski Count</label>
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
                  <label className="text-xs text-gray-400 block mb-1">Category</label>
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
                  <label className="text-xs text-gray-400 block mb-1">Wake</label>
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
                  <label className="text-xs text-gray-400 block mb-1">Toe</label>
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
                  className="flex-1 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-gray-500 text-gray-100 text-sm font-medium transition-all"
                >
                  {editingTrickId ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => { setShowCustomForm(false); setEditingTrickId(null); }}
                  className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm transition-all"
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
                <span className="text-xs sm:text-sm text-gray-400">Custom Tricks ({customTricks.length})</span>
              </div>
              <div className="divide-y divide-slate-700/50">
                {customTricks.map((trick) => (
                  <div key={trick.id} className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-100">{trick.abbr}</span>
                        <span className="text-xs text-gray-400 truncate">{trick.description !== trick.abbr ? trick.description : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-blue-400">{trick.points} pts</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-gray-400">{trick.skiCount === 1 ? "1 Ski" : "2 Skis"}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-gray-400 capitalize">{trick.modifier}</span>
                        {trick.isWake && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-400">Wake</span>}
                        {trick.isToe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-400">Toe</span>}
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
                      className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-gray-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveCustomTrick(trick.id)}
                      className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-red-900 text-gray-300 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6-Flip Limit Warning */}
          {flipCount > 6 && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-900 border border-yellow-700 rounded-lg text-yellow-200 text-center text-sm sm:text-base">
              Exceeded 6 flip limit ({flipCount} flips)
            </div>
          )}

          {/* AI Recommendations - mobile only */}
          <div className="lg:hidden mt-4 bg-slate-800 rounded-lg p-3 border border-slate-700">
            <TrickRecommendations
              trickHistory={allTricks}
              currentOrientation={orientation}
              allPerformedTricks={allTricks}
              availableTricks={allTricksForSki}
              availableReverseAbbrs={availableReverseAbbrs}
              onTrickClick={(abbr) => {
                const trick = allTricksForSki.find((t) => t.abbr === abbr);
                if (trick && trick.startPos === orientation) {
                  handleTrickClick(trick);
                }
              }}
              onHeatmapUpdate={handleHeatmapUpdate}
            />
          </div>
        </div>

        {/* Trick List Sidebar - hidden on small screens */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <TrickListSidebar
            pass1={passesForDisplay.pass1}
            pass2={passesForDisplay.pass2}
            currentPass={currentPass}
            pass1SkiCount={passesForDisplay.pass1SkiCount}
            pass2SkiCount={passesForDisplay.pass2SkiCount}
            recommendations={
              <TrickRecommendations
                trickHistory={allTricks}
                currentOrientation={orientation}
                allPerformedTricks={allTricks}
                availableTricks={allTricksForSki}
                availableReverseAbbrs={availableReverseAbbrs}
                onTrickClick={(abbr) => {
                  const trick = allTricksForSki.find((t) => t.abbr === abbr);
                  if (trick && trick.startPos === orientation) {
                    handleTrickClick(trick);
                  }
                }}
                onHeatmapUpdate={handleHeatmapUpdate}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
