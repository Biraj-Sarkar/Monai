const metrics = [
  { label: 'Monthly spend', value: '₹18,650', delta: '↑ 8.2% vs last month' },
  { label: 'Suggested budget', value: '₹20,500', delta: 'Safe range' },
  { label: 'Top category', value: 'Food', delta: '42% of total spend' },
]

export default function FinanceSection() {
  return (
    <section id="finance" className="mt-5 rounded-4xl border border-slate-200/70 bg-white/82 p-8 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">

      {/* Heading */}
      <div className="flex justify-center">
        <div className="max-w-3xl">
          <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.06em] text-slate-950 text-center">
            See your money the way it actually works.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 text-center">
            Not just totals — understand patterns, habits, and where your money is going.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT - Dashboard Preview */}
        <div className="rounded-[1.4rem] border border-slate-200/70 bg-[linear-gradient(180deg,#101114,#1a1c23)] p-6 text-slate-50">

          <h3 className="text-lg font-semibold">Your Monthly Overview</h3>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:scale-[1.02] transition-all"
              >
                <span className="text-xs text-slate-300">{metric.label}</span>
                <strong className="block text-lg font-bold mt-1">{metric.value}</strong>
                <span className="text-xs text-slate-400">{metric.delta}</span>
              </article>
            ))}
          </div>

          {/* AI Insight (🔥 KEY ADDITION) */}
          <div className="mt-6 rounded-xl bg-purple-500/10 border border-purple-400/20 p-4">
            <p className="text-sm text-purple-200">
              ⚡ You spent <strong>32% more on food</strong> this month.
            </p>
            <p className="text-xs text-purple-300 mt-1">
              Suggestion: Reduce dining out by ₹2,000 to stay within budget.
            </p>
          </div>
        </div>

        {/* RIGHT - Char */}
        <div className="grid content-center gap-4 rounded-[1.4rem] border border-slate-200/70 bg-white p-6">
          <h4 className="text-sm font-semibold text-slate-700 text-center">
            Spending Breakdown
          </h4>
          <div className="mx-auto grid aspect-square w-56 place-items-center rounded-full bg-[conic-gradient(var(--color-lime-400)_0_42%,var(--color-cyan-400)_42%_68%,#ddd_68%_100%)]">
            <div className="grid aspect-square w-36 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(16,17,20,0.08)]">
              <span className="block text-3xl font-extrabold text-slate-950">₹18.6K</span>
              <small className="mt-2 block text-sm text-slate-500">This month</small>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/5 px-4 py-3">
              <span className="text-sm text-slate-700">Food</span>
              <strong className="text-sm text-slate-950">42%</strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/5 px-4 py-3">
              <span className="text-sm text-slate-700">Transport</span>
              <strong className="text-sm text-slate-950">18%</strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/5 px-4 py-3">
              <span className="text-sm text-slate-700">Shopping</span>
              <strong className="text-sm text-slate-950">15%</strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/5 px-4 py-3">
              <span className="text-sm text-slate-700">Other</span>
              <strong className="text-sm text-slate-950">25%</strong>
            </div>
          </div>
        </div> 
      </div>
    </section>
  )
}