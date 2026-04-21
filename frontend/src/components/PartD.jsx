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
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Summary Matrix (All Securities)</div>
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
            {liqStocks.map(s => {
              const data = getLiquidData(s.ticker);
              const isSelected = s.ticker === liquid.ticker;
              return (
                <tr key={s.ticker}>
                  <td>{s.ticker} {isSelected && <span className="tag">Selected</span>}</td>
                  <td>{data.var[0].varPct.toFixed(2)}%</td>
                  <td>{data.var[1].varPct.toFixed(2)}%</td>
                  <td>₹{data.var[0].varRs.toLocaleString()}</td>
                </tr>
              );
            })}
            {illiquidStocks.map(s => {
              const data = getIlliquidData(s.ticker);
              const isSelected = s.ticker === illiquid.ticker;
              return (
                <tr key={s.ticker}>
                  <td>{s.ticker} {isSelected && " (Selected)"}</td>
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
