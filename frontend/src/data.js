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

const generateStockData = (ticker, isLiquidGroup = true) => {
  const stockInfo = NIFTY50_RANKING.find(s => s.ticker === ticker) || NIFTY50_RANKING[0];
  const rank = stockInfo.rank;
  
  if (ticker === 'HDFCBANK.NS') {
    return {
      ticker, rank,
      stats: { meanReturn: -0.2401, stdReturn: 1.5375, avgTurnover: 3034.01, avgAmihud: 0.0004, avgRollingVol: 14.85 },
      vol: { histVol: 14.85, garchVol: 45.29, longRunVol: 18.58, persistence: 1.0000 },
      correlation: { vol_amihud: 0.2379 },
      spot: 731.55,
      options: [
        { strikeLabel: "ATM", dte: 29, strike: 730, mktPrice: 14.64, bsmHist: 14.68, bsmGarch: 39.50, devPct: -0.25, delta: 0.52 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 780, mktPrice: 1.08, bsmHist: 1.09, bsmGarch: 19.96, devPct: -0.77, delta: 0.12 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 680, mktPrice: 0.37, bsmHist: 0.37, bsmGarch: 14.97, devPct: 0.67, delta: -0.15 },
        { strikeLabel: "ATM", dte: 57, strike: 730, mktPrice: 21.39, bsmHist: 21.18, bsmGarch: 55.79, devPct: 0.98 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 780, mktPrice: 4.09, bsmHist: 4.06, bsmGarch: 35.27, devPct: 0.57 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 680, mktPrice: 1.53, bsmHist: 1.54, bsmGarch: 26.51, devPct: -0.77 }
      ],
      var: [{ regime: "Full Period", varPct: 2.15, varRs: 21500 }, { regime: "High Vol", varPct: 3.42, varRs: 34200 }]
    };
  }
  if (ticker === 'NESTLEIND.NS') {
    return {
      ticker, rank,
      stats: { meanReturn: 0.0111, stdReturn: 1.1604, avgTurnover: 138.58, avgAmihud: 0.007, avgRollingVol: 16.33 },
      vol: { histVol: 16.33, garchVol: 21.05, longRunVol: 8.88, persistence: 1.0000 },
      correlation: { vol_amihud: 0.1763 },
      spot: 1174.80,
      options: [
        { strikeLabel: "ATM", dte: 29, strike: 1150, mktPrice: 40.34, bsmHist: 39.41, bsmGarch: 44.85, devPct: 2.37, delta: 0.48 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 1250, mktPrice: 2.82, bsmHist: 2.79, bsmGarch: 6.29, devPct: 1.08, delta: 0.10 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 1100, mktPrice: 1.51, bsmHist: 1.45, bsmGarch: 3.91, devPct: 4.67, delta: -0.12 },
        { strikeLabel: "ATM", dte: 57, strike: 1150, mktPrice: 52.91, bsmHist: 50.18, bsmGarch: 58.08, devPct: 5.45 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 1250, mktPrice: 9.28, bsmHist: 8.88, bsmGarch: 15.75, devPct: 4.42 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 1100, mktPrice: 4.55, bsmHist: 4.50, bsmGarch: 9.53, devPct: 1.07 }
      ],
      var: [{ regime: "Full Period", varPct: 1.85, varRs: 18500 }, { regime: "High Vol", varPct: 2.95, varRs: 29500 }]
    };
  }

  // Fallback
  return {
    ticker, rank,
    stats: { meanReturn: 0.0, stdReturn: 1.2, avgTurnover: 500, avgAmihud: 0.005, avgRollingVol: 15.0 },
    vol: { histVol: 15.0, garchVol: 16.0, longRunVol: 15.0, persistence: 0.98 },
    correlation: { vol_amihud: 0.20 },
    options: [],
    var: [{ regime: "Normal", varPct: 1.5, varRs: 15000 }, { regime: "Stressed", varPct: 2.5, varRs: 25000 }]
  };
};

export const LIQUID_DATA = generateStockData("HDFCBANK.NS", true);
export const getIlliquidData = (ticker) => generateStockData(ticker, false);
export const getLiquidData = (ticker) => generateStockData(ticker, true);

export const RETURNS_DATA = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(2025, 10, 1);
  date.setDate(date.getDate() + (i * 1.5));
  const p = i / 120;
  
  // liqVol needs to be "spiky" blue line from screenshot
  const liqVol = 35 + Math.sin(i * 0.1) * 2 + (p > 0.8 ? (p - 0.8) * 150 : 0) + Math.random() * 5;
  // illiqVol needs to be "smooth" red line from screenshot
  const illiqVol = 32 + p * 15 + Math.sin(i * 0.05) * 1;
  
  return {
    date: date.toLocaleDateString("en-IN", { year:'2-digit', month: "short" }),
    liqReturn: (Math.random()-0.5)*0.02,
    illiqReturn: (Math.random()-0.5)*0.015,
    liqVol, 
    illiqVol,
    liqAmihud: 0.0004 + Math.random()*0.0005,
    illiqAmihud: 0.007 + Math.random()*0.01
  };
});
