import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';

export const registerRoutes = (app: Router) => {
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);
};
