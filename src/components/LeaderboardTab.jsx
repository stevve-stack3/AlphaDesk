import { useState, useEffect } from 'react';
import { shortAddr, formatUsd, timeAgo, getTier, getTierColor, getTierDimColor } from '../utils/formatters.js';

export default function LeaderboardTab({ wallets, onSelectWallet, copiedAddress, setCopiedAddress }) {
  const [animateScores, setAnimateScores] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateScores(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!wallets || wallets.length === 0) {
    return <div className="empty-state">No wallets discovered yet. Try refreshing data.</div>;
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
        <span className="lb-col lb-rank">Rank</span>
        <span className="lb-col lb-wallet">Wallet</span>
        <span className="lb-col lb-score">Score</span>
        <span className="lb-col lb-tokens">Tokens</span>
        <span className="lb-col lb-portfolio">Portfolio</span>
        <span className="lb-col lb-active">Last Active</span>
        <span className="lb-col lb-tier">Tier</span>
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
              <span className="lb-col lb-wallet">
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
              <span className="lb-col lb-tokens">{w.positions?.length || 0}</span>
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
