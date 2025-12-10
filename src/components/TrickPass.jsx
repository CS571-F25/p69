import { useState } from "react";
import PassSection from "./PassSection.jsx";

export function formatTrickList(pass1, pass2) {
  const pass1Total = pass1.reduce((sum, trick) => sum + trick.points, 0);
  const pass2Total = pass2.reduce((sum, trick) => sum + trick.points, 0);
  const grandTotal = pass1Total + pass2Total;

  let text = "TRICK PASS\n";
  text += "══════════\n\n";

  if (pass1.length > 0) {
    text += `Pass 1 (${pass1Total} pts)\n`;
    text += pass1.map((t, i) => `  ${i + 1}. ${t.abbr} - ${t.points}`).join("\n");
    text += "\n";
  }

  if (pass2.length > 0) {
    text += `\nPass 2 (${pass2Total} pts)\n`;
    text += pass2.map((t, i) => `  ${i + 1}. ${t.abbr} - ${t.points}`).join("\n");
    text += "\n";
  }

  text += `\n──────────\nTOTAL: ${grandTotal} pts`;

  return text;
}

export default function TrickPass({ passes }) {
  const { pass1, pass2 } = passes;
  const [copied, setCopied] = useState(false);

  const pass1Total = pass1.reduce((sum, trick) => sum + trick.points, 0);
  const pass2Total = pass2.reduce((sum, trick) => sum + trick.points, 0);
  const grandTotal = pass1Total + pass2Total;

  const handleCopy = async () => {
    const text = formatTrickList(pass1, pass2);
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
          <button
            onClick={handleCopy}
            className="bg-slate-700 hover:bg-slate-600 text-gray-200 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy List"}
          </button>
        )}
      </div>

      {/* Grand Total Display */}
      <div className="bg-slate-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
        <div className="text-gray-400 text-xs mb-1">Total Points</div>
        <div className="text-2xl sm:text-4xl font-light tracking-wider text-blue-400">{grandTotal}</div>
      </div>

      {!hasTricks ? (
        <p className="text-gray-500 italic text-sm">No tricks yet. Start adding tricks in the Calculator!</p>
      ) : (
        <>
          {/* Pass 1 - no title if only one pass */}
          <div className={pass2.length > 0 ? "mb-4" : ""}>
            <PassSection
              title={pass2.length > 0 ? "Pass 1" : null}
              tricks={pass1}
              total={pass1Total}
            />
          </div>

          {/* Pass 2 - only show if has tricks */}
          {pass2.length > 0 && (
            <PassSection
              title="Pass 2"
              tricks={pass2}
              total={pass2Total}
            />
          )}
        </>
      )}
    </div>
  );
}
