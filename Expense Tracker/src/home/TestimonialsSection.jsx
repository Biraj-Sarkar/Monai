const testimonials = [
  {
    quote: 'I finally understand where my money goes every month. The insights are insanely helpful.',
    name: 'Aarav Mehta',
    role: 'Freelancer',
    avatar: '🧑‍💻',
  },
  {
    quote: 'Seeing patterns and budget warnings in one place changed how I spend completely.',
    name: 'Sara Khan',
    role: 'Product Designer',
    avatar: '👩‍🎨',
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="mt-5 rounded-4xl border border-slate-200/70 bg-white/82 p-8 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
      <div className="flex justify-center">
        <div className="max-w-3xl">
          <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-slate-950 text-center">
            Loved by people who want control over their money.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 text-center">
            Real users, real clarity — no more guessing where your money goes.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {testimonials.map((item, index) => (
          <article
            key={item.name}
            className={`group rounded-[1.6rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              index === 0
                ? 'bg-linear-to-br from-purple-50 to-sky-50 border-purple-200'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Stars */}
            <div className="text-amber-400 text-sm">★★★★★</div>
            {/* Quote */}
            <p className="mt-3 text-base leading-7 text-slate-700">
              “{item.quote}”
            </p>
            {/* User */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-linear-to-r from-purple-400 to-sky-400 text-white text-lg">
                {item.avatar}
              </div>
              <div>
                <strong className="block text-sm text-slate-950">
                  {item.name}
                </strong>
                <span className="block text-xs text-slate-500">
                  {item.role}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Trust Line */}
      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500">
          Join thousands of users building better financial habits every day.
        </p>
      </div>
    </section>
  )
}