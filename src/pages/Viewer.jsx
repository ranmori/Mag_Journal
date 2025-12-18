import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
import { useTheme } from "../Components/ThemeContext";
import ExportButton from "../Components/ExportButton";
import AudioPlayer from "../Components/AudioPage"; // ADD THIS IMPORT
import SkeletonGrid from "../Components/SkeletonGrid";
import { useLoader } from "../Components/LoaderContext";
const Button = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1 border-2 border-black bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-300 dark:hover:bg-gray-700 dark:disabled:bg-gray-600 ${className}`}
    style={{
      boxShadow: disabled ? "none" : "2px 2px 0px black",
      fontSize: "0.8rem",
    }}
  >
    {children}
  </button>
);

export default function ViewerPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const { setLoading } = useLoader();
  const [error, setError] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  // Flip animation state
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const pageRef = useRef(null);
  const shadowRef = useRef(null);
  const backRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch issue content from backend
  useEffect(() => {
    console.log("🧭 issueId from URL:", issueId);
    const fetchIssue = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/issues/${issueId}`);
        if (!res.ok) throw new Error("Failed to load issue");
        const data = await res.json();
        console.log("🧠 Loaded issue from backend:", data);
        setIssue(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [issueId]);

  // If still loading
  // if (loading) {
  //   return (
  //     <div
  //       className={`fixed inset-0 h-screen items-center justify-center   ${
  //         darkMode ? "text-gray-200" : "text-gray-800"
  //       } font-bold`}
  //     >

  //          ........
  //         <SkeletonGrid rows={2} cardsPerRow={6} />;
  //     </div>
  //   );
  // }

  // If there was an error
  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen ${
          darkMode ? "text-gray-200" : "text-gray-800"
        } font-bold`}
      >
        ❌ {error}
        <Button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // If no issue found
  if (!issue) {
    return (
      <div
        className={` fixed inset-0 flex-col items-center justify-center h-screen ${
          darkMode ? "text-gray-200" : "text-gray-800"
        } font-bold`}
      >
        Issue not found.
        <Button onClick={() => navigate("/dashboard")}>Back</Button>
      </div>
    );
  }

  // Pages content
  const pages = [];

  if (issue.foreword) {
    pages.push({ title: "Foreword", content: issue.foreword });
  }

  if (issue.reflections) {
    pages.push({ title: "Reflections", content: issue.reflections });
  }

  if (issue.lessons) {
    pages.push({
      title: "Lessons Learned",
      content: issue.lessons,
      image: issue.images?.[0] || null, // attach image to page
    });
  }

  // Fallback if no content
  if (pages.length === 0) {
    pages.push({
      title: issue.title,
      content: "No content available.",
    });
  }

  // Parse content with dark mode support
  const parseContent = (text) => {
    const sections = text.split("\n\n");

    return sections.map((section, i) => {
      const trimmed = section.trim();

      // Handle bullet points
      if (trimmed.startsWith("•")) {
        const items = trimmed
          .split("\n")
          .map((line) => line.replace(/^•\s*/, "").trim());

        return (
          <ul key={i} className="list-disc pl-6 mb-4">
            {items.map((item, j) => {
              const parts = item.split(/\*\*(.*?)\*\*/g);
              return (
                <li
                  key={j}
                  className={`mb-2 leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {parts.map((part, idx) =>
                    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                  )}
                </li>
              );
            })}
          </ul>
        );
      }

      // Regular paragraph with bold text
      const parts = trimmed.split(/\*\*(.*?)\*\*/g);
      return (
        <p
          key={i}
          className={`mb-4 text-start leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {parts.map((part, idx) =>
            idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  // Helper component for each page with dark mode
  const PageContent = ({ page }) => (
    <div
      className={`absolute inset-0 p-8 flex flex-col justify-between overflow-hidden border-2 ${
        darkMode ? "bg-gray-800 border-gray-300" : "bg-white border-black"
      }`}
      style={{ backfaceVisibility: "hidden", fontSize: "0.875rem" }}
    >
      <h1
        className={`font-bold text-2xl mb-6 text-center ${
          darkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {page.title}
      </h1>

      {/* 📰 Magazine-style layout: image + content side-by-side */}
      <div
        className={`flex flex-col md:flex-row gap-6 flex-1 overflow-y-auto ${
          darkMode ? "text-gray-300" : "text-gray-700"
        }`}
        style={{
          lineHeight: "1.8rem",
          wordSpacing: "0.05rem",
          letterSpacing: "0.015em",
          paddingRight: "0.5rem",
        }}
      >
        {/* Image Section */}
        {page.image && (
          <div className="flex justify-center md:w-1/4">
            <img
              src={page.image}
              alt="Lesson Illustration"
              className="w-full h-auto max-h-[70vh] object-contain rounded-2xl shadow-lg border-2 border-black"
            />
          </div>
        )}

        {/* Text Section */}
        <div className={`flex-1 text-start`}>{parseContent(page.content)}</div>
      </div>

      {/* Footer */}
      <div
        className={`flex justify-between mt-4 pt-2 border-t text-xs ${
          darkMode
            ? "border-gray-600 text-gray-400"
            : "border-gray-300 text-gray-500"
        }`}
      >
        <div>My Magazine Journal</div>
        <div>
          Page {pages.indexOf(page) + 1} / {pages.length}
        </div>
      </div>
    </div>
  );

  // Flip animation
  const flipPage = (direction) => {
    if (isFlipping) return;
    setIsFlipping(true);

    const front = pageRef.current;
    const back = backRef.current;
    const shadow = shadowRef.current;

    const timeline = gsap.timeline({
      onComplete: () => {
        setCurrentPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
        gsap.set([front, back, shadow], { clearProps: "all" });
        setIsFlipping(false);
      },
    });

    gsap.set(back, { rotateY: direction === "next" ? -180 : 180 });
    gsap.set([front, back], { transformStyle: "preserve-3d" });
    gsap.set(shadow, { opacity: 0 });

    timeline.to(front, {
      rotateY: direction === "next" ? -180 : 180,
      duration: 0.8,
      ease: "power2.inOut",
    });

    timeline.to(back, { rotateY: 0, duration: 0.8, ease: "power2.inOut" }, 0);

    timeline.to(
      shadow,
      {
        opacity: 0.3,
        duration: 0.4,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 1,
      },
      0
    );
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) flipPage("next");
  };

  const prevPage = () => {
    if (currentPage > 0) flipPage("prev");
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={`fixed inset-0 p-4 border-black h-screen font-retro ${
          darkMode ? "bg-gray-700" : "bg-gray-400"
        }`}
      >
        {/* Header Section */}
        {/* Header Section - UPDATED */}
        <div
          className={`flex flex-col gap-4 mb-2 p-4 border-2 text-sm ${
            darkMode ? "bg-gray-800 border-gray-300" : "bg-white border-black"
          }`}
        >
          {/* Top Row: Buttons and Dark Mode */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                className="btn btn-retro"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>
              <ExportButton issue={issue} pages={pages} />
            </div>

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

          {/* Audio Player Row - NEW SECTION */}
          {issue.musicTrack && (
            <div className="mt-1 w-full max-w-md">
              <AudioPlayer
                initialTrack={issue.musicTrack}
                autoPlay={true}
                forceCompact={true} // ✅ this locks it small
                darkMode={darkMode}
              />
            </div>
          )}
        </div>

        <div className="relative w-full h-[calc(100%-120px)] perspective-1200">
          <div ref={backRef} className="absolute inset-0"></div>
          <div ref={pageRef} className="absolute inset-0">
            <PageContent page={pages[currentPage]} />
          </div>
          <div
            ref={shadowRef}
            className={`absolute inset-0 bg-gradient-to-r to-transparent pointer-events-none ${
              darkMode ? "from-white/20" : "from-black/20"
            }`}
            style={{ borderRadius: "2px", opacity: 0 }}
          ></div>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-center gap-6 py-4 border-t-2 ${
            darkMode
              ? "bg-gray-700 border-gray-300"
              : "bg-gray-400 border-black"
          }`}
        >
          <Button
            className="btn btn-retro"
            onClick={prevPage}
            disabled={currentPage === 0 || isFlipping}
          >
            ◀ Prev
          </Button>
          <div
            className={`flex items-center px-4 py-2 border-2 font-bold ${
              darkMode
                ? "bg-gray-800 border-gray-300 text-gray-200"
                : "bg-white border-black text-gray-800"
            }`}
          >
            {currentPage + 1} / {pages.length}
          </div>
          <Button
            className="btn btn-retro"
            onClick={nextPage}
            disabled={currentPage === pages.length - 1 || isFlipping}
          >
            Next ▶
          </Button>
        </div>
      </div>
    </div>
  );
}
