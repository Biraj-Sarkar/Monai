import express from "express";
import { Parser } from "json2csv";
import Expense from "../models/Expense.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateExpense } from "../middleware/validators.js";
import { generateAndCacheInsights } from "../services/insightOrchestrator.js";

const validCategories = ["Food", "Transport", "Entertainment", "Shopping", "Rent", "Loan", "Luxuries", "Other"];
const router = express.Router();
const AUTO_INSIGHT_REFRESH_COOLDOWN_MS = 30 * 1000;
const lastAutoInsightRefreshAtByUser = new Map();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sanitizeCsvCell = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  return /^[=+\-@]/.test(stringValue) ? `'${stringValue}` : stringValue;
};

const refreshInsightsSafely = (userId) => {
  const key = String(userId);
  const now = Date.now();
  const lastRefreshAt = lastAutoInsightRefreshAtByUser.get(key) || 0;

  if (now - lastRefreshAt < AUTO_INSIGHT_REFRESH_COOLDOWN_MS) {
    return;
  }

  lastAutoInsightRefreshAtByUser.set(key, now);

  generateAndCacheInsights(userId).catch((error) => {
    console.error("Insight refresh failed after expense change:", error);
  });
};

// ➕ ADD EXPENSE
router.post('/add', authMiddleware, validateExpense, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const { amount, category, date, note } = req.body;

  const expense = new Expense({ userId, amount, category, date, note });
  const savedExpense = await expense.save();

  res.status(201).json({ 
    success: true,
    message: "Expense added successfully",
    data: { expense: savedExpense }
  });

  refreshInsightsSafely(userId);
}));

// 📖 READ EXPENSES
router.get('/read', authMiddleware, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const expenses = await Expense.find({ userId: userId }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    message: "Retrieved all the expenses",
    data: { expenses }
  })
}));

// ❌ DELETE EXPENSE
router.delete('/delete/:expenseId', authMiddleware, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const { expenseId } = req.params;
  const expense = await Expense.findOneAndDelete({ _id: expenseId, userId: userId });
  
  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
  }

  res.status(200).json({
    success: true,
    message: "Expense is deleted succesfully",
    data: null
  });

  refreshInsightsSafely(userId);
}));

// ✏️ UPDATE EXPENSE
router.put('/update/:expenseId', authMiddleware, validateExpense, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const { expenseId } = req.params;
  const { amount, category, date, note } = req.body;

  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: expenseId, userId: userId },
    { amount, category, date, note },
    { returnDocument: 'after', runValidators: true } 
  );

  if (!updatedExpense) {
    return res.status(404).json({ success: false, message: 'Expense not found or unauthorized' });
  }

  res.status(200).json({ 
    success: true,
    message: "Expense is updated succesfully",
    data: { expense: updatedExpense }
  });

  refreshInsightsSafely(userId);
}));

// 📊 EXPORT DATA
router.get('/export-csv', authMiddleware, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const expenses = await Expense.find({ userId: userId }).sort({ date: -1 }).lean();

  const rows = expenses.map(e => ({
    _id: e._id ? String(e._id) : '',
    date: e.date ? new Date(e.date).toISOString() : '',
    category: sanitizeCsvCell(e.category),
    amount: e.amount ?? '',
    note: sanitizeCsvCell(e.note)
  }));

  const fields = ['_id', 'date', 'category', 'amount', 'note'];
  const json2csvParser = new Parser({ fields });
  const csvData = json2csvParser.parse(rows);

  // Disable caching to avoid 304 responses for downloads
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${String(userId)}_expenses_export.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send('\uFEFF' + csvData);
}));

export default router;
