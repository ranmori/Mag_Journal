import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import { useTheme } from "../Components/ThemeContext";

const Button = ({ onClick, disabled, className, children, variant }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 border-2 border-black font-retro ${
      variant === "delete"
        ? "bg-red-100 hover:bg-red-200"
        : "bg-white hover:bg-gray-100"
    } disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
    style={{
      boxShadow: disabled ? "none" : "4px 4px 0px black",
    }}
  >
    {children}
  </button>
);

export default function LibraryPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
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
  };

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

  if (loading) {
    return (
      <div
        className={`flex w-full min-h-screen ${
          isDark ? "bg-gray-900" : "bg-gray-400"
        }`}
      >
        <div className="flex-1 flex items-center justify-center font-retro">
          <div
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            ⏳ Loading your library...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex min-h-screen ${
          isDark ? "bg-gray-900" : "bg-gray-400"
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center font-retro gap-4">
          <div className={`text-2xl font-bold text-red-600`}>❌ {error}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-400"}`}
    >
      <div className={`flex-1 p-6 font-retro min-h-screen`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className={`border-4 border-black p-6 mb-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{ boxShadow: "8px 8px 0px black" }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1
                  className={`text-3xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  📚 My Library
                </h1>
                <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                  {issues.length} issue{issues.length !== 1 ? "s" : ""} in your
                  collection
                </p>
              </div>
              <Button onClick={() => navigate("/editor")}>
                ✍️ Create New Issue
              </Button>
            </div>

            {/* Search Bar */}
            <div
              className={`flex items-center border-2 border-black mb-4 ${
                isDark ? "bg-gray-700" : "bg-white"
              }`}
            >
              <span
                className={`px-3 text-xl ${
                  isDark ? "text-gray-300" : "text-black"
                }`}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by title or subtitle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 px-3 py-2 outline-none bg-transparent ${
                  isDark
                    ? "text-white placeholder-gray-400"
                    : "text-black placeholder-gray-500"
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Layout Filter */}
              <div className="flex-1">
                <label
                  className={`block font-bold mb-2 text-sm ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Filter by Style:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout.id)}
                      className={`px-3 py-2 border-2 border-black text-sm ${
                        selectedLayout === layout.id
                          ? isDark
                            ? "bg-gray-600 text-white"
                            : "bg-black text-white"
                          : isDark
                          ? "bg-gray-700 text-white hover:bg-gray-600"
                          : "bg-white text-black hover:bg-gray-100"
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
                  className={`block font-bold mb-2 text-sm ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-2 border-2 border-black ${
                    isDark ? "bg-gray-700 text-white" : "bg-white text-black"
                  }`}
                  style={{ boxShadow: "2px 2px 0px black" }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Issues Grid */}
          {filteredIssues.length === 0 ? (
            <div
              className={`border-4 border-black p-12 text-center ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
              style={{ boxShadow: "8px 8px 0px black" }}
            >
              <div className={`text-6xl mb-4 ${isDark ? "opacity-70" : ""}`}>
                📖
              </div>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                No issues found
              </h2>
              <p
                className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                {searchQuery || selectedLayout !== "all"
                  ? "Try adjusting your filters"
                  : "Start creating your first magazine journal!"}
              </p>
              {!searchQuery && selectedLayout === "all" && (
                <Button onClick={() => navigate("/editor")}>
                  Create Your First Issue
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => (
                <div
                  key={issue._id}
                  className={`border-4 border-black overflow-hidden hover:translate-y-[-4px] transition-transform cursor-pointer ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                  style={{ boxShadow: "8px 8px 0px black" }}
                >
                  {/* Magazine Cover - Always bright and colorful */}
                  <div
                    className={`h-48 bg-gradient-to-br ${getLayoutColor(
                      issue.layout
                    )} border-b-4 border-black p-6 flex flex-col justify-between`}
                  >
                    <div className="text-xs font-bold opacity-70 text-black">
                      VOL.{issue.volume} • ISSUE {issue.issueNumber}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 line-clamp-2 text-black">
                        {issue.title}
                      </h3>
                      {issue.subtitle && (
                        <p className="text-sm opacity-80 line-clamp-1 text-black">
                          {issue.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-white border border-black text-black font-bold">
                        {issue.layout.toUpperCase()}
                      </span>
                      {issue.musicTrack && (
                        <span className="text-black">🎵</span>
                      )}
                      {issue.images?.length > 0 && (
                        <span className="text-black">🖼️</span>
                      )}
                    </div>
                  </div>

                  {/* Issue Info - Dark mode applied */}
                  <div className={`p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <div
                      className={`flex items-center justify-between text-xs mb-3 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span>📅 {formatDate(issue.createdAt)}</span>
                      <span>
                        {
                          [
                            issue.foreword,
                            issue.reflections,
                            issue.lessons,
                          ].filter(Boolean).length
                        }{" "}
                        sections
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/viewer/${issue._id}`)}
                        className={`flex-1 text-sm ${
                          isDark ? "bg-black text-white" : "bg-white text-black"
                        }`}
                      >
                        📖 Read
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(issue._id);
                        }}
                        variant="delete"
                        className="px-3 text-sm"
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
