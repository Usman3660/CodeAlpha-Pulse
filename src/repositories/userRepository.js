import { db } from '../config/db.js';
import { seedUsers } from '../data/seed.js';
import { createUser } from '../models/User.js';

function hydrateUser(row) {
  if (!row) return null;

  const followersStmt = db.prepare('SELECT follower_id FROM follows WHERE following_id = ?');
  const followingStmt = db.prepare('SELECT following_id FROM follows WHERE follower_id = ?');

  const followers = followersStmt.all(row.id).map((r) => r.follower_id);
  const following = followingStmt.all(row.id).map((r) => r.following_id);

  return createUser({
    id: row.id,
    name: row.name,
    handle: row.handle,
    avatar: row.avatar,
    banner: row.banner,
    bio: row.bio,
    followers,
    following
  });
}

export function findAllUsers() {
  const stmt = db.prepare('SELECT * FROM users');
  const rows = stmt.all();
  return rows.map(hydrateUser);
}

export function findUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id);
  return hydrateUser(row);
}

export function saveUser(user) {
  const normalized = createUser(user);
  const stmt = db.prepare(`
    INSERT INTO users (id, name, handle, avatar, banner, bio)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      handle = excluded.handle,
      avatar = excluded.avatar,
      banner = excluded.banner,
      bio = excluded.bio
  `);

  stmt.run(
    normalized.id,
    normalized.name,
    normalized.handle,
    normalized.avatar || '',
    normalized.banner || '',
    normalized.bio || ''
  );

  return findUserById(normalized.id);
}

export function updateUser(id, patch) {
  const existing = findUserById(id);
  if (!existing) return null;

  const updated = { ...existing, ...patch };
  return saveUser(updated);
}

export function toggleUserFollow(followerId, followingId) {
  const checkStmt = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?');
  const exists = checkStmt.get(followerId, followingId);

  if (exists) {
    const deleteStmt = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?');
    deleteStmt.run(followerId, followingId);
  } else {
    const insertStmt = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
    insertStmt.run(followerId, followingId);
  }

  return {
    currentUser: findUserById(followerId),
    targetUser: findUserById(followingId)
  };
}

export function resetUsers(nextUsers = seedUsers) {
  db.exec('DELETE FROM follows; DELETE FROM users;');
  for (const u of nextUsers) {
    saveUser(u);
    if (Array.isArray(u.following)) {
      for (const targetId of u.following) {
        db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)').run(u.id, targetId);
      }
    }
  }
  return findAllUsers();
}
