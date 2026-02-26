import { useState } from "react";
import PassSection from "./PassSection.jsx";
import { calculatePassTotal, formatTrickList, copyToClipboard } from "../utils/trickUtils.js";

export default function TrickPass({ passes }) {
  const { pass1, pass2, pass1SkiCount, pass2SkiCount } = passes;
  const [copied, setCopied] = useState(false);

  const pass1Total = calculatePassTotal(pass1);
  const pass2Total = calculatePassTotal(pass2);
  const grandTotal = pass1Total + pass2Total;
  const flipCount = [...pass1, ...pass2].filter(t => t.abbr.includes("FL")).length;

  const handleCopy = async () => {
    const text = formatTrickList(pass1, pass2, pass1SkiCount, pass2SkiCount);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasTricks = pass1.length > 0 || pass2.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-2 py-4 sm:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Trick Pass</h1>
        {hasTricks && (
          <div aria-live="polite">
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copied to clipboard" : "Copy trick list to clipboard"}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-600 transition-colors"
            >
              {copied ? "Copied!" : "Copy Pass"}
            </button>
          </div>
        )}
      </div>

      {/* Grand Total Display */}
      <div className="bg-slate-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-semibold text-sm mb-1">Total Points</div>
            <div className="text-2xl sm:text-4xl font-bold tracking-wider text-blue-400">{grandTotal}</div>
          </div>
          {flipCount > 6 && (
            <div className="text-yellow-400 text-xs sm:text-sm font-bold text-right">
              ⚠ Exceeded 6 flip limit<br />({flipCount} flips)
            </div>
          )}
        </div>
      </div>

      {!hasTricks ? (
        <p className="text-white font-medium italic text-base">No tricks yet. Start adding tricks in the Calculator!</p>
      ) : (
        <>
          <div className={pass2.length > 0 ? "mb-4" : ""}>
            <PassSection
              title={pass2.length > 0 ? `Pass 1 (${pass1SkiCount} ski${pass1SkiCount !== 1 ? 's' : ''})` : (pass1SkiCount != null ? `${pass1SkiCount} ski${pass1SkiCount !== 1 ? 's' : ''}` : null)}
              tricks={pass1}
              total={pass1Total}
            />
          </div>

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
