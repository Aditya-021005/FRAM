export const PROJECT_INFO = {
  title: "FIN F414 — Financial Risk Management",
  subtitle: "Volatility, Liquidity & Option Pricing Analysis",
  period: "Oct 2025 → Apr 2026",
  liquidTicker: "HDFCBANK",
};

export const NIFTY50_RANKING = [
  { rank: 1, ticker: "HDFCBANK.NS", turnover: 2847.31, category: "LIQUID" },
  { rank: 2, ticker: "RELIANCE.NS", turnover: 2634.58, category: "LIQUID" },
  { rank: 3, ticker: "ICICIBANK.NS", turnover: 2412.73, category: "LIQUID" },
  { rank: 4, ticker: "TCS.NS", turnover: 2198.44, category: "LIQUID" },
  { rank: 5, ticker: "SBIN.NS", turnover: 2087.62, category: "LIQUID" },
  { rank: 6, ticker: "BHARTIARTL.NS", turnover: 1956.31, category: "LIQUID" },
  { rank: 7, ticker: "INFOSYS.NS", turnover: 1834.19, category: "LIQUID" },
  { rank: 38, ticker: "HDFCLIFE.NS", turnover: 423.87, category: "ILLIQUID" },
  { rank: 39, ticker: "BRITANNIA.NS", turnover: 398.54, category: "ILLIQUID" },
  { rank: 40, ticker: "SBILIFE.NS", turnover: 374.21, category: "ILLIQUID" },
  { rank: 41, ticker: "EICHERMOT.NS", turnover: 351.93, category: "ILLIQUID" },
  { rank: 42, ticker: "BPCL.NS", turnover: 328.47, category: "ILLIQUID" },
  { rank: 43, ticker: "ASIANPAINT.NS", turnover: 306.82, category: "ILLIQUID" },
  { rank: 44, ticker: "HEROMOTOCO.NS", turnover: 284.65, category: "ILLIQUID" },
  { rank: 45, ticker: "APOLLOHOSP.NS", turnover: 263.38, category: "ILLIQUID" },
  { rank: 46, ticker: "DIVISLAB.NS", turnover: 241.74, category: "ILLIQUID" },
  { rank: 47, ticker: "BEL.NS", turnover: 218.93, category: "ILLIQUID" },
  { rank: 48, ticker: "BAJAJ-AUTO.NS", turnover: 196.47, category: "ILLIQUID" },
  { rank: 49, ticker: "NESTLEIND.NS", turnover: 174.82, category: "ILLIQUID" },
  { rank: 50, ticker: "SHRIRAMFIN.NS", turnover: 152.36, category: "ILLIQUID" },
];

export const LIQUID_DATA = {
  ticker: "HDFCBANK.NS",
  rank: 1,
  stats: { meanReturn: -0.2401, stdReturn: 1.5375, minReturn: -5.4667, maxReturn: 5.5552, avgTurnover: 3034.01, avgAmihud: 0.0004, avgRollingVol: 18.82 },
  vol: { histVol: 18.82, garchVol: 20.15, longRunVol: 18.10, persistence: 0.9634 },
  correlation: { 
    vol_amihud: 0.2379, 
    vol_turnover: 0.5752, 
    amihud_turnover: 0.1052 
  },
  options: [
    { strikeLabel: "ATM", optType: "Call", spot: 1842.5, strike: 1840, histVol: 18.82, mktPrice: 52.38, bsmHist: 49.12, dev: 6.63, bsmGarch: 51.87, dte: 29, delta: 0.52, gamma: 0.0025, vega: 1.2 },
    { strikeLabel: "OTM_Call", optType: "Call", spot: 1842.5, strike: 1970, histVol: 18.82, mktPrice: 12.45, bsmHist: 11.23, dev: 10.86, bsmGarch: 13.56, dte: 29, delta: 0.15, gamma: 0.0008, vega: 0.4 },
  ]
};

// Function to generate consistent data for any illiquid stock
export const getIlliquidData = (ticker) => {
  const stock = NIFTY50_RANKING.find(s => s.ticker === ticker);
  const isNestle = ticker === 'NESTLEIND.NS';
  const baseVol = isNestle ? 16.57 : (25 + (50 - stock.rank) * 1.5);
  const turnover = isNestle ? 138.58 : stock.turnover;
  
  return {
    ticker: stock.ticker,
    rank: stock.rank,
    stats: { 
      meanReturn: isNestle ? 0.0111 : (0.03 + (Math.random() - 0.5) * 0.01), 
      stdReturn: isNestle ? 1.1604 : (baseVol / 15), 
      minReturn: isNestle ? -2.7249 : (-baseVol / 5), 
      maxReturn: isNestle ? 3.3969 : (baseVol / 5.5), 
      avgTurnover: turnover, 
      avgAmihud: isNestle ? 0.0070 : ((100 / turnover) * 2.5), 
      avgRollingVol: baseVol 
    },
    vol: { histVol: baseVol, garchVol: baseVol * 1.12, longRunVol: baseVol * 0.95, persistence: 0.95 + (Math.random() * 0.03) },
    correlation: { 
      vol_amihud: isNestle ? 0.1763 : 0.20, 
      vol_turnover: isNestle ? 0.2342 : 0.30, 
      amihud_turnover: isNestle ? -0.1513 : -0.10 
    },
    options: [
      { strikeLabel: "ATM", optType: "Call", spot: 1000, strike: 1000, histVol: baseVol, mktPrice: baseVol * 3.2, bsmHist: baseVol * 2.8, dev: 15.4, bsmGarch: baseVol * 3.5, dte: 29, delta: 0.48, gamma: 0.003, vega: 1.4 },
      { strikeLabel: "OTM_Call", optType: "Call", spot: 1000, strike: 1100, histVol: baseVol, mktPrice: baseVol * 0.9, bsmHist: baseVol * 0.7, dev: 25.8, bsmGarch: baseVol * 1.1, dte: 29, delta: 0.12, gamma: 0.001, vega: 0.5 },
      { strikeLabel: "OTM_Put", optType: "Put", spot: 1000, strike: 900, histVol: baseVol, mktPrice: baseVol * 1.2, bsmHist: baseVol * 1.0, dev: 20.2, bsmGarch: baseVol * 1.4, dte: 29, delta: -0.18, gamma: 0.0012, vega: 0.6 },
    ],
    pnl: [
      { priceShock: "-2%", volShock: "-20%", totalPnl: -800 - baseVol * 10 },
      { priceShock: "+2%", volShock: "+20%", totalPnl: 900 + baseVol * 8 },
    ],
    var: [     { regime: "Full Period", conf: "99%", varPct: baseVol / 6, varRs: (baseVol / 6) * 10000 },
      { regime: "High-Vol", conf: "99%", varPct: baseVol / 4, varRs: (baseVol / 4) * 10000 },
    ]
  };
};

export const getLiquidData = (ticker) => {
  const stock = NIFTY50_RANKING.find(s => s.ticker === ticker);
  const baseVol = 12 + (8 - stock.rank) * 1.2;
  const turnover = stock.turnover;
  return {
    ticker: stock.ticker,
    rank: stock.rank,
    stats: {
      meanReturn: parseFloat((0.04 + stock.rank * 0.002).toFixed(4)),
      stdReturn: parseFloat((baseVol / 14).toFixed(4)),
      avgTurnover: turnover,
      avgAmihud: parseFloat(((10 / turnover) * 0.5).toFixed(4)),
      avgRollingVol: parseFloat(baseVol.toFixed(2)),
    },
    vol: {
      histVol: parseFloat(baseVol.toFixed(2)),
      garchVol: parseFloat((baseVol * 1.1).toFixed(2)),
      longRunVol: parseFloat((baseVol * 0.94).toFixed(2)),
      persistence: parseFloat((0.95 + stock.rank * 0.002).toFixed(4)),
    },
    correlation: { 
      vol_amihud: parseFloat((0.15 + Math.random() * 0.1).toFixed(4)), 
      vol_turnover: parseFloat((0.45 + Math.random() * 0.1).toFixed(4)), 
      amihud_turnover: parseFloat((0.05 + Math.random() * 0.05).toFixed(4)) 
    },
    options: [
      { strikeLabel: "ATM", optType: "Call", mktPrice: parseFloat((baseVol * 2.8).toFixed(2)), bsmHist: parseFloat((baseVol * 2.6).toFixed(2)), bsmGarch: parseFloat((baseVol * 2.9).toFixed(2)), dte: 29, delta: 0.52, gamma: 0.0025, vega: 1.2 },
      { strikeLabel: "OTM_Call", optType: "Call", mktPrice: parseFloat((baseVol * 0.7).toFixed(2)), bsmHist: parseFloat((baseVol * 0.6).toFixed(2)), bsmGarch: parseFloat((baseVol * 0.8).toFixed(2)), dte: 29, delta: 0.15, gamma: 0.0008, vega: 0.4 },
    ],
    pnl: [
      { priceShock: "-2%", volShock: "-20%", totalPnl: parseFloat((-400 - baseVol * 8).toFixed(1)) },
      { priceShock: "+2%", volShock: "+20%", totalPnl: parseFloat((500 + baseVol * 7).toFixed(1)) },
    ],
    var: [
      { regime: "Full Period", conf: "99%", varPct: parseFloat((baseVol / 8).toFixed(2)), varRs: Math.round((baseVol / 8) * 10000) },
      { regime: "High-Vol", conf: "99%", varPct: parseFloat((baseVol / 5).toFixed(2)), varRs: Math.round((baseVol / 5) * 10000) },
    ]
  };
};


export const RETURNS_DATA = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(2025, 11, 1); // Start Dec 2025 like backend
  date.setDate(date.getDate() + i);
  
  const progress = i / 120;
  
  // mimics HDFCBANK (Liquid) trend: vol starts ~10%, ends ~45%
  const liqVolScale = 10 + (progress < 0.6 ? progress * 10 : 10 + (progress - 0.6) * 100); 
  const liqReturn = (Math.random() - 0.5) * (liqVolScale / 100) * 2;
  const liqAmihud = Math.random() * 0.0008 + (progress > 0.8 ? Math.random() * 0.0006 : 0);

  // mimics NESTLEIND (Illiquid) trend: vol starts ~8%, ends ~23%
  const illiqVolScale = 8 + progress * 12 + Math.random() * 3;
  const illiqReturn = (Math.random() - 0.5) * (illiqVolScale / 100) * 2;
  const illiqAmihud = Math.random() * 0.015 + progress * 0.01;

  return {
    date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    liqReturn: liqReturn,
    illiqReturn: illiqReturn,
    liqVol: liqVolScale,
    illiqVol: illiqVolScale,
    liqAmihud: liqAmihud,
    illiqAmihud: illiqAmihud
  };
});
