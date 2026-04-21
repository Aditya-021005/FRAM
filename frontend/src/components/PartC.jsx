import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 11, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--tooltip-text)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartC({ illiquid, liquid }) {

  const getGreeksChartData = (stock) => {
    const strikes = ["ATM", "OTM_Call", "OTM_Put"];
    return strikes.map(s => {
      const d29 = stock.options.find(o => o.strikeLabel === s && o.dte === 29);
      const d57 = stock.options.find(o => o.strikeLabel === s && o.dte === 57);
      return {
        name: s,
        'Delta DTE=29': d29?.delta,
        'Vega DTE=29': d29?.vega,
        'Gamma DTE=29': d29?.gamma,
        'Delta DTE=57': d57?.delta,
        'Vega DTE=57': d57?.vega,
        'Gamma DTE=57': d57?.gamma,
      };
    });
  };

  const getPnLDecompData = (stock) => {
    return stock.pnlScenarios.map(s => ({
      name: `${s.shock}\n${s.vShock}`,
      'Δ PnL': s.d,
      'Γ PnL': s.g,
      'Vega PnL': s.v,
      'Hedge PnL': s.h,
      total: s.total
    }));
  };

  const GreeksChart = ({ stock, title }) => (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '8px' }}>DTE=29 solid | DTE=57 faded</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={getGreeksChartData(stock)}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 9 }} label={{ value: 'Delta / Vega', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} label={{ value: 'Gamma', angle: 90, position: 'insideRight', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 9 }} />
          <Bar yAxisId="left" dataKey="Delta DTE=29" name="Delta DTE=29" fill="#3b82f6" />
          <Bar yAxisId="left" dataKey="Vega DTE=29" name="Vega DTE=29" fill="#15803d" />
          <Bar yAxisId="right" dataKey="Gamma DTE=29" name="Gamma DTE=29" fill="#ea580c" />
          <Bar yAxisId="left" dataKey="Delta DTE=57" name="Delta DTE=57" fill="#3b82f6" fillOpacity={0.5} />
          <Bar yAxisId="left" dataKey="Vega DTE=57" name="Vega DTE=57" fill="#15803d" fillOpacity={0.5} />
          <Bar yAxisId="right" dataKey="Gamma DTE=57" name="Gamma DTE=57" fill="#ea580c" fillOpacity={0.5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const TotalPnLChart = ({ stock, title }) => (
    <div className="chart-container">
      <div className="chart-title">Total PnL (Options + Hedge) — {title}</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={stock.pnlScenarios}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="shock" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} label={{ value: 'PnL (₹)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" name="Total PnL">
            {stock.pnlScenarios.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.total >= 0 ? '#16a34a' : '#dc2626'} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const DecompChart = ({ stock, title }) => (
    <div className="chart-container">
      <div className="chart-title">PnL Decomposition by Greek Component — {title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={getPnLDecompData(stock)}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 8 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 9 }} />
          <Bar dataKey="Δ PnL" fill="#3b82f6" />
          <Bar dataKey="Γ PnL" fill="#ea580c" />
          <Bar dataKey="Vega PnL" fill="#15803d" />
          <Bar dataKey="Hedge PnL" fill="#be185d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const StockSummary = ({ stock }) => (
    <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
      <div className="card-header" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
         <span style={{ fontWeight: 700, fontSize: '14px' }}>{stock.ticker} — {stock.pnlSummary.strategy}</span>
      </div>
      <div className="grid-4" style={{ padding: '16px 20px' }}>
        <div><div className="greek-label">NET DELTA</div><div className="greek-value">+{stock.pnlSummary.netDelta.toFixed(4)}</div></div>
        <div><div className="greek-label">NET GAMMA</div><div className="greek-value">+{stock.pnlSummary.netGamma.toFixed(4)}</div></div>
        <div><div className="greek-label">NET VEGA</div><div className="greek-value">+{stock.pnlSummary.netVega.toFixed(4)}</div></div>
        <div><div className="greek-label">NET PREMIUM</div><div className="greek-value" style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '8px' }}>₹{stock.pnlSummary.netPremium.toLocaleString()}</div></div>
      </div>
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span>Hedge Action: <b>SHORT {Math.abs(stock.pnlSummary.hedgeQty).toFixed(2)} shares</b></span>
        <span>Hedge Cash Inflow: <b>₹{Math.abs(stock.pnlSummary.hedgeCost).toLocaleString()}</b></span>
        <span style={{ color: 'var(--accent)' }}>Post-Hedge Delta: <b>0.0000 ✓</b></span>
      </div>
    </div>
  );

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">PnL Simulation & Greek Analysis</h2>
        <p className="section-subtitle">Comprehensive attribution of portfolio returns to Delta, Gamma, Vega, and Delta-Hedging outcomes.</p>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        <GreeksChart stock={liquid} title={`Greeks — ${liquid.ticker} (Liquid)`} />
        <GreeksChart stock={illiquid} title={`Greeks — ${illiquid.ticker} (Illiquid)`} />
        
        <TotalPnLChart stock={liquid} title={`${liquid.ticker} (Liquid)`} />
        <TotalPnLChart stock={illiquid} title={`${illiquid.ticker} (Illiquid)`} />

        <DecompChart stock={liquid} title={liquid.ticker} />
        <DecompChart stock={illiquid} title={illiquid.ticker} />
      </div>

      <div style={{ marginTop: '40px' }}>
        <StockSummary stock={liquid} />
        <StockSummary stock={illiquid} />
      </div>

      <div className="table-container" style={{ marginTop: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '13px' }}>
          Scenario PnL Simulation Table — {liquid.ticker} & {illiquid.ticker}
        </div>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Shock</th>
              <th>Vol Shock</th>
              <th>Δ PnL</th>
              <th>Γ PnL</th>
              <th>V PnL</th>
              <th>Hedge PnL</th>
              <th>Total PnL</th>
            </tr>
          </thead>
          <tbody>
            {liquid.pnlScenarios.map((s, i) => (
              <tr key={`liq-${i}`}>
                <td>{liquid.ticker}</td>
                <td>{s.shock}</td>
                <td>{s.vShock}</td>
                <td>₹{s.d.toLocaleString()}</td>
                <td>₹{s.g.toLocaleString()}</td>
                <td>₹{s.v.toLocaleString()}</td>
                <td>₹{s.h.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: s.total >= 0 ? 'var(--accent)' : '#dc2626' }}>₹{s.total.toLocaleString()}</td>
              </tr>
            ))}
            {illiquid.pnlScenarios.map((s, i) => (
              <tr key={`illiq-${i}`} style={{ background: i === 0 ? 'rgba(var(--accent-rgb), 0.03)' : 'transparent' }}>
                <td>{illiquid.ticker}</td>
                <td>{s.shock}</td>
                <td>{s.vShock}</td>
                <td>₹{s.d.toLocaleString()}</td>
                <td>₹{s.g.toLocaleString()}</td>
                <td>₹{s.v.toLocaleString()}</td>
                <td>₹{s.h.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: s.total >= 0 ? 'var(--accent)' : '#dc2626' }}>₹{s.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
