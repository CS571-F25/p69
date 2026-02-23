import { useState } from "react";
import { calculatePassTotal, formatTrickList, copyToClipboard } from "../utils/trickUtils.js";

export default function TrickListSidebar({ pass1, pass2, currentPass, pass1SkiCount, pass2SkiCount }) {
  const [copied, setCopied] = useState(false);
  const pass1Total = calculatePassTotal(pass1);
  const pass2Total = calculatePassTotal(pass2);

  const handleCopy = async () => {
    const text = formatTrickList(pass1, pass2, pass1SkiCount, pass2SkiCount);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasTricks = pass1.length > 0 || pass2.length > 0;

  const renderTrickList = (tricks, passNum, total, isCurrent, skiCount) => (
    <div className={`mb-3 ${isCurrent ? '' : 'opacity-90'}`}>
      <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-700">
        <span className="text-sm font-bold text-white">
          Pass {passNum}{skiCount != null && <span className="text-white"> ({skiCount} ski{skiCount !== 1 ? 's' : ''})</span>}
        </span>
        <span className="text-sm font-bold text-blue-400">{total}</span>
      </div>
      {tricks.length === 0 ? (
        <p className="text-white text-sm font-medium italic">No tricks yet</p>
      ) : (
        <div className="space-y-0">
          {tricks.map((trick, index) => (
            <div
              key={`${trick.abbr}-${index}`}
              className="flex justify-between items-center text-sm py-0.5"
            >
              <div className="flex items-center gap-1">
                <span className="text-white w-4">{index + 1}.</span>
                <span className="font-bold text-white text-sm">{trick.abbr}</span>
              </div>
              <span className={`text-sm font-semibold ${trick.points === 0 ? 'text-white' : 'text-blue-400'}`}>
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
        <h2 className="text-base font-bold text-white">Trick List</h2>
        {hasTricks && (
          <div aria-live="polite">
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied to clipboard" : "Copy trick list to clipboard"}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-2 py-0.5 rounded border border-slate-600 transition-colors"
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
          <span className="text-sm font-bold text-white">Total</span>
          <span className="text-sm font-bold text-green-400">{pass1Total + pass2Total}</span>
        </div>
      </div>
    </div>
  );
}
