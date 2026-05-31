import { getMonthlyStats } from "./aggregationService.js";
import { calculateTrend } from "./trendService.js";
import { predictNextMonth, calculateBudget } from "./predictionService.js";
import { detectLifestyle } from "./lifestyleService.js";

export const generateInsights = async (userId) => {
  const monthlyStats = await getMonthlyStats(userId);
  const months = Object.keys(monthlyStats).sort();

  const monthlyTotals = {};
  for (const m of months) {
    monthlyTotals[m] = monthlyStats[m].total;
  }

  // 🔮 Prediction
  const prediction = predictNextMonth(monthlyTotals);

  // 📈 Trend
  const trend = calculateTrend(monthlyTotals);

  // 💰 Budget
  const budget = calculateBudget(prediction, trend);

  // 🧠 Lifestyle (latest month)
  const latestMonth = months[months.length - 1];
  const lifestyle = latestMonth
    ? detectLifestyle(monthlyStats[latestMonth].categories)
    : "Neutral";

  // 📊 Category insights
  const categoryInsights = [];
  if (months.length >= 2) {
    const curr = monthlyStats[months[months.length - 1]].categories;
    const prev = monthlyStats[months[months.length - 2]].categories;

    for (const cat in curr) {
      const prevVal = prev[cat] || 0;
      const currVal = curr[cat];

      if (prevVal === 0) continue;

      const change = ((currVal - prevVal) / prevVal) * 100;

      if (Math.abs(change) > 10) {
        categoryInsights.push(
          `${cat} spending ${change > 0 ? "increased" : "decreased"} by ${Math.round(Math.abs(change))}%`
        );
      }
    }
  }

  // Ensure lifestyleTags is an array for the model and frontend
  const lifestyleTags = Array.isArray(lifestyle) ? lifestyle : [lifestyle];

  return {
    predictedSpend: Math.round(prediction),
    suggestedBudget: budget,
    lifestyleTags,
    categoryInsights,
    monthlyTotals
  };
};