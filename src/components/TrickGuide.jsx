import { Capacitor } from "@capacitor/core";
import trickRulesPdf from "../assets/iwwf2025trickrules.pdf";
import TrickTable from "./TrickTable.jsx";

// Trick data for guide display
const surfaceTurns = [
  { code: "S", description: "Side Slide", no: "1", ski2Bas: 20, ski2Rev: 20, ski1Bas: 40, ski1Rev: 40 },
  { code: "TS", description: "Toehold side slide", no: "2", ski2Bas: "-", ski2Rev: "-", ski1Bas: 130, ski1Rev: 130 },
  { code: "B", description: "180 F-B", no: "3", ski2Bas: 30, ski2Rev: 30, ski1Bas: 60, ski1Rev: 60 },
  { code: "F", description: "B-F", no: "4", ski2Bas: 30, ski2Rev: 30, ski1Bas: 60, ski1Rev: 60 },
  { code: "O", description: "360 F-F", no: "5a", ski2Bas: 40, ski2Rev: 40, ski1Bas: 90, ski1Rev: 90 },
  { code: "BB", description: "B-B", no: "5b", ski2Bas: 40, ski2Rev: 40, ski1Bas: 90, ski1Rev: 90 },
  { code: "5B", description: "540 F-B", no: "5c", ski2Bas: 50, ski2Rev: 50, ski1Bas: 110, ski1Rev: 110 },
  { code: "5F", description: "B-F", no: "5d", ski2Bas: 50, ski2Rev: 50, ski1Bas: 110, ski1Rev: 110 },
  { code: "7F", description: "720 F-F", no: "5e", ski2Bas: 60, ski2Rev: 60, ski1Bas: 130, ski1Rev: 130 },
  { code: "7B", description: "B-B", no: "5f", ski2Bas: 60, ski2Rev: 60, ski1Bas: 130, ski1Rev: 130 },
  { code: "LB", description: "180 F-B Stepover", no: "6", ski2Bas: 70, ski2Rev: 70, ski1Bas: 110, ski1Rev: "-" },
  { code: "LF", description: "B-F Stepover", no: "7", ski2Bas: 70, ski2Rev: 70, ski1Bas: 110, ski1Rev: "-" },
  { code: "TB", description: "180 F-B Toehold", no: "8", ski2Bas: "-", ski2Rev: "-", ski1Bas: 100, ski1Rev: 100 },
  { code: "TF", description: "B-F Toehold", no: "9", ski2Bas: "-", ski2Rev: "-", ski1Bas: 100, ski1Rev: 100 },
  { code: "TO", description: "360 F-F Toehold", no: "10", ski2Bas: "-", ski2Rev: "-", ski1Bas: 200, ski1Rev: 200 },
  { code: "TBB", description: "B-B Toehold", no: "11", ski2Bas: "-", ski2Rev: "-", ski1Bas: 200, ski1Rev: 200 },
  { code: "T5B", description: "540 F-B Toehold", no: "12", ski2Bas: "-", ski2Rev: "-", ski1Bas: 350, ski1Rev: 350 },
  { code: "T7F", description: "720 F-F Toehold", no: "-", ski2Bas: "-", ski2Rev: "-", ski1Bas: 450, ski1Rev: "-" },
  { code: "T5F", description: "540 B-F Toehold", no: "13", ski2Bas: "-", ski2Rev: "-", ski1Bas: 350, ski1Rev: "-" },
];

const wakeTurns = [
  { code: "WB", description: "180 F-B", no: "14", ski2Bas: 50, ski2Rev: 50, ski1Bas: 80, ski1Rev: 80 },
  { code: "WF", description: "B-F", no: "15", ski2Bas: 50, ski2Rev: 50, ski1Bas: 80, ski1Rev: 80 },
  { code: "WO", description: "360 F-F", no: "16", ski2Bas: 110, ski2Rev: 110, ski1Bas: 150, ski1Rev: 150 },
  { code: "WBB", description: "B-B", no: "17", ski2Bas: 110, ski2Rev: 110, ski1Bas: 150, ski1Rev: 150 },
  { code: "W5B", description: "540 F-B", no: "18", ski2Bas: 310, ski2Rev: 310, ski1Bas: 310, ski1Rev: 310 },
  { code: "W5F", description: "B-F", no: "19", ski2Bas: 310, ski2Rev: 310, ski1Bas: 310, ski1Rev: 310 },
  { code: "W7F", description: "720 F-F", no: "20", ski2Bas: 800, ski2Rev: 800, ski1Bas: 800, ski1Rev: 800 },
  { code: "W7B", description: "B-B", no: "21", ski2Bas: 480, ski2Rev: 480, ski1Bas: 480, ski1Rev: 480 },
  { code: "W9B", description: "900 F-B", no: "22", ski2Bas: 850, ski2Rev: 850, ski1Bas: 850, ski1Rev: 850 },
  { code: "W9F", description: "B-F", no: "-", ski2Bas: 850, ski2Rev: 850, ski1Bas: 850, ski1Rev: 850 },
  { code: "WLB", description: "180 F-B Stepover", no: "23", ski2Bas: 110, ski2Rev: 110, ski1Bas: 160, ski1Rev: "-" },
  { code: "WLF", description: "B-F Stepover", no: "24", ski2Bas: 110, ski2Rev: 110, ski1Bas: 160, ski1Rev: "-" },
  { code: "WLO", description: "360 F-F Stepover", no: "25", ski2Bas: 200, ski2Rev: 200, ski1Bas: 260, ski1Rev: 260 },
  { code: "WLBB", description: "B-B Stepover", no: "26", ski2Bas: 200, ski2Rev: 200, ski1Bas: 260, ski1Rev: 260 },
  { code: "WL5B", description: "540 F-B Stepover", no: "27", ski2Bas: 300, ski2Rev: 300, ski1Bas: 420, ski1Rev: 420 },
  { code: "WL5LB", description: "F-B Double Stepover", no: "-", ski2Bas: "-", ski2Rev: "-", ski1Bas: 500, ski1Rev: 500 },
  { code: "WL7F", description: "720 F-F Stepover", no: "27a", ski2Bas: 700, ski2Rev: 700, ski1Bas: 700, ski1Rev: 700 },
  { code: "WL9B", description: "900 F-B Stepover", no: "27b", ski2Bas: 800, ski2Rev: 800, ski1Bas: 800, ski1Rev: 800 },
  { code: "WL5F", description: "540 B-F Stepover", no: "28", ski2Bas: 300, ski2Rev: 300, ski1Bas: 420, ski1Rev: 420 },
  { code: "WL5LF", description: "B-F Double Stepover", no: "-", ski2Bas: "-", ski2Rev: "-", ski1Bas: 500, ski1Rev: 500 },
  { code: "WL7B", description: "720 B-B Stepover", no: "-", ski2Bas: 550, ski2Rev: 550, ski1Bas: 550, ski1Rev: 550 },
  { code: "WL9F", description: "900 B-F Stepover", no: "28a", ski2Bas: 800, ski2Rev: 800, ski1Bas: 800, ski1Rev: 800 },
  { code: "TWB", description: "180 F-B Toehold", no: "29", ski2Bas: "-", ski2Rev: "-", ski1Bas: 150, ski1Rev: 150 },
  { code: "TWF", description: "B-F Toehold", no: "30", ski2Bas: "-", ski2Rev: "-", ski1Bas: 150, ski1Rev: 150 },
  { code: "TWO", description: "360 F-F Toehold", no: "31", ski2Bas: "-", ski2Rev: "-", ski1Bas: 300, ski1Rev: 300 },
  { code: "TWBB", description: "B-B Toehold", no: "32", ski2Bas: "-", ski2Rev: "-", ski1Bas: 330, ski1Rev: 330 },
  { code: "TW5B", description: "540 F-B Toehold", no: "33", ski2Bas: "-", ski2Rev: "-", ski1Bas: 500, ski1Rev: 500 },
  { code: "TW5F", description: "B-F Toehold", no: "34", ski2Bas: "-", ski2Rev: "-", ski1Bas: 500, ski1Rev: "-" },
  { code: "TW7F", description: "720 F-F Toehold", no: "35", ski2Bas: "-", ski2Rev: "-", ski1Bas: 650, ski1Rev: 650 },
  { code: "TW7B", description: "B-B Toehold", no: "36", ski2Bas: "-", ski2Rev: "-", ski1Bas: 650, ski1Rev: "-" },
  { code: "TWLB", description: "180 F-B Toehold Stepover", no: "37", ski2Bas: "-", ski2Rev: "-", ski1Bas: 320, ski1Rev: "-" },
  { code: "TWLF", description: "B-F Toehold Stepover", no: "38", ski2Bas: "-", ski2Rev: "-", ski1Bas: 380, ski1Rev: "-" },
  { code: "TWLO", description: "360 F-F Toehold Stepover", no: "39", ski2Bas: "-", ski2Rev: "-", ski1Bas: 480, ski1Rev: 480 },
  { code: "TWLBB", description: "B-B Toehold Stepover", no: "40", ski2Bas: "-", ski2Rev: "-", ski1Bas: 480, ski1Rev: 480 },
  { code: "TWL5B", description: "540 F-B Toehold Stepover", no: "41", ski2Bas: "-", ski2Rev: "-", ski1Bas: 600, ski1Rev: 600 },
  { code: "TWL5F", description: "B-F Toehold Stepover", no: "42", ski2Bas: "-", ski2Rev: "-", ski1Bas: 700, ski1Rev: "-" },
  { code: "TWL7F", description: "720 F-F Toehold Stepover", no: "42a", ski2Bas: "-", ski2Rev: "-", ski1Bas: 800, ski1Rev: "-" },
  { code: "SLB", description: "F-B Ski Line", no: "43", ski2Bas: "-", ski2Rev: "-", ski1Bas: 350, ski1Rev: 350 },
  { code: "SLF", description: "B-F Ski Line", no: "44", ski2Bas: "-", ski2Rev: "-", ski1Bas: 400, ski1Rev: 400 },
  { code: "SLO", description: "360 F-F Ski Line", no: "45", ski2Bas: "-", ski2Rev: "-", ski1Bas: 400, ski1Rev: 400 },
  { code: "SLBB", description: "B-B Ski Line", no: "46", ski2Bas: "-", ski2Rev: "-", ski1Bas: 450, ski1Rev: 450 },
  { code: "SL5B", description: "540 F-B Ski Line", no: "47", ski2Bas: "-", ski2Rev: "-", ski1Bas: 550, ski1Rev: 550 },
  { code: "SL5F", description: "B-F Ski Line", no: "48", ski2Bas: "-", ski2Rev: "-", ski1Bas: 550, ski1Rev: 550 },
  { code: "SL7B", description: "720 B-B Ski Line", no: "49", ski2Bas: "-", ski2Rev: "-", ski1Bas: 750, ski1Rev: 750 },
  { code: "SL7F", description: "F-F Ski Line", no: "50", ski2Bas: "-", ski2Rev: "-", ski1Bas: 800, ski1Rev: 800 },
];

const flips = [
  { code: "DBFL", description: "Wake Double Flip", no: "51", ski2Bas: 1000, ski2Rev: "-", ski1Bas: 1000, ski1Rev: "-" },
  { code: "BFL/WFLIPB", description: "Backward Somersault", no: "52", ski2Bas: 500, ski2Rev: 500, ski1Bas: 500, ski1Rev: 500 },
  { code: "BFLB", description: "180 Wake Flip Half Twist F-B", no: "53", ski2Bas: 750, ski2Rev: 750, ski1Bas: 750, ski1Rev: 750 },
  { code: "BFLF", description: "180 Wake Flip Half Twist B-F", no: "54", ski2Bas: "-", ski2Rev: "-", ski1Bas: 550, ski1Rev: 550 },
  { code: "BFLBB", description: "360 Wake Flip Full Twist B-B", no: "55", ski2Bas: 800, ski2Rev: "-", ski1Bas: 800, ski1Rev: 800 },
  { code: "BFLO", description: "360 Wake Flip Full Twist F-F", no: "56", ski2Bas: "-", ski2Rev: "-", ski1Bas: 800, ski1Rev: 800 },
  { code: "BFL5B*", description: "540 Wake Flip Twist with 540 F-B", no: "57", ski2Bas: "-", ski2Rev: "-", ski1Bas: 900, ski1Rev: 900 },
  { code: "BFL5F*", description: "540 Wake Flip Twist with 540 B-F", no: "58", ski2Bas: "-", ski2Rev: "-", ski1Bas: 850, ski1Rev: 850 },
  { code: "FFL/WFLIPF", description: "Forward Somersault", no: "59", ski2Bas: 800, ski2Rev: 800, ski1Bas: 800, ski1Rev: 800 },
  { code: "FFLB", description: "180 Forward Somersault with 180 F-B", no: "60", ski2Bas: 850, ski2Rev: "-", ski1Bas: 850, ski1Rev: "-" },
  { code: "FFLF", description: "180 Forward Somersault with 180 B-F", no: "61", ski2Bas: 850, ski2Rev: "-", ski1Bas: 850, ski1Rev: 850 },
  { code: "FFLBB", description: "360 Forward Somersault with 360 B-B", no: "62", ski2Bas: 900, ski2Rev: "-", ski1Bas: 900, ski1Rev: "-" },
  { code: "FFL5F", description: "540 Forward Somersault with 540 B-F", no: "63", ski2Bas: 950, ski2Rev: "-", ski1Bas: 950, ski1Rev: "-" },
  { code: "BFLLB", description: "180 Wake Flip Twist Line Back", no: "64", ski2Bas: 800, ski2Rev: 800, ski1Bas: 800, ski1Rev: 800 },
  { code: "BFLSLB", description: "180 Wake Flip Ski Line with 180 F-B", no: "65", ski2Bas: "-", ski2Rev: "-", ski1Bas: 850, ski1Rev: "-" },
  { code: "BFLSLBB", description: "360 Wake Flip Ski Line with 360 B-B", no: "66", ski2Bas: 900, ski2Rev: "-", ski1Bas: 900, ski1Rev: "-" },
  { code: "BFLSLO", description: "360 Wake Flip Ski Line with 360 F-F", no: "67", ski2Bas: "-", ski2Rev: "-", ski1Bas: 900, ski1Rev: "-" },
  { code: "BFLSL5F", description: "540 Wake Flip Ski Line with 540 B-F", no: "68", ski2Bas: 950, ski2Rev: "-", ski1Bas: 950, ski1Rev: "-" },
  { code: "FFLSL5F", description: "540 Forward Somersault Ski Line with 540 B-F", no: "69", ski2Bas: "-", ski2Rev: "-", ski1Bas: 950, ski1Rev: "-" },
];

export default function TrickGuide() {
  const handlePdfClick = async (e) => {
    if (Capacitor.isNativePlatform()) {
      e.preventDefault();
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: "https://iwwf.sport/wp-content/uploads/2025/04/IWWF-World-Waterski-Rules-2025_20250408.pdf" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 sm:p-6">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-white">Trick Guide</h1>
      <p className="text-white font-semibold mb-2 text-sm sm:text-base">IWWF Waterski Rules 2025</p>
      <a
        href={trickRulesPdf}
        onClick={handlePdfClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View Full IWWF 2025 Trick Rules PDF (opens in new tab)"
        className="inline-block mb-4 sm:mb-6 bg-blue-900 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base tracking-wide px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all duration-200 border border-blue-800 hover:border-blue-600"
      >
        View Full IWWF 2025 Trick Rules PDF
      </a>

      <TrickTable title="SURFACE TURNS" tricks={surfaceTurns} />
      <TrickTable title="WAKE TURNS" tricks={wakeTurns} />
      <TrickTable title="FLIPS" tricks={flips} />

      {/* Notes */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
        <p className="text-white font-medium text-sm sm:text-base">
          <span className="font-bold text-blue-400">*</span> The Flip with a 540 degrees rotation or more must be done hand-to-hand. The rope may not be wrapped around the body to assist the turn. This does not prohibit the simple back position wrap where the rope does not go around the body.
        </p>
        <div className="border-t border-slate-700 pt-2 sm:pt-3">
          <p className="text-white font-semibold text-sm sm:text-base mb-2">When calling trick runs, the following substitutions will be allowed:</p>
          <ul className="text-white font-medium text-sm space-y-1 ml-3 sm:ml-4">
            <li>a) A reverse turn may be indicated by the letter "R" alone</li>
            <li>b) SS may be used for S in trick numbers 1 & 2</li>
            <li>c) OB may be used for BB in all tricks where it is normally used (#5b, 11, 17, 26, 32, 40, 48)</li>
            <li>d) T5B may be used to indicate a RT5B when it immediately follows a T7F</li>
            <li>e) An R for reverse turns may precede or follow the trick code.</li>
            <li>f) The following variations will be allowed:</li>
            <ul className="ml-3 sm:ml-4 mt-1">
              <li>- WTS for TS or RTS in #2</li>
              <li>- T7 for T7F in #12</li>
              <li>- BB for B in #'s 5f, 21, 28, 36 & 51</li>
              <li>- FLP or FL or FP for FLIP</li>
              <li>- Any transposition of the letters WTB/WTF and WBflip</li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
}
