// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import winston from "winston";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";
import path from "path";

// logger

// ============== WINSTON LOGGER SETUP ==============
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.log("Current directory:", __dirname);
logger.log("File location:", __filename);

const envPath = path.join(__dirname, "..", ".env");

dotenv.config({ path: envPath });
const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
// Support multiple allowed frontend origins via comma-separated env var
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || FRONTEND_ORIGIN)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // allow requests with no origin (like curl, Postman, or server-to-server)
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" })); // Increase limit for base64 images
app.use(helmet());
app.use(compression());
app.use(cookieParser());

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// logger

// request logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

const MONGODB_URI = process.env.MONGODB_URI;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// JWT TOKENS
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_production";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "change_refresh_secret";
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m"; // short lived
const REFRESH_TOKEN_EXPIRES_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7
);

logger.log("✅ GEMINI_API_KEY loaded:", !!GEMINI_API_KEY);
logger.log("✅ MONGODB_URI loaded:", !!MONGODB_URI);

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
    logger.error("Gemini API Error:", error);
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

// user issues
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);
const createAccessToken = (user) =>
  jwt.sign({ userId: user._id || user._id, email: user.email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });

const createRefreshToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, REFRESH_TOKEN_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`,
  });

// middle ware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing access token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};

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
    logger.error("Generate title error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/gemini/generate-subtitle", async (req, res) => {
  try {
    const { title } = req.body;
    const subtitle = await generateSubtitle(title);
    res.json({ data: { subtitle } });
  } catch (err) {
    logger.error("Generate subtitle error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/gemini/generate-content", async (req, res) => {
  try {
    const content = await generateContent(req.body);
    res.json({ data: { content } });
  } catch (err) {
    logger.error("Generate content error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post("/api/gemini/generate-all", async (req, res) => {
  try {
    const result = await generateAllSections(req.body);
    res.json({ data: result });
  } catch (err) {
    logger.error("Generate all error:", err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// authentication routes middleware

// POST /api/auth/signup
app.post(
  "/api/auth/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });

    const { name, email, password } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing)
        return res.status(409).json({ error: "Email already in use" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = new User({ name, email, passwordHash });
      await user.save();

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      user.refreshToken = refreshToken;
      await user.save();

      // set HttpOnly refresh cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email },
        accessToken,
      });
    } catch (err) {
      logger.error("Signup error:", err);
      res.status(500).json({ error: "Failed to create account" });
    }
  }
);

// POST /api/auth/login
app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: { id: user._id, name: user.name, email: user.email },
        accessToken,
      });
    } catch (err) {
      logger.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// POST /api/auth/refresh
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "Missing refresh token" });

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ error: "Refresh token mismatch" });
    }

    // rotate tokens
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    logger.error("Refresh error:", err);
    res.status(500).json({ error: "Could not refresh token" });
  }
});
// POST /api/auth/logout
app.post("/api/auth/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(payload.userId, {
          $unset: { refreshToken: 1 },
        });
      } catch (e) {
        // ignore invalid token
      }
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out" });
  } catch (err) {
    logger.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
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
    logger.error("Save issue error:", err);
    res
      .status(500)
      .json({ error: "Failed to save issue", details: err.message });
  }
});
// validate issue
app.post(
  "/api/issues",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("volume").trim().notEmpty().withMessage("Volume is required"),
    body("issueNumber")
      .trim()
      .notEmpty()
      .withMessage("Issue number is required"),
    // optional: validate images structure length/type if sending JSON
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors.array() });
    }
    try {
      const issue = new Issue({
        ...req.body,
        updatedAt: new Date(),
      });
      await issue.save();
      res.status(201).json(issue);
    } catch (err) {
      logger.error("Save issue error:", err);
      res
        .status(500)
        .json({ error: "Failed to save issue", details: err.message });
    }
  }
);

// Get all issues
app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    logger.error("Fetch issues error:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});
// get the latest issues
app.get("/api/issues/latest", async (req, res) => {
  try {
    // newest first, limit 3
    const docs = await Issue.find().sort({ createdAt: -1 }).limit(3).lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single issue by ID
app.get("/api/issues/:id", async (req, res) => {
  try {
    logger.log("🧭 Fetching issue with ID:", req.params.id); // <--- ADD THIS
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (err) {
    logger.error("Fetch issue error:", err);
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
    logger.error("Update issue error:", err);
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
    logger.error("Delete issue error:", err);
    res.status(500).json({ error: "Failed to delete issue" });
  }
});

// ============== MUSIC API PROXY ==============
// Proxy route to avoid CORS issues with Deezer API
app.get("/api/music/search", async (req, res) => {
  try {
    const query = req.query.q || "lofi";
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(deezerUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch from Deezer API");
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    logger.error("Music search error:", error);
    res
      .status(500)
      .json({ error: "Failed to search music", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      logger.info("✅ Connected to MongoDB");
      app.listen(PORT, () => {
        logger.info(`✅ Server running on port ${PORT}`);
        logger.info(`   http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
      process.exit(1);
    });
} else {
  logger.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

