export default function ModeBanner({ mode, dataSource, error, onRetry, onUseDemoData }) {
  if (error) {
    return (
      <div className="mode-banner error">
        <span className="banner-text">
          Live data error: {error}
        </span>
        <div className="banner-actions">
          <button className="banner-btn" onClick={onRetry}>Retry Live</button>
          <button className="banner-btn secondary" onClick={onUseDemoData}>Use Demo Data</button>
        </div>
      </div>
    );
  }

  if (mode === 'demo') {
    return (
      <div className="mode-banner demo">
        <span className="banner-dot demo" />
        <span className="banner-text">
          Demo snapshot {'\u2014'} switch to Live to run the Birdeye pipeline through the secure proxy or your own key.
        </span>
      </div>
    );
  }

  return (
    <div className="mode-banner live">
      <span className="banner-dot live" />
      <span className="banner-text">
        {dataSource || 'Live Mode'}
      </span>
    </div>
  );
}
