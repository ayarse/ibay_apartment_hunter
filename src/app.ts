import { Context as TelegrafContext, Telegraf } from "telegraf";
import { BotDB } from "./lib/BotDB";
import { IbayScraper } from "./lib/IbayScraper";
import { MenuTemplate, MenuMiddleware } from "telegraf-inline-menu";
import { IbayListing } from "./lib/IbayListing";
import * as Sentry from "@sentry/node";
import { Console } from "console";

require("dotenv").config();

Sentry.init({
    dsn: process.env.SENTRY_DSN
});

declare global {
    var debugMode: boolean;
    var debugUser: string;
}

globalThis.debugMode = process.env.DEBUG == "TRUE" ? true : false;
globalThis.debugUser = process.env.DEBUG_USER;

const botDB = BotDB.getInstance();
const tg = new Telegraf(process.env.TELEGRAM_TOKEN);

/**
 * Scrapers
 */

const notifyUsers = function (locationPref: string, listings: IbayListing[]) {
    const users = botDB.getUsersByPref(locationPref);
    users.forEach((user, _index) => {
        if (globalThis.debugMode && user.tg_id !== parseInt(globalThis.debugUser)) return;
        listings.forEach((listing, _i) => {
            tg.telegram.sendMessage(user.tg_id, listing.fullUrl)
                .catch((err) => {
                    if (err.response.error_code == 403 && err.description == "Forbidden: bot was blocked by the user") {
                        botDB.removeSubscriber(user.tg_id);
                        console.log(`User ${user.tg_id} has blocked bot. Removed from db.`)
                    }
                });
        });
    });
};

const scrapers = [
    new IbayScraper('all'),
    new IbayScraper('male'),
    new IbayScraper('hulhumale'),
    new IbayScraper('villigili')
];

let scraperIndex = 0;

const _botUpdateTimer = setInterval(() => {
    const scraper = scrapers[scraperIndex];
    scraper.getResults().then((results) => {
        console.log(`Scraper[${scraper.locationPref}] : sending ${results.length} listings...`);
        notifyUsers(scraper.locationPref, results);
    });
    scraperIndex = (scraperIndex + 1) % scrapers.length;
}, parseInt(process.env.TIMER_INTERVAL)).unref();

/**
 * Bot Commands and Menus
 */

type MyContext = TelegrafContext & { match: RegExpExecArray | undefined }
const menuTemplate = new MenuTemplate<MyContext>(_ctx => `Select your preferred location`)

menuTemplate.choose('location', ['All', 'Male', 'Hulhumale', 'Villigili'], {
    columns: 2,
    do: async (ctx, key) => {
        if (!botDB.hasSubscriber(ctx.chat.id.toString())) {
            ctx.replyWithMarkdown(`Hey you're not subscribed right now. You need to run the \`/start\` command again`);
            return false;
        }
        if (botDB.updateUserPref(ctx.chat.id.toString(), key.toLowerCase())) {
            ctx.answerCbQuery(`Ok! Location is set to ${key}. Let's get this party started!`)
        } else {
            ctx.answerCbQuery(`Hmmm... something has gone wrong 🤔`)
        }
        await ctx.deleteMessage();
        return false;
    }
})

const menuMiddleware = new MenuMiddleware('/', menuTemplate);
tg.use(menuMiddleware);

tg.command('location', ctx => menuMiddleware.replyToContext(ctx));

tg.command('start', async (ctx) => {
    const chat_id = ctx.chat.id.toString();
    if (botDB.hasSubscriber(chat_id)) {
        ctx.reply(`Ok I'll keep you posted!`)
    } else {
        botDB.addSubscriber(chat_id);
        await ctx.replyWithMarkdown(`
        Hey ${ctx.from.first_name}, thanks for subscribing. I'll keep sending you new apartment listings as I find them 😀

        *Commands:*
        /start - Subscribe to updates
        /stop - Unsubscribe from updates
        /location - Change your preferred location
        `)
        menuMiddleware.replyToContext(ctx);
    }
});

tg.command('stop', (ctx) => {
    const chat_id = ctx.chat.id.toString();
    if (botDB.hasSubscriber(chat_id)) {
        botDB.removeSubscriber(chat_id);
        ctx.reply(`Okay... I've unsubscribed you... 😔`)
    } else {
        ctx.reply(`You're not subscribed to my updates yet`)
    }
});

tg.command('usercount', (ctx) => {
    if (ctx.chat.id.toString() == globalThis.debugUser) {
        ctx.reply(botDB.countUsers());
    } else {
        ctx.reply(`Heh... heh... 🤓`);
    }
});

/**
 * Start Bot Process
 */

tg.launch();

tg.catch((err, _ctx) => {
    Sentry.captureException(err, {
        tags: {
            type: 'bot'
        }
    })
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    Sentry.captureException(err, {
        tags: {
            type: 'process'
        },
    });
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    Sentry.captureException(err, {
        tags: {
            type: 'process'
        },
    });
    process.exit(1);
});

process.once('SIGINT', () => tg.stop('SIGINT'))
process.once('SIGTERM', () => tg.stop('SIGTERM'))
