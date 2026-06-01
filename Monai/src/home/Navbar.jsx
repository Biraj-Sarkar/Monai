import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../utils/authSlice";

const navItems = [
  { label: 'Dashboard', to: "/dashboard", requiresAuth: true },
  { label: 'Insights', to: "/insights", requiresAuth: true },
  { label: 'Contact', to: "/contact", requiresAuth: false },
]

export default function Navbar() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };
  
  return (
    <header 
      id="navbar" 
      className={`
        sticky top-4 z-20 mx-auto mt-4 
        flex w-[min(1180px,calc(100%-1rem))] 
        items-center justify-between gap-4 
        rounded-3xl border px-4 py-3 
        backdrop-blur-xl transition-all duration-300
        sm:w-[min(1180px,calc(100%-2rem))] sm:px-5
        ${
          theme === "dark"
            ? "border-slate-700/60 bg-slate-900/85 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            : "border-white/60 bg-slate-50/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        }
      `}
    >
      <NavLink to="/" className="inline-flex items-center gap-3 text-slate-950 no-underline">
        <img 
          className="h-10 w-10 rounded-2xl shadow-[0_10px_30px_rgba(199,255,0,0.28)]" 
          src="/logo.svg" 
          alt="Expense Tracker logo" 
        />
        <span className={`
          text-base font-extrabold tracking-[0.02em]
          ${
            theme === "dark"
              ? "text-white"
              : ""
          }
          `}
        >
          Expense Tracker
        </span>
      </NavLink>

      <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
        {navItems.map((item) => {
          const target = item.requiresAuth && !isAuthenticated
            ? { pathname: '/login', state: { from: item.to } }
            : item.to;

          return (
            <NavLink
              key={item.label}
              to={target}
              className="rounded-full px-4 py-2 text-sm text-slate-500 transition duration-200 hover:-translate-y-px hover:bg-slate-950/5 hover:text-slate-950"
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className={`
            cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-md border shadow-[0_10px_20px_rgba(15,18,28,0.08)] transition duration-200 hover:-translate-y-px
            ${theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-500"}
          `}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current"
            >
              <circle cx="12" cy="12" r="4" strokeWidth="2" />
              <path d="M12 2V4" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 20V22" strokeWidth="2" strokeLinecap="round" />
              <path d="M4.93 4.93L6.34 6.34" strokeWidth="2" strokeLinecap="round" />
              <path d="M17.66 17.66L19.07 19.07" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 12H4" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 12H22" strokeWidth="2" strokeLinecap="round" />
              <path d="M4.93 19.07L6.34 17.66" strokeWidth="2" strokeLinecap="round" />
              <path d="M17.66 6.34L19.07 4.93" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              aria-hidden
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current"
            >
              <path
                d="M21 12.79C20.26 13.03 19.47 13.16 18.64 13.16C14.58 13.16 11.29 9.87 11.29 5.81C11.29 4.98 11.42 4.19 11.66 3.45C8.15 4.59 5.62 7.87 5.62 11.74C5.62 16.53 9.49 20.4 14.28 20.4C18.15 20.4 21.43 17.87 22.57 14.36C22.01 13.86 21.49 13.32 21 12.79Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {isAuthenticated ? (
          <NavLink
            to="/login"
            onClick={() => dispatch(logout())}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(16,17,20,0.14)] transition duration-200 hover:-translate-y-px"
          >
            Logout
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(16,17,20,0.14)] transition duration-200 hover:-translate-y-px"
          >
            Login
          </NavLink>
        )}
      </div>
    </header>
  )
}