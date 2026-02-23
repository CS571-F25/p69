export function getHeatmapStyle(heatRank, heatTotal) {
  if (heatRank === undefined || heatTotal === 0) return {};

  const normalized = Math.min(heatRank / Math.max(heatTotal - 1, 1), 1);

  // Base colors: red (hot) -> blue (cool)
  const baseR = 239 - normalized * (239 - 59);
  const baseG = 68 + normalized * (130 - 68);
  const baseB = 68 + normalized * (246 - 68);

  // Blend 30% toward slate gray (100, 116, 139) to mute
  const mix = 0.3;
  const r = Math.round(baseR * (1 - mix) + 100 * mix);
  const g = Math.round(baseG * (1 - mix) + 116 * mix);
  const b = Math.round(baseB * (1 - mix) + 139 * mix);

  return {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    borderColor: `rgb(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)})`,
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
  // When heatmap is active, buttons with no rank get the coolest gradient color
  const heatmapActive = heatTotal > 0 && !disabled && !alreadyPerformed;
  const heatStyle = heatmapActive ? getHeatmapStyle(heatRank ?? heatTotal, heatTotal) : {};
  const hasHeat = heatmapActive;

  const ariaLabel = `${abbr}${description ? `, ${description}` : ""}, ${alreadyPerformed ? "0" : points} points${alreadyPerformed ? ", already performed" : ""}${disabled ? ", unavailable" : ""}${isCustom ? ", custom trick" : ""}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ ...(hasHeat ? heatStyle : {}), containerType: 'inline-size' }}
      className={`font-semibold px-1.5 py-2.5 sm:px-2 sm:py-3 rounded-lg transition-all duration-200 border relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900 ${
        disabled
          ? "bg-slate-900 text-white border-slate-800 cursor-not-allowed"
          : alreadyPerformed
          ? "text-white hover:opacity-90 hover:shadow-md [background-color:rgb(134,94,152)] [border-color:rgb(114,74,132)]"
          : hasHeat
          ? "text-white hover:opacity-90 hover:shadow-md"
          : "bg-slate-700 hover:bg-blue-800 text-white border-slate-600 hover:border-blue-700 hover:shadow-md hover:shadow-blue-900/20"
      }`}
    >
      <div className="font-bold leading-none" style={{ fontSize: `clamp(0.6rem, ${110 / Math.max(abbr.length, 1.5)}cqw, min(1.5rem + 1vw, 2.25rem))` }}>{abbr}</div>
      <div className="text-[10px] sm:text-xs whitespace-nowrap text-white mt-0.5">
        {alreadyPerformed ? "0" : points} pts
      </div>
      {isCustom && (
        <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
          <span className={`text-[8px] sm:text-[10px] ${disabled ? "text-white" : "text-teal-500"}`}>C</span>
        </div>
      )}
      {alreadyPerformed && (
        <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
          <span className="text-[8px] sm:text-xs text-white">✓</span>
        </div>
      )}
    </button>
  );
}
