// Signup.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../Components/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  /* ---------- state ---------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [jwt, setJwt] = useState(null); // access-token in memory
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  /* ---------- validation ---------- */
  const validate = (v) => {
    const e = {};
    if (!v.name.trim()) e.name = "Name is required";
    if (!v.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
      e.email = "Invalid email";
    if (!v.password || v.password.length < 8)
      e.password = "≥ 8 chars, upper, lower & number";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v.password)
    )
      e.password = "Must contain upper, lower & number";
    if (v.password !== v.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((x) => ({ ...x, [name]: "" }));
    setServerError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setServerError("");

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Signup failed");

      if (data.accessToken) setJwt(data.accessToken);
      if (data.user) sessionStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Signup successful! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setServerError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- ui ---------- */
  return (
 
      {/* theme toggle – stays in top-right corner */}

      {/* card – becomes full-width on large screens */}
      <div
        className={`w-full max-w-md border-4 rounded-2xl p-6 sm:p-8 transition-colors
          lg:max-w-none lg:w-full lg:h-full lg:rounded-none lg:border-0 lg:shadow-none
          ${theme === "dark"
            ? "bg-gray-800 border-gray-600 shadow-[6px_6px_0_rgba(0,0,0,.5)] lg:bg-gray-900"
            : "bg-white border-black shadow-[6px_6px_0_#000] lg:bg-[#f9f4e6]"}`}
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
            “Join the community of storytellers”
          </p>
        </div>

        <h2
          className={`text-center font-bold text-base sm:text-lg mb-5 sm:mb-6 uppercase tracking-wider
            ${theme === "dark" ? "text-gray-200" : "text-black"}`}
        >
          Create an Account
        </h2>

        {/* form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* name */}
          <div>
            <label htmlFor="name" className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2
                ${theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"}`}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2
                ${theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"}`}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
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
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters, A-Z, a-z, 0-9"
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
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* confirm password */}
          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-1 ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
              className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2
                ${theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  : "bg-amber-50 border-black text-black placeholder-gray-500 focus:ring-black"}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* messages */}
          {serverError && (
            <div className={`border-2 p-2 sm:p-3 text-center text-sm rounded ${theme === "dark" ? "bg-red-900 border-red-700 text-red-200" : "bg-red-100 border-black text-red-800"}`}>
              {serverError}
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
            {loading ? "Creating account…" : "Sign up"}
          </button>

          {/* footer links */}
          <div className={`text-center mt-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-black"}`}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`hover:underline underline-offset-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-black"}`}
            >
              Sign in
            </button>
          </div>

          {/* badge */}
          <div className={`mt-4 pt-4 border-t-2 text-center text-xs ${theme === "dark" ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-600"}`}>
            🔒 Secured with JWT Authentication
          </div>
        </form>
      </div>
  
  );
}