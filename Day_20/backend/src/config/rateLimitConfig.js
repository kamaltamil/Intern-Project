const rateLimit = require("express-rate-limit");

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

const loginLimiter = createLimiter(
  2 * 60 * 1000,
  5,
  "Too many login attempts. Please try again after 2 minutes."
);

const registerLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  "Too many registration attempts. Please try again after 1 hour."
);

const refreshLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Too many token refresh attempts. Please try again later."
);

const authenticatedLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  "Too many requests. Please slow down and try again later."
);

const globalLimiter = createLimiter(
  15 * 60 * 1000,
  200,
  "Too many requests from this IP. Please try again later."
);

module.exports = {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  authenticatedLimiter,
  globalLimiter,
};
