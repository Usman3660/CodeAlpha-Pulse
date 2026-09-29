import { createPost } from '../models/Post.js';
import { createComment } from '../models/Comment.js';
import { deletePostById, findAllPosts, findPostById, savePost, togglePostLikeInDb } from '../repositories/postRepository.js';
import { addCommentToPost } from '../repositories/commentRepository.js';
import { findUserById } from '../repositories/userRepository.js';

export function listPosts() {
  return findAllPosts();
}

export function createNewPost({ authorId, content, image = '', tag = 'Vibes' }) {
  const post = createPost({
    id: `p_${Date.now()}`,
    authorId,
    content,
    image,
    tag,
    timestamp: Date.now(),
    likes: [],
    comments: []
  });

  return savePost(post);
}

export function togglePostLike(postId, userId) {
  return togglePostLikeInDb(postId, userId);
}

export function addPostComment(postId, authorId, content) {
  return addCommentToPost(postId, createComment({
    id: `c_${Date.now()}`,
    authorId,
    content,
    timestamp: Date.now()
  }));
}

export function removePost(postId) {
  return deletePostById(postId);
}

export function getPostById(postId) {
  return findPostById(postId);
}

export function enrichPosts(posts) {
  return posts.map((post) => ({
    ...post,
    author: findUserById(post.authorId)
  }));
}
