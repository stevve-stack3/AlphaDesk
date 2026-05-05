import { getTier } from '../utils/formatters.js';

export function computeAlphaScore(wallet) {
  const coverage = wallet.appearsInTokens?.length || 0;
  const coverageScore = Math.min(35, (coverage / 10) * 35);

  const hoursSinceLastTrade = (Date.now() - (wallet.lastTradeTimestamp || Date.now())) / 3600000;
  let recencyScore = 0;
  let recencyDetail = 'Inactive >72h';
  if (hoursSinceLastTrade < 6) { recencyScore = 25; recencyDetail = 'Active <6h'; }
  else if (hoursSinceLastTrade < 24) { recencyScore = 15; recencyDetail = 'Active <24h'; }
  else if (hoursSinceLastTrade < 72) { recencyScore = 5; recencyDetail = 'Active <72h'; }

  const positions = wallet.positions || wallet.currentPositions || [];
  const tokenCount = positions.length;
  let diversityScore = 5;
  let diversityDetail = `${tokenCount} positions (narrow)`;
  if (tokenCount >= 3 && tokenCount <= 15) { diversityScore = 20; diversityDetail = `${tokenCount} positions (balanced)`; }
  else if (tokenCount > 15) { diversityScore = 10; diversityDetail = `${tokenCount} positions (broad)`; }

  const highRiskCount = positions.filter(p => p.securityRisk === 'HIGH').length;
  const medRiskCount = positions.filter(p => p.securityRisk === 'MEDIUM').length;
  const qualityPenalty = Math.min(10, highRiskCount * 3 + medRiskCount);
  const qualityScore = Math.max(0, 10 - qualityPenalty);

  let eliteBonus = 0;
  let eliteDetail = 'Standard';
  if (coverage >= 5) { eliteBonus = 10; eliteDetail = 'Appears in 5+ trending tokens'; }
  else if (coverage >= 3) { eliteBonus = 5; eliteDetail = 'Appears in 3+ trending tokens'; }

  const total = Math.min(100, Math.round(coverageScore + recencyScore + diversityScore + qualityScore + eliteBonus));
  const tier = getTier(total);

  return {
    total,
    tier,
    breakdown: {
      coverage: { score: Math.round(coverageScore), max: 35, detail: `${coverage} trending tokens` },
      recency: { score: Math.round(recencyScore), max: 25, detail: recencyDetail },
      diversity: { score: Math.round(diversityScore), max: 20, detail: diversityDetail },
      quality: { score: Math.round(qualityScore), max: 10, detail: highRiskCount + medRiskCount > 0 ? `${highRiskCount} high risk, ${medRiskCount} medium risk tokens` : 'No high-risk tokens' },
      elite: { score: Math.round(eliteBonus), max: 10, detail: eliteDetail },
    },
  };
}
