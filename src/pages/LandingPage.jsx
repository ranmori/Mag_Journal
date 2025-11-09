import { useNavigate } from "react-router-dom";
import { useTheme } from "../Components/ThemeContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen font-retro ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-stone-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <nav
        className={`border-b-4 border-black p-4 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
        style={{ boxShadow: "0 4px 0 0 black" }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            📖 MAGAZINE JOURNAL
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 border-2 border-black ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-white hover:bg-gray-100"
              }`}
              style={{ boxShadow: "2px 2px 0 0 black" }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className={`px-6 py-2 border-2 border-black font-bold ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-white hover:bg-gray-100"
              }`}
              style={{ boxShadow: "4px 4px 0 0 black" }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border-4 border-black rotate-12"></div>
          <div className="absolute bottom-40 right-40 w-96 h-96 border-4 border-black -rotate-6"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 border-4 border-black rotate-45"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div
              className={`inline-block px-4 py-2 border-2 border-black ${
                theme === "dark" ? "bg-pink-900" : "bg-pink-200"
              }`}
              style={{ boxShadow: "4px 4px 0 0 black" }}
            >
              <span className="text-sm font-bold">✨ YOUR STORY MATTERS</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              BE A HERO
              <br />
              <span
                className={theme === "dark" ? "text-pink-400" : "text-pink-600"}
              >
                IN YOUR
              </span>
              <br />
              CITY
            </h1>

            <div
              className={`p-6 border-4 border-black ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
              style={{ boxShadow: "8px 8px 0 0 black" }}
            >
              <p className="text-lg italic leading-relaxed">
                "As soon as I left my house, I realized that I'm home"
              </p>
              <p className="mt-4 text-sm opacity-70">
                Am I in touch with my deepest desires? What is the purpose?
                Question the I asked myself to find the answer. I sat down,
                belongings and left the warm, cozy nest to spread my wings and
                fly to my own.
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className={`group px-8 py-4 border-4 border-black font-bold text-xl ${
                theme === "dark"
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "bg-pink-400 hover:bg-pink-500"
              } transition-all hover:translate-x-1 hover:translate-y-1`}
              style={{ boxShadow: "8px 8px 0 0 black" }}
            >
              Start Your Journey →
            </button>

            <div className="flex items-center gap-4 pt-4">
              <div
                className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center cursor-pointer ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                <span className="text-xl">📷</span>
              </div>
              <span className="text-sm font-bold">
                Drag For More Information
              </span>
            </div>
          </div>

          {/* Right Visual - Magazine Layout */}
          <div className="relative h-[600px]">
            {/* Magazine Pages Stack */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Back Page */}
              <div
                className={`absolute w-80 h-96 border-4 border-black rotate-6 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
                style={{ boxShadow: "12px 12px 0 0 black" }}
              ></div>

              {/* Front Page */}
              <div
                className={`absolute w-80 h-96 border-4 border-black -rotate-3 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
                style={{ boxShadow: "16px 16px 0 0 black" }}
              >
                <div className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <div
                      className={`text-xs font-bold mb-4 ${
                        theme === "dark" ? "text-pink-400" : "text-pink-600"
                      }`}
                    >
                      TETRIS DEVELOPMENT
                    </div>
                    <div className="space-y-2 text-xs leading-relaxed opacity-70">
                      <p>Personal growth is a journey</p>
                      <p>Every page tells your story</p>
                      <p>Document your evolution</p>
                      <p>Reflect, learn, and grow</p>
                    </div>
                  </div>

                  <div
                    className={`border-t-2 border-black pt-4 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <div className="text-xs">YOUR PERSONAL MAGAZINE</div>
                  </div>
                </div>
              </div>

              {/* Decorative silhouettes */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 opacity-60">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="30" r="15" fill="currentColor" />
                  <rect
                    x="40"
                    y="45"
                    width="20"
                    height="40"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            {/* Social Icons */}
            <div className="absolute top-4 right-4 flex flex-col gap-3">
              <div
                className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-white"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                <span>f</span>
              </div>
              <div
                className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-white"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                <span>𝕏</span>
              </div>
              <div
                className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-700" : "bg-white"
                }`}
                style={{ boxShadow: "2px 2px 0 0 black" }}
              >
                <span>📌</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-20 px-6 border-t-4 border-black ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">
            WHY MAGAZINE JOURNAL?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🖋️",
                title: "WRITE FREELY",
                desc: "Express yourself with no limits. Each issue is your personal article.",
              },
              {
                icon: "📚",
                title: "ORGANIZE BEAUTIFULLY",
                desc: "Keep every memory organized like a magazine archive.",
              },
              {
                icon: "✨",
                title: "RETRO STYLE",
                desc: "Experience the timeless elegance of vintage magazines.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-8 border-4 border-black ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-50"
                } transition-all hover:-translate-y-2`}
                style={{ boxShadow: "8px 8px 0 0 black" }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="opacity-80">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-20 px-6 border-t-4 border-black text-center ${
          theme === "dark" ? "bg-gray-900" : "bg-stone-100"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">START YOUR STORY TODAY</h2>
          <p className="text-xl mb-8 opacity-80">
            Join thousands documenting their journey, one page at a time.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-12 py-4 border-4 border-black font-bold text-xl ${
              theme === "dark"
                ? "bg-pink-600 hover:bg-pink-700"
                : "bg-pink-400 hover:bg-pink-500"
            } transition-all hover:translate-x-1 hover:translate-y-1`}
            style={{ boxShadow: "8px 8px 0 0 black" }}
          >
            Create First Issue
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t-4 border-black p-8 text-center ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <p className="font-bold">
          © {new Date().getFullYear()} MAGAZINE JOURNAL — Where Your Words
          Become Timeless
        </p>
      </footer>
    </div>
  );
}
