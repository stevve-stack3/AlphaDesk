export default function LoadingScreen({ isLoading, steps }) {
  if (!isLoading) return null;
  const currentIdx = steps.findIndex(s => !s.done);
  const progress = currentIdx === -1 ? 100 : (currentIdx / steps.length) * 100;
  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-title">
          Scanning Solana Smart Money{'…'}
        </div>
        <div className="loading-steps">
          {steps.map((step, i) => (
            <div key={i} className={`loading-step ${step.done ? 'done' : i === currentIdx ? 'active' : 'pending'}`}>
              <span className="step-icon">{step.done ? '\u2713' : i === currentIdx ? '\u25CC' : '\u25CB'}</span>
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
