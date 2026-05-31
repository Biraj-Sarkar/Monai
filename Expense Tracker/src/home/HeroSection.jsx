import heroBg from '../assets/HeroSectionBG.png'

const scrollToId = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function HeroSection() {
  return (
    <section
      id="heroSection"
      className="hero-bg mt-5 overflow-hidden rounded-4xl border border-slate-200/70 px-6 py-10 text-slate-50 shadow-[0_28px_70px_rgba(15,18,28,0.12)] sm:px-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="relative z-1 py-4 flex flex-col justify-between text-center sm:text-left">
        <div>
          <span className="inline-flex items-center rounded-full border border-slate-600/40 bg-slate-900/40 px-3 py-1 text-xs font-semibold tracking-wide text-slate-200">
            ⚡ AI POWERED FINANCE
          </span>

          <h1 className="mt-6 max-w-full text-3xl font-extrabold leading-snug tracking-[-0.02em] sm:text-4xl lg:text-4xl">
            Smarter Spending.
            <span className="block bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-sky-400">
              Better Tomorrow.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200/80">
            Track expenses automatically, get AI-powered insights, and take control of your financial future.
          </p>
        </div>

        {/* Bottom: CTAs on one line, users below */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="#features"
              onClick={scrollToId('features')}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-sky-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform duration-150 hover:-translate-y-px"
            >
              Explore Features
            </a>
            <a
              href="#cta"
              onClick={scrollToId('cta')}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-50 transition-transform duration-150 hover:-translate-y-px"
            >
              Get Started
            </a>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="-space-x-2 flex">
              <div className="h-6 w-6 rounded-full ring-1 ring-white/30 bg-linear-to-r from-pink-500 to-yellow-400" />
              <div className="h-6 w-6 rounded-full ring-1 ring-white/30 bg-linear-to-r from-indigo-500 to-purple-400" />
              <div className="h-6 w-6 rounded-full ring-1 ring-white/30 bg-linear-to-r from-cyan-400 to-blue-500" />
              <div className="h-6 w-6 rounded-full ring-1 ring-white/30 bg-linear-to-r from-green-400 to-teal-500" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-slate-200">
                <span className="text-amber-400">★★★★★</span>
                <span className="font-medium">Join 10,000+ happy users</span>
              </div>
            </div>
          </div>
        </div>
        {/* Trust / Proof */}
        <div className="mt-2">
          <p className="text-sm text-slate-500">
            Trusted by students & professionals to manage daily expenses smarter.
          </p>
        </div>
      </div>

      <div className="relative mt-8 min-h-128 rounded-[1.75rem] lg:mt-0" aria-hidden="true">
        {/* Background contains mobile mockups; inner floating cards removed so image shows through */}
      </div>
    </section>
  )
}