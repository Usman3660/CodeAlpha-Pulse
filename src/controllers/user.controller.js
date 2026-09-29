import { findAllUsers, findUserById } from '../repositories/userRepository.js';

export function listUsers(req, res) {
  res.json({ data: findAllUsers() });
}

export function getUser(req, res) {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({ data: user });
}
