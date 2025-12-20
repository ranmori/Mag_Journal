// Login.jsx
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Animated background styles (injected once)                        */
/* ------------------------------------------------------------------ */
const AnimatedBg = () => (
  <style>{`
    @keyframes pan {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animated-bg {
      background: linear-gradient(135deg, #f9f4e6, #ffe6a7, #f9f4e6);
      background-size: 400% 400%;
      animation: pan 12s ease infinite;
    }
    .dark .animated-bg {
      background: linear-gradient(135deg, #111827, #374151, #111827);
      background-size: 400% 400%;
      animation: pan 12s ease infinite;
    }
  `}</style>
);

export default function Login({ onLogin }) {
  /* ---------- state ---------- */
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [theme, setTheme]       = useState("light");
  const navigate = useNavigate();

  /* ---------- theme ---------- */
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  /* ---------- viewport hack: hide Layout chrome ---------- */
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  /* ---------- validation ---------- */
  const validate = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be ≥ 8 characters";
    return "";
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setError("");
    setLoading(true);

    try {
      /* TODO: replace with real endpoint */
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      /* store token */
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login successful! Redirecting…");
      if (onLogin) await onLogin(data.user);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (ex) {
      setError(ex.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div
      className={`w-full  border-4 rounded-2xl p-6 sm:p-8 transition-colors
          lg:max-w-none lg:w-full lg:h-full lg:rounded-none lg:border-0 lg:shadow-none
      }`}
    >
      <AnimatedBg />


      {/* card – full-width on large screens */}
      <div
        className={`w-full max-w-md border-4 rounded-2xl p-6 sm:p-8
          lg:max-w-none lg:w-full lg:h-full lg:rounded-none lg:border-0 lg:shadow-none
          ${theme === "dark"
            ? "bg-gray-800 border-gray-600 shadow-[6px_6px_0_rgba(0,0,0,.5)] lg:bg-gray-900"
            : "bg-white/90 border-black shadow-[6px_6px_0_#000] lg:bg-white/90"}`}
      >
        {/* header */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-[2px_2px_0_#000]
              ${theme === "dark" ? "text-gray-100" : "text-black"}`}
          >
            M
          </div>
          <div
            className={`uppercase tracking-widest text-base sm:text-lg mt-2 border-t-2 inline-block px-4
              ${theme === "dark" ? "border-gray-600" : "border-black"}`}
          >
            Magazine Journal
          </div>
          <p
            className={`mt-3 text-xs sm:text-sm italic
              ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            “Your story, your way”
          </p>
        </div>

        <h2
          className={`text-center font-bold text-base sm:text-lg mb-5 sm:mb-6 uppercase tracking-wider
            ${theme === "dark" ? "text-gray-200" : "text-black"}`}
        >
          Sign In
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2
                ${theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"}`}
            />
          </div>

          {/* password */}
          <div>
            <label htmlFor="password" className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="current-password"
                required
                className={`w-full px-3 py-2 pr-20 border-2 rounded-md focus:outline-none focus:ring-2
                  ${theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                    : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 border-2 rounded-md text-xs sm:text-sm
                  shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
                  ${theme === "dark"
                    ? "bg-gray-600 border-gray-500 text-gray-200"
                    : "bg-[#ffe6a7] border-black text-black"}`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* remember me */}
          <div className="flex items-center justify-between text-sm">
            <label className={`flex items-center gap-2 font-semibold cursor-pointer ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={`w-4 h-4 border-2 rounded ${theme === "dark" ? "border-gray-600" : "border-black"}`}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* messages */}
          {error && (
            <div className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${theme === "dark" ? "bg-red-900 border-red-700 text-red-200" : "bg-red-100 border-black text-red-800"}`}>
              {error}
            </div>
          )}
          {success && (
            <div className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${theme === "dark" ? "bg-green-900 border-green-700 text-green-200" : "bg-green-100 border-black text-green-800"}`}>
              {success}
            </div>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 sm:py-2.5 border-2 font-bold text-sm sm:text-base rounded-md
              shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
              disabled:opacity-50 disabled:cursor-not-allowed transition
              ${theme === "dark"
                ? "bg-gray-700 border-gray-500 text-gray-100 hover:bg-gray-600"
                : "bg-[#ffe6a7] border-black text-black hover:bg-[#ffd97a]"}`}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* divider */}
          <div className="relative my-6">
            <div className={`absolute inset-0 flex items-center ${theme === "dark" ? "border-gray-700" : "border-gray-300"} border-t-2`} />
            <div className="relative flex justify-center">
              <span className={`px-4 text-sm font-semibold ${theme === "dark" ? "bg-gray-900 text-gray-400" : "bg-white/90 text-gray-600"}`}>
                OR
              </span>
            </div>
          </div>

          {/* sign-up link */}
          <div className={`text-center text-sm ${theme === "dark" ? "text-gray-400" : "text-black"}`}>
            New here?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className={`hover:underline underline-offset-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-black"}`}
            >
              Create account
            </button>
          </div>

          {/* badge */}
          <div className={`mt-4 pt-4 border-t-2 text-center text-xs ${theme === "dark" ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-600"}`}>
            🔒 Secured with JWT Authentication
          </div>
        </form>
      </div>
    </div>
  );
}