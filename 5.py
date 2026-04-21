# ══════════════════════════════════════════════════════════════════════════════
# FIN F414 — PART D: Risk Measurement & Stress Analysis
# Self-contained: re-runs Part A setup for the same 6-month dataset,
# then computes all VaR measures and plots.
#
# Deliverables:
#   1. Parametric VaR (Normal) at 95% & 99% — full period
#   2. Parametric VaR using GARCH(1,1) time-varying vol (Optional)
#   3. Monte Carlo VaR (Optional)
#   4. VaR split: Normal vs High-Volatility regimes (top 25% rolling vol days)
#   5. Summary tables + plots + interpretation
# ══════════════════════════════════════════════════════════════════════════════

import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from scipy.stats import norm
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore")

# ══════════════════════════════════════════════════════════════════════════════
# PART A SETUP  (same 6-month dataset)
# ══════════════════════════════════════════════════════════════════════════════

NIFTY50_TICKERS = [
    "RELIANCE.NS","TCS.NS","HDFCBANK.NS","BHARTIARTL.NS","ICICIBANK.NS",
    "INFOSYS.NS","SBIN.NS","HINDUNILVR.NS","ITC.NS","LT.NS",
    "KOTAKBANK.NS","AXISBANK.NS","BAJFINANCE.NS","MARUTI.NS","ASIANPAINT.NS",
    "HCLTECH.NS","SUNPHARMA.NS","TITAN.NS","WIPRO.NS","ULTRACEMCO.NS",
    "ONGC.NS","NESTLEIND.NS","NTPC.NS","TATAMOTORS.NS","POWERGRID.NS",
    "M&M.NS","TATASTEEL.NS","ADANIENT.NS","ADANIPORTS.NS","JSWSTEEL.NS",
    "COALINDIA.NS","BAJAJFINSV.NS","DRREDDY.NS","GRASIM.NS","HDFCLIFE.NS",
    "HINDALCO.NS","INDUSINDBK.NS","SBILIFE.NS","TECHM.NS","TRENT.NS",
    "BRITANNIA.NS","CIPLA.NS","EICHERMOT.NS","BPCL.NS","HEROMOTOCO.NS",
    "DIVISLAB.NS","APOLLOHOSP.NS","BAJAJ-AUTO.NS","BEL.NS","SHRIRAMFIN.NS"
]

END_DATE   = datetime(2026, 4, 1)
START_DATE = END_DATE - timedelta(days=182)

print("=" * 70)
print("PART A — Downloading 6-month data & identifying liquid/illiquid stocks")
print("=" * 70)

raw    = yf.download(NIFTY50_TICKERS, start=START_DATE, end=END_DATE,
                     auto_adjust=True, progress=False)
close  = raw["Close"]
volume = raw["Volume"]

avg_turnover    = (close * volume).mean().dropna()
avg_turnover_cr = avg_turnover / 1e7

df_rank = pd.DataFrame({
    "Ticker": avg_turnover_cr.index,
    "Avg Turnover (₹ Cr)": avg_turnover_cr.values
}).sort_values("Avg Turnover (₹ Cr)", ascending=False).reset_index(drop=True)
df_rank["Rank"] = range(1, len(df_rank) + 1)

n = len(df_rank)
top25    = int(np.ceil(n * 0.25))
bottom25 = int(np.floor(n * 0.75))
df_rank["Category"] = "Mid"
df_rank.loc[df_rank["Rank"] <= top25,    "Category"] = "LIQUID"
df_rank.loc[df_rank["Rank"] >= bottom25, "Category"] = "ILLIQUID"

LIQUID_TICKER   = df_rank[df_rank["Category"] == "LIQUID"].iloc[0]["Ticker"]
ILLIQUID_TICKER = df_rank[df_rank["Category"] == "ILLIQUID"].iloc[-1]["Ticker"]

print(f"\nLiquid   stock : {LIQUID_TICKER}")
print(f"Illiquid stock : {ILLIQUID_TICKER}")

SHARES_OUTSTANDING = 1e9
POSITION_VALUE     = 1_000_000   # ₹10 lakh hypothetical position for VaR in ₹

def get_data(ticker):
    df = yf.download(ticker, start=START_DATE, end=END_DATE,
                     auto_adjust=True, progress=False)
    return df[["Close", "Volume"]].dropna()

def compute_metrics(df):
    df = df.copy()
    df["Log_Return"]     = np.log(df["Close"] / df["Close"].shift(1))
    df["Rolling_Vol"]    = df["Log_Return"].rolling(20).std() * np.sqrt(252)
    df["Turnover"]       = df["Close"] * df["Volume"]
    df["Turnover_Ratio"] = df["Volume"] / SHARES_OUTSTANDING
    df["Amihud"]         = df["Log_Return"].abs() / df["Turnover"]
    return df.dropna()

liq_df   = compute_metrics(get_data(LIQUID_TICKER))
illiq_df = compute_metrics(get_data(ILLIQUID_TICKER))

print(f"\nData points — {LIQUID_TICKER}   : {len(liq_df)}")
print(f"Data points — {ILLIQUID_TICKER} : {len(illiq_df)}")

# ══════════════════════════════════════════════════════════════════════════════
# PART D BEGINS
# ══════════════════════════════════════════════════════════════════════════════

CONF_LEVELS = [0.95, 0.99]
Z_95 = norm.ppf(0.95)   # 1.6449
Z_99 = norm.ppf(0.99)   # 2.3263

# ─────────────────────────────────────────────────────────────────────────────
# D-1  VOLATILITY REGIME CLASSIFICATION
#      High-vol days = top 25% of rolling 20-day realised vol
#      Normal days   = remaining 75%
# ─────────────────────────────────────────────────────────────────────────────
def classify_regimes(df):
    df = df.copy()
    threshold = df["Rolling_Vol"].quantile(0.75)
    df["Regime"] = np.where(df["Rolling_Vol"] >= threshold, "High-Vol", "Normal")
    return df, threshold

liq_df,   liq_threshold   = classify_regimes(liq_df)
illiq_df, illiq_threshold = classify_regimes(illiq_df)

print(f"\nVol threshold (75th pct) — {LIQUID_TICKER}   : {liq_threshold*100:.2f}%")
print(f"Vol threshold (75th pct) — {ILLIQUID_TICKER} : {illiq_threshold*100:.2f}%")

# ─────────────────────────────────────────────────────────────────────────────
# D-2  PARAMETRIC VAR (MODEL BUILDING — NORMAL DISTRIBUTION)
#      Formula: VaR = μ - z * σ  (1-day, in return space)
#      In ₹:    VaR_₹ = Position × |VaR_return|
#      We report VaR as a positive number (loss)
# ─────────────────────────────────────────────────────────────────────────────
def parametric_var(returns, conf):
    mu    = returns.mean()
    sigma = returns.std()
    z     = norm.ppf(conf)
    var_r = -(mu - z * sigma)          # positive loss
    var_rs = var_r * POSITION_VALUE
    return var_r, var_rs, mu, sigma

def var_table_for_stock(df, ticker, liq_label):
    rows = []
    for regime in ["Full Period", "Normal", "High-Vol"]:
        if regime == "Full Period":
            ret = df["Log_Return"]
        elif regime == "Normal":
            ret = df[df["Regime"] == "Normal"]["Log_Return"]
        else:
            ret = df[df["Regime"] == "High-Vol"]["Log_Return"]

        if len(ret) < 5:
            continue

        for conf in CONF_LEVELS:
            var_r, var_rs, mu, sigma = parametric_var(ret, conf)
            rows.append({
                "Ticker":          ticker,
                "Liquidity":       liq_label,
                "Regime":          regime,
                "N (days)":        len(ret),
                "Conf Level":      f"{int(conf*100)}%",
                "Mean Return (%)": round(mu * 100, 4),
                "Daily Vol (%)":   round(sigma * 100, 4),
                "VaR (return %)":  round(var_r * 100, 4),
                "VaR (₹ on ₹10L)": round(var_rs, 2),
            })
    return pd.DataFrame(rows)

var_liq   = var_table_for_stock(liq_df,   LIQUID_TICKER,   "Liquid")
var_illiq = var_table_for_stock(illiq_df, ILLIQUID_TICKER, "Illiquid")
var_full  = pd.concat([var_liq, var_illiq], ignore_index=True)

print("\n" + "═"*110)
print("PART D — DELIVERABLE 1: PARAMETRIC VAR TABLE (Normal Model Building Approach)")
print("═"*110)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", 160)
print(var_full.to_string(index=False))

# ─────────────────────────────────────────────────────────────────────────────
# D-3  OPTIONAL: GARCH(1,1) VAR  (time-varying volatility)
#      Use GARCH conditional vol as σ in the parametric VaR formula.
#      This gives a VaR that responds to current volatility regime rather than
#      using the flat full-period std.
# ─────────────────────────────────────────────────────────────────────────────
GARCH_AVAILABLE = False
garch_var_rows  = []

try:
    from arch import arch_model

    def garch_var(log_returns, ticker, liq_label):
        ret_scaled = log_returns.dropna() * 100
        am  = arch_model(ret_scaled, vol="Garch", p=1, q=1, dist="normal")
        res = am.fit(disp="off")

        # One-step-ahead conditional volatility forecast (daily, in decimal)
        fc             = res.forecast(horizon=1)
        cond_var_daily = fc.variance.values[-1, 0] / 10_000
        cond_vol_daily = np.sqrt(cond_var_daily)

        mu = log_returns.dropna().mean()

        rows = []
        for conf in CONF_LEVELS:
            z     = norm.ppf(conf)
            var_r = -(mu - z * cond_vol_daily)
            var_rs = var_r * POSITION_VALUE
            rows.append({
                "Ticker":              ticker,
                "Liquidity":           liq_label,
                "Method":              "GARCH(1,1)",
                "Conf Level":          f"{int(conf*100)}%",
                "GARCH Cond Vol (%)":  round(cond_vol_daily * 100, 4),
                "GARCH Ann Vol (%)":   round(cond_vol_daily * np.sqrt(252) * 100, 2),
                "VaR (return %)":      round(var_r * 100, 4),
                "VaR (₹ on ₹10L)":    round(var_rs, 2),
            })

        omega = res.params["omega"]
        alpha = res.params["alpha[1]"]
        beta  = res.params["beta[1]"]
        print(f"\nGARCH(1,1) — {ticker}:  ω={omega:.6f}  α={alpha:.4f}  "
              f"β={beta:.4f}  persistence={alpha+beta:.4f}")
        print(f"  Conditional daily vol : {cond_vol_daily*100:.4f}%  "
              f"({cond_vol_daily*np.sqrt(252)*100:.2f}% ann)")

        return rows, res

    rows_liq,   res_liq   = garch_var(liq_df["Log_Return"],   LIQUID_TICKER,   "Liquid")
    rows_illiq, res_illiq = garch_var(illiq_df["Log_Return"], ILLIQUID_TICKER, "Illiquid")
    garch_var_rows = rows_liq + rows_illiq
    garch_var_df   = pd.DataFrame(garch_var_rows)

    print("\n" + "═"*100)
    print("PART D — DELIVERABLE 2 (OPTIONAL): GARCH(1,1) PARAMETRIC VAR")
    print("═"*100)
    print(garch_var_df.to_string(index=False))

    GARCH_AVAILABLE = True

except ImportError:
    print("\n[GARCH skipped] — install with:  pip install arch")

# ─────────────────────────────────────────────────────────────────────────────
# D-4  OPTIONAL: MONTE CARLO VAR
#      Simulate N_SIM daily return paths under:
#        (a) Historical mean & std (Normal MC)
#        (b) GARCH conditional vol (if available)
#      VaR = (1-conf) percentile of simulated loss distribution
# ─────────────────────────────────────────────────────────────────────────────
N_SIM = 100_000
np.random.seed(42)

mc_rows = []

def monte_carlo_var(mu, sigma, conf, method_label, ticker, liq_label):
    simulated = np.random.normal(mu, sigma, N_SIM)
    var_r      = -np.percentile(simulated, (1 - conf) * 100)
    var_rs     = var_r * POSITION_VALUE
    return {
        "Ticker":        ticker,
        "Liquidity":     liq_label,
        "Method":        method_label,
        "N Simulations": N_SIM,
        "Conf Level":    f"{int(conf*100)}%",
        "VaR (return %)":  round(var_r * 100, 4),
        "VaR (₹ on ₹10L)": round(var_rs, 2),
    }

for ticker, df, liq_label in [
    (LIQUID_TICKER,   liq_df,   "Liquid"),
    (ILLIQUID_TICKER, illiq_df, "Illiquid")
]:
    mu_h    = df["Log_Return"].mean()
    sigma_h = df["Log_Return"].std()

    for conf in CONF_LEVELS:
        mc_rows.append(monte_carlo_var(mu_h, sigma_h, conf,
                                        "MC-Historical", ticker, liq_label))

    if GARCH_AVAILABLE:
        # Use GARCH conditional daily vol for MC sigma
        res   = res_liq if ticker == LIQUID_TICKER else res_illiq
        fc    = res.forecast(horizon=1)
        sigma_g = np.sqrt(fc.variance.values[-1, 0] / 10_000)
        for conf in CONF_LEVELS:
            mc_rows.append(monte_carlo_var(mu_h, sigma_g, conf,
                                            "MC-GARCH", ticker, liq_label))

mc_df = pd.DataFrame(mc_rows)
print("\n" + "═"*100)
print("PART D — DELIVERABLE 3 (OPTIONAL): MONTE CARLO VAR")
print("═"*100)
print(mc_df.to_string(index=False))

# ─────────────────────────────────────────────────────────────────────────────
# D-5  CONSOLIDATED SUMMARY TABLE
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "═"*120)
print("PART D — CONSOLIDATED SUMMARY: VAR COMPARISON ACROSS METHODS & REGIMES")
print(f"  Position size: ₹{POSITION_VALUE:,.0f}  |  Stocks: {LIQUID_TICKER} vs {ILLIQUID_TICKER}")
print("═"*120)

# Pull full-period parametric VaR for clean summary
summary_rows = []
for _, row in var_full[var_full["Regime"] == "Full Period"].iterrows():
    summary_rows.append({
        "Ticker":    row["Ticker"],
        "Liquidity": row["Liquidity"],
        "Method":    "Parametric-Normal",
        "Regime":    "Full Period",
        "Conf":      row["Conf Level"],
        "VaR (%)":   row["VaR (return %)"],
        "VaR (₹)":   row["VaR (₹ on ₹10L)"],
    })

for _, row in var_full[var_full["Regime"] != "Full Period"].iterrows():
    summary_rows.append({
        "Ticker":    row["Ticker"],
        "Liquidity": row["Liquidity"],
        "Method":    "Parametric-Normal",
        "Regime":    row["Regime"],
        "Conf":      row["Conf Level"],
        "VaR (%)":   row["VaR (return %)"],
        "VaR (₹)":   row["VaR (₹ on ₹10L)"],
    })

if GARCH_AVAILABLE:
    for _, row in garch_var_df.iterrows():
        summary_rows.append({
            "Ticker":    row["Ticker"],
            "Liquidity": row["Liquidity"],
            "Method":    "GARCH(1,1)",
            "Regime":    "Full Period",
            "Conf":      row["Conf Level"],
            "VaR (%)":   row["VaR (return %)"],
            "VaR (₹)":   row["VaR (₹ on ₹10L)"],
        })

for _, row in mc_df.iterrows():
    summary_rows.append({
        "Ticker":    row["Ticker"],
        "Liquidity": row["Liquidity"],
        "Method":    row["Method"],
        "Regime":    "Full Period",
        "Conf":      row["Conf Level"],
        "VaR (%)":   row["VaR (return %)"],
        "VaR (₹)":   row["VaR (₹ on ₹10L)"],
    })

summary_df = pd.DataFrame(summary_rows)
print(summary_df.to_string(index=False))

# ─────────────────────────────────────────────────────────────────────────────
# D-6  PLOTS
# ─────────────────────────────────────────────────────────────────────────────
fig = plt.figure(figsize=(22, 30))
fig.suptitle("FIN F414 — Part D: Risk Measurement & Stress Analysis",
             fontsize=15, fontweight="bold")
gs = gridspec.GridSpec(4, 2,
                       hspace=0.85, wspace=0.42,
                       top=0.95, bottom=0.05,
                       left=0.07, right=0.96)

C_LIQ   = "#1565C0"   # dark blue  — liquid
C_ILLIQ = "#C62828"   # dark red   — illiquid
C_95    = "#42A5F5"   # light blue — 95%
C_99    = "#EF5350"   # light red  — 99%

# ── Plot 1: Return distributions with VaR cut-offs ───────────────────────────
for col, (df, ticker, color, liq_label) in enumerate([
    (liq_df,   LIQUID_TICKER,   C_LIQ,   "Liquid"),
    (illiq_df, ILLIQUID_TICKER, C_ILLIQ, "Illiquid"),
]):
    ax = fig.add_subplot(gs[0, col])
    ret = df["Log_Return"].dropna()
    ax.hist(ret * 100, bins=50, density=True, color=color,
            alpha=0.55, label="Empirical Returns")

    x = np.linspace(ret.min() * 100, ret.max() * 100, 300)
    ax.plot(x, norm.pdf(x, ret.mean()*100, ret.std()*100),
            color="black", linewidth=1.5, label="Fitted Normal")

    for conf, c, ls in [(0.95, C_95, "--"), (0.99, C_99, "-.")]:
        vr, _, _, _ = parametric_var(ret, conf)
        ax.axvline(-vr * 100, color=c, linestyle=ls, linewidth=1.8,
                   label=f"VaR {int(conf*100)}% = {vr*100:.2f}%")

    ax.set_title(f"Return Distribution & VaR Cut-offs\n{ticker} ({liq_label})",
                 fontsize=9, pad=12)
    ax.set_xlabel("Daily Log Return (%)", fontsize=8, labelpad=6)
    ax.set_ylabel("Density", fontsize=8)
    ax.legend(fontsize=7, loc="upper left")
    ax.grid(linestyle="--", alpha=0.35)

# ── Plot 2: VaR by Regime — bar chart ────────────────────────────────────────
for col, (df_var, ticker, liq_label) in enumerate([
    (var_liq,   LIQUID_TICKER,   "Liquid"),
    (var_illiq, ILLIQUID_TICKER, "Illiquid"),
]):
    ax      = fig.add_subplot(gs[1, col])
    regimes = ["Full Period", "Normal", "High-Vol"]
    x       = np.arange(len(regimes))
    w       = 0.35

    for i, (conf, color) in enumerate([(0.95, C_95), (0.99, C_99)]):
        vals = []
        for regime in regimes:
            row = df_var[(df_var["Regime"] == regime) &
                         (df_var["Conf Level"] == f"{int(conf*100)}%")]
            vals.append(row["VaR (return %)"].values[0] if len(row) > 0 else 0)
        offset = (i - 0.5) * w
        bars   = ax.bar(x + offset, vals, width=w, color=color, alpha=0.85,
                        label=f"VaR {int(conf*100)}%")
        for bar, val in zip(bars, vals):
            ax.text(bar.get_x() + bar.get_width()/2,
                    bar.get_height() + 0.04,
                    f"{val:.2f}%", ha="center", va="bottom", fontsize=7)

    ax.set_xticks(x)
    ax.set_xticklabels(regimes, fontsize=8.5, fontweight="bold")
    ax.set_title(f"1-Day VaR by Volatility Regime\n{ticker} ({liq_label})",
                 fontsize=9, pad=12)
    ax.set_ylabel("VaR (%)", fontsize=8)
    ax.legend(fontsize=8)
    ax.grid(axis="y", linestyle="--", alpha=0.35)
    ax.set_axisbelow(True)

# ── Plot 3: Method comparison — Parametric vs GARCH vs MC ────────────────────
ax = fig.add_subplot(gs[2, :])
methods_order = ["Parametric-Normal", "GARCH(1,1)", "MC-Historical", "MC-GARCH"]
methods_avail = [m for m in methods_order if m in summary_df["Method"].values]

x           = np.arange(len(methods_avail))
w           = 0.18
conf_styles = [(0.95, 0.70, ""), (0.99, 1.00, "///")]

idx = 0
for ci, (conf, alpha_val, hatch) in enumerate(conf_styles):
    for si, (ticker, s_color, s_hatch) in enumerate(
        [(LIQUID_TICKER, C_LIQ, ""), (ILLIQUID_TICKER, C_ILLIQ, "///")]
    ):
        vals = []
        for method in methods_avail:
            row = summary_df[
                (summary_df["Ticker"] == ticker) &
                (summary_df["Method"] == method) &
                (summary_df["Conf"]   == f"{int(conf*100)}%") &
                (summary_df["Regime"] == "Full Period")
            ]
            vals.append(row["VaR (%)"].values[0] if len(row) > 0 else 0)

        offset = (idx - 1.5) * w
        label  = f"{ticker.replace('.NS','')} {int(conf*100)}%"
        ax.bar(x + offset, vals, width=w, color=s_color,
               alpha=alpha_val, hatch=s_hatch, label=label)
        idx += 1

ax.set_xticks(x)
ax.set_xticklabels(methods_avail, fontsize=9, fontweight="bold")
ax.tick_params(axis="x", pad=8)
ax.set_title("VaR Comparison Across Methods (Full Period)\n"
             "Liquid vs Illiquid  |  95% & 99% Confidence Levels",
             fontsize=10, pad=14)
ax.set_ylabel("1-Day VaR (%)", fontsize=9)
ax.legend(fontsize=7.5, ncol=4, loc="upper left")
ax.grid(axis="y", linestyle="--", alpha=0.35)
ax.set_axisbelow(True)

# ── Plot 4: Rolling VaR (parametric, 20-day window) with regime shading ──────
ax = fig.add_subplot(gs[3, :])
for df, ticker, color, liq_label in [
    (liq_df,   LIQUID_TICKER,   C_LIQ,   "Liquid"),
    (illiq_df, ILLIQUID_TICKER, C_ILLIQ, "Illiquid"),
]:
    ret        = df["Log_Return"].dropna()
    roll_mu    = ret.rolling(20).mean()
    roll_sig   = ret.rolling(20).std()
    roll_var99 = -(roll_mu - Z_99 * roll_sig) * 100

    ax.plot(roll_var99.index, roll_var99,
            color=color, linewidth=1.4, label=f"{ticker} Rolling VaR 99%")

    regime_series = df["Regime"].reindex(roll_var99.index).fillna("Normal")
    high_vol_mask = regime_series == "High-Vol"
    ax.fill_between(roll_var99.index, 0, roll_var99,
                    where=high_vol_mask, alpha=0.18, color=color,
                    label=f"{ticker} High-Vol Regime")

ax.set_title("Rolling 20-Day Parametric VaR (99%) — Full Period\n"
             "Shaded Areas = High-Volatility Regime (top 25% rolling vol days)",
             fontsize=9, pad=12)
ax.set_ylabel("1-Day VaR (%)", fontsize=9)
ax.tick_params(axis="x", rotation=25, labelsize=7.5, pad=6)
ax.legend(fontsize=7.5, ncol=2)
ax.grid(linestyle="--", alpha=0.35)

plt.savefig("partD_final.png", dpi=150, bbox_inches="tight")
plt.show()
print("\nSaved: partD_final.png")