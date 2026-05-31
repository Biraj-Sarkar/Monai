export const calculateTrend = (monthlyTotals) => {
  const months = Object.keys(monthlyTotals).sort();

  if (months.length < 2) return 0;

  const last = monthlyTotals[months[months.length - 1]];
  const prev = monthlyTotals[months[months.length - 2]];

  if (prev === 0) return 0;

  return (last - prev) / prev;
}