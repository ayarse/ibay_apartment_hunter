import { Context as TelegrafContext } from 'telegraf';

export enum Locations {
  All = 'All',
  Hulhumale = 'Hulhumale',
  Male = 'Male',
  Villigili = 'Villigili',
}

export type MyContext = TelegrafContext & {
  match: RegExpExecArray | undefined;
};

export interface Scraper {
  scraperBaseUrl: string;
  getResults(): Promise<ItemListing[]>;
}

export interface ItemListing {
  url: string;
  title: string;
  price: string;
  UUID: string;
  UUIDhash: string;
}
