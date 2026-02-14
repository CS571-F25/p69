import { useState } from "react";
import { calculatePassTotal, formatTrickList } from "../utils/trickUtils.js";

// Compact trick list sidebar for calculator view
export default function TrickListSidebar({ pass1, pass2, currentPass, pass1SkiCount, pass2SkiCount, recommendations }) {
  const [copied, setCopied] = useState(false);
  const pass1Total = calculatePassTotal(pass1);
  const pass2Total = calculatePassTotal(pass2);

  const handleCopy = async () => {
    const text = formatTrickList(pass1, pass2, pass1SkiCount, pass2SkiCount);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTricks = pass1.length > 0 || pass2.length > 0;

  const renderTrickList = (tricks, passNum, total, isCurrent, skiCount) => (
    <div className={`mb-3 ${isCurrent ? '' : 'opacity-70'}`}>
      <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-700">
        <span className="text-xs font-medium text-gray-300">
          Pass {passNum}{skiCount != null && <span className="text-gray-500"> ({skiCount} ski{skiCount !== 1 ? 's' : ''})</span>}
        </span>
        <span className="text-xs text-blue-400">{total}</span>
      </div>
      {tricks.length === 0 ? (
        <p className="text-gray-400 text-xs italic">No tricks yet</p>
      ) : (
        <div className="space-y-0">
          {tricks.map((trick, index) => (
            <div
              key={`${trick.abbr}-${index}`}
              className="flex justify-between items-center text-xs py-0.5"
            >
              <div className="flex items-center gap-1">
                <span className="text-gray-400 w-3">{index + 1}.</span>
                <span className="font-medium text-gray-200 text-xs">{trick.abbr}</span>
              </div>
              <span className={`text-xs ${trick.points === 0 ? 'text-gray-400' : 'text-blue-400'}`}>
                {trick.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 h-fit">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-gray-200">Trick List</h2>
        {hasTricks && (
          <div aria-live="polite">
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied to clipboard" : "Copy trick list to clipboard"}
              className="bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs px-2 py-0.5 rounded border border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-800"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
      {renderTrickList(pass1, 1, pass1Total, currentPass === 1, pass1SkiCount)}
      {(currentPass === 2 || pass2.length > 0) && renderTrickList(pass2, 2, pass2Total, currentPass === 2, pass2SkiCount)}
      <div className="pt-2 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-300">Total</span>
          <span className="text-xs font-medium text-green-400">{pass1Total + pass2Total}</span>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          {recommendations}
        </div>
      )}
    </div>
  );
}
