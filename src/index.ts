import http from 'node:http';
import * as Sentry from '@sentry/node';
import { bot as tg } from './telegram';
import { env } from './config';
import { logger } from './util';
import { client } from './db';

import './events';
import { IBayScraper } from './scrapers/ibay';
import { notifyAdmin } from './services/notif-service';
import initCommands from './telegram/commands';
import { minsToMs } from './util';

Sentry.init({
  dsn: env.SENTRY_DSN,
});

logger.info('Starting up...');

/**
 * Bot Commands and Menus
 */
notifyAdmin('Bot is starting up...');
await initCommands();

/**
 * Start Bot Process
 */
tg.start();

const ibayScraper = new IBayScraper();

const scraperFns = [() => ibayScraper.getUpdates()];

const scraperInt = setInterval(() => {
  logger.info('Running scrapers...');
  scraperFns.forEach((fn) => {
    fn();
  });
}, minsToMs(env.TIME_INTERVAL));

tg.catch((err) => {
  logger.error(err);
  Sentry.captureException(err);
});

const server = http
  .createServer((_, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  })
  .listen(process.env.PORT || 3000);

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    logger.warn('Already shutting down, forcing exit...');
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    await notifyAdmin('Bot is shutting down...');

    clearInterval(scraperInt);

    logger.info('Stopping Telegram bot...');
    await tg.stop();

    logger.info('Closing HTTP server...');
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    logger.info('Closing database connection...');
    await client.end();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.once(signal, () => shutdown(signal));
});

process.on('uncaughtException', (err) => {
  logger.error(err);
  Sentry.captureException(err);
});
