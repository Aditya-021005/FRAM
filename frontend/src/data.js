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
  stats: { meanReturn: 0.0412, stdReturn: 1.2834, minReturn: -3.87, maxReturn: 4.21, avgTurnover: 2847.31, avgAmihud: 0.0342, avgRollingVol: 18.45 },
  vol: { histVol: 18.45, garchVol: 20.87, longRunVol: 17.23, persistence: 0.9634 },
  options: [
    { strikeLabel: "ATM", optType: "Call", spot: 1842.5, strike: 1840, histVol: 18.45, mktPrice: 52.38, bsmHist: 49.12, dev: 6.63, bsmGarch: 51.87, dte: 29 },
    { strikeLabel: "OTM_Call", optType: "Call", spot: 1842.5, strike: 1970, histVol: 18.45, mktPrice: 12.45, bsmHist: 11.23, dev: 10.86, bsmGarch: 13.56, dte: 29 },
  ]
};

// Function to generate consistent data for any illiquid stock
export const getIlliquidData = (ticker) => {
  const stock = NIFTY50_RANKING.find(s => s.ticker === ticker);
  const baseVol = 25 + (50 - stock.rank) * 1.5;
  const turnover = stock.turnover;
  
  return {
    ticker: stock.ticker,
    stats: { 
      meanReturn: 0.03 + (Math.random() - 0.5) * 0.01, 
      stdReturn: baseVol / 15, 
      minReturn: -baseVol / 5, 
      maxReturn: baseVol / 5.5, 
      avgTurnover: turnover, 
      avgAmihud: (100 / turnover) * 2.5, 
      avgRollingVol: baseVol 
    },
    vol: { histVol: baseVol, garchVol: baseVol * 1.12, longRunVol: baseVol * 0.95, persistence: 0.95 + (Math.random() * 0.03) },
    options: [
      { strikeLabel: "ATM", optType: "Call", spot: 1000, strike: 1000, histVol: baseVol, mktPrice: baseVol * 1.5, bsmHist: baseVol * 1.3, dev: 15.4, bsmGarch: baseVol * 1.6, dte: 29 },
      { strikeLabel: "OTM_Call", optType: "Call", spot: 1000, strike: 1100, histVol: baseVol, mktPrice: baseVol * 0.4, bsmHist: baseVol * 0.3, dev: 25.8, bsmGarch: baseVol * 0.5, dte: 29 },
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
    options: [
      { strikeLabel: "ATM", optType: "Call", mktPrice: parseFloat((baseVol * 2.8).toFixed(2)), bsmHist: parseFloat((baseVol * 2.6).toFixed(2)), bsmGarch: parseFloat((baseVol * 2.9).toFixed(2)), dte: 29 },
      { strikeLabel: "OTM_Call", optType: "Call", mktPrice: parseFloat((baseVol * 0.7).toFixed(2)), bsmHist: parseFloat((baseVol * 0.6).toFixed(2)), bsmGarch: parseFloat((baseVol * 0.8).toFixed(2)), dte: 29 },
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
  const date = new Date(2025, 9, 1);
  date.setDate(date.getDate() + i);
  return {
    date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    liqReturn: (Math.sin(i * 0.3) * 1.2 + (Math.random() - 0.5) * 2.5) * 0.8,
    illiqReturn: (Math.sin(i * 0.25 + 1) * 1.8 + (Math.random() - 0.5) * 4) * 0.9,
    liqVol: 15 + Math.sin(i * 0.1) * 5 + Math.random() * 3,
    illiqVol: 25 + Math.sin(i * 0.08 + 0.5) * 8 + Math.random() * 5,
  };
});
