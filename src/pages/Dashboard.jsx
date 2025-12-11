import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";
import image1 from "../assets/bg1.jpg";
import image2 from "../assets/bg2.jpg";
// import Sidebar from "../Components/Sidebar"
import Button from "../Components/Button";
import IssueEditor from "./IssueEditor"

// Responsive Dashboard Component
export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [issues, setIssues] = useState([
    // {
    //   _id: "1",
    //   title: "Summer Reflections",
    //   subtitle: "A journey through warmth and growth",
    //   volume: 1,
    //   issueNumber: 1,
    //   createdAt: "2024-06-15T10:00:00Z",
    // },
    // {
    //   _id: "2",
    //   title: "Autumn Musings",
    //   subtitle: "Embracing change and transformation",
    //   volume: 1,
    //   issueNumber: 2,
    //   createdAt: "2024-09-20T14:30:00Z",
    // },
    // {
    //   _id: "3",
    //   title: "Winter Tales",
    //   subtitle: "Finding warmth in the cold",
    //   volume: 1,
    //   issueNumber: 3,
    //   createdAt: "2024-12-01T09:15:00Z",
    // },
  ]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // issue fetcher
  /* 1️⃣  grab real issues once */
  useEffect(() => {
    fetch("http://localhost:5000/api/issues/latest")
      .then((r) => r.json())
      .then((data) => {
        setIssues(data);   // ← same shape as before
        setLoading(false);
      })
      .catch(() => {
        setIssues([]);     // fail-safe
        setLoading(false);
      });
  }, []);
  // Background image rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 2);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }
    setIssues(issues.filter((i) => i._id !== id));
  };

  const bgColors = ["#fde68a", "#bfdbfe"];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}

      {/* Main Content */}
      <div
        className="flex-1 min-h-screen bg-cover bg-center transition-all duration-1000 relative"
        style={{
          backgroundColor: theme === "dark" ? "#1a1a1a" : bgColors[currentImageIndex],
        }}
      >
        <div
          className={`min-h-screen p-3 sm:p-4 md:p-6 border-4 border-black font-mono ${
            theme === "dark" ? "bg-gray-900/95" : "bg-white/70"
          }`}
          style={{ boxShadow: "4px 4px 0 0 black" }}
        >
          {/* Header */}
          <div
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-3 sm:pb-4 mb-4 sm:mb-6 gap-3 sm:gap-4 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={`lg:hidden p-2 border-2 border-black ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                ☰
              </button>

              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                📖 My Magazine Journal
              </h1>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`ml-auto sm:ml-0 p-2 border-2 border-black ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate("/LibraryPage")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-black font-bold text-sm sm:text-base transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                📚 <span className="hidden sm:inline">Library</span>
              </button>

              <button
                onClick={() => navigate("/editor")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-black font-bold text-sm sm:text-base transition-colors ${
                  theme === "dark"
                    ? "bg-pink-600 hover:bg-pink-700 text-white"
                    : "bg-white hover:bg-gray-100 text-black"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                ➕ <span className="hidden xs:inline">New Issue</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex w-full flex-col min-h-screen items-center justify-center text-center ">
              <p
                className={`text-sm sm:text-base ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                ⏳ Loading issues...
              </p>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-12 sm:mt-20 px-4">
              <div className="text-4xl sm:text-5xl mb-4">📖</div>
              <p
                className={`text-sm sm:text-base mb-4 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                No issues yet. Start your first one!
              </p>
              <button
                onClick={() => navigate("/editor")}
                className={`px-4 sm:px-6 py-2 sm:py-3 border-2 border-black font-bold text-sm sm:text-base transition-colors ${
                  theme === "dark"
                    ? "bg-pink-600 hover:bg-pink-700 text-white"
                    : "bg-white hover:bg-gray-100 text-black"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                Create First Issue
              </button>
            </div>
          ) : (
            <>
              <div
                className={`mb-4 sm:mb-6 ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                <h2 className="text-base sm:text-lg font-bold mb-2">Recent Issues</h2>
                <p className="text-xs sm:text-sm opacity-70">
                  Showing your 6 most recent journal entries
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {issues.map((issue) => (
                  <div
                    key={issue._id}
                    className={`border-2 sm:border-4 border-black p-3 sm:p-4 hover:shadow-lg transition-all hover:-translate-y-1 ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                    style={{ boxShadow: "4px 4px 0 0 black" }}
                  >
                    <div className="mb-3 sm:mb-4">
                      <h2
                        className={`text-base sm:text-lg font-bold mb-2 ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}
                      >
                        {issue.title}
                      </h2>
                      {issue.subtitle && (
                        <p
                          className={`text-xs sm:text-sm mb-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {issue.subtitle}
                        </p>
                      )}
                      <p
                        className={`text-xs sm:text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-black"
                        }`}
                      >
                        Volume {issue.volume} – Issue {issue.issueNumber}
                      </p>
                      <p
                        className={`text-[10px] sm:text-xs mt-2 ${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Created: {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/viewer/${issue._id}`)}
                        className={`px-2 sm:px-3 py-1 border-2 border-black text-xs sm:text-sm font-bold transition-colors ${
                          theme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-white hover:bg-gray-100"
                        }`}
                        style={{ boxShadow: "2px 2px 0 0 black" }}
                      >
                        📖 <span className="hidden xs:inline">View</span>
                      </button>

                      <button
                        onClick={() => handleDelete(issue._id)}
                        disabled={deleteLoading === issue._id}
                        className={`px-2 sm:px-3 py-1 border-2 border-black text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 ${
                          theme === "dark"
                            ? "bg-red-900 hover:bg-red-800"
                            : "bg-red-100 hover:bg-red-50"
                        }`}
                        style={{ boxShadow: "2px 2px 0 0 black" }}
                      >
                        {deleteLoading === issue._id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Link */}
              <div className="mt-6 sm:mt-8 text-center">
                <button
                  onClick={() =>navigate("/LibraryPage")}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-black font-bold text-sm sm:text-base transition-colors ${
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700 text-white"
                      : "bg-white hover:bg-gray-100 text-black"
                  }`}
                  style={{ boxShadow: "4px 4px 0 0 black" }}
                >
                  View All Issues in Library →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}