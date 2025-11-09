// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase limit for base64 images

const MONGODB_URI = process.env.MONGODB_URI || process.env.mongodb_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("✅ GEMINI_API_KEY loaded:", !!GEMINI_API_KEY);
console.log("✅ MONGODB_URI loaded:", !!MONGODB_URI);

// ============== GEMINI API FUNCTIONS ==============
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

const callGeminiAPI = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const generateTitle = async () => {
  const prompt = `Generate a creative and meaningful title for a personal magazine journal about personal growth, mindfulness, and life reflections.

Requirements:
- Should be 2-4 words
- Inspiring and memorable
- Suitable for a personal development magazine
- Can include words like: Journey, Reflections, Growth, Moments, Life, Stories, Chapters, Horizons, etc.

Provide only the title, nothing else. No quotes, no explanations.`;

  return await callGeminiAPI(prompt);
};

const generateSubtitle = async (title) => {
  const prompt = `Generate a compelling subtitle for a personal magazine journal titled "${
    title || "Personal Journal"
  }".

Requirements:
- Should complement the main title
- 4-8 words long
- Inspiring and meaningful
- Focus on themes of personal growth, discovery, or transformation

Provide only the subtitle, nothing else. No quotes, no explanations.`;

  return await callGeminiAPI(prompt);
};

const generateContent = async ({
  type,
  title,
  subtitle,
  volume,
  issueNumber,
}) => {
  const prompts = {
    foreword: `Write a thoughtful and engaging foreword for a personal magazine journal${
      title ? ` titled "${title}"` : ""
    }${subtitle ? ` with subtitle "${subtitle}"` : ""}. 

The foreword should:
- Welcome readers warmly and personally
- Introduce the themes of personal growth, reflection, and mindfulness
- Be authentic and introspective
- Set the tone for Volume ${volume || "1"}, Issue ${issueNumber || "1"}
- Be 2-3 paragraphs long (approximately 150-200 words)

Write in first person and make it feel genuine and heartfelt. Start with "Dear Reader," and maintain an intimate, conversational tone.`,

    reflections: `Write personal reflections for a magazine journal${
      title ? ` titled "${title}"` : ""
    }${subtitle ? ` about ${subtitle.toLowerCase()}` : ""}. 

The reflection should:
- Focus on themes of mindfulness, personal growth, and meaningful life experiences
- Include specific examples and sensory details
- Be introspective and authentic
- Share genuine insights and observations
- Be 3-4 paragraphs long (approximately 250-300 words)

Write as if you're sharing a personal journey with a close friend. Make it thoughtful, relatable, and emotionally resonant. Use vivid imagery and personal anecdotes.`,

    lessons: `Write about key life lessons learned for a personal journal${
      title ? ` titled "${title}"` : ""
    }. 

The content should:
- Present 4-5 meaningful life lessons
- Each lesson should have a clear, compelling title
- Each lesson should have 2-3 sentences of explanation
- Focus on personal development, relationships, mindfulness, and self-discovery
- Be practical and actionable
- Be inspiring yet grounded in reality

Format as numbered lessons with titles and explanatory paragraphs. Make it feel like wisdom gained through real experience. Use this format:

1. [Lesson Title]
[2-3 sentences explaining the lesson]

2. [Lesson Title]
[2-3 sentences explaining the lesson]

And so on...`,
  };

  const prompt = prompts[type];
  if (!prompt) throw new Error(`Invalid content type: ${type}`);
  return await callGeminiAPI(prompt);
};

const generateAllSections = async ({
  title,
  subtitle,
  volume,
  issueNumber,
}) => {
  const [foreword, reflections, lessons] = await Promise.all([
    generateContent({ type: "foreword", title, subtitle, volume, issueNumber }),
    generateContent({
      type: "reflections",
      title,
      subtitle,
      volume,
      issueNumber,
    }),
    generateContent({ type: "lessons", title, subtitle, volume, issueNumber }),
  ]);
  return { foreword, reflections, lessons };
};

// ============== DATABASE SCHEMA ==============
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  volume: { type: String, required: true },
  issueNumber: { type: String, required: true },
  layout: { type: String, default: "retro" },
  foreword: String,
  reflections: String,
  lessons: String,
  images: Array,
  // Add music track data
  musicTrack: {
    id: Number,
    title: String,
    artist: {
      name: String,
    },
    album: {
      cover_medium: String,
    },
    preview: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Issue = mongoose.model("Issue", issueSchema);

// ============== API ROUTES ==============

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: !!GEMINI_API_KEY,
    mongodbConfigured: !!MONGODB_URI,
  });
});

// ===== GEMINI AI ROUTES =====
app.post("/api/gemini/generate-title", async (req, res) => {
  try {
    const title = await generateTitle();
    res.json({ data: { title } });
  } catch (err) {
    console.error("Generate title error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/gemini/generate-subtitle", async (req, res) => {
  try {
    const { title } = req.body;
    const subtitle = await generateSubtitle(title);
    res.json({ data: { subtitle } });
  } catch (err) {
    console.error("Generate subtitle error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/gemini/generate-content", async (req, res) => {
  try {
    const content = await generateContent(req.body);
    res.json({ data: { content } });
  } catch (err) {
    console.error("Generate content error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/gemini/generate-all", async (req, res) => {
  try {
    const result = await generateAllSections(req.body);
    res.json({ data: result });
  } catch (err) {
    console.error("Generate all error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ===== ISSUE CRUD ROUTES =====

// Create new issue
app.post("/api/issues", async (req, res) => {
  try {
    const issue = new Issue({
      ...req.body,
      updatedAt: new Date(),
    });
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    console.error("Save issue error:", err);
    res
      .status(500)
      .json({ error: "Failed to save issue", details: err.message });
  }
});

// Get all issues
app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error("Fetch issues error:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

// Get single issue by ID
app.get("/api/issues/:id", async (req, res) => {
  try {
    console.log("🧭 Fetching issue with ID:", req.params.id); // <--- ADD THIS
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (err) {
    console.error("Fetch issue error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch issue", details: err.message });
  }
});

// Update issue
app.put("/api/issues/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (err) {
    console.error("Update issue error:", err);
    res.status(500).json({ error: "Failed to update issue" });
  }
});

// Delete issue
app.delete("/api/issues/:id", async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json({ message: "Issue deleted successfully", issue });
  } catch (err) {
    console.error("Delete issue error:", err);
    res.status(500).json({ error: "Failed to delete issue" });
  }
});

// ============== MUSIC API PROXY ==============
// Proxy route to avoid CORS issues with Deezer API
app.get("/api/music/search", async (req, res) => {
  try {
    const query = req.query.q || "lofi";
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(deezerUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch from Deezer API");
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Music search error:", error);
    res.status(500).json({ error: "Failed to search music", details: error.message });
  }
});



const PORT = process.env.PORT || 5000;

// Connect to MongoDB
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`   http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
} else {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}
