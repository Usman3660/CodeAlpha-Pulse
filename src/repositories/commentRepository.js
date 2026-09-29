import { db } from '../config/db.js';
import { findPostById } from './postRepository.js';
import { createComment } from '../models/Comment.js';

export function addCommentToPost(postId, comment) {
  const post = findPostById(postId);
  if (!post) return null;

  const normalized = createComment(comment);
  const stmt = db.prepare(`
    INSERT INTO comments (id, post_id, author_id, content, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    normalized.id,
    postId,
    normalized.authorId,
    normalized.content,
    normalized.timestamp
  );

  return normalized;
}
