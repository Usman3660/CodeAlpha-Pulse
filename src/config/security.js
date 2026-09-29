import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false
});

export const corsMiddleware = cors({
  origin: true,
  credentials: true
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false
});
