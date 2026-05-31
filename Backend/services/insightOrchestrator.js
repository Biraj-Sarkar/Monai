import Insights from "../models/Insight.js";
import User from "../models/User.js"
import { generateInsights } from "./insightService.js";

const extractTopCategories = (insights) => {
  const list = insights?.categoryInsights || [];
  return list.map(i => i.split(" ")[0]).slice(0, 3);
};

export const generateAndCacheInsights = async (userId) => {
  const insights = await generateInsights(userId);
  const month = new Date().toISOString().slice(0, 7);

  // 🔁 UPSERT insight (cache)
  const savedInsight = await Insights.findOneAndUpdate(
    { userId, month }, 
    { 
      ...insights, 
      userId,
      month,
      generatedAt: new Date()
    },
    { upsert: true, returnDocument: 'after' }
  );

  // 🧠 Update User summary (latest snapshot)
  await User.findByIdAndUpdate(userId, {
    lifestyleTag: insights.lifestyleTags || [],
    avgMonthlySpend: insights.predictedSpend || 0,
    preferredCategories: extractTopCategories(insights)
  });

  return savedInsight;
};