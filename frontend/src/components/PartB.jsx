import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { LIQUID_DATA } from '../data';

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

export default function PartB({ illiquid }) {
  const liqOptions = LIQUID_DATA.options;
  const illiqOptions = illiquid.options;

  const makeChartData = (options) => options.map(o => ({
    name: `${o.strikeLabel}`,
    'BSM Price': o.bsmHist,
    'Market Price': o.mktPrice,
    'GARCH Price': o.bsmGarch,
  }));

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Option Pricing & Volatility</h2>
        <p className="section-subtitle">BSM pricing vs Market prices. {LIQUID_DATA.ticker} vs {illiquid.ticker}.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Volatility Summary — {illiquid.ticker}</span></div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
            {[
              ['Historical Vol', `${illiquid.vol.histVol}%`],
              ['GARCH Conditional', `${illiquid.vol.garchVol}%`],
              ['Persistence (α+β)', illiquid.vol.persistence.toFixed(4)],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Volatility Summary — HDFCBANK</span></div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
            {[
              ['Historical Vol', `${LIQUID_DATA.vol.histVol}%`],
              ['GARCH Conditional', `${LIQUID_DATA.vol.garchVol}%`],
              ['Persistence (α+β)', LIQUID_DATA.vol.persistence.toFixed(4)],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="chart-container">
          <div className="chart-title">Pricing — {LIQUID_DATA.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(liqOptions)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="BSM Price" fill="#09090b" />
              <Bar dataKey="Market Price" fill="#71717a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">Pricing — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(illiqOptions)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="BSM Price" fill="#09090b" />
              <Bar dataKey="Market Price" fill="#71717a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
