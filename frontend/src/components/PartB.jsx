import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { NIFTY50_RANKING, getIlliquidData, getLiquidData } from '../data';

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

export default function PartB({ illiquid, liquid }) {
  const liqOptions = liquid.options;
  const illiqOptions = illiquid.options;
  const liqStocks = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');

  const makeChartData = (options) => options.map(o => ({
    name: o.strikeLabel,
    'BSM Hist': o.bsmHist,
    'Market': o.mktPrice,
    'GARCH': o.bsmGarch,
  }));

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Option Pricing & Volatility Comparison</h2>
        <p className="section-subtitle">Comparing BSM theoretical prices against Market and GARCH conditional volatilities.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="chart-container">
          <div className="chart-title">Pricing Models — {liquid.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(liqOptions)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="BSM Hist" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Market" fill="var(--chart-2)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="GARCH" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">Pricing Models — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(illiqOptions)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="BSM Hist" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Market" fill="var(--chart-2)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="GARCH" fill="var(--chart-1)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Volatility Estimation Summary (All Securities)</div>
        <table>
          <thead>
            <tr>
              <th>Security</th>
              <th>Historical Vol</th>
              <th>GARCH (1,1)</th>
              <th>Persistence</th>
              <th>Mean-Reversion</th>
            </tr>
          </thead>
          <tbody>
            {liqStocks.map(s => {
              const data = getLiquidData(s.ticker);
              const isSelected = s.ticker === liquid.ticker;
              return (
                <tr key={s.ticker}>
                  <td>{s.ticker} {isSelected && <span className="tag">Selected</span>}</td>
                  <td>{data.vol.histVol}%</td>
                  <td>{data.vol.garchVol.toFixed(2)}%</td>
                  <td>{data.vol.persistence.toFixed(4)}</td>
                  <td>{data.vol.longRunVol}%</td>
                </tr>
              );
            })}
            {illiquidStocks.map(s => {
              const data = getIlliquidData(s.ticker);
              const isSelected = s.ticker === illiquid.ticker;
              return (
                <tr key={s.ticker}>
                  <td>{s.ticker} {isSelected && " (Selected)"}</td>
                  <td>{data.vol.histVol}%</td>
                  <td>{data.vol.garchVol.toFixed(2)}%</td>
                  <td>{data.vol.persistence.toFixed(4)}</td>
                  <td>{data.vol.longRunVol}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
