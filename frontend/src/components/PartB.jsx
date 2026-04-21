import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';


const C = { amber: '#f5a623', green: '#39d98a', red: '#ff4d4d', blue: '#5b8dee', muted: '#6b6b78', cyan: '#22d3ee', pink: '#f472b6' };

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

const ChartBox = ({ title, children, style }) => (
  <div style={{ border: '1px solid #2a2a30', background: '#111113', borderRadius: 3, padding: '16px 18px', ...style }}>
    <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }}>{title}</div>
    {children}
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 9, fontWeight: 700, color: C.amber, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
);

const axisProps = { tick: { fontSize: 9, fill: C.muted, fontFamily: 'IBM Plex Mono, monospace' }, axisLine: false, tickLine: false };
const legendStyle = { fontSize: 9, fontFamily: 'IBM Plex Mono, monospace' };

export default function PartB({ illiquid, liquid, returnsData }) {

  const getRow1Data = (stock) => {
    const labels = ['ATM', 'OTM_Call', 'OTM_Put'];
    return labels.map(l => {
      const d29 = stock.options.find(o => o.strikeLabel === l && o.dte === 29);
      const d57 = stock.options.find(o => o.strikeLabel === l && o.dte === 57);
      return { name: l, 'BSM DTE=30': d29?.bsmHist, 'Mkt DTE=30': d29?.mktPrice, 'BSM DTE=60': d57?.bsmHist, 'Mkt DTE=60': d57?.mktPrice };
    });
  };

  const getRow2Data = (stock) => {
    const labels = ['ATM', 'OTM_Call', 'OTM_Put'];
    return labels.map(l => {
      const d29 = stock.options.find(o => o.strikeLabel === l && o.dte === 29);
      const d57 = stock.options.find(o => o.strikeLabel === l && o.dte === 57);
      return { name: l, 'DTE=29': d29?.devPct, 'DTE=57': d57?.devPct };
    });
  };

  const getRow3Data = (stock) => {
    const labels = ['ATM', 'OTM_Call', 'OTM_Put'];
    return labels.map(l => {
      const d29 = stock.options.find(o => o.strikeLabel === l && o.dte === 29);
      return { name: l, 'BSM Hist': d29?.bsmHist, 'GARCH': d29?.bsmGarch, 'Market': d29?.mktPrice };
    });
  };

  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#e8e8ec', animation: 'fadeUp 0.4s ease both' }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, color: C.amber, letterSpacing: '0.14em', marginBottom: 8 }}>PART B · OPTION PRICING</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', color: '#e8e8ec', marginBottom: 6 }}>Ground Truth Analytics</h2>
        <p style={{ fontSize: 11, color: '#e8e8ec', lineHeight: 1.7 }}>
          Comparing BSM benchmarks against GARCH conditional volatilities and market premiums across strike types and tenors.
        </p>
      </div>

      {/* ROW 1 */}
      <Label>BSM (HIST VOL) vs MARKET PRICE</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[{ stock: liquid, tag: 'LIQUID' }, { stock: illiquid, tag: 'ILLIQUID' }].map(({ stock, tag }) => (
          <ChartBox key={tag} title={`BSM vs MKT — ${stock.ticker} (${tag})`}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={getRow1Data(stock)}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
                <Legend iconType="rect" wrapperStyle={legendStyle} />
                <Bar dataKey="BSM DTE=30" fill={C.blue} />
                <Bar dataKey="Mkt DTE=30" fill={C.amber} />
                <Bar dataKey="BSM DTE=60" fill={C.cyan} />
                <Bar dataKey="Mkt DTE=60" fill={C.pink} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        ))}
      </div>

      {/* ROW 2 */}
      <Label>MARKET vs BSM DEVIATION (%)</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[{ stock: liquid, tag: 'LIQUID' }, { stock: illiquid, tag: 'ILLIQUID' }].map(({ stock, tag }) => (
          <ChartBox key={tag} title={`DEVIATION % — ${stock.ticker} (${tag})`}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={getRow2Data(stock)}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} unit="%" />
                <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
                <Legend iconType="rect" wrapperStyle={legendStyle} />
                <Bar dataKey="DTE=29" fill={C.amber} />
                <Bar dataKey="DTE=57" fill={C.red} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        ))}
      </div>

      {/* ROW 3 */}
      <Label>HIST vs GARCH vs MARKET PRICE</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[{ stock: liquid, tag: 'LIQUID' }, { stock: illiquid, tag: 'ILLIQUID' }].map(({ stock, tag }) => (
          <ChartBox key={tag} title={`3-WAY COMPARISON — ${stock.ticker} (${tag})`}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={getRow3Data(stock)}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
                <Legend iconType="rect" wrapperStyle={legendStyle} />
                <Bar dataKey="BSM Hist" fill={C.blue} />
                <Bar dataKey="GARCH"    fill={C.amber} />
                <Bar dataKey="Market"   fill={C.green} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        ))}
      </div>

      {/* GARCH vol path */}
      <Label>GARCH(1,1) CONDITIONAL VOLATILITY PATH</Label>
      <ChartBox title="ANNUALIZED CONDITIONAL VOLATILITY %" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={returnsData}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
            <XAxis dataKey="date" {...axisProps} interval={20} />
            <YAxis {...axisProps} unit="%" />
            <Tooltip content={<TTip />} />
            <Legend wrapperStyle={legendStyle} />
            <Line type="monotone" dataKey="liqVol"   name={liquid.ticker}   stroke={C.green} dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="illiqVol" name={illiquid.ticker} stroke={C.red}   dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>

      <Label>VOLATILITY SUMMARY STATISTICS</Label>
      <div style={{ border: '1px solid #2a2a30', borderRadius: 3, overflow: 'hidden', background: '#111113' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#e8e8ec' }}>
          <thead>
            <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #2a2a30' }}>
              {['SECURITY', 'HIST VOL', 'GARCH VOL', 'PERSISTENCE', 'LONG-RUN VOL'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9, fontWeight: 700, background: '#0a0a0b', color: '#e8e8ec', borderBottom: '1px solid #2a2a30', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[{ s: liquid, color: C.green, tag: 'LIQ' }, { s: illiquid, color: C.red, tag: 'ILL' }].map(({ s, color, tag }) => (
              <tr key={tag} style={{ borderBottom: '1px solid #1e1e24' }}>
                <td style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#e8e8ec' }}>
                  <span style={{ background: color, color: '#000', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>{tag}</span>
                  {s.ticker}
                </td>
                <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{s.vol.histVol}%</td>
                <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{s.vol.garchVol.toFixed(2)}%</td>
                <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{s.vol.persistence.toFixed(4)}</td>
                <td style={{ padding: '10px 16px', color: C.amber }}>{s.vol.longRunVol.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}