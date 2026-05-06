import { shortAddr } from '../utils/formatters.js';

export default function OverlapTab({ wallets, onSelectWallet }) {
  if (!wallets || wallets.length === 0) {
    return <div className="empty-state">No wallet data available. Run the live pipeline or switch to Demo to see token overlap analysis.</div>;
  }

  const tokenWallets = {};
  wallets.forEach(w => {
    (w.positions || []).forEach(pos => {
      const sym = pos.symbol;
      if (!tokenWallets[sym]) tokenWallets[sym] = [];
      if (!tokenWallets[sym].includes(w.address)) {
        tokenWallets[sym].push(w.address);
      }
    });
  });

  const sharedTokens = Object.entries(tokenWallets)
    .filter(([, addrs]) => addrs.length >= 2)
    .sort((a, b) => b[1].length - a[1].length);

  if (sharedTokens.length === 0) {
    return <div className="empty-state">No token overlap detected. Overlap appears when 2+ wallets hold the same token.</div>;
  }

  const relevantAddrs = [...new Set(sharedTokens.flatMap(([, addrs]) => addrs))];
  const relevantWallets = relevantAddrs
    .map(addr => wallets.find(w => w.address === addr))
    .filter(Boolean)
    .sort((a, b) => (b.alphaScore || 0) - (a.alphaScore || 0));

  return (
    <div className="overlap-tab">
      <div className="overlap-summary">
        {sharedTokens.length} tokens shared across {relevantWallets.length} wallets
      </div>
      <div className="overlap-scroll">
        <table className="overlap-table">
          <thead>
            <tr>
              <th className="overlap-corner">Token</th>
              {relevantWallets.map(w => (
                <th key={w.address} className="overlap-wallet-header">
                  <button
                    className="overlap-wallet-btn"
                    onClick={() => onSelectWallet(w)}
                    title={w.address}
                  >
                    {shortAddr(w.address)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sharedTokens.map(([symbol, holders]) => (
              <tr key={symbol}>
                <td className="overlap-token-cell">
                  <span className="overlap-token-sym">{symbol}</span>
                  <span className="overlap-holder-count">{holders.length}</span>
                </td>
                {relevantWallets.map(w => {
                  const holds = holders.includes(w.address);
                  return (
                    <td
                      key={w.address}
                      className={`overlap-cell ${holds ? 'held' : 'empty'}`}
                      title={holds ? `${shortAddr(w.address)} holds ${symbol}` : ''}
                    >
                      {holds ? '\u25CF' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
