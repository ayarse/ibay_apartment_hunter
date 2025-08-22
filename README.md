# iBay Apartment Hunter Bot

🏠 **Automated apartment hunting made easy**

A Telegram bot that monitors [iBay.com.mv](https://ibay.com.mv) for new apartment listings and sends instant notifications to subscribers. Never miss a rental opportunity in the Maldives again!

## ✨ Features

- 🔄 **Automated Scraping**: Continuously monitors iBay for new listings
- 📱 **Telegram Integration**: Instant notifications with listing details
- 🌍 **Location Filtering**: Subscribe to specific areas (Malé, Hulhumalé, Villigilí)
- ⚡ **Real-time Updates**: Get notified as soon as new apartments are posted
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose

🤖 **Try the live bot**: [@ibay_apartment_hunter_bot](https://t.me/ibay_apartment_hunter_bot)

## Stack

- TypeScript
- PostgreSQL
- [Crawlee](https://crawlee.dev/) (for web scraping)
- [tsx](https://github.com/esbuild-kit/tsx) (TypeScript execution)
- [PNPM](https://pnpm.io/) v10.x
- [Drizzle ORM](https://orm.drizzle.team/)
- [grammY](https://grammy.dev/) (Telegram bot framework)
- Docker

## Installation

```bash
# Install dependencies
pnpm install

# Run Drizzle Migrations
pnpm drizzle:push
```

## Environment Variables

| Variable         | Type    | Required | Description                                                                   |
| ---------------- | ------- | -------- | ----------------------------------------------------------------------------- |
| `TELEGRAM_TOKEN` | string  | ✅       | Telegram bot token from @BotFather                                            |
| `SENTRY_DSN`     | string  | ✅       | [Sentry](https://sentry.io/) DSN for error tracking                           |
| `DATABASE_URL`   | string  | ✅       | PostgreSQL connection string (e.g., `postgresql://user:pass@host:port/db`)    |
| `IBAY_BASE_URL`  | string  | ✅       | Base URL for iBay scraping                                                    |
| `DEBUG`          | boolean | ⚪       | Enable debug mode (suppresses notifications to subscribers) - default: `true` |
| `DEBUG_USER`     | string  | ⚪       | Telegram user ID for admin notifications                                      |
| `TIME_INTERVAL`  | number  | ⚪       | Scraper run interval in minutes - default: `10`                               |

### Example .env file

```bash
# Required
TELEGRAM_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ_example
SENTRY_DSN=https://your-key@sentry.io/project-id
DATABASE_URL=postgresql://user:password@localhost:5432/ibay_apartment_hunter
IBAY_BASE_URL=https://ibay.com.mv

# Optional
DEBUG=true
DEBUG_USER=123456789
TIME_INTERVAL=10
```

## Usage

### Development

```bash
# Start development server with hot reload
pnpm dev

# Start production server
pnpm start
```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t ibay-apartment-hunter .
docker run --env-file .env ibay-apartment-hunter
```

## Architecture

### Event System

The bot uses a custom `QueuedEventEmitter` that extends Node.js EventEmitter to add configurable delays between events (default: 1 second). This is to get around rate limits for Telegram API.

### Scraping

Uses [Crawlee](https://crawlee.dev/) for robust web scraping with automatic retries, request rotation, and anti-blocking measures.

### Database

PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations and migrations.
