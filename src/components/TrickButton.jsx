// Calculate heatmap color: rank 0 = red (hot), higher ranks = blue (cool)
export function getHeatmapStyle(heatRank, heatTotal) {
  if (heatRank === undefined || heatTotal === 0) return {};

  // Normalize rank to 0-1 range (0 = hottest, 1 = coolest)
  const normalized = Math.min(heatRank / Math.max(heatTotal - 1, 1), 1);

  // Interpolate from red (hot) to blue (cool)
  // Red: rgb(239, 68, 68) -> Blue: rgb(59, 130, 246)
  const r = Math.round(239 - normalized * (239 - 59));
  const g = Math.round(68 + normalized * (130 - 68));
  const b = Math.round(68 + normalized * (246 - 68));

  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    borderColor: `rgb(${Math.max(r - 30, 0)}, ${Math.max(g - 30, 0)}, ${Math.max(b - 30, 0)})`,
  };
}

export default function TrickButton({
  abbr,
  points,
  onClick,
  disabled = false,
  alreadyPerformed = false,
  heatRank,
  heatTotal,
  description = "",
  isCustom = false,
}) {
  const heatStyle = !disabled && !alreadyPerformed ? getHeatmapStyle(heatRank, heatTotal) : {};
  const hasHeat = heatRank !== undefined && heatTotal > 0 && !disabled && !alreadyPerformed;

  const ariaLabel = `${abbr}${description ? `, ${description}` : ""}, ${alreadyPerformed ? "0" : points} points${alreadyPerformed ? ", already performed" : ""}${disabled ? ", unavailable" : ""}${isCustom ? ", custom trick" : ""}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={hasHeat ? heatStyle : {}}
      className={`font-light text-base sm:text-lg tracking-wide px-3 py-3 sm:px-6 sm:py-4 rounded-lg transition-all duration-200 border relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
        disabled
          ? "bg-slate-900 text-gray-500 border-slate-800 cursor-not-allowed opacity-50"
          : alreadyPerformed
          ? "bg-slate-800 hover:bg-blue-800 text-gray-100 border-yellow-600 hover:border-yellow-500 hover:shadow-md hover:shadow-yellow-900/20"
          : hasHeat
          ? "text-white hover:opacity-90 hover:shadow-md"
          : "bg-slate-800 hover:bg-blue-800 text-gray-100 border-slate-700 hover:border-blue-700 hover:shadow-md hover:shadow-blue-900/20"
      }`}
    >
      <div className="text-sm sm:text-2xl font-medium">{abbr}</div>
      <div className={`text-xs sm:text-sm ${disabled ? "text-gray-500" : hasHeat ? "text-white/80" : "text-gray-300"}`}>
        {alreadyPerformed ? "0" : points} pts
      </div>
      {isCustom && (
        <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
          <span className={`text-[8px] sm:text-[10px] ${disabled ? "text-gray-600" : "text-teal-500"}`}>C</span>
        </div>
      )}
      {alreadyPerformed && (
        <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
          <span className={`text-xs ${disabled ? "text-gray-500" : "text-yellow-500"}`}>✓</span>
        </div>
      )}
    </button>
  );
}
