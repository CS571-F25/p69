import { useState, useEffect } from "react";
import { predictNextTricks, filterLegalPredictions } from "../utils/trickPredictor.js";

export default function TrickRecommendations({
  trickHistory,
  currentOrientation,
  allPerformedTricks,
  availableTricks,
  availableReverseAbbrs = [], // Array of currently available reverse trick abbreviations
  onTrickClick,
  onHeatmapUpdate, // Callback to pass heatmap to parent (stored in ref, won't cause re-render)
  skillLevel,
}) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a stable key from trick history (last few tricks), orientation, and available reverses
  const lastTricks = trickHistory.slice(-3).map(t => t.abbr).join(",");
  const reversesKey = availableReverseAbbrs.join(",");
  const trickHistoryKey = trickHistory.length + "-" + currentOrientation + "-" + lastTricks + "-" + reversesKey + "-" + skillLevel;

  useEffect(() => {
    let cancelled = false;

    async function fetchPredictions() {
      setLoading(true);
      setError(null);

      try {
        const rawPredictions = await predictNextTricks(trickHistory, skillLevel);

        if (cancelled) return;

        // Filter by orientation, available reverses, and get heatmap
        const { top5, heatmap, totalFiltered } = filterLegalPredictions(
          rawPredictions,
          currentOrientation,
          allPerformedTricks,
          availableTricks,
          availableReverseAbbrs
        );

        setPredictions(top5);

        // Pass heatmap to parent for button coloring
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
  }, [trickHistoryKey]); // Only re-run when trick count or orientation changes

  if (error) {
    return (
      <div className="text-xs text-red-400 p-2">
        {error}
      </div>
    );
  }

  if (loading && predictions.length === 0) {
    return (
      <div className="text-xs text-gray-400 p-2">
        Loading AI suggestions...
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-xs text-gray-400 p-2 italic">
        No suggestions available
      </div>
    );
  }

  return (
    <div className="border border-orange-500/30 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-xs text-orange-300/80">AI Suggestions</div>
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-300/80 capitalize">{skillLevel}</span>
      </div>
      <div className="flex gap-1.5">
        {predictions.map((pred) => (
          <button
            key={pred.abbr}
            onClick={() => onTrickClick && onTrickClick(pred.abbr)}
            aria-label={`${pred.abbr}, ${pred.points} points${pred.alreadyPerformed ? ", already performed" : ""}`}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-800 ${
              pred.alreadyPerformed
                ? "bg-slate-800/50 text-gray-400 border border-slate-700/50"
                : "bg-orange-800/50 hover:bg-orange-700/50 text-gray-100 border border-orange-500/50 hover:border-orange-400/70"
            }`}
          >
            <span className={`text-[10px] sm:text-xs font-medium leading-tight ${pred.alreadyPerformed ? "text-gray-400 line-through" : "text-blue-300"}`}>
              {pred.abbr}
            </span>
            <span className={`text-[9px] sm:text-[10px] leading-tight ${pred.alreadyPerformed ? "text-gray-500" : "text-gray-400"}`}>
              {pred.points}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
