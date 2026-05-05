import { timeAgo } from '../utils/formatters.js';

export default function Header({
  mode,
  setMode,
  userApiKey,
  setUserApiKey,
  showApiKey,
  setShowApiKey,
  onRefresh,
  isLoading,
  lastRefresh,
  dataSource,
  onShowExplainer,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">AlphaDesk</span>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'demo' ? 'active' : ''}`}
            onClick={() => setMode('demo')}
            disabled={isLoading}
          >
            Demo
          </button>
          <button
            className={`mode-btn ${mode === 'live' ? 'active' : ''}`}
            onClick={() => setMode('live')}
            disabled={isLoading}
          >
            Live
          </button>
        </div>
        {lastRefresh && (
          <span className="header-meta">Updated {timeAgo(lastRefresh)}</span>
        )}
        {dataSource && (
          <span className="header-source">{dataSource}</span>
        )}
      </div>
      <div className="header-right">
        {mode === 'live' && (
          <div className="api-input-group">
            <input
              type={showApiKey ? 'text' : 'password'}
              className="api-input"
              placeholder="Birdeye API Key (optional)"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              spellCheck={false}
            />
            <button
              className="api-toggle"
              onClick={() => setShowApiKey(!showApiKey)}
              title={showApiKey ? 'Hide' : 'Show'}
            >
              {showApiKey ? '\u25C9' : '\u25CE'}
            </button>
          </div>
        )}
        <button className="header-btn" onClick={onShowExplainer} title="AlphaScore methodology">
          Score Info
        </button>
        <button className="refresh-btn" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Loading\u2026' : '\u27F3 Refresh'}
        </button>
      </div>
    </header>
  );
}
