import { useState } from "react";
import { calculatePassTotal, formatTrickList } from "../utils/trickUtils.js";

// Compact trick list sidebar for calculator view
export default function TrickListSidebar({ pass1, pass2, currentPass }) {
  const [copied, setCopied] = useState(false);
  const pass1Total = calculatePassTotal(pass1);
  const pass2Total = calculatePassTotal(pass2);

  const handleCopy = async () => {
    const text = formatTrickList(pass1, pass2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTricks = pass1.length > 0 || pass2.length > 0;

  const renderTrickList = (tricks, passNum, total, isCurrent) => (
    <div className={`mb-3 ${isCurrent ? '' : 'opacity-70'}`}>
      <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-700">
        <span className="text-xs font-medium text-gray-300">Pass {passNum}</span>
        <span className="text-xs text-blue-400">{total}</span>
      </div>
      {tricks.length === 0 ? (
        <p className="text-gray-500 text-xs italic">No tricks yet</p>
      ) : (
        <div className="space-y-0 max-h-[180px] overflow-y-auto">
          {tricks.map((trick, index) => (
            <div
              key={`${trick.abbr}-${index}`}
              className="flex justify-between items-center text-xs py-0.5"
            >
              <div className="flex items-center gap-1">
                <span className="text-gray-500 w-3">{index + 1}.</span>
                <span className="font-medium text-gray-200 text-xs">{trick.abbr}</span>
              </div>
              <span className={`text-xs ${trick.points === 0 ? 'text-gray-500' : 'text-blue-400'}`}>
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
        <h3 className="text-sm font-medium text-gray-200">Trick List</h3>
        {hasTricks && (
          <button
            onClick={handleCopy}
            className="bg-slate-700 hover:bg-slate-600 text-gray-300 text-xs px-2 py-0.5 rounded border border-slate-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      {renderTrickList(pass1, 1, pass1Total, currentPass === 1)}
      {(currentPass === 2 || pass2.length > 0) && renderTrickList(pass2, 2, pass2Total, currentPass === 2)}
      <div className="pt-2 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-300">Total</span>
          <span className="text-xs font-medium text-green-400">{pass1Total + pass2Total}</span>
        </div>
      </div>
    </div>
  );
}
