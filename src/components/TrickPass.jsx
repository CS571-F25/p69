import { useState } from "react";
import PassSection from "./PassSection.jsx";
import { calculatePassTotal, formatTrickList } from "../utils/trickUtils.js";

export default function TrickPass({ passes }) {
  const { pass1, pass2, pass1SkiCount, pass2SkiCount } = passes;
  const [copied, setCopied] = useState(false);

  const pass1Total = calculatePassTotal(pass1);
  const pass2Total = calculatePassTotal(pass2);
  const grandTotal = pass1Total + pass2Total;

  const handleCopy = async () => {
    const text = formatTrickList(pass1, pass2, pass1SkiCount, pass2SkiCount);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTricks = pass1.length > 0 || pass2.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Trick Pass</h1>
        {hasTricks && (
          <div aria-live="polite">
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied to clipboard" : "Copy trick list to clipboard"}
              className="bg-slate-700 hover:bg-slate-600 text-gray-200 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-900"
            >
              {copied ? "Copied!" : "Copy List"}
            </button>
          </div>
        )}
      </div>

      {/* Grand Total Display */}
      <div className="bg-slate-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
        <div className="text-gray-400 text-xs mb-1">Total Points</div>
        <div className="text-2xl sm:text-4xl font-light tracking-wider text-blue-400">{grandTotal}</div>
      </div>

      {!hasTricks ? (
        <p className="text-gray-400 italic text-sm">No tricks yet. Start adding tricks in the Calculator!</p>
      ) : (
        <>
          {/* Pass 1 - no title if only one pass */}
          <div className={pass2.length > 0 ? "mb-4" : ""}>
            <PassSection
              title={pass2.length > 0 ? `Pass 1 (${pass1SkiCount} ski${pass1SkiCount !== 1 ? 's' : ''})` : (pass1SkiCount != null ? `${pass1SkiCount} ski${pass1SkiCount !== 1 ? 's' : ''}` : null)}
              tricks={pass1}
              total={pass1Total}
            />
          </div>

          {/* Pass 2 - only show if has tricks */}
          {pass2.length > 0 && (
            <PassSection
              title={`Pass 2 (${pass2SkiCount} ski${pass2SkiCount !== 1 ? 's' : ''})`}
              tricks={pass2}
              total={pass2Total}
            />
          )}
        </>
      )}
    </div>
  );
}
