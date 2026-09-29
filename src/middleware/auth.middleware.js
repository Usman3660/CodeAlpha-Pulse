import { env } from '../config/env.js';
import { findUserById } from '../repositories/userRepository.js';

export function authMiddleware(req, res, next) {
  const userId = req.header('x-user-id') || req.header('x-simulated-user') || env.SIMULATED_USER_ID;
  const user = findUserById(userId);

  if (!user) {
    return res.status(401).json({ message: 'Unknown user identity.' });
  }

  req.user = user;
  next();
}
