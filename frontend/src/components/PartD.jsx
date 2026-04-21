import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PartD({ illiquid }) {
  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Value at Risk (VaR) Analysis</h2>
        <p className="section-subtitle">Comparing risk across regimes for {illiquid.ticker}.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="chart-container">
          <div className="chart-title">99% 1-Day VaR (%) by Regime — {illiquid.ticker}</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={illiquid.var}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="regime" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: 'var(--bg-muted)' }} />
              <Bar dataKey="varPct" name="VaR %" fill="#09090b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="insight-box" style={{ marginTop: 0 }}>
          <div className="insight-title">💡 Risk Exposure</div>
          <div className="insight-text">
            {illiquid.ticker} shows elevated VaR levels. Under High-Volatility regimes, the potential 1-day loss 
            is estimated at {illiquid.var[1]?.varPct}% (₹{illiquid.var[1]?.varRs.toLocaleString()} per 10L).
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>VaR Summary Table — {illiquid.ticker}</div>
        <table>
          <thead>
            <tr>
              <th>Regime</th>
              <th>Conf.</th>
              <th>VaR (%)</th>
              <th>VaR (₹ per 10L)</th>
            </tr>
          </thead>
          <tbody>
            {(illiquid.var || []).map((v, i) => (
              <tr key={i}>
                <td>{v.regime}</td>
                <td>{v.conf}</td>
                <td>{v.varPct.toFixed(2)}%</td>
                <td>₹{v.varRs.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
