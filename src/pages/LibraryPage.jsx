import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// import Sidebar from "../Components/Sidebar";
import { useTheme } from "../Components/ThemeContext";
import SkeletonGrid from "../Components/SkeletonGrid"
import { useLoader } from "../Components/LoaderContext";

const Button = ({ onClick, disabled, className, children, variant }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 border-2 border-black font-bold transition-all ${
      variant === "delete"
        ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
        : "bg-white text-black hover:bg-gray-100 active:bg-gray-200"
    } ${className}`}
    style={{ boxShadow: "3px 3px 0px black" }}
  >
    {children}
  </button>
);

export default function LibraryPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [issues, setIssues] = useState([]);
  const { setLoading} = useLoader();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayout, setSelectedLayout] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const layouts = [
    { id: "all", name: "All", icon: "📚" },
    { id: "anime", name: "Anime", icon: "🌸" },
    { id: "retro", name: "Retro", icon: "🕹️" },
    { id: "fashion", name: "Fashion", icon: "👗" },
  ];

  const fetchIssues = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/issues");
      if (!res.ok) throw new Error("Failed to fetch issues");
      const data = await res.json();
      setIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete issue");
      setIssues(issues.filter((issue) => issue._id !== id));
    } catch (err) {
      alert("Failed to delete issue: " + err.message);
    }
  };

  const filteredIssues = issues
    .filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLayout =
        selectedLayout === "all" || issue.layout === selectedLayout;
      return matchesSearch && matchesLayout;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const getLayoutColor = (layout) => {
    const colors = {
      anime: "from-pink-100 to-purple-200",
      retro: "from-yellow-100 to-orange-200",
      fashion: "from-gray-100 to-slate-200",
    };
    return colors[layout] || "from-gray-100 to-gray-200";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // if (loading) {
  //   return (
  //     <div
  //       className={`min-h-screen flex ${
  //         isDark ? "bg-gray-900" : "bg-gray-50"
  //       }`}
  //     >
  //       <Sidebar />
  //       <div className="flex-1 p-8 overflow-y-auto">
  //         <div className="max-w-7xl mx-auto">
  //           <SkeletonGrid count={6} />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div
        className={`min-h-screen flex ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <div
              className={`text-xl mb-4 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {error}
            </div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1
                  className={`text-3xl sm:text-4xl font-black mb-2 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  📚 My Library
                </h1>
                <p
                  className={`text-sm sm:text-base ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {issues.length} issue{issues.length !== 1 ? "s" : ""} in your
                  collection
                </p>
              </div>
              <Button
                onClick={() => navigate("/editor")}
                className="w-full sm:w-auto whitespace-nowrap"
              >
                <span className="hidden sm:inline">✍️ Create New Issue</span>
                <span className="sm:hidden">New Issue</span>
              </Button>
            </div>

            {/* Search Bar */}
            <div
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-2 border-black ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
              style={{ boxShadow: "3px 3px 0px black" }}
            >
              <span className="text-lg sm:text-xl">🔍</span>
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base outline-none bg-transparent ${
                  isDark
                    ? "text-white placeholder-gray-400"
                    : "text-black placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Layout Filter */}
            <div>
              <label
                className={`block text-xs sm:text-sm font-bold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Filter by Style:
              </label>
              <div className="flex flex-wrap gap-2">
                {layouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setSelectedLayout(layout.id)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-black text-xs sm:text-sm ${
                      selectedLayout === layout.id
                        ? isDark
                          ? "bg-gray-600 text-white"
                          : "bg-black text-white"
                        : isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-600"
                        : "bg-white text-black hover:bg-gray-100 active:bg-gray-200"
                    }`}
                    style={{ boxShadow: "2px 2px 0px black" }}
                  >
                    {layout.icon} {layout.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label
                className={`block text-xs sm:text-sm font-bold mb-2 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-black text-xs sm:text-sm ${
                  isDark
                    ? "bg-gray-700 text-white"
                    : "bg-white text-black"
                }`}
                style={{ boxShadow: "2px 2px 0px black" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Issues Grid */}
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📖</div>
              <h2
                className={`text-xl sm:text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                No issues found
              </h2>
              <p
                className={`text-sm sm:text-base mb-6 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {searchQuery || selectedLayout !== "all"
                  ? "Try adjusting your filters"
                  : "Start creating your first magazine journal!"}
              </p>
              {!searchQuery && selectedLayout === "all" && (
                <Button
                  onClick={() => navigate("/editor")}
                  className="w-full sm:w-auto"
                >
                  Create Your First Issue
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="border-2 border-black overflow-hidden cursor-pointer transition-transform hover:translate-x-1 hover:translate-y-1"
                  style={{ boxShadow: "4px 4px 0px black" }}
                  onClick={() => navigate(`/viewer/${issue._id}`)}
                >
                  {/* Magazine Cover - Always bright and colorful */}
                  <div
                    className={`bg-gradient-to-br ${getLayoutColor(
                      issue.layout
                    )} p-4 sm:p-6 border-b-2 border-black`}
                  >
                    <div className="text-[10px] sm:text-xs font-bold text-black mb-2">
                      VOL.{issue.volume} • ISSUE {issue.issueNumber}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-black mb-1 sm:mb-2 line-clamp-2">
                      {issue.title}
                    </h3>
                    {issue.subtitle && (
                      <p className="text-xs sm:text-sm text-black/80 line-clamp-2">
                        {issue.subtitle}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs">
                      <span className="px-2 py-1 bg-black text-white font-bold">
                        {issue.layout.toUpperCase()}
                      </span>
                      {issue.musicTrack && (
                        <span className="px-2 py-1 bg-black text-white">
                          🎵
                        </span>
                      )}
                      {issue.images?.length > 0 && (
                        <span className="px-2 py-1 bg-black text-white">
                          🖼️
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Issue Info - Dark mode applied */}
                  <div
                    className={`p-3 sm:p-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <div
                      className={`text-[10px] sm:text-xs mb-3 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      📅 {formatDate(issue.createdAt)} •{" "}
                      {
                        [
                          issue.foreword,
                          issue.reflections,
                          issue.lessons,
                        ].filter(Boolean).length
                      }{" "}
                      sections
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/viewer/${issue._id}`);
                        }}
                        className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-black font-bold text-xs sm:text-sm ${
                          isDark
                            ? "bg-gray-700 text-white hover:bg-gray-900"
                            : "bg-white text-black"
                        }`}
                        style={{ boxShadow: "2px 2px 0px black" }}
                      >
                        <span className="hidden sm:inline">📖 Read</span>
                        <span className="sm:hidden">📖</span>
                      </button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(issue._id);
                        }}
                        variant="delete"
                        className="px-2 sm:px-3 text-xs sm:text-sm"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}