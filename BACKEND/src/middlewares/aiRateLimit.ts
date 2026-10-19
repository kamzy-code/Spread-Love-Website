import rateLimit from "express-rate-limit";
import { AuthRequest } from "./authMiddleware";

// Each suggestion is a paid API call, so this sits on top of the global
// per-IP limiter. Keyed by user (the route runs authMiddleware first), not
// IP — reps sharing an office connection shouldn't share a quota.
export const suggestMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as AuthRequest).user!.userId,
  message: { message: "Too many suggestions this hour — please wait a little before generating more." },
});
