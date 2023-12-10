import { botDB, tg } from './clients';
import env from './config';
import { IbayListing } from './lib/IbayListing';
import { scrapers } from './config';

const notifyUsers = function (locationPref: string, listings: IbayListing[]) {
  const users = botDB.getUsersByPref(locationPref);
  users.forEach((user, _index) => {
    if (env.DEBUG && user.tg_id !== parseInt(env.DEBUG_USER)) return;
    listings.forEach((listing, _i) => {
      tg.telegram.sendMessage(user.tg_id, listing.fullUrl).catch((err) => {
        if (err.response.error_code == 403 && err.description == 'Forbidden: bot was blocked by the user') {
          botDB.removeSubscriber(user.tg_id);
          console.log(`User ${user.tg_id} has blocked bot. Removed from db.`);
        }
      });
    });
  });
};

let scraperIndex = 0;

const _botUpdateTimer = setInterval(() => {
  const scraper = scrapers[scraperIndex];
  scraper.getResults().then((results) => {
    console.log(`Scraper[${scraper.locationPref}] : sending ${results.length} listings...`);
    notifyUsers(scraper.locationPref, results);
  });
  scraperIndex = (scraperIndex + 1) % scrapers.length;
}, parseInt(process.env.TIMER_INTERVAL)).unref();
