// Reusable trick table component for TrickGuide
export default function TrickTable({ title, tricks }) {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-light mb-3 sm:mb-4 text-blue-400 border-b border-slate-700 pb-2">
        {title}
      </h2>
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700">
            <th className="text-left p-1.5 sm:p-3 text-blue-400 font-medium">CODE</th>
            <th className="text-left p-1.5 sm:p-3 text-blue-400 font-medium hidden md:table-cell">DESCRIPTION</th>
            <th className="text-center p-1.5 sm:p-3 text-blue-400 font-medium hidden sm:table-cell">NO.</th>
            <th className="text-center p-1.5 sm:p-3 text-blue-400 font-medium border-l border-slate-700 hidden sm:table-cell" colSpan="2">2 SKIS</th>
            <th className="text-center p-1.5 sm:p-3 text-blue-400 font-medium border-l border-slate-700" colSpan="2">1 SKI</th>
          </tr>
          <tr className="bg-slate-800/50 border-b border-slate-700 text-xs">
            <th></th>
            <th className="hidden md:table-cell"></th>
            <th className="hidden sm:table-cell"></th>
            <th className="text-center p-1 sm:p-2 text-gray-400 border-l border-slate-700 hidden sm:table-cell">B</th>
            <th className="text-center p-1 sm:p-2 text-gray-400 hidden sm:table-cell">R</th>
            <th className="text-center p-1 sm:p-2 text-gray-400 border-l border-slate-700">B</th>
            <th className="text-center p-1 sm:p-2 text-gray-400">R</th>
          </tr>
        </thead>
        <tbody>
          {tricks.map((trick) => (
            <tr key={trick.code} className="border-b border-slate-700/50 hover:bg-slate-800/30">
              <td className="p-1.5 sm:p-3 font-mono text-blue-300 font-medium text-xs sm:text-sm">{trick.code}</td>
              <td className="p-1.5 sm:p-3 text-gray-300 hidden md:table-cell">{trick.description}</td>
              <td className="p-1.5 sm:p-3 text-center text-gray-400 hidden sm:table-cell">{trick.no}</td>
              <td className="p-1.5 sm:p-3 text-center border-l border-slate-700/50 text-gray-200 hidden sm:table-cell">{trick.ski2Bas}</td>
              <td className="p-1.5 sm:p-3 text-center text-gray-200 hidden sm:table-cell">{trick.ski2Rev}</td>
              <td className="p-1.5 sm:p-3 text-center border-l border-slate-700/50 text-gray-200">{trick.ski1Bas}</td>
              <td className="p-1.5 sm:p-3 text-center text-gray-200">{trick.ski1Rev}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
