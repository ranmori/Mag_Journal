import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js'
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  daisyui: {
    themes: [
      "light",
      "dark",
      {
        "retro-mac": {
          primary: "#4a4a4a",
          secondary: "#a9a9a9",
          accent: "#cccccc",
          neutral: "#333333",
          "base-100": "#f0f0f0", // Light off-white for background
          info: "#4a4a4a",
          success: "#4a4a4a",
          warning: "#4a4a4a",
          error: "#4a4a4a",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "2px",
          "--tab-radius": "0.5rem",
        },
      },
    ],

    theme: {
      extend: {
        fontFamily: {
          // Add a retro font here
          // Make sure you have imported it in your CSS file
          pixel: ['"Press Start 2P"', "monospace"],
          retro: ['"VT323"', "monospace"],
        },
        // You can also define custom shadow styles here
        boxShadow: {
          "retro-inset": "inset 2px 2px 0 0 #4a4a4a",
          "retro-outset": "2px 2px 0 0 #4a4a4a",
        },
      },
    },
  },
});
