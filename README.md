# 🚀 Star Citizen Free Fly Notifier Bot

A simple Node.js bot that periodically scrapes [CitizenFreeFly](https://www.citizenfreefly.com/star-citizen-free-fly-events/) for Star Citizen Free Fly events and sends alerts to a Discord channel via webhook.

## How It Works

1. Fetches the HTML from CitizenFreeFly
2. Parses it with **Cheerio** to look for Free Fly event announcements
3. If a new event is detected, sends a notification to Discord
4. Repeats on a schedule using **node-cron** (every 3 days)

## Tech Used

| Package | Purpose |
|---|---|
| [cheerio](https://www.npmjs.com/package/cheerio) | HTML parsing & scraping |
| [node-cron](https://www.npmjs.com/package/node-cron) | Scheduling periodic checks |
| [dotenv](https://www.npmjs.com/package/dotenv) | Loading secrets from `.env` |

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/NguyenLamKhang21/simpleNotiBotForSCFreeFly.git
cd simpleNotiBotForSCFreeFly

# 2. Install dependencies
npm install

# 3. Create a .env file with your Discord webhook URL
echo DISCORD_WEBHOOK_URL=your_webhook_url_here > .env

# 4. Run the bot
node index.js
```

## .env Example

```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your/webhook/url
```
