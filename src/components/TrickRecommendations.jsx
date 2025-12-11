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
}) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a stable key from trick history (last few tricks), orientation, and available reverses
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
    <div className="space-y-1">
      <div className="text-xs text-gray-300 mb-1">AI Suggestions</div>
      {predictions.map((pred, idx) => (
        <button
          key={pred.abbr}
          onClick={() => onTrickClick && onTrickClick(pred.abbr)}
          aria-label={`${pred.abbr}, ${pred.points} points${pred.alreadyPerformed ? ", already performed" : ""}`}
          className={`w-full flex items-center justify-between p-1.5 rounded text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-800 ${
            pred.alreadyPerformed
              ? "bg-slate-800/50 text-gray-400 border border-slate-700/50"
              : "bg-slate-700/50 hover:bg-blue-900/50 text-gray-200 border border-slate-600/50 hover:border-blue-700/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-3">{idx + 1}.</span>
            <span className={`font-medium ${pred.alreadyPerformed ? "text-gray-400" : "text-blue-300"}`}>
              {pred.abbr}
            </span>
            {pred.alreadyPerformed && (
              <span className="text-yellow-500 text-xs">done</span>
            )}
          </div>
          <span className={pred.alreadyPerformed ? "text-gray-400" : "text-gray-300"}>
            {pred.points} pts
          </span>
        </button>
      ))}
    </div>
  );
}
