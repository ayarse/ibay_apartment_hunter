import axios from "axios";
import cheerio from "cheerio";
import { Scraper } from ".";
import { BotDB } from "./BotDB";
import { IbayListing } from "./IbayListing";

export class IbayScraper implements Scraper {

    scraperBaseUrl: string = "https://ibay.com.mv/";
    $data: ReturnType<typeof cheerio.load>;
    locationPref: string;
    botDB: BotDB = null;

    constructor(locationPref: string = 'male') {
        this.locationPref = locationPref;
        if (!this.botDB)
            this.botDB = BotDB.getInstance();
    }

    async initialize(): Promise<void> {
        const ibayUrl = this.buildUrl(this.locationPref);
        const result = await axios.get(ibayUrl);
        this.$data = cheerio.load(result.data);
    }

    async getResults(): Promise<IbayListing[]> {
        await this.initialize();
        let results: IbayListing[] = this.getPageListings(this.$data);
        if (results.length > 0 && this.botDB.lastChecked(this.locationPref) !== results[0].UUID)
            this.botDB.updateLastChecked(this.locationPref, results[0].UUID);
        return results;
    }

    getPageListings($page: ReturnType<typeof cheerio.load>): IbayListing[] {
        let results: IbayListing[] = [];
        const $listings = $page(".bg-light.latest-list-item");
        $listings.each((_i, el) => {
            let item = new IbayListing(el);
            if (parseInt(item.UUID) > parseInt(this.botDB.lastChecked(this.locationPref))) {
                results.push(item);
            }
        });
        return results;
    }

    buildUrl(filter: string = 'male'): string {
        const rentListingCategory = 25;
        const numberOfListings = 30;
        const path = `index.php?page=search&cid=${rentListingCategory}&hw_num=${numberOfListings}&s_res=AND&s_by=hw_added`;
        switch (filter.toLowerCase()) {
            case 'male':
                return this.scraperBaseUrl + path + "&reg1_ex=11&reg2_ex=100";
            case 'villigili':
                return this.scraperBaseUrl + path + "&f_location_ex=Male+--+Villingili";
            case 'hulhumale':
                return this.scraperBaseUrl + path + "&f_location_ex=Male+--+HulhuMale";
            case 'all':
            default:
                return this.scraperBaseUrl + path;
        }
    }

    // TODO : Need to implement scraping other pages
    async getNextPage(): Promise<void> {
        if (!this.$data) await this.initialize();
        const nextPage = this.$data('ul.pagination').find('li.active').next().children('a').attr('href');
        const result = await axios.get(this.scraperBaseUrl + nextPage);
        this.$data = cheerio.load(result.data);
    }

}