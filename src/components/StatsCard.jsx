// Reusable stats display card component
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
        <span className="text-gray-400 text-[10px] sm:text-xs">{label}:</span>
        <span className={`text-sm sm:text-base font-medium ${variantColors[variant]}`}>{value}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="text-gray-400 text-xs sm:text-sm mb-1">{label}</div>
      <div className={`${sizeStyles[size]} font-light tracking-wider ${variantColors[variant]}`}>
        {value}
      </div>
    </div>
  );
}
