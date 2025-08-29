import { db } from '@/db';
import { listings } from '@/db/schema';
import { ibayPageCrawler } from '@/scrapers';
import { NotifService } from '@/services';
import type { Listing } from '@/types';

export const newIbayItemScraped = async (item: Listing) => {
  NotifService.notifyUsersByPref(item.location, item);

  await db
    .insert(listings)
    .values({
      ibay_id: parseInt(item.id, 10),
      title: item.title,
      url: item.url,
      price: item.price,
      location: item.location,
    })
    .onConflictDoNothing();

  await ibayPageCrawler.addRequests([item.url]);
};
