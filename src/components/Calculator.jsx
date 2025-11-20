import { useState } from "react";
import TrickButton from "./TrickButton.jsx";

export default function Calculator({ addTrick, clearTricks, trickList }) {
  // Track skier's current orientation (front or back position)
  const [orientation, setOrientation] = useState("front");
  // Track the last trick that can be reversed
  const [lastReversibleTrick, setLastReversibleTrick] = useState(null);
  // Track the second-to-last trick that can be reversed (for orientation-changing tricks)
  const [secondLastReversibleTrick, setSecondLastReversibleTrick] = useState(null);

  // Basic 1-ski surface turns only (no lines, stepovers, reverses, wake, or toehold)
  // startPos: position required to perform trick
  // endPos: position skier ends in after trick
  // changesOrientation: true if trick ends in different position than it starts
  const tricks = [
    { abbr: "S", points: 40, description: "Side Slide", startPos: "front", endPos: "front", changesOrientation: false },
    { abbr: "B", points: 60, description: "180 F-B", startPos: "front", endPos: "back", changesOrientation: true },
    { abbr: "F", points: 60, description: "B-F", startPos: "back", endPos: "front", changesOrientation: true },
    { abbr: "O", points: 90, description: "360 F-F", startPos: "front", endPos: "front", changesOrientation: false },
    { abbr: "BB", points: 90, description: "B-B", startPos: "back", endPos: "back", changesOrientation: false },
    { abbr: "5B", points: 110, description: "540 F-B", startPos: "front", endPos: "back", changesOrientation: true },
    { abbr: "5F", points: 110, description: "B-F", startPos: "back", endPos: "front", changesOrientation: true },
    { abbr: "7F", points: 130, description: "720 F-F", startPos: "front", endPos: "front", changesOrientation: false },
    { abbr: "7B", points: 130, description: "B-B", startPos: "back", endPos: "back", changesOrientation: false },
  ];

  const handleTrickClick = (abbr, points, endPos, changesOrientation) => {
    // Check if trick has already been performed - if so, it's worth 0 points
    const alreadyPerformed = trickList.some(trick => trick.abbr === abbr);
    const finalPoints = alreadyPerformed ? 0 : points;

    addTrick({ abbr, points: finalPoints });
    setOrientation(endPos);

    const trickObj = tricks.find(t => t.abbr === abbr);

    // Handle reverse trick availability tracking
    if (lastReversibleTrick) {
      if (lastReversibleTrick.changesOrientation) {
        // Last trick changed orientation, check if this is the required 180° turn
        if ((abbr === "B" || abbr === "F") && changesOrientation) {
          // This is a 180° turn, so now we can reverse the previous trick
          // Move last trick to second-last, and set this new trick as last
          setSecondLastReversibleTrick(lastReversibleTrick);
          setLastReversibleTrick(trickObj);
          return;
        } else {
          // We did something other than B or F, lose the chance to reverse the last trick
          // But this new trick becomes the last reversible trick
          setSecondLastReversibleTrick(null);
          setLastReversibleTrick(trickObj);
        }
      } else {
        // Last trick doesn't change orientation, it must be reversed immediately
        // We're doing another trick, so we lose the chance
        setSecondLastReversibleTrick(null);
        setLastReversibleTrick(trickObj);
      }
    } else {
      // No previous reversible trick, this becomes the first
      setLastReversibleTrick(trickObj);
      setSecondLastReversibleTrick(null);
    }
  };

  const handleReverse = (trickToReverse) => {
    if (!trickToReverse) return;

    const reverseAbbr = "R" + trickToReverse.abbr;
    const reversePoints = trickToReverse.points;

    // Check if this specific reverse has already been performed
    const alreadyPerformed = trickList.some(trick => trick.abbr === reverseAbbr);
    const finalPoints = alreadyPerformed ? 0 : reversePoints;

    addTrick({ abbr: reverseAbbr, points: finalPoints });
    // Reverse follows the same orientation change as the original trick
    const reverseEndPos = trickToReverse.endPos;
    setOrientation(reverseEndPos);

    // After doing a reverse, update the reversible tricks
    // If we reversed the second-last trick, only the last remains
    // If we reversed the last trick, neither remains
    if (trickToReverse === secondLastReversibleTrick) {
      setSecondLastReversibleTrick(null);
    } else if (trickToReverse === lastReversibleTrick) {
      setLastReversibleTrick(null);
      setSecondLastReversibleTrick(null);
    }
  };

  const handleClear = () => {
    clearTricks();
    setOrientation("front");
    setLastReversibleTrick(null);
    setSecondLastReversibleTrick(null);
  };

  // Determine if each reverse button should be enabled
  // For non-orientation-changing tricks: can reverse immediately
  // For orientation-changing tricks: can reverse if we're in the correct starting position
  const canReverseLastTrick = lastReversibleTrick && (
    !lastReversibleTrick.changesOrientation || // Non-orientation changing can reverse immediately
    lastReversibleTrick.startPos === orientation // Orientation changing can reverse if we're back at start position
  );
  const canReverseSecondLastTrick = secondLastReversibleTrick && (
    !secondLastReversibleTrick.changesOrientation ||
    secondLastReversibleTrick.startPos === orientation
  );

  const total = trickList.reduce((sum, trick) => sum + trick.points, 0);

  // Filter tricks based on current orientation
  const availableTricks = tricks.filter(trick => trick.startPos === orientation);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Total Display */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
        <div className="text-gray-400 text-sm mb-1">Total Points</div>
        <div className="text-5xl font-light tracking-wider text-blue-400">{total}</div>
      </div>

      {/* Current Orientation Indicator */}
      <div className="mb-4 text-center">
        <span className="text-sm text-gray-400">Current Position: </span>
        <span className="text-lg font-medium text-blue-400 capitalize">{orientation}</span>
      </div>

      {/* Trick Buttons Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {tricks.map((trick) => {
          const isAvailable = trick.startPos === orientation;
          const alreadyPerformed = trickList.some(t => t.abbr === trick.abbr);
          return (
            <TrickButton
              key={trick.abbr}
              abbr={trick.abbr}
              points={trick.points}
              onClick={() => handleTrickClick(trick.abbr, trick.points, trick.endPos, trick.changesOrientation)}
              disabled={!isAvailable}
              alreadyPerformed={alreadyPerformed}
            />
          );
        })}
      </div>

      {/* REV and Clear Buttons */}
      <div className={`grid gap-4 ${canReverseSecondLastTrick && canReverseLastTrick ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Show second-last reverse if available */}
        {canReverseSecondLastTrick && (
          <button
            onClick={() => handleReverse(secondLastReversibleTrick)}
            className="bg-green-900 hover:bg-green-700 text-gray-100 font-light text-lg tracking-wide py-4 rounded-lg transition-all duration-200 border border-green-800 hover:border-green-600"
          >
            REV ({secondLastReversibleTrick.abbr})
          </button>
        )}

        {/* Show last reverse if available */}
        {canReverseLastTrick && (
          <button
            onClick={() => handleReverse(lastReversibleTrick)}
            className="bg-green-900 hover:bg-green-700 text-gray-100 font-light text-lg tracking-wide py-4 rounded-lg transition-all duration-200 border border-green-800 hover:border-green-600"
          >
            REV ({lastReversibleTrick.abbr})
          </button>
        )}

        {/* Disabled REV button when none available */}
        {!canReverseSecondLastTrick && !canReverseLastTrick && (
          <button
            disabled
            className="bg-slate-900 text-gray-600 border-slate-800 cursor-not-allowed opacity-50 font-light text-lg tracking-wide py-4 rounded-lg transition-all duration-200 border"
          >
            REV
          </button>
        )}

        <button
          onClick={handleClear}
          className="bg-red-900 hover:bg-red-700 text-gray-100 font-light text-lg tracking-wide py-4 rounded-lg transition-all duration-200 border border-red-800 hover:border-red-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
  