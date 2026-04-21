"""
FIN F414 - Part A: Stock Selection via Turnover Ranking
--------------------------------------------------------
This script:
1. Downloads 6 months of daily price & volume data for all NIFTY 50 stocks
2. Computes average daily turnover (Price x Volume) for each stock
3. Ranks them and identifies top 25% (liquid) and bottom 25% (illiquid)
4. Prints a justification table for your report
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# NIFTY 50 tickers (Yahoo Finance format)
# ─────────────────────────────────────────────
NIFTY50_TICKERS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "BHARTIARTL.NS", "ICICIBANK.NS",
    "INFOSYS.NS", "SBIN.NS", "HINDUNILVR.NS", "ITC.NS", "LT.NS",
    "KOTAKBANK.NS", "AXISBANK.NS", "BAJFINANCE.NS", "MARUTI.NS", "ASIANPAINT.NS",
    "HCLTECH.NS", "SUNPHARMA.NS", "TITAN.NS", "WIPRO.NS", "ULTRACEMCO.NS",
    "ONGC.NS", "NESTLEIND.NS", "NTPC.NS", "TATAMOTORS.NS", "POWERGRID.NS",
    "M&M.NS", "TATASTEEL.NS", "ADANIENT.NS", "ADANIPORTS.NS", "JSWSTEEL.NS",
    "COALINDIA.NS", "BAJAJFINSV.NS", "DRREDDY.NS", "GRASIM.NS", "HDFCLIFE.NS",
    "HINDALCO.NS", "INDUSINDBK.NS", "SBILIFE.NS", "TECHM.NS", "TRENT.NS",
    "BRITANNIA.NS", "CIPLA.NS", "EICHERMOT.NS", "BPCL.NS", "HEROMOTOCO.NS",
    "DIVISLAB.NS", "APOLLOHOSP.NS", "BAJAJ-AUTO.NS", "BEL.NS", "SHRIRAMFIN.NS"
]

# ─────────────────────────────────────────────
# Date range: last 6 months
# ─────────────────────────────────────────────
END_DATE   = datetime.today()
START_DATE = END_DATE - timedelta(days=182)

print(f"\n{'='*60}")
print(f"  FIN F414 — Part A: Stock Selection")
print(f"  Period: {START_DATE.strftime('%d %b %Y')} → {END_DATE.strftime('%d %b %Y')}")
print(f"{'='*60}\n")

# ─────────────────────────────────────────────
# Download data
# ─────────────────────────────────────────────
print("Downloading NIFTY 50 data from Yahoo Finance...")
raw = yf.download(
    NIFTY50_TICKERS,
    start=START_DATE,
    end=END_DATE,
    auto_adjust=True,
    progress=False
)

close  = raw["Close"]
volume = raw["Volume"]

# ─────────────────────────────────────────────
# Compute daily turnover = Close × Volume
# ─────────────────────────────────────────────
turnover_daily = close * volume          # in ₹ per day

# Average daily turnover over the 6-month window
avg_turnover = turnover_daily.mean()     # Series: ticker → avg ₹/day

# Drop tickers with no data
avg_turnover = avg_turnover.dropna()

# Convert to Crores for readability (1 Cr = 10,000,000)
avg_turnover_cr = avg_turnover / 1e7

# ─────────────────────────────────────────────
# Rank and classify
# ─────────────────────────────────────────────
df = pd.DataFrame({
    "Avg Daily Turnover (₹ Cr)": avg_turnover_cr.round(2)
}).sort_values("Avg Daily Turnover (₹ Cr)", ascending=False).reset_index()
df.columns = ["Ticker", "Avg Daily Turnover (₹ Cr)"]
df["Rank"] = range(1, len(df) + 1)

n = len(df)
top25_cutoff    = int(np.ceil(n * 0.25))   # top 25% threshold rank
bottom25_cutoff = int(np.floor(n * 0.75))  # bottom 25% threshold rank

df["Category"] = "Mid"
df.loc[df["Rank"] <= top25_cutoff,    "Category"] = "LIQUID (Top 25%)"
df.loc[df["Rank"] >= bottom25_cutoff, "Category"] = "ILLIQUID (Bottom 25%)"

# ─────────────────────────────────────────────
# Print full ranking table
# ─────────────────────────────────────────────
print(f"\n{'─'*60}")
print(f"  NIFTY 50 — Ranked by Avg Daily Turnover (6 months)")
print(f"{'─'*60}")
print(f"{'Rank':<6} {'Ticker':<18} {'Avg Turnover (₹ Cr)':<24} {'Category'}")
print(f"{'─'*60}")

for _, row in df.iterrows():
    marker = " ◄" if "LIQUID" in row["Category"] else ""
    print(f"{int(row['Rank']):<6} {row['Ticker']:<18} {row['Avg Daily Turnover (₹ Cr)']:<24.2f} {row['Category']}{marker}")

# ─────────────────────────────────────────────
# Recommend one from each group
# ─────────────────────────────────────────────
liquid_stocks   = df[df["Category"] == "LIQUID (Top 25%)"]
illiquid_stocks = df[df["Category"] == "ILLIQUID (Bottom 25%)"]

# Pick the top of each group
chosen_liquid   = liquid_stocks.iloc[0]
chosen_illiquid = illiquid_stocks.iloc[-1]

print(f"\n{'='*60}")
print(f"  RECOMMENDED STOCK SELECTION")
print(f"{'='*60}")
print(f"\n  LIQUID STOCK   : {chosen_liquid['Ticker']}")
print(f"  Avg Turnover   : ₹{chosen_liquid['Avg Daily Turnover (₹ Cr)']:.2f} Crore/day")
print(f"  Rank           : {int(chosen_liquid['Rank'])} out of {n}")

print(f"\n  ILLIQUID STOCK : {chosen_illiquid['Ticker']}")
print(f"  Avg Turnover   : ₹{chosen_illiquid['Avg Daily Turnover (₹ Cr)']:.2f} Crore/day")
print(f"  Rank           : {int(chosen_illiquid['Rank'])} out of {n}")

print(f"\n{'─'*60}")
print(f"  Top 25% cutoff : Rank ≤ {top25_cutoff}   (≥ ₹{df.iloc[top25_cutoff-1]['Avg Daily Turnover (₹ Cr)']:.2f} Cr)")
print(f"  Bottom 25%     : Rank ≥ {bottom25_cutoff}  (≤ ₹{df.iloc[bottom25_cutoff-1]['Avg Daily Turnover (₹ Cr)']:.2f} Cr)")
print(f"{'─'*60}\n")

# ─────────────────────────────────────────────
# Save results to CSV for report
# ─────────────────────────────────────────────
df.to_csv("nifty50_turnover_ranking.csv", index=False)
print("  Saved: nifty50_turnover_ranking.csv")
print("\n  Use the chosen tickers in Part A Step 2 (log returns, volatility, Amihud).")
print(f"{'='*60}\n")


