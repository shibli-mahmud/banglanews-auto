# BanglaBriefing

AI-powered bilingual (Bangla + English) news portal built with Next.js.  
Articles are generated from RSS feeds using Gemini and published as markdown content.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- next-intl
- Google Gemini API (`gemini-2.0-flash`)
- Pexels API
- GitHub Actions + Vercel

## Local Setup

1. Install dependencies:
   - `npm install`
2. Create `.env.local` from `.env.example`.
3. Run local dev server:
   - `npm run dev`

## Key Scripts

- `npm run fetch:news` - pulls RSS and generates bilingual markdown articles.
- `npm run generate:sitemap` - regenerates `public/sitemap.xml`.
- `npm run social:distribute` - optional Telegram/webhook social posting.
- `npm run preflight` - launch readiness checks.
- `npm run verify` - preflight + production build.

## Automation

### Fetch Workflow

`/.github/workflows/fetch-news.yml`

- Runs every hour.
- Pulls up to 5 articles per feed.
- Commits generated articles and sitemap.
- Optional social posting can be enabled with repository variable:
  - `SOCIAL_AUTO_POST_ENABLED=true`

### Build Verification Workflow

`/.github/workflows/verify-build.yml`

- Runs on push and pull requests.
- Installs dependencies, runs preflight, and builds app.

## Required Environment Variables

- `GEMINI_API_KEY`
- `PEXELS_API_KEY`
- `NEXT_PUBLIC_ADSENSE_ID`
- `SITE_URL`

Optional:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `SOCIAL_WEBHOOK_URL`
- `SOCIAL_POST_LIMIT`
- `SOCIAL_POST_WINDOW_HOURS`

## Deployment Checklist

1. Add all required env vars to Vercel.
2. Add GitHub Actions secrets (`GEMINI_API_KEY`, `PEXELS_API_KEY`, optional social keys).
3. Set GitHub Actions variable: `SITE_URL`.
4. (Optional) Enable social distribution with `SOCIAL_AUTO_POST_ENABLED=true`.
5. Verify `robots.txt` and `sitemap.xml` are accessible.
6. Connect domain to Vercel and submit sitemap to Search Console.
