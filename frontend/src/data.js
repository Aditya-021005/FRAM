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
  { rank: 48, ticker: "BAJAJ-AUTO.NS", turnover: 196.47, category: "ILLIQUID" },
  { rank: 49, ticker: "NESTLEIND.NS", turnover: 174.82, category: "ILLIQUID" },
  { rank: 50, ticker: "SHRIRAMFIN.NS", turnover: 152.36, category: "ILLIQUID" },
];

export const ILLIQUID_OPTIONS = {
  SHRIRAMFIN: {
    ticker: "SHRIRAMFIN.NS",
    stats: { meanReturn: 0.0287, stdReturn: 2.1567, minReturn: -6.42, maxReturn: 5.89, avgTurnover: 152.36, avgAmihud: 1.8734, avgRollingVol: 31.28 },
    vol: { histVol: 31.28, garchVol: 35.42, longRunVol: 28.91, persistence: 0.9812 },
    options: [
      { strikeLabel: "ATM", optType: "Call", spot: 628.4, strike: 630, histVol: 31.28, mktPrice: 32.87, bsmHist: 28.56, dev: 15.09, bsmGarch: 34.21, dte: 29 },
      { strikeLabel: "OTM_Call", optType: "Call", spot: 628.4, strike: 670, histVol: 31.28, mktPrice: 14.23, bsmHist: 11.34, dev: 25.49, bsmGarch: 16.78, dte: 29 },
    ],
    pnl: [
       { priceShock: "-2%", volShock: "-20%", totalPnl: -1050.5 },
       { priceShock: "+2%", volShock: "+20%", totalPnl: 1087.9 },
    ],
    var: [
      { regime: "Full Period", conf: "99%", varPct: 4.99, varRs: 49900 },
      { regime: "High-Vol", conf: "99%", varPct: 7.27, varRs: 72700 },
    ]
  },
  NESTLEIND: {
    ticker: "NESTLEIND.NS",
    stats: { meanReturn: 0.0312, stdReturn: 1.8452, minReturn: -4.52, maxReturn: 4.87, avgTurnover: 174.82, avgAmihud: 1.4231, avgRollingVol: 24.56 },
    vol: { histVol: 24.56, garchVol: 27.12, longRunVol: 23.45, persistence: 0.9542 },
    options: [
      { strikeLabel: "ATM", optType: "Call", spot: 2452.1, strike: 2450, histVol: 24.56, mktPrice: 42.15, bsmHist: 38.42, dev: 9.71, bsmGarch: 44.82, dte: 29 },
      { strikeLabel: "OTM_Call", optType: "Call", spot: 2452.1, strike: 2600, histVol: 24.56, mktPrice: 12.87, bsmHist: 10.12, dev: 27.18, bsmGarch: 15.34, dte: 29 },
    ],
    pnl: [
       { priceShock: "-2%", volShock: "-20%", totalPnl: -842.3 },
       { priceShock: "+2%", volShock: "+20%", totalPnl: 928.1 },
    ],
    var: [
      { regime: "Full Period", conf: "99%", varPct: 3.82, varRs: 38200 },
      { regime: "High-Vol", conf: "99%", varPct: 5.42, varRs: 54200 },
    ]
  }
};

export const LIQUID_DATA = {
  ticker: "HDFCBANK.NS",
  stats: { meanReturn: 0.0412, stdReturn: 1.2834, minReturn: -3.87, maxReturn: 4.21, avgTurnover: 2847.31, avgAmihud: 0.0342, avgRollingVol: 18.45 },
  vol: { histVol: 18.45, garchVol: 20.87, longRunVol: 17.23, persistence: 0.9634 },
  options: [
    { strikeLabel: "ATM", optType: "Call", spot: 1842.5, strike: 1840, histVol: 18.45, mktPrice: 52.38, bsmHist: 49.12, dev: 6.63, bsmGarch: 51.87, dte: 29 },
    { strikeLabel: "OTM_Call", optType: "Call", spot: 1842.5, strike: 1970, histVol: 18.45, mktPrice: 12.45, bsmHist: 11.23, dev: 10.86, bsmGarch: 13.56, dte: 29 },
  ]
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
