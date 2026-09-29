import { Router } from 'express';
import { toggleFollowController, trendingController, whoToFollowController } from '../controllers/social.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const socialRouter = Router();

socialRouter.get('/trending', trendingController);
socialRouter.get('/who-to-follow', authMiddleware, whoToFollowController);
socialRouter.post('/follow/:id', authMiddleware, toggleFollowController);
