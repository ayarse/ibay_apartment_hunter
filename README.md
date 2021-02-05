# iBay Apartment Hunter Bot

A Telegram bot to notify apartment listings from iBay.com.mv. A live version of the bot can be (hopefully) found at [@ibay_apartment_hunter_bot](https://t.me/ibay_apartment_hunter_bot).

I made this bot first as just a quick n' dirty one file-r being run as a cron with pretty much everything hardcoded, for my own use while I was looking for an apartment some time back. Since then some of my friends have also found this bot useful so I've cleaned this up quite a bit from it's \*ahem\* somewhat humble beginnings and decided to make it public.

It's written in Typescript using the [Telegraf](https://github.com/telegraf/telegraf/) framework, [cheerio](https://github.com/cheeriojs/cheerio) for scraping, and [better-sqlite3](https://github.com/JoshuaWise/better-sqlite3/) with Sentry for error tracking. I've only tested on ts-node.

## Installation

```bash
npm install
```

You'll need to add your own configuration in a .env file as shown in [.env.example](.env.example).

```
DEBUG=
DEBUG_USER=
DEBUG_LAST_CHECKED=
SENTRY_DSN=
TELEGRAM_TOKEN=
TIMER_INTERVAL=
```



## Usage

```bash
# Running the bot
npm run start

# Or for plain ol' Node
npm run start:node
```

## Contributing
Contributions are welcome and I'm not so good at TS so feel free to throw in some pointers. 😅
