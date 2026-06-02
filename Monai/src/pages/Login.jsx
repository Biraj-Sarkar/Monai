import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import { loginSucess } from "../utils/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const handleChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password } = loginData;

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      const payload = data.data || data;

      dispatch(
        loginSucess({ userInfo: payload.user, userToken: payload.token })
      );

      const dest = location?.state?.from || '/dashboard';
      navigate(dest);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  const handleGoogleLogin = async (googleResponse) => {
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: googleResponse.credential })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google sign in failed");
      }

      const payload = data.data || data;

      dispatch(
        loginSucess({ userInfo: payload.user, userToken: payload.token })
      );

      const dest = location?.state?.from || '/dashboard';
      navigate(dest);
    } catch (err) {
      setError(err.message || "Google sign in failed");
    }
  };

  return (
    <div className="app-page-bg min-h-screen flex items-center justify-center relative px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-12 top-12 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute left-10 bottom-20 h-56 w-96 rounded-full bg-pink-700/10 blur-2xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-slate-900/70 backdrop-blur-md border border-white/5 p-8 shadow-lg">
          <header className="mb-6">
            <h1 className="text-2xl font-extrabold text-white">Sign in to your account</h1>
            <p className="mt-1 text-sm text-slate-300">Welcome back — enter your details below.</p>
          </header>

          {error && (
            <div className="mb-4 rounded-md bg-rose-900/60 border border-rose-700/40 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">Email</label>
              <input
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <NavLink to="/forgot" className="text-xs text-slate-400 hover:text-white">Forgot?</NavLink>
              </div>
              <input
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Your password"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <div className="text-xs text-slate-400">or continue with</div>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="overflow-hidden rounded-lg">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google sign in failed")}
                theme="filled_black"
                size="large"
                text="signin_with"
                width="100%"
              />
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">Don't have an account? <NavLink to="/register" className="text-white font-medium">Sign up</NavLink></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
