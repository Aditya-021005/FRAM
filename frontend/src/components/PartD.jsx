import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend, LineChart, Line } from 'recharts';
import { VAR_DATA, VAR_METHODS } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) + '%' : p.value}</p>
      ))}
    </div>
  );
};

export default function PartD() {
  const liquidVar = VAR_DATA.filter(d => d.ticker === "HDFCBANK.NS");
  const illiquidVar = VAR_DATA.filter(d => d.ticker === "SHRIRAMFIN.NS");

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-badge rose">Part D</div>
        <h2 className="section-title">Value at Risk (VaR) Analysis</h2>
        <p className="section-subtitle">Measurement of potential losses across different regimes and methodologies (Parametric, GARCH, and Monte Carlo).</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="chart-container">
          <div className="chart-title">1-Day VaR (%) by Regime — HDFCBANK</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={liquidVar.filter(d => d.conf === "99%")} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="regime" tick={{ fontSize: 10, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="varPct" name="99% VaR (%)" fill="#09090b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <div className="chart-title">1-Day VaR (%) by Regime — SHRIRAMFIN</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={illiquidVar.filter(d => d.conf === "99%")} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="regime" tick={{ fontSize: 10, fill: '#71717a' }} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="varPct" name="99% VaR (%)" fill="#71717a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Parametric VaR Summary Table (Per ₹10L Position)</span></div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Regime</th>
                <th>Conf.</th>
                <th>Daily Vol (%)</th>
                <th>VaR (%)</th>
                <th>VaR (₹)</th>
              </tr>
            </thead>
            <tbody>
              {VAR_DATA.map((v, i) => (
                <tr key={i}>
                  <td>{v.ticker.replace('.NS', '')}</td>
                  <td>{v.regime}</td>
                  <td>{v.conf}</td>
                  <td>{v.dailyVol.toFixed(2)}%</td>
                  <td>{v.varPct.toFixed(2)}%</td>
                  <td>₹{v.varRs.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insight-box rose">
        <div className="insight-title">💡 Risk Concentration</div>
        <div className="insight-text">
          The illiquid stock (SHRIRAMFIN) has a significantly higher VaR compared to the liquid one. 
          Under the "High-Vol" regime, the 99% 1-day VaR for SHRIRAMFIN reaches 7.27%, meaning there is a 1% chance 
          of losing more than ₹72,700 on a ₹10L position in a single day.
        </div>
      </div>
    </div>
  );
}
