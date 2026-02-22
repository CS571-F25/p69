export default function PassSection({ title, tricks, total }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
      {title && (
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
          <span className="text-blue-400 font-bold text-base">{total} pts</span>
        </div>
      )}
      {!title && (
        <div className="flex justify-end mb-2 sm:mb-3">
          <span className="text-blue-400 font-bold text-base">{total} pts</span>
        </div>
      )}
      <div className="space-y-1">
        {tricks.map((trick, index) => (
          <div
            key={`${trick.abbr}-${index}`}
            className="flex justify-between items-center bg-slate-900 p-1.5 sm:p-2 rounded border border-slate-700"
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">{index + 1}.</span>
              <span className="text-base sm:text-lg font-bold text-white">{trick.abbr}</span>
            </div>
            <span className={`font-semibold text-sm sm:text-base ${trick.points === 0 ? 'text-white' : 'text-blue-400'}`}>
              {trick.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
