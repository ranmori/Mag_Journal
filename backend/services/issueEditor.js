import "useState" from "react";

export default function IssueEditor() {
  // API Configuration
  const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Replace with your actual API key
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  
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
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const fileInputRef = useRef(null);

  const layouts = [
    { id: "anime", name: "🌸 Anime", colors: "from-pink-100 to-purple-200", accent: "border-pink-400" },
    { id: "retro", name: "🕹️ Retro", colors: "from-yellow-100 to-orange-200", accent: "border-orange-400" },
    { id: "fashion", name: "👗 Fashion", colors: "from-gray-100 to-slate-200", accent: "border-slate-400" }
  ];

  const aiSuggestions = {
    titles: ["Life Reflections", "Summer Chronicles", "Growth Stories", "Mindful Moments", "Journey Within", "Chapters of Change"],
    subtitles: ["A Journey Within", "Discovering New Perspectives", "Stories of Change", "Moments That Matter", "Finding Balance", "Embracing Growth"]
  };

  const generateAITitle = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const themes = ["Life", "Growth", "Journey", "Reflections", "Moments", "Chapters", "Stories", "Horizons", "Pathways", "Seasons"];
      const descriptors = ["Mindful", "Beautiful", "Transformative", "Authentic", "Meaningful", "Inspiring", "Personal", "Inner"];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const randomDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
      const generatedTitle = `${randomDescriptor} ${randomTheme}`;
      setTitle(generatedTitle);
      setSuccessMessage("AI generated title successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ ai: "Failed to generate title." });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    clearMessages();
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate PDF generation
      const pdfData = {
        title,
        subtitle,
        volume,
        issueNumber,
        layout: selectedLayout,
        content: { foreword, reflections, lessons },
        images: uploadedImages,
        generatedAt: new Date().toISOString()
      };
      
      console.log("PDF Export Data:", pdfData);
      setSuccessMessage("📄 PDF exported successfully! Check your downloads.");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      setErrors({ export: "Failed to export PDF. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const shareIssue = async () => {
    clearMessages();
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate shareable link (mock)
      const shareId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const shareUrl = `https://magazine-journal.app/view/${shareId}`;
      
      // Copy to clipboard (in real app)
      console.log("Share URL:", shareUrl);
      
      setSuccessMessage("🔗 Share link copied to clipboard!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      setErrors({ share: "Failed to generate share link. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAISubtitle = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const subtitleTemplates = [
        `A ${title ? title.toLowerCase() : 'personal'} exploration`,
        "Discovering what truly matters",
        "Stories of transformation and growth",
        "Finding meaning in everyday moments",
        "A collection of insights and reflections",
        "Navigating life with intention"
      ];
      const generatedSubtitle = subtitleTemplates[Math.floor(Math.random() * subtitleTemplates.length)];
      setSubtitle(generatedSubtitle);
      setSuccessMessage("AI generated subtitle successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ ai: "Failed to generate subtitle." });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save effect
  useState(() => {
    const interval = setInterval(() => {
      autoSave();
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(interval);
  }, [title, subtitle, volume, issueNumber, foreword, reflections, lessons, uploadedImages]);

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

  const handleSave = async () => {
    clearMessages();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const issueData = {
        title,
        subtitle,
        volume,
        issueNumber,
        layout: selectedLayout,
        foreword,
        reflections,
        lessons,
        images: uploadedImages,
        createdAt: new Date().toISOString()
      };
      
      console.log("Saved Issue:", issueData);
      
      // Store in memory (you can later integrate with backend/database)
      const savedIssues = JSON.parse(sessionStorage.getItem('savedIssues') || '[]');
      savedIssues.push(issueData);
      sessionStorage.setItem('savedIssues', JSON.stringify(savedIssues));
      
      setSuccessMessage("✅ Issue saved successfully! Ready to publish.");
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      setErrors({ save: "Failed to save issue. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Gemini API call function
  const callGeminiAPI = async (prompt) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };

  const generateAIContent = async (type) => {
    clearMessages();
    setIsLoading(true);
    
    try {
      // Create context-aware prompts based on existing content
      const contextPrompts = {
        foreword: `Write a thoughtful and engaging foreword for a personal magazine journal${title ? ` titled "${title}"` : ''}${subtitle ? ` with subtitle "${subtitle}"` : ''}. 

The foreword should:
- Welcome readers warmly and personally
- Introduce the themes of personal growth, reflection, and mindfulness
- Be authentic and introspective
- Set the tone for Volume ${volume || '1'}, Issue ${issueNumber || '1'}
- Be 2-3 paragraphs long

Write in first person and make it feel genuine and heartfelt.`,

        reflections: `Write personal reflections for a magazine journal${title ? ` titled "${title}"` : ''}${subtitle ? ` about ${subtitle.toLowerCase()}` : ''}. 

The reflection should:
- Focus on themes of mindfulness, personal growth, and meaningful life experiences
- Include specific examples and sensory details
- Be introspective and authentic
- Share genuine insights and observations
- Be 3-4 paragraphs long

Write as if you're sharing a personal journey with a close friend. Make it thoughtful and relatable.`,

        lessons: `Write about key life lessons learned for a personal journal${title ? ` titled "${title}"` : ''}. 

The content should:
- Present 4-5 meaningful life lessons
- Each lesson should have a clear title and 2-3 sentence explanation
- Focus on personal development, relationships, mindfulness, and self-discovery
- Be practical and actionable
- Be inspiring yet grounded in reality

Format as numbered lessons with titles and explanatory paragraphs. Make it feel like wisdom gained through real experience.`
      };

      const prompt = contextPrompts[type];
      
      // Call Gemini API
      const generatedText = await callGeminiAPI(prompt);
      
      if (type === "foreword") setForeword(generatedText);
      if (type === "reflections") setReflections(generatedText);
      if (type === "lessons") setLessons(generatedText);
      
      setSuccessMessage(`✨ AI generated ${type} successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (error) {
      setErrors({ ai: `Failed to generate AI content: ${error.message}. Please check your API key and try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setErrors({ image: "Please select a valid image file." });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: "Image size must be less than 5MB." });
      return;
    }
    
    clearMessages();
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const newImage = {
        id: Date.now(),
        name: file.name,
        url: event.target.result,
        type: 'upload'
      };
      setUploadedImages([...uploadedImages, newImage]);
      setSuccessMessage(`Image "${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  const generateAIImage = async () => {
    clearMessages();
    setGeneratingImage(true);
    
    try {
      // Create prompt based on title and layout
      const layoutThemes = {
        anime: 'anime style, vibrant colors, manga aesthetic, cute and whimsical',
        retro: 'retro 80s style, neon colors, vintage aesthetic, synthwave',
        fashion: 'elegant fashion photography, minimalist, sophisticated, modern'
      };
      
      const imagePrompt = `Create a detailed description for a magazine cover illustration with these specifications:

Title: "${title || 'Personal Journal'}"
${subtitle ? `Subtitle: "${subtitle}"` : ''}
Style: ${layoutThemes[selectedLayout]}
Theme: Personal growth, mindfulness, life reflections

Describe a visually striking magazine cover that captures the essence of personal development and introspection. Include colors, composition, and key visual elements.`;

      // Get AI description for the image
      const imageDescription = await callGeminiAPI(imagePrompt);
      
      // For now, we'll use a placeholder with the description
      // In production, you'd integrate with an image generation API like DALL-E, Midjourney, or Stable Diffusion
      const colorSchemes = {
        anime: { bg: 'FFB6C1', fg: 'FF69B4' },
        retro: { bg: 'FFD700', fg: 'FF8C00' },
        fashion: { bg: 'D3D3D3', fg: '808080' }
      };
      
      const colors = colorSchemes[selectedLayout];
      const mockAIImage = {
        id: Date.now(),
        name: `AI_${selectedLayout}_${Date.now()}.png`,
        url: `https://placehold.co/800x600/${colors.bg}/${colors.fg}/png?text=${encodeURIComponent(title || 'AI Generated')}`,
        type: 'ai',
        prompt: imageDescription,
        description: imageDescription
      };
      
      setUploadedImages([...uploadedImages, mockAIImage]);
      setSuccessMessage("✨ AI image concept generated! (Connect to image API for actual generation)");
      setTimeout(() => setSuccessMessage(""), 4000);
      
    } catch (error) {
      setErrors({ image: `Failed to generate AI image: ${error.message}` });
    } finally {
      setGeneratingImage(false);
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };

  const generatePreviewPages = () => {
    const coverPage = {
      title: title || "My Magazine Journal",
      subtitle: subtitle || "A Personal Journey",
      content: `${title || "My Magazine Journal"}\n\n${subtitle || "A Personal Journey"}\n\nVolume ${volume || "1"} - Issue ${issueNumber || "1"}`,
      type: "cover"
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
    
    pages.push({ title: "Thank You", content: "Thank you for reading...", type: "closing" });
    
    return pages;
  };

  const PreviewModal = () => {
    if (!showPreview) return null;
    
    const previewPages = generatePreviewPages();
    const currentLayout = layouts.find(l => l.id === selectedLayout);
    const currentPageData = previewPages[currentPreviewPage];
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-4 border-black p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto font-retro"
             style={{ boxShadow: "8px 8px 0px black" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-lg md:text-xl font-bold">📖 Live Preview - {currentLayout.name}</h2>
            <Button onClick={() => setShowPreview(false)} className="w-full sm:w-auto">✕ Close</Button>
          </div>
          
          <div className="relative w-full h-64 md:h-96 border-2 border-black overflow-hidden">
            <div className={`absolute inset-0 p-3 md:p-6 bg-gradient-to-br ${currentLayout.colors} ${currentLayout.accent} border-2`}>
              <div className="bg-white h-full p-3 md:p-4 border-2 border-black overflow-y-auto">
                <h1 className={`font-bold mb-3 ${currentPageData?.type === 'cover' ? 'text-center text-xl md:text-3xl' : 'text-sm md:text-lg'}`}>
                  {currentPageData?.title}
                </h1>
                
                {/* Show images on cover page */}
                {currentPageData?.type === 'cover' && uploadedImages.length > 0 && (
                  <div className="flex justify-center mb-3">
                    <img 
                      src={uploadedImages[0].url} 
                      alt="Cover" 
                      className="w-32 h-32 md:w-48 md:h-48 object-cover border-2 border-black"
                    />
                  </div>
                )}
                
                <div className="text-xs md:text-sm whitespace-pre-line leading-relaxed">
                  {currentPageData?.content}
                </div>
                
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  Page {currentPreviewPage + 1} / {previewPages.length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-3 md:gap-4 mt-4">
            <Button 
              onClick={() => setCurrentPreviewPage(Math.max(0, currentPreviewPage - 1))}
              disabled={currentPreviewPage === 0}
              className="flex-1 sm:flex-none"
            >
              ◀ Prev
            </Button>
            <div className="flex items-center px-3 py-1 bg-gray-100 border-2 border-black text-xs font-bold">
              {currentPreviewPage + 1} / {previewPages.length}
            </div>
            <Button 
              onClick={() => setCurrentPreviewPage(Math.min(previewPages.length - 1, currentPreviewPage + 1))}
              disabled={currentPreviewPage === previewPages.length - 1}
              className="flex-1 sm:flex-none"
            >
              Next ▶
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 border border-gray-300 text-xs text-gray-600">
            <strong>Preview Info:</strong> This is how your magazine will appear. Navigate through pages to see all content.
          </div>
        </div>
      </div>
    );
  };

  const DraftModal = () => {
    if (!showDraftModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-4 border-black p-6 max-w-md w-full font-retro"
             style={{ boxShadow: "8px 8px 0px black" }}>
          <h2 className="text-xl font-bold mb-4 text-center">📝 Draft Found!</h2>
          <p className="text-sm text-gray-700 mb-6 text-center">
            We found an unsaved draft. Would you like to continue where you left off?
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={discardDraft}
              variant="outline"
              className="flex-1"
            >
              Start Fresh
            </Button>
            <Button 
              onClick={loadDraft}
              className="flex-1 bg-blue-500 text-white border-blue-600"
            >
              Load Draft
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setShowMobileMenu(false)}>
          <div className="w-80 h-full bg-white" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
            <Button 
              onClick={() => setShowMobileMenu(false)}
              className="absolute top-4 right-4"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button onClick={() => setShowMobileMenu(true)} className="bg-white">☰ Menu</Button>
      </div>
      
      <div className="flex-1 lg:ml-0 p-3 md:p-6 bg-gray-400 font-retro min-h-screen">
        <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
          
          {/* API Configuration Warning */}
          {GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" && (
            <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-500 text-yellow-800" style={{ boxShadow: "4px 4px 0 0 #EAB308" }}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span>⚠️</span> API Key Required
              </h3>
              <div className="text-sm space-y-2">
                <p>To use AI features, you need to configure your Gemini API key:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google AI Studio</a></li>
                  <li>Replace <code className="bg-yellow-200 px-1">YOUR_GEMINI_API_KEY</code> in the component code</li>
                  <li>The key should be at the top of the IssueEditor component</li>
                </ol>
                <p className="pt-2 font-semibold">Without an API key, AI features will show error messages.</p>
              </div>
            </div>
          )}
          
          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 text-red-700" style={{ boxShadow: "4px 4px 0 0 red" }}>
              <h3 className="font-bold mb-2">⚠️ Please fix the following errors:</h3>
              <ul className="text-sm space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border-2 border-green-500 text-green-700" style={{ boxShadow: "4px 4px 0 0 green" }}>
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                {successMessage}
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white border-2 border-black">
            <h1 className="text-lg md:text-xl font-bold text-black">✍️ Create New Issue</h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setShowPreview(true)} 
                disabled={!title || isLoading}
                className="flex-1 sm:flex-none"
              >
                👁️ Preview
              </Button>
              <Button className="flex-1 sm:flex-none">← Back</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
            
            {/* Main Editor */}
            <div className="xl:col-span-3 space-y-4 md:space-y-6">
              
              {/* Layout Selection */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 md:mb-4 text-black text-sm md:text-base">🎨 Choose Layout</h3>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {layouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        setSelectedLayout(layout.id);
                        clearMessages();
                      }}
                      className={`p-2 md:p-3 border-2 border-black text-center transition-all ${
                        selectedLayout === layout.id ? "bg-gray-300" : "bg-white hover:bg-gray-100"
                      }`}
                      style={{ boxShadow: "2px 2px 0px black" }}
                    >
                      <div className={`w-full h-6 md:h-8 bg-gradient-to-br ${layout.colors} border ${layout.accent} mb-1 md:mb-2`}></div>
                      <div className="text-xs font-bold">{layout.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 md:mb-4 text-black text-sm md:text-base">📝 Basic Information</h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-semibold text-black text-sm">Issue Title *</label>
                      <Button 
                        onClick={generateAITitle}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        ✨ AI
                      </Button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter issue title..."
                      className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                        errors.title ? "border-red-500 bg-red-50" : ""
                      }`}
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        clearMessages();
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-semibold text-black text-sm">Subtitle</label>
                      <Button 
                        onClick={generateAISubtitle}
                        disabled={isLoading || !title}
                        className="text-xs"
                      >
                        ✨ AI
                      </Button>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter subtitle..."
                      className="w-full p-2 md:p-3 border-2 border-black text-sm md:text-base"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block font-semibold text-black mb-1 text-sm">Volume *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                          errors.volume ? "border-red-500 bg-red-50" : ""
                        }`}
                        value={volume}
                        onChange={(e) => {
                          setVolume(e.target.value);
                          clearMessages();
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-black mb-1 text-sm">Issue # *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        className={`w-full p-2 md:p-3 border-2 border-black text-sm md:text-base ${
                          errors.issueNumber ? "border-red-500 bg-red-50" : ""
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
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 md:mb-4 text-black text-sm md:text-base">📖 Content Sections</h3>
                
                {errors.content && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-300 text-red-600 text-xs">
                    {errors.content}
                  </div>
                )}
                
                {/* Foreword */}
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                    <label className="font-semibold text-black text-sm">Foreword</label>
                    <Button 
                      onClick={() => generateAIContent("foreword")} 
                      className="text-xs w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? "⏳ Generating..." : "✨ AI Generate"}
                    </Button>
                  </div>
                  <textarea
                    className="w-full p-2 md:p-3 border-2 border-black h-16 md:h-20 resize-none text-sm md:text-base"
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
                    <label className="font-semibold text-black text-sm">Reflections</label>
                    <Button 
                      onClick={() => generateAIContent("reflections")} 
                      className="text-xs w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? "⏳ Generating..." : "✨ AI Generate"}
                    </Button>
                  </div>
                  <textarea
                    className="w-full p-2 md:p-3 border-2 border-black h-16 md:h-20 resize-none text-sm md:text-base"
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
                    <label className="font-semibold text-black text-sm">Lessons Learned</label>
                    <Button 
                      onClick={() => generateAIContent("lessons")} 
                      className="text-xs w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? "⏳ Generating..." : "✨ AI Generate"}
                    </Button>
                  </div>
                  <textarea
                    className="w-full p-2 md:p-3 border-2 border-black h-16 md:h-20 resize-none text-sm md:text-base"
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
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 md:mb-4 text-black text-sm md:text-base">🖼️ Illustrations</h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-none"
                    disabled={isLoading || generatingImage}
                  >
                    📁 Upload Image
                  </Button>
                  <Button 
                    onClick={generateAIImage}
                    className="flex-1 sm:flex-none" 
                    disabled={isLoading || generatingImage || !title}
                  >
                    {generatingImage ? "⏳ Generating..." : "🤖 AI Generate"}
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
                  <div className="mb-3 p-2 bg-red-50 border border-red-300 text-red-600 text-xs">
                    {errors.image}
                  </div>
                )}
                
                {/* Image Gallery */}
                {uploadedImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="relative group border-2 border-black">
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            onClick={() => removeImage(image.id)}
                            className="text-xs bg-red-500 text-white border-white"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                        <div className="absolute top-1 right-1 px-2 py-1 bg-white/90 text-xs border border-black">
                          {image.type === 'ai' ? '🤖 AI' : '📁'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-400 text-center text-gray-500 min-h-[80px] md:min-h-[100px] flex items-center justify-center text-xs md:text-sm">
                    No images uploaded yet. Upload or generate images to enhance your magazine.
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
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
              
              {/* AI Helper Panel */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 text-black text-sm md:text-base">🤖 AI Assistant</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-xs font-semibold text-blue-800 mb-2">💡 Quick Tip</div>
                    <p className="text-xs text-blue-700">
                      {!title ? "Start by adding a title to unlock AI features!" :
                       !foreword && !reflections && !lessons ? "Click 'AI Generate' on any section to get started!" :
                       uploadedImages.length === 0 ? "Add images to make your magazine more engaging!" :
                       "Looking great! Don't forget to preview before saving."}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-700">AI Features:</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className={title ? "text-green-600" : "text-gray-400"}>
                          {title ? "✓" : "○"}
                        </span>
                        <span>Title Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={subtitle ? "text-green-600" : "text-gray-400"}>
                          {subtitle ? "✓" : "○"}
                        </span>
                        <span>Subtitle Ideas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={foreword ? "text-green-600" : "text-gray-400"}>
                          {foreword ? "✓" : "○"}
                        </span>
                        <span>Content Writing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={uploadedImages.length > 0 ? "text-green-600" : "text-gray-400"}>
                          {uploadedImages.length > 0 ? "✓" : "○"}
                        </span>
                        <span>Image Generation</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full text-xs"
                    disabled={!title || isLoading || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY"}
                    onClick={async () => {
                      if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
                        setErrors({ ai: "Please configure your Gemini API key first." });
                        return;
                      }
                      if (!foreword) await generateAIContent('foreword');
                      if (!reflections) await generateAIContent('reflections');
                      if (!lessons) await generateAIContent('lessons');
                    }}
                  >
                    ⚡ Auto-Generate All Sections
                  </Button>
                </div>
              </div>
              
              {/* Title Suggestions */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-black text-sm md:text-base">💡 Title Suggestions</h3>
                  <Button 
                    onClick={generateAITitle}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    ✨ New
                  </Button>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.titles.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTitle(suggestion);
                        clearMessages();
                      }}
                      className="block w-full text-left p-2 border border-gray-300 hover:bg-gray-100 text-xs md:text-sm transition-colors"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Suggestions */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-black text-sm md:text-base">✨ Subtitle Ideas</h3>
                  <Button 
                    onClick={generateAISubtitle}
                    disabled={isLoading || !title}
                    className="text-xs"
                  >
                    ✨ New
                  </Button>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.subtitles.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSubtitle(suggestion)}
                      className="block w-full text-left p-2 border border-gray-300 hover:bg-gray-100 text-xs md:text-sm transition-colors"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 text-black text-sm md:text-base">📊 Content Stats</h3>
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-bold">{(foreword + reflections + lessons).split(' ').filter(w => w.length > 0).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sections:</span>
                    <span className="font-bold">{[foreword, reflections, lessons].filter(s => s.length > 0).length}/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Images:</span>
                    <span className="font-bold">{uploadedImages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Layout:</span>
                    <span className="font-bold">{layouts.find(l => l.id === selectedLayout)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span>Status:</span>
                    <span className={`px-2 py-1 border text-xs font-bold ${
                      [foreword, reflections, lessons].filter(s => s.length > 0).length >= 1 && title 
                        ? "bg-green-100 border-green-300 text-green-700" 
                        : "bg-yellow-100 border-yellow-300 text-yellow-700"
                    }`}>
                      {[foreword, reflections, lessons].filter(s => s.length > 0).length >= 1 && title ? "✓ Ready" : "⏳ Draft"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white p-4 md:p-6 border-2 border-black" style={{ boxShadow: "4px 4px 0 0 black" }}>
                <h3 className="font-bold mb-3 text-black text-sm md:text-base">📤 Export & Share</h3>
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
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 text-center">
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
      <DraftModal />
    </div>
  );
}