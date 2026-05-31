export const detectLifestyle = (categoryTotals) => {
  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  if (total === 0) return "Neutral";

  const ratios = {};
  for (const key in categoryTotals) {
    ratios[key] = categoryTotals[key] / total;
  }

  const rules = [
    { key: "Food", threshold: 0.4, label: "Dining Heavy" },
    { key: "Transport", threshold: 0.35, label: "Commute Heavy" },
    { key: "Entertainment", threshold: 0.3, label: "Leisure Focused" },
    { key: "Shopping", threshold: 0.35, label: "Consumerist Spending" },
    { key: "Luxuries", threshold: 0.25, label: "Luxury-Oriented" }
  ];

  const lifestyleTags = [];

  for (const rule of rules) {
    if ((ratios[rule.key] || 0) > rule.threshold) {
      lifestyleTags.push(rule.label);
    }
  }

  const fixedExpenseRatio = (ratios["Rent"] || 0) + (ratios["Loan"] || 0);

  if (fixedExpenseRatio > 0.5) {
    lifestyleTags.push("High Fixed Expenses");
  }

  if (lifestyleTags.length === 0) {
    lifestyleTags.push("Balanced Lifestyle");
  }

  return lifestyleTags;
};