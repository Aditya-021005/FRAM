import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { LIQUID_DATA } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: ₹{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartB({ illiquid }) {
  const liqOptions = LIQUID_DATA.options;
  const illiqOptions = illiquid.options;

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
          <div className="chart-title">Pricing Models — {LIQUID_DATA.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={makeChartData(liqOptions)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
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
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Volatility Estimation Results</div>
        <table>
          <thead>
            <tr>
              <th>Security</th>
              <th>Historical Vol</th>
              <th>Conditional Vol (GARCH)</th>
              <th>Mean-Reversion Level</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{LIQUID_DATA.ticker}</td>
              <td>{LIQUID_DATA.vol.histVol}%</td>
              <td>{LIQUID_DATA.vol.garchVol.toFixed(2)}%</td>
              <td>{LIQUID_DATA.vol.longRunVol}%</td>
            </tr>
            <tr>
              <td>{illiquid.ticker}</td>
              <td>{illiquid.vol.histVol}%</td>
              <td>{illiquid.vol.garchVol.toFixed(2)}%</td>
              <td>{illiquid.vol.longRunVol}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
