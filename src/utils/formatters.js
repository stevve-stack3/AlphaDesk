export function formatUsd(val) {
  if (val === 0 || val == null) return '$0.00';
  if (Math.abs(val) < 0.01) return '$' + val.toFixed(6);
  if (Math.abs(val) < 1) return '$' + val.toFixed(4);
  if (Math.abs(val) < 1000) return '$' + val.toFixed(2);
  return '$' + Math.round(val).toLocaleString();
}

export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
}

export function shortAddr(addr) {
  if (!addr) return '';
  return addr.slice(0, 4) + '...' + addr.slice(-4);
}

export function getTier(score) {
  if (score >= 80) return 'ELITE';
  if (score >= 50) return 'SMART';
  return 'ACTIVE';
}

export function getTierColor(tier) {
  if (tier === 'ELITE') return 'var(--purple)';
  if (tier === 'SMART') return 'var(--green)';
  return 'var(--amber)';
}

export function getTierDimColor(tier) {
  if (tier === 'ELITE') return 'var(--purple-dim)';
  if (tier === 'SMART') return 'var(--green-dim)';
  return 'var(--amber-dim)';
}

export function getConvictionColor(c) {
  if (c === 'EXTREME') return 'var(--green)';
  if (c === 'HIGH') return 'var(--amber)';
  return 'var(--blue)';
}

export function getConvictionDim(c) {
  if (c === 'EXTREME') return 'var(--green-dim)';
  if (c === 'HIGH') return 'var(--amber-dim)';
  return 'var(--blue-dim)';
}

export function pctString(val) {
  if (val == null || isNaN(val)) return '0.0%';
  return (val >= 0 ? '+' : '') + val.toFixed(1) + '%';
}
