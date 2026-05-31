import Expense from "../models/Expense.js";

export const getMonthlyStats = async (userId) => {
  const expenses = await Expense.find({ userId });
  const monthly = {};

  for (const exp of expenses) {
    const month = exp.date.toISOString().slice(0, 7);

    if (!monthly[month]) {
      monthly[month] = { total: 0, categories: {} };
    }

    monthly[month].total += exp.amount;

    if (!monthly[month].categories[exp.category]) {
      monthly[month].categories[exp.category] = 0;
    }

    monthly[month].categories[exp.category] += exp.amount;
  }

  return monthly;
};