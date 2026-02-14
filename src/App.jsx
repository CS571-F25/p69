import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import NavLink from "./components/NavLink.jsx";
import Calculator from "./components/Calculator.jsx";
import TrickPass from "./components/TrickPass.jsx";
import TrickGuide from "./components/TrickGuide.jsx";
import About from "./components/About.jsx";

// Initial calculator state
const getInitialCalcState = () => ({
  orientation: "front",
  skiCount: 1,
  lastReversibleTrick: null,
  secondLastReversibleTrick: null,
  modifier: "spins",
  isWake: false,
  isToe: false,
  noCredit: false,
  passStarted: false,
});

export default function App() {
  // Track tricks for current pass being edited
  const [currentPassTricks, setCurrentPassTricks] = useState([]);
  // Track which pass we're on (1 or 2)
  const [currentPass, setCurrentPass] = useState(1);
  // Store completed passes (array of arrays)
  const [completedPasses, setCompletedPasses] = useState([]);
  // Skill level (persists in localStorage)
  const [skillLevel, setSkillLevel] = useState(() => localStorage.getItem("skillLevel") || "advanced");
  const handleSkillLevelChange = (level) => {
    setSkillLevel(level);
    localStorage.setItem("skillLevel", level);
  };
  // Custom tricks (persists in localStorage)
  const [customTricks, setCustomTricks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customTricks")) || [];
    } catch { return []; }
  });
  const addCustomTrick = (trick) => {
    const updated = [...customTricks, { ...trick, id: crypto.randomUUID() }];
    setCustomTricks(updated);
    localStorage.setItem("customTricks", JSON.stringify(updated));
  };
  const removeCustomTrick = (id) => {
    const updated = customTricks.filter(t => t.id !== id);
    setCustomTricks(updated);
    localStorage.setItem("customTricks", JSON.stringify(updated));
  };
  const updateCustomTrick = (id, data) => {
    const updated = customTricks.map(t => t.id === id ? { ...data, id } : t);
    setCustomTricks(updated);
    localStorage.setItem("customTricks", JSON.stringify(updated));
  };
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: "#0f172a" }).catch(() => {});
      }).catch(() => {});
    }
  }, []);

  // Calculator state (persists across tab switches)
  const [calcState, setCalcState] = useState(getInitialCalcState());
  // Calculator state history for undo
  const [calcStateHistory, setCalcStateHistory] = useState([]);

  const addTrick = (trick) => {
    setCurrentPassTricks([...currentPassTricks, trick]);
  };

  const undoTrick = () => {
    if (currentPassTricks.length > 0) {
      setCurrentPassTricks(currentPassTricks.slice(0, -1));
      return true;
    }
    return false;
  };

  // Store ski count for completed pass 1
  const [pass1SkiCount, setPass1SkiCount] = useState(null);

  const startSecondPass = () => {
    if (currentPass === 1 && currentPassTricks.length > 0) {
      setPass1SkiCount(calcState.skiCount);
      setCompletedPasses([currentPassTricks]);
      setCurrentPassTricks([]);
      setCurrentPass(2);
      setCalcState(getInitialCalcState());
      setCalcStateHistory([]);
    }
  };

  const clearAll = () => {
    setCurrentPassTricks([]);
    setCompletedPasses([]);
    setCurrentPass(1);
    setPass1SkiCount(null);
    setCalcState(getInitialCalcState());
    setCalcStateHistory([]);
  };

  const clearCurrentPass = () => {
    setCurrentPassTricks([]);
    setCalcState(getInitialCalcState());
    setCalcStateHistory([]);
  };

  // Get all tricks from all passes for duplicate checking
  const getAllTricks = () => {
    return [...completedPasses.flat(), ...currentPassTricks];
  };

  // Get all tricks for display in TrickPass
  const getAllPassesForDisplay = () => {
    if (currentPass === 1) {
      return { pass1: currentPassTricks, pass2: [], pass1SkiCount: calcState.skiCount, pass2SkiCount: null };
    } else {
      return { pass1: completedPasses[0] || [], pass2: currentPassTricks, pass1SkiCount, pass2SkiCount: calcState.skiCount };
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:relative px-3 pt-8 sm:p-6 bg-slate-950 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:pb-6 sm:pt-[calc(env(safe-area-inset-top)+1.5rem)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]" aria-label="Main navigation">
        <div className="flex gap-6 sm:gap-12 items-start sm:items-center justify-center">
          <NavLink to="/">Calculator</NavLink>
          <NavLink to="/trick-pass">Trick Pass</NavLink>
          <NavLink to="/trick-guide">Trick Guide</NavLink>
          <NavLink to="/about">About</NavLink>
        </div>
        {/* Glowing blue gradient line */}
        <div className="absolute top-0 sm:top-auto sm:bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-[0_0_4px_rgba(59,130,246,0.3)]"></div>
      </nav>

      {/* Page Content */}
      <div className="p-2 sm:p-6 pt-[env(safe-area-inset-top)] pb-20 sm:pb-0 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <Routes>
          <Route path="/" element={
            <Calculator
              addTrick={addTrick}
              undoTrick={undoTrick}
              trickList={currentPassTricks}
              allTricks={getAllTricks()}
              currentPass={currentPass}
              startSecondPass={startSecondPass}
              clearAll={clearAll}
              clearCurrentPass={clearCurrentPass}
              calcState={calcState}
              setCalcState={setCalcState}
              calcStateHistory={calcStateHistory}
              setCalcStateHistory={setCalcStateHistory}
              passesForDisplay={getAllPassesForDisplay()}
              skillLevel={skillLevel}
              onSkillLevelChange={handleSkillLevelChange}
              customTricks={customTricks}
              onAddCustomTrick={addCustomTrick}
              onRemoveCustomTrick={removeCustomTrick}
              onUpdateCustomTrick={updateCustomTrick}
            />
          } />
          <Route path="/trick-pass" element={
            <TrickPass
              passes={getAllPassesForDisplay()}
            />
          } />
          <Route path="/trick-guide" element={<TrickGuide />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}
