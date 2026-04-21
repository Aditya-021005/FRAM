import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import PartA from './components/PartA';
import PartB from './components/PartB';
import PartC from './components/PartC';
import PartD from './components/PartD';
import { PROJECT_INFO } from './data';

function App() {
  const [activeTab, setActiveTab] = useState('Part A');
  const [isLanding, setIsLanding] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
  }, [isDark]);

  if (isLanding) {
    return (
      <div className="landing">
        <div style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '100px', fontSize: '12px', fontWeight: 600, marginBottom: '24px' }}>
          FIN F414 PROJECT
        </div>
        <h1>{PROJECT_INFO.title}</h1>
        <p>A comprehensive analysis of market liquidity, volatility, and risk measurement for NIFTY 50 securities.</p>
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
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsDark(!isDark)}>
            {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'Part A' && <PartA />}
        {activeTab === 'Part B' && <PartB />}
        {activeTab === 'Part C' && <PartC />}
        {activeTab === 'Part D' && <PartD />}
      </main>
    </div>
  );
}

export default App;
