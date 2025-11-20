export default function TrickPass({ trickList }) {
  const total = trickList.reduce((sum, trick) => sum + trick.points, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Trick Pass</h1>

      {/* Total Display */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
        <div className="text-gray-400 text-sm mb-1">Total Points</div>
        <div className="text-5xl font-light tracking-wider text-blue-400">{total}</div>
      </div>

      {/* Trick List */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-light mb-4 text-gray-300">Your Run</h2>
        {trickList.length === 0 ? (
          <p className="text-gray-500 italic">No tricks yet. Start adding tricks in the Calculator!</p>
        ) : (
          <div className="space-y-2">
            {trickList.map((trick, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 font-mono text-sm">{index + 1}.</span>
                  <span className="text-2xl font-medium">{trick.abbr}</span>
                </div>
                <span className="text-blue-400 font-light">{trick.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  