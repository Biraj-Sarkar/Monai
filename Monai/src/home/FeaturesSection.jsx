const featureCards = [
  {
    title: 'Smart Expense Tracking',
    icon: '🤖',
    description: 'Never lose track of your money again.',
  },
  {
    title: 'Insightful Analytics',
    icon: '📊',
    description: 'See exactly where your money leaks.',
  },
  {
    title: 'Budget Suggestions',
    icon: '💰',
    description: 'Get smart budgets before you overspend.',
  },
  {
    title: 'Lifestyle Detection',
    icon: '🎯',
    description: 'Understand your spending personality.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="mt-5 rounded-4xl border border-slate-200/70 bg-white/82 p-8 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
      
      {/* Heading */}
      <div className="flex justify-center">
        <div className="max-w-3xl">
          <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.06em] text-slate-950 text-center">
            More Than Tracking — It Understands Your Spending.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 text-center">
            Most people track expenses but still don’t understand spending.
          </p>
          <p className="-mt-2 text-base leading-7 text-slate-600 text-center">
            We analyze your habits and tell you exactly what’s happening.
          </p>
        </div>
      </div>

      {/* Featured Highlight */}
      <div className="mt-10 rounded-2xl border border-purple-200 bg-linear-to-r from-purple-50 to-sky-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          🚀 AI That Actually Explains Your Spending
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Not just numbers — get clear insights, patterns, and suggestions tailored to your habits.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {featureCards.map((card) => (
          <article
            key={card.title}
            className="group rounded-[1.4rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,246,240,0.96))] p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Icon */}
            <div className="mb-3 text-2xl">{card.icon}</div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-950">
              {card.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {card.description}
            </p>

            {/* Hover Accent Line */}
            <div className="mt-4 h-0.5 w-0 bg-linear-to-r from-purple-400 to-sky-400 transition-all duration-300 group-hover:w-12"></div>
          </article>
        ))}
      </div>
    </section>
  )
}