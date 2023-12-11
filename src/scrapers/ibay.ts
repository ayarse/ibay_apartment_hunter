import { ElementHandle } from 'puppeteer';
import { IBAY_URLS } from '../constants';
import { ConfigService } from '../services';
import { Listing, Locations } from '../types';
import { getBrowser, trimObjectValues } from '../util';
import { Events, eventBus } from '../util/event-bus';

export class IBayScraper {
  public async getUpdates(location: Locations = Locations.All) {
    const LATEST_CONFIG_KEY = `ibay_latest_item_id_${location}`;

    const url = IBAY_URLS[location];
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const latest = await ConfigService.getConfigByKey(LATEST_CONFIG_KEY);
    console.log(location, 'Latest ID', latest);

    const listings = await page.$$('.bg-light.latest-list-item');

    const listingData = await Promise.allSettled<Listing>(
      listings.map(this.extractData.bind(this)),
    );

    listingData.forEach((data) => {
      if (
        data.status === 'fulfilled' &&
        parseInt(data.value.id, 10) > parseInt(latest ?? '0', 10)
      ) {
        eventBus.emit(Events.NewIBayItem, { ...data.value, location });
      }
    });

    const latestItem = listingData[0];

    if (latestItem.status === 'fulfilled') {
      await ConfigService.setConfig(LATEST_CONFIG_KEY, latestItem.value.id);
    }

    await browser.close();
  }

  private async extractData(el: ElementHandle): Promise<Listing> {
    const getSelectorProperty = async (selector: string, property: string) => {
      try {
        const element = await el.$(selector);
        const propertyHandle = await element?.getProperty(property);
        const value = await propertyHandle?.jsonValue();

        return value;
      } catch (error) {
        console.log(error);
      }
    };

    const title = await getSelectorProperty('h5 > a', 'textContent');
    const url = await getSelectorProperty('h5 > a', 'href');
    const price = await getSelectorProperty('.col.s8 > .price', 'textContent');
    const id = /o([0-9]+)\.html/.exec(url as string)?.[1];

    return trimObjectValues({
      id,
      title,
      url,
      price,
    }) as unknown as Listing;
  }
}
