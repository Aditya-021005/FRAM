import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { OPTION_TABLE, VOLATILITY_SUMMARY } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{p.name}: ₹{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartB() {
  const liqOptions = OPTION_TABLE.filter(o => o.liquidity === 'Liquid');
  const illiqOptions = OPTION_TABLE.filter(o => o.liquidity === 'Illiquid');

  const makeChartData = (options) => options.map(o => ({
    name: `${o.strikeLabel}\n(${o.dte}d)`,
    'BSM Price': o.bsmHist,
    'Market Price': o.mktPrice,
    'GARCH Price': o.bsmGarch,
  }));

  const vol = VOLATILITY_SUMMARY;

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-badge emerald">Part B</div>
        <h2 className="section-title">Option Pricing & Volatility</h2>
        <p className="section-subtitle">BSM pricing with historical and GARCH(1,1) volatility inputs across ATM and OTM options at two maturities.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Liquid Spot Price</div>
          <div className="stat-value blue">₹1,842.50</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>HDFCBANK</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Illiquid Spot Price</div>
          <div className="stat-value rose">₹628.40</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>SHRIRAMFIN</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">30-Day Expiry</div>
          <div className="stat-value emerald">29 DTE</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>30-Apr-2026</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">60-Day Expiry</div>
          <div className="stat-value amber">57 DTE</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>28-May-2026</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Volatility Summary</span>
            <span className="card-label liquid">HDFCBANK</span>
          </div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
            {[
              ['Historical Vol', `${vol.liquid.histVol}%`],
              ['GARCH Conditional Vol', `${vol.liquid.garchVol}%`],
              ['GARCH Long-run Vol', `${vol.liquid.longRunVol}%`],
              ['Persistence (α+β)', vol.liquid.persistence.toFixed(4)],
            ].map(([l, v], i) => (
              <div className="vol-item" key={i}>
                <span className="vol-label">{l}</span>
                <span className="vol-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Volatility Summary</span>
            <span className="card-label illiquid">SHRIRAMFIN</span>
          </div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
            {[
              ['Historical Vol', `${vol.illiquid.histVol}%`],
              ['GARCH Conditional Vol', `${vol.illiquid.garchVol}%`],
              ['GARCH Long-run Vol', `${vol.illiquid.longRunVol}%`],
              ['Persistence (α+β)', vol.illiquid.persistence.toFixed(4)],
            ].map(([l, v], i) => (
              <div className="vol-item" key={i}>
                <span className="vol-label">{l}</span>
                <span className="vol-value">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-container">
          <div className="chart-title">BSM vs Market vs GARCH — HDFCBANK (Liquid)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(liqOptions)} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="BSM Price" fill="#09090b" radius={[3, 3, 0, 0]} fillOpacity={1} />
              <Bar dataKey="Market Price" fill="#71717a" radius={[3, 3, 0, 0]} fillOpacity={1} />
              <Bar dataKey="GARCH Price" fill="#e4e4e7" radius={[3, 3, 0, 0]} fillOpacity={1} stroke="#d4d4d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="legend-row">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#09090b' }}></div>BSM (Hist Vol)</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#71717a' }}></div>Market Price</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#e4e4e7', border: '1px solid #d4d4d8' }}></div>BSM (GARCH Vol)</div>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-title">BSM vs Market vs GARCH — SHRIRAMFIN (Illiquid)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(illiqOptions)} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="BSM Price" fill="#09090b" radius={[3, 3, 0, 0]} fillOpacity={1} />
              <Bar dataKey="Market Price" fill="#71717a" radius={[3, 3, 0, 0]} fillOpacity={1} />
              <Bar dataKey="GARCH Price" fill="#e4e4e7" radius={[3, 3, 0, 0]} fillOpacity={1} stroke="#d4d4d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="legend-row">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#09090b' }}></div>BSM (Hist Vol)</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#71717a' }}></div>Market Price</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#e4e4e7', border: '1px solid #d4d4d8' }}></div>BSM (GARCH Vol)</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Option Pricing Table</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Liq.</th>
                <th>DTE</th>
                <th>Strike</th>
                <th>Type</th>
                <th>Spot (₹)</th>
                <th>Strike (₹)</th>
                <th>Hist Vol</th>
                <th>Mkt Price</th>
                <th>BSM-Hist</th>
                <th>Dev (%)</th>
                <th>BSM-GARCH</th>
              </tr>
            </thead>
            <tbody>
              {OPTION_TABLE.map((o, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{o.ticker.replace('.NS', '')}</td>
                  <td><span className={`tag ${o.liquidity.toLowerCase()}`}>{o.liquidity}</span></td>
                  <td>{o.dte}</td>
                  <td>{o.strikeLabel}</td>
                  <td>{o.optType}</td>
                  <td>₹{o.spot.toFixed(2)}</td>
                  <td>₹{o.strike}</td>
                  <td>{o.histVol}%</td>
                  <td>₹{o.mktPrice.toFixed(2)}</td>
                  <td>₹{o.bsmHist.toFixed(2)}</td>
                  <td><span className={`tag ${o.dev > 15 ? 'negative' : 'positive'}`}>{o.dev.toFixed(2)}%</span></td>
                  <td>₹{o.bsmGarch.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="insight-box">
          <div className="insight-title">💡 BSM vs Market Deviations</div>
          <div className="insight-text">
            Market prices systematically exceed BSM theoretical values. This premium reflects the volatility 
            risk premium, bid-ask spreads, and demand for tail-risk hedging. OTM puts trade furthest above BSM — 
            the classic "put skew" driven by crash protection demand.
          </div>
        </div>
        <div className="insight-box rose">
          <div className="insight-title">⚡ GARCH Finding</div>
          <div className="insight-text">
            GARCH conditional volatility exceeds historical vol for both stocks — the illiquid stock shows 
            higher persistence (α+β = 0.9812), meaning volatility shocks die out more slowly, keeping 
            option premia elevated for longer periods.
          </div>
        </div>
      </div>
    </div>
  );
}
