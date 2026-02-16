import { Router } from 'express';
import { authRouter } from './auth.routes';

export const registerRoutes = (app: Router) => {
  app.use('/api/auth', authRouter);
};
