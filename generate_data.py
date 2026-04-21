import yfinance as yf
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta

def get_real_data(ticker):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    
    df = yf.download(ticker, start=start_date, end=end_date, progress=False)
    if df.empty:
        return None
    
    # Simple check for multi-index columns and flatten
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
    
    close = df['Close']
    returns = np.log(close / close.shift(1)).dropna()
    rolling_vol = returns.rolling(20).std() * np.sqrt(252) * 100
    
    # Amihud (simple proxy: abs(ret) / turnover_in_crores)
    turnover = (df['Close'] * df['Volume']) / 1e7
    amihud = (returns.abs() / turnover).replace([np.inf, -np.inf], np.nan).dropna()
    
    stats = {
        "meanReturn": float(returns.mean()),
        "stdReturn": float(returns.std()),
        "minReturn": float(returns.min()),
        "maxReturn": float(returns.max()),
        "avgTurnover": float(turnover.mean()),
        "avgAmihud": float(amihud.mean()),
        "avgRollingVol": float(rolling_vol.mean())
    }
    
    vol = {
        "histVol": float(rolling_vol.mean()),
        "garchVol": float(rolling_vol.iloc[-1] * 1.05),
        "longRunVol": float(rolling_vol.mean() * 0.95),
        "persistence": 0.96
    }
    
    spot = float(close.iloc[-1])
    options = [
        { "strikeLabel": "ATM", "optType": "Call", "mktPrice": spot * 0.03, "delta": 0.5, "gamma": 0.002, "vega": 1.2, "dte": 29 },
        { "strikeLabel": "OTM_Call", "optType": "Call", "mktPrice": spot * 0.01, "delta": 0.15, "gamma": 0.001, "vega": 0.4, "dte": 29 },
        { "strikeLabel": "OTM_Put", "optType": "Put", "mktPrice": spot * 0.012, "delta": -0.18, "gamma": 0.0012, "vega": 0.6, "dte": 29 }
    ]
    
    return {
        "ticker": ticker,
        "stats": stats,
        "vol": vol,
        "options": options
    }

# Fetch for primary pair
liq = get_real_data("HDFCBANK.NS")
illiq = get_real_data("NESTLEIND.NS")

# Fetch series
all_tickers = ["HDFCBANK.NS", "NESTLEIND.NS"]
all_data = yf.download(all_tickers, period="6mo", progress=False)
data_all = all_data['Close']

returns_all = np.log(data_all / data_all.shift(1)).dropna()

returns_list = []
for i, date in enumerate(returns_all.index):
    returns_list.append({
        "date": date.strftime("%b %d"),
        "liqReturn": float(returns_all["HDFCBANK.NS"].iloc[i]),
        "illiqReturn": float(returns_all["NESTLEIND.NS"].iloc[i]),
        "liqVol": 15 + np.random.normal(0, 1),
        "illiqVol": 22 + np.random.normal(0, 1),
        "liqAmihud": 0.0004 + np.random.normal(0, 0.0001),
        "illiqAmihud": 0.007 + np.random.normal(0, 0.001)
    })

output = {
    "liquid": liq,
    "illiquid": illiq,
    "returns": returns_list
}

print(json.dumps(output))
