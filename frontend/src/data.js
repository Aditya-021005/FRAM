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
      vol: { histVol: 14.85, garchVol: 45.29, longRunVol: 18.58, persistence: 1.0000, dailyCondVol: 2.8533 },
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
      ],
      varAnalysis: [
        { regime: "Full Period", conf: "95%", mean: -0.3077, vol: 1.3163, varPct: 2.4727, varRs: 24727.08 },
        { regime: "Full Period", conf: "99%", mean: -0.3077, vol: 1.3163, varPct: 3.3697, varRs: 33697.28 },
        { regime: "Normal", conf: "95%", mean: -0.1479, vol: 0.8165, varPct: 1.4910, varRs: 14909.52 },
        { regime: "Normal", conf: "99%", mean: -0.1479, vol: 0.8165, varPct: 2.0474, varRs: 20473.88 },
        { regime: "High-Vol", conf: "95%", mean: -0.7684, vol: 2.1586, varPct: 4.3190, varRs: 43189.54 },
        { regime: "High-Vol", conf: "99%", mean: -0.7684, vol: 2.1586, varPct: 5.7900, varRs: 57900.14 }
      ],
      varMethods: [
        { method: "Parametric-Normal", c95: 2.4727, c99: 3.3697 },
        { method: "GARCH(1,1)", c95: 5.0009, c99: 6.9454 },
        { method: "MC-Historical", c95: 2.4709, c99: 3.3572 },
        { method: "MC-GARCH", c95: 4.9963, c99: 7.0226 }
      ]
    };
  }
  if (ticker === 'NESTLEIND.NS') {
    return {
      ticker, rank,
      stats: { meanReturn: 0.0111, stdReturn: 1.1604, minReturn: -2.7249, maxReturn: 3.3969, avgTurnover: 138.58, avgAmihud: 0.007, avgRollingVol: 16.57 },
      vol: { histVol: 16.33, garchVol: 21.05, longRunVol: 8.88, persistence: 1.0000, dailyCondVol: 1.3258 },
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
      ],
      varAnalysis: [
        { regime: "Full Period", conf: "95%", mean: -0.0795, vol: 1.0462, varPct: 1.8003, varRs: 18002.73 },
        { regime: "Full Period", conf: "99%", mean: -0.0795, vol: 1.0462, varPct: 2.5132, varRs: 25132.20 },
        { regime: "Normal", conf: "95%", mean: -0.1117, vol: 0.9823, varPct: 1.7274, varRs: 17274.10 },
        { regime: "Normal", conf: "99%", mean: -0.1117, vol: 0.9823, varPct: 2.3968, varRs: 23968.45 },
        { regime: "High-Vol", conf: "95%", mean: 0.0133, vol: 1.2286, varPct: 2.0076, varRs: 20076.48 },
        { regime: "High-Vol", conf: "99%", mean: 0.0133, vol: 1.2286, varPct: 2.8450, varRs: 28449.50 }
      ],
      varMethods: [
        { method: "Parametric-Normal", c95: 1.8003, c99: 2.5132 },
        { method: "GARCH(1,1)", c95: 2.2603, c99: 3.1638 },
        { method: "MC-Historical", c95: 1.8135, c99: 2.5086 },
        { method: "MC-GARCH", c95: 2.2545, c99: 3.1610 }
      ]
    };
  }

  // Fallback for others
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const meanReturn = isLiquidGroup ? -0.1 + (seed % 10)/200 : 0.01 + (seed % 10)/1000;
  return { 
    ticker, rank, stats: { meanReturn, stdReturn: 1.5, avgRollingVol: 15 }, 
    vol: { histVol: 15, garchVol: 20, dailyCondVol: 1.25 }, 
    correlation: { vol_amihud: 0.2 }, 
    options: [], pnlSummary: { netDelta: 0, netGamma: 0, netVega: 0, netPremium: 0, hedgeQty: 0, hedgeCost: 0 }, 
    pnlScenarios: [], 
    varAnalysis: [
      { regime: "Full Period", conf: "95%", mean: 0.01, vol: 1.2, varPct: 1.5, varRs: 15000 },
      { regime: "Full Period", conf: "99%", mean: 0.01, vol: 1.2, varPct: 2.5, varRs: 25000 },
      { regime: "Normal", conf: "95%", mean: 0.01, vol: 1.0, varPct: 1.2, varRs: 12000 },
      { regime: "Normal", conf: "99%", mean: 0.01, vol: 1.0, varPct: 2.0, varRs: 20000 },
      { regime: "High-Vol", conf: "95%", mean: 0.01, vol: 2.0, varPct: 3.5, varRs: 35000 },
      { regime: "High-Vol", conf: "99%", mean: 0.01, vol: 2.0, varPct: 5.0, varRs: 50000 }
    ], 
    varMethods: [
      { method: "Parametric-Normal", c95: 1.5, c99: 2.5 },
      { method: "GARCH(1,1)", c95: 2.2, c99: 3.2 },
      { method: "MC-Historical", c95: 1.6, c99: 2.6 },
      { method: "MC-GARCH", c95: 2.3, c99: 3.3 }
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
  const hdfcVaR = 1.5 + (p * 4.5) + Math.sin(i * 0.1) * 0.3;
  const nestleVaR = 1.4 + (p * 2.2) + Math.cos(i * 0.1) * 0.2;
  return { 
    date: date.toLocaleDateString("en-IN", { year:'2-digit', month: "short" }), 
    liqReturn: (Math.random()-0.5)*0.02 + (p > 0.8 ? 0.03 : 0), 
    illiqReturn: (Math.random()-0.5)*0.015, 
    liqVol, illiqVol, 
    hdfcVaR, nestleVaR,
    isHighVolLiq: p > 0.6 && Math.sin(i*0.5) > 0.3,
    isHighVolIlliq: p > 0.7 && Math.cos(i*0.4) > 0.4
  };
});

export const HISTOGRAM_DATA = Array.from({ length: 80 }, (_, i) => {
  const x = -4 + (i * 0.1);
  const hdfcVal = Math.exp(-Math.pow(x + 0.3, 2) / 2) / Math.sqrt(2 * Math.PI) + (x < -2 ? Math.random()*0.1 : 0);
  const nestleVal = Math.exp(-Math.pow(x, 2) / 1.5) / Math.sqrt(2 * Math.PI * 0.75);
  return { bi: x.toFixed(1), hdfc: hdfcVal, nestle: nestleVal };
});
