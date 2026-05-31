import mongoose from "mongoose";

const InsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  month: {
    type: String,
    required: true
  },
  predictedSpend: {
    type: Number,
    required: true
  },
  suggestedBudget: {
    type: Number,
    required: true
  },
  monthlyTotals: {
    type: Object,
    default: {}
  },
  lifestyleTags: {
    type: [String],
    required: true
  },
  categoryInsights: [
    {
      type: String
    }
  ],
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

InsightSchema.index({ userId: 1, month: 1 }, { unique: true });

const Insight = mongoose.model("Insight", InsightSchema);

export default Insight;