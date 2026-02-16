import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { createServer } from 'http';
import { connectDatabase, closeDatabase } from './config/db';

const main = async () => {
  try {
    await connectDatabase();

    const app = createApp();
    const server = createServer(app);
    const port = env.PORT;
    server.listen(port, () => {
      logger.info({ port }, 'Server is running');
    });

    const shutdown = () => {
      logger.info('Shutting down server...');

      Promise.all([closeDatabase()])
        .catch((error) => {
          logger.error({ error }, 'Error during shutdown tasks');
        })
        .finally(() => {
          server.close(() => {
            logger.info('Server closed');
            process.exit(0);
          });
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error({ error }, 'Failed to start the application');
    process.exit(1);
  }
};

main();
