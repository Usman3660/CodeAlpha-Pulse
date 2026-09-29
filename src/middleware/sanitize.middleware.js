import validator from 'validator';

function cleanString(value) {
  if (typeof value !== 'string') return value;
  return validator.escape(value.trim());
}

export function sanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = cleanString(value);
      }
    }
  }

  next();
}
