import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '@/utils/logger';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) {
    logger.info('Database already connected');
    return;
  }

  try {
    await mongoose.connect(env.MONGO_URL);
    isConnected = true;
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ error }, 'Error while connecting to the database');
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    logger.info('Database connection closed');
  } catch (error) {
    logger.error({ error }, 'Error while closing database connection');
    throw error;
  }
};
