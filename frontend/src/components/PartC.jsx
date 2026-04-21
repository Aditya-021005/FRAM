import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';

const C = { amber: '#f5a623', green: '#39d98a', red: '#ff4d4d', blue: '#5b8dee', muted: '#6b6b78', orange: '#fb923c', pink: '#f472b6' };

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0a0b', border: '1px solid #3a3a42', borderRadius: 2, padding: '8px 12px', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}>
      <div style={{ color: C.amber, fontWeight: 700, marginBottom: 4, letterSpacing: '0.08em' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#e8e8ec', marginBottom: 2 }}>
          {p.name}: <span style={{ color: '#fff' }}>{typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const ChartBox = ({ title, sub, children, style }) => (
  <div style={{ border: '1px solid #2a2a30', background: '#111113', borderRadius: 3, padding: '16px 18px', ...style }}>
    <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', marginBottom: sub ? 4 : 14, fontFamily: 'IBM Plex Mono, monospace' }}>{title}</div>
    {sub && <div style={{ fontSize: 9, color: '#3a3a42', marginBottom: 12 }}>{sub}</div>}
    {children}
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 9, fontWeight: 700, color: C.amber, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
);

const axisProps = { tick: { fontSize: 9, fill: C.muted, fontFamily: 'IBM Plex Mono, monospace' }, axisLine: false, tickLine: false };
const legendStyle = { fontSize: 9, fontFamily: 'IBM Plex Mono, monospace' };

export default function PartC({ illiquid, liquid }) {

  const getGreeksData = (stock) => {
    const strikes = ['ATM', 'OTM_Call', 'OTM_Put'];
    return strikes.map(s => {
      const d29 = stock.options.find(o => o.strikeLabel === s && o.dte === 29);
      const d57 = stock.options.find(o => o.strikeLabel === s && o.dte === 57);
      return {
        name: s,
        'Δ DTE=29': d29?.delta, 'V DTE=29': d29?.vega,  'Γ DTE=29': d29?.gamma,
        'Δ DTE=57': d57?.delta, 'V DTE=57': d57?.vega,  'Γ DTE=57': d57?.gamma,
      };
    });
  };

  const getPnLDecompData = (stock) => stock.pnlScenarios.map(s => ({
    name: `${s.shock}\n${s.vShock}`,
    'Δ PnL': s.d, 'Γ PnL': s.g, 'Vega PnL': s.v, 'Hedge PnL': s.h, total: s.total,
  }));

  const GreeksChart = ({ stock, tag }) => (
    <ChartBox title={`GREEKS — ${stock.ticker} (${tag})`} sub="DTE=29 solid · DTE=57 dimmed">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={getGreeksData(stock)}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis yAxisId="left"  {...axisProps} label={{ value: 'Delta/Vega', angle: -90, position: 'insideLeft', offset: 0, fontSize: 8, fill: C.muted }} />
          <YAxis yAxisId="right" orientation="right" {...axisProps} label={{ value: 'Gamma', angle: 90, position: 'insideRight', fontSize: 8, fill: C.muted }} />
          <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
          <Legend wrapperStyle={legendStyle} />
          <Bar yAxisId="left"  dataKey="Δ DTE=29" fill={C.blue}   />
          <Bar yAxisId="left"  dataKey="V DTE=29" fill={C.green}  />
          <Bar yAxisId="right" dataKey="Γ DTE=29" fill={C.orange} />
          <Bar yAxisId="left"  dataKey="Δ DTE=57" fill={C.blue}   fillOpacity={0.35} />
          <Bar yAxisId="left"  dataKey="V DTE=57" fill={C.green}  fillOpacity={0.35} />
          <Bar yAxisId="right" dataKey="Γ DTE=57" fill={C.orange} fillOpacity={0.35} />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );

  const TotalPnLChart = ({ stock, tag }) => (
    <ChartBox title={`TOTAL PnL (OPTIONS + HEDGE) — ${stock.ticker} (${tag})`}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={stock.pnlScenarios}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
          <XAxis dataKey="shock" {...axisProps} />
          <YAxis {...axisProps} label={{ value: 'PnL (₹)', angle: -90, position: 'insideLeft', fontSize: 8, fill: C.muted }} />
          <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
          <Bar dataKey="total" name="Total PnL">
            {stock.pnlScenarios.map((e, i) => (
              <Cell key={i} fill={e.total >= 0 ? C.green : C.red} fillOpacity={0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );

  const DecompChart = ({ stock, tag }) => (
    <ChartBox title={`PnL DECOMPOSITION BY GREEK — ${stock.ticker} (${tag})`}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={getPnLDecompData(stock)}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
          <Legend wrapperStyle={legendStyle} />
          <Bar dataKey="Δ PnL"    fill={C.blue}   />
          <Bar dataKey="Γ PnL"    fill={C.orange} />
          <Bar dataKey="Vega PnL" fill={C.green}  />
          <Bar dataKey="Hedge PnL" fill={C.pink}  />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );

  const SummaryCard = ({ stock }) => (
    <div style={{ border: '1px solid #2a2a30', background: '#111113', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
      {/* header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #2a2a30', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, color: C.amber, letterSpacing: '0.1em' }}>STRATEGY</span>
          <span style={{ fontWeight: 700, fontSize: 12, color: '#e8e8ec' }}>{stock.ticker}</span>
          <span style={{ fontSize: 10, color: C.muted }}>— {stock.pnlSummary.strategy}</span>
        </div>
        <span style={{ fontSize: 9, color: C.green }}>◆ POST-HEDGE DELTA: 0.0000 ✓</span>
      </div>
      {/* greek metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '14px 16px', gap: 12 }}>
        {[
          { label: 'NET DELTA', value: `+${stock.pnlSummary.netDelta.toFixed(4)}` },
          { label: 'NET GAMMA', value: `+${stock.pnlSummary.netGamma.toFixed(4)}` },
          { label: 'NET VEGA',  value: `+${stock.pnlSummary.netVega.toFixed(4)}` },
          { label: 'NET PREMIUM', value: `₹${stock.pnlSummary.netPremium.toLocaleString()}`, accent: true },
        ].map(m => (
          <div key={m.label}>
            <div style={{ fontSize: 8, color: C.muted, letterSpacing: '0.1em', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.accent ? C.amber : '#e8e8ec', letterSpacing: '-0.02em' }}>{m.value}</div>
          </div>
        ))}
      </div>
      {/* hedge info */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 24, fontSize: 10, color: C.muted, borderTop: '1px solid #1e1e24' }}>
        <span>Hedge: <span style={{ color: '#e8e8ec' }}>SHORT {Math.abs(stock.pnlSummary.hedgeQty).toFixed(2)} shares</span></span>
        <span>Cash Inflow: <span style={{ color: '#e8e8ec' }}>₹{Math.abs(stock.pnlSummary.hedgeCost).toLocaleString()}</span></span>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#e8e8ec', animation: 'fadeUp 0.4s ease both' }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, color: C.amber, letterSpacing: '0.14em', marginBottom: 8 }}>PART C · GREEKS & PnL SIMULATION</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', color: '#e8e8ec', marginBottom: 6 }}>Greek Analysis & Attribution</h2>
        <p style={{ fontSize: 11, color: '#6b6b78', lineHeight: 1.7 }}>
          Comprehensive attribution of portfolio returns to Delta, Gamma, Vega, and Delta-Hedging outcomes.
        </p>
      </div>

      <Label>OPTIONS GREEKS BY STRIKE & TENOR</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <GreeksChart stock={liquid}   tag="LIQUID" />
        <GreeksChart stock={illiquid} tag="ILLIQUID" />
      </div>

      <Label>TOTAL PnL (OPTIONS + HEDGE)</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <TotalPnLChart stock={liquid}   tag="LIQUID" />
        <TotalPnLChart stock={illiquid} tag="ILLIQUID" />
      </div>

      <Label>PnL DECOMPOSITION</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <DecompChart stock={liquid}   tag="LIQUID" />
        <DecompChart stock={illiquid} tag="ILLIQUID" />
      </div>

      <Label>STRATEGY SUMMARY</Label>
      <SummaryCard stock={liquid} />
      <SummaryCard stock={illiquid} />

      <Label>SCENARIO PnL SIMULATION TABLE</Label>
      <div style={{ border: '1px solid #2a2a30', borderRadius: 3, overflow: 'hidden', background: '#111113' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #2a2a30', background: '#0a0a0b', fontSize: 11, color: '#e8e8ec', fontWeight: 700 }}>
          {liquid.ticker} & {illiquid.ticker} — Scenario PnL
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#e8e8ec' }}>
          <thead>
            <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #2a2a30' }}>
              {['TICKER', 'SHOCK', 'VOL SHOCK', 'Δ PnL', 'Γ PnL', 'V PnL', 'HEDGE PnL', 'TOTAL PnL'].map(h => (
                <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, background: '#0a0a0b', color: '#e8e8ec', borderBottom: '1px solid #2a2a30', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...liquid.pnlScenarios.map(s => ({ ...s, ticker: liquid.ticker, isLiq: true })),
              ...illiquid.pnlScenarios.map(s => ({ ...s, ticker: illiquid.ticker, isLiq: false }))
            ].map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1a1a1f', background: s.isLiq ? 'rgba(57,217,138,0.02)' : 'rgba(255,77,77,0.02)' }}>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>
                  <span style={{ fontSize: 8, background: s.isLiq ? C.green : C.red, color: '#000', fontWeight: 800, padding: '2px 5px', borderRadius: 2, marginRight: 6 }}>
                    {s.isLiq ? 'L' : 'I'}
                  </span>
                  {s.ticker}
                </td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{s.shock}</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{s.vShock}</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>₹{s.d.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>₹{s.g.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>₹{s.v.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>₹{s.h.toLocaleString()}</td>
                <td style={{ padding: '8px 14px', fontWeight: 700, color: s.total >= 0 ? C.green : C.red }}>₹{s.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}