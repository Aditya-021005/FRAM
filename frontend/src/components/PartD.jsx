import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { LIQUID_DATA, NIFTY50_RANKING, getIlliquidData, getLiquidData } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartD({ illiquid, liquid }) {
  const liqStocks = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Value at Risk (VaR) Analysis</h2>
        <p className="section-subtitle">Comparing risk across regimes for {illiquid.ticker}. Confidence level at 99%.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="chart-container">
          <div className="chart-title">99% 1-Day VaR (%) by Regime — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={illiquid.var}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="regime" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: 'var(--bg-muted)' }} />
              <Bar dataKey="varPct" name="VaR %" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="insight-box" style={{ marginTop: 0 }}>
          <div className="insight-title">💡 Risk Exposure</div>
          <div className="insight-text">
            {illiquid.ticker} shows elevated VaR levels. Under High-Volatility regimes, the potential 1-day loss 
            is significantly higher than in normal regimes, highlighting the impact of kurtosis in thin markets.
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Risk Summary Matrix (All Securities)
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>
            <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>L</span> Liquid
            <span style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>I</span> Illiquid
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Security</th>
              <th>Full Period VaR (99%)</th>
              <th>High-Vol VaR (99%)</th>
              <th>Capital at Risk (10L)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderLeft: '3px solid var(--accent)', background: 'var(--bg-muted)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>L</span>
                {liquid.ticker}
              </td>
              <td>{liquid.var[0].varPct.toFixed(2)}%</td>
              <td>{liquid.var[1].varPct.toFixed(2)}%</td>
              <td>₹{liquid.var[0].varRs.toLocaleString()}</td>
            </tr>
            <tr style={{ borderLeft: '3px solid var(--text-secondary)', background: 'var(--bg-muted)', borderBottom: '2px solid var(--border)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>I</span>
                {illiquid.ticker}
              </td>
              <td>{illiquid.var[0].varPct.toFixed(2)}%</td>
              <td>{illiquid.var[1].varPct.toFixed(2)}%</td>
              <td>₹{illiquid.var[0].varRs.toLocaleString()}</td>
            </tr>
            {liqStocks.map(s => {
              if (s.ticker === liquid.ticker) return null;
              const data = getLiquidData(s.ticker);
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, width: '18px', textAlign: 'center' }}>L</span>
                    {s.ticker}
                  </td>
                  <td>{data.var[0].varPct.toFixed(2)}%</td>
                  <td>{data.var[1].varPct.toFixed(2)}%</td>
                  <td>₹{data.var[0].varRs.toLocaleString()}</td>
                </tr>
              );
            })}
            {illiquidStocks.map(s => {
              if (s.ticker === illiquid.ticker) return null;
              const data = getIlliquidData(s.ticker);
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, width: '18px', textAlign: 'center' }}>I</span>
                    {s.ticker}
                  </td>
                  <td>{data.var[0].varPct.toFixed(2)}%</td>
                  <td>{data.var[1].varPct.toFixed(2)}%</td>
                  <td>₹{data.var[0].varRs.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
