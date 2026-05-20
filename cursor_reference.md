# 📰 BanglaNews Auto — Cursor AI Reference Document
> Full project blueprint for AI-powered bilingual (Bangla + English) news portal with automated content pipeline.

---

## 🧠 Project Overview

**Project Name:** BanglaNews Auto (you can rename)
**Purpose:** A bilingual (Bangla + English) news portal covering Bangladeshi and international hot topics. News is automatically collected, rewritten by AI, and published. Revenue comes from Google AdSense ads.

**Core Features:**
- Bilingual: Bangla (বাংলা) and English — auto-detect by device/browser language
- Auto news collection via RSS feeds every 4 hours
- AI rewrites articles using Gemini API (free)
- Auto-fetches images from Pexels API (free)
- AdSense ad placements built into layout
- Full SEO: meta tags, sitemap, structured data, Open Graph
- Deployed free on Vercel
- Automation runs free on GitHub Actions

---

## 🗂️ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Framework | Next.js 14 (App Router) | Free |
| Styling | Tailwind CSS | Free |
| Content Storage | Markdown files in /content folder | Free |
| Automation | GitHub Actions | Free |
| Hosting | Vercel | Free |
| AI Rewriting | Google Gemini API (gemini-1.5-flash) | Free tier |
| Images | Pexels API | Free |
| RSS Parsing | rss-parser npm package | Free |
| i18n (bilingual) | next-intl | Free |

---

## 📁 Project Folder Structure

```
banglanews-auto/
├── .github/
│   └── workflows/
│       └── fetch-news.yml          ← GitHub Actions automation
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                ← Homepage
│   │   └── news/
│   │       └── [slug]/
│   │           └── page.tsx        ← Article detail page
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── NewsCard.tsx
│   ├── AdBanner.tsx                ← AdSense ad component
│   ├── LanguageSwitcher.tsx
│   └── ArticleBody.tsx
├── content/
│   ├── en/                         ← English articles (auto-generated)
│   └── bn/                         ← Bangla articles (auto-generated)
├── messages/
│   ├── en.json                     ← UI strings in English
│   └── bn.json                     ← UI strings in Bangla
├── scripts/
│   └── fetch-and-generate.js       ← Main automation script
├── public/
│   └── sitemap.xml                 ← Auto-generated sitemap
├── middleware.ts                   ← Language detection middleware
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔧 Environment Variables

Create a `.env.local` file in your project root with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here
GITHUB_TOKEN=your_github_personal_access_token
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

For GitHub Actions, add the same variables as **Repository Secrets** in GitHub Settings.

---

## 📡 RSS Feed Sources

Use these RSS feeds as news sources in the automation script:

```javascript
const RSS_FEEDS = [
  // International
  "https://feeds.bbci.co.uk/news/rss.xml",
  "https://feeds.reuters.com/reuters/topNews",
  "https://rss.cnn.com/rss/edition.rss",
  
  // Bangladesh specific
  "https://www.thedailystar.net/rss.xml",
  "https://www.prothomalo.com/feed",
  "https://bdnews24.com/feed/",
  "https://www.dhakatribune.com/feed",
];
```

---

## 🤖 Automation Script Logic (`scripts/fetch-and-generate.js`)

```
1. Loop through each RSS feed
2. Parse and get latest 3 articles from each feed
3. For each article:
   a. Check if already exists in /content folder (skip if yes)
   b. Fetch a relevant image from Pexels API using article keywords
   c. Send headline + summary to Gemini API
   d. Ask Gemini to rewrite as full article in BOTH English and Bangla
   e. Save English version to /content/en/[slug].md
   f. Save Bangla version to /content/bn/[slug].md
4. Commit new .md files to GitHub repo
5. Vercel auto-deploys on new commit
```

### Gemini Prompt Template for Article Rewriting:

```
You are a professional news journalist. Based on the following news headline and summary, write a complete, original news article.

Headline: {headline}
Summary: {summary}
Category: {category}

Write the article in TWO versions:
1. English version (400-600 words, professional journalistic tone)
2. Bangla version (বাংলা) (400-600 words, same content in Bangla)

Return ONLY a valid JSON object, no markdown, no backticks:
{
  "en": {
    "title": "English title here",
    "excerpt": "Short 2-sentence summary",
    "body": "Full article body in English...",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "category name"
  },
  "bn": {
    "title": "Bangla title here",
    "excerpt": "Short Bangla summary",
    "body": "Full article body in Bangla...",
    "tags": ["ট্যাগ১", "ট্যাগ২"],
    "category": "বিভাগ"
  }
}
```

### Markdown File Format for Articles:

```markdown
---
title: "Article Title Here"
date: "2025-01-15T10:30:00Z"
slug: "article-slug-here"
category: "International"
tags: ["politics", "bangladesh", "news"]
image: "https://images.pexels.com/photos/XXXXX/pexels-photo-XXXXX.jpeg"
imageAlt: "Image description"
excerpt: "Short 2 sentence summary of the article."
locale: "en"
---

Full article body content goes here...
```

---

## 🌍 Bilingual (i18n) Setup

Use `next-intl` for language routing:

- URL structure:
  - `/en/` → English site
  - `/bn/` → Bangla site
- Default language: auto-detect from browser's `Accept-Language` header
- Language switcher in header for manual override
- Store language preference in localStorage

### middleware.ts logic:
```
1. Check if URL already has /en or /bn prefix
2. If not, read Accept-Language header
3. If header contains 'bn', redirect to /bn/...
4. Otherwise redirect to /en/...
```

---

## 📢 AdSense Ad Placement Strategy

Place ads in these locations for maximum revenue:

1. **Header Banner** — 728x90 leaderboard (below navigation)
2. **In-Article Ad** — 336x280 rectangle (after 3rd paragraph)
3. **Sidebar Ad** — 300x250 medium rectangle (desktop only)
4. **Between News Cards** — 320x100 banner (after every 4 cards on homepage)
5. **Footer Banner** — 728x90 leaderboard (above footer)

### AdBanner Component:
```jsx
// components/AdBanner.tsx
// Takes adSlot and adFormat as props
// Uses next/script to load AdSense
// Shows placeholder div during development
// In production, renders real AdSense unit
```

---

## 🔍 SEO Configuration

### For every article page, include:
```html
<title>{article.title} | BanglaNews</title>
<meta name="description" content="{article.excerpt}" />
<meta name="keywords" content="{article.tags.join(', ')}" />

<!-- Open Graph (for Facebook/WhatsApp sharing) -->
<meta property="og:title" content="{article.title}" />
<meta property="og:description" content="{article.excerpt}" />
<meta property="og:image" content="{article.image}" />
<meta property="og:type" content="article" />
<meta property="og:locale" content="bn_BD" /> <!-- or en_US -->

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{article.title}" />
<meta name="twitter:image" content="{article.image}" />

<!-- Article structured data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "{article.title}",
  "datePublished": "{article.date}",
  "image": "{article.image}",
  "author": { "@type": "Organization", "name": "BanglaNews" }
}
</script>
```

### Sitemap:
- Auto-generate `/public/sitemap.xml` listing all article URLs
- Include `<lastmod>`, `<changefreq>`, `<priority>`
- Submit to Google Search Console and Bing Webmaster Tools

### robots.txt:
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

---

## ⚙️ GitHub Actions Workflow (`.github/workflows/fetch-news.yml`)

```yaml
name: Fetch and Generate News

on:
  schedule:
    - cron: '0 */4 * * *'   # Runs every 4 hours
  workflow_dispatch:          # Also allows manual trigger

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      - name: Run news fetcher
        run: node scripts/fetch-and-generate.js
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          PEXELS_API_KEY: ${{ secrets.PEXELS_API_KEY }}
      
      - name: Commit new articles
        run: |
          git config user.name "NewsBot"
          git config user.email "bot@banglanews.com"
          git add content/
          git diff --staged --quiet || git commit -m "Auto: Add new articles $(date)"
          git push
```

---

## 🎨 Homepage Layout Design

```
[HEADER - Logo + Navigation + Language Switcher]
[AD BANNER - 728x90]

[HERO SECTION - Top 3 featured news cards, large images]

[AD BANNER - Between sections]

[MAIN GRID]
  Left Column (70%):
    - News cards in 2-column grid
    - [AD] after every 4 cards
    - Category filters (All, Bangladesh, International, Politics, Sports, Tech)
  
  Right Sidebar (30%):
    - [AD 300x250]
    - Trending articles list
    - [AD 300x250]

[FOOTER - About | Contact | Privacy Policy | Terms]
[AD BANNER - 728x90]
```

---

## 📊 Traffic Generation Strategy

### Free traffic sources in order of priority:

1. **Google Search (SEO)** — Primary long-term source
   - Fresh news = Google News eligibility
   - Apply to Google News at: news.google.com/publisher/
   - Target Bengali keywords with low competition

2. **Facebook** — Biggest traffic source for Bangladeshi news
   - Create a Facebook Page for your news site
   - Share every article automatically using Facebook Graph API
   - Join Bangladeshi news/discussion groups and share relevant articles

3. **WhatsApp** — Viral sharing in Bangladesh
   - Add WhatsApp share button on every article
   - Create a WhatsApp Channel for your news portal

4. **YouTube** — Create short video summaries of top news
   - Use AI to convert articles to video scripts
   - Use text-to-video tools (free tier)

5. **Twitter/X** — Auto-post article headlines with links
   - Use Twitter API (free tier) in GitHub Actions

6. **Telegram** — Create a Telegram channel
   - Auto-post articles via Telegram Bot API (completely free)

7. **Reddit** — Post in r/bangladesh, r/worldnews etc.

8. **Google Discover** — Comes naturally with good SEO + images

---

## 🔑 Gemini API Setup (Free — Step by Step)

### Step 1: Get Your Free API Key
1. Go to **https://aistudio.google.com**
2. Sign in with your Google account
3. Click **"Get API Key"** in the top left
4. Click **"Create API key"**
5. Select **"Create API key in new project"**
6. Copy the generated API key — looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Step 2: Free Tier Limits (as of 2025)
| Model | Free RPM | Free TPM | Free RPD |
|---|---|---|---|
| gemini-1.5-flash | 15 req/min | 1M tokens/min | 1500 req/day |
| gemini-1.5-pro | 2 req/min | 32K tokens/min | 50 req/day |

**Use `gemini-1.5-flash`** — it's fast, free, and perfect for article rewriting.
At 1500 requests/day, you can generate **up to 1500 articles per day for free.**

### Step 3: How the Script Calls Gemini API

```javascript
// In scripts/fetch-and-generate.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function rewriteArticle(headline, summary, category) {
  const prompt = `
You are a professional news journalist. Based on the following news headline and summary, write a complete original news article.

Headline: ${headline}
Summary: ${summary}
Category: ${category}

Write the article in TWO versions:
1. English version (400-600 words, professional journalistic tone)
2. Bangla version (400-600 words, same content in Bangla)

Return ONLY a valid JSON object, no markdown, no backticks, no explanation:
{
  "en": {
    "title": "English title",
    "excerpt": "2-sentence English summary",
    "body": "Full English article body...",
    "tags": ["tag1", "tag2", "tag3"],
    "category": "category"
  },
  "bn": {
    "title": "বাংলা শিরোনাম",
    "excerpt": "সংক্ষিপ্ত বাংলা সারসংক্ষেপ",
    "body": "পূর্ণ বাংলা নিবন্ধ...",
    "tags": ["ট্যাগ১", "ট্যাগ২"],
    "category": "বিভাগ"
  }
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Clean response and parse JSON
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
```

### Step 4: Install Gemini SDK

Add this to your `package.json` dependencies:
```json
"@google/generative-ai": "^0.21.0"
```

Or tell Cursor to run: `npm install @google/generative-ai`

### Step 5: Add API Key to GitHub Secrets
1. Go to your GitHub repo
2. Click **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `GEMINI_API_KEY`
5. Value: paste your API key
6. Click **"Add secret"**

### Step 6: Add API Key to Vercel
1. Go to **vercel.com** → your project
2. Click **Settings → Environment Variables**
3. Add: `GEMINI_API_KEY` = your key
4. Click **Save**

### Rate Limiting in Script
Add a delay between API calls to stay within free limits:
```javascript
// Add between each article generation call
await new Promise(resolve => setTimeout(resolve, 4000)); // 4 second delay
// This keeps you well under 15 requests/minute limit
```

---

## ✅ Checklist Before Going Live

- [ ] All environment variables set in Vercel dashboard
- [ ] All secrets added to GitHub repository secrets
- [ ] Privacy Policy page created (required for AdSense)
- [ ] About Us page created
- [ ] Contact page created
- [ ] Google Search Console verified
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt accessible