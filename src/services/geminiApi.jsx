// services/geminiApi.js
// Frontend service for calling the Gemini API backend

/**
 * Base API URL - Change this to your backend URL
 * For development: http://localhost:5000/api/gemini
 * For production: https://your-backend-domain.com/api/gemini
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:5000/api/gemini";

/**
 * Generic API call function with error handling
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} - API response data
 */
const callAPI = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error?.message || "API request failed");
    }

    return responseData.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw new Error(error.message || "Failed to connect to AI service");
  }
};

/**
 * Generate a magazine title using AI
 * @returns {Promise<string>} - Generated title
 */
export const generateTitle = async () => {
  const data = await callAPI("/generate-title", {});
  return data.title;
};

/**
 * Generate a subtitle using AI
 * @param {string} title - The magazine title
 * @returns {Promise<string>} - Generated subtitle
 */
export const generateSubtitle = async (title) => {
  const data = await callAPI("/generate-subtitle", { title });
  return data.subtitle;
};

/**
 * Generate content (foreword, reflections, or lessons)
 * @param {Object} params - Parameters for content generation
 * @param {string} params.type - Content type ('foreword', 'reflections', 'lessons')
 * @param {string} params.title - Magazine title
 * @param {string} params.subtitle - Magazine subtitle
 * @param {string} params.volume - Volume number
 * @param {string} params.issueNumber - Issue number
 * @returns {Promise<string>} - Generated content
 */
export const generateContent = async ({
  type,
  title,
  subtitle,
  volume,
  issueNumber,
}) => {
  const data = await callAPI("/generate-content", {
    type,
    title,
    subtitle,
    volume,
    issueNumber,
  });
  return data.content;
};

/**
 * Generate image description using AI
 * @param {Object} params - Parameters for image description
 * @param {string} params.title - Magazine title
 * @param {string} params.subtitle - Magazine subtitle
 * @param {string} params.layout - Layout theme ('anime', 'retro', 'fashion')
 * @returns {Promise<string>} - Generated image description
 */
export const generateImageDescription = async ({ title, subtitle, layout }) => {
  const data = await callAPI("/generate-image-description", {
    title,
    subtitle,
    layout,
  });
  return data.description;
};

/**
 * Generate all content sections at once
 * @param {Object} params - Parameters for content generation
 * @param {string} params.title - Magazine title
 * @param {string} params.subtitle - Magazine subtitle
 * @param {string} params.volume - Volume number
 * @param {string} params.issueNumber - Issue number
 * @returns {Promise<Object>} - Object containing foreword, reflections, and lessons
 */
export const generateAllSections = async ({
  title,
  subtitle,
  volume,
  issueNumber,
}) => {
  const data = await callAPI("/generate-all", {
    title,
    subtitle,
    volume,
    issueNumber,
  });
  return {
    foreword: data.foreword,
    reflections: data.reflections,
    lessons: data.lessons,
  };
};
