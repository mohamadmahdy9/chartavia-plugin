# Via language reference (v0.2)

**Via** (ڤيا) is Chartavia's own language for writing **indicators** and **experts**
(automated strategies). A script runs once per bar, from the oldest bar to the newest.
Every value is a *series*: when you write `close`, you get the close of the bar being
processed; `prev(close)` is the close one bar earlier.

Files use the extension `.via`. Keywords exist in English and Arabic; both spellings are
always accepted and can be mixed.

```via
indicator "Two averages" overlay

input fast = 9  "Fast period"  1..200
input slow = 21 "Slow period"  1..400

let a = ema(close, fast)
let b = ema(close, slow)

draw a name "Fast" color blue
draw b name "Slow" color white width 2

if crossup(a, b) then
  mark below "▲" color blue
  alert "Fast crossed above slow"
end
```

---

## 1. Program layout

A script has one header line, then statements, one per line.

```
indicator "<title>" [overlay]      # an indicator; overlay = drawn on the price pane
expert    "<title>"                # a strategy that places orders (always overlay)
```

Comments start with `#` and run to the end of the line. Blank lines are ignored.
A statement that is too long can continue on the next line after a trailing `,`, `(`,
or an operator.

### Package info (optional)

Scripts that will be shared or sold describe themselves with `info` lines, right after the header:

```via
info version "1.2.0"
info author "nour"
info description "Trend filter with two averages"
info license "commercial"      # or "free", "MIT", ...
info homepage "https://chartavia.com/u/nour"
info id "nour.trend-filter"     # stable id used by the marketplace
```

A script that ports someone else's study or code credits them with two more lines. The Store shows them
on the product page as "Original idea", with the link and the license:

```via
info credit "J. Welles Wilder Jr."                       # who created the study or the original code
info source "https://en.wikipedia.org/wiki/Parabolic_SAR" # a public page about it (https only)
```

These lines do not change how the script runs. The marketplace and the script library read them.

## 2. Values

| Kind      | Examples                          | Notes                                             |
|-----------|-----------------------------------|---------------------------------------------------|
| number    | `14`, `0.5`, `2e3`, `1_000`       | 64-bit floats                                     |
| bool      | `yes`, `no` (`true`/`false` too)  |                                                   |
| text      | `"Fast"`                          | only for names, labels, alerts                    |
| color     | `blue`, `#1f4fd1`, `#1f4fd180`    | see §8                                            |
| empty     | `none`                            | "no value on this bar"; most math on `none` gives `none` |

`none` is what you get for warm-up bars (e.g. `avg(close, 20)` on the first 19 bars).
Use `either(x, fallback)` to replace it.

## 3. Names

- `let name = expr` defines a series, recomputed every bar.
- `keep name = expr` defines a value that **persists across bars**. `expr` is evaluated
  only on the first bar. Change it later with `name := expr`.
- `input name = <number|bool|#colour> ["label"] [min..max] [group "Section"] [options "A|B|C"]` declares a
  setting the user can edit in the indicator dialog. Inputs are constants.
  `group` (Arabic `قسم`) puts the input in a section of the settings dialog; inputs with the same
  group name are shown together. `options` (Arabic `اختيارات`) turns a number input into a list:
  the value is the chosen item's position, from 0 (`min..max` is filled in for you).
  Example: `input source = 0 "Color source" options "Structure|EMA 8/21|Momentum" group "Candles"`.
  A colour default (`#rrggbb` or `#rrggbbaa`) makes a colour input: the settings show a colour picker and the
  input can be used anywhere a colour goes. Example: `input upColor = #f3efe7 "Rising colour" group "Colors"`.
  `time` (Arabic `وقت`) makes a date-and-time input: the settings show a date picker in the chart's time zone, and
  the value is a time in ms like the `time` series, `0` while no date is picked. An optional date in quotes,
  `"YYYY-MM-DD"` or `"YYYY-MM-DD HH:MM"` (UTC), is the default. Example:
  `input start = time "2026-11-20 14:00" "Start"` then `if start > 0 and time >= start then ...`.
  To pick a candle by its number instead, use a number input and compare it with `bar`
  (`input from = 300 "From bar"` then `if bar >= from then ...`). The chart can show each candle's number in the
  legend (chart settings → "Bar number in the legend"), and drawing coordinates use the same number.
- `fn name(a, b) = expr` defines a function. Functions are pure: they cannot draw,
  trade or change `keep` values.

Names are letters (any script, so Arabic works), digits and `_`, not starting with a digit.
Names are case-sensitive. A name cannot be defined twice.

## 4. Built-in series

| English  | Arabic   | Meaning                                  |
|----------|----------|------------------------------------------|
| `open`   | `افتتاح` | bar open                                 |
| `high`   | `أعلى`   | bar high                                 |
| `low`    | `أدنى`   | bar low                                  |
| `close`  | `إغلاق`  | bar close                                |
| `volume` | `حجم`    | bar volume                               |
| `time`   | `وقت`    | bar open time, ms since 1970 UTC         |
| `bar`    | `شمعة`   | bar number, 0 = oldest loaded bar (shown in the legend) |
| `median` |          | (high + low) / 2                         |
| `typical`|          | (high + low + close) / 3                 |
| `last`   | `أخيرة`  | `yes` only on the newest bar             |

## 5. Operators

From lowest to highest precedence:

| Operators                      | Meaning                     |
|--------------------------------|-----------------------------|
| `x ? a : b`                    | choose                      |
| `or`  (`أو`)                   | logical or                  |
| `and` (`و`)                    | logical and                 |
| `not` (`ليس`)                  | logical not                 |
| `==  !=  <  <=  >  >=`         | compare                     |
| `+  -`                         | add, subtract               |
| `*  /  %`                      | multiply, divide, remainder |
| `^`                            | power                       |
| `-x`                           | negate                      |

Comparisons with `none` are `no`. Division by zero gives `none`.

## 6. Control flow

```via
if <cond> then
  ...
elif <cond> then
  ...
else
  ...
end

repeat i from 1 to 10       # inclusive; at most 5,000 iterations per bar
  ...
end
```

Single-line form: `if cond then <statement>`.

## 7. Functions

All windowed functions take a series and a length `n` (a whole number ≥ 1). They
return `none` until enough bars exist.

### Averages and smoothing
| Function           | Result                                       |
|--------------------|----------------------------------------------|
| `avg(x, n)`        | simple average of the last `n` values        |
| `ema(x, n)`        | exponential average, weight `2/(n+1)`        |
| `wma(x, n)`        | linearly weighted average                    |
| `smooth(x, n)`     | Wilder smoothing, weight `1/n`               |
| `hull(x, n)`       | Hull-style average                           |
| `vwap()`           | volume-weighted average price, resets daily (UTC) |

### Window statistics
`sum(x, n)`, `highest(x, n)`, `lowest(x, n)`, `stdev(x, n)`, `median_of(x, n)`,
`since_high(x, n)` / `since_low(x, n)` (bars since the highest / lowest value).

### Bar to bar
| Function          | Result                                         |
|-------------------|------------------------------------------------|
| `prev(x, k=1)`    | value of `x` `k` bars ago                       |
| `change(x, k=1)`  | `x - prev(x, k)`                               |
| `pct(x, k=1)`     | percent change over `k` bars                   |
| `crossup(a, b)`   | `a` went from ≤ `b` to > `b` on this bar       |
| `crossdown(a, b)` | `a` went from ≥ `b` to < `b` on this bar       |
| `rising(x, n)`    | `x` grew on each of the last `n` bars           |
| `falling(x, n)`   | `x` dropped on each of the last `n` bars        |
| `bars_since(c)`   | bars since condition `c` was last `yes`        |
| `either(x, y)`    | `x`, or `y` when `x` is `none`                  |

### Ready-made studies
| Function                     | Returns                                       |
|------------------------------|-----------------------------------------------|
| `rsi(x, n)`                  | relative strength, 0..100                     |
| `atr(n)`                     | average true range                            |
| `true_range()`               | true range of this bar                        |
| `macd(x, fast, slow, sig)`   | `(line, signal, hist)`                        |
| `bands(x, n, k)`             | `(upper, middle, lower)` standard-deviation bands |
| `stoch(n, k_smooth, d_smooth)` | `(k, d)`                                    |
| `adx(n)`                     | `(adx, plus, minus)`                          |
| `cci(n)`, `mfi(n)`, `obv()`, `willr(n)`, `momentum(x, n)` | a single series |

Studies that return several series are unpacked with a group `let`:

```via
let (line, signal, hist) = macd(close, 12, 26, 9)
```

### Math
`abs`, `min(a, b, ...)`, `max(a, b, ...)`, `round(x, digits=0)`, `floor`, `ceil`,
`sqrt`, `log`, `exp`, `pow(a, b)`, `clamp(x, lo, hi)`, `sign(x)`, constant `pi`.

## 8. Drawing (indicators and experts)

```via
draw <expr> [name "<label>"] [as line|columns|dots|area|steps] [color <color>] [width 1..4]
level <number> [name "<label>"] [color <color>] [dashed]
mark above|below "<text>" [color <color>]
paint <color>                          # colors this bar's candle
```

- `draw` may appear only at the top level (not inside `if`); use a conditional value
  (`cond ? x : none`) to draw only on some bars. `color` can be an expression, so the
  color may change bar by bar.
- `mark` and `paint` may appear anywhere, usually inside an `if`.
- Up to 16 `draw`, 8 `level`, 500 marks per script.

Named colors: `blue` (brand Egyptian blue), `white`, `ink`, `gray`, `sky`, `gold`,
`sand`, `rose`, `mint`, `violet`. Arabic names: `أزرق`, `أبيض`, `حبر`, `رمادي`, `سماوي`, `ذهبي`,
`رملي`, `وردي`, `أخضر`, `بنفسجي`. Named colors follow the theme: in light mode `white` is drawn
dark and the others get a deeper shade, so a script reads well in both modes. Hex `#rrggbb`
or `#rrggbbaa` is used exactly as written, and `fade(color, 0..1)` sets opacity.

## 9. Alerts

```via
alert "<message>"
```

Inside an `if`. When the condition is met on the newest closed bar, the user gets the
alert (if they enabled alerts for the script). The message may include `{close}`,
`{time}` or any `let` name in braces: `alert "RSI is {r}"`.

## 10. Experts (strategies)

An expert is an indicator that can also trade. Orders fill at the **open of the next
bar** in the backtest.

```via
expert "Average cross"

option capital = 10000      # starting cash, in quote currency
option fee = 0.1            # percent per fill
option size = 100           # default order size, percent of equity

input fast = 9
input slow = 21
let a = ema(close, fast)
let b = ema(close, slow)
draw a color blue
draw b color white

if crossup(a, b) then buy
if crossdown(a, b) then sell
```

| Statement                         | Effect                                                     |
|-----------------------------------|------------------------------------------------------------|
| `buy [size]`                      | go long; closes a short first. `size` in % of equity        |
| `sell [size]`                     | go short; closes a long first                               |
| `exit`                            | close any open position                                     |
| `stop <price>`                    | protective stop for the open position (checked intrabar)    |
| `target <price>`                  | take-profit for the open position (checked intrabar)        |

Options: `capital`, `fee` (%), `size` (%), `shorts` (`yes`/`no`, default `yes`;
when `no`, `sell` only closes longs).

Read-only position series: `position` (`1` long, `-1` short, `0` flat), `entry_price`,
`bars_in_trade`, `equity`, `profit` (open profit in quote currency).

The tester reports: net profit, net %, trades, win rate, profit factor, max drawdown,
average trade, and the list of trades.

## 11. Arabic keywords

Every keyword has an Arabic spelling. Mixing is allowed.

| English     | Arabic    |
|-------------|-----------|
| `indicator` | `مؤشر`    |
| `expert`    | `خبير`    |
| `overlay`   | `على_السعر` |
| `input`     | `مدخل`    |
| `option`    | `خيار`    |
| `info`      | `معلومة`  |
| `let`       | `اجعل`    |
| `keep`      | `احفظ`    |
| `fn`        | `دالة`    |
| `if`        | `إذا`     |
| `then`      | `إذن`     |
| `elif`      | `وإلا_إذا` |
| `else`      | `وإلا`    |
| `end`       | `نهاية`   |
| `repeat`    | `كرر`     |
| `from` / `to` | `من` / `إلى` |
| `draw`      | `ارسم`    |
| `level`     | `مستوى`   |
| `mark`      | `علامة`   |
| `above` / `below` | `فوق` / `تحت` |
| `paint`     | `لوّن`    |
| `alert`     | `نبّه`    |
| `buy`       | `اشتر`    |
| `sell`      | `بع`      |
| `exit`      | `اخرج`    |
| `stop`      | `وقف`     |
| `target`    | `هدف`     |
| `name`      | `باسم`    |
| `color`     | `بلون`    |
| `width`     | `بسمك`    |
| `as`        | `كـ`      |
| `yes` / `no` | `نعم` / `لا` |
| `none`      | `لاشيء`   |

## 12. Limits and safety

Scripts run in a sandbox: no network, no files, no access to the page. Each run is
limited to 5,000 loop iterations per bar, 5,000,000 operations in total, and 1.5 seconds
of run time. A script that exceeds a limit stops with a clear error.

## 13. Errors

Errors give a line and column, in English and Arabic:

```
line 7, col 12: unknown name "clse". Did you mean "close"?
السطر 7، العمود 12: اسم غير معروف "clse". هل تقصد "close"؟
```

## 14. Lists, chart objects and the panel (v0.2)

The new function names (`len`, `get`, `hour`, ...) can still be used as variable names, so scripts written for v0.1 keep working. A call such as `len(xs)` always means the function.

### Lists
`list()` makes a list. Keep it with `keep` so it lasts from bar to bar, then change it with
`push`, `push_front`, `pop`, `pop_front`, `put`, `remove` and `clear`. Read it with `get(xs, i)`
(`-1` is the last item), `len`, `list_max`, `list_min` and `list_sum`. A list holds up to 10,000 items.

```via
keep highs = list()
if high == highest(high, 20) then push(highs, high)
if len(highs) > 10 then pop_front(highs)
```

### Chart objects
`new_line`, `new_box` and `new_label` draw an object and return its id. Points are a bar number
(the `bar` series, so `bar - 5` is five bars back and `bar + 10` is in the future) and a price.
`new_label(bar, price, text, color?, where?, text_color?)` places the label `above`, `below`, `center`, `right` or `left` of its point; a see-through color (`none` or `#rrggbb00`) shows the text alone.
Keep the id with `keep` to change the object later with `move`, `stretch`, `retext`, `recolor`
or `erase`; `exists`, `x1_of`, `y1_of`, `x2_of` and `y2_of` read it back. Each script can have up
to 500 lines, 500 boxes and 500 labels; when it makes more, the oldest one is removed.

```via
keep zone = none
if crossup(close, ema(close, 50)) then
  erase(zone)
  zone := new_box(bar, high, bar, low, blue, fade(blue, 0.15), "Zone")
end
if exists(zone) then stretch(zone, bar)
```

A statement that only calls a function (`push(xs, 1)`, `erase(id)`) is allowed anywhere. These
functions change things, so they cannot be used inside `fn`.

Tip: functions that read past bars (`prev`, `ema`, `highest`, …) remember only the bars on which
they ran. Inside an `if`, read a `let` defined at the top level (`let bodyLow = prev(min(open, close), 5)`)
instead of calling them there.

### Panel
`cell(row, col, text, color?, background?)` writes a small table pinned to a corner of the pane
(`panel("top_left")` moves it). The panel shows the values written on the newest bar.

### Text, time and higher timeframes
`to_text(x, digits?)` turns a value into text, and `+` joins text: `"RSI " + to_text(r, 1)`.
`hour(tz)`, `minute`, `weekday` (1 = Monday), `monthday`, `month`, `year` and
`in_session(start_hhmm, end_hhmm, tz)` read the bar's open time; `tz` is hours from UTC.
`bar_minutes()` is the chart's timeframe. `htf("high", 240)` is the high of the 4-hour bar
that is still forming, built from the chart's own bars (never future data); `htf("high", 240, 1)`
is the last finished one.
