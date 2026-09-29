import { getTrendingTopics, getWhoToFollow, toggleFollow } from '../services/socialService.js';
import { resolveCurrentUser } from '../services/authService.js';

export function trendingController(req, res) {
  res.json({ data: getTrendingTopics() });
}

export function whoToFollowController(req, res) {
  const currentUser = resolveCurrentUser(req);
  res.json({ data: getWhoToFollow(currentUser.id) });
}

export function toggleFollowController(req, res) {
  const currentUser = resolveCurrentUser(req);
  const result = toggleFollow(currentUser.id, req.params.id);
  if (!result) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({ data: result });
}
