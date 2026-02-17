import { Router } from 'express';
import { authRouter } from './auth.routes';
import { planetRouter } from './planet.routes';
import { taskRouter } from './task.routes';
import narrativeRouter from './narrative.routes';

export const registerRoutes = (app: Router) => {
  app.use('/api/auth', authRouter);
  app.use('/api/user', authRouter);
  app.use('/api/planet', planetRouter);
  app.use('/api/task', taskRouter);
  app.use('/api/narratives', narrativeRouter);
};
