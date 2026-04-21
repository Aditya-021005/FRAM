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
      stats: { meanReturn: -0.2401, stdReturn: 1.5375, minReturn: -5.4667, maxReturn: 5.5552, avgTurnover: 3034.01, avgAmihud: 0.0004, avgRollingVol: 18.82 },
      vol: { histVol: 14.85, garchVol: 45.29, longRunVol: 18.58, persistence: 1.0000 },
      correlation: { vol_amihud: 0.2379 },
      spot: 731.55,
      options: [
        { strikeLabel: "ATM", dte: 29, strike: 730, mktPrice: 14.64, bsmHist: 14.68, bsmGarch: 39.50, devPct: -0.25, delta: 0.52, gamma: 0.002, vega: 1.2 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 780, mktPrice: 1.08, bsmHist: 1.09, bsmGarch: 19.96, devPct: -0.77, delta: 0.12, gamma: 0.001, vega: 0.4 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 680, mktPrice: 0.37, bsmHist: 0.37, bsmGarch: 14.97, devPct: 0.67, delta: -0.15, gamma: 0.0012, vega: 0.6 },
        { strikeLabel: "ATM", dte: 57, strike: 730, mktPrice: 21.39, bsmHist: 21.18, bsmGarch: 55.79, devPct: 0.98, delta: 0.55 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 780, mktPrice: 4.09, bsmHist: 4.06, bsmGarch: 35.27, devPct: 0.57, delta: 0.18 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 680, mktPrice: 1.53, bsmHist: 1.54, bsmGarch: 26.51, devPct: -0.77, delta: -0.12 }
      ],
      pnl: [{ priceShock: "-2%", volShock: "-20%", totalPnl: -400 }, { priceShock: "+2%", volShock: "+20%", totalPnl: 500 }],
      var: [{ regime: "Full Period", varPct: 2.15, varRs: 21500 }, { regime: "High Vol", varPct: 3.42, varRs: 34200 }]
    };
  }
  if (ticker === 'NESTLEIND.NS') {
    return {
      ticker, rank,
      stats: { meanReturn: 0.0111, stdReturn: 1.1604, minReturn: -2.7249, maxReturn: 3.3969, avgTurnover: 138.58, avgAmihud: 0.007, avgRollingVol: 16.57 },
      vol: { histVol: 16.33, garchVol: 21.05, longRunVol: 8.88, persistence: 1.0000 },
      correlation: { vol_amihud: 0.1763 },
      spot: 1174.80,
      options: [
        { strikeLabel: "ATM", dte: 29, strike: 1150, mktPrice: 40.34, bsmHist: 39.41, bsmGarch: 44.85, devPct: 2.37, delta: 0.48, gamma: 0.003, vega: 1.4 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 1250, mktPrice: 2.82, bsmHist: 2.79, bsmGarch: 6.29, devPct: 1.08, delta: 0.10, gamma: 0.001, vega: 0.5 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 1100, mktPrice: 1.51, bsmHist: 1.45, bsmGarch: 3.91, devPct: 4.67, delta: -0.12, gamma: 0.0012, vega: 0.6 },
        { strikeLabel: "ATM", dte: 57, strike: 1150, mktPrice: 52.91, bsmHist: 50.18, bsmGarch: 58.08, devPct: 5.45, delta: 0.52 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 1250, mktPrice: 9.28, bsmHist: 8.88, bsmGarch: 15.75, devPct: 4.42, delta: 0.14 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 1100, mktPrice: 4.55, bsmHist: 4.50, bsmGarch: 9.53, devPct: 1.07, delta: -0.10 }
      ],
      pnl: [{ priceShock: "-2%", volShock: "-20%", totalPnl: -800 }, { priceShock: "+2%", volShock: "+20%", totalPnl: 900 }],
      var: [{ regime: "Full Period", varPct: 1.85, varRs: 18500 }, { regime: "High Vol", varPct: 2.95, varRs: 29500 }]
    };
  }

  // Fallback for others - ADDED MISSING PROPS
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const meanReturn = isLiquidGroup ? -0.1 + (seed % 10)/200 : 0.01 + (seed % 10)/1000;
  const stdReturn = isLiquidGroup ? 1.4 + (seed % 5)/20 : 1.1 + (seed % 5)/50;
  return {
    ticker, rank,
    stats: { meanReturn, stdReturn, minReturn: meanReturn - 3*stdReturn, maxReturn: meanReturn + 3*stdReturn, avgTurnover: stockInfo.turnover, avgAmihud: isLiquidGroup ? 0.0004 : 0.005, avgRollingVol: 15 },
    vol: { histVol: 15, garchVol: 16, longRunVol: 15, persistence: 0.98 },
    correlation: { vol_amihud: 0.20 },
    options: [
      { strikeLabel: "ATM", dte: 29, mktPrice: 50, bsmHist: 48, bsmGarch: 52, delta: 0.5, gamma: 0.002, vega: 1.0 },
      { strikeLabel: "OTM_Call", dte: 29, mktPrice: 15, bsmHist: 14, bsmGarch: 16, delta: 0.15, gamma: 0.001, vega: 0.4 },
      { strikeLabel: "OTM_Put", dte: 29, mktPrice: 18, bsmHist: 17, bsmGarch: 19, delta: -0.18, gamma: 0.001, vega: 0.5 }
    ],
    pnl: [{ priceShock: "-2%", volShock: "-20%", totalPnl: -350 }, { priceShock: "+2%", volShock: "+20%", totalPnl: 450 }],
    var: [{ regime: "Normal", varPct: 1.5, varRs: 15000 }, { regime: "Stressed", varPct: 2.5, varRs: 29500 }]
  };
};

export const LIQUID_DATA = generateStockData("HDFCBANK.NS", true);
export const getIlliquidData = (ticker) => generateStockData(ticker, false);
export const getLiquidData = (ticker) => generateStockData(ticker, true);

export const RETURNS_DATA = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(2025, 10, 1);
  date.setDate(date.getDate() + (i * 1.5));
  const p = i / 120;
  const liqVolBase = 10 + (p < 0.6 ? p * 12 : 12 + (p-0.6)*110);
  const liqVol = liqVolBase + Math.sin(i * 0.2) * 2;
  const liqRet = (Math.random() - 0.5) * (liqVol / 400) + Math.sin(i * 0.1) * 0.002;
  const liqAm = (Math.random() * 0.0005) + (Math.sin(i * 0.3) > 0.8 ? 0.0006 : 0);
  const illiqVolBase = 8 + p * 14;
  const illiqVol = illiqVolBase + Math.sin(i * 0.15) * 3;
  const illiqRet = (Math.random() - 0.5) * (illiqVol / 300) + Math.sin(i * 0.08) * 0.003;
  const illiqAm = (Math.random() * 0.012) + (Math.sin(i * 0.25) > 0.7 ? 0.010 : 0);
  return {
    date: date.toLocaleDateString("en-IN", { year:'2-digit', month: "short" }),
    liqReturn: liqRet, illiqReturn: illiqRet,
    liqVol, illiqVol,
    liqAmihud: liqAm, illiqAmihud: illiqAm
  };
});
