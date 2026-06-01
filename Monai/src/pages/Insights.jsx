import {
	Sparkles,
	RefreshCcw,
	TrendingUp,
	Wallet,
	Utensils,
	CalendarDays,
	Target,
	ShieldCheck,
	ArrowUpRight,
	Lightbulb,
	Car,
	ShoppingBag,
	ChevronRight,
	Zap,
	CircleDollarSign,
	PiggyBank,
	BarChart3,
	BadgePercent,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "../utils/toast";
import { authFetch } from "../utils/apiClient";

const API_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (value) => {
	const amount = Number(value);
	if (!Number.isFinite(amount)) return "Not enough data yet";
	return `₹${amount.toLocaleString("en-IN")}`;
};

const formatGeneratedAt = (value) => {
	if (!value) return "Not generated yet";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Not generated yet";
	return date.toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const CATEGORY_COLORS = ["#84cc16", "#06b6d4", "#a78bfa", "#fb923c", "#cbd5e1", "#ef4444", "#f59e0b", "#14b8a6"];

function toDateKey(dateValue) {
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getCurrentMonthRange() {
	const now = new Date();
	const start = new Date(now.getFullYear(), now.getMonth(), 1);
	const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	return { from: toDateKey(start), to: toDateKey(end) };
}

function buildMonthlyCategoryBreakdown(expenses) {
	const { from, to } = getCurrentMonthRange();
	const totals = {};

	expenses.forEach((expense) => {
		const dateKey = toDateKey(expense.date);
		if (dateKey < from || dateKey > to) return;
		const category = !expense.category || expense.category === "Other" ? "Others" : expense.category;
		totals[category] = (totals[category] || 0) + (Number(expense.amount) || 0);
	});

	const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
	if (!total) return { total: 0, allCategories: [], compactCategories: [] };

	const allCategories = Object.entries(totals)
		.sort(([, a], [, b]) => b - a)
		.map(([label, amount], index) => ({
			label,
			amount,
			percent: Math.round((amount / total) * 100),
			color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
		}));

	const topThree = allCategories.slice(0, 3);
	const remaining = allCategories.slice(3);
	const remainingAmount = remaining.reduce((sum, item) => sum + item.amount, 0);
	const compactCategories = remaining.length
		? [
			...topThree,
			{
				label: "Others",
				amount: remainingAmount,
				percent: Math.max(0, 100 - topThree.reduce((sum, item) => sum + item.percent, 0)),
				color: "#cbd5e1",
			},
		]
		: topThree;

	return { total, allCategories, compactCategories };
}

function buildFallbackCategoryInsights({ hasComparisonData, topCategoryLabel, topCategoryPercent }) {
	if (!hasComparisonData) {
		return [
			{
				category: "History needed",
				description: "Add another month of expenses to compare category changes against last month.",
				change: null,
				changeType: "down",
			},
		];
	}

	return [
		{
			category: topCategoryLabel || "Overall spend",
			description: topCategoryPercent != null
				? `Your largest spending area currently accounts for about ${topCategoryPercent}% of the month.`
				: "Your largest spending area is the most consistent pattern in the latest month.",
			change: null,
			changeType: "up",
		},
		{
			category: "Month-to-month trend",
			description: "No large category spikes were detected from the latest comparison.",
			change: null,
			changeType: "down",
		},
	];
}

function buildFallbackTips({ hasComparisonData, topCategoryLabel, topCategoryPercent, predictedSpend, suggestedBudget, lifestyleTags = [] }) {
	const tips = [];

	if (!hasComparisonData) {
		tips.push({
			title: "Track one more month",
			description: "Once you have two months of expenses, the app can show real increases and decreases.",
			iconKind: "lightbulb",
		});
	}

	if (Number.isFinite(Number(predictedSpend)) && Number.isFinite(Number(suggestedBudget))) {
		const gap = Math.round(Number(suggestedBudget) - Number(predictedSpend));
		if (gap > 0) {
			tips.push({
				title: "You are under budget",
				description: `Your forecast is about ₹${gap.toLocaleString("en-IN")} below the suggested budget.`,
				iconKind: "savings",
			});
		} else if (gap < 0) {
			tips.push({
				title: "Budget pressure detected",
				description: `Your forecast is about ₹${Math.abs(gap).toLocaleString("en-IN")} above the suggested budget.`,
				iconKind: "alert",
			});
		}
	}

	if (topCategoryLabel && topCategoryLabel !== "Not enough data yet") {
		tips.push({
			title: `Watch ${topCategoryLabel}`,
			description: topCategoryPercent != null
				? `${topCategoryLabel} currently makes up about ${topCategoryPercent}% of your spend.`
				: `Your spending is currently centered around ${topCategoryLabel}.`,
			iconKind: "focus",
		});
	}

	if (lifestyleTags.length > 0) {
		tips.push({
			title: `Lifestyle pattern: ${lifestyleTags[0]}`,
			description: "This is inferred from your latest month and helps keep recommendations relevant.",
			iconKind: "lifestyle",
		});
	}

	return tips.slice(0, 4);
}

/* ─────────────────────────── Donut ─────────────────────────── */
function Donut({ breakdown = [], amount = 0, size = 180 }) {
	const [hovered, setHovered] = useState(null);
	const data = breakdown;
	const totalAmount = data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
	const displayItem = hovered != null ? data[hovered] : null;
	const radius = size * 0.34;
	const stroke = size * 0.10;
	const center = size / 2;
	let offset = 0;
	const circ = 2 * Math.PI * radius;

	if (!data.length) {
		return (
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} className="dark:stroke-slate-700/60" />
				<circle cx={center} cy={center} r={radius - stroke / 2 - 2} fill="white" className="dark:fill-[#121826]" />
				<text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: size * 0.08, fontWeight: 700 }} className="fill-slate-500 dark:fill-slate-400">
					No spend
				</text>
				<text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: size * 0.058, fill: "#94a3b8" }}>
					This month
				</text>
			</svg>
		);
	}

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onMouseLeave={() => setHovered(null)}>
			{/* track */}
			<circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} className="dark:stroke-slate-700/60" />
			{data.map((d, i) => {
				const pct = (Number(d.amount) || 0) / totalAmount;
				const seg = pct * circ;
				const dashArray = `${seg} ${circ - seg}`;
				const el = (
					<circle
						key={i}
						onMouseEnter={() => setHovered(i)}
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke={d.color}
						strokeWidth={hovered === i ? stroke + 2 : stroke}
						strokeDasharray={dashArray}
						strokeDashoffset={-offset}
						transform={`rotate(-90 ${center} ${center})`}
						strokeLinecap="butt"
						className="cursor-pointer"
						style={{ transition: "stroke-dasharray 0.6s ease, stroke-width 0.2s ease", filter: "drop-shadow(0 0 4px " + d.color + "55)" }}
					>
						<title>{`${d.label}: ${formatCurrency(d.amount)} (${d.percent}%)`}</title>
					</circle>
				);
				offset += seg;
				return el;
			})}
			{/* white / dark inner disc */}
			<circle cx={center} cy={center} r={radius - stroke / 2 - 2} fill="white" className="dark:fill-[#121826]" />
			<text
				x="50%"
				y="46%"
				dominantBaseline="middle"
				textAnchor="middle"
				style={{ fontSize: size * 0.097, fontWeight: 700, fill: "currentColor" }}
				className="fill-slate-900 dark:fill-white dark:text-white"
			>
				{displayItem ? formatCurrency(displayItem.amount) : formatCurrency(amount)}
			</text>
			<text
				x="50%"
				y="62%"
				dominantBaseline="middle"
				textAnchor="middle"
				style={{ fontSize: size * 0.062, fill: "#94a3b8" }}
			>
				{displayItem ? displayItem.label : "This month"}
			</text>
		</svg>
	);
}

/* ─────────────────────────── KPI Card ─────────────────────────── */
function KpiCard({ title, value, hint, hintColor = "text-emerald-500 dark:text-emerald-400", icon, iconBg }) {
	return (
		<div className="group relative rounded-2xl bg-white dark:bg-[#0f1623] border border-slate-100 dark:border-slate-800/60 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(15,23,42,0.11)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:-translate-y-0.75 transition-all duration-300 cursor-default overflow-hidden">
			{/* subtle top gradient line */}
			<div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
				{icon}
			</div>

			<p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
				{title}
			</p>
			<p className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
				{value}
			</p>
			{hint && (
				<p className={`mt-1.5 text-xs font-medium ${hintColor}`}>{hint}</p>
			)}
		</div>
	);
}

/* ─────────────────────────── Breakdown Row ─────────────────────────── */
function BreakdownRow({ label, percent, amount, color }) {
	return (
		<div className="group flex items-center gap-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors duration-200">
			<span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ background: color }} />
			<span className="flex-1 text-sm text-slate-600 dark:text-slate-300 font-medium">{label}</span>
			{/* progress bar */}
			<div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-700"
					style={{ width: `${percent}%`, background: color }}
				/>
			</div>
			<span className="w-8 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">{percent}%</span>
			{amount != null && (
				<span className="w-14 text-right text-xs font-semibold text-slate-700 dark:text-slate-200">
					₹{Number(amount).toLocaleString("en-IN")}
				</span>
			)}
		</div>
	);
}

/* ─────────────────────────── Category Insight Card ─────────────────────────── */
const CATEGORY_ICON_MAP = {
	food: <Utensils className="w-4 h-4" />,
	transport: <Car className="w-4 h-4" />,
	shopping: <ShoppingBag className="w-4 h-4" />,
	dining: <Utensils className="w-4 h-4" />,
};

function CategoryInsightRow({ label, description, change, changeType = "up", icon, iconBg, iconColor }) {
	const isUp = changeType === "up";
	return (
		<div className="flex items-start gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 group">
			<div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
				<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
			</div>
			{change && (
				<span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${isUp ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"}`}>
					{isUp ? `↑ ${change}%` : `↓ ${change}%`}
				</span>
			)}
		</div>
	);
}

/* ─────────────────────────── AI Tips Row ─────────────────────────── */
function TipRow({ icon, iconBg, title, description }) {
	return (
		<div className="flex items-start gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl px-3 -mx-3 transition-colors duration-200">
			<div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
				<p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
			</div>
			<ChevronRight className="shrink-0 w-4 h-4 text-slate-300 dark:text-slate-600 mt-1.5 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors duration-200" />
		</div>
	);
}

/* ─────────────────────────── Skeleton ─────────────────────────── */
function Skeleton({ className = "" }) {
	return <div className={`animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60 ${className}`} />;
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function Insights() {
	const { isAuthenticated } = useSelector((state) => state.auth);
	const dispatch = useDispatch();

	const [insights, setInsights] = useState(null);
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [error, setError] = useState(null);
	const [showAllCategories, setShowAllCategories] = useState(false);
	const [showAllTips, setShowAllTips] = useState(false);

	const fetchInsights = async () => {
		try {
			setLoading(true);
			setError(null);
			const [insightRes, expenseRes] = await Promise.all([
				authFetch(dispatch, `${API_URL}/api/insights`, { method: "GET" }),
				authFetch(dispatch, `${API_URL}/api/expenses/read`, { method: "GET" }),
			]);

			if (!insightRes.ok) throw new Error("Failed to load insights");
			if (!expenseRes.ok) throw new Error("Failed to load expenses");

			const insightData = await insightRes.json();
			const insightPayload = insightData.data || insightData;
			setInsights(insightPayload.insights || null);

			const expenseData = await expenseRes.json();
			const expensePayload = expenseData.data || expenseData;
			setExpenses(expensePayload.expenses || []);
		} catch (err) {
			console.error("Insights load error", err);
			setError(err.message || "Error loading insights");
			toast.error("Unable to load insights. Try again.");
		} finally {
			setLoading(false);
		}
	};

	const regenerateInsights = async () => {
		try {
			setIsRegenerating(true);
			setError(null);
			const res = await authFetch(dispatch, `${API_URL}/api/insights/generate`, { method: "POST" });
			if (!res.ok) {
				if (res.status === 429) {
					const payload = await res.json().catch(() => ({}));
					throw new Error(payload.message || "Please wait before regenerating insights again.");
				}
				throw new Error("Failed to generate insights");
			}
			const data = await res.json();
			const payload = data.data || data;
			setInsights(payload.insights || null);
			toast.success("Insights refreshed!");
		} catch (err) {
			console.error("Insights generate error", err);
			setError(err.message || "Failed to generate insights");
			toast.error(err.message || "Please wait before regenerating insights again.");
		} finally {
			setIsRegenerating(false);
		}
	};

	useEffect(() => {
		if (!isAuthenticated) return;
		fetchInsights();
	}, [isAuthenticated]);

	const monthlyCategoryData = useMemo(() => buildMonthlyCategoryBreakdown(expenses), [expenses]);

	if (!isAuthenticated) return null;

	const breakdown = monthlyCategoryData.allCategories;
	const legend = monthlyCategoryData.compactCategories;
	const totalSpending = monthlyCategoryData.total;
	const monthCount = Object.keys(insights?.monthlyTotals || {}).length;
	const hasComparisonData = monthCount >= 2;
	const categoryInsights = Array.isArray(insights?.categoryInsights) ? insights.categoryInsights : [];
	const tips = Array.isArray(insights?.tips) ? insights.tips : [];
	const topCategoryLabel = legend?.[0]?.label || insights?.topCategory || "Not enough data yet";
	const topCategoryPercent = Number.isFinite(Number(legend?.[0]?.percent))
		? Number(legend[0].percent)
		: (Number.isFinite(Number(insights?.topCategoryPercent)) ? Number(insights.topCategoryPercent) : null);
	const categoryFeed = categoryInsights.length > 0
		? categoryInsights
		: buildFallbackCategoryInsights({
			hasComparisonData,
			topCategoryLabel,
			topCategoryPercent,
		});
	const tipFeed = tips.length > 0
		? tips
		: buildFallbackTips({
			hasComparisonData,
			topCategoryLabel,
			topCategoryPercent,
			predictedSpend: insights?.predictedSpend,
			suggestedBudget: insights?.suggestedBudget,
			lifestyleTags: insights?.lifestyleTags || [],
		});
	const visibleCategoryInsights = showAllCategories ? categoryFeed : categoryFeed.slice(0, 3);
	const visibleTips = showAllTips ? tipFeed : tipFeed.slice(0, 3);
	const monthlySpendHint = hasComparisonData
		? (insights?.predictedChange != null
			? `${Number(insights.predictedChange) >= 0 ? "↑" : "↓"} ${Math.abs(Number(insights.predictedChange))}% vs last month`
			: "Compared with last month")
		: "Need at least 2 months of expenses for a month-over-month comparison";

	return (
		<div className="min-h-screen app-page-bg">

			{/* ── HERO ─────────────────────────────────────────────────── */}
			<section className="relative overflow-hidden">
				{/* ambient blobs */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute -top-16 right-40 w-72 h-72 bg-cyan-300/20 dark:bg-cyan-500/10 blur-[80px] rounded-full" />
					<div className="absolute top-24 left-1/3 w-56 h-56 bg-lime-300/20 dark:bg-lime-500/8 blur-[70px] rounded-full" />
					<div className="absolute bottom-0 left-8 w-48 h-48 bg-violet-300/15 dark:bg-violet-600/10 blur-[60px] rounded-full" />
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

						{/* left copy */}
						<div>
							<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-semibold tracking-wide border border-violet-200/60 dark:border-violet-500/20">
								<Sparkles className="w-3 h-3" />
								AI POWERED INSIGHTS
							</span>

							<h1 className="mt-4 text-4xl sm:text-[2.75rem] font-black tracking-tight leading-[1.1] text-slate-950 dark:text-white">
								Understand your spending.{" "}
								<span className="text-slate-600 dark:text-slate-300">Take control of your future.</span>
							</h1>

							<p className="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
								AI analyzes your expenses and finds patterns to help you save smarter and budget better.
							</p>

							<div className="mt-7 flex flex-wrap items-center gap-3">
								<button
									onClick={regenerateInsights}
									disabled={isRegenerating}
									className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{isRegenerating ? (
										<>
											<RefreshCcw className="w-4 h-4 animate-spin" />
											Regenerating…
										</>
									) : (
										<>
											<Sparkles className="w-4 h-4" />
											Regenerate Insights
										</>
									)}
								</button>

								<button
									onClick={fetchInsights}
									disabled={loading}
									className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:shadow-md transition-all duration-200 disabled:opacity-60"
								>
									<RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
									Refresh
								</button>
							</div>

							<p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
								Last generated:{" "}
								<span className="font-semibold text-slate-600 dark:text-slate-300">
									{formatGeneratedAt(insights?.generatedAt)}
								</span>
							</p>
						</div>

						{/* right — donut card */}
						<div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-slate-100 dark:border-slate-800/60 p-6 shadow-[0_8px_40px_rgba(15,23,42,0.09)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
							{/* top-right decorative blob */}
							<div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-cyan-200/40 dark:bg-cyan-500/10 blur-2xl rounded-full" />

							<p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
								Total Spend This Month
							</p>

							<div className="mt-4 flex items-center gap-6">
								<div className="shrink-0">
									<Donut breakdown={breakdown} amount={totalSpending} size={180} />
								</div>
								<ul className="flex-1 space-y-3 min-w-0">
									{legend.length ? (
										legend.map((it, i) => (
											<li key={i} className="flex items-center justify-between gap-2 group">
												<div className="flex items-center gap-2 min-w-0">
													<span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ background: it.color }} />
													<span className="text-sm text-slate-600 dark:text-slate-300 truncate">{it.label}</span>
												</div>
												<span className="shrink-0 text-sm font-semibold text-slate-500 dark:text-slate-400">{it.percent}%</span>
											</li>
										))
									) : (
										<li className="text-sm text-slate-500 dark:text-slate-400">No spending this month yet.</li>
									)}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── MAIN CONTENT ─────────────────────────────────────────── */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">

				{/* ── Loading State ── */}
				{loading && (
					<div className="space-y-6" aria-live="polite" aria-busy="true">
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
						</div>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							<Skeleton className="lg:col-span-2 h-56" />
							<Skeleton className="h-56" />
						</div>
						<Skeleton className="h-28" />
					</div>
				)}

				{/* ── Error State ── */}
				{!loading && error && (
					<div className="rounded-2xl p-6 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 shadow-sm">
						<p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
						<button
							onClick={fetchInsights}
							className="mt-4 px-4 py-2 text-sm font-medium bg-white dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 transition"
						>
							Retry
						</button>
					</div>
				)}

				{/* ── Empty State ── */}
				{!loading && !error && !insights && (
					<div className="rounded-2xl p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 shadow-sm text-center">
						<BarChart3 className="w-10 h-10 text-amber-400 mx-auto mb-3" />
						<h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">No insights generated yet</h2>
						<p className="mt-2 text-sm text-amber-700 dark:text-amber-300 max-w-md mx-auto">
							Add a few expenses, then generate your first AI prediction and budget recommendation.
						</p>
						<button
							onClick={regenerateInsights}
							disabled={isRegenerating}
							className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow transition disabled:opacity-60"
						>
							{isRegenerating ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Insights</>}
						</button>
					</div>
				)}

				{/* ── Loaded State ── */}
				{!loading && !error && insights && (
					<div className="space-y-6">

						{/* KPI CARDS */}
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							<KpiCard
								title="Predicted Spend"
								value={formatCurrency(insights.predictedSpend)}
								hint={monthlySpendHint}
								icon={<TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
								iconBg="bg-blue-50 dark:bg-blue-500/10"
							/>
							<KpiCard
								title="Suggested Budget"
								value={formatCurrency(insights.suggestedBudget)}
								hint="Safe range"
								hintColor="text-slate-400 dark:text-slate-500"
								icon={<Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
								iconBg="bg-emerald-50 dark:bg-emerald-500/10"
							/>
							<KpiCard
								title="Lifestyle"
								value={(insights.lifestyleTags || []).join(", ") || "Not enough data yet"}
								hint="Main spending pattern"
								hintColor="text-slate-400 dark:text-slate-500"
								icon={<Utensils className="w-5 h-5 text-orange-500 dark:text-orange-400" />}
								iconBg="bg-orange-50 dark:bg-orange-500/10"
							/>
							<KpiCard
								title="Last Generated"
								value={new Date(insights.generatedAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
								hint={new Date(insights.generatedAt || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
								hintColor="text-slate-400 dark:text-slate-500"
								icon={<CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
								iconBg="bg-indigo-50 dark:bg-indigo-500/10"
							/>
						</div>

						{/* MONTHLY OVERVIEW + SPENDING BREAKDOWN */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

							{/* Monthly Overview (dark card) */}
							<div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-linear-to-br from-[#050816] via-[#0c1128] to-[#1e1b4b] border border-white/6 text-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
								{/* decorative blobs */}
								<div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 bg-violet-600/20 blur-3xl rounded-full" />
								<div className="pointer-events-none absolute bottom-0 left-0 w-40 h-40 bg-blue-600/15 blur-3xl rounded-full" />

								<h3 className="relative text-base font-bold text-white">Your Monthly Overview</h3>

								<div className="relative mt-5 grid grid-cols-3 gap-3">
									{[
										{
											label: "Monthly spend",
											value: formatCurrency(totalSpending),
													sub: monthlySpendHint,
											subColor: "text-emerald-400",
										},
										{
											label: "Suggested budget",
											value: formatCurrency(insights.suggestedBudget),
											sub: "Safe range",
											subColor: "text-slate-400",
										},
										{
											label: "Top category",
													value: topCategoryLabel,
													sub: topCategoryPercent != null ? `${topCategoryPercent}% of total spend` : "Not enough category history yet",
											subColor: "text-slate-400",
										},
									].map((stat, i) => (
										<div key={i} className="rounded-xl bg-white/6 border border-white/8 p-4 hover:bg-white/9 transition-colors duration-200">
											<p className="text-xs text-slate-400 font-medium">{stat.label}</p>
											<p className="mt-2 text-xl font-black text-white">{stat.value}</p>
											<p className={`mt-1 text-xs font-medium ${stat.subColor}`}>{stat.sub}</p>
										</div>
									))}
								</div>

								{/* Alert banner */}
								<div className="relative mt-5 rounded-xl bg-violet-700/50 border border-violet-500/30 p-4 backdrop-blur-sm">
									<p className="text-sm font-semibold text-white flex items-center gap-2">
										<Zap className="w-4 h-4 text-yellow-300 shrink-0" />
											{hasComparisonData ? (
												<>
													Your top category is{" "}
													<span className="text-yellow-300">
														{topCategoryPercent != null ? `${topCategoryLabel} at ${topCategoryPercent}%` : topCategoryLabel}
													</span>{" "}
													of this month's spend.
												</>
											) : (
												"Add another month of expenses to unlock month-over-month insights."
											)}
									</p>
									<p className="mt-1.5 text-xs text-violet-200 leading-relaxed">
											{hasComparisonData
												? (insights.savingsSuggestion || "Suggestion: Reduce dining out by ₹2,000 to stay within budget.")
												: "When you have another month of data, the recommendation banner will show a real month-over-month callout."}
									</p>
								</div>
							</div>

							{/* Spending Breakdown */}
							<div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-slate-100 dark:border-slate-800/60 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
								<div className="flex items-center justify-between">
									<p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
										Spending Breakdown
									</p>
								</div>

								<div className="mt-4 flex justify-center">
									<Donut breakdown={breakdown} amount={totalSpending} size={148} />
								</div>

								<div className="mt-4 space-y-0.5">
									{legend.length ? (
										legend.map((it, i) => (
											<BreakdownRow
												key={i}
												label={it.label}
												percent={it.percent}
												amount={it.amount}
												color={it.color}
											/>
										))
									) : (
										<p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
											No category spending this month yet.
										</p>
									)}
								</div>
							</div>
						</div>

						{/* AI BUDGET RECOMMENDATION */}
						<div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f1623] border border-slate-100 dark:border-slate-800/60 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
							{/* decorative blob */}
							<div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 bg-violet-100/80 dark:bg-violet-600/10 blur-3xl rounded-full" />

							<div className="relative grid gap-8 md:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.7fr)] md:items-start">
								{/* icon + copy */}
								<div className="flex items-start gap-4">
									<div className="shrink-0 w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center shadow-sm">
										<PiggyBank className="w-6 h-6 text-violet-600 dark:text-violet-400" />
									</div>
									<div className="min-w-0">
										<p className="text-sm font-bold text-violet-600 dark:text-violet-400 tracking-wide">
											AI Budget Recommendation
										</p>
										<p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
											Based on your spending patterns and predictions, we{" "}
											<span className="font-semibold text-slate-700 dark:text-slate-200">recommend</span> a monthly budget of
										</p>
										<p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
											{formatCurrency(insights.suggestedBudget)}
										</p>
									</div>
								</div>

								{/* feature pills */}
								<div className="grid gap-6 sm:grid-cols-3 sm:items-start lg:pt-0">
									{[
										{
											icon: <Target className="w-5 h-5 text-blue-500" />,
											bg: "bg-blue-50 dark:bg-blue-500/10",
											title: "Stay on Track",
											desc: "You can save up to ₹1,850 this month",
										},
										{
											icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
											bg: "bg-emerald-50 dark:bg-emerald-500/10",
											title: "Smart Budgeting",
											desc: "Your spending is within a safe range",
										},
										{
											icon: <ArrowUpRight className="w-5 h-5 text-orange-500" />,
											bg: "bg-orange-50 dark:bg-orange-500/10",
											title: "Keep Improving",
											desc: "Small changes today, big savings tomorrow",
										},
									].map((feat, i) => (
										<div key={i} className="flex min-w-0 flex-col items-center text-center gap-2">
											<div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.bg}`}>
												{feat.icon}
											</div>
											<p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{feat.title}</p>
											<p className="max-w-44 text-[11px] leading-tight text-slate-400 dark:text-slate-500">{feat.desc}</p>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* CATEGORY INSIGHTS + AI TIPS */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

							{/* Category Insights */}
							<div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-slate-100 dark:border-slate-800/60 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
								<h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Category Insights</h4>
								<div className="mt-3">
									{visibleCategoryInsights.map((c, i) => (
										<CategoryInsightRow
											key={i}
											icon={
												CATEGORY_ICON_MAP[(c.category || c.label || c).toLowerCase()] || <BarChart3 className="w-4 h-4" />
											}
											iconBg="bg-blue-50 dark:bg-blue-500/10"
											iconColor="text-blue-600 dark:text-blue-400"
											label={c.category || c.label || c}
											description={c.description || c.text || c}
											change={c.changePercent ?? c.change ?? null}
											changeType={c.changeType || (Number(c.changePercent ?? c.change) >= 0 ? "up" : "down")}
										/>
									))}
								</div>
								{categoryFeed.length > 3 && (
									<button
										onClick={() => setShowAllCategories((value) => !value)}
										className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
										aria-expanded={showAllCategories}
									>
										{showAllCategories ? "Show Less" : "View All Categories"}
										<ChevronRight className="w-3.5 h-3.5" />
									</button>
								)}
							</div>

							{/* AI Tips */}
							<div className="rounded-2xl bg-white dark:bg-[#0f1623] border border-slate-100 dark:border-slate-800/60 p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
								<h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Tips For You</h4>
								<div className="mt-3">
									{visibleTips.map((tip, i) => (
										<TipRow
											key={i}
											icon={tip.icon ? tip.icon : tipIconFor(tip.iconKind)}
											iconBg={tip.iconBg || "bg-amber-50 dark:bg-amber-500/10"}
											title={tip.title || tip.label || tip}
											description={tip.description || tip.text || ""}
										/>
									))}
								</div>
								{tipFeed.length > 3 && (
									<button
										onClick={() => setShowAllTips((value) => !value)}
										className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
										aria-expanded={showAllTips}
									>
										{showAllTips ? "Show Less" : "See More Tips"}
										<ChevronRight className="w-3.5 h-3.5" />
									</button>
								)}
							</div>
						</div>

					</div>
				)}
			</div>
		</div>
	);
}

function tipIconFor(kind) {
	switch (kind) {
		case "savings":
			return <PiggyBank className="w-4 h-4 text-emerald-500" />;
		case "alert":
			return <BadgePercent className="w-4 h-4 text-blue-500" />;
		case "focus":
			return <Target className="w-4 h-4 text-violet-500" />;
		case "lifestyle":
			return <CircleDollarSign className="w-4 h-4 text-violet-500" />;
		default:
			return <Lightbulb className="w-4 h-4 text-amber-500" />;
	}
}
