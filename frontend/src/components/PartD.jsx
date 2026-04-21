import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';


const C = { amber: '#f5a623', green: '#39d98a', red: '#ff4d4d', blue: '#5b8dee', muted: '#6b6b78' };

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

export default function PartD({ illiquid, liquid, returnsData, histogramData }) {

  const getRegimeData = (stock) => {
    const regimes = ['Full Period', 'Normal', 'High-Vol'];
    return regimes.map(r => ({
      name: r,
      'VaR 95%': stock.varAnalysis.find(v => v.regime === r && v.conf === '95%')?.varPct,
      'VaR 99%': stock.varAnalysis.find(v => v.regime === r && v.conf === '99%')?.varPct,
    }));
  };

  const getMethodData = () => {
    const methods = ['Parametric-Normal', 'GARCH(1,1)', 'MC-Historical', 'MC-GARCH'];
    return methods.map(m => ({
      name: m,
      [`${liquid.ticker} 95%`]:   liquid.varMethods.find(v => v.method === m)?.c95,
      [`${liquid.ticker} 99%`]:   liquid.varMethods.find(v => v.method === m)?.c99,
      [`${illiquid.ticker} 95%`]: illiquid.varMethods.find(v => v.method === m)?.c95,
      [`${illiquid.ticker} 99%`]: illiquid.varMethods.find(v => v.method === m)?.c99,
    }));
  };

  const HistView = ({ dataKey, ticker, var95, var99, color }) => (
    <ChartBox title={`RETURN DISTRIBUTION — ${ticker}`}>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={histogramData}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
          <XAxis dataKey="bi" {...axisProps} label={{ value: 'Daily Log Return (%)', position: 'bottom', fontSize: 9, fill: C.muted, offset: 0 }} />
          <YAxis {...axisProps} label={{ value: 'Density', angle: -90, position: 'insideLeft', fontSize: 8, fill: C.muted }} />
          <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
          <Bar dataKey={dataKey} name="Empirical" fill={color} fillOpacity={0.6} barSize={10} />
          <ReferenceLine x={var95.toFixed(1)} stroke={C.blue} strokeDasharray="4 4"
            label={{ value: '95%', position: 'top', fill: C.blue, fontSize: 8 }} />
          <ReferenceLine x={var99.toFixed(1)} stroke={C.red} strokeDasharray="4 4"
            label={{ value: '99%', position: 'top', fill: C.red, fontSize: 8 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 9, marginTop: 8, color: C.muted }}>
        <span style={{ color: C.blue }}>━━ VaR 95% = {var95}%</span>
        <span style={{ color: C.red  }}>━━ VaR 99% = {var99}%</span>
      </div>
    </ChartBox>
  );

  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#e8e8ec', animation: 'fadeUp 0.4s ease both' }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, color: C.amber, letterSpacing: '0.14em', marginBottom: 8 }}>PART D · VALUE AT RISK & STRESS ANALYSIS</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', color: '#e8e8ec', marginBottom: 6 }}>Risk Management</h2>
        <p style={{ fontSize: 11, color: '#e8e8ec', lineHeight: 1.7 }}>
          Stressed risk assessment comparing parametric methods with conditional volatility and Monte Carlo simulations.
        </p>
      </div>

      {/* return distributions */}
      <Label>RETURN DISTRIBUTION WITH VaR CUTOFFS</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <HistView 
          dataKey="liqHist" 
          ticker={liquid.ticker} 
          var95={liquid.varAnalysis?.[0]?.varPct || 2.47} 
          var99={liquid.varAnalysis?.[1]?.varPct || 3.37} 
          color={C.blue} 
        />
        <HistView 
          dataKey="illiqHist" 
          ticker={illiquid.ticker} 
          var95={illiquid.varAnalysis?.[0]?.varPct || 1.80} 
          var99={illiquid.varAnalysis?.[1]?.varPct || 2.51} 
          color={C.red} 
        />
      </div>

      {/* regime VaR */}
      <Label>VaR BY VOLATILITY REGIME</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[{ s: liquid, tag: 'LIQUID' }, { s: illiquid, tag: 'ILLIQUID' }].map(({ s, tag }) => (
          <ChartBox key={tag} title={`1-DAY VaR BY REGIME — ${s.ticker} (${tag})`}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={getRegimeData(s)}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} label={{ value: 'VaR (%)', angle: -90, position: 'insideLeft', fontSize: 8, fill: C.muted }} />
                <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
                <Legend wrapperStyle={legendStyle} />
                <Bar dataKey="VaR 95%" fill={C.blue} radius={[2, 2, 0, 0]} />
                <Bar dataKey="VaR 99%" fill={C.red}  radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        ))}
      </div>

      {/* method comparison */}
      <Label>VaR ACROSS METHODS — 95% & 99% CONFIDENCE</Label>
      <ChartBox title="FULL PERIOD · PARAMETRIC, GARCH, MONTE CARLO" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={getMethodData()}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} label={{ value: 'VaR (%)', angle: -90, position: 'insideLeft', fontSize: 8, fill: C.muted }} />
            <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
            <Legend wrapperStyle={legendStyle} />
            <Bar dataKey={`${liquid.ticker} 95%`}   fill={C.blue}         fillOpacity={0.7} />
            <Bar dataKey={`${illiquid.ticker} 95%`} fill={C.red}          fillOpacity={0.7} />
            <Bar dataKey={`${liquid.ticker} 99%`}   fill="#1d4ed8"        />
            <Bar dataKey={`${illiquid.ticker} 99%`} fill="#b91c1c"        />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>

      {/* rolling VaR */}
      <Label>ROLLING 20-DAY PARAMETRIC VaR (99%)</Label>
      <ChartBox title="FULL PERIOD — SHADED AREAS = HIGH-VOL REGIME CLUSTERS" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={returnsData}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
            <XAxis dataKey="date" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<TTip />} />
            <Legend wrapperStyle={legendStyle} />
            <Area type="monotone" dataKey="liqVaR"   name={`${liquid.ticker} VaR 99%`}   stroke={C.blue} fill={C.blue} fillOpacity={0.12} />
            <Area type="monotone" dataKey="illiqVaR" name={`${illiquid.ticker} VaR 99%`} stroke={C.red}  fill={C.red}  fillOpacity={0.12} />
            <Area dataKey="isHighVolLiq"   fill={C.blue} fillOpacity={0.05} stroke="none" />
            <Area dataKey="isHighVolIlliq" fill={C.red}  fillOpacity={0.05} stroke="none" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartBox>

      {/* parametric VaR table */}
      <Label>PARAMETRIC VaR MATRIX — 95% & 99%</Label>
      <div style={{ border: '1px solid #2a2a30', borderRadius: 3, overflow: 'hidden', background: '#111113', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#e8e8ec' }}>
          <thead>
            <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #2a2a30' }}>
              {['TICKER', 'REGIME', 'MEAN (%)', 'DAILY VOL (%)', 'VaR (%)', 'VaR (₹ on 10L)'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, background: '#0a0a0b', color: '#e8e8ec', borderBottom: '1px solid #2a2a30', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...liquid.varAnalysis.map(v => ({ ...v, ticker: liquid.ticker, isLiq: true })),
              ...illiquid.varAnalysis.map(v => ({ ...v, ticker: illiquid.ticker, isLiq: false }))
            ].map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1a1a1f', background: v.isLiq ? 'rgba(91,141,238,0.03)' : 'rgba(255,77,77,0.03)' }}>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>
                  <span style={{ fontSize: 8, background: v.isLiq ? C.blue : C.red, color: '#000', fontWeight: 800, padding: '2px 5px', borderRadius: 2, marginRight: 6 }}>
                    {v.isLiq ? 'L' : 'I'}
                  </span>
                  {v.ticker}
                </td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{v.regime} ({v.conf})</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{v.mean.toFixed(4)}%</td>
                <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{v.vol.toFixed(4)}%</td>
                <td style={{ padding: '8px 14px', color: C.amber }}>{v.varPct.toFixed(4)}%</td>
                <td style={{ padding: '8px 14px', color: C.amber, fontWeight: 700 }}>₹{(v.varPct * 10000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GARCH & MC table */}
      <Label>GARCH & MONTE CARLO VaR COMPARISON</Label>
      <div style={{ border: '1px solid #2a2a30', borderRadius: 3, overflow: 'hidden', background: '#111113' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#e8e8ec' }}>
          <thead>
            <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #2a2a30' }}>
              {['TICKER', 'METHOD', 'COND VOL (%)', 'VaR 95% (%)', 'VaR 99% (%)', 'CAPITAL AT RISK (99%)'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, background: '#0a0a0b', color: '#e8e8ec', borderBottom: '1px solid #2a2a30', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {liquid.varMethods?.length > 1 && (
              <>
                {[{ s: liquid, color: C.blue, tag: 'L' }, { s: illiquid, color: C.red, tag: 'I' }].map(({ s, color, tag }) => (
                  <tr key={s.ticker} style={{ borderBottom: '1px solid #1e1e24' }}>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>
                      <span style={{ fontSize: 8, background: color, color: '#000', fontWeight: 800, padding: '2px 5px', borderRadius: 2, marginRight: 6 }}>{tag}</span>
                      {s.ticker}
                    </td>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>GARCH(1,1)</td>
                    <td style={{ padding: '8px 14px', color: C.amber }}>{s.vol.garchVol.toFixed(3)}%</td>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{(s.varMethods[1]?.c95 || 0).toFixed(4)}%</td>
                    <td style={{ padding: '8px 14px', color: C.amber }}>{(s.varMethods[1]?.c99 || 0).toFixed(4)}%</td>
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: C.red }}>₹{((s.varMethods[1]?.c99 || 0) * 10000).toLocaleString()}</td>
                  </tr>
                ))}
                {[{ s: liquid, color: C.blue, tag: 'L' }, { s: illiquid, color: C.red, tag: 'I' }].map(({ s, color, tag }) => (
                  <tr key={s.ticker + 'mc'} style={{ borderBottom: '1px solid #1e1e24' }}>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>
                      <span style={{ fontSize: 8, background: color, color: '#000', fontWeight: 800, padding: '2px 5px', borderRadius: 2, marginRight: 6 }}>{tag}</span>
                      {s.ticker}
                    </td>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>MC-Historical</td>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>—</td>
                    <td style={{ padding: '8px 14px', color: '#e8e8ec' }}>{(s.varMethods[2]?.c95 || 0).toFixed(4)}%</td>
                    <td style={{ padding: '8px 14px', color: C.amber }}>{(s.varMethods[2]?.c99 || 0).toFixed(4)}%</td>
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: C.red }}>₹{((s.varMethods[2]?.c99 || 0) * 10000).toLocaleString()}</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}