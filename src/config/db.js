import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedUsers, seedPosts } from '../data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'pulse.sqlite');

export const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT NOT NULL,
    avatar TEXT,
    banner TEXT,
    bio TEXT
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (follower_id, following_id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image TEXT,
    tag TEXT,
    timestamp INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS post_likes (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  );
`);

// Auto-seed database if empty
function initSeed() {
  const userCountStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = userCountStmt.get();

  if (!userCount || userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, handle, avatar, banner, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertFollow = db.prepare(`
      INSERT OR IGNORE INTO follows (follower_id, following_id)
      VALUES (?, ?)
    `);

    for (const user of seedUsers) {
      insertUser.run(user.id, user.name, user.handle, user.avatar || '', user.banner || '', user.bio || '');
    }

    for (const user of seedUsers) {
      if (Array.isArray(user.following)) {
        for (const targetId of user.following) {
          insertFollow.run(user.id, targetId);
        }
      }
    }

    const insertPost = db.prepare(`
      INSERT INTO posts (id, author_id, content, image, tag, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertLike = db.prepare(`
      INSERT OR IGNORE INTO post_likes (post_id, user_id)
      VALUES (?, ?)
    `);
    const insertComment = db.prepare(`
      INSERT INTO comments (id, post_id, author_id, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const post of seedPosts) {
      insertPost.run(post.id, post.authorId, post.content, post.image || '', post.tag || '', post.timestamp);

      if (Array.isArray(post.likes)) {
        for (const userId of post.likes) {
          insertLike.run(post.id, userId);
        }
      }

      if (Array.isArray(post.comments)) {
        for (const comment of post.comments) {
          insertComment.run(comment.id, post.id, comment.authorId, comment.content, comment.timestamp);
        }
      }
    }
  }
}

initSeed();
