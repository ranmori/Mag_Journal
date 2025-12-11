import React from "react";
import { useTheme } from "../Components/ThemeContext";

export default function Navbar({ toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-40 border-4 border-black py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between font-retro ${
        darkMode ? "bg-gray-900/95 text-white" : "bg-white/70 text-black"
      }`}
      style={{ boxShadow: "0 4px 0 0 black" }}
    >
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3">
        {/* Hamburger – mobile only */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 border-2 border-black"
          aria-label="Open menu"
        >
          ☰
        </button>
        <a href="/" className="font-bold text-base sm:text-lg">
          📖 MagJournal
        </a>
      </div>

      {/* Right: icons / theme */}
      <div className="flex items-center gap-2">
        {/* Desktop icon row */}
        <div className="hidden md:flex items-center gap-2">
          <button className="btn-retro-nav">
            <div className="w-5 h-5 border-4 border-black rounded-full" />
          </button>
          <button
            className={`btn-retro-nav ${
              darkMode ? "bg-black" : "bg-white/70"
            }`}
          >
            <div className="w-5 h-5 border-4 border-black rounded-full" />
          </button>
          <button className="btn-retro-nav">
            <div className="w-5 h-5 border-4 border-black rounded-full" />
          </button>
        </div>

        {/* Theme toggle (always visible) */}
        <button
          onClick={toggleTheme}
          className={`px-3 py-1 border-2 border-black transition-colors ${
            darkMode
              ? "bg-gray-800 border-gray-300 hover:bg-gray-700"
              : "bg-white border-black hover:bg-gray-100"
          }`}
          style={{ boxShadow: "2px 2px 0 0 black" }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}