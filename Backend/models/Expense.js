import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Food", "Transport", "Entertainment", "Shopping", "Rent", "Loan", "Luxuries", "Other"]
  },
  date: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    trim: true
  }
}, { timestamps: true });

ExpenseSchema.index({ userId: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

const Expense = mongoose.model("Expense", ExpenseSchema);

export default Expense;