// Signup.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../Components/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [jwt, setJwt] = useState(null); // store access token in memory only

  const validate = (values) => {
    const errs = {};

    if (!values.name.trim()) {
      errs.name = "Name is required";
    } else if (values.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    if (!values.email) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = "Invalid email format";
    }

    if (!values.password) {
      errs.password = "Password is required";
    } else if (values.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(values.password)) {
      errs.password = "Password must contain a lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(values.password)) {
      errs.password = "Password must contain an uppercase letter";
    } else if (!/(?=.*\d)/.test(values.password)) {
      errs.password = "Password must contain a number";
    }

    if (!values.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (values.password !== values.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
    setServerError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(form);

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        credentials: "include", // allow server to set HttpOnly refresh cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data?.message || "Signup failed");
      } else {
        // Server SHOULD set a HttpOnly refresh cookie; if server returns an access token, keep it in memory only
        const token = data?.accessToken || data?.token || null;
        if (token) setJwt(token);

        // store minimal non-sensitive user info for UI state (optional)
        if (data.user)
          sessionStorage.setItem("user", JSON.stringify(data.user));

        setSuccess("Signup successful! Redirecting to dashboard...");
        setForm({ name: "", email: "", password: "", confirmPassword: "" });

        // navigate after short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 900);
      }
    } catch (err) {
      setServerError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 font-serif transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-[#f9f4e6] text-black"
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 sm:top-6 sm:right-6 px-3 py-2 border-2 rounded-lg text-sm font-bold transition-all ${
          theme === "dark"
            ? "bg-gray-800 border-gray-600 text-yellow-300 hover:bg-gray-700"
            : "bg-white border-black text-black hover:bg-gray-50"
        } shadow-[2px_2px_0_rgba(0,0,0,0.3)]`}
        aria-pressed={theme === "dark"}
        aria-label="Toggle dark mode"
      >
        {theme === "dark" ? "☀ Light" : "🌙 Dark"}
      </button>

      <div
        className={`w-full max-w-md border-4 rounded-2xl p-6 sm:p-8 transition-colors ${
          theme === "dark"
            ? "bg-gray-800 border-gray-600 shadow-[6px_6px_0_rgba(0,0,0,0.5)]"
            : "bg-white border-black shadow-[6px_6px_0_#000]"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className={`text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-[2px_2px_0_#000] ${
              theme === "dark" ? "text-gray-100" : "text-black"
            }`}
          >
            M
          </div>
          <div
            className={`uppercase tracking-widest text-base sm:text-lg mt-2 border-t-2 inline-block px-4 ${
              theme === "dark" ? "border-gray-600" : "border-black"
            }`}
          >
            Magazine Journal
          </div>
          <p
            className={`mt-3 text-xs sm:text-sm italic ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            "Join the community of storytellers"
          </p>
        </div>

        <h2
          className={`text-center font-bold text-base sm:text-lg mb-5 sm:mb-6 uppercase tracking-wider ${
            theme === "dark" ? "text-gray-200" : "text-black"
          }`}
        >
          Create an Account
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5"
          aria-label="signup-form"
        >
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              required
              className={`w-full px-3 py-2 border-2 rounded-md transition-all focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"
              }`}
            />
            {errors.name && (
              <p id="name-error" className="text-red-600 text-sm mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
              className={`w-full px-3 py-2 border-2 rounded-md transition-all focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"
              }`}
            />
            {errors.email && (
              <p id="email-error" className="text-red-600 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters, A-Z, a-z, 0-9"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                required
                className={`w-full px-3 py-2 pr-20 border-2 rounded-md transition-all focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                    : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 border-2 rounded-md text-xs sm:text-sm transition-all shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  theme === "dark"
                    ? "bg-gray-600 border-gray-500 text-gray-200"
                    : "bg-[#ffe6a7] border-black text-black"
                }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-red-600 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className={`block text-sm font-semibold mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              required
              className={`w-full px-3 py-2 border-2 rounded-md transition-all focus:outline-none focus:ring-2 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"
              }`}
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-red-600 text-sm mt-1"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Error/Success Messages */}
          {serverError && (
            <div
              className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${
                theme === "dark"
                  ? "bg-red-900 border-red-700 text-red-200"
                  : "bg-red-100 border-black text-red-800"
              }`}
              role="alert"
            >
              {serverError}
            </div>
          )}
          {success && (
            <div
              className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${
                theme === "dark"
                  ? "bg-green-900 border-green-700 text-green-200"
                  : "bg-green-100 border-black text-green-800"
              }`}
              role="status"
            >
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 sm:py-2.5 border-2 font-bold text-sm sm:text-base rounded-md transition-all shadow-[3px_3px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === "dark"
                ? "bg-gray-700 border-gray-500 text-gray-100 hover:bg-gray-600"
                : "bg-[#ffe6a7] border-black text-black hover:bg-[#ffd97a]"
            }`}
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>

          {/* Login Link */}
          <div
            className={`text-center mt-4 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate("./login")}
              className={`hover:underline underline-offset-4 font-semibold ${
                theme === "dark" ? "text-gray-300" : "text-black"
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Security Badge */}
          <div
            className={`mt-4 pt-4 border-t-2 text-center text-xs ${
              theme === "dark"
                ? "border-gray-700 text-gray-500"
                : "border-gray-300 text-gray-600"
            }`}
          >
            🔒 Secured with JWT Authentication
          </div>
        </form>
      </div>
    </div>
  );
}