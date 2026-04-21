import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from 'recharts';
import { GREEKS_DATA, PORTFOLIO, PNL_DATA } from '../data';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</p>
      ))}
    </div>
  );
};

export default function PartC() {
  const p = PORTFOLIO;
  
  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Greeks & Portfolio Hedging</h2>
        <p className="section-subtitle">Analysis of net Greeks for multi-leg strategies and the impact of liquidity on delta hedging accuracy.</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">{p.liquid.strategy}</span>
            <span className="tag liquid">Liquid</span>
          </div>
          <div style={{ marginBottom: 24 }}>
            {p.liquid.legs.map((leg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <span style={{ fontWeight: 500 }}>{leg.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{leg.position > 0 ? '+' : ''}{leg.position} Lot @ ₹{leg.price}</span>
              </div>
            ))}
          </div>
          <div className="grid-4" style={{ gap: '12px' }}>
            <div className="greek-item">
              <div className="greek-label">Delta</div>
              <div className="greek-value">{p.liquid.netDelta.toFixed(1)}</div>
            </div>
            <div className="greek-item">
              <div className="greek-label">Gamma</div>
              <div className="greek-value">{p.liquid.netGamma.toFixed(3)}</div>
            </div>
            <div className="greek-item">
              <div className="greek-label">Vega</div>
              <div className="greek-value">{p.liquid.netVega.toFixed(0)}</div>
            </div>
            <div className="greek-item">
              <div className="greek-label">Premium</div>
              <div className="greek-value">₹{p.liquid.netPremium / 1000}k</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{p.illiquid.strategy}</span>
            <span className="tag illiquid">Illiquid</span>
          </div>
          <div style={{ marginBottom: 24 }}>
            {p.illiquid.legs.map((leg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                <span style={{ fontWeight: 500 }}>{leg.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{leg.position > 0 ? '+' : ''}{leg.position} Lot @ ₹{leg.price}</span>
              </div>
            ))}
          </div>
          <div className="grid-4" style={{ gap: '12px' }}>
            <div className="greek-item">
              <div className="greek-label">Delta</div>
              <div className="greek-value">{p.illiquid.netDelta.toFixed(1)}</div>
            </div>
            <div className="greek-item">
              <div className="greek-label">Gamma</div>
              <div className="greek-value">{p.illiquid.netGamma.toFixed(3)}</div>
            </div>
            <div className="greek-item">
              <div className="greek-label">Vega</div>
              <div className="greek-value">{p.illiquid.netVega.toFixed(0)}</div>
            </div>
            <div className="greek-item">
              <div className="greek-label">Premium</div>
              <div className="greek-value">₹{p.illiquid.netPremium / 1000}k</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 32 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Delta Hedging Simulation</span></div>
          <div className="vol-comparison" style={{ gridTemplateColumns: '1fr' }}>
             {[
               ['Liquid Hedge Requirement', `${p.liquid.hedgeShares.toFixed(2)} Shares`],
               ['Illiquid Theoretical Hedge', `${p.illiquid.hedgeShares.toFixed(2)} Shares`],
               ['Liquidity Adjustment (Amihud)', `${(p.illiquid.liqAdjFactor * 100).toFixed(2)}%`],
               ['Executed Hedge (Slippage Adjusted)', `${p.illiquid.adjHedge.toFixed(2)} Shares`]
             ].map(([l, v], i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 3 ? 'none' : '1px solid var(--border)', fontSize: '14px' }}>
                 <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                 <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{v}</span>
               </div>
             ))}
          </div>
        </div>
        <div className="insight-box">
          <div className="insight-title">⚡ Hedging Summary</div>
          <div className="insight-text">
            While the liquid portfolio achieves 99%+ hedging efficiency, the illiquid stock requires a significant haircut 
            to the delta hedge ({ (p.illiquid.liqAdjFactor * 100).toFixed(2) }%) to prevent extreme market impact. 
            This results in a residual delta of <strong>{p.illiquid.residualDelta.toFixed(2)}</strong>, exposing the 
            portfolio to directional risk that cannot be neutralized without incurring prohibitive costs.
          </div>
        </div>
      </div>

      <div className="table-container">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '14px' }}>PnL Scenario Analysis</div>
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Price/Vol Shock</th>
              <th>Delta PnL</th>
              <th>Gamma PnL</th>
              <th>Vega PnL</th>
              <th>Hedge PnL</th>
              <th>Total PnL</th>
            </tr>
          </thead>
          <tbody>
            {PNL_DATA.map((d, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'Inter', fontWeight: 500 }}>{d.ticker}</td>
                <td>{d.priceShock} / {d.volShock}</td>
                <td>{d.pnlDelta.toFixed(1)}</td>
                <td>{d.pnlGamma.toFixed(1)}</td>
                <td>{d.pnlVega.toFixed(1)}</td>
                <td>{d.hedgePnl.toFixed(1)}</td>
                <td><span className={`tag ${d.totalPnl >= 0 ? 'positive' : 'negative'}`}>₹{d.totalPnl.toFixed(1)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
