import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line } from 'recharts';
import { NIFTY50_RANKING, RETURNS_DATA, getIlliquidData, getLiquidData } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--tooltip-text)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: 'var(--tooltip-sub)', marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

const barColors = (category) => {
  if (category === 'LIQUID') return 'var(--chart-1)';
  if (category === 'ILLIQUID') return 'var(--chart-2)';
  return 'var(--chart-3)';
};

export default function PartA({ illiquid, liquid }) {
  const liqStocks = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');
  const chartData = [...liqStocks, ...illiquidStocks.slice(-3)].map(d => ({
    name: d.ticker.replace('.NS', ''),
    turnover: d.turnover,
    category: d.category,
  }));



  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Stock Selection & Liquidity</h2>
        <p className="section-subtitle">NIFTY 50 ranking by turnover. Comparing <strong>{liquid.ticker}</strong> (Liquid) vs <strong>{illiquid.ticker}</strong> (Illiquid).</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Selected Liquid stock</div>
          <div className="stat-value">{liquid.ticker.replace('.NS', '')}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Rank #{liquid.rank} · NIFTY 50</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Selected Illiquid stock</div>
          <div className="stat-value">{illiquid.ticker.replace('.NS', '')}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Rank #{illiquid.rank} · NIFTY 50</div>
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
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          NIFTY 50 Liquidity & Risk Comparison
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>
            <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>L</span> Liquid Selected &nbsp;
            <span style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>I</span> Illiquid Selected
          </div>
        </div>
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
            <tr style={{ borderLeft: '3px solid var(--accent)', background: 'var(--bg-muted)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>L</span>
                {liquid.ticker}
              </td>
              <td>{liquid.stats.meanReturn.toFixed(4)}%</td>
              <td>{liquid.stats.stdReturn.toFixed(2)}%</td>
              <td>₹{liquid.stats.avgTurnover.toFixed(2)}</td>
              <td>{liquid.stats.avgAmihud.toFixed(4)}</td>
            </tr>
            <tr style={{ borderLeft: '3px solid var(--text-secondary)', background: 'var(--bg-muted)', borderBottom: '2px solid var(--border)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)' }}>I</span>
                {illiquid.ticker}
              </td>
              <td>{illiquid.stats.meanReturn.toFixed(4)}%</td>
              <td>{illiquid.stats.stdReturn.toFixed(2)}%</td>
              <td>₹{illiquidStocks.find(s => s.ticker === illiquid.ticker)?.turnover.toFixed(2)}</td>
              <td>{illiquid.stats.avgAmihud.toFixed(4)}</td>
            </tr>
            {liqStocks.map(s => {
              const data = getLiquidData(s.ticker);
              const isSelected = s.ticker === liquid.ticker;
              if (isSelected) return null;
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, padding: '2px 7px' }}>L</span>
                    {s.ticker}
                  </td>
                  <td>{data.stats.meanReturn.toFixed(4)}%</td>
                  <td>{data.stats.stdReturn.toFixed(2)}%</td>
                  <td>₹{s.turnover.toFixed(2)}</td>
                  <td>{data.stats.avgAmihud.toFixed(4)}</td>
                </tr>
              );
            })}
            {illiquidStocks.map(s => {
              const data = getIlliquidData(s.ticker);
              const isSelected = s.ticker === illiquid.ticker;
              if (isSelected) return null;
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, padding: '2px 7px' }}>I</span>
                    {s.ticker}
                  </td>
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
