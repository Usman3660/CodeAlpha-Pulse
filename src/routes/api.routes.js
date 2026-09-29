import { Router } from 'express';
import { userRouter } from './user.routes.js';
import { postRouter } from './post.routes.js';
import { socialRouter } from './social.routes.js';

export const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postRouter);
apiRouter.use('/social', socialRouter);
