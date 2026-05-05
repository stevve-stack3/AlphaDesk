export default function AlphaScoreExplainer({ onClose }) {
  return (
    <div className="explainer-overlay" onClick={onClose}>
      <div className="explainer-modal" onClick={e => e.stopPropagation()}>
        <div className="explainer-header">
          <span className="explainer-title">AlphaScore Methodology</span>
          <button className="drawer-close" onClick={onClose}>{'\u2715'}</button>
        </div>

        <div className="explainer-body">
          <p className="explainer-intro">
            AlphaScore is a heuristic intelligence metric (0–100) that ranks wallet activity across trending Solana tokens. It is not financial advice and does not predict future performance.
          </p>

          <div className="explainer-section">
            <div className="explainer-section-title">Scoring Factors</div>
            <table className="explainer-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Weight</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Coverage</td>
                  <td>35 pts</td>
                  <td>How many of the top 10 trending tokens is this wallet a top trader on. More coverage indicates broader market participation.</td>
                </tr>
                <tr>
                  <td>Recency</td>
                  <td>25 pts</td>
                  <td>How recently the wallet was active. Full points for activity within 6 hours, partial for 24h and 72h windows.</td>
                </tr>
                <tr>
                  <td>Diversity</td>
                  <td>20 pts</td>
                  <td>Number of distinct token positions held. A balanced portfolio (3–15 tokens) scores highest.</td>
                </tr>
                <tr>
                  <td>Data Quality</td>
                  <td>10 pts</td>
                  <td>Adjusted by security risk of held tokens. High-risk tokens (unverified, concentrated holders) reduce this score.</td>
                </tr>
                <tr>
                  <td>Elite Bonus</td>
                  <td>10 pts</td>
                  <td>Extra points for wallets appearing in 5+ trending token top-trader lists, indicating exceptional reach.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="explainer-section">
            <div className="explainer-section-title">Tier Classification</div>
            <div className="explainer-tiers">
              <div className="explainer-tier">
                <span className="tier-badge" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>ELITE</span>
                <span>Score 80+ — Top-performing wallets with broad coverage and recent activity</span>
              </div>
              <div className="explainer-tier">
                <span className="tier-badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>SMART</span>
                <span>Score 50–79 — Active wallets with notable trading patterns</span>
              </div>
              <div className="explainer-tier">
                <span className="tier-badge" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>ACTIVE</span>
                <span>Score below 50 — Wallets with limited coverage or older activity</span>
              </div>
            </div>
          </div>

          <div className="explainer-section">
            <div className="explainer-section-title">Data Sources</div>
            <p>
              Scoring uses data from Birdeye API: trending token lists, top trader rankings per token, wallet portfolio snapshots, token price/volume data, and token security assessments. Each wallet&apos;s detail view shows a per-factor breakdown.
            </p>
          </div>

          <div className="explainer-disclaimer">
            This is an analytical heuristic for on-chain data exploration. It does not constitute financial advice, investment recommendation, or guaranteed trading performance. Past wallet activity does not predict future results.
          </div>
        </div>
      </div>
    </div>
  );
}
