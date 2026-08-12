// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,                 // express-rate-limit v7+
  max: 5,                   // express-rate-limit v6 (Fixes default 100 limit!)
  standardHeaders: true,
  legacyHeaders: true,
  // Force a consistent key for local testing so all requests count toward the same 5-request limit
  keyGenerator: (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    console.log(`[RateLimiter] Register request processed for IP: ${ip}`);
    return 'register-test-key'; 
  },
  handler: (req, res) => {
    console.log('[RateLimiter] BLOCKING REQUEST - Sending 429 Status');
    return res.status(429).json({
      message: 'Too many registration attempts. Please try again later.'
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  max: 5,
  standardHeaders: true,
  legacyHeaders: true,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = req.body?.email?.toLowerCase().trim() || 'anonymous';
    return `login:${email}`;
  },
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Too many failed login attempts. Please try again later.'
    });
  },
});

module.exports = { registerLimiter, loginLimiter };