// Simple express middlewares for payload validation
import validator from 'validator';

const validCategories = ["Food", "Transport", "Entertainment", "Shopping", "Rent", "Loan", "Luxuries", "Other"];

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name is required and must be at least 2 characters' });
  }
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: 'A valid email is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !validator.isEmail(email)) return res.status(400).json({ message: 'A valid email is required' });
  if (!password || typeof password !== 'string' || password.length === 0) return res.status(400).json({ message: 'Password is required' });
  next();
};

export const validateExpense = (req, res, next) => {
  const { amount, category, date, note } = req.body || {};
  if (amount == null || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }
  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ message: 'Please select a valid category' });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'A valid date is required' });
  }
  if (note && typeof note === 'string' && note.length > 1000) {
    return res.status(400).json({ message: 'Note is too long' });
  }
  next();
};

export const validateInsightAgent = (req, res, next) => {
  const { userId } = req.body || {};
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({ message: 'userId is required' });
  }
  next();
};
