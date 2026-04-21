import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiArrowRight, FiActivity, FiShield, FiTrendingUp } from 'react-icons/fi';
import PartA from './components/PartA';
import PartB from './components/PartB';
import PartC from './components/PartC';
import PartD from './components/PartD';
import { PROJECT_INFO, NIFTY50_RANKING, getIlliquidData } from './data';

function App() {
  const [activeTab, setActiveTab] = useState('Part A');
  const [isLanding, setIsLanding] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [illiquidTicker, setIlliquidTicker] = useState('NESTLEIND.NS');

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
  }, [isDark]);

  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');
  const illiquidData = getIlliquidData(illiquidTicker);

  if (isLanding) {
    return (
      <div className="landing">
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-muted)', padding: '6px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '32px', border: '1px solid var(--border)' }}>
          <FiActivity size={14} /> FIN F414 CORPORATE PROJECT
        </div>
        <h1 style={{ maxWidth: '900px', marginBottom: '24px' }}>{PROJECT_INFO.title}</h1>
        <p style={{ marginBottom: '48px' }}>
          An institutional-grade analysis platform measuring the impact of liquidity on option pricing, 
           Greeks sensitivity, and regime-based risk exposure.
        </p>

        <div className="grid-3" style={{ marginBottom: '48px', textAlign: 'left' }}>
          <div className="card" style={{ padding: '20px' }}>
            <FiTrendingUp style={{ marginBottom: '12px' }} size={24} />
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Liquidity Dynamics</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Turnover-based ranking and Amihud illiquidity impact analysis.</p>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <FiActivity style={{ marginBottom: '12px' }} size={24} />
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Pricing Models</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>BSM integration with GARCH(1,1) conditional volatility.</p>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <FiShield style={{ marginBottom: '12px' }} size={24} />
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Risk Management</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Multi-regime VaR and slippage-adjusted delta hedging.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '32px', maxWidth: '500px', width: '100%', border: '2px solid var(--accent)' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Illiquid Security
          </label>
          <select 
            value={illiquidTicker} 
            onChange={(e) => setIlliquidTicker(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}
          >
            {illiquidStocks.map(s => (
              <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')} (Rank #{s.rank})</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => setIsLanding(false)}>
              Launch Platform <FiArrowRight />
            </button>
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px' }} onClick={() => setIsDark(!isDark)}>
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '20px', cursor: 'pointer', letterSpacing: '-0.05em' }} onClick={() => setIsLanding(true)}>FRAM</div>
            <nav className="nav-tabs">
              {['Part A', 'Part B', 'Part C', 'Part D'].map((tab) => (
                <button
                  key={tab}
                  className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={illiquidTicker} 
              onChange={(e) => setIlliquidTicker(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}
            >
              {illiquidStocks.map(s => (
                <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')}</option>
              ))}
            </select>
            <button className="btn-outline" style={{ padding: '6px 10px' }} onClick={() => setIsDark(!isDark)}>
              {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'Part A' && <PartA illiquid={illiquidData} />}
        {activeTab === 'Part B' && <PartB illiquid={illiquidData} />}
        {activeTab === 'Part C' && <PartC illiquid={illiquidData} />}
        {activeTab === 'Part D' && <PartD illiquid={illiquidData} />}
      </main>
    </div>
  );
}

export default App;
