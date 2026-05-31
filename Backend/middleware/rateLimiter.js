const defaultKeyGenerator = (req) => req.ip || req.socket?.remoteAddress || "unknown";

const createRateLimiter = ({
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  keyGenerator = defaultKeyGenerator,
}) => {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const current = buckets.get(key);

    if (!current || now > current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    return next();
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
});

export const insightGenerateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many insight generation requests. Please try again later.",
  keyGenerator: (req) => req.user?.userId || defaultKeyGenerator(req),
});

export const agentInsightGenerateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many agent insight generation requests. Please try again later.",
  keyGenerator: (req) => req.body?.userId || defaultKeyGenerator(req),
});
