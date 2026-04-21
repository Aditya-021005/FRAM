import { LIQUID_DATA } from '../data';

export default function PartC({ illiquid }) {
  // Use mock portfolio data based on selected ticker
  const mockPremium = illiquid.ticker.includes('NESTLE') ? 42150 : 32870;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Greeks & Portfolio Hedging</h2>
        <p className="section-subtitle">Analysis for {illiquid.ticker}.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Portfolio Strategy</span><span className="tag">Protective Put</span></div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Strategy Cost</span><span style={{ fontWeight: 600 }}>₹{mockPremium.toLocaleString()}</span>
            </div>
          </div>
          <div className="grid-4" style={{ gap: '8px' }}>
            <div className="greek-item"><div className="greek-label">Delta</div><div className="greek-value">0.48</div></div>
            <div className="greek-item"><div className="greek-label">Gamma</div><div className="greek-value">0.003</div></div>
            <div className="greek-item"><div className="greek-label">Vega</div><div className="greek-value">1.4</div></div>
            <div className="greek-item"><div className="greek-label">Theta</div><div className="greek-value">-0.8</div></div>
          </div>
        </div>
        <div className="insight-box">
          <div className="insight-title">⚡ Hedging Summary</div>
          <div className="insight-text">
            For {illiquid.ticker}, liqudity constraints limit hedging effectiveness. The Amihud ratio indicates a higher slippage cost, 
            requiring a more conservative delta hedge compared to {LIQUID_DATA.ticker}.
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: 32 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>PnL Scenarios — {illiquid.ticker}</div>
        <table>
          <thead>
            <tr>
              <th>Shock</th>
              <th>Total PnL</th>
            </tr>
          </thead>
          <tbody>
            {(illiquid.pnl || []).map((d, i) => (
              <tr key={i}>
                <td>Index {d.priceShock} / Vol {d.volShock}</td>
                <td><span className={`tag ${d.totalPnl >= 0 ? 'positive' : 'negative'}`}>₹{d.totalPnl.toFixed(1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
