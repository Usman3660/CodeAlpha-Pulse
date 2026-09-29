import { db } from '../config/db.js';
import { seedPosts } from '../data/seed.js';
import { createPost } from '../models/Post.js';
import { createComment } from '../models/Comment.js';

function hydratePost(row) {
  if (!row) return null;

  const likesStmt = db.prepare('SELECT user_id FROM post_likes WHERE post_id = ?');
  const commentsStmt = db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY timestamp ASC');

  const likes = likesStmt.all(row.id).map((r) => r.user_id);
  const comments = commentsStmt.all(row.id).map((c) => createComment({
    id: c.id,
    authorId: c.author_id,
    content: c.content,
    timestamp: c.timestamp
  }));

  return createPost({
    id: row.id,
    authorId: row.author_id,
    content: row.content,
    image: row.image,
    tag: row.tag,
    timestamp: row.timestamp,
    likes,
    comments
  });
}

export function findAllPosts() {
  const stmt = db.prepare('SELECT * FROM posts ORDER BY timestamp DESC');
  const rows = stmt.all();
  return rows.map(hydratePost);
}

export function findPostById(id) {
  const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
  const row = stmt.get(id);
  return hydratePost(row);
}

export function savePost(post) {
  const normalized = createPost(post);
  const stmt = db.prepare(`
    INSERT INTO posts (id, author_id, content, image, tag, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      author_id = excluded.author_id,
      content = excluded.content,
      image = excluded.image,
      tag = excluded.tag,
      timestamp = excluded.timestamp
  `);

  stmt.run(
    normalized.id,
    normalized.authorId,
    normalized.content,
    normalized.image || '',
    normalized.tag || '',
    normalized.timestamp
  );

  return findPostById(normalized.id);
}

export function deletePostById(id) {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function togglePostLikeInDb(postId, userId) {
  const checkStmt = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?');
  const exists = checkStmt.get(postId, userId);

  if (exists) {
    const deleteStmt = db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?');
    deleteStmt.run(postId, userId);
  } else {
    const insertStmt = db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)');
    insertStmt.run(postId, userId);
  }

  return findPostById(postId);
}

export function resetPosts(nextPosts = seedPosts) {
  db.exec('DELETE FROM post_likes; DELETE FROM comments; DELETE FROM posts;');
  const insertPost = db.prepare('INSERT INTO posts (id, author_id, content, image, tag, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
  const insertLike = db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)');
  const insertComment = db.prepare('INSERT INTO comments (id, post_id, author_id, content, timestamp) VALUES (?, ?, ?, ?, ?)');

  for (const post of nextPosts) {
    insertPost.run(post.id, post.authorId, post.content, post.image || '', post.tag || '', post.timestamp);
    if (Array.isArray(post.likes)) {
      for (const uid of post.likes) insertLike.run(post.id, uid);
    }
    if (Array.isArray(post.comments)) {
      for (const c of post.comments) insertComment.run(c.id, post.id, c.authorId, c.content, c.timestamp);
    }
  }

  return findAllPosts();
}

export { addCommentToPost } from './commentRepository.js';
