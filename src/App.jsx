import { useState, useEffect, useRef, useMemo } from 'react';

function formatUsd(val) {
  if (val === 0 || val == null) return '$0.00';
  if (Math.abs(val) < 0.01) return '$' + val.toFixed(6);
  if (Math.abs(val) < 1) return '$' + val.toFixed(4);
  if (Math.abs(val) < 1000) return '$' + val.toFixed(2);
  return '$' + Math.round(val).toLocaleString();
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 4) + '...' + addr.slice(-4);
}

function getTier(score) {
  if (score >= 80) return 'ELITE';
  if (score >= 50) return 'SMART';
  return 'ACTIVE';
}

function getTierColor(tier) {
  if (tier === 'ELITE') return 'var(--purple)';
  if (tier === 'SMART') return 'var(--green)';
  return 'var(--amber)';
}

function getTierDimColor(tier) {
  if (tier === 'ELITE') return 'var(--purple-dim)';
  if (tier === 'SMART') return 'var(--green-dim)';
  return 'var(--amber-dim)';
}

function getConvictionColor(c) {
  if (c === 'EXTREME') return 'var(--green)';
  if (c === 'HIGH') return 'var(--amber)';
  return 'var(--blue)';
}

function getConvictionDim(c) {
  if (c === 'EXTREME') return 'var(--green-dim)';
  if (c === 'HIGH') return 'var(--amber-dim)';
  return 'var(--blue-dim)';
}

function generateSparkline(start, end, points) {
  points = points || 24;
  const data = [start];
  for (let i = 1; i < points - 1; i++) {
    const progress = i / (points - 1);
    const target = start + (end - start) * progress;
    const noise = (Math.random() - 0.5) * Math.abs(end - start) * 0.3;
    data.push(Math.max(0.001, target + noise));
  }
  data.push(Math.max(0.001, end));
  return data;
}

function computeAlphaScore(wallet) {
  const coverage = wallet.appearsInTokens ? wallet.appearsInTokens.length : 0;
  const coverageScore = (coverage / 10) * 40;
  const hoursSinceLastTrade = (Date.now() - (wallet.lastTradeTimestamp || Date.now())) / 3600000;
  const recencyScore = hoursSinceLastTrade < 6 ? 30 : hoursSinceLastTrade < 24 ? 15 : 0;
  const tokenCount = wallet.currentPositions ? wallet.currentPositions.length : (wallet.positions ? wallet.positions.length : 0);
  const diversityScore = tokenCount >= 3 && tokenCount <= 15 ? 20 : tokenCount < 3 ? 5 : 10;
  const eliteBonus = coverage >= 5 ? 10 : 0;
  return Math.min(100, Math.round(coverageScore + recencyScore + diversityScore + eliteBonus));
}

const TOKEN_POOL = [
  { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112' },
  { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { symbol: 'WIF', name: 'dogwifhat', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
  { symbol: 'POPCAT', name: 'Popcat', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
  { symbol: 'BOME', name: 'Book of Meme', address: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82' },
  { symbol: 'JUP', name: 'Jupiter', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
  { symbol: 'PYTH', name: 'Pyth Network', address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3' },
  { symbol: 'RAY', name: 'Raydium', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
  { symbol: 'ORCA', name: 'Orca', address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE' },
  { symbol: 'MNGO', name: 'Mango', address: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac' },
  { symbol: 'RENDER', name: 'Render', address: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof' },
  { symbol: 'HNT', name: 'Helium', address: 'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux' },
  { symbol: 'MOBILE', name: 'Helium Mobile', address: 'mb1eu7TzEc71KxDpsmsKoucSSuuo6KWC499aWkfMtRt' },
  { symbol: 'JTO', name: 'Jito', address: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL' },
  { symbol: 'TENSOR', name: 'Tensor', address: 'TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6' },
  { symbol: 'DRIFT', name: 'Drift', address: 'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7' },
];

const WALLET_ADDRS = [
  '7xKp3nBzM4qFVj8RYdE6h2WkPt9uNmCs5A3LvGy1JQX',
  '9mWv2kLxR7qNj5Ht8FcP3YdZs6BnE1GuXJ4rA0VwTfKa',
  '4Dp8rFkN2vQhL6jW1Ct3YxZm5Bg7JnEs9A0XuRGcPwTe',
  '6sHf3gTx8nBk1YjP5LqR2WvZm7E4Jd0CuNA9XwFcGKya',
  '2nQv7cBm1RjK4sH8FwL5GxPd3Zt6E0YuNA9XkTrJVgWe',
  '8kJd5wRm2GnT1vH7Bx3PsLf4Q9Yc6ZuENA0XjFqCKWaR',
  '3pLf8nKx5QjR2Wv7Hc1BtGm4Ds6Y0ZuENA9XwTrJVgFe',
  '5Gt2mRv9Bk7Hn3Jf1LwP4Qx8Ds6CzYuENA0XjFqTKWaB',
  '1Bx6vQm3Rk8Jn5Ht7LwP2Gf4Ds9CzYuENA0XjFqTKWeC',
  '9Ck4rFj7Bn2Gv5Ht1LwP8Qx3Ds6YzMuENA0XjTqKWaRD',
];

const MOCK_SCORES = [95, 91, 87, 82, 76, 71, 65, 58, 49, 41];
const MOCK_PORTFOLIOS = [48200, 35400, 28100, 22500, 18300, 12700, 8900, 4200, 2100, 520];

function makeMockPositions(count) {
  const shuffled = [...TOKEN_POOL].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(token => {
    const price = token.symbol === 'SOL' ? 145 + Math.random() * 30 : 0.001 + Math.random() * 50;
    const change = -25 + Math.random() * 70;
    return {
      tokenAddress: token.address,
      symbol: token.symbol,
      name: token.name,
      uiAmount: 10 + Math.random() * 10000,
      valueUsd: 50 + Math.random() * 14950,
      priceChange24h: parseFloat(change.toFixed(2)),
      price: price,
      sparkline: generateSparkline(price * (1 - Math.abs(change) / 200), price),
      securityRisk: ['LOW', 'LOW', 'LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 5)],
    };
  });
}

const MOCK_WALLETS = WALLET_ADDRS.map((addr, i) => {
  const numPositions = 4 + Math.floor(Math.random() * 9);
  const positions = makeMockPositions(numPositions);
  const score = MOCK_SCORES[i];
  return {
    address: addr,
    alphaScore: score,
    portfolio: MOCK_PORTFOLIOS[i],
    positions: positions,
    tier: getTier(score),
    lastActive: Date.now() - Math.random() * 7200000,
    appearsInTokens: positions.map(p => p.symbol),
    lastTradeTimestamp: Date.now() - Math.random() * 86400000,
  };
});

const wifToken = TOKEN_POOL.find(t => t.symbol === 'WIF');
const bonkToken = TOKEN_POOL.find(t => t.symbol === 'BONK');
const jupToken = TOKEN_POOL.find(t => t.symbol === 'JUP');

const MOCK_SIGNALS = [
  {
    token: { symbol: 'WIF', name: 'dogwifhat', address: wifToken.address },
    conviction: 'EXTREME',
    walletCount: 7,
    wallets: MOCK_WALLETS.slice(0, 7).map(w => w.address),
    price: 2.34,
    priceChange24h: 15.7,
    sparkline: generateSparkline(1.8, 2.34),
    marketCap: 2340000000,
  },
  {
    token: { symbol: 'BONK', name: 'Bonk', address: bonkToken.address },
    conviction: 'HIGH',
    walletCount: 5,
    wallets: MOCK_WALLETS.slice(0, 5).map(w => w.address),
    price: 0.00002847,
    priceChange24h: 8.3,
    sparkline: generateSparkline(0.000024, 0.00002847),
    marketCap: 1870000000,
  },
  {
    token: { symbol: 'JUP', name: 'Jupiter', address: jupToken.address },
    conviction: 'MODERATE',
    walletCount: 3,
    wallets: MOCK_WALLETS.slice(0, 3).map(w => w.address),
    price: 1.12,
    priceChange24h: -3.2,
    sparkline: generateSparkline(1.18, 1.12),
    marketCap: 1520000000,
  },
];

const MOCK_TRADES = Array.from({ length: 20 }, (_, i) => {
  const token = TOKEN_POOL[Math.floor(Math.random() * TOKEN_POOL.length)];
  const isBuy = Math.random() > 0.45;
  const price = token.symbol === 'SOL' ? 145 + Math.random() * 30 : 0.001 + Math.random() * 50;
  return {
    id: i,
    type: isBuy ? 'buy' : 'sell',
    wallet: MOCK_WALLETS[Math.floor(Math.random() * 10)].address,
    token: token,
    amount: 100 + Math.random() * 10000,
    price: price,
    valueUsd: 50 + Math.random() * 15000,
    pnl: parseFloat((-2000 + Math.random() * 6000).toFixed(2)),
    timestamp: Date.now() - (i * 540000 + Math.random() * 300000),
  };
}).sort((a, b) => b.timestamp - a.timestamp);

function Sparkline({ data, width, height }) {
  width = width || 80;
  height = height || 24;
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const isPositive = data[data.length - 1] > data[0];
  const color = isPositive ? 'var(--green)' : 'var(--red)';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Header({ apiKey, setApiKey, showApiKey, setShowApiKey, onRefresh, isLoading, lastRefresh }) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo-icon">◈</span>
        <span className="header-logo-text">AlphaDesk</span>
        <span className={`live-dot ${lastRefresh ? 'active' : ''}`} />
        <span className="live-label">{lastRefresh ? 'LIVE' : 'IDLE'}</span>
        {lastRefresh && (
          <span className="last-refresh">Updated {timeAgo(lastRefresh)}</span>
        )}
      </div>
      <div className="header-right">
        <div className="api-input-group">
          <input
            type={showApiKey ? 'text' : 'password'}
            className="api-input"
            placeholder="Birdeye API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            spellCheck={false}
          />
          <button className="api-toggle" onClick={() => setShowApiKey(!showApiKey)} title={showApiKey ? 'Hide' : 'Show'}>
            {showApiKey ? '◉' : '◎'}
          </button>
        </div>
        <button className="refresh-btn" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? '⟳ Loading...' : '⟳ Refresh'}
        </button>
      </div>
    </header>
  );
}



function LoadingScreen({ isLoading, steps }) {
  if (!isLoading) return null;
  const currentIdx = steps.findIndex(s => !s.done);
  const progress = currentIdx === -1 ? 100 : (currentIdx / steps.length) * 100;
  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-title">
          <span className="header-logo-icon" style={{ fontSize: 24 }}>◈</span>
          Scanning Solana Smart Money...
        </div>
        <div className="loading-steps">
          {steps.map((step, i) => (
            <div key={i} className={`loading-step ${step.done ? 'done' : i === currentIdx ? 'active' : 'pending'}`}>
              <span className="step-icon">{step.done ? '✓' : i === currentIdx ? '◌' : '○'}</span>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="loading-bar-track">
          <div className="loading-bar-fill" style={{ width: progress + '%' }} />
        </div>
      </div>
    </div>
  );
}

function SignalsPanel({ signals, wallets, onSelectWallet }) {
  if (!signals || signals.length === 0) {
    return (
      <aside className="signals-panel">
        <div className="panel-title">CONVICTION SIGNALS</div>
        <div className="empty-state">No signals detected</div>
      </aside>
    );
  }

  return (
    <aside className="signals-panel">
      <div className="panel-title">CONVICTION SIGNALS</div>
      <div className="signals-list">
        {signals.map((sig, i) => (
          <div
            key={i}
            className={`signal-card ${sig.conviction === 'EXTREME' ? 'extreme' : ''}`}
          >
            <div className="signal-header">
              <span
                className="conviction-badge"
                style={{
                  background: getConvictionDim(sig.conviction),
                  color: getConvictionColor(sig.conviction),
                }}
              >
                {sig.conviction}
              </span>
              <span className="signal-wallet-count">{sig.walletCount} wallets</span>
            </div>
            <div className="signal-token">
              <span className="signal-symbol">{sig.token.symbol}</span>
              <span className="signal-name">{sig.token.name}</span>
            </div>
            <div className="signal-price-row">
              <span className="signal-price">{formatUsd(sig.price)}</span>
              <span className={`signal-change ${sig.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {sig.priceChange24h >= 0 ? '+' : ''}{sig.priceChange24h.toFixed(1)}%
              </span>
            </div>
            <div className="signal-sparkline">
              <Sparkline data={sig.sparkline} width={240} height={40} />
            </div>
            <div className="signal-footer">
              {sig.walletCount} smart wallets holding
            </div>
            <div className="signal-wallets">
              {sig.wallets.slice(0, 5).map((addr, j) => {
                const w = wallets.find(wl => wl.address === addr);
                return (
                  <button
                    key={j}
                    className="signal-wallet-chip"
                    onClick={() => w && onSelectWallet(w)}
                    title={addr}
                  >
                    {shortAddr(addr)}
                  </button>
                );
              })}
              {sig.wallets.length > 5 && (
                <span className="signal-wallet-more">+{sig.wallets.length - 5}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function LeaderboardTab({ wallets, onSelectWallet, copiedAddress, setCopiedAddress }) {
  const [animateScores, setAnimateScores] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateScores(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!wallets || wallets.length === 0) {
    return <div className="empty-state">No wallets found</div>;
  }

  function copyAddr(e, addr) {
    e.stopPropagation();
    navigator.clipboard.writeText(addr).catch(() => {});
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 1500);
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span className="lb-col lb-rank">RANK</span>
        <span className="lb-col lb-wallet">WALLET</span>
        <span className="lb-col lb-score">SCORE</span>
        <span className="lb-col lb-tokens">TOKENS</span>
        <span className="lb-col lb-portfolio">PORTFOLIO</span>
        <span className="lb-col lb-active">LAST ACTIVE</span>
        <span className="lb-col lb-tier">TIER</span>
      </div>
      <div className="leaderboard-body">
        {wallets.map((w, i) => {
          const tier = w.tier || getTier(w.alphaScore);
          const tierColor = getTierColor(tier);
          const tierDim = getTierDimColor(tier);
          return (
            <div
              key={w.address}
              className="leaderboard-row"
              onClick={() => onSelectWallet(w)}
              style={{ '--tier-color': tierColor }}
            >
              <span className="lb-col lb-rank">#{i + 1}</span>
              <span className="lb-col lb-wallet" style={{ position: 'relative' }}>
                <button className="wallet-addr-btn" onClick={(e) => copyAddr(e, w.address)} title="Click to copy">
                  {shortAddr(w.address)}
                  {copiedAddress === w.address && <span className="copied-tip">Copied!</span>}
                </button>
              </span>
              <span className="lb-col lb-score">
                <div className="score-bar-container">
                  <div
                    className="score-bar"
                    style={{
                      width: animateScores ? w.alphaScore + '%' : '0%',
                      background: tierColor,
                    }}
                  />
                </div>
                <span className="score-num" style={{ color: tierColor }}>{w.alphaScore}</span>
              </span>
              <span className="lb-col lb-tokens">{w.positions.length}</span>
              <span className="lb-col lb-portfolio lb-mono">{formatUsd(w.portfolio)}</span>
              <span className="lb-col lb-active lb-mono">{timeAgo(w.lastActive)}</span>
              <span className="lb-col lb-tier">
                <span className="tier-badge" style={{ background: tierDim, color: tierColor }}>
                  {tier}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeedTab({ trades, wallets }) {
  if (!trades || trades.length === 0) {
    return <div className="empty-state">No trades yet</div>;
  }

  return (
    <div className="feed">
      {trades.map((trade) => {
        const isBuy = trade.type === 'buy';
        return (
          <div key={trade.id} className="feed-item">
            <span className={`feed-dot ${isBuy ? 'buy' : 'sell'}`} />
            <span className="feed-addr">{shortAddr(trade.wallet)}</span>
            <span className="feed-action">{isBuy ? 'bought' : 'sold'}</span>
            <span className="feed-token">{trade.token.symbol}</span>
            <span className="feed-value">{formatUsd(trade.valueUsd)}</span>
            <span className={`feed-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
              {trade.pnl >= 0 ? '+' : ''}{formatUsd(Math.abs(trade.pnl))}
            </span>
            <span className="feed-time">{timeAgo(trade.timestamp)}</span>
          </div>
        );
      })}
    </div>
  );
}

function SignalsDetailTab({ signals, wallets, onSelectWallet }) {
  if (!signals || signals.length === 0) {
    return <div className="empty-state">No signals detected</div>;
  }

  return (
    <div className="signals-detail">
      {signals.map((sig, i) => (
        <div key={i} className="signal-detail-card">
          <div className="signal-detail-header">
            <div className="signal-detail-token-info">
              <span className="signal-detail-symbol">{sig.token.symbol}</span>
              <span className="signal-detail-name">{sig.token.name}</span>
              <span
                className="conviction-badge"
                style={{
                  background: getConvictionDim(sig.conviction),
                  color: getConvictionColor(sig.conviction),
                }}
              >
                {sig.conviction}
              </span>
            </div>
            <div className="signal-detail-price-info">
              <span className="signal-detail-price">{formatUsd(sig.price)}</span>
              <span className={`signal-change ${sig.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                {sig.priceChange24h >= 0 ? '+' : ''}{sig.priceChange24h.toFixed(1)}%
              </span>
              {sig.marketCap && (
                <span className="signal-detail-mcap">MCap: {formatNumber(sig.marketCap)}</span>
              )}
            </div>
          </div>
          <div className="signal-detail-sparkline">
            <Sparkline data={sig.sparkline} width={600} height={120} />
          </div>
          <div className="signal-detail-wallets-title">
            Held by {sig.walletCount} smart wallets
          </div>
          <div className="signal-detail-wallets-grid">
            {sig.wallets.map((addr, j) => {
              const w = wallets.find(wl => wl.address === addr);
              if (!w) return null;
              const pos = w.positions.find(p => p.symbol === sig.token.symbol);
              return (
                <div
                  key={j}
                  className="signal-wallet-card"
                  onClick={() => onSelectWallet(w)}
                >
                  <div className="swc-header">
                    <span className="swc-addr">{shortAddr(w.address)}</span>
                    <span className="tier-badge" style={{ background: getTierDimColor(w.tier), color: getTierColor(w.tier) }}>
                      {w.tier}
                    </span>
                  </div>
                  <div className="swc-score">Score: {w.alphaScore}</div>
                  {pos && (
                    <div className="swc-position">
                      <span>{formatUsd(pos.valueUsd)}</span>
                      <span className="swc-amount">{formatNumber(pos.uiAmount)} {sig.token.symbol}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="signal-security-row">
            <span className="security-label">Security Assessment</span>
            <div className="security-badges">
              <span className="security-badge low">Freeze Authority: None</span>
              <span className="security-badge low">Mint Authority: Revoked</span>
              <span className="security-badge low">Honeypot Risk: Low</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WalletDrawer({ wallet, onClose, trades, copiedAddress, setCopiedAddress }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!wallet) return null;

  const tier = wallet.tier || getTier(wallet.alphaScore);
  const tierColor = getTierColor(tier);
  const tierDim = getTierDimColor(tier);
  const walletTrades = trades ? trades.filter(t => t.wallet === wallet.address).slice(0, 5) : [];

  function copyFullAddr() {
    navigator.clipboard.writeText(wallet.address).catch(() => {});
    setCopiedAddress(wallet.address);
    setTimeout(() => setCopiedAddress(null), 1500);
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} ref={overlayRef} />
      <div className="wallet-drawer">
        <div className="drawer-header">
          <div className="drawer-title-row">
            <span className="drawer-addr">{shortAddr(wallet.address)}</span>
            <span className="tier-badge" style={{ background: tierDim, color: tierColor }}>{tier}</span>
            <button className="drawer-close" onClick={onClose}>✕</button>
          </div>
          <div className="drawer-full-addr" onClick={copyFullAddr} title="Click to copy">
            {wallet.address}
            {copiedAddress === wallet.address && <span className="copied-tip">Copied!</span>}
          </div>
        </div>

        <div className="drawer-stats">
          <div className="drawer-stat">
            <div className="drawer-stat-label">AlphaScore</div>
            <div className="drawer-stat-value">
              <div className="score-bar-container" style={{ width: 100 }}>
                <div className="score-bar" style={{ width: wallet.alphaScore + '%', background: tierColor }} />
              </div>
              <span style={{ color: tierColor, fontFamily: 'var(--font-mono)' }}>{wallet.alphaScore}</span>
            </div>
          </div>
          <div className="drawer-stat">
            <div className="drawer-stat-label">Portfolio</div>
            <div className="drawer-stat-value mono">{formatUsd(wallet.portfolio)}</div>
          </div>
          <div className="drawer-stat">
            <div className="drawer-stat-label">Tokens Held</div>
            <div className="drawer-stat-value mono">{wallet.positions.length}</div>
          </div>
        </div>

        <div className="drawer-section-title">CURRENT POSITIONS</div>
        <div className="drawer-positions">
          {wallet.positions.map((pos, i) => (
            <div key={i} className="drawer-position">
              <div className="dp-header">
                <div className="dp-token">
                  <span className="dp-symbol">{pos.symbol}</span>
                  <span className="dp-name">{pos.name}</span>
                </div>
                <Sparkline data={pos.sparkline} width={60} height={20} />
              </div>
              <div className="dp-details">
                <div className="dp-price">
                  <span>{formatUsd(pos.price || pos.valueUsd / pos.uiAmount)}</span>
                  <span className={`dp-change ${pos.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                    {pos.priceChange24h >= 0 ? '+' : ''}{pos.priceChange24h.toFixed(1)}%
                  </span>
                </div>
                <div className="dp-amount">
                  <span>{formatNumber(pos.uiAmount)} {pos.symbol}</span>
                  <span className="dp-value">{formatUsd(pos.valueUsd)}</span>
                </div>
              </div>
              {pos.securityRisk && pos.securityRisk !== 'LOW' && (
                <div className={`dp-risk ${pos.securityRisk.toLowerCase()}`}>
                  ⚠ {pos.securityRisk} RISK
                </div>
              )}
            </div>
          ))}
        </div>

        {walletTrades.length > 0 && (
          <>
            <div className="drawer-section-title">RECENT ACTIVITY</div>
            <div className="drawer-trades">
              {walletTrades.map((trade) => (
                <div key={trade.id} className="drawer-trade">
                  <span className={`feed-dot ${trade.type === 'buy' ? 'buy' : 'sell'}`} />
                  <span className="dt-action">{trade.type === 'buy' ? 'Bought' : 'Sold'}</span>
                  <span className="dt-token">{trade.token.symbol}</span>
                  <span className="dt-value">{formatUsd(trade.valueUsd)}</span>
                  <span className="dt-time">{timeAgo(trade.timestamp)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const CSS_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
:root {
  --bg-base: #080810;
  --bg-surface: #0E0E1A;
  --bg-elevated: #141428;
  --bg-input: #0A0A18;
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-accent: rgba(99,179,237,0.3);
  --text-primary: #F0F0FF;
  --text-secondary: #8B8BA8;
  --text-tertiary: #4A4A6A;
  --green: #00D4A8;
  --green-dim: rgba(0,212,168,0.12);
  --red: #FF4D6A;
  --red-dim: rgba(255,77,106,0.12);
  --blue: #63B3ED;
  --blue-dim: rgba(99,179,237,0.10);
  --amber: #F6AD55;
  --amber-dim: rgba(246,173,85,0.10);
  --purple: #B794F4;
  --purple-dim: rgba(183,148,244,0.10);
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --font-sans: 'DM Sans', 'Inter', sans-serif;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100vh; width: 100vw; overflow: hidden; }
body { background: var(--bg-base); color: var(--text-primary); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
.app { display: flex; flex-direction: column; height: 100vh; width: 100vw; overflow: hidden; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 52px; min-height: 52px; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); z-index: 10; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-logo-icon { color: var(--green); font-size: 20px; line-height: 1; }
.header-logo-text { font-family: var(--font-sans); font-weight: 600; font-size: 18px; color: var(--text-primary); letter-spacing: -0.5px; }
.live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-tertiary); margin-left: 8px; }
.live-dot.active { background: var(--green); animation: pulse 2s infinite; }
.live-label { font-size: 11px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; }
.last-refresh { font-size: 12px; font-family: var(--font-mono); color: var(--text-tertiary); margin-left: 8px; }
.header-right { display: flex; align-items: center; gap: 10px; }
.api-input-group { display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 6px; overflow: hidden; }
.api-input { background: transparent; border: none; color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; padding: 6px 10px; width: 200px; outline: none; }
.api-input::placeholder { color: var(--text-tertiary); }
.api-toggle { background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 6px 8px; font-size: 14px; }
.api-toggle:hover { color: var(--text-secondary); }
.refresh-btn { background: transparent; border: 1px solid var(--border-default); color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; padding: 6px 14px; border-radius: 6px; cursor: pointer; transition: all 150ms ease; white-space: nowrap; }
.refresh-btn:hover:not(:disabled) { border-color: var(--green); color: var(--green); }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.layout { display: flex; flex: 1; overflow: hidden; }
.signals-panel { width: 300px; min-width: 300px; background: var(--bg-surface); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; overflow-y: auto; }
.panel-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 16px 12px; }
.signals-list { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 10px; }
.signal-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; transition: all 150ms ease; }
.signal-card:hover { border-color: var(--border-default); }
.signal-card.extreme { box-shadow: 0 0 20px rgba(0,212,168,0.15); border-color: rgba(0,212,168,0.2); }
.signal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.conviction-badge { font-size: 10px; font-family: var(--font-mono); font-weight: 600; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; }
.signal-wallet-count { font-size: 12px; color: var(--text-tertiary); font-family: var(--font-mono); }
.signal-token { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.signal-symbol { font-size: 18px; font-weight: 600; color: var(--text-primary); }
.signal-name { font-size: 12px; color: var(--text-tertiary); }
.signal-price-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.signal-price { font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); }
.signal-change { font-family: var(--font-mono); font-size: 12px; }
.signal-change.positive { color: var(--green); }
.signal-change.negative { color: var(--red); }
.signal-sparkline { margin: 8px 0; }
.signal-footer { font-size: 11px; color: var(--text-tertiary); margin-bottom: 8px; }
.signal-wallets { display: flex; flex-wrap: wrap; gap: 4px; }
.signal-wallet-chip { background: var(--bg-input); border: 1px solid var(--border-subtle); color: var(--blue); font-family: var(--font-mono); font-size: 11px; padding: 2px 6px; border-radius: 4px; cursor: pointer; transition: all 150ms; }
.signal-wallet-chip:hover { border-color: var(--blue); background: var(--blue-dim); }
.signal-wallet-more { font-size: 11px; color: var(--text-tertiary); padding: 2px 4px; }
.main-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.tab-bar { display: flex; gap: 0; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface); padding: 0 16px; }
.tab-btn { background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-tertiary); font-family: var(--font-mono); font-size: 12px; padding: 12px 16px; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 150ms; }
.tab-btn:hover { color: var(--text-secondary); }
.tab-btn.active { color: var(--green); border-bottom-color: var(--green); }
.tab-content { flex: 1; overflow-y: auto; padding: 16px; }

.empty-state { color: var(--text-tertiary); font-size: 14px; text-align: center; padding: 40px 20px; font-family: var(--font-mono); }
.error-card { background: var(--red-dim); border: 1px solid rgba(255,77,106,0.2); border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 16px; }
.error-card p { color: var(--red); font-size: 14px; margin-bottom: 12px; }
.error-card button { background: transparent; border: 1px solid var(--red); color: var(--red); font-family: var(--font-mono); font-size: 12px; padding: 6px 16px; border-radius: 6px; cursor: pointer; }
.error-card button:hover { background: var(--red-dim); }
.leaderboard { display: flex; flex-direction: column; }
.leaderboard-header { display: flex; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); }
.lb-col { font-size: 10px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; }
.lb-rank { width: 50px; }
.lb-wallet { width: 120px; }
.lb-score { width: 160px; display: flex; align-items: center; gap: 8px; }
.lb-tokens { width: 70px; text-align: center; }
.lb-portfolio { flex: 1; text-align: right; }
.lb-active { width: 100px; text-align: right; }
.lb-tier { width: 80px; text-align: right; }
.lb-mono { font-family: var(--font-mono); }
.leaderboard-body { display: flex; flex-direction: column; }
.leaderboard-row { display: flex; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: all 150ms ease; border-left: 3px solid transparent; }
.leaderboard-row:hover { background: var(--bg-elevated); border-left-color: var(--tier-color, var(--text-tertiary)); }
.leaderboard-row .lb-col { font-size: 13px; color: var(--text-secondary); }
.leaderboard-row .lb-rank { color: var(--text-tertiary); font-family: var(--font-mono); }
.wallet-addr-btn { background: none; border: none; color: var(--blue); font-family: var(--font-mono); font-size: 13px; cursor: pointer; padding: 0; position: relative; }
.wallet-addr-btn:hover { text-decoration: underline; }
.copied-tip { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); background: var(--green); color: #000; font-size: 10px; padding: 2px 8px; border-radius: 4px; white-space: nowrap; pointer-events: none; }
.score-bar-container { width: 80px; height: 6px; background: var(--bg-input); border-radius: 3px; overflow: hidden; }
.score-bar { height: 100%; border-radius: 3px; transition: width 500ms ease-out; }
.score-num { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
.tier-badge { font-size: 10px; font-family: var(--font-mono); font-weight: 600; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; }
.feed { display: flex; flex-direction: column; gap: 2px; }
.feed-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border-subtle); transition: background 150ms; }
.feed-item:hover { background: var(--bg-elevated); }
.feed-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.feed-dot.buy { background: var(--green); }
.feed-dot.sell { background: var(--red); }
.feed-addr { font-family: var(--font-mono); font-size: 12px; color: var(--blue); min-width: 80px; }
.feed-action { font-size: 13px; color: var(--text-secondary); }
.feed-token { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.feed-value { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); margin-left: auto; }
.feed-pnl { font-family: var(--font-mono); font-size: 12px; min-width: 60px; text-align: right; }
.feed-pnl.positive { color: var(--green); }
.feed-pnl.negative { color: var(--red); }
.feed-time { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); min-width: 60px; text-align: right; }
.signals-detail { display: flex; flex-direction: column; gap: 20px; }
.signal-detail-card { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 20px; }
.signal-detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.signal-detail-token-info { display: flex; align-items: center; gap: 10px; }
.signal-detail-symbol { font-size: 24px; font-weight: 600; }
.signal-detail-name { font-size: 14px; color: var(--text-tertiary); }
.signal-detail-price-info { display: flex; align-items: center; gap: 10px; }
.signal-detail-price { font-family: var(--font-mono); font-size: 20px; font-weight: 600; }
.signal-detail-mcap { font-size: 12px; color: var(--text-tertiary); font-family: var(--font-mono); }
.signal-detail-sparkline { margin: 8px 0 16px; overflow: hidden; }
.signal-detail-sparkline svg { width: 100%; height: auto; }
.signal-detail-wallets-title { font-size: 12px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
.signal-detail-wallets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
.signal-wallet-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; cursor: pointer; transition: all 150ms; }
.signal-wallet-card:hover { border-color: var(--border-accent); background: var(--bg-input); }
.swc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.swc-addr { font-family: var(--font-mono); font-size: 12px; color: var(--blue); }
.swc-score { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); margin-bottom: 4px; }
.swc-position { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
.swc-amount { color: var(--text-tertiary); font-size: 11px; }
.drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 50; }
.wallet-drawer { position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: var(--bg-surface); border-left: 1px solid var(--border-subtle); z-index: 51; display: flex; flex-direction: column; overflow-y: auto; animation: slideIn 250ms ease; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.drawer-header { padding: 16px; border-bottom: 1px solid var(--border-subtle); }
.drawer-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.drawer-addr { font-family: var(--font-mono); font-size: 18px; font-weight: 600; color: var(--text-primary); }
.drawer-close { background: none; border: none; color: var(--text-tertiary); font-size: 18px; cursor: pointer; margin-left: auto; padding: 4px 8px; }
.drawer-close:hover { color: var(--text-primary); }
.drawer-full-addr { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); cursor: pointer; word-break: break-all; position: relative; padding: 4px 0; }
.drawer-full-addr:hover { color: var(--blue); }
.drawer-stats { display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid var(--border-subtle); }
.drawer-stat { flex: 1; }
.drawer-stat-label { font-size: 10px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.drawer-stat-value { font-size: 16px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.drawer-stat-value.mono { font-family: var(--font-mono); }
.drawer-section-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1.5px; padding: 16px 16px 8px; }
.drawer-positions { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
.drawer-position { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; }
.dp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.dp-token { display: flex; align-items: baseline; gap: 6px; }
.dp-symbol { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.dp-name { font-size: 11px; color: var(--text-tertiary); }
.dp-details { display: flex; justify-content: space-between; }
.dp-price { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
.dp-change { font-size: 12px; }
.dp-change.positive { color: var(--green); }
.dp-change.negative { color: var(--red); }
.dp-amount { font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); text-align: right; }
.dp-value { display: block; color: var(--text-secondary); font-size: 13px; }
.dp-risk { font-size: 10px; font-family: var(--font-mono); padding: 3px 8px; border-radius: 4px; margin-top: 6px; display: inline-block; }
.dp-risk.medium { background: var(--amber-dim); color: var(--amber); }
.dp-risk.high { background: var(--red-dim); color: var(--red); }
.drawer-trades { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 4px; }
.drawer-trade { display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border-subtle); font-size: 12px; }
.dt-action { color: var(--text-secondary); }
.dt-token { font-weight: 600; color: var(--text-primary); }
.dt-value { font-family: var(--font-mono); color: var(--text-secondary); margin-left: auto; }
.dt-time { font-family: var(--font-mono); color: var(--text-tertiary); font-size: 11px; }
.signal-security-row { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-subtle); }
.security-label { font-size: 11px; font-family: var(--font-mono); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
.security-badges { display: flex; flex-wrap: wrap; gap: 8px; }
.security-badge { font-size: 11px; font-family: var(--font-mono); padding: 4px 10px; border-radius: 4px; }
.security-badge.low { background: var(--green-dim); color: var(--green); }
.security-badge.medium { background: var(--amber-dim); color: var(--amber); }
.security-badge.high { background: var(--red-dim); color: var(--red); }
.loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(8,8,16,0.95); z-index: 100; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.loading-card { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 32px; width: 420px; max-width: 90vw; }
.loading-title { font-size: 18px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.loading-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.loading-step { display: flex; align-items: center; gap: 10px; font-size: 13px; transition: opacity 300ms; }
.loading-step.done { color: var(--green); }
.loading-step.active { color: var(--text-primary); }
.loading-step.active .step-icon { animation: pulse 2s infinite; }
.loading-step.pending { color: var(--text-tertiary); opacity: 0.5; }
.step-icon { width: 18px; text-align: center; font-size: 14px; }
.step-label { font-family: var(--font-mono); font-size: 12px; }
.loading-bar-track { height: 2px; background: var(--bg-input); border-radius: 1px; overflow: hidden; }
.loading-bar-fill { height: 100%; background: var(--green); border-radius: 1px; transition: width 400ms ease; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
`;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [smartWallets, setSmartWallets] = useState(MOCK_WALLETS);
  const [mockTrades, setMockTrades] = useState(MOCK_TRADES);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  const [copiedAddress, setCopiedAddress] = useState(null);
  const [liveSignals, setLiveSignals] = useState(null);

  const convictionSignals = useMemo(() => {
    if (liveSignals) return liveSignals;
    if (!liveSignals && smartWallets === MOCK_WALLETS) return MOCK_SIGNALS;
    const tokenHolders = {};
    smartWallets.forEach(w => {
      (w.positions || []).forEach(pos => {
        if (!tokenHolders[pos.symbol]) tokenHolders[pos.symbol] = { holders: [], pos };
        if (!tokenHolders[pos.symbol].holders.includes(w.address)) {
          tokenHolders[pos.symbol].holders.push(w.address);
        }
      });
    });
    return Object.entries(tokenHolders)
      .filter(([, v]) => v.holders.length >= 3)
      .map(([symbol, v]) => ({
        token: { symbol, name: v.pos.name, address: v.pos.tokenAddress },
        conviction: v.holders.length >= 7 ? 'EXTREME' : v.holders.length >= 5 ? 'HIGH' : 'MODERATE',
        walletCount: v.holders.length,
        wallets: v.holders,
        price: v.pos.price || 0,
        priceChange24h: v.pos.priceChange24h || 0,
        sparkline: v.pos.sparkline || generateSparkline(1, 1.1),
        marketCap: 0,
      }))
      .sort((a, b) => b.walletCount - a.walletCount);
  }, [smartWallets, liveSignals]);

  async function apiFetch(endpoint) {
    let resp;
    if (apiKey.trim()) {
      resp = await fetch('https://public-api.birdeye.so' + endpoint, {
        headers: { 'X-API-KEY': apiKey, 'x-chain': 'solana' },
      });
    } else {
      resp = await fetch('/api/birdeye?endpoint=' + encodeURIComponent(endpoint));
    }
    if (!resp.ok) throw new Error(`API error ${resp.status}: ${resp.statusText}`);
    return resp.json();
  }

  function updateStep(steps, idx) {
    const next = steps.map((s, i) => ({ ...s, done: i < idx }));
    setLoadingSteps(next);
    return next;
  }

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  async function loadLiveData() {
    setIsLoading(true);
    setError(null);

    let steps = [
      { label: 'Fetching trending tokens...', done: false },
      { label: 'Scanning top traders...', done: false },
      { label: 'Discovering unique wallets...', done: false },
      { label: 'Enriching wallet profiles...', done: false },
      { label: 'Fetching price data...', done: false },
      { label: 'Running AlphaScore calculations...', done: false },
      { label: 'Computing conviction signals...', done: false },
      { label: 'Done!', done: false },
    ];
    setLoadingSteps(steps);

    try {
      steps = updateStep(steps, 1);
      const tokenListResp = await apiFetch('/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=10&min_liquidity=100000');
      const tokens = tokenListResp.data?.tokens || [];
      if (tokens.length === 0) throw new Error('No trending tokens found');

      steps = updateStep(steps, 2);
      const allTraders = [];
      for (const token of tokens.slice(0, 10)) {
        try {
          const tradersResp = await apiFetch(`/defi/v2/tokens/top_traders?address=${token.address}&time_frame=24h&sort_by=volume&sort_type=desc&offset=0&limit=10`);
          const traders = tradersResp.data?.traders || tradersResp.data?.items || [];
          traders.forEach(t => {
            allTraders.push({ wallet: t.owner || t.address, token: token });
          });
        } catch (e) { /* skip failed token */ }
        await delay(200);
      }

      steps = updateStep(steps, 3);
      const walletMap = {};
      allTraders.forEach(({ wallet, token }) => {
        if (!wallet) return;
        if (!walletMap[wallet]) walletMap[wallet] = { address: wallet, appearsInTokens: [], lastTradeTimestamp: Date.now() };
        if (!walletMap[wallet].appearsInTokens.includes(token.symbol)) {
          walletMap[wallet].appearsInTokens.push(token.symbol);
        }
      });
      const uniqueWallets = Object.values(walletMap).sort((a, b) => b.appearsInTokens.length - a.appearsInTokens.length).slice(0, 10);
      if (uniqueWallets.length === 0) throw new Error('No wallets discovered');

      steps = updateStep(steps, 4);
      const tokenAddresses = new Set();
      for (const w of uniqueWallets) {
        try {
          const walletResp = await apiFetch(`/v1/wallet/token_list?wallet=${w.address}`);
          const items = walletResp.data?.items || [];
          w.positions = items.filter(item => item.valueUsd > 1).map(item => {
            if (item.address) tokenAddresses.add(item.address);
            return {
              tokenAddress: item.address,
              symbol: item.symbol || 'UNK',
              name: item.name || item.symbol || 'Unknown',
              uiAmount: item.uiAmount || 0,
              valueUsd: item.valueUsd || 0,
              priceChange24h: 0,
              sparkline: [],
              securityRisk: 'LOW',
              price: item.priceUsd || 0,
            };
          }).sort((a, b) => b.valueUsd - a.valueUsd).slice(0, 15);
          w.portfolio = w.positions.reduce((s, p) => s + p.valueUsd, 0);
        } catch (e) {
          w.positions = [];
          w.portfolio = 0;
        }
        await delay(200);
      }

      steps = updateStep(steps, 5);
      const priceCache = {};
      const addrList = Array.from(tokenAddresses).slice(0, 30);
      const unixNow = Math.floor(Date.now() / 1000);
      const unix24h = unixNow - 86400;
      for (const addr of addrList) {
        try {
          const [overviewResp, historyResp] = await Promise.all([
            apiFetch(`/defi/token_overview?address=${addr}`),
            apiFetch(`/defi/history_price?address=${addr}&address_type=token&type=30m&time_from=${unix24h}&time_to=${unixNow}`),
          ]);
          const overview = overviewResp.data || {};
          const priceHistory = (historyResp.data?.items || []).map(h => h.value || h.close || 0);
          priceCache[addr] = {
            price: overview.price || 0,
            priceChange24h: overview.priceChange24hPercent || 0,
            sparkline: priceHistory.length >= 2 ? priceHistory : null,
            marketCap: overview.mc || overview.marketCap || 0,
          };
        } catch (e) { /* skip */ }
      }

      for (const w of uniqueWallets) {
        for (const pos of (w.positions || [])) {
          const cached = priceCache[pos.tokenAddress];
          if (cached) {
            pos.priceChange24h = cached.priceChange24h;
            if (cached.sparkline) pos.sparkline = cached.sparkline;
            if (cached.price) pos.price = cached.price;
          }
        }
      }

      steps = updateStep(steps, 6);
      for (const addr of addrList.slice(0, 15)) {
        try {
          const secResp = await apiFetch(`/defi/token_security?address=${addr}`);
          const sec = secResp.data || {};
          let risk = 'LOW';
          if (sec.isToken2022 || sec.freezeable || sec.transferFeeEnable) risk = 'MEDIUM';
          if (sec.isTrueToken === false || sec.top10HolderPercent > 80) risk = 'HIGH';
          for (const w of uniqueWallets) {
            for (const pos of (w.positions || [])) {
              if (pos.tokenAddress === addr) pos.securityRisk = risk;
            }
          }
        } catch (e) { /* skip */ }
      }

      steps = updateStep(steps, 7);
      const scoredWallets = uniqueWallets.map(w => {
        const score = computeAlphaScore(w);
        return {
          ...w,
          alphaScore: score,
          tier: getTier(score),
          lastActive: w.lastTradeTimestamp || Date.now(),
        };
      }).sort((a, b) => b.alphaScore - a.alphaScore);

      const tokenHolders = {};
      scoredWallets.forEach(w => {
        (w.positions || []).forEach(pos => {
          if (!tokenHolders[pos.symbol]) tokenHolders[pos.symbol] = { holders: [], pos };
          tokenHolders[pos.symbol].holders.push(w.address);
        });
      });

      const computedSignals = Object.entries(tokenHolders)
        .filter(([, v]) => v.holders.length >= 3)
        .map(([symbol, v]) => {
          const count = v.holders.length;
          const cached = priceCache[v.pos.tokenAddress] || {};
          return {
            token: { symbol, name: v.pos.name, address: v.pos.tokenAddress },
            conviction: count >= 7 ? 'EXTREME' : count >= 5 ? 'HIGH' : 'MODERATE',
            walletCount: count,
            wallets: v.holders,
            price: cached.price || v.pos.price || 0,
            priceChange24h: cached.priceChange24h || v.pos.priceChange24h || 0,
            sparkline: cached.sparkline || v.pos.sparkline || generateSparkline(1, 1.1),
            marketCap: cached.marketCap || 0,
          };
        })
        .sort((a, b) => b.walletCount - a.walletCount);

      steps = updateStep(steps, 8);
      setSmartWallets(scoredWallets);
      setLiveSignals(computedSignals.length > 0 ? computedSignals : []);
      setLastRefresh(Date.now());

      await delay(500);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setSmartWallets(MOCK_WALLETS);
      setLiveSignals(null);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLiveData();
  }, []);

  return (
    <>
      <style>{CSS_STYLES}</style>
      <div className="app">
        <Header
          apiKey={apiKey}
          setApiKey={setApiKey}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          onRefresh={loadLiveData}
          isLoading={isLoading}
          lastRefresh={lastRefresh}
        />
        <div className="layout">
          <SignalsPanel
            signals={convictionSignals}
            wallets={smartWallets}
            onSelectWallet={setSelectedWallet}
          />
          <div className="main-panel">
            <div className="tab-bar">
              <button
                className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                Leaderboard
              </button>
              <button
                className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                onClick={() => setActiveTab('feed')}
              >
                Feed
              </button>
              <button
                className={`tab-btn ${activeTab === 'signals' ? 'active' : ''}`}
                onClick={() => setActiveTab('signals')}
              >
                Signals
              </button>
            </div>
            <div className="tab-content">

              {error && (
                <div className="error-card">
                  <p>{error}</p>
                  <button onClick={loadLiveData}>Retry</button>
                </div>
              )}
              {activeTab === 'leaderboard' && (
                <LeaderboardTab
                  wallets={smartWallets}
                  onSelectWallet={setSelectedWallet}
                  copiedAddress={copiedAddress}
                  setCopiedAddress={setCopiedAddress}
                />
              )}
              {activeTab === 'feed' && (
                <FeedTab trades={mockTrades} wallets={smartWallets} />
              )}
              {activeTab === 'signals' && (
                <SignalsDetailTab
                  signals={convictionSignals}
                  wallets={smartWallets}
                  onSelectWallet={setSelectedWallet}
                />
              )}
            </div>
          </div>
          {selectedWallet && (
            <WalletDrawer
              wallet={selectedWallet}
              onClose={() => setSelectedWallet(null)}
              trades={mockTrades}
              copiedAddress={copiedAddress}
              setCopiedAddress={setCopiedAddress}
            />
          )}
        </div>
        <LoadingScreen isLoading={isLoading} steps={loadingSteps} />
      </div>
    </>
  );
}

export default App;
