import { findUserById } from '../repositories/userRepository.js';

export function resolveCurrentUser(req) {
  return req.user || findUserById(req.header('x-user-id')) || null;
}
