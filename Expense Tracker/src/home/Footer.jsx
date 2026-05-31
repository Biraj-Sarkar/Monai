import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import githubIcon from '../assets/github.svg';
import linkedInIcon from '../assets/linkedIn.svg';
import xIcon from '../assets/X.svg';

const footerColumns = [
  {
    title: 'Quick Links',
    links: [
      { label: 'Home', to: '/', requiresAuth: false },
      { label: 'Dashboard', to: '/dashboard', requiresAuth: true },
      { label: 'Insights', to: '/insights', requiresAuth: true },
      { label: 'Contact', to: '/contact', requiresAuth: false },
    ],
  },
  {
    title: 'Support & Legal',
    links: [
      { label: 'Help', to: '/help', requiresAuth: false },
      { label: 'Terms', to: '/terms', requiresAuth: true },
      { label: 'Privacy', to: '/privacy', requiresAuth: true },
      { label: 'Settings', to: '/settings', requiresAuth: true },
    ],
  },
];

const scrollToId = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Footer() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <footer className="mx-auto mb-8 mt-5 w-[min(1180px,calc(100%-1rem))] rounded-4xl border border-slate-200/70 bg-[#0d0d10] p-8 text-slate-50">
      {/* Top Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
        {/* Brand */}
        <div>
          <NavLink
            to="/"
            className="flex items-center gap-3"
            onClick={() => {
              if (typeof window !== 'undefined' && window.location.pathname === '/') {
                try { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0,0); }
              }
            }}
          >
            <img
              className="h-10 w-10 rounded-2xl shadow-[0_10px_30px_rgba(199,255,0,0.28)]"
              src="/logo.svg"
              alt="Expense Tracker logo"
            />
            <span className="text-base font-extrabold tracking-wide">
              Expense Tracker
            </span>
          </NavLink>

          <p className="mt-3 max-w-sm text-sm text-slate-300">
            AI-powered expense tracking that helps you understand, not just record your spending.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Built for clarity, not complexity.
          </p>
        </div>

        {/* Columns */}
        {footerColumns.map((column) => (
          <div
            key={column.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <h3 className="text-sm font-semibold text-slate-200">
              {column.title}
            </h3>

            <ul className="mt-3 space-y-2">
              {column.links.map((link) => {
                const target =
                  link.requiresAuth && !isAuthenticated
                    ? "/login"
                    : link.to;

                return (
                  <li key={link.label}>
                    <NavLink
                      to={target}
                      className="text-sm text-slate-400 hover:text-white transition"
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.location.pathname === target) {
                          try { window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0,0); }
                        }
                      }}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Contact + Social */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold text-slate-200">Contact</h3>

          <p className="mt-3 text-sm text-slate-400">
            support@expensetracker.app
          </p>

          {/* Social Icons */}
          <div className="mt-4 flex gap-3">
            <a href="https://github.com/Biraj-Sarkar" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10" aria-label="GitHub">
              <img src={githubIcon} alt="GitHub" className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/in/biraj-sarkar-29a141322/" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10" aria-label="LinkedIn">
              <img src={linkedInIcon} alt="LinkedIn" className="h-5 w-5" />
            </a>
            <a href="https://x.com/sarkarbiraj016" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10" aria-label="X">
              <img src={xIcon} alt="X" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-slate-500 sm:flex-row">
        <span>© 2026 Expense Tracker. All rights reserved.</span>
        <span>Designed & built with focus on simplicity.</span>
      </div>
    </footer>
  );
}