import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line } from 'recharts';
import { NIFTY50_RANKING, RETURNS_DATA, LIQUID_DATA, getIlliquidData } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

const barColors = (category) => {
  if (category === 'LIQUID') return 'var(--chart-1)';
  if (category === 'ILLIQUID') return 'var(--chart-2)';
  return 'var(--chart-3)';
};

export default function PartA({ illiquid }) {
  const top7 = NIFTY50_RANKING.slice(0, 7);
  const bottom3 = NIFTY50_RANKING.slice(-3);
  const chartData = [...top7, ...bottom3].map(d => ({
    name: d.ticker.replace('.NS', ''),
    turnover: d.turnover,
    category: d.category,
  }));

  const liq = LIQUID_DATA;
  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Stock Selection & Liquidity</h2>
        <p className="section-subtitle">NIFTY 50 ranking by turnover. Comparing {liq.ticker} vs {illiquid.ticker}.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Liquid Security</div>
          <div className="stat-value">{liq.ticker.replace('.NS', '')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Selected Illiquid</div>
          <div className="stat-value">{illiquid.ticker.replace('.NS', '')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Turnover Ratio (L)</div>
          <div className="stat-value">0.0012</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Slippage Beta</div>
          <div className="stat-value">{ (illiquid.stats.avgAmihud / liq.stats.avgAmihud).toFixed(1) }x</div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Turnover Ranking — Top 25% vs Bottom 25%</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="turnover" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={barColors(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginTop: 32 }}>
        <div className="chart-container">
          <div className="chart-title">6-Month Returns Profile (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="liqReturn" name="Liquid" stroke="var(--chart-1)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="illiqReturn" name="Illiquid" stroke="var(--chart-2)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">20-Day Rolling Volatility</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="liqVol" name="Liquid Vol" stroke="var(--chart-1)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="illiqVol" name="Illiquid Vol" stroke="var(--chart-2)" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: 32 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '14px' }}>NIFTY 50 Liquidity & Risk Comparison</div>
        <table style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Security</th>
              <th>Mean (%)</th>
              <th>Std Dev (%)</th>
              <th>Avg Turnover (Cr)</th>
              <th>Amihud Ratio</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: 'var(--bg-secondary)', fontWeight: 600 }}>
              <td>{liq.ticker} <span className="tag">Liquid</span></td>
              <td>{liq.stats.meanReturn.toFixed(4)}%</td>
              <td>{liq.stats.stdReturn.toFixed(2)}%</td>
              <td>₹{liq.stats.avgTurnover}</td>
              <td>{liq.stats.avgAmihud.toFixed(4)}</td>
            </tr>
            {illiquidStocks.map(s => {
              const data = getIlliquidData(s.ticker);
              const isSelected = s.ticker === illiquid.ticker;
              return (
                <tr key={s.ticker} style={isSelected ? { background: 'var(--accent)', color: 'var(--accent-fg)' } : {}}>
                  <td>{s.ticker} {isSelected && <span className="tag" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Selected</span>}</td>
                  <td>{data.stats.meanReturn.toFixed(4)}%</td>
                  <td>{data.stats.stdReturn.toFixed(2)}%</td>
                  <td>₹{s.turnover.toFixed(2)}</td>
                  <td>{data.stats.avgAmihud.toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
