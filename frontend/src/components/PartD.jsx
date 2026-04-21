import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, Cell, AreaChart, Area, ComposedChart, ReferenceLine 
} from 'recharts';
import { HISTOGRAM_DATA, RETURNS_DATA } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartD({ illiquid, liquid }) {

  const getRegimeData = (stock) => {
    const regimes = ["Full Period", "Normal", "High-Vol"];
    return regimes.map(r => ({
      name: r,
      'VaR 95%': stock.varAnalysis.find(v => v.regime === r && v.conf === '95%')?.varPct,
      'VaR 99%': stock.varAnalysis.find(v => v.regime === r && v.conf === '99%')?.varPct,
    }));
  };

  const getMethodData = () => {
    const methods = ["Parametric-Normal", "GARCH(1,1)", "MC-Historical", "MC-GARCH"];
    return methods.map(m => ({
      name: m,
      'HDFCBANK 95%': liquid.varMethods.find(v => v.method === m)?.c95,
      'HDFCBANK 99%': liquid.varMethods.find(v => v.method === m)?.c99,
      'NESTLEIND 95%': illiquid.varMethods.find(v => v.method === m)?.c95,
      'NESTLEIND 99%': illiquid.varMethods.find(v => v.method === m)?.c99,
    }));
  };

  const HistogramView = ({ dataKey, title, var95, var99, color }) => (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={HISTOGRAM_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="bi" tick={{ fontSize: 9 }} label={{ value: 'Daily Log Return (%)', position: 'bottom', fontSize: 10, offset: 0 }} />
          <YAxis tick={{ fontSize: 9 }} label={{ value: 'Density', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} name="Empirical Returns" fill={color} fillOpacity={0.6} barSize={12} />
          <ReferenceLine x={var95.toFixed(1)} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: '95%', position: 'top', fill: '#3b82f6', fontSize: 9 }} />
          <ReferenceLine x={var99.toFixed(1)} stroke="#dc2626" strokeDasharray="5 5" label={{ value: '99%', position: 'top', fill: '#dc2626', fontSize: 9 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '10px', marginTop: '8px' }}>
         <span style={{ color: '#3b82f6' }}>-- VaR 95% = {var95}%</span>
         <span style={{ color: '#dc2626' }}>-- VaR 99% = {var99}%</span>
      </div>
    </div>
  );

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Value at Risk (VaR) & Stress Analysis</h2>
        <p className="section-subtitle">Stressed risk assessment comparing parametric methods with conditional volatility and Monte Carlo simulations.</p>
      </div>

      {/* Row 1: Distribution */}
      <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <HistogramView dataKey="hdfc" title={`Return Distribution — ${liquid.ticker}`} var95={2.47} var99={3.37} color="#3b82f6" />
        <HistogramView dataKey="nestle" title={`Return Distribution — ${illiquid.ticker}`} var95={1.80} var99={2.51} color="#f87171" />
      </div>

      {/* Row 2: Regime Comparison */}
      <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="chart-container">
          <div className="chart-title">1-Day VaR by Volatility Regime — {liquid.ticker}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={getRegimeData(liquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: 'VaR (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="VaR 95%" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="VaR 99%" fill="#f87171" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">1-Day VaR by Volatility Regime — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={getRegimeData(illiquid)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: 'VaR (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="VaR 95%" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="VaR 99%" fill="#f87171" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Method Comparison */}
      <div className="chart-container" style={{ marginBottom: '24px' }}>
        <div className="chart-title">VaR Comparison Across Methods (Full Period) — 95% & 99% Confidence</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getMethodData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: 'VaR (%)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="HDFCBANK 95%" fill="#3b82f6" fillOpacity={0.7} />
            <Bar dataKey="NESTLEIND 95%" fill="#f87171" fillOpacity={0.7} />
            <Bar dataKey="HDFCBANK 99%" fill="#1d4ed8" />
            <Bar dataKey="NESTLEIND 99%" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4: Rolling VaR */}
      <div className="chart-container" style={{ marginBottom: '40px' }}>
        <div className="chart-title">Rolling 20-Day Parametric VaR (99%) — Full Period</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={RETURNS_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 8 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="hdfcVaR" name={`${liquid.ticker} VaR 99%`} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            <Area type="monotone" dataKey="nestleVaR" name={`${illiquid.ticker} VaR 99%`} stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
            <Area dataKey="isHighVolLiq" name="High-Vol Regime (Liq)" fill="#3b82f6" fillOpacity={0.05} stroke="none" />
            <Area dataKey="isHighVolIlliq" name="High-Vol Regime (Illiq)" fill="#dc2626" fillOpacity={0.05} stroke="none" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>Shaded Areas = High Volatility Clusters (Top 25% rolling vol days)</div>
      </div>

      {/* Tables */}
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Parametric VaR Matrix (95% & 99% Confidence)</div>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Regime</th>
              <th>Mean (%)</th>
              <th>Daily Vol (%)</th>
              <th>VaR (%)</th>
              <th>VaR (₹ on 10L)</th>
            </tr>
          </thead>
          <tbody>
            {liquid.varAnalysis.map((v, i) => (
              <tr key={`l-${i}`} style={{ background: i < 2 ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                <td>{liquid.ticker}</td>
                <td>{v.regime} ({v.conf})</td>
                <td>{v.mean.toFixed(4)}%</td>
                <td>{v.vol.toFixed(4)}%</td>
                <td>{v.varPct.toFixed(4)}%</td>
                <td style={{ fontWeight: 600 }}>₹{v.varRs.toLocaleString()}</td>
              </tr>
            ))}
            {illiquid.varAnalysis.map((v, i) => (
              <tr key={`i-${i}`} style={{ background: i < 2 ? 'rgba(248, 113, 113, 0.03)' : 'transparent' }}>
                <td>{illiquid.ticker}</td>
                <td>{v.regime} ({v.conf})</td>
                <td>{v.mean.toFixed(4)}%</td>
                <td>{v.vol.toFixed(4)}%</td>
                <td>{v.varPct.toFixed(4)}%</td>
                <td style={{ fontWeight: 600 }}>₹{v.varRs.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>GARCH & Monte Carlo VaR Comparison</div>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Method</th>
              <th>Cond Vol (%)</th>
              <th>VaR 95% (%)</th>
              <th>VaR 99% (%)</th>
              <th>Capital at Risk (99%)</th>
            </tr>
          </thead>
          <tbody>
            {liquid.varMethods && liquid.varMethods.length > 1 && (
              <>
                <tr>
                  <td>{liquid.ticker}</td>
                  <td style={{ fontWeight: 600 }}>GARCH(1,1)</td>
                  <td>{(liquid.vol?.dailyCondVol || 0).toFixed(4)}%</td>
                  <td>{(liquid.varMethods[1]?.c95 || 0).toFixed(4)}%</td>
                  <td>{(liquid.varMethods[1]?.c99 || 0).toFixed(4)}%</td>
                  <td>₹{(liquid.varMethods[1]?.c99 * 10000 || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>{illiquid.ticker}</td>
                  <td style={{ fontWeight: 600 }}>GARCH(1,1)</td>
                  <td>{(illiquid.vol?.dailyCondVol || 0).toFixed(4)}%</td>
                  <td>{(illiquid.varMethods[1]?.c95 || 0).toFixed(4)}%</td>
                  <td>{(illiquid.varMethods[1]?.c99 || 0).toFixed(4)}%</td>
                  <td>₹{(illiquid.varMethods[1]?.c99 * 10000 || 0).toLocaleString()}</td>
                </tr>
              </>
            )}
            {liquid.varMethods && liquid.varMethods.length > 2 && (
              <>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td>{liquid.ticker}</td>
                  <td>MC-Historical</td>
                  <td>-</td>
                  <td>{(liquid.varMethods[2]?.c95 || 0).toFixed(4)}%</td>
                  <td>{(liquid.varMethods[2]?.c99 || 0).toFixed(4)}%</td>
                  <td>₹{(liquid.varMethods[2]?.c99 * 10000 || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>{illiquid.ticker}</td>
                  <td>MC-Historical</td>
                  <td>-</td>
                  <td>{(illiquid.varMethods[2]?.c95 || 0).toFixed(4)}%</td>
                  <td>{(illiquid.varMethods[2]?.c99 || 0).toFixed(4)}%</td>
                  <td>₹{(illiquid.varMethods[2]?.c99 * 10000 || 0).toLocaleString()}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
