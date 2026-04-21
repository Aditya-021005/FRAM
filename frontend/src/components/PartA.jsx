import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, Legend } from 'recharts';
import { NIFTY50_RANKING, SUMMARY_STATS, RETURNS_DATA } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

const barColors = (category) => {
  if (category === 'LIQUID') return '#09090b';
  if (category === 'ILLIQUID') return '#71717a';
  return '#e4e4e7';
};

export default function PartA() {
  const top10 = NIFTY50_RANKING.slice(0, 10);
  const bottom10 = NIFTY50_RANKING.slice(-10);
  const chartData = [...top10, ...bottom10].map(d => ({
    name: d.ticker.replace('.NS', ''),
    turnover: d.turnover,
    category: d.category,
  }));

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-badge blue">Part A</div>
        <h2 className="section-title">Stock Selection & Liquidity Ranking</h2>
        <p className="section-subtitle">NIFTY 50 stocks ranked by average daily turnover over a 6-month window to classify liquid and illiquid stocks.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Liquid Stock</div>
          <div className="stat-value blue">HDFCBANK</div>
          <div className="stat-change positive">Rank #1 — Top 25%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Illiquid Stock</div>
          <div className="stat-value rose">SHRIRAMFIN</div>
          <div className="stat-change negative">Rank #50 — Bottom 25%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Liquid Avg Turnover</div>
          <div className="stat-value emerald">₹2,847 Cr</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Per day</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Illiquid Avg Turnover</div>
          <div className="stat-value amber">₹152 Cr</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>Per day</div>
        </div>
      </div>

      <div className="chart-container" style={{ marginBottom: 24 }}>
        <div className="chart-title">Turnover Ranking — Top 10 vs Bottom 10</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="turnover" name="Avg Turnover (₹ Cr)" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={barColors(entry.category)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="legend-row">
          <div className="legend-item"><div className="legend-dot" style={{ background: '#09090b' }}></div>Liquid (Top 25%)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#e4e4e7' }}></div>Mid</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#71717a' }}></div>Illiquid (Bottom 25%)</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-container">
          <div className="chart-title">Daily Log Returns</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RETURNS_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3555" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={15} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="liqReturn" name="HDFCBANK" stroke="#09090b" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="illiqReturn" name="SHRIRAMFIN" stroke="#a1a1aa" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">20-Day Rolling Volatility (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RETURNS_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#71717a' }} interval={15} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="liqVol" name="HDFCBANK Vol" stroke="#09090b" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="illiqVol" name="SHRIRAMFIN Vol" stroke="#a1a1aa" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {[{ key: 'liquid', data: SUMMARY_STATS.liquid, label: 'Liquid', cls: 'liquid' },
          { key: 'illiquid', data: SUMMARY_STATS.illiquid, label: 'Illiquid', cls: 'illiquid' }].map(s => (
          <div className="card" key={s.key}>
            <div className="card-header">
              <span className="card-title">Summary Statistics</span>
              <span className={`card-label ${s.cls}`}>{s.label}</span>
            </div>
            <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
              {[
                ['Mean Return (%)', s.data.meanReturn.toFixed(4)],
                ['Std Dev Return (%)', s.data.stdReturn.toFixed(4)],
                ['Min / Max Return (%)', `${s.data.minReturn} / ${s.data.maxReturn}`],
                ['Avg Turnover (₹ Cr)', s.data.avgTurnover.toLocaleString()],
                ['Avg Amihud (×10⁻⁹)', s.data.avgAmihud.toFixed(4)],
                ['Avg Rolling Vol (%)', s.data.avgRollingVol.toFixed(2)],
              ].map(([l, v], i) => (
                <div className="vol-item" key={i}>
                  <span className="vol-label">{l}</span>
                  <span className="vol-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Full NIFTY 50 Ranking</span>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Ticker</th>
                <th>Avg Daily Turnover (₹ Cr)</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {NIFTY50_RANKING.map((r) => (
                <tr key={r.rank}>
                  <td>{r.rank}</td>
                  <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{r.ticker.replace('.NS', '')}</td>
                  <td>{r.turnover.toFixed(2)}</td>
                  <td><span className={`tag ${r.category.toLowerCase()}`}>{r.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insight-box" style={{ marginTop: 24 }}>
        <div className="insight-title">💡 Key Finding</div>
        <div className="insight-text">
          HDFCBANK leads with ₹2,847 Cr daily turnover (highest liquidity), while SHRIRAMFIN sits at ₹152 Cr (lowest). 
          The illiquid stock exhibits ~70% higher rolling volatility (31.28% vs 18.45% annualised), confirming that lower 
          trading activity amplifies price swings per unit of news — consistent with the Amihud illiquidity ratio being ~55× larger.
        </div>
      </div>
    </div>
  );
}
