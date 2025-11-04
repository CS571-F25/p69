import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home.jsx";
import AboutMe from "./components/AboutMe.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="p-4 flex gap-4 border-b">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <Link to="/about" className="text-blue-600 hover:underline">About Me</Link>
      </nav>

      {/* Page Content */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutMe />} />
        </Routes>
      </div>
    </div>
  );
}
