import TrickButton from "./TrickButton.jsx";
import ToggleButton from "./ToggleButton.jsx";
import StatsCard from "./StatsCard.jsx";
import TrickListSidebar from "./TrickListSidebar.jsx";
import { getTricks } from "../data/tricks.js";

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
}) {
  const { orientation, skiCount, lastReversibleTrick, secondLastReversibleTrick, modifier, isWake, isToe, noCredit, passStarted } = calcState;

  const updateState = (updates) => setCalcState(prev => ({ ...prev, ...updates }));

  // Save current state to history before making changes
  const saveStateToHistory = () => {
    setCalcStateHistory(prev => [...prev, calcState]);
  };

  const tricks = getTricks(skiCount, modifier, isWake, isToe);

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
    if (newModifier === "flips" || newModifier === "lines") {
      updates.isWake = false;
      updates.isToe = false;
    }
    // Toe + Steps is valid, but Toe + Wake + Steps is not
    if (newModifier === "steps" && isToe && isWake) {
      updates.isWake = false;
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

  const passTotal = trickList.reduce((sum, trick) => sum + trick.points, 0);
  const allTotal = allTricks.reduce((sum, trick) => sum + trick.points, 0);

  // Count flips for 6-flip limit warning
  const flipCount = trickList.filter(t => t.abbr.includes("FL")).length;

  // Check if lines/flips should be disabled
  const linesDisabled = skiCount === 2;
  const toeDisabled = skiCount === 2;

  const modifiers = [
    { key: "spins", label: "Spins", disabled: false },
    { key: "steps", label: "Steps", disabled: false },
    { key: "lines", label: "Lines", disabled: linesDisabled },
    { key: "flips", label: "Flips", disabled: false },
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 sm:p-6">
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
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-gray-400">Pass {currentPass} of 2</span>
                {currentPass === 1 && (
                  <ToggleButton
                    active={true}
                    variant="green"
                    onClick={startSecondPass}
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
            <div className="flex flex-col gap-1 sm:gap-2">
              {modifiers.map((mod) => (
                <ToggleButton
                  key={mod.key}
                  active={modifier === mod.key}
                  disabled={mod.disabled}
                  onClick={() => !mod.disabled && handleModifierChange(mod.key)}
                >
                  {mod.label}
                </ToggleButton>
              ))}
            </div>

            {/* Trick Buttons Grid (center) */}
            <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-4">
              {tricks.map((trick) => {
                const isAvailable = trick.startPos === orientation;
                const alreadyPerformed = allTricks.some(t => t.abbr === trick.abbr);
                return (
                  <TrickButton
                    key={trick.abbr}
                    abbr={trick.abbr}
                    points={trick.points}
                    onClick={() => handleTrickClick(trick)}
                    disabled={!isAvailable}
                    alreadyPerformed={alreadyPerformed}
                  />
                );
              })}
            </div>

            {/* Wake/Toe/NC Modifier Buttons (right) */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <ToggleButton
                active={isWake}
                variant="orange"
                disabled={modifier === "flips" || modifier === "lines" || (isToe && modifier === "steps")}
                onClick={() => updateState({ isWake: !isWake })}
              >
                Wake
              </ToggleButton>
              <ToggleButton
                active={isToe}
                variant="purple"
                disabled={modifier === "flips" || modifier === "lines" || (isWake && modifier === "steps") || toeDisabled}
                onClick={() => updateState({ isToe: !isToe })}
              >
                Toe
              </ToggleButton>
              <ToggleButton
                active={noCredit}
                variant="yellow"
                onClick={() => updateState({ noCredit: !noCredit })}
              >
                NC
              </ToggleButton>
            </div>
          </div>

          {/* REV, Undo, and Clear Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {/* Show second-last reverse if available */}
            {canReverseSecondLastTrick && (
              <button
                onClick={() => handleReverse(secondLastReversibleTrick)}
                className="flex-1 min-w-[60px] bg-green-900 hover:bg-green-700 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-3 rounded-lg transition-all duration-200 border border-green-800 hover:border-green-600"
              >
                <div className="text-sm sm:text-base">R{secondLastReversibleTrick.abbr}</div>
                <div className="text-xs sm:text-sm text-green-300">{secondLastReversibleTrick.points} pts</div>
              </button>
            )}

            {/* Show last reverse if available */}
            {canReverseLastTrick && (
              <button
                onClick={() => handleReverse(lastReversibleTrick)}
                className="flex-1 min-w-[60px] bg-green-900 hover:bg-green-700 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-3 rounded-lg transition-all duration-200 border border-green-800 hover:border-green-600"
              >
                <div className="text-sm sm:text-base">R{lastReversibleTrick.abbr}</div>
                <div className="text-xs sm:text-sm text-green-300">{lastReversibleTrick.points} pts</div>
              </button>
            )}

            {/* Disabled REV button when none available */}
            {!canReverseSecondLastTrick && !canReverseLastTrick && (
              <button
                disabled
                className="flex-1 min-w-[60px] bg-slate-900 text-gray-600 border-slate-800 cursor-not-allowed opacity-50 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border"
              >
                REV
              </button>
            )}

            {/* Undo button */}
            <button
              onClick={handleUndo}
              disabled={calcStateHistory.length === 0}
              className={`flex-1 min-w-[60px] font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border ${
                calcStateHistory.length === 0
                  ? "bg-slate-900 text-gray-600 border-slate-800 cursor-not-allowed opacity-50"
                  : "bg-amber-900 hover:bg-amber-700 text-gray-100 border-amber-800 hover:border-amber-600"
              }`}
            >
              Undo
            </button>

            {/* Clear buttons - show two options on pass 2 */}
            {currentPass === 2 ? (
              <>
                <button
                  onClick={clearCurrentPass}
                  className="flex-1 min-w-[60px] bg-red-900 hover:bg-red-700 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border border-red-800 hover:border-red-600"
                >
                  <span className="hidden sm:inline">Clear Pass</span>
                  <span className="sm:hidden">Clear<br/>Pass</span>
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 min-w-[60px] bg-red-950 hover:bg-red-900 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border border-red-900 hover:border-red-700"
                >
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear<br/>All</span>
                </button>
              </>
            ) : (
              <button
                onClick={clearAll}
                className="flex-1 min-w-[60px] bg-red-900 hover:bg-red-700 text-gray-100 font-light text-sm sm:text-lg tracking-wide py-2 sm:py-4 rounded-lg transition-all duration-200 border border-red-800 hover:border-red-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* 6-Flip Limit Warning */}
          {flipCount > 6 && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-900 border border-yellow-700 rounded-lg text-yellow-200 text-center text-sm sm:text-base">
              Exceeded 6 flip limit ({flipCount} flips)
            </div>
          )}
        </div>

        {/* Trick List Sidebar - hidden on small screens */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <TrickListSidebar
            pass1={passesForDisplay.pass1}
            pass2={passesForDisplay.pass2}
            currentPass={currentPass}
          />
        </div>
      </div>
    </div>
  );
}
