import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useTheme} from "../Components/ThemeContext";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  const[theme, toggleTheme] = useState();
  const [jwt, setJwt] = useState(null);

 

  const validate = () => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Simulated API call with JWT response
      const res = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({
              message: "Login successful!",
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
              user: {
                id: "1234567890",
                email: email.trim(),
                name: "John Doe",
              }
            })
          });
        }, 1500);
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Login failed");
      } else {
        // Store JWT securely
        setJwt(data.token);
        
        if (remember) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          sessionStorage.setItem("authToken", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }

        setSuccess("Login successful! Redirecting...");
        setPassword("");

        // Call onLogin callback if provided
        if (onLogin) {
          await onLogin({ email, password, remember });
        }

        // Simulate redirect
        setTimeout(() => {
          console.log("Redirecting to dashboard with token:", data.token);
          // In a real app: navigate("/dashboard");
        }, 1500);
      }
    } catch (ex) {
      setError(ex?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 font-serif transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-gray-900 text-gray-100" 
        : "bg-[#f9f4e6] text-black"
    }`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 px-3 py-2 sm:px-4 sm:py-2 border-2 rounded-lg text-sm font-bold transition-all ${
          theme=== "dark"
            ? "bg-gray-800 border-gray-600 text-yellow-300 hover:bg-gray-700"
            : "bg-white border-black text-black hover:bg-gray-50"
        } shadow-[2px_2px_0_rgba(0,0,0,0.3)]`}
      >
        {theme=== "dark" ? "☀ Light" : "🌙 Dark"}
      </button>

      <div className={`w-full max-w-md border-4 rounded-2xl p-6 sm:p-8 transition-colors ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600 shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
          : "bg-white border-black shadow-[6px_6px_0_#000]"
      }`}>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className={`text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-[2px_2px_0_#000] ${
            theme=== "dark" ? "text-gray-100" : "text-black"
          }`}>
            M
          </div>
          <div className={`uppercase tracking-widest text-base sm:text-lg mt-2 border-t-2 inline-block px-4 ${
            theme=== "dark" ? "border-gray-600" : "border-black"
          }`}>
            Magazine Journal
          </div>
          <p className={`mt-3 text-xs sm:text-sm italic ${
            theme=== "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            "Your story, your way"
          </p>
        </div>

        <h2 className={`text-center font-bold text-base sm:text-lg mb-5 sm:mb-6 uppercase tracking-wider ${
          theme=== "dark" ? "text-gray-200" : "text-black"
        }`}>
          Sign In
        </h2>

        <div className="space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div>
            <label className={`block text-sm font-semibold mb-1 ${
              theme=== "dark" ? "text-gray-300" : "text-black"
            }`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full px-3 py-2 border-2 rounded-md transition-all focus:outline-none focus:ring-2 ${
                theme=== "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"
              }`}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-sm font-semibold mb-1 ${
              theme=== "dark" ? "text-gray-300" : "text-black"
            }`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="current-password"
                className={`w-full px-3 py-2 pr-20 border-2 rounded-md transition-all focus:outline-none focus:ring-2 ${
                  theme=== "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                    : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 border-2 rounded-md text-xs sm:text-sm transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  theme=== "dark"
                    ? "bg-gray-600 border-gray-500 text-gray-200"
                    : "bg-[#ffe6a7] border-black text-black"
                }`}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className={`flex items-center gap-2 font-semibold cursor-pointer ${
              theme=== "dark" ? "text-gray-300" : "text-black"
            }`}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={`w-4 h-4 border-2 rounded cursor-pointer ${
                  theme=== "dark" ? "border-gray-600" : "border-black"
                }`}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => alert("Password reset coming soon!")}
              className={`font-semibold hover:underline underline-offset-4 ${
                theme=== "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Forgot?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${
              theme=== "dark"
                ? "bg-red-900 border-red-700 text-red-200"
                : "bg-red-100 border-black text-red-800"
            }`}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${
              theme=== "dark"
                ? "bg-green-900 border-green-700 text-green-200"
                : "bg-green-100 border-black text-green-800"
            }`}>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2 sm:py-2.5 border-2 font-bold text-sm sm:text-base rounded-md transition-all shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme=== "dark"
                ? "bg-gray-700 border-gray-500 text-gray-100 hover:bg-gray-600"
                : "bg-[#ffe6a7] border-black text-black hover:bg-[#ffd97a]"
            }`}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t-2 ${
                theme=== "dark" ? "border-gray-700" : "border-gray-300"
              }`}></div>
            </div>
            <div className="relative flex justify-center">
              <span className={`px-4 text-sm font-semibold ${
                theme=== "dark" ? "bg-gray-800 text-gray-400" : "bg-white text-gray-600"
              }`}>
                OR
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className={`text-center text-sm ${
            theme=== "dark" ? "text-gray-400" : "text-black"
          }`}>
            <span>New here? </span>
            <button
              type="button"
              onClick={() => alert("Navigate to signup page")}
              className={`hover:underline underline-offset-4 font-semibold ${
                theme=== "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Security Badge */}
          <div className={`mt-4 pt-4 border-t-2 text-center text-xs ${
            theme=== "dark" ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-600"
          }`}>
            🔒 Secured with JWT Authentication
          </div>
        </div>
      </div>
    </div>
  );
}