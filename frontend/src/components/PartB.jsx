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
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Volatility Estimation Summary (All Securities)
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>
            <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>L</span> Liquid
            <span style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>I</span> Illiquid
          </div>
        </div>
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
            <tr style={{ borderLeft: '3px solid var(--accent)', background: 'var(--bg-muted)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>L</span>
                {liquid.ticker}
              </td>
              <td>{liquid.vol.histVol}%</td>
              <td>{liquid.vol.garchVol.toFixed(2)}%</td>
              <td>{liquid.vol.persistence.toFixed(4)}</td>
              <td>{liquid.vol.longRunVol}%</td>
            </tr>
            <tr style={{ borderLeft: '3px solid var(--text-secondary)', background: 'var(--bg-muted)', borderBottom: '2px solid var(--border)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>I</span>
                {illiquid.ticker}
              </td>
              <td>{illiquid.vol.histVol}%</td>
              <td>{illiquid.vol.garchVol.toFixed(2)}%</td>
              <td>{illiquid.vol.persistence.toFixed(4)}</td>
              <td>{illiquid.vol.longRunVol}%</td>
            </tr>
            {liqStocks.map(s => {
              const data = getLiquidData(s.ticker);
              if (s.ticker === liquid.ticker) return null;
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, width: '18px', textAlign: 'center' }}>L</span>
                    {s.ticker}
                  </td>
                  <td>{data.vol.histVol}%</td>
                  <td>{data.vol.garchVol.toFixed(2)}%</td>
                  <td>{data.vol.persistence.toFixed(4)}</td>
                  <td>{data.vol.longRunVol}%</td>
                </tr>
              );
            })}
            {illiquidStocks.map(s => {
              const data = getIlliquidData(s.ticker);
              if (s.ticker === illiquid.ticker) return null;
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, width: '18px', textAlign: 'center' }}>I</span>
                    {s.ticker}
                  </td>
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
