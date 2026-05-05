export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server API key not configured' });
  }

  const { endpoint } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  if (!endpoint.startsWith('/defi/') && !endpoint.startsWith('/v1/wallet/')) {
    return res.status(403).json({ error: 'Endpoint not allowed' });
  }

  try {
    const url = `https://public-api.birdeye.so${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': apiKey,
        'x-chain': 'solana',
      },
    });
    
    const data = await response.json();
    
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: 'Failed to fetch from Birdeye API' });
  }
}
