import { useState, useEffect } from "react";
import { predictNextTricks, filterLegalPredictions } from "../utils/trickPredictor.js";

export default function TrickRecommendations({
  trickHistory,
  currentOrientation,
  allPerformedTricks,
  availableTricks,
  availableReverseAbbrs = [],
  onTrickClick,
  onHeatmapUpdate,
  skillLevel,
}) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lastTricks = trickHistory.slice(-3).map(t => t.abbr).join(",");
  const reversesKey = availableReverseAbbrs.join(",");
  const trickHistoryKey = trickHistory.length + "-" + currentOrientation + "-" + lastTricks + "-" + reversesKey;

  useEffect(() => {
    let cancelled = false;

    async function fetchPredictions() {
      setLoading(true);
      setError(null);

      try {
        const rawPredictions = await predictNextTricks(trickHistory);

        if (cancelled) return;

        const { top5, heatmap, totalFiltered } = filterLegalPredictions(
          rawPredictions,
          currentOrientation,
          allPerformedTricks,
          availableTricks,
          availableReverseAbbrs
        );

        setPredictions(top5);

        if (onHeatmapUpdate) {
          onHeatmapUpdate(heatmap, totalFiltered);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load predictions");
          console.error("Prediction error:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPredictions();

    return () => {
      cancelled = true;
    };
  }, [trickHistoryKey]);

  if (error) {
    return (
      <div className="text-base text-red-400 font-medium p-2">
        {error}
      </div>
    );
  }

  if (loading && predictions.length === 0) {
    return (
      <div className="text-base text-white font-medium p-2">
        Loading AI suggestions...
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-base text-white font-medium p-2 italic">
        No suggestions available
      </div>
    );
  }

  return (
    <div className="border border-orange-500/30 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-base sm:text-lg font-semibold text-orange-300">AI Suggestions</div>
        <span className="text-xs px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-300 font-semibold capitalize">{skillLevel}</span>
      </div>
      <div className="flex gap-1.5">
        {predictions.map((pred) => (
          <button
            key={pred.abbr}
            onClick={() => onTrickClick && onTrickClick(pred.abbr)}
            aria-label={`${pred.abbr}, ${pred.points} points${pred.alreadyPerformed ? ", already performed" : ""}`}
            style={{ containerType: 'inline-size' }}
            className={`flex-1 flex flex-col items-center justify-center px-1 sm:px-2 py-2 sm:py-3 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-800 ${
              pred.alreadyPerformed
                ? "bg-slate-800/50 text-white border border-slate-700/50"
                : "bg-orange-800/50 hover:bg-orange-700/50 text-white border border-orange-500/50 hover:border-orange-400/70"
            }`}
          >
            <span className={`font-bold leading-none ${pred.alreadyPerformed ? "text-white line-through" : "text-blue-300"}`} style={{ fontSize: `clamp(0.6rem, ${90 / Math.max(pred.abbr.length, 1.5)}cqw, 2.25rem)` }}>
              {pred.abbr}
            </span>
            <span className="text-xs sm:text-sm font-semibold leading-tight text-white mt-0.5">
              {pred.points}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
