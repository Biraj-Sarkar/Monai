import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Forget() {
  const [loginData, setLoginData] = useState({ email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const { email } = loginData;

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credential");
      }

      setSuccess(data.message || "Password reset link sent. Please check your email.");
    } catch (error) {
      setError(error.message || "Failed to send reset email");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-extrabold text-white">Forgot Password</h1>
            <p className="mt-1 text-sm text-slate-300">No worries! Enter your email address below, and we'll send you a link to reset your password.</p>
          </header>

          {error && (
            <div className="mb-4 rounded-md bg-rose-900/60 border border-rose-700/40 p-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-emerald-900/60 border border-emerald-700/40 p-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <form onSubmit={handleForgetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">Email</label>
              <input
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
};
