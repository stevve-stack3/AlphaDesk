import { useState, useCallback, useMemo } from 'react';
import { DEMO_WALLETS, DEMO_SIGNALS, DEMO_FEED } from './data/demoData.js';
import { createBirdeyeClient } from './services/birdeye.js';
import { runLivePipeline } from './services/dataPipeline.js';
import Header from './components/Header.jsx';
import ModeBanner from './components/ModeBanner.jsx';
import SignalsPanel from './components/SignalsPanel.jsx';
import LeaderboardTab from './components/LeaderboardTab.jsx';
import FeedTab from './components/FeedTab.jsx';
import SignalsDetailTab from './components/SignalsDetailTab.jsx';
import WalletDrawer from './components/WalletDrawer.jsx';
import AlphaScoreExplainer from './components/AlphaScoreExplainer.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

const STEPS = [
  'Fetching trending tokens\u2026',
  'Scanning top traders\u2026',
  'Discovering unique wallets\u2026',
  'Enriching wallet profiles\u2026',
  'Fetching price data\u2026',
  'Running security checks\u2026',
  'Computing AlphaScores\u2026',
  'Done!',
];

export default function App() {
  const [mode, setMode] = useState('demo');
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [wallets, setWallets] = useState(DEMO_WALLETS);
  const [signals, setSignals] = useState(DEMO_SIGNALS);
  const [feed, setFeed] = useState(DEMO_FEED);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [meta, setMeta] = useState(null);

  const dataSource = useMemo(() => {
    if (mode === 'demo') return 'Demo Snapshot';
    if (userApiKey?.trim()) return 'Live via User Key';
    return 'Live via Proxy';
  }, [mode, userApiKey]);

  const doLiveFetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const steps = STEPS.map(label => ({ label, done: false }));
    setLoadingSteps(steps);

    const client = createBirdeyeClient({ mode: 'live', userApiKey });

    try {
      const result = await runLivePipeline(client, (idx) => {
        setLoadingSteps(prev => prev.map((s, i) => ({ ...s, done: i < idx })));
      });

      setWallets(result.wallets);
      setSignals(result.signals);
      setFeed(result.feed);
      setMeta(result.meta);
      setLastRefresh(Date.now());

      setLoadingSteps(prev => prev.map(s => ({ ...s, done: true })));
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      setError(err.message || 'Failed to load live data');
    } finally {
      setIsLoading(false);
    }
  }, [userApiKey]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setError(null);
    setSelectedWallet(null);
    if (newMode === 'demo') {
      setWallets(DEMO_WALLETS);
      setSignals(DEMO_SIGNALS);
      setFeed(DEMO_FEED);
      setLastRefresh(null);
      setMeta(null);
    } else {
      setWallets([]);
      setSignals([]);
      setFeed([]);
      setLastRefresh(null);
      setMeta(null);
      doLiveFetch();
    }
  }, [doLiveFetch]);

  const handleRefresh = useCallback(async () => {
    if (mode === 'demo') {
      setWallets(DEMO_WALLETS);
      setSignals(DEMO_SIGNALS);
      setFeed(DEMO_FEED);
      return;
    }
    await doLiveFetch();
  }, [mode, doLiveFetch]);

  const handleUseDemoData = useCallback(() => {
    setError(null);
    handleModeChange('demo');
  }, [handleModeChange]);

  return (
    <div className="app">
      <Header
        mode={mode}
        setMode={handleModeChange}
        userApiKey={userApiKey}
        setUserApiKey={setUserApiKey}
        showApiKey={showApiKey}
        setShowApiKey={setShowApiKey}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        lastRefresh={lastRefresh}
        dataSource={dataSource}
        onShowExplainer={() => setShowExplainer(true)}
      />
      <ModeBanner
        mode={mode}
        dataSource={dataSource}
        error={error}
        onRetry={handleRefresh}
        onUseDemoData={handleUseDemoData}
      />
      <div className="layout">
        <SignalsPanel
          signals={signals}
          wallets={wallets}
          onSelectWallet={setSelectedWallet}
        />
        <div className="main-panel">
          <div className="tab-bar">
            {['leaderboard', 'feed', 'signals'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
            {meta && (
              <span className="tab-meta">
                {meta.endpointsUsed} endpoints &middot; {meta.tokensScanned} tokens &middot; {meta.walletsEnriched} wallets
              </span>
            )}
          </div>
          <div className="tab-content">
            {activeTab === 'leaderboard' && (
              <LeaderboardTab
                wallets={wallets}
                onSelectWallet={setSelectedWallet}
                copiedAddress={copiedAddress}
                setCopiedAddress={setCopiedAddress}
              />
            )}
            {activeTab === 'feed' && (
              <FeedTab feed={feed} />
            )}
            {activeTab === 'signals' && (
              <SignalsDetailTab
                signals={signals}
                wallets={wallets}
                onSelectWallet={setSelectedWallet}
              />
            )}
          </div>
        </div>
        {selectedWallet && (
          <WalletDrawer
            wallet={selectedWallet}
            onClose={() => setSelectedWallet(null)}
            feed={feed}
            copiedAddress={copiedAddress}
            setCopiedAddress={setCopiedAddress}
          />
        )}
      </div>
      <LoadingScreen isLoading={isLoading} steps={loadingSteps} />
      {showExplainer && <AlphaScoreExplainer onClose={() => setShowExplainer(false)} />}
    </div>
  );
}
