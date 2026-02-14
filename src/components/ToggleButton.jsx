// Reusable toggle button component with consistent styling
export default function ToggleButton({
  active,
  disabled = false,
  onClick,
  children,
  variant = "blue", // blue, orange, purple, yellow, green, red
  className = "",
  ariaLabel = "",
  style = {},
}) {
  const variantStyles = {
    blue: {
      active: "bg-blue-800 text-gray-100 border-blue-600 ring-2 ring-white",
      inactive: "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-gray-200",
    },
    orange: {
      active: "bg-orange-700 text-gray-100 border-orange-500 ring-2 ring-white",
      inactive: "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-gray-200",
    },
    purple: {
      active: "bg-purple-700 text-gray-100 border-purple-500 ring-2 ring-white",
      inactive: "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-gray-200",
    },
    yellow: {
      active: "bg-yellow-700 text-gray-100 border-yellow-500 ring-2 ring-white",
      inactive: "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-gray-200",
    },
    green: {
      active: "bg-green-800 text-gray-100 border-green-600 ring-2 ring-white",
      inactive: "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-gray-200",
    },
    red: {
      active: "bg-red-900 text-gray-100 border-red-800 ring-2 ring-white",
      inactive: "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700 hover:text-gray-200",
    },
  };

  const baseStyles = "px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg font-light text-sm sm:text-sm tracking-wide transition-all duration-200 border whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-0";
  const disabledStyles = "bg-slate-900 text-gray-500 border-slate-800 cursor-not-allowed opacity-50";
  const hasHeat = !disabled && style?.backgroundColor;

  const styles = variantStyles[variant] || variantStyles.blue;
  const stateStyles = disabled
    ? disabledStyles
    : hasHeat
    ? `text-white hover:opacity-90${active ? " ring-2 ring-white" : ""}`
    : (active ? styles.active : styles.inactive);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={ariaLabel || undefined}
      style={hasHeat ? style : {}}
      className={`${baseStyles} ${stateStyles} ${className}`}
    >
      {children}
    </button>
  );
}
