import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line } from 'recharts';
import { NIFTY50_RANKING, RETURNS_DATA, LIQUID_DATA } from '../data';

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

export default function PartA({ illiquid }) {
  const top10 = NIFTY50_RANKING.slice(0, 7);
  const bottom3 = NIFTY50_RANKING.slice(-3);
  const chartData = [...top10, ...bottom3].map(d => ({
    name: d.ticker.replace('.NS', ''),
    turnover: d.turnover,
    category: d.category,
  }));

  const liq = LIQUID_DATA;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Stock Selection & Liquidity</h2>
        <p className="section-subtitle">NIFTY 50 ranking by turnover. Comparing {liq.ticker} (Liquid) vs {illiquid.ticker} (Illiquid).</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Liquid Stock</div>
          <div className="stat-value">HDFCBANK</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Illiquid Stock</div>
          <div className="stat-value">{illiquid.ticker.replace('.NS', '')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Liquid Turnover</div>
          <div className="stat-value">₹{liq.stats.avgTurnover} Cr</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Illiquid Turnover</div>
          <div className="stat-value">₹{illiquid.stats.avgTurnover} Cr</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Turnover Ranking — Top 7 vs Bottom 3</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="turnover" name="Avg Turnover (₹ Cr)" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={barColors(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginTop: 32 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Summary Stats — {liq.ticker}</span></div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
            {[
              ['Mean Return (%)', liq.stats.meanReturn.toFixed(4)],
              ['Std Dev (%)', liq.stats.stdReturn.toFixed(4)],
              ['Avg Amihud', liq.stats.avgAmihud.toFixed(4)],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Summary Stats — {illiquid.ticker}</span></div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
            {[
              ['Mean Return (%)', illiquid.stats.meanReturn.toFixed(4)],
              ['Std Dev (%)', illiquid.stats.stdReturn.toFixed(4)],
              ['Avg Amihud', illiquid.stats.avgAmihud.toFixed(4)],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
