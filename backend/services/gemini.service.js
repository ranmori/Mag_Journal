const MODEL = "gemini-2.0-flash"; // or gemini-1.5-pro, depending on your access
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Internal function to call the Gemini API
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The generated text
 */
const callGeminiAPI = async (prompt) => {
  const GEMINI_API_KEY =
    (typeof process !== "undefined" && process?.env?.GEMINI_API_KEY) ||
    (typeof globalThis !== "undefined" && globalThis?.GEMINI_API_KEY);

  if (!GEMINI_API_KEY) {
    throw new Error(
      "❌ GEMINI_API_KEY is not configured in environment variables"
    );
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
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};

/** Generate a magazine title */
export const generateTitle = async () => {
  const prompt = `Generate a creative and meaningful title for a personal magazine journal about personal growth, mindfulness, and life reflections.

Requirements:
- Should be 2-4 words
- Inspiring and memorable
- Suitable for a personal development magazine
- Can include words like: Journey, Reflections, Growth, Moments, Life, Stories, Chapters, Horizons, etc.

Provide only the title, nothing else. No quotes, no explanations.`;

  return await callGeminiAPI(prompt);
};

/** Generate a subtitle */
export const generateSubtitle = async (title) => {
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

/** Generate content sections (foreword, reflections, or lessons) */
export const generateContent = async ({
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

/** Generate image description */
export const generateImageDescription = async ({ title, subtitle, layout }) => {
  const layoutThemes = {
    anime:
      "anime style, vibrant colors, manga aesthetic, cute and whimsical, Japanese illustration style",
    retro:
      "retro 80s style, neon colors, vintage aesthetic, synthwave, vaporwave elements",
    fashion:
      "elegant fashion photography, minimalist, sophisticated, modern, high-end editorial style",
  };

  const prompt = `Create a detailed visual description for a magazine cover illustration with these specifications:

Title: "${title || "Personal Journal"}"
${subtitle ? `Subtitle: "${subtitle}"` : ""}
Style: ${layoutThemes[layout] || layoutThemes.retro}
Theme: Personal growth, mindfulness, life reflections, introspection

Describe a visually striking magazine cover that:
- Captures the essence of personal development and introspection
- Uses the specified artistic style effectively
- Includes specific colors, composition, and key visual elements
- Would work well as a magazine cover
- Is inspiring and meaningful

Provide a detailed description (100-150 words) that could be used as a prompt for image generation. Be specific about visual elements, colors, composition, and mood.`;

  return await callGeminiAPI(prompt);
};
