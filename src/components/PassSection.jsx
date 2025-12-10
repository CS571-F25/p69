// Reusable pass section component for TrickPass display
export default function PassSection({ title, tricks, total }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
      {title && (
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <h2 className="text-sm sm:text-base font-light text-gray-300">{title}</h2>
          <span className="text-blue-400 font-light text-sm">{total} pts</span>
        </div>
      )}
      {!title && (
        <div className="flex justify-end mb-2 sm:mb-3">
          <span className="text-blue-400 font-light text-sm">{total} pts</span>
        </div>
      )}
      <div className="space-y-1">
        {tricks.map((trick, index) => (
          <div
            key={`${trick.abbr}-${index}`}
            className="flex justify-between items-center bg-slate-900 p-1.5 sm:p-2 rounded border border-slate-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-xs">{index + 1}.</span>
              <span className="text-sm sm:text-base font-medium">{trick.abbr}</span>
            </div>
            <span className={`font-light text-xs sm:text-sm ${trick.points === 0 ? 'text-gray-500' : 'text-blue-400'}`}>
              {trick.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
