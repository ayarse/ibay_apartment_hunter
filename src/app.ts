import * as Sentry from '@sentry/node';
import { bot as tg } from './clients';
import { env } from './config';
import { logger } from './util/logger';

import './commands';
import initCommands from './commands';
import { notifyAdmin } from './lib/helpers';

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

tg.catch((err) => {
  logger.error(err);
  Sentry.captureException(err);
});

const stopTg = async () => {
  notifyAdmin('Bot is shutting down...');
  await tg.stop();
};

process.once('SIGINT', stopTg);
process.once('SIGTERM', stopTg);
