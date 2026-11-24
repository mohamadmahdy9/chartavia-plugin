---
name: via
description: Write, explain, review or fix Via scripts (.via files) — Chartavia's language for chart indicators and trading experts (strategies with backtests), with English or Arabic keywords. Use whenever the user mentions Chartavia, شارتاڤيا, Via/ڤيا, a .via file, or asks for an indicator, expert, strategy or backtest to run on Chartavia.
---

# Writing Via scripts for Chartavia

Via (ڤيا) is Chartavia's own scripting language. It is **not** Pine Script, MQL or
EasyLanguage: do not use their syntax or function names (`//@version`, `study()`,
`plot()`, `ta.sma`, `strategy.entry`, `OnTick`, `var`, `:=` on a `let`…). Write only what
this skill and its reference files describe. When unsure whether something exists,
check `reference/functions.md`; if it is not there, build it from the primitives.

## Workflow

1. **Understand the ask.** Indicator (calculates, draws, alerts) or expert (places
   orders and gets a backtest report)? Overlay on price or its own pane? Which inputs
   should the user be able to tune? Reply in the user's language; if they write Arabic,
   explain in Arabic. Use English keywords unless the user wants an Arabic script.
2. **Write the script** following the rules below. Start from the closest file in
   `examples/` when one fits.
3. **Check it with the real compiler** before showing it:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/skills/via/scripts/check.cjs" my-script.via --run
   ```
   (`-` reads from stdin; add `--ar` for Arabic messages, `--json` for structured
   output, `--bars data.csv` for the user's own `time,open,high,low,close,volume` data.)
   Fix every problem it reports and run it again until it prints `ran OK`. Check
   that each `draw` has values ("starts at bar N") and, for experts, that trades happen.
   If Node is not available, re-read the rules below line by line instead.
4. **Deliver**: the full script in a ```via code block, one or two sentences on what it
   does, the inputs the user can tune, and how to use it: open
   https://chartavia.com/chart/script, paste, press Run (Ctrl+Enter). For experts,
   mention the sample backtest numbers only as a smoke test, never as a promise of
   profit.

## The language in one screen

```via
indicator "Title" overlay          # first line. overlay = draw on the price pane
# or:  expert "Title"              # experts are always on the price pane

info version "1.0.0"               # optional package info (version, author, description, license, homepage, id)

input length = 20 "Length" 1..500  # user setting: number or yes/no, optional label and range
option fee = 0.1                   # experts only: capital, fee (%), size (% of equity), shorts (yes/no)

let m = avg(close, length)         # series, recomputed every bar
let (up, mid, dn) = bands(close, 20, 2)   # functions returning several values must be unpacked
keep count = 0                     # persists across bars; evaluated once
count := count + 1                 # := only works on keep variables (and repeat counters)
fn mid2(a, b) = (a + b) / 2        # pure one-expression function, defined before use

draw m name "Avg" color blue width 2 as line    # top level only. as line|columns|dots|area|steps
level 70 name "High" color gray dashed          # horizontal line, top level only
if crossup(close, m) then                        # block if
  mark below "▲" color blue                      # text above/below the bar
  paint fade(blue, 0.3)                          # tint this bar
  alert "Crossed above at {close}"               # {name} inserts a value
elif close < m then
  mark above "▼"
else
  count := 0
end
if close > m then mark below "•"                 # one-line if (no end)
repeat i from 1 to 10                            # inclusive, max 5,000 per bar
  count := count + prev(close, i)
end

# experts only:
buy            # go long (closes a short first); optional size in % of equity: buy 50
sell           # go short (closes a long first); with option shorts = no it only closes longs
exit           # close any position
stop close * 0.98     # stop for the open position (or the one just ordered)
target close * 1.05   # take-profit
# read-only: position (1/-1/0), entry_price, bars_in_trade, equity, profit
```

## Rules that trip people up

- The header line is mandatory and comes first. Only one per script.
- One statement per line. Comments use `#`. There are no semicolons or braces.
- `draw` and `level` must be at the top level, never inside `if`/`repeat`. To draw on
  some bars only: `draw cond ? value : none`. The `color` after `draw` may be an
  expression: `color close > open ? blue : gray`.
- Every value is per bar. Read history with `prev(x, k)`, never `x[k]` (no indexing).
- Missing values are `none` (e.g. the first `n-1` bars of `avg`). Math with `none` gives
  `none`; comparisons with `none` give `no`. Use `either(x, fallback)` to fill.
- `let` names cannot be reassigned; use `keep` for state. Names cannot shadow built-ins
  (`close`, `high`, `avg`, `blue`…) or keywords. Reserved words that look like names:
  `name`, `color`, `width`, `as`, `dashed`, `stop`, `target`, `from`, `to`, `level`,
  `mark`, `info`, `option`, `input`. Pick other variable names (e.g. `dev`, `stop_pct`).
- Functions returning several values (`macd`, `bands`, `stoch`, `adx`) must be unpacked
  with `let (a, b, c) = ...` with exactly the right count.
- Window lengths must be whole numbers ≥ 1 (inputs are fine).
- Booleans are `yes`/`no` (also `true`/`false`). Logic is `and`, `or`, `not`. Power is `^`.
- Trading statements, `option`, and the position series are for `expert` scripts only.
- Orders fill at the **next bar's open**. Stops/targets are checked inside each bar; if
  both are hit in one bar, the stop wins. No pyramiding: `buy` while long does nothing.
- Put stateful functions (`ema`, `rsi`, `atr`, `macd`…) in top-level `let`s and use the
  names inside `if` blocks, so they see every bar.
- Colors: `blue white ink gray sky gold sand rose mint violet` (they adapt to light/dark
  mode), hex `#rrggbb`/`#rrggbbaa`, and `fade(color, 0..1)`. Chartavia's identity is
  calm: prefer `blue` for the main line and bullish marks, `white`/`gray` for secondary
  lines, `rose` sparingly for bearish signals. Avoid loud green/red pairs.
- Limits: 16 draws, 8 levels, 500 marks; 5,000 loop iterations per bar; 5M operations.

## Arabic scripts

Every keyword has an Arabic spelling and names may be Arabic. Common ones:
`مؤشر` indicator · `خبير` expert · `على_السعر` overlay · `مدخل` input · `اجعل` let ·
`احفظ` keep · `إذا … إذن … نهاية` if/then/end · `وإلا` else · `ارسم` draw · `باسم` name ·
`بلون` color · `بسمك` width · `علامة فوق/تحت` mark above/below · `نبّه` alert ·
`اشتر` buy · `بع` sell · `اخرج` exit · `وقف` stop · `هدف` target · `و/أو/ليس` and/or/not ·
`نعم/لا/لاشيء` yes/no/none. Series: `افتتاح أعلى أدنى إغلاق حجم`. Functions: `متوسط`,
`متوسط_أسي`, `سابق`, `تقاطع_صاعد`, `تقاطع_هابط`, `قوة_نسبية`, `مدى_حقيقي`…
Colors: `أزرق أبيض رمادي ذهبي وردي سماوي أخضر بنفسجي`. Full table in
`reference/functions.md`; a complete example is `examples/arabic.via`.

## Reference files

- `reference/language.md` — the full language specification. Read it for anything not
  covered above (operator precedence, alert placeholders, backtest options, errors).
- `reference/functions.md` — every built-in series and function with its signature,
  meaning (EN + AR) and an example, plus every keyword spelling.
- `examples/*.via` — working scripts: `two-averages`, `rsi-zones`, `bands-squeeze`,
  `macd-columns`, `trailing-trend` (keep-based state machine), `arabic`,
  `expert-average-cross`, `expert-rsi-reversion` (stop + target, longs only),
  `expert-breakout` (channel breakout with ATR stop).

## Reviewing or fixing a script

Run the checker first and fix what it reports. Then look for logic problems the
compiler cannot see: look-ahead (using `high`/`close` of the current bar for a level
the bar must break: use `prev(highest(high, n))`), signals that fire every bar instead
of once (use `crossup`/`crossdown` or `cond and not prev(cond)`), stops placed on the
wrong side for shorts, and inputs whose ranges allow invalid lengths.
