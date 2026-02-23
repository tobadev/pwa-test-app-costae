# PageSpeed Insights Integration Plan

## Overview

Use Google PageSpeed Insights API to score each website in the swipe feed.
Scores are pre-fetched and cached so users never wait.

---

## The Problem

PageSpeed API is slow (~10-30s per URL). With 25 URLs that's ~5-12 minutes
if called sequentially. We can't do this on every page load.

## Solution: Pre-fetch + Cache

Run a script (cron, GitHub Action, or build step) that:
1. Calls PageSpeed API for each URL
2. Saves scores to a JSON file
3. The app reads from that JSON — instant load, zero wait

---

## PageSpeed API Basics

### Endpoint

```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
```

### Parameters

| Param      | Value                                              |
|------------|-----------------------------------------------------|
| `url`      | The URL to analyze                                  |
| `category` | `performance`, `accessibility`, `seo`, `best-practices` |
| `strategy` | `mobile` or `desktop`                               |
| `key`      | Optional. Without a key: ~1 req/sec. With key: ~25 req/sec |

### Example Request

```
https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://github.com&strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices
```

### Response (relevant fields)

```json
{
  "lighthouseResult": {
    "categories": {
      "performance": { "score": 0.85 },
      "accessibility": { "score": 0.92 },
      "seo": { "score": 0.90 },
      "best-practices": { "score": 0.95 }
    }
  }
}
```

Scores are 0-1 (multiply by 100 for display).

### Rate Limits

- **No API key**: ~1 request per second, 25,000/day (enough for our use)
- **With API key**: ~25 requests per second (get one free at https://console.cloud.google.com)

---

## Implementation

### 1. The Fetch Script

Create `scripts/fetch-scores.mjs`:

```js
import { writeFileSync } from "fs";

const URLS = [
  "https://github.com",
  "https://stackoverflow.com",
  "https://reddit.com",
  "https://wikipedia.org",
  "https://dribbble.com",
  "https://codepen.io",
  "https://medium.com",
  "https://spotify.com",
  "https://twitch.tv",
  "https://figma.com",
  "https://notion.so",
  "https://vercel.com",
  "https://netflix.com",
  "https://producthunt.com",
  "https://discord.com",
  "https://airbnb.com",
  "https://behance.net",
  "https://unsplash.com",
  "https://dev.to",
  "https://linear.app",
  "https://stripe.com",
  "https://openai.com",
  "https://tailwindcss.com",
  "https://nextjs.org",
  "https://youtube.com",
];

const API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CATEGORIES = ["performance", "accessibility", "seo", "best-practices"];

// Optional: add ?key=YOUR_KEY for higher rate limits
function buildUrl(target) {
  const params = new URLSearchParams({ url: target, strategy: "mobile" });
  CATEGORIES.forEach((c) => params.append("category", c));
  return `${API}?${params}`;
}

async function fetchScore(url) {
  console.log(`Fetching: ${url}`);
  const res = await fetch(buildUrl(url));

  if (!res.ok) {
    console.error(`  Failed: ${res.status} ${res.statusText}`);
    return { url, error: true, scores: null };
  }

  const data = await res.json();
  const cats = data.lighthouseResult.categories;

  const scores = {
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    seo: Math.round(cats.seo.score * 100),
    bestPractices: Math.round(cats["best-practices"].score * 100),
  };

  // Overall = average of all 4
  scores.overall = Math.round(
    (scores.performance + scores.accessibility + scores.seo + scores.bestPractices) / 4
  );

  console.log(`  Done: ${JSON.stringify(scores)}`);
  return { url, error: false, scores, fetchedAt: new Date().toISOString() };
}

async function main() {
  const results = {};

  // Sequential to respect rate limits (1 req/sec without API key)
  for (const url of URLS) {
    results[url] = await fetchScore(url);

    // Wait 2s between requests (safe for no-key usage)
    await new Promise((r) => setTimeout(r, 2000));
  }

  writeFileSync(
    "public/pagespeed-scores.json",
    JSON.stringify(results, null, 2)
  );

  console.log("\nSaved to public/pagespeed-scores.json");
}

main();
```

### Run it

```bash
node scripts/fetch-scores.mjs
```

Takes ~1 minute for 25 URLs. Output goes to `public/pagespeed-scores.json`.

---

### 2. Output Format

`public/pagespeed-scores.json`:

```json
{
  "https://github.com": {
    "url": "https://github.com",
    "error": false,
    "scores": {
      "performance": 72,
      "accessibility": 85,
      "seo": 90,
      "bestPractices": 95,
      "overall": 85
    },
    "fetchedAt": "2026-02-23T12:00:00.000Z"
  },
  "https://reddit.com": {
    ...
  }
}
```

---

### 3. Use in the App

In `SwipeCard.tsx`, fetch the cached scores:

```tsx
const [scores, setScores] = useState<Record<string, any>>({});

useEffect(() => {
  fetch("/pagespeed-scores.json")
    .then((r) => r.json())
    .then(setScores)
    .catch(() => {}); // silently fail if no scores yet
}, []);

// Get score for current card
const cardScore = scores[card.url]?.scores;
```

Display on the card:

```tsx
{cardScore && (
  <div className="score-badge">
    <span className="score-number">{cardScore.overall}</span>
    <span className="score-label">/ 100</span>
  </div>
)}
```

---

### 4. Automate with Cron

#### Option A: GitHub Actions (recommended, free)

Create `.github/workflows/pagespeed.yml`:

```yaml
name: Update PageSpeed Scores

on:
  schedule:
    # Run daily at 3am UTC
    - cron: "0 3 * * *"
  workflow_dispatch: # allow manual trigger

jobs:
  fetch-scores:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Fetch PageSpeed scores
        run: node scripts/fetch-scores.mjs

      - name: Commit updated scores
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/pagespeed-scores.json
          git diff --staged --quiet || git commit -m "Update PageSpeed scores"
          git push
```

This runs daily, fetches fresh scores, commits the JSON, and pushes.
Free on public repos, 2000 mins/month on private repos.

#### Option B: System Cron (on your server)

```bash
# Edit crontab
crontab -e

# Run daily at 3am
0 3 * * * cd /path/to/my-nextjs-pwa && node scripts/fetch-scores.mjs
```

#### Option C: Vercel Cron (if deployed on Vercel)

Create an API route `app/api/update-scores/route.ts` and configure
in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/update-scores",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Note: Vercel cron requires the scores to be stored in a database or
KV store (not a file), since Vercel deployments are immutable.

---

### 5. Score Color Coding

Use these ranges for display colors:

| Score   | Color  | Label     |
|---------|--------|-----------|
| 90-100  | Green  | Good      |
| 50-89   | Orange | Needs Work|
| 0-49    | Red    | Poor      |

```css
.score-good    { color: #22c55e; }  /* 90+ */
.score-average { color: #f59e0b; }  /* 50-89 */
.score-poor    { color: #ef4444; }  /* 0-49 */
```

---

## Summary

| Step                | What                                   | When               |
|---------------------|----------------------------------------|---------------------|
| `fetch-scores.mjs`  | Calls PageSpeed API, saves JSON        | Cron / manual       |
| `pagespeed-scores.json` | Cached scores in `/public`         | Static asset        |
| `SwipeCard.tsx`      | Reads JSON, displays scores on cards   | Every page load     |
| GitHub Action / Cron | Keeps scores fresh                     | Daily at 3am        |

**User experience**: Cards load instantly with screenshots. Scores are
already there from the cached JSON. Zero waiting. Scores update daily
in the background.
