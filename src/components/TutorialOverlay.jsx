import { useState, useLayoutEffect, useCallback } from "react";

export const ALL_STEPS = [
  { key: "score", title: "Score", text: (a) => `${a} the score to view your full trick pass.`, arrow: "up" },
  { key: "controls", title: "Controls", text: (a) => `${a} here to begin your second pass if you have one.`, arrow: "up" },
  { key: "ai", title: "AI Suggestions", text: (a) => `${a} a trick to add it. These are suggestions based on similar passes at your selected skill level.`, arrow: "up" },
  { key: "grid", title: "Trick Grid", text: (a) => `${a} to add your tricks. Grayed out tricks mean you can't do them from your position. The checkmark means that trick has already been done and won't give you additional points. ${a === "Tap" ? "Long press" : "Hover"} over a trick abbreviation for its full name.`, arrow: "down" },
  { key: "modifiers", title: "Modifiers", text: (a) => `${a} the tabs on the left and right side to goall to different trick categories.`, arrow: "down" },
  { key: "nc", title: "No Credit", text: (a) => `${a} here to enter any trick and score it as 0 points.`, arrow: "up" },
  { key: "reverse", title: "Reverse", text: () => `This will activate when you are eligible to reverse a trick.`, arrow: "up" },
  { key: "tabs", title: "Tabs", text: () => `You can navigate to the Trick Pass, Trick Guide, and About section here.`, arrow: "down", mobileOnly: true },
];

const action = window.matchMedia?.("(pointer: coarse)").matches ? "Tap" : "Click";

export default function TutorialOverlay({ step, steps, targetRef, onNext, onBack, onSkip }) {
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;
  const [pos, setPos] = useState({ opacity: 0, arrowStyles: [], arrow: "up" });

  const reposition = useCallback(() => {
    if (!targetRef?.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const pad = 10;
    const arrow = current.arrow;

    const base = { position: "fixed", opacity: 1, zIndex: 60 };

    if (arrow === "up") {
      base.top = rect.bottom + pad;
    } else {
      base.bottom = window.innerHeight - rect.top + pad;
    }

    let arrowStyles;
    if (current.key === "tabs") {
      base.left = 8;
      base.right = 8;
      const cardLeft = 8;
      arrowStyles = [{ left: rect.left + rect.width / 2 - cardLeft }];
    } else {
      base.maxWidth = 260;
      const targetCenterX = rect.left + rect.width / 2;
      const alignRight = targetCenterX / window.innerWidth > 0.6;

      if (alignRight) {
        base.right = window.innerWidth - targetCenterX - 20;
        arrowStyles = [{ right: 14 }];
      } else {
        base.left = Math.max(8, rect.left);
        arrowStyles = [{ left: 14 }];
      }
    }

    setPos({ ...base, arrowStyles, arrow });
  }, [targetRef, step, current.arrow, current.key]);

  useLayoutEffect(() => {
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [reposition]);

  const { arrowStyles, arrow, ...style } = pos;

  const arrows = (arrowStyles || []).map((aStyle, i) =>
    arrow === "up" ? (
      <div key={i} className="absolute -top-1.5 w-3 h-3 rotate-45 bg-slate-800 border-l border-t border-blue-500/50" style={aStyle} />
    ) : (
      <div key={i} className="absolute -bottom-1.5 w-3 h-3 rotate-45 bg-slate-800 border-r border-b border-blue-500/50" style={aStyle} />
    )
  );

  return (
    <>
      {/* Backdrop blocks all interactions including nav */}
      <div className="fixed inset-0 z-[55]" />
      <div style={style} className="pointer-events-auto">
        <div className="relative bg-slate-800 border border-blue-500/50 rounded-lg px-3.5 py-2.5 shadow-lg">
          {arrows}
          <button
            onClick={onSkip}
            aria-label="Close tutorial"
            className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-xs font-bold text-blue-400">{current.title}</span>
          <p className="text-[11px] text-white leading-relaxed mt-0.5 mb-2 pr-4">{current.text(action)}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === step ? "bg-blue-400" : i < step ? "bg-blue-600" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {!isFirst && (
                <button
                  onClick={onBack}
                  aria-label="Previous step"
                  className="p-1 rounded-md hover:bg-slate-700 text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}
              <button
                onClick={onNext}
                className="px-3.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
