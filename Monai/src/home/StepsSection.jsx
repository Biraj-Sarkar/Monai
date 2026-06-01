const steps = [
  {
    title: 'Sign in and get started',
    desc: 'No complex setup — just log in and begin tracking.',
    icon: '🔐',
  },
  {
    title: 'Add expenses in seconds',
    desc: 'Quickly log what you spend, when you spend it.',
    icon: '➕',
  },
  {
    title: 'See your monthly picture',
    desc: 'We automatically organize and calculate everything.',
    icon: '📊',
  },
  {
    title: 'Get AI insights instantly',
    desc: 'Understand patterns and receive smart suggestions.',
    icon: '⚡',
  },
]

export default function StepsSection() {
  return (
    <section id="steps" className="mt-5 rounded-4xl border border-slate-200/70 bg-white/82 p-8 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
      <div className="flex justify-center">
        <div className="max-w-3xl">
          <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.06em] text-slate-950 text-center">
            Start in seconds. Understand your money instantly.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 text-center">
            From adding expenses to getting insights — everything happens seamlessly.
          </p>
          <p className="-mt-2 text-base leading-7 text-slate-600 text-center">
            Takes less than 2 minutes to get your first insight.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT - Steps */}
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all"
            >
              {/* Number */}
              <span className="text-lg font-bold text-purple-500">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Icon */}
              <div className="text-xl">{step.icon}</div>

              {/* Content */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {step.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* RIGHT - Visual Flow */}
        <div className="grid min-h-96 place-items-center rounded-3xl bg-[linear-gradient(180deg,#1a1a1d_0%,#101114_100%)] p-4">
          <div className="w-[min(18rem,80%)] rounded-4xl bg-[linear-gradient(180deg,#2f3138,#09090b)] p-4 shadow-xl">
            <div className="rounded-3xl bg-linear-to-b from-slate-100 to-slate-200 p-4">
              <div className="mb-4 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-950/20" />
                <span className="h-2 w-2 rounded-full bg-slate-950/20" />
                <span className="h-2 w-2 rounded-full bg-slate-950/20" />
              </div>
              {/* Insight */}
              <div className="rounded-xl bg-linear-to-r from-purple-400 to-sky-400 p-4 text-white">
                <strong className="block text-sm">AI Insight</strong>
                <p className="text-xs mt-1">You’re spending more on food this week</p>
              </div>
              {/* Expense */}
              <div className="mt-3 rounded-xl bg-white p-4 shadow">
                <strong className="text-sm">Expense added</strong>
                <p className="text-xs text-slate-500 mt-1">
                  Food · ₹850 · Today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}