// Reusable section card component
export default function Section({ title, children }) {
  return (
    <section className="bg-slate-800 rounded-lg p-4 sm:p-5 border border-slate-700">
      <h2 className="text-base sm:text-lg font-medium text-blue-400 mb-2 sm:mb-3">{title}</h2>
      {children}
    </section>
  );
}
