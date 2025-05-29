import { CheerioCrawler, Configuration } from 'crawlee';
import { ConfigService } from '../services';
import { Listing, Locations } from '../types';
import { trimObjectValues } from '../util';
import { Events, eventBus } from '../util/event-bus';
import env from '../config';

const ibayBaseUrl = process.env.IBAY_BASE_URL ?? 'https://ibay.com.mv';

export const IBAY_URLS = {
  [Locations.All]: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added`,
  [Locations.Male]: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added&reg1_ex=11&reg2_ex=100`,
  [Locations.Hulhumale]: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+HulhuMale`,
  [Locations.Villigili]: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+Villingili`,
};

export class IBayScraper {
  public async getUpdates() {
    const urls = Object.values(IBAY_URLS);

    const crawler = new CheerioCrawler(
      {
        async requestHandler({ request, $ }) {
          const listings = $('.bg-light.latest-list-item');
          const listingData: Listing[] = [];
          const currentUrl = request.url;
          const location = Object.keys(IBAY_URLS).find(
            (key) => IBAY_URLS[key] === currentUrl,
          );
          const configKey = `ibay_latest_item_id_${location}`;
          const currentLatest = await ConfigService.getConfigByKey(configKey);

          console.log('Current location', location);

          listings.each((index, el) => {
            const title = $(el).find('h5 > a').text();
            const url = $(el).find('h5 > a').attr('href');
            const price = $(el).find('.col.s8 > .price').text();
            const id = /o([0-9]+)\.html/.exec(url as string)?.[1];

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
