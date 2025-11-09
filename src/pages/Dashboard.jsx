import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";
import image1 from "../assets/bg1.jpg";
import image2 from "../assets/bg2.jpg";
import Button from "../Components/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const images = [image1, image2];

  // Background image rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Fetch issues from backend
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/issues");
      if (!res.ok) throw new Error("Failed to fetch issues");
      const data = await res.json();
      // Show only 6 most recent issues
      setIssues(data.slice(0, 6));
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Delete issue
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    try {
      setDeleteLoading(id);
      const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete issue");

      setIssues(issues.filter((i) => i._id !== id));
    } catch (error) {
      console.error("Failed to delete issue:", error);
      alert("Failed to delete issue. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center transition-all duration-1000 relative"
      style={{
        backgroundImage:
          theme === "dark" ? "none" : `url(${images[currentImageIndex]})`,
        backgroundColor: theme === "dark" ? "#1a1a1a" : "transparent",
      }}
    >
      <div
        className={`min-h-screen p-4 md:p-6 border-4 border-black font-retro ${
          theme === "dark" ? "bg-gray-900/95" : "bg-white/70"
        }`}
        style={{ boxShadow: "4px 4px 0 0 black" }}
      >
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-4 mb-6 gap-4 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          <h1 className="text-2xl md:text-3xl font-bold">
            📖 My Magazine Journal
          </h1>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate("/library")}
              className={`px-4 py-2 border-2 border-black font-bold transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-white hover:bg-gray-100"
              }`}
              style={{ boxShadow: "2px 2px 0 0 black" }}
            >
              📚 Library
            </button>

            <Link
              to="/editor/new"
              className={`px-4 py-2 border-2 border-black font-bold transition-colors text-center flex-1 sm:flex-none ${
                theme === "dark"
                  ? "bg-pink-600 hover:bg-pink-700 text-white"
                  : "bg-white hover:bg-gray-100 text-black"
              }`}
              style={{ boxShadow: "2px 2px 0 0 black" }}
            >
              ➕ New Issue
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center mt-20">
            <p
              className={`text-lg ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              ⏳ Loading issues...
            </p>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-20">
            <div className="text-6xl mb-4">📖</div>
            <p
              className={`text-lg mb-4 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              No issues yet. Start your first one!
            </p>
            <Link
              to="/editor/new"
              className={`px-6 py-3 border-2 border-black font-bold transition-colors ${
                theme === "dark"
                  ? "bg-pink-600 hover:bg-pink-700 text-white"
                  : "bg-white hover:bg-gray-100 text-black"
              }`}
              style={{ boxShadow: "4px 4px 0 0 black" }}
            >
              Create First Issue
            </Link>
          </div>
        ) : (
          <>
            <div
              className={`mb-6 ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              <h2 className="text-xl font-bold mb-2">Recent Issues</h2>
              <p className="text-sm opacity-70">
                Showing your 6 most recent journal entries
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className={`border-4 border-black p-4 hover:shadow-lg transition-all hover:-translate-y-1 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                  style={{ boxShadow: "4px 4px 0 0 black" }}
                >
                  <div className="mb-4">
                    <h2
                      className={`text-xl font-bold mb-2 ${
                        theme === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      {issue.title}
                    </h2>
                    {issue.subtitle && (
                      <p
                        className={`text-sm mb-2 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {issue.subtitle}
                      </p>
                    )}
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-black"
                      }`}
                    >
                      Volume {issue.volume} – Issue {issue.issueNumber}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        theme === "dark" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      Created: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 flex-wrap">
                    <Link
                      to={`/viewer/${issue._id}`}
                      className={`px-3 py-1 border-2 border-black text-sm font-bold transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      style={{ boxShadow: "2px 2px 0 0 black" }}
                    >
                      📖 View
                    </Link>

                    <Link
                      to={`/editor/${issue._id}`}
                      className={`px-3 py-1 border-2 border-black text-sm font-bold transition-colors ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      style={{ boxShadow: "2px 2px 0 0 black" }}
                    >
                      ✏️ Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(issue._id)}
                      disabled={deleteLoading === issue._id}
                      className={`px-3 py-1 border-2 border-black text-sm font-bold transition-colors disabled:opacity-50 ${
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
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate("/library")}
                className={`px-6 py-3 border-2 border-black font-bold transition-colors ${
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
  );
}
