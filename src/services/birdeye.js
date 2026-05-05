const PROXY_PATH = '/api/birdeye';
const BIRDEYE_BASE = 'https://public-api.birdeye.so';

export function createBirdeyeClient({ mode, userApiKey }) {
  async function apiFetch(endpoint) {
    if (mode === 'demo') {
      throw new Error('Cannot fetch in demo mode');
    }

    let resp;
    if (userApiKey?.trim()) {
      resp = await fetch(BIRDEYE_BASE + endpoint, {
        headers: { 'X-API-KEY': userApiKey, 'x-chain': 'solana' },
      });
    } else {
      resp = await fetch(PROXY_PATH + '?endpoint=' + encodeURIComponent(endpoint));
    }

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(body.error || `API ${resp.status}: ${resp.statusText}`);
    }
    return resp.json();
  }

  function getSourceLabel() {
    if (mode === 'demo') return 'Demo Snapshot';
    if (userApiKey?.trim()) return 'Live via User Key';
    return 'Live via Proxy';
  }

  return { apiFetch, getSourceLabel };
}

export function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
