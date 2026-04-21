import React, { useState, useEffect } from 'react';
import PartA from './components/PartA';
import PartB from './components/PartB';
import PartC from './components/PartC';
import PartD from './components/PartD';
import { PROJECT_INFO, NIFTY50_RANKING, getIlliquidData, getLiquidData } from './data';

/* ─── GLOBAL STYLES ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0a0a0b;
    --bg2:       #111113;
    --bg3:       #18181c;
    --border:    #2a2a30;
    --border2:   #3a3a42;
    --amber:     #f5a623;
    --amber-dim: #7a531a;
    --green:     #39d98a;
    --red:       #ff4d4d;
    --blue:      #5b8dee;
    --text:      #e8e8ec;
    --muted:     #6b6b78;
    --faint:     #2e2e36;
    --mono: 'IBM Plex Mono', monospace;
    --sans: 'IBM Plex Sans', sans-serif;
  }

  html, body, #root { height: 100%; background: var(--bg); color: var(--text); }
  body { font-family: var(--mono); overflow-x: hidden; }

  /* scanline overlay */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.04) 2px,
      rgba(0,0,0,0.04) 4px
    );
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); }

  select {
    font-family: var(--mono);
    appearance: none;
    background: var(--bg3);
    color: var(--text);
    border: 1px solid var(--border2);
    cursor: pointer;
    transition: border-color 0.15s;
  }
  select:hover { border-color: var(--amber); }
  select:focus { outline: none; border-color: var(--amber); box-shadow: 0 0 0 2px rgba(245,166,35,0.15); }
  option { background: var(--bg2); }

  button { font-family: var(--mono); cursor: pointer; transition: all 0.15s; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes scanPulse {
    0%, 100% { opacity: 0.6; } 50% { opacity: 1; }
  }
  .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up-2 { animation: fadeUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up-3 { animation: fadeUp 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up-4 { animation: fadeUp 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both; }
  .fade-up-5 { animation: fadeUp 0.5s 0.4s cubic-bezier(0.16,1,0.3,1) both; }

  .cursor-blink { animation: blink 1.1s step-end infinite; }
`;

/* ─── INJECT STYLES ──────────────────────────────────────────── */
const StyleTag = () => (
  <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
);

/* ─── TINY UI PRIMITIVES ─────────────────────────────────────── */
const Tag = ({ children, color = 'var(--amber)' }) => (
  <span style={{
    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    border: `1px solid ${color}`, color, borderRadius: 2,
    padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 4,
  }}>{children}</span>
);

const Divider = ({ style }) => (
  <div style={{ height: 1, background: 'var(--border)', ...style }} />
);

/* ─── LANDING PAGE ───────────────────────────────────────────── */
function Landing({ liquidStocks, illiquidStocks, liquidTicker, illiquidTicker,
                   setLiquidTicker, setIlliquidTicker, onLaunch }) {

  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 80); return () => clearInterval(t); }, []);
  const ticker_feed = ['NIFTY +0.42%', 'HDFCBANK ↑', 'RELIANCE ↑', 'NESTLEIND ↓', 'VIX 14.2', 'INFY +1.1%', 'TCS -0.3%'];
  const feedIdx = Math.floor(tick / 30) % ticker_feed.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(var(--faint) 1px, transparent 1px),
          linear-gradient(90deg, var(--faint) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 80%)',
      }} />

      {/* amber glow blob */}
      <div style={{
        position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* top bar */}
      <div style={{
        position: 'relative', zIndex: 2, borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 42, background: 'rgba(10,10,11,0.9)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em', color: 'var(--amber)' }}>FRAM</span>
          <span style={{ color: 'var(--border2)', fontSize: 10 }}>|</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em' }}>FIN F414 · FINANCIAL RISK MANAGEMENT</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--muted)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'scanPulse 2s infinite' }} />
          <span style={{ animation: 'scanPulse 2s infinite' }}>{ticker_feed[feedIdx]}</span>
        </div>
      </div>

      {/* hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', position: 'relative', zIndex: 2, gap: 0 }}>

        {/* eyebrow */}
        <div className="fade-up" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Tag>NSE · NIFTY 50</Tag>
          <Tag color="var(--green)">Live Data</Tag>
        </div>

        {/* headline */}
        <h1 className="fade-up-2" style={{
          fontFamily: 'var(--mono)', fontWeight: 700,
          fontSize: 'clamp(36px, 6vw, 72px)', letterSpacing: '-0.04em',
          lineHeight: 0.95, textAlign: 'center', color: '#fff', marginBottom: 10,
        }}>
          INSTITUTIONAL<br/>
          <span style={{ color: 'var(--amber)' }}>RISK ANALYSIS</span>
        </h1>
        <div className="fade-up-2" style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.95, textAlign: 'center', color: 'var(--border2)', marginBottom: 32 }}>
          PLATFORM<span className="cursor-blink" style={{ color: 'var(--amber)' }}>_</span>
        </div>

        {/* sub */}
        <p className="fade-up-3" style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', maxWidth: 440, textAlign: 'center', lineHeight: 1.8, marginBottom: 48 }}>
          Measure liquidity impact on option pricing, Greeks sensitivity,
          and regime-driven risk across NIFTY 50 securities.
        </p>

        {/* feature row */}
        <div className="fade-up-3" style={{ display: 'flex', gap: 0, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 48, width: '100%', maxWidth: 660 }}>
          {[
            { code: 'A', label: 'Liquidity Ranking', sub: 'Amihud ratios & turnover tiers' },
            { code: 'B', label: 'Option Pricing', sub: 'BSM + GARCH(1,1) volatility' },
            { code: 'C', label: 'Greeks Analysis', sub: 'Delta, Gamma, Vega, Theta' },
            { code: 'D', label: 'Risk Management', sub: 'Multi-regime VaR & hedging' },
          ].map((f, i) => (
            <div key={i} style={{
              flex: 1, padding: '16px 12px',
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              background: 'var(--bg2)',
            }}>
              <div style={{ fontSize: 9, color: 'var(--amber)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 6 }}>PART {f.code}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3 }}>{f.label}</div>
              <div style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1.5 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* selector card */}
        <div className="fade-up-4" style={{
          width: '100%', maxWidth: 560, border: '1px solid var(--border2)',
          borderRadius: 4, background: 'var(--bg2)', overflow: 'hidden',
        }}>
          {/* card header */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>SELECT COMPARISON PAIR</span>
            <span style={{ fontSize: 9, color: 'var(--border2)' }}>NSE:EQUITY</span>
          </div>

          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* liquid */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--green)', fontWeight: 700, marginBottom: 6 }}>◆ LIQUID — TOP 25%</div>
              <select value={liquidTicker} onChange={e => setLiquidTicker(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: 11, borderRadius: 3 }}>
                {liquidStocks.map(s => (
                  <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')} — #{s.rank}</option>
                ))}
              </select>
            </div>
            {/* illiquid */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--red)', fontWeight: 700, marginBottom: 6 }}>◆ ILLIQUID — BTM 25%</div>
              <select value={illiquidTicker} onChange={e => setIlliquidTicker(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', fontSize: 11, borderRadius: 3 }}>
                {illiquidStocks.map(s => (
                  <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')} — #{s.rank}</option>
                ))}
              </select>
            </div>
          </div>

          {/* comparison strip */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>CMP:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>{liquidTicker.replace('.NS', '')}</span>
            <span style={{ fontSize: 10, color: 'var(--border2)' }}>←→</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>{illiquidTicker.replace('.NS', '')}</span>
            <div style={{ flex: 1 }} />
            <button onClick={onLaunch} style={{
              background: 'var(--amber)', color: '#000', border: 'none',
              padding: '7px 18px', borderRadius: 3, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6,
            }}
              onMouseEnter={e => { e.target.style.background = '#ffc04a'; }}
              onMouseLeave={e => { e.target.style.background = 'var(--amber)'; }}
            >
              LAUNCH <span style={{ fontSize: 13 }}>→</span>
            </button>
          </div>
        </div>

        {/* footnote */}
        <div className="fade-up-5" style={{ marginTop: 28, fontSize: 9, color: 'var(--border2)', letterSpacing: '0.1em', textAlign: 'center' }}>
          NIFTY 50 · BSM MODEL · GARCH(1,1) · AMIHUD RATIO · VALUE AT RISK
        </div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD SHELL ────────────────────────────────────────── */
const TABS = [
  { id: 'Part A', label: 'A', full: 'LIQUIDITY' },
  { id: 'Part B', label: 'B', full: 'PRICING' },
  { id: 'Part C', label: 'C', full: 'GREEKS' },
  { id: 'Part D', label: 'D', full: 'RISK' },
];

function Dashboard({ activeTab, setActiveTab, liquidStocks, illiquidStocks,
                     liquidTicker, illiquidTicker, setLiquidTicker, setIlliquidTicker,
                     onHome, illiquidData, liquidData }) {

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>

      {/* ── TOP BAR ── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,11,0.98)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* row 1 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: 44, borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={onHome} style={{
              background: 'none', border: 'none', color: 'var(--amber)',
              fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 15,
              letterSpacing: '-0.03em', padding: 0,
            }}>FRAM</button>
            <span style={{ color: 'var(--border)', fontSize: 10 }}>│</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'var(--amber)' : 'transparent',
                    color: activeTab === tab.id ? '#000' : 'var(--muted)',
                    border: 'none',
                    padding: '4px 14px', borderRadius: 2, fontSize: 10,
                    fontWeight: 700, letterSpacing: '0.1em',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--muted)'; }}
                >
                  {tab.full}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* liquid select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 8, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em' }}>LIQ</span>
              <select value={liquidTicker} onChange={e => setLiquidTicker(e.target.value)}
                style={{ padding: '4px 8px', fontSize: 10, borderRadius: 3, fontWeight: 600 }}>
                {liquidStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')}</option>)}
              </select>
            </div>
            <span style={{ color: 'var(--border)', fontSize: 10 }}>│</span>
            {/* illiquid select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 8, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.1em' }}>ILL</span>
              <select value={illiquidTicker} onChange={e => setIlliquidTicker(e.target.value)}
                style={{ padding: '4px 8px', fontSize: 10, borderRadius: 3, fontWeight: 600 }}>
                {illiquidStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker.replace('.NS', '')}</option>)}
              </select>
            </div>
            <span style={{ color: 'var(--border)', fontSize: 10 }}>│</span>
            <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.05em' }}>{dateStr} · {timeStr}</span>
          </div>
        </div>

        {/* row 2 — context strip */}
        <div style={{
          padding: '0 24px', height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.08em' }}>
              COMPARING:
            </span>
            <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700 }}>
              ▲ {liquidTicker.replace('.NS', '')}
            </span>
            <span style={{ fontSize: 9, color: 'var(--border2)' }}>vs</span>
            <span style={{ fontSize: 9, color: 'var(--red)', fontWeight: 700 }}>
              ▼ {illiquidTicker.replace('.NS', '')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'MODEL', val: 'BSM + GARCH(1,1)' },
              { label: 'INDEX', val: 'NIFTY 50' },
              { label: 'COURSE', val: 'FIN F414' },
            ].map(item => (
              <span key={item.label} style={{ fontSize: 9, color: 'var(--muted)' }}>
                <span style={{ color: 'var(--border2)' }}>{item.label}: </span>
                {item.val}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {activeTab === 'Part A' && <PartA illiquid={illiquidData} liquid={liquidData} />}
        {activeTab === 'Part B' && <PartB illiquid={illiquidData} liquid={liquidData} />}
        {activeTab === 'Part C' && <PartC illiquid={illiquidData} liquid={liquidData} />}
        {activeTab === 'Part D' && <PartD illiquid={illiquidData} liquid={liquidData} />}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '0 24px', height: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg2)',
      }}>
        <span style={{ fontSize: 8, color: 'var(--border2)', letterSpacing: '0.1em' }}>
          FRAM · FINANCIAL RISK ANALYSIS MATRIX · FIN F414
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          {['AMIHUD RATIO', 'BLACK-SCHOLES', 'GARCH(1,1)', 'VaR', 'CVaR'].map(m => (
            <span key={m} style={{ fontSize: 8, color: 'var(--border2)', letterSpacing: '0.08em' }}>{m}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState('Part A');
  const [isLanding, setIsLanding] = useState(true);
  const [illiquidTicker, setIlliquidTicker] = useState('NESTLEIND.NS');
  const [liquidTicker, setLiquidTicker] = useState('HDFCBANK.NS');

  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');
  const liquidStocks   = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidData   = getIlliquidData(illiquidTicker);
  const liquidData     = getLiquidData(liquidTicker);

  return (
    <>
      <StyleTag />
      {isLanding ? (
        <Landing
          liquidStocks={liquidStocks}
          illiquidStocks={illiquidStocks}
          liquidTicker={liquidTicker}
          illiquidTicker={illiquidTicker}
          setLiquidTicker={setLiquidTicker}
          setIlliquidTicker={setIlliquidTicker}
          onLaunch={() => setIsLanding(false)}
        />
      ) : (
        <Dashboard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          liquidStocks={liquidStocks}
          illiquidStocks={illiquidStocks}
          liquidTicker={liquidTicker}
          illiquidTicker={illiquidTicker}
          setLiquidTicker={setLiquidTicker}
          setIlliquidTicker={setIlliquidTicker}
          onHome={() => setIsLanding(true)}
          illiquidData={illiquidData}
          liquidData={liquidData}
        />
      )}
    </>
  );
}