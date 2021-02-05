import cheerio from "cheerio";
import * as crypto from "crypto";
import { Element } from 'domhandler';
import { ItemListing } from ".";

export class IbayListing implements ItemListing {

    url: string;
    title: string;
    price: string;
    UUID: string;
    UUIDhash: string;

    constructor(element: Element) {

        let $ = cheerio(element);
        let itemIDregex = /o([0-9]+)\.html/;

        this.url = $.find("h5 > a").attr("href");
        this.url = $.find("h5 > a").attr("href");
        this.title = $.find("h5 > a").text();
        this.price = $.find(".col.s8 > .price").text().trim();
        this.UUID = itemIDregex.exec(this.url)[1];
        this.UUIDhash = crypto.createHash("md5").update(this.url).digest("hex");

    }

    get fullUrl(): string {
        return "https://ibay.com.mv/" + this.url;
    }

}
