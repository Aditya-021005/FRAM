import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { RETURNS_DATA } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--tooltip-text)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartB({ illiquid, liquid }) {
  
  const getRow1Data = (stock) => {
    const labels = ["ATM", "OTM_Call", "OTM_Put"];
    return labels.map(l => {
      const d29 = stock.options.find(o => o.strikeLabel === l && o.dte === 29);
      const d57 = stock.options.find(o => o.strikeLabel === l && o.dte === 57);
      return {
        name: l,
        'BSM DTE=30': d29?.bsmHist,
        'Mkt DTE=30': d29?.mktPrice,
        'BSM DTE=60': d57?.bsmHist,
        'Mkt DTE=60': d57?.mktPrice
      };
    });
  };

  const getRow2Data = (stock) => {
    const labels = ["ATM", "OTM_Call", "OTM_Put"];
    return labels.map(l => {
      const d29 = stock.options.find(o => o.strikeLabel === l && o.dte === 29);
      const d57 = stock.options.find(o => o.strikeLabel === l && o.dte === 57);
      return {
        name: l,
        'DTE=29': d29?.devPct,
        'DTE=57': d57?.devPct
      };
    });
  };

  const getRow3Data = (stock) => {
    const labels = ["ATM", "OTM_Call", "OTM_Put"];
    return labels.map(l => {
      const d29 = stock.options.find(o => o.strikeLabel === l && o.dte === 29);
      return {
        name: l,
        'BSM Hist': d29?.bsmHist,
        'GARCH': d29?.bsmGarch,
        'Market': d29?.mktPrice
      };
    });
  };

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Option Pricing — Ground Truth Analytics</h2>
        <p className="section-subtitle">Comparing BSM benchmarks against GARCH conditional volatilities and market premiums.</p>
      </div>

      <div className="grid-2" style={{ gap: '32px' }}>
        {/* ROW 1: BSM vs Market */}
        <div className="chart-container">
          <div className="chart-title">BSM (Hist Vol) vs Market Price — {liquid.ticker} (Liquid)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getRow1Data(liquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="BSM DTE=30" fill="#3b82f6" />
              <Bar dataKey="Mkt DTE=30" fill="#f97316" />
              <Bar dataKey="BSM DTE=60" fill="#06b6d4" />
              <Bar dataKey="Mkt DTE=60" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">BSM (Hist Vol) vs Market Price — {illiquid.ticker} (Illiquid)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getRow1Data(illiquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="BSM DTE=30" fill="#3b82f6" />
              <Bar dataKey="Mkt DTE=30" fill="#f97316" />
              <Bar dataKey="BSM DTE=60" fill="#06b6d4" />
              <Bar dataKey="Mkt DTE=60" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROW 2: Deviation */}
        <div className="chart-container">
          <div className="chart-title">Market vs BSM Deviation (%) — {liquid.ticker}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getRow2Data(liquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="DTE=29" fill="#f97316" />
              <Bar dataKey="DTE=57" fill="#be185d" strokeWidth={1} stroke="#be185d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">Market vs BSM Deviation (%) — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getRow2Data(illiquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="DTE=29" fill="#f97316" />
              <Bar dataKey="DTE=57" fill="#be185d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROW 3: Hist vs GARCH vs Mkt */}
        <div className="chart-container">
          <div className="chart-title">Hist vs GARCH vs Market Price — {liquid.ticker}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getRow3Data(liquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="BSM Hist" fill="#3b82f6" />
              <Bar dataKey="GARCH" fill="#ea580c" />
              <Bar dataKey="Market" fill="#15803d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">Hist vs GARCH vs Market Price — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={getRow3Data(illiquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: 9 }} />
              <Bar dataKey="BSM Hist" fill="#3b82f6" />
              <Bar dataKey="GARCH" fill="#ea580c" />
              <Bar dataKey="Market" fill="#15803d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 4: Volatility Path */}
      <div className="chart-container" style={{ marginTop: '32px' }}>
        <div className="chart-title">GARCH(1,1) Conditional Volatility Path (Annualized %)</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={RETURNS_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 8 }} interval={20} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="liqVol" name={liquid.ticker} stroke="#3b82f6" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="illiqVol" name={illiquid.ticker} stroke="#b91c1c" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="table-container" style={{ marginTop: '32px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          Volatility Summary Statistics
        </div>
        <table>
          <thead>
            <tr>
              <th>Security</th>
              <th>Hist Vol</th>
              <th>GARCH Vol</th>
              <th>Persistence</th>
              <th>Long-run Vol</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>{liquid.ticker}</td>
              <td>{liquid.vol.histVol}%</td>
              <td>{liquid.vol.garchVol.toFixed(2)}%</td>
              <td>{liquid.vol.persistence.toFixed(4)}</td>
              <td>{liquid.vol.longRunVol.toFixed(2)}%</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>{illiquid.ticker}</td>
              <td>{illiquid.vol.histVol}%</td>
              <td>{illiquid.vol.garchVol.toFixed(2)}%</td>
              <td>{illiquid.vol.persistence.toFixed(4)}</td>
              <td>{illiquid.vol.longRunVol.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
