import express from "express";
import Insight from "../models/Insight.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateInsightAgent } from "../middleware/validators.js";
import vestAuthMiddleware from "../middleware/vestAuthMiddleware.js";
import { agentInsightGenerateRateLimiter, insightGenerateRateLimiter } from "../middleware/rateLimiter.js";
import { generateAndCacheInsights } from "../services/insightOrchestrator.js";

const router = express.Router();
const GENERATE_COOLDOWN_MS = 30 * 1000;
const lastGenerateAtByUser = new Map();

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', authMiddleware, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;
  const month = new Date().toISOString().slice(0, 7);

  const insights = await Insight.findOne({ userId, month });

  res.json({
    success: true,
    message: "Insights are generated for this month",
    data: { insights }
  });
}));

router.post('/generate', authMiddleware, insightGenerateRateLimiter, asyncHandler(async (req, res, next) => {
  const userId = req.user.userId;

  const now = Date.now();
  const lastGeneratedAt = lastGenerateAtByUser.get(userId) || 0;
  const elapsed = now - lastGeneratedAt;

  if (elapsed < GENERATE_COOLDOWN_MS) {
    const retryAfterMs = GENERATE_COOLDOWN_MS - elapsed;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message: 'Please wait before regenerating insights again.',
      retryAfterSeconds,
    });
  }

  // Generate insights and upsert into DB (returns the saved document)
  const saved = await generateAndCacheInsights(userId);
  lastGenerateAtByUser.set(userId, now);

  res.json({
    success: true,
    message: "Insights generated and cached",
    data: { insights: saved }
  });
}));

// Agent-triggered generation (signed requests via Vest-auth)
router.post('/generate/agent', vestAuthMiddleware, validateInsightAgent, agentInsightGenerateRateLimiter, asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  const now = Date.now();
  const lastGeneratedAt = lastGenerateAtByUser.get(userId) || 0;
  const elapsed = now - lastGeneratedAt;

  if (elapsed < GENERATE_COOLDOWN_MS) {
    const retryAfterMs = GENERATE_COOLDOWN_MS - elapsed;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    res.setHeader('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message: 'Please wait before regenerating insights again.',
      retryAfterSeconds,
    });
  }

  const saved = await generateAndCacheInsights(userId);
  lastGenerateAtByUser.set(userId, now);

  res.json({
    success: true,
    message: 'Agent generated and cached insights',
    data: { insights: saved }
  });
}));

export default router;
