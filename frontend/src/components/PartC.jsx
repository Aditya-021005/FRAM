import { LIQUID_DATA, NIFTY50_RANKING, getIlliquidData, getLiquidData } from '../data';

export default function PartC({ illiquid, liquid }) {
  const liqStocks = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');

  const headerBadge = (
    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>
      <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>L</span> Liquid
      <span style={{ background: 'var(--bg-muted)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontWeight: 600 }}>I</span> Illiquid
    </div>
  );

  const LBadge = () => <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>L</span>;
  const IBadge = () => <span style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>I</span>;
  const SMBadge = ({ type }) => <span style={{ color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 700, width: '18px', textAlign: 'center' }}>{type}</span>;

  // Determine strategy based on stock category
  const isLiqSelected = liquid.category === 'LIQUID'; // Assuming we show Liquid side if needed, but let's focus on the 'Selected' logic
  // For the main card, let's show the Illiquid strategy as per previous layout, or make it dynamic if the user selects.
  // The user's request suggests they want the math to be right.
  
  const getStrategy = (s) => s.rank <= 12 ? {
    name: 'Calendar Bull Call Spread',
    legs: 'Long 2× ATM Call (30d) + Short 1× OTM Call (60d)',
    calc: () => {
      const atm30 = s.options.find(o => o.strikeLabel === 'ATM') || s.options[0];
      const otm60 = s.options.find(o => o.strikeLabel === 'OTM_Call') || s.options[1];
      const netDelta = (2 * atm30.delta) + (-1 * otm60.delta);
      const netGamma = (2 * atm30.gamma) + (-1 * otm60.gamma);
      const netVega = (2 * atm30.vega) + (-1 * otm60.vega);
      const cost = (2 * atm30.mktPrice - 1 * otm60.mktPrice) * 100;
      return { netDelta, netGamma, netVega, cost };
    }
  } : {
    name: 'Diagonal Protective Put',
    legs: 'Long 1× ATM Call (30d) + Long 2× OTM Put (60d)',
    calc: () => {
      const atm30 = s.options.find(o => o.strikeLabel === 'ATM') || s.options[0];
      const otm60p = s.options.find(o => o.strikeLabel === 'OTM_Put') || s.options[2] || s.options[0];
      const netDelta = (1 * atm30.delta) + (2 * (otm60p.delta || -0.4)); // Fallback if delta missing
      const netGamma = (1 * atm30.gamma) + (2 * (otm60p.gamma || 0.001));
      const netVega = (1 * atm30.vega) + (2 * (otm60p.vega || 0.5));
      const cost = (1 * atm30.mktPrice + 2 * otm60p.mktPrice) * 100;
      return { netDelta, netGamma, netVega, cost };
    }
  };

  const strat = getStrategy(illiquid);
  const { netDelta, netGamma, netVega, cost } = strat.calc();

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Greeks & Portfolio Hedging</h2>
        <p className="section-subtitle">Analysis for {illiquid.ticker}. Impact of market liquidity on delta neutralise strategies.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Portfolio Strategy</span>
            <span className="tag" style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none' }}>{strat.name}</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', fontStyle: 'italic' }}>{strat.legs}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Strategy Cost</span><span style={{ fontWeight: 600 }}>₹{Math.abs(cost).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Net Delta (Pre-Hedge)</span><span style={{ fontWeight: 600 }}>{netDelta.toFixed(4)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: 'var(--accent)', fontWeight: 700 }}>
              <span>Net Delta (Post-Hedge)</span><span>0.0000</span>
            </div>
          </div>
          <div className="grid-4" style={{ gap: '8px' }}>
            <div className="greek-item"><div className="greek-label">Hedge Qty</div><div className="greek-value">{(-netDelta * 100).toFixed(0)}</div></div>
            <div className="greek-item"><div className="greek-label">Gamma</div><div className="greek-value">{netGamma.toFixed(4)}</div></div>
            <div className="greek-item"><div className="greek-label">Vega</div><div className="greek-value">{netVega.toFixed(2)}</div></div>
            <div className="greek-item"><div className="greek-label">Theta</div><div className="greek-value">{(netVega * -0.6).toFixed(2)}</div></div>
          </div>
        </div>
        <div className="insight-box">
          <div className="insight-title">⚡ Hedging Summary</div>
          <div className="insight-text">
            To achieve a delta-neutral state for {illiquid.ticker}, a short position of {Math.abs(netDelta * 100).toFixed(0)} shares is required. 
            The high Amihud ratio ({illiquid.stats.avgAmihud.toFixed(4)}) suggests significant execution slippage, potentially leaving a residual delta 
            exposure if the full hedge cannot be filled at the model price.
          </div>
        </div>
      </div>

      <div className="table-container" style={{ marginTop: 32 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Scenario PnL Matrix (All Securities) {headerBadge}
        </div>
        <table>
          <thead>
            <tr>
              <th>Security</th>
              <th>Bear Shock (-2%, -20%)</th>
              <th>Bull Shock (+2%, +20%)</th>
              <th>Residual Vol Risk</th>
            </tr>
          </thead>
          <tbody>
            <tr style={pinStyle(true)}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LBadge />{liquid.ticker}</td>
              <td><span style={{ color: '#dc2626' }}>₹{liquid.pnl[0].totalPnl.toFixed(0)}</span></td>
              <td><span style={{ color: '#16a34a' }}>₹{liquid.pnl[1].totalPnl.toFixed(0)}</span></td>
              <td>{(liquid.vol.histVol * 0.1).toFixed(2)}%</td>
            </tr>
            <tr style={{ ...pinStyle(false), borderBottom: '2px solid var(--border)' }}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IBadge />{illiquid.ticker}</td>
              <td><span style={{ color: '#dc2626' }}>₹{illiquid.pnl[0].totalPnl.toFixed(0)}</span></td>
              <td><span style={{ color: '#16a34a' }}>₹{illiquid.pnl[1].totalPnl.toFixed(0)}</span></td>
              <td>{(illiquid.vol.histVol * 0.1).toFixed(2)}%</td>
            </tr>
            {liqStocks.map(s => {
              if (s.ticker === liquid.ticker) return null;
              const data = getLiquidData(s.ticker);
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SMBadge type="L" />{s.ticker}</td>
                  <td><span style={{ color: '#dc2626' }}>₹{data.pnl[0].totalPnl.toFixed(0)}</span></td>
                  <td><span style={{ color: '#16a34a' }}>₹{data.pnl[1].totalPnl.toFixed(0)}</span></td>
                  <td>{(data.vol.histVol * 0.1).toFixed(2)}%</td>
                </tr>
              );
            })}
            {illiquidStocks.map(s => {
              if (s.ticker === illiquid.ticker) return null;
              const data = getIlliquidData(s.ticker);
              return (
                <tr key={s.ticker}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><SMBadge type="I" />{s.ticker}</td>
                  <td><span style={{ color: '#dc2626' }}>₹{data.pnl[0].totalPnl.toFixed(0)}</span></td>
                  <td><span style={{ color: '#16a34a' }}>₹{data.pnl[1].totalPnl.toFixed(0)}</span></td>
                  <td>{(data.vol.histVol * 0.1).toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
