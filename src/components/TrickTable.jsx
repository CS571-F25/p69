export default function TrickTable({ title, tricks }) {
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-400 border-b border-slate-700 pb-2">
        {title}
      </h2>
      <table className="w-full text-sm sm:text-base border-collapse">
        <caption className="sr-only">{title} - trick codes and point values</caption>
        <thead>
          <tr className="bg-slate-800 border-b border-slate-700">
            <th scope="col" className="text-left p-1.5 sm:p-3 text-blue-400 font-bold">CODE</th>
            <th scope="col" className="text-left p-1.5 sm:p-3 text-blue-400 font-bold hidden md:table-cell">DESCRIPTION</th>
            <th scope="col" className="text-center p-1.5 sm:p-3 text-blue-400 font-bold hidden sm:table-cell">NO.</th>
            <th scope="col" className="text-center p-1.5 sm:p-3 text-blue-400 font-bold border-l border-slate-700 hidden sm:table-cell" colSpan="2">2 SKIS</th>
            <th scope="col" className="text-center p-1.5 sm:p-3 text-blue-400 font-bold border-l border-slate-700" colSpan="2">1 SKI</th>
          </tr>
          <tr className="bg-slate-800/50 border-b border-slate-700 text-sm">
            <th scope="col"></th>
            <th scope="col" className="hidden md:table-cell"></th>
            <th scope="col" className="hidden sm:table-cell"></th>
            <th scope="col" className="text-center p-1 sm:p-2 text-white font-semibold border-l border-slate-700 hidden sm:table-cell">B</th>
            <th scope="col" className="text-center p-1 sm:p-2 text-white font-semibold hidden sm:table-cell">R</th>
            <th scope="col" className="text-center p-1 sm:p-2 text-white font-semibold border-l border-slate-700">B</th>
            <th scope="col" className="text-center p-1 sm:p-2 text-white font-semibold">R</th>
          </tr>
        </thead>
        <tbody>
          {tricks.map((trick) => (
            <tr key={trick.code} className="border-b border-slate-700/50 hover:bg-slate-800/30">
              <td className="p-1.5 sm:p-3 font-mono text-blue-300 font-bold text-sm sm:text-base">{trick.code}</td>
              <td className="p-1.5 sm:p-3 text-white font-medium hidden md:table-cell">{trick.description}</td>
              <td className="p-1.5 sm:p-3 text-center text-white font-medium hidden sm:table-cell">{trick.no}</td>
              <td className="p-1.5 sm:p-3 text-center border-l border-slate-700/50 text-white font-medium hidden sm:table-cell">{trick.ski2Bas}</td>
              <td className="p-1.5 sm:p-3 text-center text-white font-medium hidden sm:table-cell">{trick.ski2Rev}</td>
              <td className="p-1.5 sm:p-3 text-center border-l border-slate-700/50 text-white font-medium">{trick.ski1Bas}</td>
              <td className="p-1.5 sm:p-3 text-center text-white font-medium">{trick.ski1Rev}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
