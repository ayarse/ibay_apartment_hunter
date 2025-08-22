import { CheerioCrawler, Configuration, CheerioRoot} from 'crawlee';
import { ConfigService } from '@/services';
import type { Listing } from '@/util/types';
import { Events, Locations } from '@/util/types';
import { trimObjectValues } from '@/util';
import { eventBus } from '@/events';
import { env } from '@/config';

const BASE_URL = process.env.IBAY_BASE_URL ?? 'https://ibay.com.mv';

const LOCATION_URLS = {
  [Locations.All]: `${BASE_URL}/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added`,
  [Locations.Male]: `${BASE_URL}/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added&reg1_ex=11&reg2_ex=100`,
  [Locations.Hulhumale]: `${BASE_URL}/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+HulhuMale`,
  [Locations.Villigili]: `${BASE_URL}/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+Villingili`,
} as const;

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
          const configKey = `ibay_latest_item_id_${location}`;
          const currentLatest = await ConfigService.getConfigByKey(configKey);

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
              `ibay_latest_item_id_${location}`,
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
