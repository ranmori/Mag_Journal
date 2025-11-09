import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";

export default function Sidebar() {
  const location = useLocation();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const containerClasses = `w-64 border-4 min-h-screen p-4 font-retro ${
    darkMode
      ? "bg-gray-900 text-white border-white"
      : "bg-white text-black border-black"
  }`;
  const headingClasses = `font-bold mb-4 border-b-2 pb-2 ${
    darkMode ? "text-white border-white" : "text-black border-black"
  }`;
  const linkBase = `block py-2 px-4 border-2 transition-all duration-150`;
  const linkDark = `${linkBase} border-white text-white hover:bg-gray-800`;
  const linkLight = `${linkBase} border-black text-black hover:bg-gray-200`;
  const activeClass = " active-retro"; // keep your existing active class

  return (
    <div
      className={containerClasses}
      style={{ boxShadow: "4px 4px 0 0 black" }}
    >
      <h2 className={headingClasses}>📂 Issues</h2>
      <ul className="menu">
        <li className="mb-2">
          <Link
            to="/dashboard"
            className={`${darkMode ? linkDark : linkLight} ${
              location.pathname === "/dashboard" ? activeClass : ""
            }`}
          >
            🏠 Dashboard
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/editor/new"
            className={`${darkMode ? linkDark : linkLight} ${
              location.pathname === "/editor/new" ? activeClass : ""
            }`}
          >
            ✏️ New Issue
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/LibraryPage"
            className={`${darkMode ? linkDark : linkLight} ${
              location.pathname === "/LibraryPage" ? activeClass : ""
            }`}
          >
            📚 Library
          </Link>
        </li>
      </ul>
    </div>
  );
}
