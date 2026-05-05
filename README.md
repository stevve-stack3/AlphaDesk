# AlphaDesk — Smart Money Intelligence Terminal for Solana

AlphaDesk discovers high-performing wallets on-chain, ranks them by AlphaScore, and surfaces Conviction Signals when multiple smart wallets converge on the same token.

## Modes

| Mode | Description |
|------|-------------|
| **Demo** | Deterministic sample data, no API key needed. Clearly labeled in the UI. |
| **Live via Proxy** | Uses the Vercel serverless proxy with a server-side Birdeye key. Requires `BIRDEYE_API_KEY` env var on Vercel. |
| **Live via User Key** | User pastes their own Birdeye API key in the header. Requests go directly to Birdeye from the browser. |

The mode toggle is in the header. Switching to Demo never silently uses live data. If Live fails, the UI shows an error with options to retry or fall back to demo data.

## Data Pipeline

In Live mode, the app runs a multi-step pipeline:

1. Fetch top 10 trending Solana tokens by 24h volume (`/defi/tokenlist`)
2. Pull top 10 traders per token (`/defi/v2/tokens/top_traders`)
3. Discover unique wallets across all tokens
4. Enrich each wallet portfolio (`/v1/wallet/token_list`)
5. Fetch price data and sparklines (`/defi/token_overview`, `/defi/history_price`)
6. Run token security checks (`/defi/token_security`)
7. Compute AlphaScores with per-factor breakdowns
8. Derive conviction signals and activity feed

The activity feed is derived from top trader data, not fabricated trades. Each entry is labeled with its source and quality.

## AlphaScore

A heuristic metric (0–100) composed of:

| Factor | Max | Description |
|--------|-----|-------------|
| Coverage | 35 | Trending tokens where this wallet is a top trader |
| Recency | 25 | How recently the wallet was active |
| Diversity | 20 | Portfolio composition (3–15 tokens = optimal) |
| Data Quality | 10 | Adjusted by security risk of held tokens |
| Elite Bonus | 10 | Extra points for 5+ trending token appearances |

Tiers: **ELITE** (80+) · **SMART** (50–79) · **ACTIVE** (< 50)

The UI includes a Score Info button with full methodology explanation and disclaimer.

## Project Structure

```
AlphaDesk/
├── api/
│   └── birdeye.js              # Hardened Vercel serverless proxy
├── src/
│   ├── main.jsx                # Entry point, CSS import
│   ├── App.jsx                 # Composition root, state, mode control
│   ├── styles.css              # All styles (dark theme, responsive)
│   ├── components/
│   │   ├── Header.jsx          # Mode toggle, API key, refresh
│   │   ├── ModeBanner.jsx      # Data source status banner
│   │   ├── SignalsPanel.jsx    # Left sidebar conviction signals
│   │   ├── LeaderboardTab.jsx  # Wallet ranking table
│   │   ├── FeedTab.jsx         # Activity feed (derived, not mock)
│   │   ├── SignalsDetailTab.jsx# Expanded signal view
│   │   ├── WalletDrawer.jsx    # Wallet detail with score breakdown
│   │   ├── AlphaScoreExplainer.jsx # Methodology modal
│   │   ├── Sparkline.jsx       # SVG sparkline chart
│   │   └── LoadingScreen.jsx   # Pipeline progress overlay
│   ├── services/
│   │   ├── birdeye.js          # API client (proxy/direct/demo)
│   │   └── dataPipeline.js     # Full live data pipeline
│   ├── domain/
│   │   ├── scoring.js          # AlphaScore with breakdown
│   │   ├── signals.js          # Conviction signals, feed derivation
│   │   └── normalizers.js      # Defensive Birdeye response parsing
│   ├── data/
│   │   └── demoData.js         # Deterministic demo wallets/signals/feed
│   └── utils/
│       └── formatters.js       # USD, number, time, address formatting
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── vercel.json
```

## API Proxy Security

The serverless proxy (`api/birdeye.js`):

- **Allowlisted paths only**: Only the 6 specific Birdeye endpoints used by the app are permitted
- **Parameter validation**: Query params are checked for length and character safety
- **CORS**: Same-origin by default; set `ALLOWED_ORIGINS` env var for explicit origins (no wildcard)
- **Rate limiting**: In-memory IP-based, 40 requests/minute per IP (best-effort for serverless)
- **Cache headers**: Per-endpoint cache durations (30s–300s with stale-while-revalidate)
- **No secret leakage**: Error responses are structured without internal details

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173` in Demo mode. No API key needed.

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Set environment variable: `BIRDEYE_API_KEY` = your Birdeye API key
4. Optionally set `ALLOWED_ORIGINS` for CORS (comma-separated)
5. Deploy

## License

MIT
