import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { registerRoutes } from './routes';
import globalErrorHandler from './utils/globalErrorHandler';

export const createApp = (): Application => {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  registerRoutes(app);
  app.use((_, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  app.use(globalErrorHandler);
  return app;
};
