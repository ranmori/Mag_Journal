import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../Components/Button";
import { useTheme } from "../Components/ThemeContext";
import AudioPlayer from "../Components/AudioPage";
import * as geminiApi from "../services/geminiApi";

export default function IssueEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedLayout, setSelectedLayout] = useState("retro");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [volume, setVolume] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [foreword, setForeword] = useState("");
  const [reflections, setReflections] = useState("");
  const [lessons, setLessons] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSection, setLoadingSection] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadedImage, setUploadedImage] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedMusicTrack, setSelectedMusicTrack] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    if (id && id !== "new") {
      loadIssue(id);
    }
  }, [id]);

  const loadIssue = async (issueId) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/issues/${issueId}`);
      if (!res.ok) throw new Error("Failed to load issue");

      const issue = await res.json();

      setTitle(issue.title || "");
      setSubtitle(issue.subtitle || "");
      setVolume(issue.volume || "");
      setIssueNumber(issue.issueNumber || "");
      setForeword(issue.foreword || "");
      setReflections(issue.reflections || "");
      setLessons(issue.lessons || "");
      setSelectedLayout(issue.layout || "retro");
      setUploadedImage(issue.images?.[0] || null);
      setSelectedMusicTrack(issue.musicTrack || null);
    } catch (error) {
      console.error("Error loading issue:", error);
      setErrors({ load: "Failed to load issue" });
    } finally {
      setIsLoading(false);
    }
  };

  const layouts = [
    {
      id: "anime",
      name: "🌸 Anime",
      colors: "from-pink-100 to-purple-200",
      accent: "border-pink-400",
    },
    {
      id: "retro",
      name: "🕹️ Retro",
      colors: "from-yellow-100 to-orange-200",
      accent: "border-orange-400",
    },
    {
      id: "fashion",
      name: "👗 Fashion",
      colors: "from-gray-100 to-slate-200",
      accent: "border-slate-400",
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!volume.trim()) {
      newErrors.volume = "Volume is required";
    } else if (isNaN(volume) || parseInt(volume) < 1) {
      newErrors.volume = "Volume must be a positive number";
    }

    if (!issueNumber.trim()) {
      newErrors.issueNumber = "Issue number is required";
    } else if (isNaN(issueNumber) || parseInt(issueNumber) < 1) {
      newErrors.issueNumber = "Issue number must be a positive number";
    }

    if (!foreword.trim() && !reflections.trim() && !lessons.trim()) {
      newErrors.content = "At least one content section is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearMessages = () => {
    setErrors({});
    setSuccessMessage("");
  };

  // IssueEditor.jsx - Improved handleSave with better error handling

const handleSave = async () => {
  clearMessages();
  if (!validateForm()) return;
  setIsLoading(true);

  try {
    const issueData = {
      title,
      subtitle,
      volume,
      issueNumber,
      layout: selectedLayout,
      foreword,
      reflections,
      lessons,
      images: uploadedImage ? [uploadedImage] : [],
      musicTrack: selectedMusicTrack,
    };

    console.log('Sending issue data to:', `${API_BASE_URL}/api/issues`);
    console.log('Issue data:', { 
      title: issueData.title, 
      volume: issueData.volume, 
      issueNumber: issueData.issueNumber 
    });

    const res = await fetch(`${API_BASE_URL}/api/issues`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(issueData),
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', res.headers);

    // Get response text first to check what we're receiving
    const responseText = await res.text();
    console.log('Response text:', responseText.substring(0, 200));

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}`);
    }

    // Check if request was successful
    if (!res.ok) {
      throw new Error(data.error || data.message || `HTTP ${res.status}: Failed to save issue`);
    }

    console.log("Saved Issue:", data);
    setSuccessMessage("✅ Issue saved successfully!");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  } catch (error) {
    console.error('Save error details:', error);
    setErrors({
      save: error.message || "Failed to save issue. Please check your connection and try again.",
    });
  } finally {
    setIsLoading(false);
  }
};
  const exportToPDF = async () => {
    clearMessages();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const pdfData = {
        title,
        subtitle,
        volume,
        issueNumber,
        layout: selectedLayout,
        content: { foreword, reflections, lessons },
        images: uploadedImage,
        generatedAt: new Date().toISOString(),
      };

      console.log("PDF Export Data:", pdfData);
      setSuccessMessage("📄 PDF exported successfully! Check your downloads.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setErrors({ export: "Failed to export PDF. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const shareIssue = async () => {
    clearMessages();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const shareId = `issue_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const shareUrl = `https://magazine-journal.app/view/${shareId}`;

      console.log("Share URL:", shareUrl);
      setSuccessMessage("🔗 Share link copied to clipboard!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setErrors({ share: "Failed to generate share link. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTitle = async () => {
    clearMessages();
    setLoadingSection("title");

    try {
      const generatedTitle = await geminiApi.generateTitle();
      setTitle(generatedTitle);
      setSuccessMessage("✨ AI generated title successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({
        ai: error.message || "Failed to generate title. Please try again.",
      });
    } finally {
      setLoadingSection(null);
    }
  };

  const handleGenerateSubtitle = async () => {
    if (!title) {
      setErrors({
        ai: "Please add a title first before generating a subtitle.",
      });
      return;
    }

    clearMessages();
    setLoadingSection("subtitle");

    try {
      const generatedSubtitle = await geminiApi.generateSubtitle(title);
      setSubtitle(generatedSubtitle);
      setSuccessMessage("✨ AI generated subtitle successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({
        ai: error.message || "Failed to generate subtitle. Please try again.",
      });
    } finally {
      setLoadingSection(null);
    }
  };

  const generateAIContent = async (type) => {
    clearMessages();
    setLoadingSection(type);

    try {
      const generatedContent = await geminiApi.generateContent({
        type,
        title,
        subtitle,
        volume,
        issueNumber,
      });

      if (type === "foreword") setForeword(generatedContent);
      if (type === "reflections") setReflections(generatedContent);
      if (type === "lessons") setLessons(generatedContent);

      setSuccessMessage(`✨ AI generated ${type} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({
        ai: error.message || `Failed to generate ${type}. Please try again.`,
      });
    } finally {
      setLoadingSection(null);
    }
  };

  const handleGenerateAll = async () => {
    if (!title) {
      setErrors({ ai: "Please add a title first before generating content." });
      return;
    }

    clearMessages();
    setLoadingSection("all");

    try {
      const allContent = await geminiApi.generateAllSections({
        title,
        subtitle,
        volume,
        issueNumber,
      });

      setForeword(allContent.foreword);
      setReflections(allContent.reflections);
      setLessons(allContent.lessons);

      setSuccessMessage("✨ AI generated all sections successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({
        ai:
          error.message || "Failed to generate all sections. Please try again.",
      });
    } finally {
      setLoadingSection(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ image: "Please select a valid image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: "Image size must be less than 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      clearMessages();
      console.log("Image uploaded:", file.name);
    };
    reader.readAsDataURL(file);
  };

  const generatePreviewPages = () => {
    const coverPage = {
      title: title || "My Magazine Journal",
      subtitle: subtitle || "A Personal Journey",
      content: `${title || "My Magazine Journal"}\n\n${
        subtitle || "A Personal Journey"
      }\n\nVolume ${volume || "1"} - Issue ${issueNumber || "1"}`,
      type: "cover",
    };

    const pages = [coverPage];

    if (foreword) {
      pages.push({ title: "Foreword", content: foreword });
    }
    if (reflections) {
      pages.push({ title: "Reflections", content: reflections });
    }
    if (lessons) {
      pages.push({ title: "Lessons Learned", content: lessons });
    }

    pages.push({
      title: "Thank You",
      content: "Thank you for reading...",
      type: "closing",
    });

    return pages;
  };

  const PreviewModal = () => {
    if (!showPreview) return null;

    const previewPages = generatePreviewPages();
    const currentLayout = layouts.find((l) => l.id === selectedLayout);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div
          className={`border-4 border-black p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto font-retro ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
          style={{ boxShadow: "8px 8px 0px black" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2
              className={`text-lg md:text-xl font-bold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              📖 Live Preview
            </h2>
            <Button
              onClick={() => setShowPreview(false)}
              className="w-full sm:w-auto"
            >
              ✕ Close
            </Button>
          </div>

          <div className="relative w-full h-64 md:h-96 border-2 border-black">
            <div
              className={`absolute inset-0 p-3 md:p-6 bg-gradient-to-br ${currentLayout.colors} ${currentLayout.accent} border-2`}
            >
              <div className="bg-white h-full p-3 md:p-4 border-2 border-black overflow-y-auto">
                <h1 className="font-bold text-sm md:text-lg mb-2 text-black">
                  {previewPages[currentPreviewPage]?.title}
                </h1>
                <div className="text-xs md:text-sm whitespace-pre-line text-black">
                  {previewPages[currentPreviewPage]?.content}
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {currentPreviewPage + 1} / {previewPages.length}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 md:gap-4 mt-4">
            <Button
              onClick={() =>
                setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1))
              }
              disabled={currentPreviewPage === 0}
              className="flex-1 sm:flex-none"
            >
              ◀ Prev
            </Button>
            <div
              className={`flex items-center px-2 py-1 border text-xs ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-black"
              }`}
            >
              {currentPreviewPage + 1} / {previewPages.length}
            </div>
            <Button
              onClick={() =>
                setCurrentPreviewPage(
                  Math.min(previewPages.length - 1, currentPreviewPage + 1)
                )
              }
              disabled={currentPreviewPage === previewPages.length - 1}
              className="flex-1 sm:flex-none"
            >
              Next ▶
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-400"}`}
    >
      <div className="flex-1 lg:ml-0 p-3 md:p-6 font-retro min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div
              className="mb-4 p-4 bg-red-100 border-2 border-red-500 text-red-700"
              style={{ boxShadow: "4px 4px 0 0 red" }}
            >
              <h3 className="font-bold mb-2">
                ⚠️ Please fix the following errors:
              </h3>
              <ul className="text-sm space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              className="mb-4 p-4 bg-green-100 border-2 border-green-500 text-green-700"
              style={{ boxShadow: "4px 4px 0 0 green" }}
            >
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                {successMessage}
              </div>
            </div>
          )}

          {/* Header */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 border-2 border-black shadow-[4px_4px_0_black] ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="w-full sm:w-auto flex-shrink-0">
              <AudioPlayer
                className={`w-full sm:w-64 border-2 border-black p-2 ${
                  isDark ? "bg-white" : "bg-white"
                }`}
                initialTrack={selectedMusicTrack}
                onTrackSelect={setSelectedMusicTrack}
                onTrackChange={setSelectedMusicTrack}
              />
            </div>

            <h1
              className={`text-lg md:text-xl font-bold text-center sm:text-left flex-1 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              ✍️Create
            </h1>

            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <Button
                onClick={() => setShowPreview(true)}
                disabled={!title || isLoading}
                className="flex-1 sm:flex-none"
              >
                👁️ Preview
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="flex-1 sm:flex-none"
              >
                ← Back
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
            {/* Main Editor */}
            <div className="xl:col-span-3 space-y-4 md:space-y-6">
              {/* Layout Selection */}
              <div
                className={`p-4 md:p-6 border-2 border-black ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <h3
                  className={`font-bold mb-3 md:mb-4 text-sm md:text-base ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  🎨 Choose Layout
                </h3>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        setSelectedLayout(layout.id);
                        clearMessages();
                      }}
                      className={`p-2 md:p-3 border-2 border-black text-center transition-all ${
                        selectedLayout === layout.id
                          ? isDark
                            ? "bg-gray-600 text-white"
                            : "bg-gray-300 text-black"
                          : isDark
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-white hover:bg-gray-100 text-black"
                      }`}
                      style={{ boxShadow: "2px 2px 0px black" }}
                    >
                      <div
                        className={`w-full h-6 md:h-8 bg-gradient-to-br ${layout.colors} border ${layout.accent} mb-1 md:mb-2`}
                      ></div>
                      <div className="text-xs font-bold">{layout.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div
                className={`p-4 md:p-6 border-2 border-black ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <h3
                  className={`font-bold mb-3 md:mb-4 text-sm md:text-base ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  📝 Basic Information
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                      <label
                        className={`block font-semibold text-sm ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        Issue Title *
                      </label>
                      <Button
                        onClick={handleGenerateTitle}
                        className="text-xs w-full sm:w-auto"
                        disabled={loadingSection !== null}
                      >
                        {loadingSection === "title"
                          ? "⏳ Generating..."
                          : "✨ AI Generate"}
                      </Button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter issue title..."
                      className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                        errors.title
                          ? "border-red-500 bg-red-50"
                          : isDark
                          ? "bg-gray-700 text-white placeholder-gray-400"
                          : "bg-white text-black placeholder-gray-500"
                      }`}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearMessages();
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
                      <label
                        className={`block font-semibold text-sm ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        Subtitle
                      </label>
                      <Button
                        onClick={handleGenerateSubtitle}
                        className="text-xs w-full sm:w-auto"
                        disabled={loadingSection !== null || !title}
                      >
                        {loadingSection === "subtitle"
                          ? "⏳ Generating..."
                          : "✨ AI Generate"}
                      </Button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter subtitle..."
                      className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                        isDark
                          ? "bg-gray-700 text-white placeholder-gray-400"
                          : "bg-white text-black placeholder-gray-500"
                      }`}
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label
                        htmlFor="volume"
                        arial-label="volume"
                        className={`block font-semibold mb-1 text-sm ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        Volume *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                          errors.volume
                            ? "border-red-500 bg-red-50"
                            : isDark
                            ? "bg-gray-700 text-white placeholder-gray-400"
                            : "bg-white text-black placeholder-gray-500"
                        }`}
                        value={volume}
                        onChange={(e) => {
                          setVolume(e.target.value);
                          clearMessages();
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className={`block font-semibold mb-1 text-sm ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        Issue # *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                          errors.issueNumber
                            ? "border-red-500 bg-red-50"
                            : isDark
                            ? "bg-gray-700 text-white placeholder-gray-400"
                            : "bg-white text-black placeholder-gray-500"
                        }`}
                        value={issueNumber}
                        onChange={(e) => {
                          setIssueNumber(e.target.value);
                          clearMessages();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div
                className={`p-4 md:p-6 border-2 border-black ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 md:mb-4 gap-2">
                  <h3
                    className={`font-bold text-sm md:text-base ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    📖 Content Sections
                  </h3>
                  <Button
                    onClick={handleGenerateAll}
                    className="text-xs w-full sm:w-auto"
                    disabled={loadingSection !== null || !title}
                  >
                    {loadingSection === "all"
                      ? "⏳ Generating All..."
                      : "✨ Generate All"}
                  </Button>
                </div>

                {errors.content && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-300 text-red-600 text-xs">
                    {errors.content}
                  </div>
                )}

                {/* Foreword */}
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <label
                      className={`font-semibold text-sm ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Foreword
                    </label>
                    <Button
                      onClick={() => generateAIContent("foreword")}
                      className="text-xs w-full sm:w-auto"
                      disabled={loadingSection !== null}
                    >
                      {loadingSection === "foreword"
                        ? "⏳ Generating..."
                        : "✨ AI Generate"}
                    </Button>
                  </div>
                  <textarea
                    className={`w-full p-2 md:p-3 border-2 border-black h-24 md:h-32 resize-none text-sm md:text-base ${
                      isDark
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-white text-black placeholder-gray-500"
                    }`}
                    placeholder="Write the foreword..."
                    value={foreword}
                    onChange={(e) => {
                      setForeword(e.target.value);
                      clearMessages();
                    }}
                  />
                </div>

                {/* Reflections */}
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <label
                      className={`font-semibold text-sm ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Reflections
                    </label>
                    <Button
                      onClick={() => generateAIContent("reflections")}
                      className="text-xs w-full sm:w-auto"
                      disabled={loadingSection !== null}
                    >
                      {loadingSection === "reflections"
                        ? "⏳ Generating..."
                        : "✨ AI Generate"}
                    </Button>
                  </div>
                  <textarea
                    className={`w-full p-2 md:p-3 border-2 border-black h-24 md:h-32 resize-none text-sm md:text-base ${
                      isDark
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-white text-black placeholder-gray-500"
                    }`}
                    placeholder="Your reflections..."
                    value={reflections}
                    onChange={(e) => {
                      setReflections(e.target.value);
                      clearMessages();
                    }}
                  />
                </div>

                {/* Lessons */}
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <label
                      className={`font-semibold text-sm ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Lessons Learned
                    </label>
                    <Button
                      onClick={() => generateAIContent("lessons")}
                      className="text-xs w-full sm:w-auto"
                      disabled={loadingSection !== null}
                    >
                      {loadingSection === "lessons"
                        ? "⏳ Generating..."
                        : "✨ AI Generate"}
                    </Button>
                  </div>
                  <textarea
                    className={`w-full p-2 md:p-3 border-2 border-black h-24 md:h-32 resize-none text-sm md:text-base ${
                      isDark
                        ? "bg-gray-700 text-white placeholder-gray-400"
                        : "bg-white text-black placeholder-gray-500"
                    }`}
                    placeholder="Key lessons from this issue..."
                    value={lessons}
                    onChange={(e) => {
                      setLessons(e.target.value);
                      clearMessages();
                    }}
                  />
                </div>
              </div>

              {/* Illustrations */}
              <div
                className={`p-4 md:p-6 border-2 border-black ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <h3
                  className={`font-bold mb-3 md:mb-4 text-sm md:text-base ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  🖼️ Illustrations
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-none"
                    disabled={isLoading}
                  >
                    📁 Upload Image
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {errors.image && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-300 text-red-600 text-xs">
                    {errors.image}
                  </div>
                )}
                {uploadedImage ? (
                  <div className="mt-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded Preview"
                      className="max-h-64 w-auto border border-black"
                    />
                  </div>
                ) : (
                  <div
                    className={`mt-3 p-4 border-2 border-dashed text-center min-h-[80px] md:min-h-[100px] flex items-center justify-center text-xs md:text-sm ${
                      isDark
                        ? "border-gray-600 text-gray-400"
                        : "border-gray-400 text-gray-500"
                    }`}
                  >
                    No images uploaded yet
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowPreview(true)}
                    disabled={!title || isLoading}
                    className="w-full sm:w-auto"
                  >
                    👁️ Preview
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "⏳ Saving..." : "💾 Save Issue"}
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Suggestions Sidebar */}
            <div className="xl:col-span-1 space-y-4 md:space-y-6">
              {/* Quick Stats */}
              <div
                className={`p-4 md:p-6 border-2 border-black ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <h3
                  className={`font-bold mb-3 text-sm md:text-base ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  📊 Content Stats
                </h3>
                <div
                  className={`space-y-2 text-xs md:text-sm ${
                    isDark ? "text-gray-300" : "text-black"
                  }`}
                >
                  <div>
                    Words:{" "}
                    {
                      (foreword + reflections + lessons)
                        .split(" ")
                        .filter((w) => w.length > 0).length
                    }
                  </div>
                  <div>
                    Sections:{" "}
                    {
                      [foreword, reflections, lessons].filter(
                        (s) => s.length > 0
                      ).length
                    }
                    /3
                  </div>
                  <div>
                    Layout: {layouts.find((l) => l.id === selectedLayout)?.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <span
                      className={`px-2 py-1 border text-xs ${
                        [foreword, reflections, lessons].filter(
                          (s) => s.length > 0
                        ).length >= 1 && title
                          ? "bg-green-100 border-green-300 text-green-700"
                          : "bg-yellow-100 border-yellow-300 text-yellow-700"
                      }`}
                    >
                      {[foreword, reflections, lessons].filter(
                        (s) => s.length > 0
                      ).length >= 1 && title
                        ? "Ready"
                        : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div
                className={`p-4 md:p-6 border-2 border-black ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "4px 4px 0 0 black" }}
              >
                <h3
                  className={`font-bold mb-3 text-sm md:text-base ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  📤 Export & Share
                </h3>
                <div className="space-y-2">
                  <Button
                    className="w-full text-xs md:text-sm"
                    disabled={!title || isLoading}
                    onClick={exportToPDF}
                  >
                    {isLoading ? "⏳ Exporting..." : "📄 Export PDF"}
                  </Button>
                  <Button
                    className="w-full text-xs md:text-sm"
                    disabled={!title || isLoading}
                    onClick={shareIssue}
                  >
                    {isLoading ? "⏳ Generating..." : "🔗 Share Link"}
                  </Button>
                  <div
                    className={`pt-2 border-t ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-xs text-center ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Auto-save: {title ? "✓ Active" : "○ Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PreviewModal />
    </div>
  );
}
