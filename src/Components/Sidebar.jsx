import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const drawer = `fixed inset-y-0 left-0 z-50 w-64 border-4 transform transition-transform duration-300 md:relative md:translate-x-0 ${
    open ? "translate-x-0" : "-translate-x-full"
  } ${darkMode
      ? "bg-gray-900 text-white border-white"
      : "bg-white text-black border-black"
  }`;

  return (
    <>
      {/* Backdrop – mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer / column */}
      <aside className={drawer} style={{ boxShadow: "4px 4px 0 0 black" }}>
        {/* Mobile close button */}
        <div className="md:hidden flex justify-end p-3">
          <button
            onClick={onClose}
            className="px-2 py-1 border-2 border-black"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <h2 className={`font-bold mb-4 border-b-2 pb-2 ${
            darkMode ? "border-white" : "border-black"
          }`}>
            📂 Issues
          </h2>
          <ul className="menu space-y-2">
            <li>
              <Link
                to="/dashboard"
                onClick={onClose}
                className={`block py-2 px-4 border-2 ${
                  location.pathname === "/dashboard"
                    ? "bg-black text-white"
                    : darkMode
                    ? "border-white text-white hover:bg-gray-800"
                    : "border-black text-black hover:bg-gray-200"
                }`}
              >
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/editor/new"
                onClick={onClose}
                className={`block py-2 px-4 border-2 ${
                  location.pathname === "/editor/new"
                    ? "bg-black text-white"
                    : darkMode
                    ? "border-white text-white hover:bg-gray-800"
                    : "border-black text-black hover:bg-gray-200"
                }`}
              >
                ✏️ New Issue
              </Link>
            </li>
            <li>
              <Link
                to="/LibraryPage"
                onClick={onClose}
                className={`block py-2 px-4 border-2 ${
                  location.pathname === "/LibraryPage"
                    ? "bg-black text-white"
                    : darkMode
                    ? "border-white text-white hover:bg-gray-800"
                    : "border-black text-black hover:bg-gray-200"
                }`}
              >
                📚 Library
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}