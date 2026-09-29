import { createNewPost, enrichPosts, getPostById, listPosts, removePost, togglePostLike, addPostComment } from '../services/postService.js';
import { resolveCurrentUser } from '../services/authService.js';

export function listPostsController(req, res) {
  res.json({ data: enrichPosts(listPosts()) });
}

export function createPostController(req, res) {
  const currentUser = resolveCurrentUser(req);
  const post = createNewPost({
    authorId: currentUser.id,
    content: req.body.content,
    image: req.body.image,
    tag: req.body.tag
  });
  res.status(201).json({ data: post });
}

export function likePostController(req, res) {
  const currentUser = resolveCurrentUser(req);
  const post = togglePostLike(req.params.id, currentUser.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  res.json({ data: post });
}

export function commentOnPostController(req, res) {
  const currentUser = resolveCurrentUser(req);
  const comment = addPostComment(req.params.id, currentUser.id, req.body.content);
  if (!comment) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  res.status(201).json({ data: comment });
}

export function deletePostController(req, res) {
  const removed = removePost(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  res.status(204).send();
}
