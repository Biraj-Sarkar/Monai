import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { loginSucess } from "../utils/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, confirmPassword } = registerData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  const handleGoogleRegister = async ({ access_token: accessToken }) => {
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accessToken })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign up failed");
      }

      const payload = data.data || data;

      dispatch(
        loginSucess({ userInfo: payload.user, userToken: payload.token })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign up failed");
    }
  };

  const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleRegister,
    onError: () => setError("Google sign up failed"),
    scope: "openid profile email"
  });

  return (
    <div className="app-page-bg min-h-screen flex items-center justify-center relative px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-12 top-12 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute left-10 bottom-20 h-56 w-96 rounded-full bg-pink-700/10 blur-2xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-slate-900/70 backdrop-blur-md border border-white/5 p-8 shadow-lg">
          <header className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-300">Enter your details to create your Expense Tracker account.</p>
          </header>

          {error && (
            <div className="mb-4 rounded-md bg-rose-900/60 border border-rose-700/40 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">Name</label>
              <input
                name="name"
                type="text"
                value={registerData.name}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="John Wick"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-300">Email</label>
              <input
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <input
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Re-enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105"
              >
                Sign up
              </button>
            </div>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <div className="text-xs text-slate-400">or continue with</div>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="rounded-lg">
            <button
              type="button"
              className="w-full inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={() => googleRegister()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.43z" fill="#4285F4" />
                <path d="M12 22c2.7 0 4.96-.89 6.62-2.41l-3.23-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.08v2.59A10 10 0 0 0 12 22z" fill="#34A853" />
                <path d="M6.41 13.91A6 6 0 0 1 6.09 12c0-.66.11-1.31.32-1.91V7.5H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.5l3.33-2.59z" fill="#FBBC05" />
                <path d="M12 5.98c1.47 0 2.78.5 3.82 1.49l2.87-2.87A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.08 7.5l3.33 2.59C7.2 7.72 9.4 5.98 12 5.98z" fill="#EA4335" />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <NavLink to="/login" className="text-white font-medium">Sign in</NavLink></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
