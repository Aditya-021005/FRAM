export const PROJECT_INFO = {
  title: "FIN F414 — Financial Risk Management",
  subtitle: "Volatility, Liquidity & Option Pricing Analysis",
  period: "Dec 2025 → Apr 2026",
  liquidTicker: "HDFCBANK",
};

export const NIFTY50_RANKING = [
  { rank: 1, ticker: "HDFCBANK.NS", turnover: 3034.01, category: "LIQUID" },
  { rank: 2, ticker: "RELIANCE.NS", turnover: 2634.58, category: "LIQUID" },
  { rank: 3, ticker: "ICICIBANK.NS", turnover: 2412.73, category: "LIQUID" },
  { rank: 4, ticker: "TCS.NS", turnover: 2198.44, category: "LIQUID" },
  { rank: 38, ticker: "HDFCLIFE.NS", turnover: 423.87, category: "ILLIQUID" },
  { rank: 39, ticker: "BRITANNIA.NS", turnover: 398.54, category: "ILLIQUID" },
  { rank: 49, ticker: "NESTLEIND.NS", turnover: 138.58, category: "ILLIQUID" },
  { rank: 50, ticker: "SHRIRAMFIN.NS", turnover: 152.36, category: "ILLIQUID" },
];

export const LIQUID_DATA = {
  ticker: "HDFCBANK.NS",
  rank: 1,
  stats: { meanReturn: -0.2401, stdReturn: 1.5375, minReturn: -5.4667, maxReturn: 5.5552, avgTurnover: 3034.01, avgAmihud: 0.0004, avgRollingVol: 18.82 },
  vol: { histVol: 18.82, garchVol: 20.15, longRunVol: 18.10, persistence: 0.9634 },
  correlation: { vol_amihud: 0.2379 },
  options: [
    { strikeLabel: "ATM", optType: "Call", spot: 1842.5, strike: 1840, mktPrice: 52.38, bsmHist: 49.12, bsmGarch: 51.87, delta: 0.5, gamma: 0.002, vega: 1.2, dte: 29 },
    { strikeLabel: "OTM_Call", optType: "Call", spot: 1842.5, strike: 1970, mktPrice: 12.45, bsmHist: 11.23, bsmGarch: 13.56, delta: 0.15, gamma: 0.001, vega: 0.4, dte: 29 },
    { strikeLabel: "OTM_Put", optType: "Put", spot: 1842.5, strike: 1710, mktPrice: 15.60, bsmHist: 14.10, bsmGarch: 16.20, delta: -0.18, gamma: 0.0012, vega: 0.6, dte: 29 }
  ],
  pnl: [{ priceShock: "-2%", volShock: "-20%", totalPnl: -400 }, { priceShock: "+2%", volShock: "+20%", totalPnl: 500 }],
  var: [
    { regime: "Full Period", varPct: 2.15, varRs: 21500 },
    { regime: "High Vol", varPct: 3.42, varRs: 34200 }
  ]
};

export const getIlliquidData = (ticker) => {
  if (ticker === 'NESTLEIND.NS') {
    return {
      ticker: "NESTLEIND.NS",
      rank: 49,
      stats: { meanReturn: 0.0111, stdReturn: 1.1604, minReturn: -2.7249, maxReturn: 3.3969, avgTurnover: 138.58, avgAmihud: 0.007, avgRollingVol: 16.57 },
      vol: { histVol: 16.57, garchVol: 17.50, longRunVol: 15.80, persistence: 0.95 },
      correlation: { vol_amihud: 0.1763 },
      options: [
        { strikeLabel: "ATM", optType: "Call", mktPrice: 75.20, bsmHist: 72.10, bsmGarch: 76.50, delta: 0.48, gamma: 0.003, vega: 1.4, dte: 29 },
        { strikeLabel: "OTM_Call", optType: "Call", mktPrice: 22.40, bsmHist: 20.50, bsmGarch: 23.10, delta: 0.12, gamma: 0.001, vega: 0.5, dte: 29 },
        { strikeLabel: "OTM_Put", optType: "Put", mktPrice: 28.50, bsmHist: 26.80, bsmGarch: 29.40, delta: -0.18, gamma: 0.0012, vega: 0.6, dte: 29 }
      ],
      pnl: [{ priceShock: "-2%", volShock: "-20%", totalPnl: -800 }, { priceShock: "+2%", volShock: "+20%", totalPnl: 900 }],
      var: [
        { regime: "Full Period", varPct: 1.85, varRs: 18500 },
        { regime: "High Vol", varPct: 2.95, varRs: 29500 }
      ]
    };
  }
  return LIQUID_DATA; 
};

export const getLiquidData = (ticker) => (ticker === 'HDFCBANK.NS' ? LIQUID_DATA : LIQUID_DATA);

export const RETURNS_DATA = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(2025, 10, 1);
  date.setDate(date.getDate() + i);
  const p = i / 120;
  
  // mimics HDFCBANK (Liquid): Vol starts 10% -> 45%
  // Using a smoother noise for vol to avoid jumpy charts
  const liqVolBase = 10 + (p < 0.6 ? p * 12 : 12 + (p-0.6)*110);
  const liqVol = liqVolBase + Math.sin(i * 0.2) * 2;
  
  // Log returns with volatility clustering
  const liqRet = (Math.random() - 0.5) * (liqVol / 400) + Math.sin(i * 0.1) * 0.002;
  const liqAm = (Math.random() * 0.0005) + (Math.sin(i * 0.3) > 0.8 ? 0.0006 : 0);

  // mimics NESTLEIND (Illiquid): Vol starts 8% -> 23%
  const illiqVolBase = 8 + p * 14;
  const illiqVol = illiqVolBase + Math.sin(i * 0.15) * 3;
  const illiqRet = (Math.random() - 0.5) * (illiqVol / 300) + Math.sin(i * 0.08) * 0.003;
  const illiqAm = (Math.random() * 0.012) + (Math.sin(i * 0.25) > 0.7 ? 0.010 : 0);

  return {
    date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    liqReturn: liqRet,
    illiqReturn: illiqRet,
    liqVol: liqVol,
    illiqVol: illiqVol,
    liqAmihud: liqAm,
    illiqAmihud: illiqAm
  };
});
