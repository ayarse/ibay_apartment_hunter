import * as Sentry from '@sentry/node';
import { bot as tg } from './clients';
import { env } from './config';
import { logger } from './util/logger';

import './listeners';
import { IBayScraper } from './scrapers/ibay';
import { notifyAdmin } from './services/notif-service';
import initCommands from './telegram/commands';
import { Locations } from './types';
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

const scraperFns = [
  () => ibayScraper.getUpdates(Locations.All),
  () => ibayScraper.getUpdates(Locations.Male),
  () => ibayScraper.getUpdates(Locations.Hulhumale),
  () => ibayScraper.getUpdates(Locations.Villigili),
];

const scraperInt = setInterval(() => {
  logger.info('Running scrapers...');
  scraperFns.forEach((fn) => fn());
}, minsToMs(env.TIME_INTERVAL));

tg.catch((err) => {
  logger.error(err);
  Sentry.captureException(err);
});

const stopTg = async () => {
  notifyAdmin('Bot is shutting down...');
  clearInterval(scraperInt);
  await tg.stop();
};

process.once('SIGINT', stopTg);
process.once('SIGTERM', stopTg);
