import { useState } from "react";
import ai_assistance from "../assets/AI_assistance.png"

export default function Help() {
  const [openIndices, setOpenIndices] = useState([]);
  const [assistant, setAssistant] = useState(false);

  const toggle = (i) => {
    setOpenIndices((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };
  const questions = [
    {
      question: "How do I add a new expense?",
      answers:
        "Go to the Expenses page, click 'Add Expense', enter the amount, category, date, and an optional note, then save. Your expense will be added instantly and reflected in your reports.",
    },
    {
      question: "Can I edit or delete an expense after adding it?",
      answers:
        "Yes. Open the expense from your transaction list and choose Edit or Delete. Any changes are automatically reflected in your balance, category totals, and analytics.",
    },
    {
      question: "How can I track my spending by category?",
      answers:
        "Every expense can be assigned to a category such as Food, Transportation, Shopping, Bills, or Entertainment. The dashboard and analytics pages show category-wise spending breakdowns and charts.",
    },
    {
      question: "How do I view my spending history?",
      answers:
        "All your transactions are stored securely and can be viewed from the Expenses page. You can filter records by date, category, amount, or keyword to find specific expenses quickly.",
    },
    {
      question: "What insights does the dashboard provide?",
      answers:
        "The dashboard displays total expenses, spending trends, category-wise analysis, monthly summaries, and visual charts to help you understand your financial habits.",
    },
    {
      question: "Is my financial data secure?",
      answers:
        "Yes. Your account is protected through secure authentication, encrypted communication, and industry-standard security practices. Only you can access your personal expense records.",
    },
    {
      question: "Is there a mobile app available?",
      answers:
        "Currently, there is no dedicated mobile app. However, the website is mobile-friendly and can be accessed through any modern smartphone browser.",
    },
    {
      question: "What should I do if I forget my password?",
      answers:
        "Use the 'Forgot Password' option on the login page. A password reset link or verification process will help you regain access to your account.",
    },
    {
      question: "Can I download my expense data?",
      answers:
        "Yes. You can export your transactions and reports in formats such as CSV or Excel for backup, analysis, or record-keeping purposes.",
    },
  ];

  return (
    <div className="min-h-screen app-page-bg">
      <div className="fixed bottom-5 right-5 z-50">
        {!assistant ? (
          <button
            type="button"
            onClick={() => setAssistant(true)}
            className="overflow-hidden border rounded-full border-[#FFFDD0] w-12 h-12 cursor-pointer shadow-[0_12px_30px_rgba(15,18,28,0.25)] transition-transform hover:scale-105"
            aria-label="Open AI assistant"
          >
            <img src={ai_assistance} alt="AI Assistance" className="w-full h-full object-cover scale-130" />
          </button>
        ) : (
          <div className="w-88 max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200/70 bg-white/90 dark:bg-slate-950/90 shadow-[0_24px_70px_rgba(15,18,28,0.28)] backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 dark:border-slate-700/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Assistant</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ask about expenses, insights, or account help</p>
              </div>
              <button
                type="button"
                onClick={() => setAssistant(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                aria-label="Close AI assistant"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="h-80 space-y-3 px-4 py-6 flex flex-col justify-center">
              <div className="bg-clip-text text-transparent bg-linear-to-r from-[#e70909] to-[#c8d385f7] text-4xl text-center leading-relaxed pb-1">
                Coming soon...
              </div>
            </div>

            <div className="border-t border-slate-200/70 dark:border-slate-700/70 p-3">
              <button
                type="button"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Type your message...
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center items-center mt-5">
        <h1 className="bg-clip-text text-transparent bg-linear-to-r from-[#2E1A47] to-[#D80032] dark:from-cyan-500 dark:to-pink-500 text-5xl font-bold text-center leading-relaxed">Frequently asked</h1>
        <h1 className="bg-clip-text text-transparent bg-linear-to-r from-[#2E1A47] to-[#D80032] dark:from-cyan-500 dark:to-pink-500 text-5xl font-bold text-center leading-relaxed">questions</h1>
      </div>
      <div className="box-border m-auto mt-8 w-full max-w-3xl rounded-4xl border border-slate-200/70 bg-white/60 dark:bg-slate-900/60 p-8 shadow-[0_28px_70px_rgba(15,18,28,0.12)] backdrop-blur-xl">
        {questions.map((q, i) => {
          const isOpen = openIndices.includes(i);
          return (
            <div key={i} className="mb-6">
              <div
                onClick={() => toggle(i)}
                className={
                  `group flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer ` +
                  (isOpen
                    ? "bg-white/30 shadow-lg dark:bg-slate-800/60"
                    : "hover:bg-white/30 hover:shadow-md dark:hover:bg-slate-800/50")
                }
              >
                <h3
                  className={
                    `text-lg sm:text-xl font-semibold transition-all duration-150 ` +
                    (isOpen ? "text-xl" : "group-hover:text-xl") +
                    " text-slate-900 dark:text-slate-100"
                  }
                >
                  {q.question}
                </h3>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(i);
                  }}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? "Collapse answer" : "Expand answer"}
                  className="ml-4 w-9 h-9 flex items-center justify-center rounded-full border border-slate-200/40 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                </button>
              </div>

              <div className={`mt-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="leading-relaxed">{q.answers}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}