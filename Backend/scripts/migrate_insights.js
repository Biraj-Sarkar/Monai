import dotenv from "dotenv";
import mongoose from "mongoose";
import Insight from "../models/Insight.js";
import { getMonthlyStats } from "../services/aggregationService.js";

dotenv.config();

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");

const toMonthKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 7);
  return date.toISOString().slice(0, 7);
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeLifestyleTags = (doc) => {
  const value = doc.lifestyleTags ?? doc.lifestyleTag;

  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return ["Balanced Lifestyle"];
};

const buildMonthlyTotals = async (userId, existingMonthlyTotals) => {
  if (
    existingMonthlyTotals &&
    typeof existingMonthlyTotals === "object" &&
    Object.keys(existingMonthlyTotals).length > 0
  ) {
    return existingMonthlyTotals;
  }

  const monthlyStats = await getMonthlyStats(userId);
  return Object.fromEntries(
    Object.entries(monthlyStats).map(([month, stats]) => [month, stats.total])
  );
};

const migrate = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to run the insights migration.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const rawInsights = await Insight.collection.find({}).toArray();
  let scanned = 0;
  let changed = 0;

  for (const doc of rawInsights) {
    scanned += 1;

    const predictedSpend = Math.round(
      toNumber(doc.predictedSpend ?? doc.monthlyPrediction ?? doc.prediction)
    );
    const suggestedBudget = Math.round(
      toNumber(doc.suggestedBudget ?? doc.budgetRecommendation ?? doc.monthlyBudget, Math.round(predictedSpend * 1.1))
    );
    const lifestyleTags = normalizeLifestyleTags(doc);
    const categoryInsights = Array.isArray(doc.categoryInsights) ? doc.categoryInsights : [];
    const monthlyTotals = await buildMonthlyTotals(doc.userId, doc.monthlyTotals);
    const month = doc.month || toMonthKey(doc.generatedAt || doc.createdAt);
    const generatedAt = doc.generatedAt ? new Date(doc.generatedAt) : new Date();

    const set = {
      predictedSpend,
      suggestedBudget,
      monthlyTotals,
      lifestyleTags,
      categoryInsights,
      month,
      generatedAt,
    };

    const unset = {
      monthlyPrediction: "",
      lifestyleTag: "",
      prediction: "",
      budgetRecommendation: "",
      monthlyBudget: "",
    };

    const hasLegacyKeys =
      "monthlyPrediction" in doc ||
      "lifestyleTag" in doc ||
      "prediction" in doc ||
      "budgetRecommendation" in doc ||
      "monthlyBudget" in doc;

    const needsBackfill =
      doc.predictedSpend !== set.predictedSpend ||
      doc.suggestedBudget !== set.suggestedBudget ||
      !doc.monthlyTotals ||
      Object.keys(doc.monthlyTotals || {}).length === 0 ||
      !Array.isArray(doc.lifestyleTags) ||
      !Array.isArray(doc.categoryInsights) ||
      !doc.month ||
      !doc.generatedAt ||
      hasLegacyKeys;

    if (!needsBackfill) continue;

    changed += 1;

    if (shouldApply) {
      await Insight.collection.updateOne(
        { _id: doc._id },
        {
          $set: set,
          $unset: unset,
        }
      );
    }
  }

  console.log(
    `Insights migration ${shouldApply ? "applied" : "dry run"}: scanned ${scanned}, ${shouldApply ? "updated" : "would update"} ${changed}.`
  );
};

migrate()
  .catch((error) => {
    console.error("Insights migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
