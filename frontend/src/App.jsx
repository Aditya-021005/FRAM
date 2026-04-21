import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import PartA from './components/PartA';
import PartB from './components/PartB';
import PartC from './components/PartC';
import PartD from './components/PartD';
import { PROJECT_INFO, ILLIQUID_OPTIONS } from './data';

function App() {
  const [activeTab, setActiveTab] = useState('Part A');
  const [isLanding, setIsLanding] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [illiquidKey, setIlliquidKey] = useState('NESTLEIND');

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
  }, [isDark]);

  const illiquidData = ILLIQUID_OPTIONS[illiquidKey];

  if (isLanding) {
    return (
      <div className="landing">
        <div style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, marginBottom: '24px' }}>
          FIN F414 PROJECT
        </div>
        <h1>{PROJECT_INFO.title}</h1>
        <p>A comprehensive analysis of market liquidity, volatility, and risk measurement for NIFTY 50 securities.</p>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, marginRight: '10px' }}>SELECT ILLIQUID STOCK:</label>
          <select 
            value={illiquidKey} 
            onChange={(e) => setIlliquidKey(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <option value="NESTLEIND">NESTLEIND (Rank #49)</option>
            <option value="SHRIRAMFIN">SHRIRAMFIN (Rank #50)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => setIsLanding(false)}>Launch Dashboard</button>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px' }} onClick={() => setIsDark(!isDark)}>
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '20px', cursor: 'pointer' }} onClick={() => setIsLanding(true)}>FIN</div>
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
              value={illiquidKey} 
              onChange={(e) => setIlliquidKey(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px' }}
            >
              <option value="NESTLEIND">NESTLEIND</option>
              <option value="SHRIRAMFIN">SHRIRAMFIN</option>
            </select>
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsDark(!isDark)}>
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
