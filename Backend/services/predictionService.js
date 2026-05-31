export const predictNextMonth = (monthlyTotals) => {
  const values = Object.values(monthlyTotals);

  if (values.length === 0) return 0;

  const last3 = values.slice(-3);
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length;

  return avg;
};

export const calculateBudget = (prediction, trend) => {
  const buffer = 1 + Math.max(trend, 0.05);
  return Math.round(prediction * buffer);
};