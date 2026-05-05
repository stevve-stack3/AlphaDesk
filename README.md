# ◈ AlphaDesk — Smart Money Copy Terminal for Solana

**AlphaDesk** is a real-time smart money discovery and copy-trading intelligence terminal for Solana. It automatically finds the highest-performing wallets on-chain, ranks them by a proprietary AlphaScore, surfaces their current positions, and fires **Conviction Signals** when multiple smart wallets converge on the same token.

Most copy-trading tools require you to already know the wallet address. **AlphaDesk solves the discovery problem.**

![Dark Terminal UI](https://img.shields.io/badge/UI-Dark%20Terminal-0E0E1A?style=flat-square&labelColor=080810&color=00D4A8) ![React](https://img.shields.io/badge/React-19-63B3ED?style=flat-square&logo=react&logoColor=white) ![Solana](https://img.shields.io/badge/Chain-Solana-B794F4?style=flat-square&logo=solana&logoColor=white) ![Birdeye API](https://img.shields.io/badge/Data-Birdeye%20API-F6AD55?style=flat-square)

---

## What It Does

| Step | Action |
|------|--------|
| **1. Discover** | Scans the top 10 trending Solana tokens by 24h volume |
| **2. Extract** | Pulls the top 10 traders for each token — building a smart wallet candidate pool |
| **3. Enrich** | Fetches each wallet's current portfolio, token security data, and price history |
| **4. Rank** | Computes an **AlphaScore (0–100)** based on coverage, recency, and portfolio diversity |
| **5. Signal** | Fires a **Conviction Signal** when 3+ top wallets hold the same token simultaneously |

---

## Features

- **Wallet Leaderboard** — Top 10 smart wallets ranked by AlphaScore with tier badges (ELITE / SMART / ACTIVE)
- **Conviction Signals** — Real-time detection when multiple smart wallets converge on a token (EXTREME / HIGH / MODERATE)
- **Wallet Drill-Down** — Click any wallet to see full portfolio, positions with sparklines, and recent trades
- **Live Trade Feed** — Chronological stream of buys/sells across all tracked wallets
- **Signal Detail View** — Expanded breakdown per signal with wallet grid, large sparkline, and security assessment
- **Birdeye API Integration** — Full 7-step data pipeline with progress indicators and rate limiting
- **Demo Mode** — Ships with realistic mock data so the UI is fully interactive without an API key
- **Dark Terminal Aesthetic** — Professional trading desk UI with JetBrains Mono, DM Sans, and a curated dark palette

---

## AlphaScore Algorithm

Each wallet is scored from 0–100 based on:

| Factor | Weight | Logic |
|--------|--------|-------|
| **Coverage** | 40 pts | How many of the 10 trending tokens is this wallet a top trader on? |
| **Recency** | 30 pts | Traded in last 6h = 30pts, last 24h = 15pts, older = 0 |
| **Diversity** | 20 pts | Holding 3–15 tokens = 20pts (healthy portfolio range) |
| **Elite Bonus** | 10 pts | Appears in 5+ trending tokens |

**Tiers:** ELITE (80+) · SMART (50–79) · ACTIVE (< 50)

---

## Conviction Signals

A signal fires when **3 or more** top-10 wallets currently hold the same token:

| Level | Threshold | Meaning |
|-------|-----------|---------|
| 🟢 **EXTREME** | 7+ wallets | Massive smart money convergence |
| 🟡 **HIGH** | 5–6 wallets | Strong conviction across wallets |
| 🔵 **MODERATE** | 3–4 wallets | Notable overlap worth watching |

---

## Tech Stack

- **Single-file React app** — Everything lives in `src/App.jsx` (~1200 lines)
- **Vite** — Build tooling and dev server
- **Birdeye API** — On-chain data (trending tokens, top traders, wallet portfolios, token security, price history)
- **Inline SVG Sparklines** — Pure React, no charting library
- **CSS-in-JS** — Full stylesheet injected via `<style>` tag, CSS custom properties throughout

---

## Quick Start

```bash
# Clone
git clone https://github.com/Savage3-stack/AlphaDesk.git
cd AlphaDesk

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app loads with **demo data** immediately — no API key needed to explore the UI.

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import the repo
3. Add environment variable: `BIRDEYE_API_KEY` = your Birdeye API key
4. Click Deploy — Vercel auto-detects Vite + the serverless function
5. Users can now use the app without their own API key

The `/api/birdeye` serverless function proxies all Birdeye API requests server-side, keeping your API key secure. Users can optionally enter their own key to bypass the proxy.

### Live Data Mode

1. Get a free API key from [Birdeye](https://birdeye.so)
2. Paste it into the API key field in the header
3. Click **⟳ Refresh**
4. Watch the 7-step loading sequence discover wallets in real time

---

## Project Structure

```
AlphaDesk/
├── api/
│   └── birdeye.js      # Vercel serverless proxy for Birdeye API
├── index.html          # Entry point with custom favicon
├── src/
│   ├── main.jsx        # React mount (9 lines)
│   └── App.jsx         # Entire application (single file)
├── package.json
├── vercel.json         # Vercel rewrites config
├── vite.config.js
└── .gitignore
```

---

## API Endpoints Used

All requests hit `https://public-api.birdeye.so/` with `X-API-KEY` and `x-chain: solana` headers.

| Endpoint | Purpose |
|----------|---------|
| `GET /defi/tokenlist` | Trending tokens by 24h volume |
| `GET /defi/v2/tokens/top_traders` | Top traders per token |
| `GET /v1/wallet/token_list` | Wallet portfolio positions |
| `GET /defi/token_overview` | Token price, market cap, 24h change |
| `GET /defi/token_security` | Freeze authority, mint authority, honeypot risk |
| `GET /defi/history_price` | 24h OHLCV for sparkline charts |

Rate limiting: 200ms delay between sequential wallet enrichment calls.

---

## License

MIT
