import { CheerioCrawler, Configuration, CheerioRoot} from 'crawlee';
import { ConfigService } from '@/services';
import type { Listing } from '@/util/types';
import { Events, Locations } from '@/util/types';
import { trimObjectValues } from '@/util';
import { eventBus } from '@/events';
import { env } from '@/config';

const BASE_URL = process.env.IBAY_BASE_URL ?? 'https://ibay.com.mv';

const SELECTORS = {
  listings: '.bg-light.latest-list-item',
  title: 'h5 > a',
  url: 'h5 > a',
  price: '.col.s8 > .price',
  id: (data: string) => {
    const match = /o([0-9]+)\.html/.exec(data);
    return match?.[1];
  },
} as const;


const getConfigKey = (location: string) => `ibay_latest_item_id_${location}`;

const buildLocationUrl = (location: keyof typeof Locations) => {
  const url = new URL(BASE_URL);
  url.searchParams.set('page', 'search');
  url.searchParams.set('s_res', 'AND');
  url.searchParams.set('cid', '25');
  url.searchParams.set('off', '0');
  url.searchParams.set('lang', '');
  url.searchParams.set('s_by', 'hw_added');
 
   switch (location) {
     case Locations.Male:
       url.searchParams.set('reg1_ex', '11');
       url.searchParams.set('reg2_ex', '100');
       break;
     case Locations.Hulhumale:
       url.searchParams.set('f_location_ex', 'Male -- HulhuMale');
       break;
     case Locations.Villigili:
       url.searchParams.set('f_location_ex', 'Male -- Villingili');
       break;
     default:
       break;
   }
   return url.toString();
 }

 const LOCATION_URLS = Object.values(Locations).reduce((acc, location) => {
  acc[location] = buildLocationUrl(location);
  return acc;
 }, {} as Record<keyof typeof Locations, string>);


export class IBayScraper {
  public async getUpdates() {
    const urls = Object.values(LOCATION_URLS);

    const crawler = new CheerioCrawler(
      {
        async requestHandler({ request, $ }) {
          const listings = $(SELECTORS.listings);
          const listingData: Listing[] = [];
          const currentUrl = request.url;
          const location = Object.keys(LOCATION_URLS).find(
            (key) => LOCATION_URLS[key] === currentUrl,
          );
          const configKey = getConfigKey(location);
          const currentLatest = await ConfigService.getConfigByKey(configKey) ?? '0';

          console.log('Current location', location);

          listings.each((_index, el) => {
            const title = $(el).find(SELECTORS.title).text();
            const url = $(el).find(SELECTORS.url).attr('href');
            const price = $(el).find(SELECTORS.price).text();
            const id = SELECTORS.id(url);

            const data = trimObjectValues({
              id,
              title,
              url: new URL(url, 'https://ibay.com.mv').toString(),
              price,
              location,
            });

            listingData.push(data);

            // Emit the new item event only if the current item ID is greater than the latest item ID
            if (parseInt(currentLatest, 10) < parseInt(id, 10)) {
              eventBus.emit(Events.NewIBayItem, data);
            }
          });

          // Update the configuration with the latest item ID for the current location
          if (!env.DEBUG) {
            await ConfigService.setConfig(
              getConfigKey(location),
              listingData[0].id,
            );
          }
        },
      },
      new Configuration({
        persistStorage: false,
      }),
    );

    await crawler.run([...urls]).catch((err) => {
      console.log(err);
    });
  }
}
