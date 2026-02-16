import pino from 'pino';
import { Logger } from 'pino';

const createLogger = (): Logger => {
  const transport =
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined;

  return pino({
    name: 'orbit',
    level: process.env.LOG_LEVEL || 'info',
    transport,
  });
};

export const logger = createLogger();
