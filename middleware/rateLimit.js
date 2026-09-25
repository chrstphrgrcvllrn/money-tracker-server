const rateLimit = require("express-rate-limit");

// 429 in the same error shape as every other auth failure.
const createAuthLimiter = ({ max, windowMs = 15 * 60 * 1000 } = {}) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        error: { message: "Too many attempts. Please try again later.", code: "RATE_LIMITED" },
      }),
  });

module.exports = { createAuthLimiter };
