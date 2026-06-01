import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

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

          <div className="flex gap-3">
            <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/6 bg-white/3 px-3 py-2 text-sm text-white hover:bg-white/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M21 12.23c0-.74-.07-1.29-.22-1.86H12v3.52h5.48c-.11.95-.7 2.35-2.1 3.2l-.02.13 3.04 2.36.21.02c1.9-1.76 3-4.3 3-7.37z" fill="#4285F4"/>
                <path d="M12 22c2.7 0 4.9-.9 6.53-2.45l-3.12-2.42c-.86.57-1.98.97-3.41.97-2.62 0-4.84-1.77-5.63-4.15l-.12.01-3.07 2.37-.04.11C4.99 19.9 8.2 22 12 22z" fill="#34A853"/>
                <path d="M6.37 13.95A6.01 6.01 0 0 1 6 12c0-.66.11-1.3.32-1.9l-.02-.13-3.07-2.37-.1.05A9.99 9.99 0 0 0 2 12c0 1.6.36 3.12 1 4.49l3.37-2.54z" fill="#FBBC05"/>
                <path d="M12 6.5c1.47 0 2.78.5 3.81 1.47l2.85-2.85C16.92 3.34 14.7 2 12 2 8.2 2 4.99 4.1 3.5 7.12l3.07 2.37C7.16 7.77 9.38 6.5 12 6.5z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>

            <button type="button" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/6 bg-white/3 px-3 py-2 text-sm text-white hover:bg-white/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="3" y="3" width="8" height="8" fill="#F35325"/>
                <rect x="13" y="3" width="8" height="8" fill="#81BC06"/>
                <rect x="3" y="13" width="8" height="8" fill="#05A6F0"/>
                <rect x="13" y="13" width="8" height="8" fill="#FFB900"/>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <NavLink to="/login" className="text-white font-medium">Sign in</NavLink></p>
        </div>
      </div>
    </div>
  );
};

export default Register;