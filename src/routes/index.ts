import { Router } from 'express';
import { authRouter } from './auth.routes';
import { planetRouter } from './planet.routes';

export const registerRoutes = (app: Router) => {
  app.use('/api/auth', authRouter);
  app.use('/api/planet', planetRouter);
};
