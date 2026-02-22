export default function StatsCard({ label, value, variant = "primary", size = "large" }) {
  const variantColors = {
    primary: "text-blue-400",
    secondary: "text-green-400",
  };

  const sizeStyles = {
    large: "text-3xl sm:text-5xl",
    medium: "text-xl sm:text-3xl",
  };

  if (size === "small") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-white font-semibold text-xs sm:text-sm">{label}:</span>
        <span className={`text-base sm:text-lg font-bold ${variantColors[variant]}`}>{value}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="text-white font-semibold text-sm sm:text-base mb-1">{label}</div>
      <div className={`${sizeStyles[size]} font-semibold tracking-wider ${variantColors[variant]}`}>
        {value}
      </div>
    </div>
  );
}
