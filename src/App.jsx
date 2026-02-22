import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
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
  // Skill level
  const [skillLevel, setSkillLevel] = useState("beginner");
  const handleSkillLevelChange = (level) => {
    setSkillLevel(level);
    Preferences.set({ key: "skillLevel", value: level });
  };
  // Custom tricks
  const [customTricks, setCustomTricks] = useState([]);
  const addCustomTrick = (trick) => {
    const updated = [...customTricks, { ...trick, id: crypto.randomUUID() }];
    setCustomTricks(updated);
    Preferences.set({ key: "customTricks", value: JSON.stringify(updated) });
  };
  const removeCustomTrick = (id) => {
    const updated = customTricks.filter(t => t.id !== id);
    setCustomTricks(updated);
    Preferences.set({ key: "customTricks", value: JSON.stringify(updated) });
  };
  const updateCustomTrick = (id, data) => {
    const updated = customTricks.map(t => t.id === id ? { ...data, id } : t);
    setCustomTricks(updated);
    Preferences.set({ key: "customTricks", value: JSON.stringify(updated) });
  };

  // Load persisted settings
  useEffect(() => {
    Preferences.get({ key: "skillLevel" }).then(({ value }) => {
      if (value) setSkillLevel(value);
    });
    Preferences.get({ key: "customTricks" }).then(({ value }) => {
      if (value) {
        try { setCustomTricks(JSON.parse(value)); } catch {}
      }
    });
  }, []);
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: "#0f172a" }).catch(() => {});
      }).catch(() => {});

      import("@capacitor/app").then(({ App: CapApp }) => {
        CapApp.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else CapApp.exitApp();
        });
      }).catch(() => {});
    }
  }, []);

  // Calculator state (persists across tab switches)
  const [calcState, setCalcState] = useState(getInitialCalcState());
  // Calculator state history for undo
  const [calcStateHistory, setCalcStateHistory] = useState([]);
  // Setup overlay visibility (lifted here to persist across tab switches)
  const [showSetup, setShowSetup] = useState(true);

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
      setShowSetup(true);
    }
  };

  const clearAll = () => {
    setCurrentPassTricks([]);
    setCompletedPasses([]);
    setCurrentPass(1);
    setPass1SkiCount(null);
    setCalcState(getInitialCalcState());
    setCalcStateHistory([]);
    setShowSetup(true);
  };

  const clearCurrentPass = () => {
    setCurrentPassTricks([]);
    setCalcState(getInitialCalcState());
    setCalcStateHistory([]);
    setShowSetup(true);
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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:relative px-3 pt-4 sm:p-6 bg-slate-950 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:pb-6 sm:pt-[calc(env(safe-area-inset-top)+1.5rem)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]" aria-label="Main navigation">
        <div className="flex gap-6 sm:gap-10 items-start sm:items-center justify-center">
          <NavLink to="/" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="4" y="2" width="16" height="20" rx="2" /><rect x="7" y="5" width="10" height="4" rx="1" strokeWidth={1} /><path d="M8 12h2M14 12h2M8 16h2M14 16h2" /></svg>}>Calculator</NavLink>
          <NavLink to="/trick-pass" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h6" /></svg>}>Trick Pass</NavLink>
          <NavLink to="/trick-guide" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}>Trick Guide</NavLink>
          <NavLink to="/about" icon={<svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} fill="none"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" /></svg>}>About</NavLink>
        </div>
        {/* Glowing blue gradient line */}
        <div className="absolute top-0 sm:top-auto sm:bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-[0_0_4px_rgba(59,130,246,0.3)]"></div>
      </nav>

      {/* Page Content */}
      <div className="p-2 sm:p-6 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-28 sm:pb-0 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
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
              showSetup={showSetup}
              setShowSetup={setShowSetup}
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
