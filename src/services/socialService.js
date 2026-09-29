import { findAllPosts } from '../repositories/postRepository.js';
import { findAllUsers, findUserById, toggleUserFollow } from '../repositories/userRepository.js';

export function getTrendingTopics() {
  const counts = new Map();
  for (const post of findAllPosts()) {
    if (!post.tag) continue;
    counts.set(post.tag, (counts.get(post.tag) || 0) + 1);
  }

  const defaults = ['DesignSystems', 'CreativeCode', 'Minimalism', 'WebDev', 'MotionDesign'];
  for (const tag of defaults) {
    if (!counts.has(tag)) counts.set(tag, 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
}

export function getWhoToFollow(currentUserId) {
  return findAllUsers().filter((user) => user.id !== currentUserId);
}

export function toggleFollow(currentUserId, targetUserId) {
  const currentUser = findUserById(currentUserId);
  const targetUser = findUserById(targetUserId);
  if (!currentUser || !targetUser) return null;

  return toggleUserFollow(currentUserId, targetUserId);
}
