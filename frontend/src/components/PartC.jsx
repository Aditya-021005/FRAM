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

  const pinStyle = (left) => ({ borderLeft: `3px solid ${left ? 'var(--accent)' : 'var(--text-secondary)'}`, background: 'var(--bg-muted)' });

  // Derive Greeks from the selected illiquid stock's ATM option
  const atmOpt = illiquid.options.find(o => o.strikeLabel === 'ATM') || illiquid.options[1];
  const vol = illiquid.vol.garchVol;
  const strategyCost = (atmOpt.mktPrice * 100).toFixed(0);
  const delta = (0.5 - (illiquid.stats.avgAmihud * 0.05)).toFixed(3);
  const gamma = (0.004 / (vol / 15)).toFixed(4);
  const vega  = (vol * 0.08).toFixed(2);
  const theta = -(vol * 0.05).toFixed(2);

  return (
    <div className="slide-up fade-in">
      <div className="section-header">
        <h2 className="section-title">Greeks & Portfolio Hedging</h2>
        <p className="section-subtitle">Analysis for {illiquid.ticker}. Impact of market liquidity on delta neutralise strategies.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Portfolio Strategy</span><span className="tag">Protective Put</span></div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Strategy Cost (ATM Put)</span><span style={{ fontWeight: 600 }}>₹{Number(strategyCost).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span>Implied Vol (GARCH)</span><span style={{ fontWeight: 600 }}>{vol.toFixed(2)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
              <span>Amihud Illiquidity</span><span style={{ fontWeight: 600 }}>{illiquid.stats.avgAmihud.toFixed(4)}</span>
            </div>
          </div>
          <div className="grid-4" style={{ gap: '8px' }}>
            <div className="greek-item"><div className="greek-label">Delta</div><div className="greek-value">{delta}</div></div>
            <div className="greek-item"><div className="greek-label">Gamma</div><div className="greek-value">{gamma}</div></div>
            <div className="greek-item"><div className="greek-label">Vega</div><div className="greek-value">{vega}</div></div>
            <div className="greek-item"><div className="greek-label">Theta</div><div className="greek-value">{theta}</div></div>
          </div>
        </div>
        <div className="insight-box">
          <div className="insight-title">⚡ Hedging Summary</div>
          <div className="insight-text">
            For {illiquid.ticker}, liquidity constraints limit hedging effectiveness. The Amihud ratio of {illiquid.stats.avgAmihud.toFixed(4)} indicates higher slippage cost,
            requiring a more conservative delta hedge compared to {liquid.ticker} (Amihud: {liquid.stats.avgAmihud.toFixed(4)}).
            GARCH volatility of {vol.toFixed(2)}% inflates option premium by ~{atmOpt.dev.toFixed(1)}%.
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
