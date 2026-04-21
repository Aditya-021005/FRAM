# src/partA_data.py

import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import warnings
warnings.filterwarnings("ignore")

from datetime import datetime, timedelta

# ─────────────────────────────────────────
# Replace with your chosen tickers from Step 1
# ─────────────────────────────────────────
LIQUID_TICKER      = "HDFCBANK.NS"
ILLIQUID_TICKER    = "NESTLEIND.NS"
SHARES_OUTSTANDING = 1e9   # placeholder — update with actual value if needed

END_DATE   = datetime.today()
START_DATE = END_DATE - timedelta(days=182)

# ─────────────────────────────────────────
# Download
# ─────────────────────────────────────────
def get_data(ticker):
    df = yf.download(ticker, start=START_DATE, end=END_DATE,
                     auto_adjust=True, progress=False)
    df = df[["Close", "Volume"]].copy()
    df.columns = df.columns.get_level_values(0)  # drop multi-level index from yfinance
    df.dropna(inplace=True)
    return df

print()
print("  Fetching data...")
liq_df   = get_data(LIQUID_TICKER)
illiq_df = get_data(ILLIQUID_TICKER)

# ─────────────────────────────────────────
# Metrics
# ─────────────────────────────────────────
def compute_metrics(df):
    df["Log_Return"]     = np.log(df["Close"] / df["Close"].shift(1))
    df["Rolling_Vol"]    = df["Log_Return"].rolling(20).std() * np.sqrt(252)
    df["Turnover"]       = df["Close"] * df["Volume"]
    df["Turnover_Ratio"] = df["Volume"] / SHARES_OUTSTANDING
    df["Amihud"]         = df["Log_Return"].abs() / df["Turnover"]
    return df.dropna()

liq_df   = compute_metrics(liq_df)
illiq_df = compute_metrics(illiq_df)

# ─────────────────────────────────────────
# Summary stats
# ─────────────────────────────────────────
def summary_stats(df, name):
    return {
        "Stock":                name,
        "Mean Return (%)":      round(df["Log_Return"].mean() * 100, 4),
        "Std Dev Return (%)":   round(df["Log_Return"].std()  * 100, 4),
        "Min Return (%)":       round(df["Log_Return"].min()  * 100, 4),
        "Max Return (%)":       round(df["Log_Return"].max()  * 100, 4),
        "Avg Turnover (₹ Cr)": round(df["Turnover"].mean() / 1e7, 2),
        "Avg Turnover Ratio":   round(df["Turnover_Ratio"].mean(), 6),
        "Avg Amihud (×10⁻⁹)": round(df["Amihud"].mean() * 1e9, 4),
        "Avg Rolling Vol (%)":  round(df["Rolling_Vol"].mean() * 100, 2),
    }

stats_table = pd.DataFrame([
    summary_stats(liq_df,   LIQUID_TICKER),
    summary_stats(illiq_df, ILLIQUID_TICKER)
]).set_index("Stock")

print()
print("  Summary Statistics")
print(f"  {'─'*40}")
print(stats_table.T.to_string())
print()

stats_table.to_csv("part_a_summary_stats.csv")
print("  Saved: part_a_summary_stats.csv")

# ─────────────────────────────────────────
# Correlations
# ─────────────────────────────────────────
corr_liq   = liq_df[["Rolling_Vol", "Amihud", "Turnover_Ratio"]].corr()
corr_illiq = illiq_df[["Rolling_Vol", "Amihud", "Turnover_Ratio"]].corr()

print()
print(f"  Correlation matrix — {LIQUID_TICKER} (liquid)")
print(corr_liq.round(4).to_string())
print()
print(f"  Correlation matrix — {ILLIQUID_TICKER} (illiquid)")
print(corr_illiq.round(4).to_string())
print()

# ─────────────────────────────────────────
# Plots
# ─────────────────────────────────────────
fig = plt.figure(figsize=(18, 20))
gs  = gridspec.GridSpec(4, 2, figure=fig, hspace=0.45, wspace=0.3)

stocks = {
    LIQUID_TICKER:   (liq_df,   "steelblue", "Liquid"),
    ILLIQUID_TICKER: (illiq_df, "tomato",    "Illiquid"),
}

for col, (ticker, (df, color, label)) in enumerate(stocks.items()):
    # Log returns
    ax = fig.add_subplot(gs[0, col])
    ax.plot(df.index, df["Log_Return"], color=color, alpha=0.7, linewidth=0.8)
    ax.axhline(0, color="black", linewidth=0.5, linestyle="--")
    ax.set_title(f"Daily Log Returns — {label} ({ticker})", fontweight="bold")
    ax.set_ylabel("Log Return")
    ax.set_xlabel("Date")

    # Rolling volatility
    ax = fig.add_subplot(gs[1, col])
    ax.plot(df.index, df["Rolling_Vol"] * 100, color=color, linewidth=1.2)
    ax.set_title(f"20-Day Rolling Volatility — {label} ({ticker})", fontweight="bold")
    ax.set_ylabel("Annualized Vol (%)")
    ax.set_xlabel("Date")

    # Amihud
    ax = fig.add_subplot(gs[2, col])
    ax.plot(df.index, df["Amihud"] * 1e9, color=color, linewidth=1.0, alpha=0.8)
    ax.set_title(f"Amihud Illiquidity — {label} ({ticker})", fontweight="bold")
    ax.set_ylabel("Amihud (×10⁻⁹)")
    ax.set_xlabel("Date")

    # Scatter: vol vs amihud
    ax = fig.add_subplot(gs[3, col])
    ax.scatter(df["Amihud"] * 1e9, df["Rolling_Vol"] * 100,
               color=color, alpha=0.5, s=20)
    ax.set_title(f"Volatility vs Amihud — {label} ({ticker})", fontweight="bold")
    ax.set_xlabel("Amihud Illiquidity (×10⁻⁹)")
    ax.set_ylabel("Rolling Vol (%)")

plt.suptitle("FIN F414 — Part A: Volatility & Liquidity Analysis",
             fontsize=15, fontweight="bold", y=1.01)
plt.savefig("part_a_plots.png", dpi=150, bbox_inches="tight")
plt.show()

print("  Saved: part_a_plots.png")
print()