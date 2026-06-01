const scrollToId = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function CTASection() {
  return (
    <section
      id="cta"
      className="mt-5 rounded-4xl border border-slate-200/70 bg-[linear-gradient(135deg,#0f1014,#1a1c23)] p-10 text-slate-50 text-center shadow-[0_28px_70px_rgba(15,18,28,0.12)]"
    >
      {/* Heading */}
      <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.05]">
        Take control of your money today.
      </h2>

      {/* Subtext */}
      <p className="mt-4 max-w-2xl mx-auto text-base text-slate-300">
        Track expenses, understand your habits, and get AI-powered insights — all in one place.
      </p>

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          onClick={scrollToId("navbar")}
          className="inline-flex items-center justify-center rounded-full bg-[#c7ff00] px-6 py-3 font-bold text-slate-950 shadow-[0_18px_34px_rgba(199,255,0,0.22)] transition duration-200 hover:-translate-y-1 cursor-pointer"
        >
          Start Tracking Free
        </a>
        <a
          onClick={scrollToId("features")}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-slate-50 transition duration-200 hover:-translate-y-1 cursor-pointer"
        >
          Explore Features
        </a>
      </div>

      {/* Trust / Friction Reduction */}
      <p className="mt-6 text-sm text-slate-400">
        No credit card required · Takes less than 2 minutes
      </p>
      
      {/* Social Proof */}
      <p className="mt-2 text-sm text-slate-500">
        Trusted by thousands of users managing their daily expenses smarter.
      </p>
    </section>
  )
}