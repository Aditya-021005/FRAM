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
        { strikeLabel: "ATM", dte: 29, strike: 730, mktPrice: 14.64, bsmHist: 14.68, bsmGarch: 39.50, devPct: -0.25, delta: 0.5694, gamma: 0.0128, vega: 0.8094 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 780, mktPrice: 1.08, bsmHist: 1.09, bsmGarch: 19.96, devPct: -0.77, delta: 0.0797, gamma: 0.0048, vega: 0.3057 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 680, mktPrice: 0.37, bsmHist: 0.37, bsmGarch: 14.97, devPct: 0.67, delta: -0.0307, gamma: 0.0023, vega: 0.1429 },
        { strikeLabel: "ATM", dte: 57, strike: 730, mktPrice: 21.39, bsmHist: 21.18, bsmGarch: 55.79, devPct: 0.98, delta: 0.5830, gamma: 0.0091, vega: 1.1260 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 780, mktPrice: 4.09, bsmHist: 4.06, bsmGarch: 35.27, devPct: 0.57, delta: 0.1793, gamma: 0.0061, vega: 0.7563 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 680, mktPrice: 1.53, bsmHist: 1.54, bsmGarch: 26.51, devPct: -0.77, delta: -0.0776, gamma: 0.0034, vega: 0.4198 }
      ],
      pnlSummary: {
        strategy: "Calendar Bull Call Spread",
        netDelta: 239.875, netGamma: 4.884, netVega: 215.625, netPremium: 6299.58,
        hedgeQty: -239.875, hedgeCost: -175480.55
      },
      pnlScenarios: [
        { shock: "-2%", vShock: "-20%", total: -117.76, d: -3509.61, g: 522.78, v: -640.54, h: 3509.61 },
        { shock: "-2%", vShock: "+20%", total: 1163.32, d: -3509.61, g: 522.78, v: 640.54, h: 3509.61 },
        { shock: "-1%", vShock: "-20%", total: -509.84, d: -1754.81, g: 130.69, v: -640.54, h: 1754.81 },
        { shock: "-1%", vShock: "+20%", total: 771.23, d: -1754.81, g: 130.69, v: 640.54, h: 1754.81 },
        { shock: "+1%", vShock: "-20%", total: -509.84, d: 1754.81, g: 130.69, v: -640.54, h: -1754.81 },
        { shock: "+1%", vShock: "+20%", total: 771.23, d: 1754.81, g: 130.69, v: 640.54, h: -1754.81 },
        { shock: "+2%", vShock: "-20%", total: -117.76, d: 3509.61, g: 522.78, v: -640.54, h: -3509.61 },
        { shock: "+2%", vShock: "+20%", total: 1163.32, d: 3509.61, g: 522.78, v: 640.54, h: -3509.61 }
      ]
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
        { strikeLabel: "ATM", dte: 29, strike: 1150, mktPrice: 40.34, bsmHist: 39.41, bsmGarch: 44.85, devPct: 2.37, delta: 0.7190, gamma: 0.0062, vega: 1.1147 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 1250, mktPrice: 2.82, bsmHist: 2.79, bsmGarch: 6.29, devPct: 1.08, delta: 0.1092, gamma: 0.0035, vega: 0.6195 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 1100, mktPrice: 1.51, bsmHist: 1.45, bsmGarch: 3.91, devPct: 4.67, delta: -0.0608, gamma: 0.0022, vega: 0.3987 },
        { strikeLabel: "ATM", dte: 57, strike: 1150, mktPrice: 52.91, bsmHist: 50.18, bsmGarch: 58.08, devPct: 5.45, delta: 0.6890, gamma: 0.0046, vega: 1.6352 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 1250, mktPrice: 9.28, bsmHist: 8.88, bsmGarch: 15.75, devPct: 4.42, delta: 0.2126, gamma: 0.0038, vega: 1.3469 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 1100, mktPrice: 4.50, bsmHist: 4.50, bsmGarch: 9.53, devPct: 1.07, delta: -0.1178, gamma: 0.0026, vega: 0.9165 }
      ],
      pnlSummary: {
        strategy: "Diagonal Protective Put",
        netDelta: 241.7, netGamma: 5.7165, netVega: 1473.85, netPremium: 24723.16,
        hedgeQty: -241.7, hedgeCost: -283949.17
      },
      pnlScenarios: [
        { shock: "-2%", vShock: "-20%", total: -3235.28, d: -5678.98, g: 1577.93, v: -4813.21, h: 5678.98 },
        { shock: "-2%", vShock: "+20%", total: 6391.14, d: -5678.98, g: 1577.93, v: 4813.21, h: 5678.98 },
        { shock: "-1%", vShock: "-20%", total: -4418.73, d: -2839.49, g: 394.48, v: -4813.21, h: 2839.49 },
        { shock: "-1%", vShock: "+20%", total: 5207.69, d: -2839.49, g: 394.48, v: 4813.21, h: 2839.49 },
        { shock: "+1%", vShock: "-20%", total: -4418.73, d: 2839.49, g: 394.48, v: -4813.21, h: -2839.49 },
        { shock: "+1%", vShock: "+20%", total: 5207.69, d: 2839.49, g: 394.48, v: 4813.21, h: -2839.49 },
        { shock: "+2%", vShock: "-20%", total: -3235.28, d: 5678.98, g: 1577.93, v: -4813.21, h: -5678.98 },
        { shock: "+2%", vShock: "+20%", total: 6391.14, d: 5678.98, g: 1577.93, v: 4813.21, h: -5678.98 }
      ]
    };
  }

  // Fallback for others
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
    pnlSummary: {
      strategy: "Dynamic Delta Hedge",
      netDelta: 0.1234, netGamma: 0.001, netVega: 100, netPremium: 5000,
      hedgeQty: -12.34, hedgeCost: -15000
    },
    pnlScenarios: [
      { shock: "-2%", vShock: "-20%", total: -50, d: -100, g: 10, v: -20, h: 60 },
      { shock: "+2%", vShock: "+20%", total: 80, d: 100, g: 10, v: 20, h: -50 }
    ]
  };
};

export const LIQUID_DATA = generateStockData("HDFCBANK.NS", true);
export const getIlliquidData = (ticker) => generateStockData(ticker, false);
export const getLiquidData = (ticker) => generateStockData(ticker, true);

export const RETURNS_DATA = Array.from({ length: 120 }, (_, i) => {
  const date = new Date(2025, 10, 1);
  date.setDate(date.getDate() + (i * 1.5));
  const p = i / 120;
  const liqVol = 35 + Math.sin(i * 0.1) * 2 + (p > 0.8 ? (p - 0.8) * 150 : 0) + Math.random() * 5;
  const illiqVol = 32 + p * 15 + Math.sin(i * 0.05) * 1;
  return { date: date.toLocaleDateString("en-IN", { year:'2-digit', month: "short" }), liqReturn: 0, illiqReturn: 0, liqVol, illiqVol, liqAmihud: 0, illiqAmihud: 0 };
});
