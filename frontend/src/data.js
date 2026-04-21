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

export const RETURNS_DATA = [{"date": "Nov 03", "liqReturn": 0.009, "illiqReturn": 0.012, "liqVol": 10.2, "illiqVol": 8.5, "liqAmihud": 0.0003, "illiqAmihud": 0.006}, {"date": "Nov 10", "liqReturn": -0.004, "illiqReturn": -0.008, "liqVol": 11.5, "illiqVol": 9.2, "liqAmihud": 0.0004, "illiqAmihud": 0.007}, {"date": "Nov 17", "liqReturn": 0.015, "illiqReturn": 0.011, "liqVol": 10.8, "illiqVol": 8.9, "liqAmihud": 0.0003, "illiqAmihud": 0.006}, {"date": "Nov 24", "liqReturn": -0.012, "illiqReturn": -0.015, "liqVol": 12.1, "illiqVol": 10.4, "liqAmihud": 0.0005, "illiqAmihud": 0.008}, {"date": "Dec 01", "liqReturn": 0.022, "illiqReturn": 0.018, "liqVol": 11.4, "illiqVol": 9.8, "liqAmihud": 0.0004, "illiqAmihud": 0.007}, {"date": "Dec 08", "liqReturn": -0.008, "illiqReturn": -0.011, "liqVol": 13.5, "illiqVol": 11.2, "liqAmihud": 0.0006, "illiqAmihud": 0.009}, {"date": "Dec 15", "liqReturn": 0.028, "illiqReturn": 0.021, "liqVol": 12.8, "illiqVol": 10.5, "liqAmihud": 0.0005, "illiqAmihud": 0.008}, {"date": "Dec 22", "liqReturn": -0.016, "illiqReturn": -0.020, "liqVol": 14.2, "illiqVol": 12.6, "liqAmihud": 0.0007, "illiqAmihud": 0.011}, {"date": "Dec 29", "liqReturn": 0.032, "illiqReturn": 0.025, "liqVol": 13.6, "illiqVol": 11.8, "liqAmihud": 0.0006, "illiqAmihud": 0.010}, {"date": "Jan 05", "liqReturn": -0.011, "illiqReturn": -0.014, "liqVol": 15.4, "illiqVol": 13.2, "liqAmihud": 0.0008, "illiqAmihud": 0.013}, {"date": "Jan 12", "liqReturn": 0.019, "illiqReturn": 0.015, "liqVol": 14.8, "illiqVol": 12.5, "liqAmihud": 0.0007, "illiqAmihud": 0.012}, {"date": "Jan 19", "liqReturn": -0.009, "illiqReturn": -0.012, "liqVol": 16.5, "illiqVol": 14.8, "liqAmihud": 0.0009, "illiqAmihud": 0.015}, {"date": "Jan 26", "liqReturn": 0.025, "illiqReturn": 0.019, "liqVol": 15.1, "illiqVol": 13.4, "liqAmihud": 0.0008, "illiqAmihud": 0.014}, {"date": "Feb 02", "liqReturn": -0.014, "illiqReturn": -0.018, "liqVol": 17.2, "illiqVol": 15.6, "liqAmihud": 0.0010, "illiqAmihud": 0.018}, {"date": "Feb 09", "liqReturn": 0.038, "illiqReturn": 0.028, "liqVol": 16.5, "illiqVol": 14.2, "liqAmihud": 0.0009, "illiqAmihud": 0.017}, {"date": "Feb 16", "liqReturn": -0.021, "illiqReturn": -0.025, "liqVol": 19.8, "illiqVol": 17.4, "liqAmihud": 0.0011, "illiqAmihud": 0.021}, {"date": "Feb 23", "liqReturn": 0.035, "illiqReturn": 0.026, "liqVol": 18.2, "illiqVol": 15.8, "liqAmihud": 0.0010, "illiqAmihud": 0.020}, {"date": "Mar 02", "liqReturn": -0.028, "illiqReturn": -0.032, "liqVol": 25.4, "illiqVol": 19.2, "liqAmihud": 0.0013, "illiqAmihud": 0.025}, {"date": "Mar 09", "liqReturn": 0.042, "illiqReturn": 0.031, "liqVol": 32.1, "illiqVol": 20.5, "liqAmihud": 0.0015, "illiqAmihud": 0.028}, {"date": "Mar 16", "liqReturn": -0.051, "illiqReturn": -0.062, "liqVol": 38.6, "illiqVol": 22.1, "liqAmihud": 0.0018, "illiqAmihud": 0.032}, {"date": "Mar 23", "liqReturn": 0.048, "illiqReturn": 0.035, "liqVol": 42.4, "illiqVol": 21.8, "liqAmihud": 0.0017, "illiqAmihud": 0.030}, {"date": "Mar 30", "liqReturn": -0.033, "illiqReturn": -0.045, "liqVol": 44.8, "illiqVol": 22.4, "liqAmihud": 0.0018, "illiqAmihud": 0.033}, {"date": "Apr 06", "liqReturn": 0.052, "illiqReturn": 0.038, "liqVol": 45.1, "illiqVol": 23.2, "liqAmihud": 0.0019, "illiqAmihud": 0.035}, {"date": "Apr 13", "liqReturn": -0.019, "illiqReturn": -0.024, "liqVol": 45.4, "illiqVol": 22.9, "liqAmihud": 0.0020, "illiqAmihud": 0.036}];
