import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 attempts
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});
