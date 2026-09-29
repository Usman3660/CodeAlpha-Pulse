import { Router } from 'express';
import { commentOnPostController, createPostController, deletePostController, likePostController, listPostsController } from '../controllers/post.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const postRouter = Router();

postRouter.get('/', listPostsController);
postRouter.post('/', authMiddleware, createPostController);
postRouter.post('/:id/like', authMiddleware, likePostController);
postRouter.post('/:id/comments', authMiddleware, commentOnPostController);
postRouter.delete('/:id', authMiddleware, deletePostController);
