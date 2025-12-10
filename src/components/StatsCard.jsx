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

  return (
    <div>
      <div className="text-gray-400 text-xs sm:text-sm mb-1">{label}</div>
      <div className={`${sizeStyles[size]} font-light tracking-wider ${variantColors[variant]}`}>
        {value}
      </div>
    </div>
  );
}
