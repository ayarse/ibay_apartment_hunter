# iBay Apartment Hunter Bot

A Telegram bot to notify apartment listings from iBay.com.mv. A live version of
the bot can be (hopefully) found at
[@ibay_apartment_hunter_bot](https://t.me/ibay_apartment_hunter_bot).

I'd initially made this bot for personal use while hunting for an apartment some
time back. It was a quick n' dirty one filer run with cron with pretty much
everything hardcoded. Since then some of my friends have also found this bot
useful so I've cleaned this up quite a bit from it's \*ahem\* somewhat humble
beginnings and decided to make it public.

## Stack

- TypeScript
- PostgreSQL
- Puppeteer
- [tsx](https://github.com/esbuild-kit/tsx)
- [PNPM](https://pnpm.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [grammY](https://grammy.dev/)
- Docker Compose

## Installation

```bash
# Install dependencies
pnpm install

# Run Drizzle Migrations
pnpm migrate
```

| Environment Variable | Type    | Use                                                                                                                             |
| -------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `DEBUG`              | boolean | When `DEBUG` mode is enabled notifications to subscribers are suppressed and the `DEBUG_USER` is sent all the messages instead. |
| `DEBUG_USER`         | string  | A Telegram ID. Think of this as the Admin User                                                                                  |
| `TIMER_INTERVAL`     | number  | The interval at which the scrapers are run, in minutes.                                                                         |
| `SENTRY_DSN`         | string  | [Sentry](https://sentry.io/) for logging errors.                                                                                |
| `DATABASE_URL`       | string  | PostgreSQL Connection String. Try [Supabase](https://supabase.com/).                                                            |
| `TELEGRAM_TOKEN`     | string  | Telegram API Token. Get from @botfather                                                                                         |

```bash
DEBUG=true
DEBUG_USER=12345678
TIMER_INTERVAL=10

SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
DATABASE_URL=postgres://user:password@localhost:5432/apartmentbot_db?sslmode=disable
TELEGRAM_TOKEN=12345678:XXXXXXXXXXXXXXXXXXXXX-XX

# For use during development with Docker Compose
POSTGRES_PASSWORD=user
POSTGRES_USER=password
POSTGRES_DB=apartmentbot_db
POSTGRES_PORT=5432
```

## Usage

```bash
# Start with tsx
npm run start

# Start with Node
npm run start:node
```
