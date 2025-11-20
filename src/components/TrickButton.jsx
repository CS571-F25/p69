export default function TrickButton({ abbr, points, onClick, disabled = false, alreadyPerformed = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-light text-lg tracking-wide px-6 py-4 rounded-lg transition-all duration-200 border relative ${
        disabled
          ? "bg-slate-900 text-gray-600 border-slate-800 cursor-not-allowed opacity-50"
          : alreadyPerformed
          ? "bg-slate-800 hover:bg-blue-800 text-gray-100 border-yellow-600 hover:border-yellow-500 hover:shadow-md hover:shadow-yellow-900/20"
          : "bg-slate-800 hover:bg-blue-800 text-gray-100 border-slate-700 hover:border-blue-700 hover:shadow-md hover:shadow-blue-900/20"
      }`}
    >
      <div className="text-2xl font-medium">{abbr}</div>
      <div className={`text-sm ${disabled ? "text-gray-600" : "text-gray-400"}`}>
        {alreadyPerformed ? "0" : points} pts
      </div>
      {alreadyPerformed && (
        <div className="absolute top-1 right-1">
          <span className={`text-xs ${disabled ? "text-gray-600" : "text-yellow-500"}`}>✓</span>
        </div>
      )}
    </button>
  );
}
