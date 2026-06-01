import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
	ChevronRight,
	DollarSign,
	PieChart,
	Plus,
	Target,
	TrendingUp,
	Wallet,
	BarChart3,
	Utensils,
	Car,
	ShoppingBag,
	BadgePercent,
	Pencil,
	Trash2,
} from "lucide-react";
import AddExpenseModal from "../dashboard/AddExpenseModal";
import { authFetch } from "../utils/apiClient.js";
import { toast } from "../utils/toast";
import AIInsightImage from "../assets/AI_Insights.png";

const API_URL = import.meta.env.VITE_API_URL;

const PERIODS = [
	{ label: "7D", days: 7 },
	{ label: "30D", days: 30 },
	{ label: "3M", days: 90 },
	{ label: "1Y", days: 365 },
];

const CATEGORY_COLORS = ["#7bdc00", "#22c7e8", "#8b5cf6", "#fb923c", "#cbd5e1", "#ef4444"];

const CATEGORY_ICON_MAP = {
	Food: { icon: <Utensils className="w-4 h-4" />, bg: "bg-lime-50 dark:bg-lime-500/10", color: "text-lime-600 dark:text-lime-400" },
	Transport: { icon: <Car className="w-4 h-4" />, bg: "bg-cyan-50 dark:bg-cyan-500/10", color: "text-cyan-600 dark:text-cyan-400" },
	Shopping: { icon: <ShoppingBag className="w-4 h-4" />, bg: "bg-violet-50 dark:bg-violet-500/10", color: "text-violet-600 dark:text-violet-400" },
	Entertainment: { icon: <BadgePercent className="w-4 h-4" />, bg: "bg-orange-50 dark:bg-orange-500/10", color: "text-orange-500 dark:text-orange-400" },
	Rent: { icon: <Wallet className="w-4 h-4" />, bg: "bg-blue-50 dark:bg-blue-500/10", color: "text-blue-600 dark:text-blue-400" },
	Other: { icon: <BarChart3 className="w-4 h-4" />, bg: "bg-slate-50 dark:bg-slate-700/40", color: "text-slate-500 dark:text-slate-400" },
};

function getCategoryMeta(cat) {
	return CATEGORY_ICON_MAP[cat] || CATEGORY_ICON_MAP["Other"];
}

function formatCurrency(value) {
	const amount = Number(value);
	if (!Number.isFinite(amount)) return "₹0";
	return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
	const date = new Date(dateStr);
	if (isNaN(date)) return dateStr;
	return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function toDateKey(dateValue) {
	const date = new Date(dateValue);
	if (isNaN(date)) return "";
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatChartLabel(dateKey, period) {
	const date = new Date(`${dateKey}T00:00:00`);
	if (isNaN(date)) return "";
	return date.toLocaleDateString("en-IN", period === 365 ? { month: "short" } : { day: "numeric", month: "short" });
}

function formatChartTooltipDate(dateKey) {
	const date = new Date(`${dateKey}T00:00:00`);
	if (isNaN(date)) return "";
	return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getPeriodRange(days) {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - (days - 1));
	start.setHours(0, 0, 0, 0);
	end.setHours(23, 59, 59, 999);
	return { from: toDateKey(start), to: toDateKey(end) };
}

function getCalendarMonthRange(offset = 0) {
	const now = new Date();
	const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
	const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
	return { from: toDateKey(start), to: toDateKey(end) };
}

function filterByDateRange(expenses, range) {
	return expenses.filter((expense) => {
		const expenseDate = toDateKey(expense.date);
		return expenseDate >= range.from && expenseDate <= range.to;
	});
}

function sumExpenses(expenses) {
	return expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
}

function buildComparisonHint(current, previous) {
	if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
	const change = Math.round(((current - previous) / previous) * 1000) / 10;
	if (change === 0) return "0% vs last month";
	return `${change > 0 ? "↑" : "↓"} ${Math.abs(change)}% vs last month`;
}

function buildDailySeries(expenses, from, to) {
	const start = new Date(`${from}T00:00:00`);
	const end = new Date(`${to}T00:00:00`);
	const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);
	const buckets = Array.from({ length: totalDays }, (_, index) => {
		const date = new Date(start);
		date.setDate(start.getDate() + index);
		return { date: toDateKey(date), value: 0 };
	});

	expenses.forEach((expense) => {
		const expenseDate = toDateKey(expense.date);
		if (expenseDate < from || expenseDate > to) return;
		const index = Math.round((new Date(`${expenseDate}T00:00:00`) - start) / 86400000);
		if (buckets[index]) buckets[index].value += Number(expense.amount) || 0;
	});

	return buckets;
}

function buildCategoryBreakdown(expenses) {
	const totals = {};
	expenses.forEach((expense) => {
		const category = expense.category || "Other";
		totals[category] = (totals[category] || 0) + (Number(expense.amount) || 0);
	});
	const total = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
	return Object.entries(totals)
		.sort(([, a], [, b]) => b - a)
		.map(([label, amount], index) => ({
			label,
			amount,
			percent: Math.round((amount / total) * 100),
			color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
		}));
}

function buildInsightCopy({ monthlyExpenses, topCategory, topCategoryAmount, avgExpense, totalExpenses, spendChangePercent }) {
	const safeTop = topCategory || "food";
	if (!Number.isFinite(Number(totalExpenses)) || totalExpenses === 0) {
		return { title: "No expenses yet", description: "Add your first expense to unlock spending trends and budget guidance." };
	}
	if (monthlyExpenses === 0) {
		return { title: "No activity in this period", description: "This range doesn't have expenses yet. Try a wider date range." };
	}
	if (Number.isFinite(spendChangePercent)) {
		const direction = spendChangePercent >= 0 ? "more" : "less";
		return {
			title: `You spent ${Math.abs(spendChangePercent)}% ${direction} on ${safeTop} this month.`,
			description: `Suggestion: Reduce dining out by ₹2,000 to stay within budget.`,
		};
	}
	return {
		title: `You spent more on ${safeTop} this month.`,
		description: `Suggestion: Reduce dining out by ₹2,000 to stay within budget.`,
	};
}

function defaultCategoryFallback() {
	return [
		{ label: "Food", amount: 7812, percent: 42, color: CATEGORY_COLORS[0] },
		{ label: "Transport", amount: 3348, percent: 18, color: CATEGORY_COLORS[1] },
		{ label: "Shopping", amount: 2790, percent: 15, color: CATEGORY_COLORS[2] },
		{ label: "Entertainment", amount: 2100, percent: 11, color: CATEGORY_COLORS[3] },
		{ label: "Others", amount: 2550, percent: 14, color: CATEGORY_COLORS[4] },
	];
}

/* ── Fixed curvy sparkline (same wave shape every card) ────────── */
const FIXED_SPARKLINE_PATH = "M 0,32 C 20,28 30,22 50,20 C 70,18 80,28 100,26 C 120,24 130,18 150,16 C 170,14 180,22 200,20 C 215,18 220,16 220,16";

function MiniSparkline({ stroke = "#8b5cf6" }) {
	return (
		<svg width="100%" viewBox="0 0 220 44" className="h-13 w-full" preserveAspectRatio="none">
			<defs>
				<linearGradient id={`spark-grad-${stroke.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
					<stop offset="100%" stopColor={stroke} stopOpacity="0" />
				</linearGradient>
			</defs>
			<path
				d={`${FIXED_SPARKLINE_PATH} L 220,44 L 0,44 Z`}
				fill={`url(#spark-grad-${stroke.replace("#", "")})`}
			/>
			<path d={FIXED_SPARKLINE_PATH} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/* ── Stat Card ─────────────────────────────────────────────────── */
function DashboardStatCard({ title, value, hint, hintGreen = true, icon, iconBg, sparkStroke }) {
	return (
		<div className="group relative min-h-49 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(15,23,42,0.09)] dark:border-slate-800/60 dark:bg-[#0f1623] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
			<div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-blue-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			<div className="flex items-start gap-5">
				<div className={`flex h-15 w-15 shrink-0 items-center justify-center rounded-[18px] ${iconBg}`}>{icon}</div>
				<div className="min-w-0 pt-1">
					<p className="text-[0.94rem] font-semibold text-slate-700 dark:text-slate-300">{title}</p>
					<p className="mt-2 text-[1.72rem] font-black tracking-tight text-slate-950 dark:text-white leading-none">{value}</p>
					{hint && (
						<p className={`mt-2 text-sm font-medium ${hintGreen ? "text-emerald-500 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
							{hint}
						</p>
					)}
				</div>
			</div>
			<div className="mt-6 pl-20">
				<MiniSparkline stroke={sparkStroke} />
			</div>
		</div>
	);
}

/* ── Donut ─────────────────────────────────────────────────────── */
function Donut({ data, amount }) {
	const values = data.length ? data : defaultCategoryFallback();
	const size = 218;
	const radius = size * 0.34;
	const stroke = size * 0.105;
	const center = size / 2;
	const circ = 2 * Math.PI * radius;
	const total = values.reduce((sum, item) => sum + (item.percent || 0), 0) || 100;
	let offset = 0;

	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} className="dark:stroke-slate-700/60" />
			{values.map((item, index) => {
				const dash = ((item.percent || 0) / total) * circ;
				const el = (
					<circle
						key={index}
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke={item.color}
						strokeWidth={stroke}
						strokeDasharray={`${dash} ${circ - dash}`}
						strokeDashoffset={-offset}
						transform={`rotate(-90 ${center} ${center})`}
						strokeLinecap="butt"
						style={{ filter: `drop-shadow(0 0 3px ${item.color}55)` }}
					/>
				);
				offset += dash;
				return el;
			})}
			<circle cx={center} cy={center} r={radius - stroke / 2 - 2} fill="white" className="dark:fill-[#0f1623]" />
			<text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: 25, fontWeight: 900 }} className="fill-slate-900 dark:fill-white">
				{formatCurrency(amount)}
			</text>
			<text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: 14 }} className="fill-slate-500 dark:fill-slate-400">
				Total Spend
			</text>
		</svg>
	);
}

/* ── Category breakdown row ────────────────────────────────────── */
function BreakdownRow({ label, percent, amount }) {
	const meta = getCategoryMeta(label);
	return (
		<div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800/70">
			<div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${meta.bg} ${meta.color}`}>
				{meta.icon}
			</div>
			<span className="min-w-0 flex-1 truncate text-[0.95rem] font-medium text-slate-600 dark:text-slate-200">{label}</span>
			<span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(amount)}</span>
			<span className="w-10 text-right text-sm font-medium text-slate-500 dark:text-slate-400">{percent}%</span>
		</div>
	);
}

/* ── Overview Chart ────────────────────────────────────────────── */
function OverviewChart({ current, previous, period, dateRange }) {
	const width = 900;
	const height = 300;
	const padX = 62;
	const padY = 26;
	const currentValues = current.map((point) => point.value);
	const previousValues = previous.map((point) => point.value);
	const allValues = [...currentValues, ...previousValues, 1];
	const max = Math.max(...allValues);
	const len = Math.max(current.length, previous.length, 1);
	const stepX = (width - padX * 2) / Math.max(len - 1, 1);
	const innerH = height - padY * 2;

	const buildPoints = (series) =>
		series.map((point, i) => {
			const x = padX + i * stepX;
			const v = point.value;
			const norm = max === 0 ? 0.5 : v / max;
			const y = padY + (1 - norm) * innerH;
			return { x, y, v, date: point.date };
		});

	const fallbackSeries = Array.from({ length: 6 }, (_, index) => ({ date: dateRange.from, value: 0, index }));
	const cur = buildPoints(current.length ? current : fallbackSeries);
	const prev = buildPoints(previous.length ? previous : fallbackSeries);

	// Smooth cubic bezier for current
	const smoothPath = (pts) => {
		if (pts.length < 2) return "";
		let d = `M ${pts[0].x} ${pts[0].y}`;
		for (let i = 1; i < pts.length; i++) {
			const cp1x = (pts[i - 1].x + pts[i].x) / 2;
			d += ` C ${cp1x} ${pts[i - 1].y} ${cp1x} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
		}
		return d;
	};

	const curPath = smoothPath(cur);
	const prevPath = smoothPath(prev);
	const areaPath = cur.length
		? `${curPath} L ${cur[cur.length - 1].x} ${height - padY} L ${cur[0].x} ${height - padY} Z`
		: "";

	// Y-axis labels
	const yLabels = [0, 1, 2, 3].map((i) => ({
		y: padY + i * (innerH / 3),
		val: Math.round((max * (1 - i / 3)) / 100) * 100,
	}));

	// X-axis labels based on period
	const xLabelCount = Math.min(cur.length, 6);
	const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
		const idx = xLabelCount <= 1 ? 0 : Math.round((i / (xLabelCount - 1)) * (cur.length - 1));
		const x = cur[idx]?.x ?? padX + idx * stepX;
		const label = formatChartLabel(cur[idx]?.date, period);
		return { x, label };
	});

	// Hover tooltip state
	const [hover, setHover] = useState(null);
	const latestIndex = Math.max(0, cur.length - 1);
	const activeIndex = hover ?? latestIndex;
	const activePoint = cur[activeIndex];
	const activeLabel = formatChartTooltipDate(activePoint?.date);

	return (
		<div className="relative select-none" onMouseLeave={() => setHover(null)}>
			<div className="mb-5 flex items-center gap-7 text-sm font-medium text-slate-500 dark:text-slate-400">
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-blue-600" />This Month
				</span>
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />Last Month
				</span>
			</div>
			<svg
				width="100%"
				viewBox={`0 0 ${width} ${height}`}
				className="w-full"
				style={{ height: 300 }}
				onMouseMove={(e) => {
					const rect = e.currentTarget.getBoundingClientRect();
					const svgX = ((e.clientX - rect.left) / rect.width) * width;
					let closest = 0;
					let minDist = Infinity;
					cur.forEach((pt, i) => {
						const d = Math.abs(pt.x - svgX);
						if (d < minDist) { minDist = d; closest = i; }
					});
					if (minDist < stepX) setHover(closest);
					else setHover(null);
				}}
			>
				{/* grid lines */}
				{yLabels.map((row, i) => (
					<g key={i}>
						<line x1={padX} x2={width - padX} y1={row.y} y2={row.y}
							stroke="currentColor"
							className="text-slate-200/90 dark:text-slate-700/70"
							strokeWidth="1"
						/>
						<text x={padX - 12} y={row.y + 5} textAnchor="end" style={{ fontSize: 15 }} className="fill-slate-500 dark:fill-slate-400">
							{formatCurrency(row.val)}
						</text>
					</g>
				))}

				{/* previous area (dashed) */}
				{prevPath && <path d={prevPath} fill="none" stroke="#a8b6ca" strokeWidth="2" strokeDasharray="6 7" className="dark:stroke-slate-500" />}

				{/* current area fill */}
				{areaPath && (
					<>
						<defs>
							<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#2563eb" stopOpacity="0.24" />
								<stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
							</linearGradient>
						</defs>
						<path d={areaPath} fill="url(#areaGrad)" />
					</>
				)}

				{/* current line */}
				{curPath && <path d={curPath} fill="none" stroke="#0d73ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

				{/* dots */}
				{activePoint && <circle cx={activePoint.x} cy={activePoint.y} r="7" fill="#0d73ff" stroke="white" strokeWidth="3" />}

				{/* hover tooltip */}
				{activePoint && (
					<g>
						<line x1={activePoint.x} x2={activePoint.x} y1={padY} y2={height - padY}
							stroke="#0d73ff" strokeWidth="1" strokeDasharray="4 4" opacity="0.25"
						/>
						<rect
							x={Math.min(activePoint.x - 36, width - padX - 80)}
							y={activePoint.y - 56}
							width={80}
							height={48}
							rx={7}
							fill="#0d73ff"
						/>
						<text
							x={Math.min(activePoint.x - 36, width - padX - 80) + 40}
							y={activePoint.y - 36}
							textAnchor="middle"
							style={{ fontSize: 13, fontWeight: 700, fill: "white" }}
						>
							{activeLabel}
						</text>
						<text
							x={Math.min(activePoint.x - 36, width - padX - 80) + 40}
							y={activePoint.y - 18}
							textAnchor="middle"
							style={{ fontSize: 13, fontWeight: 800, fill: "white" }}
						>
							{formatCurrency(activePoint.v)}
						</text>
					</g>
				)}

				{/* x-axis labels */}
				{xLabels.map((xl, i) => (
					<text key={i} x={xl.x} y={height - 3} textAnchor="middle" style={{ fontSize: 15 }} className="fill-slate-500 dark:fill-slate-400">
						{xl.label}
					</text>
				))}
			</svg>
		</div>
	);
}

/* ── Recent Expenses ───────────────────────────────────────────── */
function RecentExpensesSection({ expenses, isLoading, onEdit, onDelete }) {
	const [showAll, setShowAll] = useState(false);
	const displayed = showAll ? expenses : expenses.slice(0, 3);

	return (
		<div className="h-full overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.055)] dark:border-slate-800/60 dark:bg-[#0f1623] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
			<div className="flex items-center justify-between px-6 py-5">
				<div>
					<h2 className="text-xl font-bold text-slate-950 dark:text-white">Recent Expenses</h2>
				</div>
				{expenses.length > 3 && (
					<button
						onClick={() => setShowAll((v) => !v)}
						className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition"
					>
						{showAll ? "Show Less" : "View All"}
					</button>
				)}
			</div>

			<div className="overflow-x-auto">
			{/* table header */}
			<div className="grid min-w-190 grid-cols-[140px_180px_1fr_110px_90px] gap-4 px-6 pb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
					<span>Date</span>
					<span>Category</span>
					<span>Description</span>
					<span className="text-right">Amount</span>
					<span className="text-right">Actions</span>
				</div>

				<div className="min-w-190 divide-y divide-slate-50 dark:divide-slate-800/60">
				{isLoading ? (
					[...Array(3)].map((_, i) => (
						<div key={i} className="px-6 py-4 animate-pulse">
							<div className="flex gap-4">
								<div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
								<div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800" />
								<div className="h-4 flex-1 rounded bg-slate-100 dark:bg-slate-800" />
								<div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800" />
							</div>
						</div>
					))
				) : displayed.length === 0 ? (
					<div className="px-6 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
						No expenses in this period.
					</div>
				) : (
					displayed.map((expense) => {
						const meta = getCategoryMeta(expense.category);
						return (
							<div
								key={expense._id}
								className="grid grid-cols-[140px_180px_1fr_110px_90px] gap-4 items-center px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
							>
								<span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{formatDate(expense.date)}</span>
								<div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg w-fit ${meta.bg} ${meta.color}`}>
									{meta.icon}
									<span className="text-xs font-semibold">{expense.category || "Other"}</span>
								</div>
								<span className="text-sm text-slate-700 dark:text-slate-200 truncate">{expense.description || "—"}</span>
								<span className="text-right text-sm font-bold text-red-500 dark:text-red-400">
									{formatCurrency(expense.amount)}
								</span>
								<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
									<button
										onClick={() => onEdit(expense)}
										className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
									>
										<Pencil className="w-3.5 h-3.5" />
									</button>
									<button
										onClick={() => onDelete(expense._id)}
										className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
									>
										<Trash2 className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						);
					})
				)}
				</div>
			</div>
		</div>
	);
}

/* ── AI Insight Card ───────────────────────────────────────────── */
function AIInsightCard({ title, description }) {
	return (
		<div className="relative h-full min-h-69 overflow-hidden rounded-[18px] border border-slate-100 bg-[#11172e] shadow-[0_16px_40px_rgba(16,24,45,0.28)] dark:border-white/10">
			<img
				src={AIInsightImage}
				alt=""
				aria-hidden="true"
				className="absolute inset-0 h-full w-full select-none object-cover object-center"
			/>
			<div className="absolute inset-0 bg-linear-to-r from-[#11172e]/95 via-[#161b3a]/78 to-transparent" />

			<div className="relative flex h-full min-h-69 items-center p-7">
				<div className="max-w-sm">
					<h3 className="max-w-83 text-xl font-black leading-snug text-white sm:text-2xl">
						{title}
					</h3>
					<p className="mt-5 max-w-78 text-base leading-relaxed text-white/90">
						{description}
					</p>
					<NavLink
						to="/insights"
						className="mt-8 inline-flex items-center gap-4 rounded-lg bg-violet-600/80 px-5 py-3 text-base font-bold text-white shadow-[0_12px_24px_rgba(50,31,120,0.28)] transition-all duration-200 hover:bg-violet-500"
					>
						View Insight
						<ChevronRight className="w-4 h-4" />
					</NavLink>
				</div>
			</div>
		</div>
	);
}

function CategoryBreakdownModal({ data, total, onClose }) {
	const items = data.length ? data : defaultCategoryFallback();

	useEffect(() => {
		const onKey = (e) => { if (e.key === "Escape") onClose(); };
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="w-full max-w-2xl rounded-[18px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#0f1623]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<h3 className="text-xl font-black text-slate-950 dark:text-white">Category Breakdown</h3>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Total spend: {formatCurrency(total)}
						</p>
					</div>
					<button
						onClick={onClose}
						className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						Close
					</button>
				</div>

				<div className="mt-6 space-y-4">
					{items.map((item, index) => {
						const meta = getCategoryMeta(item.label);
						return (
							<div key={`${item.label}-${index}`} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
								<div className="flex items-center gap-3">
									<div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${meta.bg} ${meta.color}`}>
										{meta.icon}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-3">
											<span className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{item.label}</span>
											<span className="text-sm font-black text-slate-950 dark:text-white">{formatCurrency(item.amount)}</span>
										</div>
										<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
											<div
												className="h-full rounded-full"
												style={{ width: `${item.percent}%`, backgroundColor: item.color }}
											/>
										</div>
									</div>
									<span className="w-12 text-right text-sm font-bold text-slate-500 dark:text-slate-400">{item.percent}%</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

/* ── Main Dashboard ────────────────────────────────────────────── */
export default function Dashboard() {
	const { isAuthenticated } = useSelector((state) => state.auth);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const location = useLocation();

	const [expenses, setExpenses] = useState([]);
	const [allExpenses, setAllExpenses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);
	const [expenseToDelete, setExpenseToDelete] = useState(null);
	const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState("30D");
	const [dateRange, setDateRange] = useState(getPeriodRange(30));

	useEffect(() => {
		if (!isAuthenticated) navigate("/login", { state: { from: location.pathname } });
	}, [isAuthenticated, navigate, location.pathname]);

	const fetchExpenses = async () => {
		try {
			setIsLoading(true);
			const res = await authFetch(dispatch, `${API_URL}/api/expenses/read`, { method: "GET" });
			if (!res.ok) throw new Error("Failed to fetch expenses");
			const data = await res.json();
			const payload = data.data || data;
			const allExpenses = payload.expenses || [];
			const filtered = filterByDateRange(allExpenses, dateRange);
			setAllExpenses(allExpenses);
			setExpenses(filtered);
		} catch (error) {
			console.error("Error fetching expenses:", error);
			setAllExpenses([]);
			setExpenses([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isAuthenticated) fetchExpenses();
	}, [isAuthenticated, dateRange]);

	const dashboardData = useMemo(() => {
		if (expenses.length === 0) {
			return { total: 0, monthly: 0, avg: 0, topCategory: "N/A", topCategoryAmount: 0, categoryBreakdown: [], currentSeries: [], previousSeries: [] };
		}
		const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
		const avg = Math.round(total / expenses.length);
		const now = new Date();
		const monthly = expenses.filter((e) => {
			const d = new Date(e.date);
			return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
		}).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
		const categoryBreakdown = buildCategoryBreakdown(expenses);
		const topCategory = categoryBreakdown[0]?.label || "N/A";
		const topCategoryAmount = categoryBreakdown[0]?.amount || 0;
		const periodDays = PERIODS.find((p) => p.label === selectedPeriod)?.days || 30;
		const currentRange = getPeriodRange(periodDays);
		const currentSeries = buildDailySeries(expenses, currentRange.from, currentRange.to);
		const prevEnd = new Date(currentRange.from);
		prevEnd.setDate(prevEnd.getDate() - 1);
		const prevStart = new Date(prevEnd);
		prevStart.setDate(prevStart.getDate() - (periodDays - 1));
		const previousSeries = buildDailySeries(expenses, toDateKey(prevStart), toDateKey(prevEnd));
		return { total, monthly, avg, topCategory, topCategoryAmount, categoryBreakdown, currentSeries, previousSeries };
	}, [expenses, selectedPeriod]);

	const stats = useMemo(() => ({
		totalExpenses: dashboardData.total,
		monthlyExpenses: dashboardData.monthly,
		avgExpense: dashboardData.avg,
		topCategory: dashboardData.topCategory,
	}), [dashboardData]);

	const monthComparison = useMemo(() => {
		const currentMonthExpenses = filterByDateRange(allExpenses, getCalendarMonthRange(0));
		const previousMonthExpenses = filterByDateRange(allExpenses, getCalendarMonthRange(-1));
		const currentTotal = sumExpenses(currentMonthExpenses);
		const previousTotal = sumExpenses(previousMonthExpenses);
		const currentAverage = currentMonthExpenses.length ? Math.round(currentTotal / currentMonthExpenses.length) : 0;
		const previousAverage = previousMonthExpenses.length ? Math.round(previousTotal / previousMonthExpenses.length) : 0;

		return {
			totalHint: buildComparisonHint(currentTotal, previousTotal),
			monthlyHint: buildComparisonHint(currentTotal, previousTotal),
			averageHint: buildComparisonHint(currentAverage, previousAverage),
			totalChange: previousTotal > 0 ? currentTotal - previousTotal : null,
			averageChange: previousAverage > 0 ? currentAverage - previousAverage : null,
		};
	}, [allExpenses]);

	const insight = buildInsightCopy({
		monthlyExpenses: dashboardData.monthly,
		topCategory: dashboardData.topCategory,
		topCategoryAmount: dashboardData.topCategoryAmount,
		avgExpense: dashboardData.avg,
		totalExpenses: dashboardData.total,
		spendChangePercent: dashboardData.previousSeries.reduce((sum, point) => sum + point.value, 0)
			? Math.round(((dashboardData.currentSeries.reduce((sum, point) => sum + point.value, 0) - dashboardData.previousSeries.reduce((sum, point) => sum + point.value, 0)) / dashboardData.previousSeries.reduce((sum, point) => sum + point.value, 0)) * 100)
			: null,
	});

	const handleAddExpense = async (formData) => {
		const isEditMode = Boolean(editingExpense);
		try {
			setIsSaving(true);
			const endpoint = isEditMode ? `${API_URL}/api/expenses/update/${editingExpense._id}` : `${API_URL}/api/expenses/add`;
			const method = isEditMode ? "PUT" : "POST";
			const response = await authFetch(dispatch, endpoint, { method, body: JSON.stringify(formData) });
			if (!response.ok) throw new Error(isEditMode ? "Failed to update expense" : "Failed to add expense");
			await fetchExpenses();
			setIsModalOpen(false);
			toast.success(isEditMode ? "Expense updated" : "Expense added");
		} catch (error) {
			toast.error(isEditMode ? "Failed to update expense." : "Failed to add expense.");
		} finally {
			setIsSaving(false);
			setEditingExpense(null);
		}
	};

	const confirmDeleteExpense = async () => {
		if (!expenseToDelete) return;
		try {
			const response = await authFetch(dispatch, `${API_URL}/api/expenses/delete/${expenseToDelete}`, { method: "DELETE" });
			if (!response.ok) throw new Error("Failed to delete expense.");
			await fetchExpenses();
			toast.success("Expense deleted");
		} catch (error) {
			toast.error("Failed to delete expense.");
		} finally {
			setExpenseToDelete(null);
		}
	};

	const handlePeriodChange = (label) => {
		setSelectedPeriod(label);
		const days = PERIODS.find((p) => p.label === label)?.days || 30;
		setDateRange(getPeriodRange(days));
	};

	useEffect(() => {
		const onKey = (e) => { if (e.key === "Escape") setExpenseToDelete(null); };
		if (expenseToDelete) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [expenseToDelete]);

	if (!isAuthenticated) return null;

	const periodDays = PERIODS.find((p) => p.label === selectedPeriod)?.days || 30;

	return (
		<div className="min-h-screen px-3 py-4 sm:px-5 lg:px-7 app-page-bg">
			<div 
				className="
					mx-auto w-full max-w-395 rounded-[22px] 					
					px-6 py-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:px-8 lg:px-10
				">
					{/* border border-white/80 dark:border-slate-800/70
					bg-white dark:bg-[#0b1220] */}

				{/* ── Header ──────────────────────────────────────── */}
				<div className="mb-9 grid gap-4 lg:grid-cols-[1fr_auto]">
					<div>
						<h1 className="text-[2.45rem] font-black leading-none tracking-tight text-slate-950 dark:text-white">Dashboard</h1>
						<p className="mt-3 text-lg text-slate-500 dark:text-slate-400">Track and manage your expenses</p>
					</div>

					<div className="flex flex-col items-start gap-5 lg:items-end">
						{/* add expense */}
						<button
							onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
							className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)] transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_10px_22px_rgba(37,99,235,0.32)]"
						>
							<Plus className="h-5 w-5" />
							Add Expense
						</button>
						<div className="flex flex-wrap items-center gap-3">
						{/* period toggles */}
						<div className="flex rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-1 text-sm shadow-sm">
							{PERIODS.map((p) => (
								<button
									key={p.label}
									onClick={() => handlePeriodChange(p.label)}
									className={`rounded-md px-5 py-2 font-semibold transition-all duration-200 ${selectedPeriod === p.label ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"}`}
								>
									{p.label}
								</button>
							))}
						</div>

						</div>
					</div>
				</div>

				{/* ── KPI Cards ──────────────────────────────────── */}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
					<DashboardStatCard
						title="Total Expenses"
						value={formatCurrency(stats.totalExpenses)}
						hint={monthComparison.totalHint}
						icon={<DollarSign className="h-8 w-8 text-violet-600 dark:text-violet-400" />}
						iconBg="bg-violet-50 dark:bg-violet-500/10"
						sparkStroke="#8b5cf6"
					/>
					<DashboardStatCard
						title="This Month"
						value={formatCurrency(stats.monthlyExpenses)}
						hint={monthComparison.monthlyHint}
						icon={<TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
						iconBg="bg-emerald-50 dark:bg-emerald-500/10"
						sparkStroke="#22c55e"
					/>
					<DashboardStatCard
						title="Average Expense"
						value={formatCurrency(stats.avgExpense)}
						hint={monthComparison.averageHint}
						hintGreen={monthComparison.averageChange == null || monthComparison.averageChange <= 0}
						icon={<Target className="h-8 w-8 text-orange-500 dark:text-orange-400" />}
						iconBg="bg-orange-50 dark:bg-orange-500/10"
						sparkStroke="#f97316"
					/>
					<DashboardStatCard
						title="Top Category"
						value={stats.topCategory}
						hint={dashboardData.categoryBreakdown[0] ? `${dashboardData.categoryBreakdown[0].percent}% of total spend` : null}
						hintGreen={false}
						icon={<PieChart className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
						iconBg="bg-indigo-50 dark:bg-indigo-500/10"
						sparkStroke="#6366f1"
					/>
				</div>

				{/* ── Spending Overview + Category ────────────────── */}
				<div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_1fr]">

					{/* Overview chart */}
					<div className="rounded-[18px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.055)] dark:border-slate-800/60 dark:bg-[#0f1623] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<div>
								<h2 className="text-xl font-bold text-slate-950 dark:text-white">Spending Overview</h2>
							</div>
						</div>

						<div className="mt-4">
							<OverviewChart
								current={dashboardData.currentSeries}
								previous={dashboardData.previousSeries}
								period={periodDays}
								dateRange={dateRange}
							/>
						</div>
					</div>

					{/* Category breakdown */}
					<div className="rounded-[18px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.055)] dark:border-slate-800/60 dark:bg-[#0f1623] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
						<h2 className="text-xl font-bold text-slate-950 dark:text-white">Spending by Category</h2>
						<div className="mt-7 grid justify-items-center gap-7 md:grid-cols-[260px_minmax(0,1fr)] md:items-center md:justify-items-stretch xl:grid-cols-[235px_minmax(0,1fr)]">
							<div className="shrink-0 justify-self-center md:justify-self-start">
								<Donut data={dashboardData.categoryBreakdown} amount={dashboardData.total || 0} />
							</div>
							<div className="w-full min-w-0">
								{(dashboardData.categoryBreakdown.length ? dashboardData.categoryBreakdown : defaultCategoryFallback()).slice(0, 3).map((item, i) => (
									<BreakdownRow key={`${item.label}-${i}`} {...item} />
								))}
							</div>
						</div>
						<button
							onClick={() => setIsBreakdownOpen(true)}
							className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15"
						>
							<span>View full breakdown</span>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* ── Recent Expenses + AI Insight ──────────────── */}
				<div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.55fr_1fr]">
					<div>
						<RecentExpensesSection
							expenses={expenses}
							isLoading={isLoading}
							onEdit={(expense) => { setEditingExpense(expense); setIsModalOpen(true); }}
							onDelete={(id) => setExpenseToDelete(id)}
						/>
					</div>

					<div>
						<AIInsightCard title={insight.title} description={insight.description} />
					</div>
				</div>
			</div>

			{/* ── Add/Edit Modal ───────────────────────────────── */}
			<AddExpenseModal
				isOpen={isModalOpen}
				onClose={() => { setIsModalOpen(false); setEditingExpense(null); }}
				onSubmit={handleAddExpense}
				isLoading={isSaving}
				initialData={editingExpense}
			/>

			{isBreakdownOpen && (
				<CategoryBreakdownModal
					data={dashboardData.categoryBreakdown}
					total={dashboardData.total || 0}
					onClose={() => setIsBreakdownOpen(false)}
				/>
			)}

			{/* ── Delete Confirm Modal ─────────────────────────── */}
			{expenseToDelete && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
					onClick={() => setExpenseToDelete(null)}
					role="dialog"
					aria-modal="true"
				>
					<div
						className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1623] p-6 shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<h3 className="text-base font-bold text-slate-900 dark:text-white">Delete expense?</h3>
						<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setExpenseToDelete(null)}
								className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
							>
								Cancel
							</button>
							<button
								onClick={confirmDeleteExpense}
								className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
