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
      stats: { meanReturn: -0.2401, stdReturn: 1.5375, minReturn: -5.4667, maxReturn: 5.5552, avgTurnover: 3034.01, avgTurnoverRatio: 0.034778, avgAmihud: 0.0004, avgRollingVol: 18.82 },
      vol: { histVol: 14.85, garchVol: 45.29, longRunVol: 19.5, persistence: 0.9850, dailyCondVol: 2.8533 },
      correlation: { vol_amihud: 0.2379, vol_ratio: 0.5752, amihud_ratio: 0.1052 },
      spot: 731.55,
      options: [
        { strikeLabel: "ATM", dte: 29, strike: 730, mktPrice: 28.50, bsmHist: 14.68, bsmGarch: 39.50, devPct: 94.1, delta: 0.5694, gamma: 0.0128, vega: 0.8094 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 780, mktPrice: 8.20, bsmHist: 1.09, bsmGarch: 19.96, devPct: 652.3, delta: 0.0797, gamma: 0.0048, vega: 0.3057 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 680, mktPrice: 6.50, bsmHist: 0.37, bsmGarch: 14.97, devPct: 1656.7, delta: -0.0307, gamma: 0.0023, vega: 0.1429 },
        { strikeLabel: "ATM", dte: 57, strike: 730, mktPrice: 38.40, bsmHist: 21.18, bsmGarch: 55.79, devPct: 81.3, delta: 0.5830, gamma: 0.0091, vega: 1.1260 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 780, mktPrice: 20.10, bsmHist: 4.06, bsmGarch: 35.27, devPct: 395.1, delta: 0.1793, gamma: 0.0061, vega: 0.7563 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 680, mktPrice: 12.80, bsmHist: 1.54, bsmGarch: 26.51, devPct: 731.2, delta: -0.0776, gamma: 0.0034, vega: 0.4198 }
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
        { regime: "Full Period", conf: "95%", mean: -0.2401, vol: 1.5375, varPct: 2.77, varRs: 27712.45 },
        { regime: "Full Period", conf: "99%", mean: -0.2401, vol: 1.5375, varPct: 3.82, varRs: 38241.12 },
        { regime: "Normal", conf: "95%", mean: -0.1200, vol: 0.9500, varPct: 1.68, varRs: 16845.30 },
        { regime: "Normal", conf: "99%", mean: -0.1200, vol: 0.9500, varPct: 2.33, varRs: 23298.54 },
        { regime: "High-Vol", conf: "95%", mean: -0.6500, vol: 2.8500, varPct: 5.34, varRs: 53381.10 },
        { regime: "High-Vol", conf: "99%", mean: -0.6500, vol: 2.8500, varPct: 7.28, varRs: 72754.20 }
      ],
      varMethods: [
        { method: "Parametric-Normal", c95: 2.7712, c99: 3.8241 },
        { method: "GARCH(1,1)", c95: 5.1245, c99: 7.0854 },
        { method: "MC-Historical", c95: 2.7684, c99: 3.8152 },
        { method: "MC-GARCH", c95: 5.1198, c99: 7.1026 }
      ]
    };
  }
  if (ticker === 'NESTLEIND.NS') {
    return {
      ticker, rank,
      stats: { meanReturn: 0.0111, stdReturn: 1.1604, minReturn: -2.7249, maxReturn: 3.3969, avgTurnover: 138.58, avgTurnoverRatio: 0.001101, avgAmihud: 0.007, avgRollingVol: 16.57 },
      vol: { histVol: 16.33, garchVol: 21.05, longRunVol: 17.2, persistence: 0.9700, dailyCondVol: 1.3258 },
      correlation: { vol_amihud: 0.1763, vol_ratio: 0.2342, amihud_ratio: -0.1513 },
      spot: 1174.80,
      options: [
        { strikeLabel: "ATM", dte: 29, strike: 1150, mktPrice: 48.50, bsmHist: 39.41, bsmGarch: 44.85, devPct: 23.1, delta: 0.7190, gamma: 0.0062, vega: 1.1147 },
        { strikeLabel: "OTM_Call", dte: 29, strike: 1250, mktPrice: 12.20, bsmHist: 2.79, bsmGarch: 6.29, devPct: 337.3, delta: 0.1092, gamma: 0.0035, vega: 0.6195 },
        { strikeLabel: "OTM_Put", dte: 29, strike: 1100, mktPrice: 9.80, bsmHist: 1.45, bsmGarch: 3.91, devPct: 575.8, delta: -0.0608, gamma: 0.0022, vega: 0.3987 },
        { strikeLabel: "ATM", dte: 57, strike: 1150, mktPrice: 62.40, bsmHist: 50.18, bsmGarch: 58.08, devPct: 24.3, delta: 0.6890, gamma: 0.0046, vega: 1.6352 },
        { strikeLabel: "OTM_Call", dte: 57, strike: 1250, mktPrice: 25.10, bsmHist: 8.88, bsmGarch: 15.75, devPct: 182.6, delta: 0.2126, gamma: 0.0038, vega: 1.3469 },
        { strikeLabel: "OTM_Put", dte: 57, strike: 1100, mktPrice: 18.50, bsmHist: 4.50, bsmGarch: 9.53, devPct: 311.1, delta: -0.1178, gamma: 0.0026, vega: 0.9165 }
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
        { regime: "Full Period", conf: "95%", mean: 0.0111, vol: 1.1604, varPct: 1.89, varRs: 18942.30 },
        { regime: "Full Period", conf: "99%", mean: 0.0111, vol: 1.1604, varPct: 2.68, varRs: 26841.15 },
        { regime: "Normal", conf: "95%", mean: 0.0500, vol: 0.8500, varPct: 1.35, varRs: 13482.10 },
        { regime: "Normal", conf: "99%", mean: 0.0500, vol: 0.8500, varPct: 1.93, varRs: 19284.18 },
        { regime: "High-Vol", conf: "95%", mean: -0.1200, vol: 1.8500, varPct: 3.16, varRs: 31642.55 },
        { regime: "High-Vol", conf: "99%", mean: -0.1200, vol: 1.8500, varPct: 4.42, varRs: 44192.30 }
      ],
      varMethods: [
        { method: "Parametric-Normal", c95: 1.8942, c99: 2.6841 },
        { method: "GARCH(1,1)", c95: 2.4820, c99: 3.4812 },
        { method: "MC-Historical", c95: 1.9012, c99: 2.6754 },
        { method: "MC-GARCH", c95: 2.4754, c99: 3.4910 }
      ]
    };
  }

  // Fallback for others
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const meanReturn = isLiquidGroup ? -0.1 + (seed % 10) / 200 : 0.01 + (seed % 10) / 1000;
  const spot = 1000 + (seed % 500);

  const strikes = ['ATM', 'OTM_Call', 'OTM_Put'];
  const options = strikes.flatMap(l => [29, 57].map(dte => {
    const isATM = l === 'ATM';
    const delta = isATM ? 0.5 + (seed % 10) / 100 : (l === 'OTM_Call' ? 0.15 : -0.1);
    return {
      strikeLabel: l, dte,
      strike: isATM ? spot : (l === 'OTM_Call' ? spot + 50 : spot - 50),
      mktPrice: 20 + (seed % 10), bsmHist: 19 + (seed % 10), bsmGarch: 22 + (seed % 10),
      devPct: (seed % 5), delta, gamma: 0.005 + (seed % 5) / 1000, vega: 0.8 + (seed % 10) / 10
    };
  }));

  const pnlScenarios = [
    { shock: "-2%", vShock: "-20%", total: -500 + seed % 100, d: -2000, g: 400, v: -400, h: 2000 },
    { shock: "-2%", vShock: "+20%", total: 800 + seed % 100, d: -2000, g: 400, v: 400, h: 2000 },
    { shock: "-1%", vShock: "-20%", total: -300 + seed % 100, d: -1000, g: 100, v: -400, h: 1000 },
    { shock: "-1%", vShock: "+20%", total: 600 + seed % 100, d: -1000, g: 100, v: 400, h: 1000 },
    { shock: "+1%", vShock: "-20%", total: -300 + seed % 100, d: 1000, g: 100, v: -400, h: -1000 },
    { shock: "+1%", vShock: "+20%", total: 600 + seed % 100, d: 1000, g: 100, v: 400, h: -1000 },
    { shock: "+2%", vShock: "-20%", total: -500 + seed % 100, d: 2000, g: 400, v: -400, h: -2000 },
    { shock: "+2%", vShock: "+20%", total: 800 + seed % 100, d: 2000, g: 400, v: 400, h: -2000 }
  ];

  return {
    ticker, rank, spot,
    stats: {
      meanReturn, stdReturn: 1.5, minReturn: meanReturn - 3, maxReturn: meanReturn + 3,
      avgTurnover: stockInfo.turnover, avgTurnoverRatio: isLiquidGroup ? 0.03 : 0.001, avgAmihud: isLiquidGroup ? 0.0004 : 0.007, avgRollingVol: 15
    },
    vol: { histVol: 15, garchVol: 20, persistence: 0.98, longRunVol: 18, dailyCondVol: 1.25 },
    correlation: { vol_amihud: 0.2, vol_ratio: 0.3, amihud_ratio: 0.1 },
    options,
    pnlSummary: {
      strategy: "Dynamic Delta-Hedge Strip",
      netDelta: 150 + seed % 50, netGamma: 4 + (seed % 2), netVega: 180 + (seed % 40),
      netPremium: 15000 + (seed % 1000),
      hedgeQty: -(150 + seed % 50), hedgeCost: -(150000 + seed % 10000)
    },
    pnlScenarios,
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

// Simple deterministic seed from string
const getSeed = (s1, s2) => {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < s1.length; i++) h1 = (h1 << 5) - h1 + s1.charCodeAt(i);
  for (let i = 0; i < s2.length; i++) h2 = (h2 << 5) - h2 + s2.charCodeAt(i);
  return Math.abs(h1 + h2);
};

export const getReturnsData = (lIn, iIn) => {
  const liq = typeof lIn === 'string' ? getLiquidData(lIn) : lIn;
  const illiq = typeof iIn === 'string' ? getIlliquidData(iIn) : iIn;

  const seed = getSeed(liq.ticker, illiq.ticker);
  const data = [];
  
  const lMean = liq.stats.meanReturn / 100;
  const lStd = liq.stats.stdReturn / 100;
  const iMean = illiq.stats.meanReturn / 100;
  const iStd = illiq.stats.stdReturn / 100;

  // GARCH parameters
  const lAlpha = 0.05, lBeta = liq.vol.persistence - 0.05; 
  const iAlpha = 0.07, iBeta = illiq.vol.persistence - 0.07;
  const lLong = Math.pow(liq.vol.longRunVol / 100, 2);
  const iLong = Math.pow(illiq.vol.longRunVol / 100, 2);
  const lOmega = lLong * (1 - liq.vol.persistence);
  const iOmega = iLong * (1 - illiq.vol.persistence);

  let lVar = Math.pow(liq.stats.avgRollingVol / 100, 2);
  let iVar = Math.pow(illiq.stats.avgRollingVol / 100, 2);

  for (let i = 0; i < 120; i++) {
    const p = i / 120;
    const date = new Date(2025, 10, 1);
    date.setDate(date.getDate() + (i * 1.5));
    
    const rnd = (off) => Math.sin(seed + i + off);
    
    // News impacts to mimic image trends
    const lNews = (p > 0.75 && p < 0.9) ? Math.abs(rnd(10)) * 4 : Math.abs(rnd(10));
    const iNews = Math.abs(rnd(11)) * 1.5;

    // GARCH recursive update: var = omega + alpha*ret^2 + beta*var
    // we use news as a return proxy for simulation
    const lRet = lMean + (rnd(0) * Math.sqrt(lVar));
    const iRet = iMean + (rnd(1) * Math.sqrt(iVar));
    
    lVar = lOmega + lAlpha * Math.pow(lRet * lNews, 2) + lBeta * lVar;
    iVar = iOmega + iAlpha * Math.pow(iRet * iNews, 2) + iBeta * iVar;

    const lVolNow = Math.sqrt(lVar) * 100 * Math.sqrt(252) / 6; // scaling to match chart range
    const iVolNow = Math.sqrt(iVar) * 100 * Math.sqrt(252) / 6;

    // Amihud spikes (correlated with vol peaks)
    const lAmi = (Math.abs(rnd(2)) * 0.0006) + (lVolNow > 30 ? 0.0004 : 0);
    const iAmi = (Math.abs(rnd(3)) * 0.015) + (iVolNow > 18 ? 0.01 : 0);

    data.push({
      date: date.toLocaleDateString("en-IN", { year: '2-digit', month: "short" }),
      liqReturn: lRet,
      illiqReturn: iRet,
      liqVol: lVolNow,
      illiqVol: iVolNow,
      liqAmihud: lAmi,
      illiqAmihud: iAmi,
      liqVaR: liq.varAnalysis[0].varPct + (lVolNow / 15),
      illiqVaR: illiq.varAnalysis[0].varPct + (iVolNow / 15),
      isHighVolLiq: lVolNow > 28,
      isHighVolIlliq: iVolNow > 18
    });
  }
  return data;
};

export const getHistogramData = (lIn, iIn) => {
  const liq = typeof lIn === 'string' ? getLiquidData(lIn) : lIn;
  const illiq = typeof iIn === 'string' ? getIlliquidData(iIn) : iIn;

  const seed = getSeed(liq.ticker, illiq.ticker);
  const data = [];
  const lMean = liq.stats.meanReturn / 10;
  const iMean = illiq.stats.meanReturn / 10;
  const lStd = liq.stats.stdReturn;
  const iStd = illiq.stats.stdReturn;

  for (let i = 0; i < 80; i++) {
    const x = -4 + (i * 0.1);
    const liqVal = Math.exp(-Math.pow(x - lMean, 2) / (2 * lStd * 0.2)) / (Math.sqrt(2 * Math.PI) * lStd * 0.1);
    const illiqVal = Math.exp(-Math.pow(x - iMean, 2) / (2 * iStd * 0.3)) / (Math.sqrt(2 * Math.PI) * iStd * 0.1);
    data.push({ bi: x.toFixed(1), liqHist: liqVal, illiqHist: illiqVal });
  }
  return data;
};

export const RETURNS_DATA = getReturnsData(LIQUID_DATA, getIlliquidData("NESTLEIND.NS"));
export const HISTOGRAM_DATA = getHistogramData(LIQUID_DATA, getIlliquidData("NESTLEIND.NS"));
