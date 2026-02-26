export default function ToggleButton({
  active,
  disabled = false,
  onClick,
  children,
  variant = "blue",
  className = "",
  ariaLabel = "",
  style = {},
}) {
  const variantStyles = {
    blue: {
      active: "bg-blue-800 text-white border-blue-600 ring-2 ring-white",
      inactive: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
    },
    orange: {
      active: "bg-orange-700 text-white border-orange-500 ring-2 ring-white",
      inactive: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
    },
    purple: {
      active: "bg-purple-700 text-white border-purple-500 ring-2 ring-white",
      inactive: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
    },
    yellow: {
      active: "bg-yellow-700 text-white border-yellow-500 ring-2 ring-white",
      inactive: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
    },
    green: {
      active: "bg-green-900 text-white border-green-800 ring-2 ring-white",
      inactive: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
    },
    red: {
      active: "bg-red-900 text-white border-red-800 ring-2 ring-white",
      inactive: "bg-slate-800 text-white border-slate-700 hover:bg-slate-700",
    },
  };

  const baseStyles = "px-1.5 py-3 sm:px-2 sm:py-3.5 rounded-lg font-semibold text-base sm:text-lg text-center transition-all duration-200 border focus:outline-none";
  const disabledStyles = "bg-slate-900 text-white border-slate-800 cursor-not-allowed";
  const hasHeat = !disabled && style?.backgroundColor;

  const styles = variantStyles[variant] || variantStyles.blue;
  const stateStyles = disabled
    ? disabledStyles
    : hasHeat
    ? `text-white hover:opacity-90${active ? " ring-2 ring-white" : ""}`
    : (active ? styles.active : styles.inactive);

  return (
    <button
      onClick={(e) => { e.currentTarget.blur(); onClick?.(e); }}
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
