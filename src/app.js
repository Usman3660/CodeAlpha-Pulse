import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './routes/api.routes.js';
import { env, validateEnv } from './config/env.js';
import { helmetMiddleware, corsMiddleware, apiRateLimiter } from './config/security.js';
import { sanitizeMiddleware } from './middleware/sanitize.middleware.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js';

validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);
app.use(sanitizeMiddleware);

app.get('/health', (req, res) => {
  res.json({ ok: true, app: env.APP_NAME, env: env.NODE_ENV });
});

app.use('/api/v1', apiRouter);
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use(errorHandlerMiddleware);
