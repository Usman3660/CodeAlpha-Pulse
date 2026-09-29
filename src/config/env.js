function readInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: readInteger(process.env.PORT, 3000),
  APP_NAME: process.env.APP_NAME || 'Pulse Social',
  SIMULATED_USER_ID: process.env.SIMULATED_USER_ID || 'u1'
};

export function validateEnv() {
  if (!env.PORT || env.PORT < 1 || env.PORT > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }
}
