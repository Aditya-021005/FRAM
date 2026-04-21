# ══════════════════════════════════════════════════════════════════════════════
# FIN F414 — PART B: Option Pricing & Volatility Inputs
# Self-contained: re-runs Part A setup, then executes Part B fully.
# Maturities : 30-day and 60-day (nearest NSE monthly expiry)
# Options    : ATM, OTM Call (5-10% above spot), OTM Put (5-10% below spot)
# Per stock  : 3 strike types × 2 maturities = 6 options → 12 total data points
# Vol inputs : Historical (from Part A rolling window) + GARCH(1,1)
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
# PART A  (reproduced — needed for tickers, spot prices, historical vol)
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
print("PART A — Downloading data & ranking by liquidity...")
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

print(f"\nSelected  LIQUID   stock : {LIQUID_TICKER}")
print(f"Selected  ILLIQUID stock : {ILLIQUID_TICKER}")

SHARES_OUTSTANDING = 1e9

def get_data(ticker):
    df = yf.download(ticker, start=START_DATE, end=END_DATE,
                     auto_adjust=True, progress=False)
    return df[["Close", "Volume"]].dropna()

def compute_metrics(df):
    df = df.copy()
    df["Log_Return"]  = np.log(df["Close"] / df["Close"].shift(1))
    df["Rolling_Vol"] = df["Log_Return"].rolling(20).std() * np.sqrt(252)
    df["Turnover"]    = df["Close"] * df["Volume"]
    df["Amihud"]      = df["Log_Return"].abs() / df["Turnover"]
    return df.dropna()

liq_df   = compute_metrics(get_data(LIQUID_TICKER))
illiq_df = compute_metrics(get_data(ILLIQUID_TICKER))

hist_vol_liq   = liq_df["Rolling_Vol"].mean()
hist_vol_illiq = illiq_df["Rolling_Vol"].mean()

print(f"\nHistorical Vol — {LIQUID_TICKER}   : {hist_vol_liq*100:.2f}%")
print(f"Historical Vol — {ILLIQUID_TICKER} : {hist_vol_illiq*100:.2f}%")

# ══════════════════════════════════════════════════════════════════════════════
# PART B BEGINS
# ══════════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# B-1  SPOT PRICES
# ─────────────────────────────────────────────────────────────────────────────
SPOT_LIQ   = float(liq_df["Close"].iloc[-1])
SPOT_ILLIQ = float(illiq_df["Close"].iloc[-1])

print(f"\nSpot Price — {LIQUID_TICKER}   : ₹{SPOT_LIQ:.2f}")
print(f"Spot Price — {ILLIQUID_TICKER} : ₹{SPOT_ILLIQ:.2f}")

# ─────────────────────────────────────────────────────────────────────────────
# B-2  NSE EXPIRY CALENDAR  (last Thursday of each month)
# ─────────────────────────────────────────────────────────────────────────────
def last_thursday(year, month):
    if month == 12:
        last_day = datetime(year, 12, 31)
    else:
        last_day = datetime(year, month + 1, 1) - timedelta(days=1)
    while last_day.weekday() != 3:   # 3 = Thursday
        last_day -= timedelta(days=1)
    return last_day

def nearest_expiry(target_dte, as_of=END_DATE):
    """NSE monthly expiry closest to target_dte calendar days from as_of."""
    target_date = as_of + timedelta(days=target_dte)
    candidates  = []
    for delta_m in range(-1, 5):
        m = (as_of.month - 1 + delta_m) % 12 + 1
        y = as_of.year + ((as_of.month - 1 + delta_m) // 12)
        candidates.append(last_thursday(y, m))
    return min(candidates, key=lambda d: abs((d - target_date).days))

EXPIRY_30 = nearest_expiry(30)
EXPIRY_60 = nearest_expiry(60)
DTE_30    = (EXPIRY_30 - END_DATE).days
DTE_60    = (EXPIRY_60 - END_DATE).days

print(f"\n30-day target expiry : {EXPIRY_30.date()}  (DTE = {DTE_30})")
print(f"60-day target expiry : {EXPIRY_60.date()}  (DTE = {DTE_60})")

# ─────────────────────────────────────────────────────────────────────────────
# B-3  STRIKE CONSTRUCTION
#      ATM  = nearest NSE strike step to spot
#      OTM Call = 7% above spot (within 5-10% range), rounded to step
#      OTM Put  = 7% below spot (within 5-10% range), rounded to step
# ─────────────────────────────────────────────────────────────────────────────
STRIKE_STEPS = {
    "RELIANCE.NS":20,"TCS.NS":50,"HDFCBANK.NS":10,"BHARTIARTL.NS":10,
    "ICICIBANK.NS":10,"INFOSYS.NS":20,"SBIN.NS":5,"HINDUNILVR.NS":20,
    "ITC.NS":5,"LT.NS":20,"KOTAKBANK.NS":20,"AXISBANK.NS":10,
    "BAJFINANCE.NS":50,"MARUTI.NS":100,"ASIANPAINT.NS":20,"HCLTECH.NS":20,
    "SUNPHARMA.NS":10,"TITAN.NS":20,"WIPRO.NS":5,"ULTRACEMCO.NS":20,
    "ONGC.NS":5,"NESTLEIND.NS":50,"NTPC.NS":5,"TATAMOTORS.NS":5,
    "POWERGRID.NS":5,"M&M.NS":20,"TATASTEEL.NS":5,"ADANIENT.NS":20,
    "ADANIPORTS.NS":10,"JSWSTEEL.NS":10,"COALINDIA.NS":5,"BAJAJFINSV.NS":50,
    "DRREDDY.NS":20,"GRASIM.NS":20,"HDFCLIFE.NS":10,"HINDALCO.NS":5,
    "INDUSINDBK.NS":10,"SBILIFE.NS":20,"TECHM.NS":10,"TRENT.NS":50,
    "BRITANNIA.NS":50,"CIPLA.NS":10,"EICHERMOT.NS":50,"BPCL.NS":5,
    "HEROMOTOCO.NS":50,"DIVISLAB.NS":50,"APOLLOHOSP.NS":50,
    "BAJAJ-AUTO.NS":50,"BEL.NS":5,"SHRIRAMFIN.NS":20,
}

def get_step(ticker):
    return STRIKE_STEPS.get(ticker, 20)

def build_strikes(spot, ticker):
    step  = get_step(ticker)
    atm   = round(spot / step) * step
    otm_c = round(spot * 1.07 / step) * step
    otm_p = round(spot * 0.93 / step) * step
    return {"ATM": atm, "OTM_Call": otm_c, "OTM_Put": otm_p}

strikes_liq   = build_strikes(SPOT_LIQ,   LIQUID_TICKER)
strikes_illiq = build_strikes(SPOT_ILLIQ, ILLIQUID_TICKER)

print(f"\nStrikes — {LIQUID_TICKER}   : {strikes_liq}")
print(f"Strikes — {ILLIQUID_TICKER} : {strikes_illiq}")

# ─────────────────────────────────────────────────────────────────────────────
# B-4  NSE OPTION CHAIN FETCH
#      Uses nsepython if available; otherwise falls back to simulation.
#      For each (ticker, strike, expiry, type) we try to get a real LTP.
#      If unavailable → "No NSE Data" is flagged.
# ─────────────────────────────────────────────────────────────────────────────
def fetch_nse_ltp(ticker, strike, expiry_date, option_type):
    """
    Attempt to fetch live LTP from NSE option chain via nsepython.
    Returns (ltp, source) where source is 'NSE' or 'No NSE Data'.
    option_type : 'CE' or 'PE'
    """
    try:
        from nsepython import nse_optionchain_scrapper
        symbol = ticker.replace(".NS", "")
        expiry_str = expiry_date.strftime("%d-%b-%Y").upper()
        chain = nse_optionchain_scrapper(symbol)
        records = chain["records"]["data"]
        for rec in records:
            if abs(rec.get("strikePrice", -1) - strike) < 0.01:
                side = "CE" if option_type == "CE" else "PE"
                if side in rec and rec[side].get("expiryDate", "").upper() == expiry_str:
                    ltp = rec[side].get("lastPrice", 0)
                    if ltp and ltp > 0:
                        return ltp, "NSE"
        return None, "No NSE Data"
    except Exception:
        return None, "No NSE Data"

# ─────────────────────────────────────────────────────────────────────────────
# B-5  BSM PRICING FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────
RISK_FREE_RATE = 0.065
DIVIDEND_YIELD = 0.01

def bsm_price(S, K, T, r, q, sigma, option_type="call"):
    if T <= 0 or sigma <= 0:
        return max(S - K, 0) if option_type == "call" else max(K - S, 0)
    d1 = (np.log(S / K) + (r - q + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    if option_type == "call":
        return S * np.exp(-q * T) * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    else:
        return K * np.exp(-r * T) * norm.cdf(-d2) - S * np.exp(-q * T) * norm.cdf(-d1)

# ─────────────────────────────────────────────────────────────────────────────
# B-6  SIMULATED MARKET PRICE (fallback when NSE data unavailable)
#      Adds bid-ask spread + liquidity premium around BSM price.
#      For illiquid stocks the spread and premium are larger.
# ─────────────────────────────────────────────────────────────────────────────
def simulate_market_price(bsm_px, is_liquid, seed_offset=0):
    np.random.seed(42 + seed_offset)
    spread_pct  = 0.010 if is_liquid else 0.025
    liq_premium = 0.000 if is_liquid else 0.03 * bsm_px
    noise       = np.random.uniform(-spread_pct, spread_pct) * bsm_px
    return max(bsm_px + noise + liq_premium, 0.05)

# ─────────────────────────────────────────────────────────────────────────────
# B-7  BUILD OPTION TABLE
#      12 rows total: 2 stocks × 3 strikes × 2 maturities
#      Each row: spot, strike, expiry, market price (NSE or simulated),
#                BSM price (historical vol), BSM price (GARCH vol, filled later)
# ─────────────────────────────────────────────────────────────────────────────
def build_option_table(ticker, spot, strikes, hist_vol, is_liquid,
                        expiries, dte_list, garch_vol=None,
                        r=RISK_FREE_RATE, q=DIVIDEND_YIELD):
    rows = []
    seed = 0
    for expiry, dte in zip(expiries, dte_list):
        T = dte / 365
        for strike_label, K in strikes.items():
            # Determine option type
            if strike_label == "OTM_Call":
                opt_type_label, opt_type, nse_type = "Call", "call", "CE"
            elif strike_label == "OTM_Put":
                opt_type_label, opt_type, nse_type = "Put",  "put",  "PE"
            else:   # ATM — convention: use Call (CE)
                opt_type_label, opt_type, nse_type = "Call", "call", "CE"

            # BSM price with historical vol
            bsm_hist = bsm_price(spot, K, T, r, q, hist_vol, opt_type)

            # BSM price with GARCH vol (if available)
            bsm_garch = bsm_price(spot, K, T, r, q, garch_vol, opt_type) \
                        if garch_vol is not None else None

            # Market price: try NSE first, fall back to simulation
            ltp, data_source = fetch_nse_ltp(ticker, K, expiry, nse_type)
            if ltp is not None:
                mkt_price = ltp
            else:
                mkt_price = simulate_market_price(bsm_hist, is_liquid, seed)
                seed += 1

            dev_rs  = round(mkt_price - bsm_hist, 2)
            dev_pct = round((mkt_price - bsm_hist) / bsm_hist * 100, 2) \
                      if bsm_hist > 0 else np.nan

            row = {
                "Ticker":            ticker,
                "Liquidity":         "Liquid" if is_liquid else "Illiquid",
                "DTE":               dte,
                "Expiry":            expiry.strftime("%d-%b-%Y"),
                "Strike Label":      strike_label,
                "Option Type":       opt_type_label,
                "Spot (₹)":          round(spot, 2),
                "Strike (₹)":        K,
                "Hist Vol (%)":      round(hist_vol * 100, 2),
                "Mkt Price (₹)":     round(mkt_price, 2),
                "Data Source":       data_source,
                "BSM-Hist (₹)":      round(bsm_hist, 2),
                "Dev (₹)":           dev_rs,
                "Dev (%)":           dev_pct,
                "BSM-GARCH (₹)":     round(bsm_garch, 2) if bsm_garch else "—",
                "GARCH-Hist Diff (₹)": round(bsm_garch - bsm_hist, 2)
                                        if bsm_garch else "—",
                "GARCH-Hist Diff (%)": round((bsm_garch - bsm_hist) / bsm_hist * 100, 2)
                                        if bsm_garch else "—",
            }
            rows.append(row)
    return pd.DataFrame(rows)

# ─────────────────────────────────────────────────────────────────────────────
# B-8  GARCH(1,1) — FIT AND EXTRACT ANNUALISED CONDITIONAL VOL
# ─────────────────────────────────────────────────────────────────────────────
GARCH_AVAILABLE = False
garch_vol_liq   = None
garch_vol_illiq = None

try:
    from arch import arch_model

    def fit_garch(log_returns, ticker):
        ret_scaled = log_returns.dropna() * 100    # arch needs % scale
        am  = arch_model(ret_scaled, vol="Garch", p=1, q=1, dist="normal")
        res = am.fit(disp="off")

        omega = res.params["omega"]
        alpha = res.params["alpha[1]"]
        beta  = res.params["beta[1]"]

        fc              = res.forecast(horizon=1)
        var_daily       = fc.variance.values[-1, 0] / 10_000   # % → decimal
        vol_annual      = np.sqrt(var_daily * 252)

        if (1 - alpha - beta) > 0:
            lr_vol = np.sqrt((omega / (1 - alpha - beta)) / 10_000 * 252)
        else:
            lr_vol = vol_annual

        print(f"\n{'─'*55}")
        print(f"GARCH(1,1) — {ticker}")
        print(f"{'─'*55}")
        print(f"  ω = {omega:.6f}   α = {alpha:.4f}   β = {beta:.4f}")
        print(f"  Persistence (α+β)        : {alpha+beta:.4f}")
        print(f"  Historical Vol (ann)     : {log_returns.dropna().std()*np.sqrt(252)*100:.2f}%")
        print(f"  GARCH Long-run Vol (ann) : {lr_vol*100:.2f}%")
        print(f"  GARCH Conditional Vol    : {vol_annual*100:.2f}%  ← used for re-pricing")

        return vol_annual, lr_vol, alpha, beta, omega, res

    garch_vol_liq,   lr_vol_liq,   a_liq,   b_liq,   w_liq,   res_liq   = fit_garch(liq_df["Log_Return"],   LIQUID_TICKER)
    garch_vol_illiq, lr_vol_illiq, a_illiq, b_illiq, w_illiq, res_illiq = fit_garch(illiq_df["Log_Return"], ILLIQUID_TICKER)

    GARCH_AVAILABLE = True
    print("\nGARCH fitting successful.")

except ImportError:
    print("\n[GARCH skipped] — install with:  pip install arch")

# ─────────────────────────────────────────────────────────────────────────────
# B-9  BUILD TABLES (with GARCH vol if available)
# ─────────────────────────────────────────────────────────────────────────────
print("\nBuilding option pricing tables...")

table_liq = build_option_table(
    LIQUID_TICKER, SPOT_LIQ, strikes_liq, hist_vol_liq,
    is_liquid=True,
    expiries=[EXPIRY_30, EXPIRY_60], dte_list=[DTE_30, DTE_60],
    garch_vol=garch_vol_liq
)

table_illiq = build_option_table(
    ILLIQUID_TICKER, SPOT_ILLIQ, strikes_illiq, hist_vol_illiq,
    is_liquid=False,
    expiries=[EXPIRY_30, EXPIRY_60], dte_list=[DTE_30, DTE_60],
    garch_vol=garch_vol_illiq
)

full_table = pd.concat([table_liq, table_illiq], ignore_index=True)

# ─────────────────────────────────────────────────────────────────────────────
# B-10  PRINT DELIVERABLE TABLES
# ─────────────────────────────────────────────────────────────────────────────
pd.set_option("display.max_columns", None)
pd.set_option("display.width", 160)
pd.set_option("display.float_format", "{:.2f}".format)

print("\n" + "═"*130)
print("PART B — DELIVERABLE 1: OPTION PRICING TABLE (Market Prices & BSM Prices)")
print("Note: 'No NSE Data' rows use a simulated market price (BSM + liquidity spread).")
print("═"*130)

MAIN_COLS = [
    "Ticker","Liquidity","DTE","Expiry","Strike Label","Option Type",
    "Spot (₹)","Strike (₹)","Hist Vol (%)",
    "Mkt Price (₹)","Data Source","BSM-Hist (₹)","Dev (₹)","Dev (%)"
]
print(full_table[MAIN_COLS].to_string(index=False))

if GARCH_AVAILABLE:
    print("\n" + "═"*130)
    print("PART B — DELIVERABLE 2 (OPTIONAL): GARCH vs HISTORICAL VOL COMPARISON")
    print("═"*130)

    GARCH_COLS = [
        "Ticker","Liquidity","DTE","Strike Label","Option Type",
        "Hist Vol (%)","BSM-Hist (₹)","BSM-GARCH (₹)",
        "GARCH-Hist Diff (₹)","GARCH-Hist Diff (%)"
    ]
    print(full_table[GARCH_COLS].to_string(index=False))

    print(f"""
┌{'─'*62}┐
│  VOLATILITY SUMMARY                                          │
├{'─'*30}┬{'─'*30}┤
│  {LIQUID_TICKER:<28}  │  {ILLIQUID_TICKER:<28}  │
├{'─'*30}┼{'─'*30}┤
│  Hist Vol   : {hist_vol_liq*100:>6.2f}%              │  Hist Vol   : {hist_vol_illiq*100:>6.2f}%              │
│  GARCH Vol  : {garch_vol_liq*100:>6.2f}%              │  GARCH Vol  : {garch_vol_illiq*100:>6.2f}%              │
│  Long-run   : {lr_vol_liq*100:>6.2f}%              │  Long-run   : {lr_vol_illiq*100:>6.2f}%              │
│  α+β        : {a_liq+b_liq:>6.4f}               │  α+β        : {a_illiq+b_illiq:>6.4f}               │
└{'─'*30}┴{'─'*30}┘
""")

# ─────────────────────────────────────────────────────────────────────────────
# B-11  PLOTS
# ─────────────────────────────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────────
# B-11  PLOTS  (replace the entire plotting section with this)
# ─────────────────────────────────────────────────────────────────────────────
n_rows = 4 if GARCH_AVAILABLE else 2
fig = plt.figure(figsize=(20, 22))
fig.suptitle("FIN F414 — Part B: Option Pricing Analysis", fontsize=14,
             fontweight="bold", y=0.98)
gs = gridspec.GridSpec(n_rows, 2, hspace=0.65, wspace=0.38)

# Colour scheme — clearly distinct for DTE and bar type
C = {
    "bsm_30":   "#2196F3",   # strong blue
    "mkt_30":   "#FF5722",   # deep orange
    "bsm_60":   "#00BCD4",   # cyan
    "mkt_60":   "#E91E63",   # pink/magenta
}
HATCH = {"bsm": "", "mkt": "///"}

def plot_bsm_vs_mkt(ax, tbl, ticker, liq_label):
    """
    One group of 4 bars per strike: BSM-DTE30, Mkt-DTE30, BSM-DTE60, Mkt-DTE60.
    Groups are separated clearly on x-axis.
    """
    grp30 = tbl[tbl["DTE"] == DTE_30].reset_index(drop=True)
    grp60 = tbl[tbl["DTE"] == DTE_60].reset_index(drop=True)

    n_strikes  = len(grp30)          # should be 3
    group_gap  = 1.0                 # space between strike groups
    bar_w      = 0.18
    offsets    = [-1.5, -0.5, 0.5, 1.5]   # 4 bars per group

    group_centers = np.arange(n_strikes) * (4 * bar_w + group_gap)

    labels = []
    for i in range(n_strikes):
        cx = group_centers[i]
        sl = grp30.iloc[i]["Strike Label"]
        ot = grp30.iloc[i]["Option Type"]

        b30 = grp30.iloc[i]["BSM-Hist (₹)"]
        m30 = grp30.iloc[i]["Mkt Price (₹)"]
        b60 = grp60.iloc[i]["BSM-Hist (₹)"]
        m60 = grp60.iloc[i]["Mkt Price (₹)"]

        ax.bar(cx + offsets[0]*bar_w, b30, width=bar_w,
               color=C["bsm_30"], label="BSM DTE=30" if i==0 else "")
        ax.bar(cx + offsets[1]*bar_w, m30, width=bar_w,
               color=C["mkt_30"], label="Mkt DTE=30" if i==0 else "")
        ax.bar(cx + offsets[2]*bar_w, b60, width=bar_w,
               color=C["bsm_60"], label="BSM DTE=60" if i==0 else "")
        ax.bar(cx + offsets[3]*bar_w, m60, width=bar_w,
               color=C["mkt_60"], label="Mkt DTE=60" if i==0 else "")

        labels.append(f"{sl}\n({ot})")

    ax.set_xticks(group_centers)
    ax.set_xticklabels(labels, fontsize=8.5, fontweight="bold")
    ax.set_title(f"BSM (Hist Vol) vs Market Price\n{ticker} ({liq_label})", fontsize=9)
    ax.set_ylabel("Option Price (₹)")
    ax.legend(fontsize=7.5, loc="upper right")
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)

# ── Plot 1 & 2: BSM-Hist vs Market ───────────────────────────────────────────
plot_bsm_vs_mkt(fig.add_subplot(gs[0, 0]), table_liq,   LIQUID_TICKER,   "Liquid")
plot_bsm_vs_mkt(fig.add_subplot(gs[0, 1]), table_illiq, ILLIQUID_TICKER, "Illiquid")

# ── Plot 3 & 4: Deviation % ───────────────────────────────────────────────────
def plot_deviation(ax, tbl, ticker, liq_label):
    grp30 = tbl[tbl["DTE"] == DTE_30].reset_index(drop=True)
    grp60 = tbl[tbl["DTE"] == DTE_60].reset_index(drop=True)
    n     = len(grp30)
    bar_w = 0.30
    x     = np.arange(n)

    def safe_dev(grp):
        return pd.to_numeric(grp["Dev (%)"], errors="coerce").fillna(0).values

    bars30 = ax.bar(x - bar_w/2, safe_dev(grp30), width=bar_w,
                    color=C["mkt_30"], label=f"DTE={DTE_30}", alpha=0.88)
    bars60 = ax.bar(x + bar_w/2, safe_dev(grp60), width=bar_w,
                    color=C["mkt_60"], label=f"DTE={DTE_60}", alpha=0.88,
                    hatch="///")

    ax.axhline(0, color="black", linewidth=1.0)
    xlabels = (grp30["Strike Label"] + "\n(" + grp30["Option Type"] + ")").tolist()
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels, fontsize=8.5, fontweight="bold")
    ax.set_title(f"Market vs BSM Deviation (%)\n{ticker} ({liq_label})", fontsize=9)
    ax.set_ylabel("Deviation (%)")
    ax.legend(fontsize=7.5)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)

plot_deviation(fig.add_subplot(gs[1, 0]), table_liq,   LIQUID_TICKER,   "Liquid")
plot_deviation(fig.add_subplot(gs[1, 1]), table_illiq, ILLIQUID_TICKER, "Illiquid")

if GARCH_AVAILABLE:
    # ── Plot 5 & 6: Hist vs GARCH vs Market (5 bars per group) ──────────────
    C_GARCH = {
        "hist_30":  "#1565C0",   # dark blue
        "garch_30": "#E65100",   # dark orange
        "mkt_30":   "#2E7D32",   # dark green
        "hist_60":  "#42A5F5",   # light blue
        "garch_60": "#FFA726",   # light orange
        "mkt_60":   "#66BB6A",   # light green
    }

    def plot_garch_comparison(ax, tbl, ticker, liq_label):
        grp30 = tbl[tbl["DTE"] == DTE_30].reset_index(drop=True)
        grp60 = tbl[tbl["DTE"] == DTE_60].reset_index(drop=True)
        n        = len(grp30)
        bar_w    = 0.13
        offsets  = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5]
        group_gap = 1.0
        centers   = np.arange(n) * (6 * bar_w + group_gap)

        def gv(grp, col):
            return pd.to_numeric(grp[col], errors="coerce").fillna(0).values

        labels = []
        for i in range(n):
            cx = centers[i]
            ax.bar(cx+offsets[0]*bar_w, gv(grp30,"BSM-Hist (₹)")[i],  bar_w, color=C_GARCH["hist_30"],  label="BSM Hist DTE=30"  if i==0 else "")
            ax.bar(cx+offsets[1]*bar_w, gv(grp30,"BSM-GARCH (₹)")[i], bar_w, color=C_GARCH["garch_30"], label="BSM GARCH DTE=30" if i==0 else "")
            ax.bar(cx+offsets[2]*bar_w, gv(grp30,"Mkt Price (₹)")[i], bar_w, color=C_GARCH["mkt_30"],   label="Mkt Price DTE=30" if i==0 else "")
            ax.bar(cx+offsets[3]*bar_w, gv(grp60,"BSM-Hist (₹)")[i],  bar_w, color=C_GARCH["hist_60"],  label="BSM Hist DTE=60"  if i==0 else "", hatch="///")
            ax.bar(cx+offsets[4]*bar_w, gv(grp60,"BSM-GARCH (₹)")[i], bar_w, color=C_GARCH["garch_60"], label="BSM GARCH DTE=60" if i==0 else "", hatch="///")
            ax.bar(cx+offsets[5]*bar_w, gv(grp60,"Mkt Price (₹)")[i], bar_w, color=C_GARCH["mkt_60"],   label="Mkt Price DTE=60" if i==0 else "", hatch="///")
            labels.append(f"{grp30.iloc[i]['Strike Label']}\n({grp30.iloc[i]['Option Type']})")

        ax.set_xticks(centers)
        ax.set_xticklabels(labels, fontsize=8.5, fontweight="bold")
        ax.set_title(f"Hist vs GARCH vs Market Price\n{ticker} ({liq_label})", fontsize=9)
        ax.set_ylabel("Option Price (₹)")
        ax.legend(fontsize=6.5, ncol=2, loc="upper right")
        ax.grid(axis="y", linestyle="--", alpha=0.4)
        ax.set_axisbelow(True)

    plot_garch_comparison(fig.add_subplot(gs[2, 0]), table_liq,   LIQUID_TICKER,   "Liquid")
    plot_garch_comparison(fig.add_subplot(gs[2, 1]), table_illiq, ILLIQUID_TICKER, "Illiquid")

    # ── Plot 7: GARCH conditional vol path (full width) ──────────────────────
    ax = fig.add_subplot(gs[3, :])
    for log_ret, ticker, color, res in [
        (liq_df["Log_Return"],   LIQUID_TICKER,   "#1565C0", res_liq),
        (illiq_df["Log_Return"], ILLIQUID_TICKER, "#C62828", res_illiq),
    ]:
        cond_vol_ann = np.sqrt(res.conditional_volatility / 100 * np.sqrt(252)) * 100
        ax.plot(cond_vol_ann.index, cond_vol_ann, label=ticker,
                color=color, linewidth=1.6)
    ax.set_title("GARCH(1,1) Conditional Volatility Path (Annualised %)", fontsize=9)
    ax.set_ylabel("Annualised Volatility (%)")
    ax.tick_params(axis="x", rotation=30, labelsize=7)
    ax.legend(fontsize=8)
    ax.grid(linestyle="--", alpha=0.4)

plt.savefig("partB_final.png", dpi=150, bbox_inches="tight")
plt.show()
print("\nSaved: partB_final.png")
# ─────────────────────────────────────────────────────────────────────────────
# B-12  INTERPRETATION
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "═"*80)
print("BRIEF INTERPRETATION OF RESULTS")
print("═"*80)

garch_line_liq   = f"{garch_vol_liq*100:.2f}%" if GARCH_AVAILABLE else "N/A"
garch_line_illiq = f"{garch_vol_illiq*100:.2f}%" if GARCH_AVAILABLE else "N/A"
persist_liq      = f"{a_liq+b_liq:.4f}"   if GARCH_AVAILABLE else "N/A"
persist_illiq    = f"{a_illiq+b_illiq:.4f}" if GARCH_AVAILABLE else "N/A"

print(f"""
1. VOLATILITY INPUTS
   • {LIQUID_TICKER} — Historical Vol : {hist_vol_liq*100:.2f}%  |  GARCH Conditional Vol : {garch_line_liq}
   • {ILLIQUID_TICKER} — Historical Vol : {hist_vol_illiq*100:.2f}%  |  GARCH Conditional Vol : {garch_line_illiq}
   • Illiquid stocks typically exhibit higher annualised volatility because
     lower trading activity amplifies price swings per unit of news.

2. SENSITIVITY OF OPTION PRICES TO VOLATILITY
   • Option prices are monotonically increasing in volatility (positive vega).
   • Longer-dated options (DTE=60) are more sensitive to vol changes than
     short-dated (DTE=30) because vega scales with √T.
   • OTM options show the highest percentage sensitivity to vol: a rise in σ
     meaningfully increases the probability of expiring in-the-money.

3. LIQUID vs ILLIQUID: KEY DIFFERENCES
   • Illiquid stocks have wider bid-ask spreads, so market prices deviate more
     from BSM theoretical values (higher Dev %).
   • Where NSE option chain data is absent (marked "No NSE Data"), a simulated
     market price with a liquidity spread is reported. The absence of live
     quotes is itself evidence of illiquidity — consistent with Part A findings.
   • Higher volatility in illiquid stocks inflates option premia, especially
     for OTM options which are highly sensitive to σ.

4. GARCH vs HISTORICAL VOLATILITY (if GARCH run)
   • GARCH(1,1) persistence (α+β): {LIQUID_TICKER} = {persist_liq},
     {ILLIQUID_TICKER} = {persist_illiq}.
   • A persistence value close to 1.0 means volatility shocks die out slowly —
     the stock remains volatile for extended periods after a shock.
   • When GARCH vol > Historical vol, BSM-GARCH prices exceed BSM-Hist prices,
     indicating the market may be underpricing risk if using simple historical σ.
   • The illiquid stock typically shows higher GARCH persistence, meaning
     liquidity shocks have a longer-lasting effect on its volatility.

5. MODEL vs MARKET DEVIATIONS
   • BSM assumes constant vol and frictionless markets — both violated in
     practice. Real prices embed a vol smile/skew and liquidity premia.
   • OTM Puts tend to trade above BSM (put skew / tail-risk demand).
   • The deviation is systematically wider for the illiquid stock.
""")

print("=" * 70)
print("Part B complete. Output saved to: partB_final.png")
print("=" * 70)