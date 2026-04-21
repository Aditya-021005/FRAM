import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { NIFTY50_RANKING, RETURNS_DATA, getIlliquidData, getLiquidData } from '../data';

/* ── shared token palette (mirrors App.jsx vars) ── */
const C = {
  amber: '#f5a623',
  green: '#39d98a',
  red: '#ff4d4d',
  blue: '#5b8dee',
  muted: '#6b6b78',
};

/* ── terminal tooltip ── */
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

/* ── section label ── */
const Label = ({ children }) => (
  <div style={{ fontSize: 9, fontWeight: 700, color: C.amber, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
);

/* ── chart wrapper ── */
const ChartBox = ({ title, children, style }) => (
  <div style={{ border: '1px solid #2a2a30', background: '#111113', borderRadius: 3, padding: '16px 18px', ...style }}>
    <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', marginBottom: 14, fontFamily: 'IBM Plex Mono, monospace' }}>{title}</div>
    {children}
  </div>
);

/* ── stat pill ── */
const Stat = ({ label, value, accent }) => (
  <div style={{ border: '1px solid #2a2a30', background: '#18181c', borderRadius: 3, padding: '14px 16px' }}>
    <div style={{ fontSize: 8, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: accent || '#e8e8ec', fontFamily: 'IBM Plex Mono, monospace' }}>{value}</div>
  </div>
);

const barColors = (cat) => cat === 'LIQUID' ? C.amber : C.muted;

export default function PartA({ illiquid, liquid }) {
  const liqStocks = NIFTY50_RANKING.filter(s => s.category === 'LIQUID');
  const illiquidStocks = NIFTY50_RANKING.filter(s => s.category === 'ILLIQUID');
  const chartData = [...liqStocks, ...illiquidStocks.slice(-3)].map(d => ({
    name: d.ticker.replace('.NS', ''),
    turnover: d.turnover,
    category: d.category,
  }));

  const axisProps = { tick: { fontSize: 9, fill: '#6b6b78', fontFamily: 'IBM Plex Mono, monospace' }, axisLine: false, tickLine: false };

  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#e8e8ec', animation: 'fadeUp 0.4s ease both' }}>

      {/* header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, color: C.amber, letterSpacing: '0.14em', marginBottom: 8 }}>PART A · STOCK SELECTION & LIQUIDITY</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', color: '#e8e8ec', marginBottom: 6 }}>Liquidity Analysis</h2>
        <p style={{ fontSize: 11, color: '#6b6b78', lineHeight: 1.7 }}>
          NIFTY 50 ranking by turnover — comparing <span style={{ color: C.green }}>{liquid.ticker}</span> (liquid) vs <span style={{ color: C.red }}>{illiquid.ticker}</span> (illiquid)
        </p>
      </div>

      {/* stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <Stat label="Liquid Stock" value={liquid.ticker.replace('.NS', '')} accent={C.green} />
        <Stat label={`Rank · NIFTY 50`} value={`#${liquid.rank}`} accent={C.amber} />
        <Stat label="Illiquid Stock" value={illiquid.ticker.replace('.NS', '')} accent={C.red} />
        <Stat label={`Rank · NIFTY 50`} value={`#${illiquid.rank}`} accent={C.amber} />
      </div>

      {/* main turnover chart */}
      <ChartBox title="TURNOVER RANKING — TOP 25% vs BOTTOM 25%" style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<TTip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
            <Bar dataKey="turnover" radius={[2, 2, 0, 0]}>
              {chartData.map((e, i) => <Cell key={i} fill={barColors(e.category)} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 9, color: C.muted }}>
          <span><span style={{ color: C.amber }}>■</span> LIQUID (Top 25%)</span>
          <span><span style={{ color: C.muted }}>■</span> ILLIQUID (Bottom 25%)</span>
        </div>
      </ChartBox>

      {/* 3-row chart grid */}
      <Label>TIME-SERIES ANALYSIS</Label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>

        <ChartBox title={`DAILY LOG RETURNS — ${liquid.ticker} (LIQUID)`}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis {...axisProps} domain={[-0.06, 0.06]} />
              <Tooltip content={<TTip />} />
              <Line type="monotone" dataKey="liqReturn" stroke={C.green} dot={false} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
        <ChartBox title={`DAILY LOG RETURNS — ${illiquid.ticker} (ILLIQUID)`}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis {...axisProps} domain={[-0.06, 0.06]} />
              <Tooltip content={<TTip />} />
              <Line type="monotone" dataKey="illiqReturn" stroke={C.red} dot={false} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title={`20-DAY ROLLING VOLATILITY — ${liquid.ticker}`}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis {...axisProps} />
              <Tooltip content={<TTip />} />
              <Line type="monotone" dataKey="liqVol" stroke={C.amber} dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
        <ChartBox title={`20-DAY ROLLING VOLATILITY — ${illiquid.ticker}`}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis {...axisProps} />
              <Tooltip content={<TTip />} />
              <Line type="monotone" dataKey="illiqVol" stroke={C.blue} dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title={`AMIHUD ILLIQUIDITY — ${liquid.ticker}`}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis {...axisProps} />
              <Tooltip content={<TTip />} />
              <Line type="monotone" dataKey="liqAmihud" stroke={C.green} dot={false} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
        <ChartBox title={`AMIHUD ILLIQUIDITY — ${illiquid.ticker}`}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETURNS_DATA}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis {...axisProps} />
              <Tooltip content={<TTip />} />
              <Line type="monotone" dataKey="illiqAmihud" stroke={C.red} dot={false} strokeWidth={1} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox title={`VOL vs AMIHUD SCATTER — ${liquid.ticker}`}>
          <ResponsiveContainer width="100%" height={160}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" />
              <XAxis type="number" dataKey="liqAmihud" name="Amihud" tick={{ fontSize: 9, fill: C.muted, fontFamily: 'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="liqVol" name="Rolling Vol" tick={{ fontSize: 9, fill: C.muted, fontFamily: 'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<TTip />} />
              <Scatter data={RETURNS_DATA} fill={C.green} fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartBox>
        <ChartBox title={`VOL vs AMIHUD SCATTER — ${illiquid.ticker}`}>
          <ResponsiveContainer width="100%" height={160}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e24" />
              <XAxis type="number" dataKey="illiqAmihud" name="Amihud" tick={{ fontSize: 9, fill: C.muted, fontFamily: 'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="illiqVol" name="Rolling Vol" tick={{ fontSize: 9, fill: C.muted, fontFamily: 'IBM Plex Mono, monospace' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<TTip />} />
              <Scatter data={RETURNS_DATA} fill={C.red} fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* data table */}
      <Label>NIFTY 50 · LIQUIDITY & RISK COMPARISON</Label>
      <div style={{ border: '1px solid #2a2a30', borderRadius: 3, overflow: 'hidden', background: '#111113' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#e8e8ec' }}>
          <thead>
            <tr style={{ background: '#0a0a0b', borderBottom: '1px solid #2a2a30' }}>
              {['SECURITY', 'MEAN (%)', 'STD DEV (%)', 'AVG TURNOVER (CR)', 'AMIHUD RATIO'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 9, fontWeight: 700, background: '#0a0a0b', color: '#e8e8ec', borderBottom: '1px solid #2a2a30', letterSpacing: '0.1em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* selected liquid */}
            <tr style={{ borderLeft: `3px solid ${C.green}`, borderBottom: '1px solid #2a2a30', background: 'rgba(57,217,138,0.08)' }}>
              <td style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#e8e8ec' }}>
                <span style={{ background: C.green, color: '#000', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>LIQ</span>
                {liquid.ticker}
              </td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{liquid.stats.meanReturn.toFixed(4)}%</td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{liquid.stats.stdReturn.toFixed(2)}%</td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>₹{liquid.stats.avgTurnover.toFixed(2)}</td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{liquid.stats.avgAmihud.toFixed(4)}</td>
            </tr>
            {/* selected illiquid */}
            <tr style={{ borderLeft: `3px solid ${C.red}`, borderBottom: '2px solid #3a3a42', background: 'rgba(255,77,77,0.08)' }}>
              <td style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#e8e8ec' }}>
                <span style={{ background: C.red, color: '#000', fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 2 }}>ILL</span>
                {illiquid.ticker}
              </td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{illiquid.stats.meanReturn.toFixed(4)}%</td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{illiquid.stats.stdReturn.toFixed(2)}%</td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>₹{illiquidStocks.find(s => s.ticker === illiquid.ticker)?.turnover.toFixed(2)}</td>
              <td style={{ padding: '10px 16px', color: '#e8e8ec' }}>{illiquid.stats.avgAmihud.toFixed(4)}</td>
            </tr>
            {/* rest */}
            {liqStocks.filter(s => s.ticker !== liquid.ticker).map(s => {
              const d = getLiquidData(s.ticker);
              return (
                <tr key={s.ticker} style={{ borderBottom: '1px solid #1e1e24' }}>
                  <td style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#e8e8ec' }}>
                    <span style={{ color: '#e8e8ec', fontSize: 8, padding: '2px 6px' }}>L</span>{s.ticker}
                  </td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>{d.stats.meanReturn.toFixed(4)}%</td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>{d.stats.stdReturn.toFixed(2)}%</td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>₹{s.turnover.toFixed(2)}</td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>{d.stats.avgAmihud.toFixed(4)}</td>
                </tr>
              );
            })}
            {illiquidStocks.filter(s => s.ticker !== illiquid.ticker).map(s => {
              const d = getIlliquidData(s.ticker);
              return (
                <tr key={s.ticker} style={{ borderBottom: '1px solid #1e1e24' }}>
                  <td style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8, color: '#e8e8ec' }}>
                    <span style={{ color: '#e8e8ec', fontSize: 8, padding: '2px 6px' }}>I</span>{s.ticker}
                  </td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>{d.stats.meanReturn.toFixed(4)}%</td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>{d.stats.stdReturn.toFixed(2)}%</td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>₹{s.turnover.toFixed(2)}</td>
                  <td style={{ padding: '9px 16px', color: '#e8e8ec' }}>{d.stats.avgAmihud.toFixed(4)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* correlation matrices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
        {[{ s: liquid, label: 'LIQUID' }, { s: illiquid, label: 'ILLIQUID' }].map(({ s, label }) => (
          <div key={label} style={{ border: '1px solid #2a2a30', background: '#111113', borderRadius: 3, padding: '16px 18px' }}>
            <div style={{ fontSize: 9, color: C.amber, letterSpacing: '0.12em', marginBottom: 12 }}>CORRELATION MATRIX — {s.ticker} ({label})</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: '#e8e8ec' }}>
              <thead>
                <tr>
                  {['', 'VOL', 'AMIHUD'].map(h => <th key={h} style={{ padding: '6px 10px', textAlign: 'right', fontSize: 9, color: '#e8e8ec', fontWeight: 700 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[['Vol', '1.0000', (s.correlation?.vol_amihud || 0).toFixed(4)],
                ['Amihud', (s.correlation?.vol_amihud || 0).toFixed(4), '1.0000']].map(([row, ...vals]) => (
                  <tr key={row} style={{ borderTop: '1px solid #1e1e24' }}>
                    <td style={{ padding: '8px 10px', color: '#e8e8ec', fontSize: 9, fontWeight: 700 }}>{row}</td>
                    {vals.map((v, i) => <td key={i} style={{ padding: '8px 10px', textAlign: 'right', color: '#e8e8ec' }}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}