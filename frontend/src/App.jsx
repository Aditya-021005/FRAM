import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiArrowRight, FiActivity, FiShield, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import PartA from './components/PartA';
import PartB from './components/PartB';
import PartC from './components/PartC';
import PartD from './components/PartD';
import { PROJECT_INFO, NIFTY50_RANKING, getIlliquidData, getLiquidData } from './data';

function App() {
  const [activeTab, setActiveTab] = useState('Part A');
  const [isLanding, setIsLanding] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [illiquidTicker, setIlliquidTicker] = useState('NESTLEIND.NS');
  const [liquidTicker, setLiquidTicker] = useState('HDFCBANK.NS');

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
  }, [isDark]);

  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');
  const liquidStocks = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidData = getIlliquidData(illiquidTicker);
  const liquidData = getLiquidData(liquidTicker);

  if (isLanding) {
    return (
      <div className="landing fade-in">
        <div className="landing-blob" style={{ width: 500, height: 500, background: '#09090b', top: '-100px', left: '-150px', animationDuration: '9s' }} />
        <div className="landing-blob" style={{ width: 400, height: 400, background: '#71717a', bottom: '-80px', right: '-100px', animationDuration: '7s', animationDelay: '1s' }} />
        <div className="landing-blob" style={{ width: 300, height: 300, background: '#09090b', bottom: '10%', left: '20%', animationDuration: '11s', animationDelay: '2s' }} />

        <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 2 }}>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }} onClick={() => setIsDark(!isDark)}>
            {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
        </div>

        <div className="slide-up" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', background: 'var(--bg-muted)', padding: '4px 14px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '20px', border: '1px solid var(--border)', letterSpacing: '0.08em' }}>
          <FiBarChart2 size={12} /> FIN F414 · FINANCIAL RISK MANAGEMENT
        </div>

        <h1 className="slide-up" style={{ fontSize: '48px', maxWidth: '760px', marginBottom: '16px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          Institutional Risk<br/>Analysis Platform
        </h1>

        <p className="slide-up" style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '520px', marginBottom: '32px', lineHeight: 1.7 }}>
          Measure liquidity impact on option pricing, Greeks sensitivity,
          and regime-driven risk across NIFTY 50 securities.
        </p>

        <div className="grid-3 slide-up" style={{ marginBottom: '32px', textAlign: 'left', maxWidth: '800px', width: '100%' }}>
          {[
            { icon: <FiTrendingUp size={18} />, title: 'Liquidity Ranking', desc: 'Amihud ratios & turnover-based NIFTY 50 tiers' },
            { icon: <FiActivity size={18} />, title: 'Option Pricing', desc: 'BSM + GARCH(1,1) conditional volatility models' },
            { icon: <FiShield size={18} />, title: 'Risk Management', desc: 'Multi-regime VaR with slippage-adjusted hedging' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{f.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card scale-in" style={{ padding: '24px 28px', maxWidth: '640px', width: '100%', border: '1.5px solid var(--accent)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>Liquid (Top 25%)</label>
              <select value={liquidTicker} onChange={(e) => setLiquidTicker(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {liquidStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')} — Rank #{s.rank}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)' }}>Illiquid (Bottom 25%)</label>
              <select value={illiquidTicker} onChange={(e) => setIlliquidTicker(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {illiquidStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')} — Rank #{s.rank}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: 'var(--bg-muted)', borderRadius: '6px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-secondary)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Comparing:</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{liquidTicker.replace('.NS', '')}</span>
            <span style={{ fontSize: '10px' }}>⟷</span>
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{illiquidTicker.replace('.NS', '')}</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', fontSize: '14px' }} onClick={() => setIsLanding(false)}>
            Launch Dashboard <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '18px', cursor: 'pointer', letterSpacing: '-0.05em' }} onClick={() => setIsLanding(true)}>FRAM</div>
            <nav className="nav-tabs">
              {['Part A', 'Part B', 'Part C', 'Part D'].map((tab) => (
                <button key={tab} className={`nav-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </nav>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select value={liquidTicker} onChange={(e) => setLiquidTicker(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}>
              {liquidStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')}</option>)}
            </select>
            <select value={illiquidTicker} onChange={(e) => setIlliquidTicker(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}>
              {illiquidStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')}</option>)}
            </select>
            <button className="btn-outline" style={{ padding: '6px 10px' }} onClick={() => setIsDark(!isDark)}>
              {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'Part A' && <PartA illiquid={illiquidData} liquid={liquidData} />}
        {activeTab === 'Part B' && <PartB illiquid={illiquidData} liquid={liquidData} />}
        {activeTab === 'Part C' && <PartC illiquid={illiquidData} liquid={liquidData} />}
        {activeTab === 'Part D' && <PartD illiquid={illiquidData} liquid={liquidData} />}
      </main>
    </div>
  );
}

export default App;
