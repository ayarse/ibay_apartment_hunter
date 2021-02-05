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