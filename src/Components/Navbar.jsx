import React from "react";
import { useTheme } from "../Components/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  return (
    <div
      className={`border-4 border-black py-4 px-6 flex justify-between items-center font-retro ${
        darkMode ? "bg-gray-900/95" : "bg-white/70"
      }`}
      style={{ boxShadow: "0 0 0 0 black" }}
    >
      <div
        className={`flex-1 ${theme === "dark" ? "text-white" : "text-black"}`}
      >
        <a className="font-bold text-lg ">📖 MagJournal</a>
      </div>
      <div className="flex-none flex ">
        <button className="btn-retro-nav">
          <div className="w-5 h-5 border-4 border-black rounded-full"></div>
        </button>
        {/* Settings button with a circle */}
        <button
          className={`btn-retro-nav ${
            theme === "dark" ? "bg-black" : "bg-white/70"
          }`}
        >
          <div className="w-5 h-5 border-4 border-black rounded-full"></div>
        </button>
        <button className="btn-retro-nav">
          <div className="w-5 h-5 border-4 border-black rounded-full"></div>
        </button>
        {/* dark mode */}
        <button
          onClick={toggleTheme}
          className={`px-3 py-1 border-2 hover:bg-gray-100 transition-colors ${
            darkMode
              ? "bg-gray-800 border-gray-300 hover:bg-gray-700"
              : "bg-white border-black hover:bg-gray-100"
          }`}
          style={{ boxShadow: "2px 2px 0px black" }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}
