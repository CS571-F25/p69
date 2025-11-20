import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import NavLink from "./components/NavLink.jsx";
import Calculator from "./components/Calculator.jsx";
import TrickPass from "./components/TrickPass.jsx";
import TrickGuide from "./components/TrickGuide.jsx";

export default function App() {
  const [trickList, setTrickList] = useState([]);

  const addTrick = (trick) => {
    setTrickList([...trickList, trick]);
  };

  const clearTricks = () => {
    setTrickList([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      {/* Navigation */}
      <nav className="p-6 bg-slate-950 relative">
        <div className="flex gap-10 items-center justify-center">
          <NavLink to="/">Calculator</NavLink>
          <NavLink to="/trick-pass">Trick Pass</NavLink>
          <NavLink to="/trick-guide">Trick Guide</NavLink>
        </div>
        {/* Glowing blue gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 shadow-[0_0_4px_rgba(59,130,246,0.3)]"></div>
      </nav>

      {/* Page Content */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Calculator addTrick={addTrick} clearTricks={clearTricks} trickList={trickList} />} />
          <Route path="/trick-pass" element={<TrickPass trickList={trickList} />} />
          <Route path="/trick-guide" element={<TrickGuide />} />
        </Routes>
      </div>
    </div>
  );
}
