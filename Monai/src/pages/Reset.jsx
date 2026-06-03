import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export default function Reset() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing. Please request a new reset link.");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(data.message || "Your password has been reset successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setError(error.message || "Failed to reset password");
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
            <h1 className="text-2xl font-extrabold text-white">Create new password</h1>
            <p className="mt-1 text-sm text-slate-300">Enter a new password for your account. This reset link expires after 15 minutes.</p>
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

          {!token && (
            <div className="mb-4 rounded-md bg-amber-900/50 border border-amber-700/40 p-3 text-sm text-amber-100">
              This link is invalid or incomplete. Request a fresh password reset email.
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">New password</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
                disabled={!token || isSubmitting}
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={8}
                required
                disabled={!token || isSubmitting}
                className="mt-2 w-full rounded-lg bg-slate-800/60 border border-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={!token || isSubmitting}
              className="w-full inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Reset Password"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <NavLink to="/forgot" className="text-xs text-slate-400 hover:text-white">
              Request a new link
            </NavLink>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  )
};
