# ══════════════════════════════════════════════════════════════════════════════
# FIN F414 — PART C: Greeks, Portfolio Construction & Hedging
# ──────────────────────────────────────────────────────────────────────────────
# KEY DESIGN: ONE portfolio per stock, with legs drawn from BOTH maturities.
#
#   LIQUID stock  → Calendar Bull Call Spread
#       Leg 1 : Long  2 × ATM  Call  (30-day)   ← near-term directional
#       Leg 2 : Short 1 × OTM  Call  (60-day)   ← longer cap, premium offset
#
#   ILLIQUID stock → Diagonal Protective Put
#       Leg 1 : Long  1 × ATM  Call  (30-day)   ← near-term upside
#       Leg 2 : Long  2 × OTM  Put   (60-day)   ← longer downside cover
#
# This gives one combined net delta, one hedge, one PnL table — per stock.
#
# Deliverables:
#   1. Greeks table  — all 12 options (2 stocks × 3 strikes × 2 maturities)
#   2. Portfolio composition  — legs, positions, lot sizes, net Greeks
#   3. Delta hedging  — shares before / after hedge, hedge cost
#   4. [Optional] Liquidity-adjusted hedge for illiquid stock
#   5. PnL simulation  — 8 scenarios per stock (±1%/±2% × ±20% vol)
#   6. Styled PnL table figure + bar-chart figure
#   7. Interpretation of hedging effectiveness
# ══════════════════════════════════════════════════════════════════════════════

import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from matplotlib.patches import Patch
from scipy.stats import norm
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore")

# ══════════════════════════════════════════════════════════════════════════════
# PART A / B SETUP  (self-contained re-run)
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
print("Downloading data & rebuilding Part A/B context …")
print("=" * 70)

raw    = yf.download(NIFTY50_TICKERS, start=START_DATE, end=END_DATE,
                     auto_adjust=True, progress=False)
close  = raw["Close"]
volume = raw["Volume"]

avg_turnover    = (close * volume).mean().dropna()
avg_turnover_cr = avg_turnover / 1e7

df_rank = pd.DataFrame({
    "Ticker"              : avg_turnover_cr.index,
    "Avg Turnover (₹ Cr)" : avg_turnover_cr.values,
}).sort_values("Avg Turnover (₹ Cr)", ascending=False).reset_index(drop=True)
df_rank["Rank"] = range(1, len(df_rank) + 1)

n        = len(df_rank)
top25    = int(np.ceil(n * 0.25))
bottom25 = int(np.floor(n * 0.75))
df_rank["Category"] = "Mid"
df_rank.loc[df_rank["Rank"] <= top25,    "Category"] = "LIQUID"
df_rank.loc[df_rank["Rank"] >= bottom25, "Category"] = "ILLIQUID"

LIQUID_TICKER   = df_rank[df_rank["Category"] == "LIQUID"].iloc[0]["Ticker"]
ILLIQUID_TICKER = df_rank[df_rank["Category"] == "ILLIQUID"].iloc[-1]["Ticker"]

print(f"LIQUID   stock : {LIQUID_TICKER}")
print(f"ILLIQUID stock : {ILLIQUID_TICKER}")

# ── Per-stock price / vol data ────────────────────────────────────────────────

def get_data(ticker):
    df = yf.download(ticker, start=START_DATE, end=END_DATE,
                     auto_adjust=True, progress=False)
    return df[["Close","Volume"]].dropna()

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

SPOT_LIQ   = float(liq_df["Close"].iloc[-1])
SPOT_ILLIQ = float(illiq_df["Close"].iloc[-1])

RISK_FREE_RATE = 0.065
DIVIDEND_YIELD = 0.01

# ── NSE expiry helpers ────────────────────────────────────────────────────────

def last_thursday(year, month):
    if month == 12:
        last_day = datetime(year, 12, 31)
    else:
        last_day = datetime(year, month + 1, 1) - timedelta(days=1)
    while last_day.weekday() != 3:
        last_day -= timedelta(days=1)
    return last_day

def nearest_expiry(target_dte, as_of=END_DATE):
    target_date = as_of + timedelta(days=target_dte)
    candidates  = [last_thursday(
                       as_of.year + ((as_of.month - 1 + dm) // 12),
                       (as_of.month - 1 + dm) % 12 + 1)
                   for dm in range(-1, 5)]
    return min(candidates, key=lambda d: abs((d - target_date).days))

EXPIRY_30 = nearest_expiry(30)
EXPIRY_60 = nearest_expiry(60)
DTE_30    = (EXPIRY_30 - END_DATE).days
DTE_60    = (EXPIRY_60 - END_DATE).days

print(f"30-day expiry  : {EXPIRY_30.strftime('%d-%b-%Y')}  (DTE = {DTE_30})")
print(f"60-day expiry  : {EXPIRY_60.strftime('%d-%b-%Y')}  (DTE = {DTE_60})")

# ── Strike step map ───────────────────────────────────────────────────────────

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

def build_strikes(spot, ticker):
    step  = STRIKE_STEPS.get(ticker, 20)
    atm   = round(spot / step) * step
    otm_c = round(spot * 1.07 / step) * step
    otm_p = round(spot * 0.93 / step) * step
    return {"ATM": atm, "OTM_Call": otm_c, "OTM_Put": otm_p}

strikes_liq   = build_strikes(SPOT_LIQ,   LIQUID_TICKER)
strikes_illiq = build_strikes(SPOT_ILLIQ, ILLIQUID_TICKER)

# ══════════════════════════════════════════════════════════════════════════════
# BSM CORE
# ══════════════════════════════════════════════════════════════════════════════

def bsm_d1_d2(S, K, T, r, q, sigma):
    d1 = (np.log(S/K) + (r - q + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    return d1, d1 - sigma*np.sqrt(T)

def bsm_price(S, K, T, r, q, sigma, opt="call"):
    if T <= 0 or sigma <= 0:
        return max(S-K,0) if opt=="call" else max(K-S,0)
    d1, d2 = bsm_d1_d2(S, K, T, r, q, sigma)
    if opt == "call":
        return S*np.exp(-q*T)*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
    return K*np.exp(-r*T)*norm.cdf(-d2) - S*np.exp(-q*T)*norm.cdf(-d1)

def compute_greeks(S, K, T, r, q, sigma, opt="call"):
    if T <= 0 or sigma <= 0:
        delta = (1.0 if S>K else 0.0) if opt=="call" else (-1.0 if S<K else 0.0)
        return delta, 0.0, 0.0
    d1, _ = bsm_d1_d2(S, K, T, r, q, sigma)
    delta = np.exp(-q*T) * (norm.cdf(d1) if opt=="call" else norm.cdf(d1)-1)
    gamma = np.exp(-q*T) * norm.pdf(d1) / (S * sigma * np.sqrt(T))
    vega  = S * np.exp(-q*T) * norm.pdf(d1) * np.sqrt(T) * 0.01   # per 1% vol
    return delta, gamma, vega

def sim_mkt_price(bsm_px, is_liquid, seed_offset=0):
    np.random.seed(42 + seed_offset)
    spread = 0.010 if is_liquid else 0.025
    liq_pr = 0.0   if is_liquid else 0.03 * bsm_px
    return max(bsm_px + np.random.uniform(-spread, spread)*bsm_px + liq_pr, 0.05)

# ══════════════════════════════════════════════════════════════════════════════
# C-1  GREEKS TABLE  — all 12 options (both stocks, both maturities)
# ══════════════════════════════════════════════════════════════════════════════

def build_greeks_table(ticker, spot, strikes, hist_vol, is_liquid,
                       expiries, dte_list, r=RISK_FREE_RATE, q=DIVIDEND_YIELD):
    rows, seed = [], 0
    for expiry, dte in zip(expiries, dte_list):
        T = dte / 365
        for slabel, K in strikes.items():
            if slabel == "OTM_Call":
                olabel, opt = "Call", "call"
            elif slabel == "OTM_Put":
                olabel, opt = "Put",  "put"
            else:
                olabel, opt = "Call", "call"          # ATM shown as call

            bsm_px = bsm_price(spot, K, T, r, q, hist_vol, opt)
            mkt_px = sim_mkt_price(bsm_px, is_liquid, seed);  seed += 1
            delta, gamma, vega = compute_greeks(spot, K, T, r, q, hist_vol, opt)

            rows.append({
                "Ticker"       : ticker,
                "Liquidity"    : "Liquid" if is_liquid else "Illiquid",
                "DTE"          : dte,
                "Expiry"       : expiry.strftime("%d-%b-%Y"),
                "Strike Label" : slabel,
                "Option Type"  : olabel,
                "Spot (₹)"     : round(spot, 2),
                "Strike (₹)"   : K,
                "Vol (%)"      : round(hist_vol * 100, 2),
                "BSM Price (₹)": round(bsm_px, 2),
                "Mkt Price (₹)": round(mkt_px, 2),
                "Delta"        : round(delta, 4),
                "Gamma"        : round(gamma, 6),
                "Vega (₹/1%σ)" : round(vega, 4),
                "_opt"         : opt,
                "_T"           : T,
                "_K"           : K,
                "_bsm_px"      : bsm_px,
                "_mkt_px"      : mkt_px,
            })
    return pd.DataFrame(rows)

greeks_liq   = build_greeks_table(LIQUID_TICKER,   SPOT_LIQ,   strikes_liq,
                                   hist_vol_liq,   True,
                                   [EXPIRY_30, EXPIRY_60], [DTE_30, DTE_60])
greeks_illiq = build_greeks_table(ILLIQUID_TICKER, SPOT_ILLIQ, strikes_illiq,
                                   hist_vol_illiq, False,
                                   [EXPIRY_30, EXPIRY_60], [DTE_30, DTE_60])
greeks_all   = pd.concat([greeks_liq, greeks_illiq], ignore_index=True)

pd.set_option("display.max_columns", None)
pd.set_option("display.width", 160)
pd.set_option("display.float_format", "{:.4f}".format)

GCOLS = ["Ticker","Liquidity","DTE","Strike Label","Option Type",
         "Spot (₹)","Strike (₹)","Vol (%)","BSM Price (₹)",
         "Delta","Gamma","Vega (₹/1%σ)"]

print("\n" + "═"*115)
print("PART C — DELIVERABLE 1: GREEKS TABLE  (all 12 options — 2 stocks × 3 strikes × 2 maturities)")
print("═"*115)
print(greeks_all[GCOLS].to_string(index=False))

# ══════════════════════════════════════════════════════════════════════════════
# C-2  PORTFOLIO CONSTRUCTION
# ──────────────────────────────────────────────────────────────────────────────
# ONE portfolio per stock.  Each portfolio mixes legs from BOTH maturities.
#
# LIQUID — Calendar Bull Call Spread
#   Leg 1 : Long  2 × ATM  Call (DTE=30)   near-term delta + gamma exposure
#   Leg 2 : Short 1 × OTM  Call (DTE=60)   longer dated cap; reduces net debit
#
#   Rationale:
#   • Long the near-term ATM call captures a bullish move quickly (high gamma).
#   • Shorting the longer-dated OTM call funds the position (time value is
#     higher for 60-day) while capping upside above the OTM strike.
#   • Net debit is lower than a plain 2×ATM long, making it capital-efficient.
#   • Net delta is positive (bullish); net vega is mixed — long vega on the
#     30-day leg, short vega on the 60-day leg.
#
# ILLIQUID — Diagonal Protective Put
#   Leg 1 : Long  1 × ATM  Call (DTE=30)   near-term upside participation
#   Leg 2 : Long  2 × OTM  Put  (DTE=60)   extended downside insurance
#
#   Rationale:
#   • Illiquid stocks can gap down suddenly; 60-day puts give more cover time
#     without needing to roll.
#   • The 30-day ATM call captures any near-term upside catalyst.
#   • Net delta is near neutral; net vega is strongly positive (long vol) —
#     suited to a high-vol illiquid name.
#   • Higher premium cost is justified by the fat-tail protection.
# ══════════════════════════════════════════════════════════════════════════════

LOT_SIZE_LIQ   = 250
LOT_SIZE_ILLIQ = 500

def get_opt(df, dte, strike_label):
    row = df[(df["DTE"] == dte) & (df["Strike Label"] == strike_label)]
    return row.iloc[0].to_dict() if not row.empty else None

# ── LIQUID: Calendar Bull Call Spread ────────────────────────────────────────
PORTFOLIO_LIQ = [
    {"label": "Long ATM Call  (30d)",  "option": get_opt(greeks_liq, DTE_30, "ATM"),
     "position": +2, "lot": LOT_SIZE_LIQ},
    {"label": "Short OTM Call (60d)",  "option": get_opt(greeks_liq, DTE_60, "OTM_Call"),
     "position": -1, "lot": LOT_SIZE_LIQ},
]

# ── ILLIQUID: Diagonal Protective Put ────────────────────────────────────────
PORTFOLIO_ILLIQ = [
    {"label": "Long ATM Call  (30d)",  "option": get_opt(greeks_illiq, DTE_30, "ATM"),
     "position": +1, "lot": LOT_SIZE_ILLIQ},
    {"label": "Long OTM Put   (60d)",  "option": get_opt(greeks_illiq, DTE_60, "OTM_Put"),
     "position": +2, "lot": LOT_SIZE_ILLIQ},
]

def portfolio_greeks(portfolio):
    nd = ng = nv = np_ = 0.0
    for leg in portfolio:
        p, l, o = leg["position"], leg["lot"], leg["option"]
        nd  += p * l * o["Delta"]
        ng  += p * l * o["Gamma"]
        nv  += p * l * o["Vega (₹/1%σ)"]
        np_ += p * l * o["_mkt_px"]
    return nd, ng, nv, np_

delta_liq,   gamma_liq,   vega_liq,   premium_liq   = portfolio_greeks(PORTFOLIO_LIQ)
delta_illiq, gamma_illiq, vega_illiq, premium_illiq = portfolio_greeks(PORTFOLIO_ILLIQ)

print("\n" + "═"*90)
print("PART C — DELIVERABLE 2a: PORTFOLIO COMPOSITION")
print("  Each stock has ONE portfolio mixing both maturities")
print("═"*90)

def print_portfolio(name, portfolio, nd, ng, nv, np_, lot_size):
    print(f"\n{'─'*78}")
    print(f"  {name}")
    print(f"{'─'*78}")
    print(f"  {'Leg':<26} {'Pos':>5} {'Lot':>6} {'DTE':>5} "
          f"{'BSM Px':>9} {'Mkt Px':>9} {'Δ/contr':>9} {'Γ/contr':>11} {'V/contr':>9}")
    print(f"  {'─'*26}  {'─'*4}  {'─'*5}  {'─'*4}  "
          f"{'─'*8}  {'─'*8}  {'─'*8}  {'─'*10}  {'─'*8}")
    for leg in portfolio:
        o   = leg["option"]
        pos = leg["position"]
        lot = leg["lot"]
        dte_label = str(int(o["DTE"])) + "d"
        print(f"  {leg['label']:<26} {pos:>+5} {lot:>6} {dte_label:>5} "
              f"  {o['BSM Price (₹)']:>7.2f}   {o['_mkt_px']:>7.2f} "
              f"  {pos*o['Delta']:>+7.4f}  {pos*o['Gamma']:>+9.6f}  "
              f"{pos*o['Vega (₹/1%σ)']:>+7.4f}")
    print(f"{'─'*78}")
    print(f"  NET PORTFOLIO GREEKS  (lot size = {lot_size}):")
    print(f"    Net Delta   = {nd:+.4f}   — ₹ change in portfolio per ₹1 spot move")
    print(f"    Net Gamma   = {ng:+.6f}  — delta change per ₹1 spot move")
    print(f"    Net Vega    = {nv:+.4f}   — P&L change per 1% vol change")
    print(f"    Net Premium = ₹{np_:+.2f}   ({'debit — paid' if np_ > 0 else 'credit — received'})")

print_portfolio(
    f"LIQUID ({LIQUID_TICKER}) — Calendar Bull Call Spread",
    PORTFOLIO_LIQ, delta_liq, gamma_liq, vega_liq, premium_liq, LOT_SIZE_LIQ
)
print_portfolio(
    f"ILLIQUID ({ILLIQUID_TICKER}) — Diagonal Protective Put",
    PORTFOLIO_ILLIQ, delta_illiq, gamma_illiq, vega_illiq, premium_illiq, LOT_SIZE_ILLIQ
)

print(f"""
  ┌────────────────────────────────────────────────────────────────────────┐
  │  COMBINED NET GREEKS COMPARISON                                        │
  ├───────────────────────┬────────────────────────┬───────────────────────┤
  │  Metric               │  Liquid ({LIQUID_TICKER[:8]:>8})  │  Illiquid ({ILLIQUID_TICKER[:7]:>7}) │
  ├───────────────────────┼────────────────────────┼───────────────────────┤
  │  Strategy             │  Cal Bull Call Spread  │  Diag Protective Put  │
  │  Legs                 │  30d ATM + 60d OTM-C   │  30d ATM + 60d OTM-P  │
  │  Net Delta            │  {delta_liq:>+20.4f}  │  {delta_illiq:>+20.4f} │
  │  Net Gamma            │  {gamma_liq:>+20.6f}  │  {gamma_illiq:>+20.6f} │
  │  Net Vega  (₹/1%σ)   │  {vega_liq:>+20.4f}  │  {vega_illiq:>+20.4f} │
  │  Net Premium          │  ₹{premium_liq:>+18.2f}  │  ₹{premium_illiq:>+18.2f} │
  └───────────────────────┴────────────────────────┴───────────────────────┘
""")

# ══════════════════════════════════════════════════════════════════════════════
# C-3  DELTA HEDGING
# ──────────────────────────────────────────────────────────────────────────────
# One combined net delta per stock → one hedge in the underlying stock.
#
#   Hedge = −net_portfolio_delta  shares of the underlying
#   After hedge: total delta = net_delta + hedge_shares × 1  ≈  0
#
# Why does the hedge work? Buying/shorting shares adds delta of exactly +1/−1
# per share.  So we offset the option portfolio's net delta with the opposite
# sign in shares.  Gamma and Vega are UNCHANGED by the stock hedge (a share
# position has zero gamma and zero vega).
# ══════════════════════════════════════════════════════════════════════════════

hedge_liq   = -delta_liq
hedge_illiq = -delta_illiq

print("\n" + "═"*90)
print("PART C — DELIVERABLE 2b: DELTA HEDGING")
print("═"*90)

for ticker, spot, nd, hedge, ng, nv, label in [
    (LIQUID_TICKER,   SPOT_LIQ,   delta_liq,   hedge_liq,   gamma_liq,   vega_liq,   "Liquid"),
    (ILLIQUID_TICKER, SPOT_ILLIQ, delta_illiq, hedge_illiq, gamma_illiq, vega_illiq, "Illiquid"),
]:
    direction = "SHORT" if hedge < 0 else "LONG"
    hcost     = hedge * spot
    print(f"""
  {ticker}  ({label})
  {'─'*62}
  Strategy                            : {"Calendar Bull Call Spread" if label=="Liquid" else "Diagonal Protective Put"}
  Portfolio Net Delta  (BEFORE hedge) : {nd:+.4f}
  Hedge Action                        : {direction} {abs(hedge):.4f} shares of {ticker}
  Hedge Cost  (notional)              : ₹{hcost:,.2f}  ({'cash outflow' if hcost > 0 else 'cash inflow'})
  Portfolio Net Delta  (AFTER  hedge) : {nd + hedge:.8f}  ≈ 0  ✓
  Net Gamma  (unchanged by hedge)     : {ng:+.6f}
  Net Vega   (unchanged by hedge)     : {nv:+.4f}  ₹ per 1% vol
""")

print(f"""
  ┌──────────────────────────────────────────────────────────────────────┐
  │  WHY ONE COMBINED HEDGE?                                             │
  │  Each portfolio mixes 30-day and 60-day legs.  We sum their deltas   │
  │  into ONE net delta, then hedge with the underlying stock once.      │
  │  This is more capital-efficient than hedging each leg separately     │
  │  and avoids double-counting the hedge cost.                          │
  │                                                                      │
  │  Liquid  hedge : {abs(hedge_liq):>7.4f} shares  (small because 60d short OTM   │
  │                   call delta partially offsets 30d long ATM delta)   │
  │  Illiquid hedge: {abs(hedge_illiq):>7.4f} shares  (near-zero because 60d puts   │
  │                   delta offsets 30d call delta — nearly delta-neutral)│
  └──────────────────────────────────────────────────────────────────────┘
""")

# ══════════════════════════════════════════════════════════════════════════════
# C-4  [OPTIONAL] LIQUIDITY-ADJUSTED HEDGE SIZE  (illiquid stock only)
# ══════════════════════════════════════════════════════════════════════════════

amihud_liq   = liq_df["Amihud"].mean()
amihud_illiq = illiq_df["Amihud"].mean()
liq_adj      = min(1.0, amihud_liq / amihud_illiq)

adj_hedge_illiq  = hedge_illiq * liq_adj
residual_delta   = delta_illiq + adj_hedge_illiq

print("\n" + "═"*90)
print("PART C — OPTIONAL: LIQUIDITY-ADJUSTED HEDGE  (Illiquid stock only)")
print("═"*90)
print(f"""
  Amihud Ratio — {LIQUID_TICKER:<20}: {amihud_liq:.6e}  (lower → more liquid)
  Amihud Ratio — {ILLIQUID_TICKER:<20}: {amihud_illiq:.6e}  (higher → less liquid)
  Liquidity Adjustment Factor         : {liq_adj:.4f}
    → Only {liq_adj*100:.1f}% of the theoretical hedge can be executed
      without significant market impact.

  ┌──────────────────────────────────┬──────────────┐
  │  Parameter                       │  Value       │
  ├──────────────────────────────────┼──────────────┤
  │  Full theoretical hedge (shares) │ {hedge_illiq:>+11.4f} │
  │  Adjusted hedge  (executed)      │ {adj_hedge_illiq:>+11.4f} │
  │  Residual delta  (unhedged)      │ {residual_delta:>+11.4f} │
  └──────────────────────────────────┴──────────────┘

  The unhedged residual delta ({residual_delta:+.4f}) means the illiquid portfolio
  retains partial directional exposure — a direct cost of illiquidity.
  The 30-day call leg has higher gamma, so this residual drifts faster.
""")

# ══════════════════════════════════════════════════════════════════════════════
# C-5  PnL SIMULATION
# ──────────────────────────────────────────────────────────────────────────────
# 8 scenarios per stock  (4 price shocks × 2 vol shocks = all combinations).
#
#   Taylor expansion:
#     ΔV ≈  Delta×ΔS  +  ½×Gamma×(ΔS)²  +  Vega×Δσ
#
#   ΔS  = spot × price_shock_pct        (absolute ₹ move)
#   Δσ  = hist_vol × vol_shock_pct × 100  (change in vol in percentage points)
#
#   Hedge P&L  = hedge_shares × ΔS      (stock position moves opposite)
#   Total P&L  = Options P&L + Hedge P&L
# ══════════════════════════════════════════════════════════════════════════════

PRICE_SHOCKS = [-0.02, -0.01, +0.01, +0.02]
VOL_SHOCKS   = [-0.20, +0.20]

def simulate_pnl(spot, hist_vol, nd, ng, nv, hedge, ticker, label):
    rows = []
    for dp in PRICE_SHOCKS:
        for dv in VOL_SHOCKS:
            dS        = spot * dp
            d_sigma   = hist_vol * dv * 100
            pnl_delta = nd * dS
            pnl_gamma = 0.5 * ng * dS**2
            pnl_vega  = nv * d_sigma
            pnl_opts  = pnl_delta + pnl_gamma + pnl_vega
            pnl_hedge = hedge * dS
            pnl_total = pnl_opts + pnl_hedge
            rows.append({
                "Ticker"         : ticker,
                "Liquidity"      : label,
                "Price Shock"    : f"{dp:+.0%}",
                "Vol Shock"      : f"{dv:+.0%}",
                "ΔS (₹)"         : round(dS,       2),
                "Δσ (% pts)"     : round(d_sigma,  2),
                "PnL Δ (₹)"      : round(pnl_delta,2),
                "PnL Γ (₹)"      : round(pnl_gamma,2),
                "PnL V (₹)"      : round(pnl_vega, 2),
                "Options PnL (₹)": round(pnl_opts, 2),
                "Hedge PnL (₹)"  : round(pnl_hedge,2),
                "Total PnL (₹)"  : round(pnl_total,2),
            })
    return pd.DataFrame(rows)

pnl_liq   = simulate_pnl(SPOT_LIQ,   hist_vol_liq,
                          delta_liq,   gamma_liq,   vega_liq,   hedge_liq,
                          LIQUID_TICKER,   "Liquid")
pnl_illiq = simulate_pnl(SPOT_ILLIQ, hist_vol_illiq,
                          delta_illiq, gamma_illiq, vega_illiq, hedge_illiq,
                          ILLIQUID_TICKER, "Illiquid")

pnl_all = pd.concat([pnl_liq, pnl_illiq], ignore_index=True)

pd.set_option("display.float_format", "{:.2f}".format)
print("\n" + "═"*130)
print("PART C — DELIVERABLE 3: PnL SIMULATION  (8 scenarios × 2 stocks = 16 rows)")
print("  ΔV ≈ Delta×ΔS + ½Gamma×(ΔS)² + Vega×Δσ   |   Total = Options PnL + Hedge PnL")
print("═"*130)
print(pnl_all.to_string(index=False))

# ══════════════════════════════════════════════════════════════════════════════
# C-6  PLOTS
# ══════════════════════════════════════════════════════════════════════════════

PALETTE = {
    "liq"   : "#1565C0",
    "illiq" : "#B71C1C",
    "gamma" : "#E65100",
    "vega"  : "#2E7D32",
    "pos"   : "#43A047",
    "neg"   : "#E53935",
    "dte30" : "#1565C0",
    "dte60" : "#F57F17",
}

# ── Figure 1: Greeks + PnL bar charts  (3 rows × 2 cols) ─────────────────────

fig1 = plt.figure(figsize=(22, 22))
fig1.suptitle(
    "FIN F414 — Part C: Greeks, Hedging & PnL  "
    f"(Liquid={LIQUID_TICKER.replace('.NS','')}  |  "
    f"Illiquid={ILLIQUID_TICKER.replace('.NS','')})",
    fontsize=13, fontweight="bold", y=0.99
)
gs1 = gridspec.GridSpec(3, 2, hspace=0.68, wspace=0.38, figure=fig1)

# Row 0: Greeks bar charts (one per stock, both maturities overlaid)
def plot_greeks_combined(ax, df, ticker, is_liquid):
    """
    For each of the 3 strike types, show DTE=30 and DTE=60 side by side.
    Delta and Vega on left axis; Gamma on right axis.
    """
    strikes_order = ["ATM", "OTM_Call", "OTM_Put"]
    n = len(strikes_order)
    x = np.arange(n)
    bw = 0.18
    clr = PALETTE["liq"] if is_liquid else PALETTE["illiq"]

    ax2 = ax.twinx()
    for i, dte in enumerate([DTE_30, DTE_60]):
        sub = df[df["DTE"] == dte].set_index("Strike Label")
        deltas = [sub.loc[s, "Delta"]        if s in sub.index else 0 for s in strikes_order]
        vegas  = [sub.loc[s, "Vega (₹/1%σ)"] if s in sub.index else 0 for s in strikes_order]
        gammas = [sub.loc[s, "Gamma"]         if s in sub.index else 0 for s in strikes_order]
        offset = (i - 0.5) * bw * 2.5
        alpha  = 0.90 if dte == DTE_30 else 0.60
        lbl    = f"DTE={dte}"
        ax.bar(x + offset - bw,   deltas, bw, color=clr,               alpha=alpha, label=f"Delta {lbl}")
        ax.bar(x + offset,         vegas,  bw, color=PALETTE["vega"],   alpha=alpha, label=f"Vega {lbl}")
        ax2.bar(x + offset + bw,  gammas, bw, color=PALETTE["gamma"],  alpha=alpha, label=f"Gamma {lbl}")

    ax.set_xticks(x)
    ax.set_xticklabels(["ATM\n(Call)","OTM\n(Call)","OTM\n(Put)"], fontsize=8, fontweight="bold")
    liq_str = "Liquid" if is_liquid else "Illiquid"
    ax.set_title(f"Greeks — {ticker}  ({liq_str})\nDTE={DTE_30} solid  |  DTE={DTE_60} faded",
                 fontsize=9)
    ax.set_ylabel("Delta / Vega")
    ax2.set_ylabel("Gamma", color=PALETTE["gamma"])
    ax2.tick_params(axis="y", labelcolor=PALETTE["gamma"])
    l1, lb1 = ax.get_legend_handles_labels()
    l2, lb2 = ax2.get_legend_handles_labels()
    ax.legend(l1+l2, lb1+lb2, fontsize=6.5, loc="upper right", ncol=2)
    ax.grid(axis="y", linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)

plot_greeks_combined(fig1.add_subplot(gs1[0, 0]), greeks_liq,   LIQUID_TICKER,   True)
plot_greeks_combined(fig1.add_subplot(gs1[0, 1]), greeks_illiq, ILLIQUID_TICKER, False)

# Row 1: Total P&L bar chart per stock
def plot_pnl_bars(ax, pnl_df, ticker, label):
    lbls   = pnl_df["Price Shock"] + "\n" + pnl_df["Vol Shock"]
    totals = pnl_df["Total PnL (₹)"].values
    colors = [PALETTE["pos"] if v >= 0 else PALETTE["neg"] for v in totals]
    x      = np.arange(len(totals))
    ax.bar(x, totals, color=colors, alpha=0.85, width=0.6, edgecolor="white")
    ax.axhline(0, color="black", linewidth=0.9)
    mxa = max(abs(totals)) if len(totals) else 1
    for i, v in enumerate(totals):
        ax.text(i, v + np.sign(v)*mxa*0.04, f"₹{v:.0f}",
                ha="center", va="bottom" if v >= 0 else "top", fontsize=7)
    ax.set_xticks(x); ax.set_xticklabels(lbls, fontsize=7.5)
    ax.set_title(f"Total P&L (Options + Hedge)\n{ticker}  ({label})", fontsize=9)
    ax.set_ylabel("P&L (₹)")
    ax.grid(axis="y", linestyle="--", alpha=0.4); ax.set_axisbelow(True)

plot_pnl_bars(fig1.add_subplot(gs1[1, 0]), pnl_liq,   LIQUID_TICKER,   "Liquid")
plot_pnl_bars(fig1.add_subplot(gs1[1, 1]), pnl_illiq, ILLIQUID_TICKER, "Illiquid")

# Row 2: P&L decomposition (Delta / Gamma / Vega / Hedge) grouped bars
def plot_pnl_decomp(ax, pnl_df, ticker, label):
    x    = np.arange(len(pnl_df))
    lbls = pnl_df["Price Shock"] + "\n" + pnl_df["Vol Shock"]
    bw   = 0.20
    ax.bar(x - 1.5*bw, pnl_df["PnL Δ (₹)"],       bw, label="Δ PnL",    color="#1565C0", alpha=0.85)
    ax.bar(x - 0.5*bw, pnl_df["PnL Γ (₹)"],       bw, label="Γ PnL",    color="#E65100", alpha=0.85)
    ax.bar(x + 0.5*bw, pnl_df["PnL V (₹)"],       bw, label="Vega PnL", color="#2E7D32", alpha=0.85)
    ax.bar(x + 1.5*bw, pnl_df["Hedge PnL (₹)"],   bw, label="Hedge PnL",color="#9C27B0", alpha=0.85)
    ax.axhline(0, color="black", linewidth=0.9)
    ax.set_xticks(x); ax.set_xticklabels(lbls, fontsize=7.5)
    ax.set_title(f"P&L Decomposition by Greek Component\n{ticker}  ({label})", fontsize=9)
    ax.set_ylabel("P&L (₹)")
    ax.legend(fontsize=7.5, ncol=2)
    ax.grid(axis="y", linestyle="--", alpha=0.4); ax.set_axisbelow(True)

plot_pnl_decomp(fig1.add_subplot(gs1[2, 0]), pnl_liq,   LIQUID_TICKER,   "Liquid")
plot_pnl_decomp(fig1.add_subplot(gs1[2, 1]), pnl_illiq, ILLIQUID_TICKER, "Illiquid")

fig1.savefig("partC_charts.png", dpi=150, bbox_inches="tight")
plt.show()
print("\nSaved: partC_charts.png")

# ══════════════════════════════════════════════════════════════════════════════
# C-6b  STYLED PnL TABLE FIGURE
# ══════════════════════════════════════════════════════════════════════════════

def make_pnl_table_figure(pnl_all, liquid_ticker, illiquid_ticker):
    short_liq   = liquid_ticker.replace(".NS","")
    short_illiq = illiquid_ticker.replace(".NS","")

    # Sort: Liquid rows first, then Illiquid; within each by price shock then vol shock
    ps_order  = {"-2%":0,"-1%":1,"+1%":2,"+2%":3}
    vs_order  = {"-20%":0,"+20%":1}
    liq_order = {"Liquid":0,"Illiquid":1}
    pnl_sorted = pnl_all.copy()
    pnl_sorted["_s"] = (pnl_sorted["Liquidity"].map(liq_order)*100
                       + pnl_sorted["Price Shock"].map(ps_order)*10
                       + pnl_sorted["Vol Shock"].map(vs_order))
    pnl_sorted = pnl_sorted.sort_values("_s").reset_index(drop=True)

    col_hdrs = [
        "Stock","Price\nShock","Vol\nShock",
        "ΔS (₹)","Δσ\n(% pts)",
        "PnL Δ\n(₹)","PnL Γ\n(₹)","PnL V\n(₹)",
        "Options\nPnL (₹)","Hedge\nPnL (₹)","Total\nPnL (₹)"
    ]
    col_w = [0.09,0.07,0.07, 0.08,0.07, 0.08,0.07,0.08, 0.10,0.09,0.10]

    rows_data = []
    for _, r in pnl_sorted.iterrows():
        stk = short_liq if r["Liquidity"]=="Liquid" else short_illiq
        rows_data.append([
            stk,
            r["Price Shock"], r["Vol Shock"],
            f"{r['ΔS (₹)']:+.1f}",   f"{r['Δσ (% pts)']:+.1f}",
            f"{r['PnL Δ (₹)']:+.1f}",f"{r['PnL Γ (₹)']:+.2f}",f"{r['PnL V (₹)']:+.1f}",
            f"{r['Options PnL (₹)']:+.1f}",
            f"{r['Hedge PnL (₹)']:+.1f}",
            f"{r['Total PnL (₹)']:+.1f}",
        ])

    n_rows = len(rows_data)
    n_cols = len(col_hdrs)

    # Insert separator rows between liquid and illiquid blocks
    SEP_AFTER = 8   # first 8 rows = liquid
    all_cells, all_tags = [], []
    for i, row in enumerate(rows_data):
        if i == 0:
            all_cells.append([f"LIQUID  ({short_liq})  —  Calendar Bull Call Spread  "
                               f"[Legs: Long 2× ATM Call {DTE_30}d  +  Short 1× OTM Call {DTE_60}d]"]
                              + [""]*( n_cols-1))
            all_tags.append("sep:0")
        if i == SEP_AFTER:
            all_cells.append([f"ILLIQUID  ({short_illiq})  —  Diagonal Protective Put  "
                               f"[Legs: Long 1× ATM Call {DTE_30}d  +  Long 2× OTM Put {DTE_60}d]"]
                              + [""]*( n_cols-1))
            all_tags.append("sep:1")
        all_cells.append(row)
        all_tags.append(f"data:{'0' if i < SEP_AFTER else '1'}")

    total_rows   = len(all_cells)
    row_h_in     = 0.30
    sep_h_in     = 0.40
    hdr_h_in     = 0.55
    title_h_in   = 0.65
    fig_h        = title_h_in + hdr_h_in + sum(sep_h_in if t.startswith("sep") else row_h_in
                                                for t in all_tags) + 0.5
    fig_w        = 20

    fig2, ax2 = plt.subplots(figsize=(fig_w, fig_h))
    ax2.axis("off")
    fig2.patch.set_facecolor("#F8F9FA")

    # Colour constants
    HDR_BG  = "#1A237E"; HDR_FG  = "white"
    SEP_BG  = ["#E8EAF6","#FFF3E0"]; SEP_FG  = ["#1A237E","#BF360C"]
    BLK_BG  = ["#EFF3FF","#FFF8E1"]
    GRKCOL  = "#F3E5F5"; GRKTXT  = "#4A148C"
    POS_BG  = "#C8E6C9"; POS_FG  = "#1B5E20"
    NEG_BG  = "#FFCDD2"; NEG_FG  = "#B71C1C"

    GREEK_COLS = {5, 6, 7}
    TOTAL_COL  = 10

    # Build height fractions
    total_units = (1.5 +
                   sum(1.4 if t.startswith("sep") else 1.0 for t in all_tags))
    hdr_frac    = 1.5 / total_units
    row_fracs   = [(1.4 if t.startswith("sep") else 1.0) / total_units for t in all_tags]

    tbl = ax2.table(
        cellText=all_cells, colLabels=col_hdrs, colWidths=col_w,
        loc="center", cellLoc="center"
    )
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8.0)
    tbl.scale(1, 1.0)

    for (ri, ci), cell in tbl.get_celld().items():
        cell.set_linewidth(0.3)
        if ri == 0:
            cell.set_facecolor(HDR_BG)
            cell.set_text_props(color=HDR_FG, fontweight="bold", fontsize=8)
            cell.set_height(hdr_frac)
            cell.set_edgecolor("#3949AB")
            continue

        di  = ri - 1
        tag = all_tags[di]
        cell.set_height(row_fracs[di])

        if tag.startswith("sep"):
            bi = int(tag.split(":")[1])
            cell.set_facecolor(SEP_BG[bi])
            cell.set_edgecolor("#9FA8DA")
            if ci == 0:
                cell.set_text_props(color=SEP_FG[bi], fontweight="bold",
                                    fontsize=8.0, ha="left")
            else:
                cell.set_text_props(color=SEP_FG[bi])
            continue

        bi      = int(tag.split(":")[1])
        base_bg = BLK_BG[bi]

        if ci == TOTAL_COL:
            try:
                val = float(all_cells[di][ci].replace("+",""))
                cell.set_facecolor(POS_BG if val >= 0 else NEG_BG)
                cell.set_text_props(color=POS_FG if val >= 0 else NEG_FG,
                                    fontweight="bold", fontsize=8.5)
            except ValueError:
                cell.set_facecolor(base_bg)
        elif ci in GREEK_COLS:
            cell.set_facecolor(GRKCOL)
            cell.set_text_props(color=GRKTXT, fontsize=8)
        else:
            cell.set_facecolor(base_bg)
            cell.set_text_props(color="#212121", fontsize=8)

        cell.set_edgecolor("#CFD8DC")

    # Titles
    fig2.text(0.5, 0.988,
              "FIN F414 — Part C: PnL Simulation Table  (16 Scenarios — 2 Stocks × 8 Scenarios each)",
              ha="center", va="top", fontsize=13, fontweight="bold", color="#1A237E")
    fig2.text(0.5, 0.968,
              "ΔV ≈ Delta×ΔS + ½Gamma×(ΔS)² + Vega×Δσ   |   "
              "Total PnL = Options PnL + Hedge PnL   |   "
              "Price shocks: ±1%, ±2%   |   Vol shocks: ±20%",
              ha="center", va="top", fontsize=8.2, color="#37474F")

    legend_patches = [
        Patch(facecolor=POS_BG,  edgecolor=POS_FG,  label="Positive Total P&L"),
        Patch(facecolor=NEG_BG,  edgecolor=NEG_FG,  label="Negative Total P&L"),
        Patch(facecolor=GRKCOL,  edgecolor=GRKTXT,  label="Greek components (Δ / Γ / V)"),
        Patch(facecolor=SEP_BG[0],edgecolor="#3949AB",label=f"Liquid block ({short_liq})"),
        Patch(facecolor=SEP_BG[1],edgecolor="#BF360C",label=f"Illiquid block ({short_illiq})"),
    ]
    fig2.legend(handles=legend_patches, loc="lower center", ncol=5,
                fontsize=8, framealpha=0.9, edgecolor="#90A4AE",
                bbox_to_anchor=(0.5, 0.003))

    fig2.tight_layout(rect=[0, 0.04, 1, 0.965])
    fig2.savefig("partC_pnl_table.png", dpi=160, bbox_inches="tight",
                 facecolor=fig2.get_facecolor())
    plt.show()
    print("Saved: partC_pnl_table.png")

make_pnl_table_figure(pnl_all, LIQUID_TICKER, ILLIQUID_TICKER)

# ══════════════════════════════════════════════════════════════════════════════
# C-7  INTERPRETATION
# ══════════════════════════════════════════════════════════════════════════════

print("\n" + "═"*80)
print("PART C — DELIVERABLE 4: INTERPRETATION OF HEDGING EFFECTIVENESS")
print("═"*80)
print(f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GREEKS ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DELTA:
  • ATM options have delta ≈ ±0.50 across both maturities.
  • OTM Call delta < 0.5 (lower probability of expiring ITM).
  • OTM Put delta > −0.5 (similar reasoning).
  • Combining legs from different maturities produces a net delta that
    reflects the NET directional bias of the whole strategy.

  GAMMA:
  • 30-day legs have higher gamma than 60-day legs — shorter-dated options
    have faster delta drift per ₹1 of spot move.
  • The combined portfolio gamma is dominated by the 30-day leg's contribution.
  • Higher gamma → hedge needs more frequent rebalancing after price moves.

  VEGA:
  • 60-day legs have higher vega than 30-day legs — more time = more vol risk.
  • Calendar / diagonal strategies produce a NET VEGA that depends on whether
    long or short legs dominate.
  • Liquid portfolio: short 60-day OTM call partially offsets long 30-day vega.
  • Illiquid portfolio: long 60-day puts add significant positive vega —
    the portfolio profits from volatility expansion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. PORTFOLIO RATIONALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LIQUID ({LIQUID_TICKER}) — Calendar Bull Call Spread:
  • Mixes a near-term long call (30d) with a longer-dated short call (60d).
  • Net delta = {delta_liq:+.4f}: moderate bullish bias.
  • Net gamma = {gamma_liq:+.6f}: positive — large near-term moves benefit via convexity.
  • Net vega  = {vega_liq:+.4f}: the 60-day short call reduces vol sensitivity,
    making this primarily a directional + gamma trade.
  • Net premium = ₹{premium_liq:+.2f}: the 60-day short call funds the 30-day longs.
  • Max loss: limited to net premium paid; max gain: capped above OTM strike.

  ILLIQUID ({ILLIQUID_TICKER}) — Diagonal Protective Put:
  • Mixes a near-term long call (30d) with longer-dated puts (60d) for insurance.
  • Net delta = {delta_illiq:+.4f}: near-neutral (puts offset call delta).
  • Net vega  = {vega_illiq:+.4f}: strongly positive — illiquid stocks prone to sudden
    vol spikes; long vol position is appropriate.
  • 60-day puts chosen deliberately: illiquid stocks can gap without warning;
    longer-dated puts give sustained downside cover without needing to roll.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. DELTA HEDGING EFFECTIVENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  LIQUID STOCK:
  • One combined hedge of {abs(hedge_liq):.4f} shares reduces net delta to ≈ 0.
  • After hedging, small price moves produce near-zero P&L from delta.
  • Residual P&L is driven by Gamma (convexity) and Vega (vol shock).
  • Gamma P&L is always positive for this long-gamma portfolio — large moves
    in either direction are slightly beneficial.
  • Vega P&L depends on vol direction: +20% vol shock = gain; −20% = loss.

  ILLIQUID STOCK:
  • Full theoretical hedge = {abs(hedge_illiq):.4f} shares.
  • After liquidity adjustment ({liq_adj:.2f}×), executed hedge = {abs(adj_hedge_illiq):.4f} shares.
  • Residual delta = {residual_delta:+.4f} — unhedged directional exposure remains.
  • Hedging is LESS effective for the illiquid stock because:
    (a) Market impact prevents executing the full theoretical hedge.
    (b) Wider bid-ask spreads raise the effective hedge cost.
    (c) Higher gamma (from 30-day call leg) means delta drifts faster,
        requiring more frequent rebalancing of an already costly hedge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. PnL SCENARIO KEY OBSERVATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRICE SHOCKS (±1%, ±2%):
  • After delta hedging, Delta P&L ≈ 0 for both portfolios.
  • Gamma P&L is positive and increases with the size of the price move.
  • A ±2% move generates ~4× the Gamma P&L of a ±1% move (quadratic).

  VOLATILITY SHOCKS (±20%):
  • Liquid portfolio: vega is partly offset by short 60-day call, so vol
    shocks have a moderate effect on Total P&L.
  • Illiquid portfolio: strongly long vega — a +20% vol spike is the BEST
    scenario; a −20% vol crush is the WORST scenario.

  WORST CASE: small price move + vol crush (−20%)
  • Delta P&L ≈ 0; Gamma P&L small; Vega P&L large negative.
  • This is the key residual risk after delta hedging.

  BEST CASE: large price move (either direction) + vol spike (+20%)
  • Both Gamma and Vega P&L positive simultaneously — "long vol" payoff.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. LIQUID vs ILLIQUID SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Dimension              Liquid ({LIQUID_TICKER[:8]:>8})     Illiquid ({ILLIQUID_TICKER[:8]:>8})
  ──────────────────── ────────────────────── ──────────────────────
  Strategy             Cal Bull Call Spread   Diag Protective Put
  Net Delta            {delta_liq:>+20.4f}   {delta_illiq:>+20.4f}
  Net Gamma            {gamma_liq:>+20.6f}   {gamma_illiq:>+20.6f}
  Net Vega (₹/1%σ)    {vega_liq:>+20.4f}   {vega_illiq:>+20.4f}
  Hedge Shares         {hedge_liq:>+20.4f}   {hedge_illiq:>+20.4f}
  Liq. Adj. Factor     {'1.0000':>20}   {liq_adj:>20.4f}
  Residual Delta       {'0.0000':>20}   {residual_delta:>+20.4f}
  Hedge Effectiveness  Full / Precise         Partial ({liq_adj*100:.0f}% executed)

  KEY TAKEAWAY:
  Liquid stocks allow precise delta hedging at low cost. Illiquid stocks
  suffer market impact, leaving residual delta exposure AND higher gamma
  drift. The multi-maturity design (mixing 30d + 60d legs) is richer than
  single-maturity portfolios — it creates a more realistic Greek profile
  and exposes the interplay between near-term price risk (30d gamma) and
  longer-term vol risk (60d vega) within a single hedgeable portfolio.
""")

print("=" * 70)
print("Part C complete.  Outputs: partC_charts.png  |  partC_pnl_table.png")
print("=" * 70)