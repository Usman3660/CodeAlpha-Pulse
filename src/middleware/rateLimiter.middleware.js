const requestWindow = new Map();

export function rateLimiterMiddleware(req, res, next) {
  const key = req.ip || 'anonymous';
  const now = Date.now();
  const bucket = requestWindow.get(key) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < 10_000);

  recent.push(now);
  requestWindow.set(key, recent);

  if (recent.length > 80) {
    return res.status(429).json({ message: 'Too many requests. Please slow down.' });
  }

  next();
}
