# Via for AI assistants: quick version (Via 0.2.0)

> For people: give this whole file to ChatGPT, Gemini, Claude or any AI, then ask for the indicator or expert you want.
> Paste the result into https://chartavia.com/chart/script and press Run. Source: https://github.com/mohamadmahdy9/chartavia-plugin
> للمستخدمين: أعطِ هذا الملف كاملًا لأي ذكاء اصطناعي واطلب المؤشر أو الخبير الآلي الذي تريده، ثم الصق النتيجة في محرر شارتاڤيا.

## Part 1. Instructions for the assistant

You are a Via coding assistant for Chartavia (شارتاڤيا, chartavia.com). Via (ڤيا) is Chartavia's own scripting language for chart **indicators** (analyse and draw only) and **experts** (strategies that place orders and get a backtest report).

Your knowledge: the attached file `via-for-ai.md` (or the pasted Via kit). It is the complete and only source of truth for Via. Read it before answering. Via is NOT Pine Script, MQL, EasyLanguage or Python: never use their syntax or function names (`//@version`, `study()`, `plot()`, `ta.sma`, `strategy.entry`, `var`, `x[1]`, `;`, braces). If something is not in the file, build it from what is there, or say plainly that Via cannot do it yet.

How to work:
1. Understand the ask. Indicator or expert? On the price chart (`overlay`) or in its own pane? Which settings should the user be able to change? Ask one short question only if the request is truly unclear; otherwise choose sensible defaults and say which.
2. Write the whole script, ready to paste. First line `indicator "Title"` (add `overlay` for the price chart) or `expert "Title"`. One statement per line, comments with `#`.
3. Check it line by line against the rules below before you answer.
4. Reply in the user's language (Egyptian Arabic if they write Arabic), with: the full script in one code block, two or three sentences on what it does, the settings they can change, and how to run it: open chartavia.com/chart/script, paste, press Run (Ctrl+Enter). For experts, say a backtest is a test on past data, not a promise of profit.
5. If the user pastes an error from the editor (it gives line and column), fix exactly that and send the full corrected script again.

Rules that are easy to get wrong:
- Read history with `prev(x, k)`, never `x[k]`. Missing values are `none`; any math with `none` gives `none` and any comparison with `none` is `no`, so `x == none` is never true. Use `either(x, fallback)`, or start a `keep` at 0 and test `== 0`.
- `let` defines a series recomputed every bar and cannot be reassigned. `keep name = value` keeps a value across bars (set only on the first bar); change it with `name := value`.
- `draw` and `level` only at the top level, never inside `if` or `repeat`. To draw on some bars only: `draw cond ? value : none`. The colour may be an expression.
- Put every stateful call (`prev`, `ema`, `rsi`, `atr`, `highest`, `crossup`, `macd`, `htf`...) in a top-level `let` and use the name inside `if` blocks. Inside an `if` they only see the bars where the `if` ran.
- Functions that return several values must be unpacked with the exact count: `let (line, signal, hist) = macd(close, 12, 26, 9)`, `let (upper, middle, lower) = bands(close, 20, 2)`, `let (k, d) = stoch(14, 3, 3)`, `let (adxValue, plusDi, minusDi) = adx(14)`.
- `fn name(a, b) = expression` is one expression, defined before use: no drawing, trading, `keep` changes, lists or chart objects inside. Call it from top-level `let`s.
- Do not name variables after built-ins or keywords: `close`, `high`, `bar`, `time`, `avg`, `blue`, `name`, `color`, `width`, `as`, `level`, `mark`, `stop`, `target`, `from`, `to`, `input`, `option`, `info`, `end`...
- `repeat i from a to b` counts down when a > b, so `repeat k from 0 to len(xs) - 1` runs twice on an empty list. Guard it with `if len(xs) > 0 then`. Walk backwards when removing items.
- `mark` keeps only the first 500 marks; for frequent signals use `new_label(bar, price, text, none, "above", color)` (keeps the newest 500).
- Inputs: `input length = 14 "Length" 1..200`, `input show = yes "Show"`, `input col = #7480ff "Colour"`, `input kind = 0 "Type" options "A|B|C"` (value = position from 0), `input start = time "Start"` (date picker, 0 = not set), optional `group "Section"`.
- Colours: `blue white ink gray sky gold sand rose mint violet`, `#rrggbb`, `#rrggbbaa`, `fade(color, 0..1)`. Chartavia's style is calm: `blue` for the main line and bullish signals, `white`/`gray` for secondary lines, `rose` sparingly for bearish. Avoid loud green/red.
- Experts only: `option capital/fee/size/shorts`, `buy [size%]`, `sell [size%]`, `exit`, `stop price`, `target price`, and the series `position` (1, -1, 0), `entry_price`, `bars_in_trade`, `equity`, `profit`. Orders fill at the next bar's open; stops and targets are checked inside each bar (the stop wins if both are hit). `buy` while already long does nothing. Indicators can never trade.
- Avoid look-ahead: compare with the previous bars' level, e.g. `close > prev(highest(high, 20))`. Fire signals once with `crossup`/`crossdown` or `cond and not prev(cond)`.
- No semicolons. Long lines may continue after `,` `(` or an operator.
- Limits: 16 `draw`, 8 `level`, 500 marks, 500 lines, 500 boxes, 500 labels, 5,000 loop steps per bar, 5 million operations.

When a request matches an example in the file, start from that example. Never invent functions, settings or numbers. Never claim a strategy is profitable.

## Part 2. Language reference

### Via language reference (v0.2)

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

#### 1. Program layout

A script has one header line, then statements, one per line.

```
indicator "<title>" [overlay]      # an indicator; overlay = drawn on the price pane
expert    "<title>"                # a strategy that places orders (always overlay)
```

Comments start with `#` and run to the end of the line. Blank lines are ignored.
A statement that is too long can continue on the next line after a trailing `,`, `(`,
or an operator.

##### Package info (optional)

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

#### 2. Values

| Kind      | Examples                          | Notes                                             |
|-----------|-----------------------------------|---------------------------------------------------|
| number    | `14`, `0.5`, `2e3`, `1_000`       | 64-bit floats                                     |
| bool      | `yes`, `no` (`true`/`false` too)  |                                                   |
| text      | `"Fast"`                          | only for names, labels, alerts                    |
| color     | `blue`, `#1f4fd1`, `#1f4fd180`    | see §8                                            |
| empty     | `none`                            | "no value on this bar"; most math on `none` gives `none` |

`none` is what you get for warm-up bars (e.g. `avg(close, 20)` on the first 19 bars).
Use `either(x, fallback)` to replace it.

#### 3. Names

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

#### 4. Built-in series

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

#### 5. Operators

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

#### 6. Control flow

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

#### 7. Functions

All windowed functions take a series and a length `n` (a whole number ≥ 1). They
return `none` until enough bars exist.

##### Averages and smoothing
| Function           | Result                                       |
|--------------------|----------------------------------------------|
| `avg(x, n)`        | simple average of the last `n` values        |
| `ema(x, n)`        | exponential average, weight `2/(n+1)`        |
| `wma(x, n)`        | linearly weighted average                    |
| `smooth(x, n)`     | Wilder smoothing, weight `1/n`               |
| `hull(x, n)`       | Hull-style average                           |
| `vwap()`           | volume-weighted average price, resets daily (UTC) |

##### Window statistics
`sum(x, n)`, `highest(x, n)`, `lowest(x, n)`, `stdev(x, n)`, `median_of(x, n)`,
`since_high(x, n)` / `since_low(x, n)` (bars since the highest / lowest value).

##### Bar to bar
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

##### Ready-made studies
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

##### Math
`abs`, `min(a, b, ...)`, `max(a, b, ...)`, `round(x, digits=0)`, `floor`, `ceil`,
`sqrt`, `log`, `exp`, `pow(a, b)`, `clamp(x, lo, hi)`, `sign(x)`, constant `pi`.

#### 8. Drawing (indicators and experts)

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

#### 9. Alerts

```via
alert "<message>"
```

Inside an `if`. When the condition is met on the newest closed bar, the user gets the
alert (if they enabled alerts for the script). The message may include `{close}`,
`{time}` or any `let` name in braces: `alert "RSI is {r}"`.

#### 10. Experts (strategies)

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

#### 12. Limits and safety

Scripts run in a sandbox: no network, no files, no access to the page. Each run is
limited to 5,000 loop iterations per bar, 5,000,000 operations in total, and 1.5 seconds
of run time. A script that exceeds a limit stops with a clear error.

#### 13. Errors

Errors give a line and column, in English and Arabic:

```
line 7, col 12: unknown name "clse". Did you mean "close"?
السطر 7، العمود 12: اسم غير معروف "clse". هل تقصد "close"؟
```

#### 14. Lists, chart objects and the panel (v0.2)

The new function names (`len`, `get`, `hour`, ...) can still be used as variable names, so scripts written for v0.1 keep working. A call such as `len(xs)` always means the function.

##### Lists
`list()` makes a list. Keep it with `keep` so it lasts from bar to bar, then change it with
`push`, `push_front`, `pop`, `pop_front`, `put`, `remove` and `clear`. Read it with `get(xs, i)`
(`-1` is the last item), `len`, `list_max`, `list_min` and `list_sum`. A list holds up to 10,000 items.

```via
keep highs = list()
if high == highest(high, 20) then push(highs, high)
if len(highs) > 10 then pop_front(highs)
```

##### Chart objects
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

##### Panel
`cell(row, col, text, color?, background?)` writes a small table pinned to a corner of the pane
(`panel("top_left")` moves it). The panel shows the values written on the newest bar.

##### Text, time and higher timeframes
`to_text(x, digits?)` turns a value into text, and `+` joins text: `"RSI " + to_text(r, 1)`.
`hour(tz)`, `minute`, `weekday` (1 = Monday), `monthday`, `month`, `year` and
`in_session(start_hhmm, end_hhmm, tz)` read the bar's open time; `tz` is hours from UTC.
`bar_minutes()` is the chart's timeframe. `htf("high", 240)` is the high of the 4-hour bar
that is still forming, built from the chart's own bars (never future data); `htf("high", 240, 1)`
is the last finished one.

## Part 3. Function list

- `avg(x, n)`: Simple average of the last n values.
- `ema(x, n)`: Exponential average, weight 2/(n+1), seeded with the simple average.
- `wma(x, n)`: Linearly weighted average (newest weighs most).
- `smooth(x, n)`: Wilder smoothing, weight 1/n.
- `hull(x, n)`: Fast, low-lag Hull-style average.
- `vwap()`: Volume-weighted average price, resets every UTC day.
- `sum(x, n)`: Sum of the last n values.
- `highest(x, n)`: Highest of the last n values.
- `lowest(x, n)`: Lowest of the last n values.
- `stdev(x, n)`: Standard deviation of the last n values.
- `median_of(x, n)`: Median of the last n values.
- `since_high(x, n)`: Bars since the highest value in the window (0 = this bar).
- `since_low(x, n)`: Bars since the lowest value in the window.
- `prev(x, k = 1)`: Value of x k bars ago.
- `change(x, k = 1)`: x minus its value k bars ago.
- `pct(x, k = 1)`: Percent change over k bars.
- `crossup(a, b)`: yes on the bar where a goes from ≤ b to > b.
- `crossdown(a, b)`: yes on the bar where a goes from ≥ b to < b.
- `rising(x, n)`: x grew on each of the last n bars.
- `falling(x, n)`: x dropped on each of the last n bars.
- `bars_since(cond)`: Bars since cond was last yes (none if never).
- `either(x, fallback)`: x, or fallback when x is none.
- `rsi(x, n)`: Relative strength index, 0 to 100.
- `atr(n)`: Average true range (Wilder).
- `true_range()`: True range of this bar.
- `macd(x, fast, slow, signal)`: Returns (line, signal, hist).
- `bands(x, n, k)`: Standard deviation bands. Returns (upper, middle, lower).
- `stoch(n, k_smooth, d_smooth)`: Stochastic oscillator. Returns (k, d).
- `adx(n)`: Trend strength. Returns (adx, plus, minus).
- `cci(n)`: Commodity channel index.
- `mfi(n)`: Money flow index, 0 to 100.
- `obv()`: On-balance volume.
- `willr(n)`: Williams range, -100 to 0.
- `momentum(x, n)`: x minus x n bars ago.
- `list(a, b, ...)`: A new list, empty or with the given items. Keep it with `keep` so it lasts across bars.
- `push(xs, v)`: Add v at the end; returns the new length.
- `push_front(xs, v)`: Add v at the start.
- `pop(xs)`: Remove and return the last item.
- `pop_front(xs)`: Remove and return the first item.
- `get(xs, i)`: Item i (0 is the first, -1 the last), or none.
- `put(xs, i, v)`: Replace item i.
- `remove(xs, i)`: Remove item i and return it.
- `clear(xs)`: Empty the list.
- `len(xs)`: Number of items.
- `list_max(xs)`: Largest number in the list.
- `list_min(xs)`: Smallest number in the list.
- `list_sum(xs)`: Sum of the numbers in the list.
- `new_line(bar1, price1, bar2, price2, color?, width?, style?, extend?)`: Draw a line between two points and return its id. style: "solid", "dashed", "dotted"; extend: "none", "right", "left", "both". At most 500 lines; the oldest goes first.
- `new_box(bar1, top, bar2, bottom, color?, fill?, text?)`: Draw a filled rectangle and return its id (zones, order blocks, gaps).
- `new_label(bar, price, text, color?, where?, text_color?)`: Write text at a point; where is "above", "below", "center", "right" or "left". A see-through color shows the text alone.
- `move(id, bar1, price1, bar2?, price2?)`: Move an object's points.
- `stretch(id, bar2)`: Move only the right end, e.g. keep a box running to the current bar.
- `retext(id, text)`: Change a label's or box's text.
- `recolor(id, color, fill?)`: Change an object's colors.
- `erase(id)`: Delete an object.
- `exists(id)`: yes while the object is on the chart.
- `x1_of(id)`: Bar of an object's first point.
- `y1_of(id)`: Price of an object's first point.
- `x2_of(id)`: Bar of an object's second point.
- `y2_of(id)`: Price of an object's second point.
- `cell(row, col, text, color?, background?)`: Write one cell of the dashboard panel (rows 0-29, columns 0-11). The panel shows the values from the newest bar.
- `panel(where)`: Where the panel sits: "top_right" (default), "top_left", "bottom_right", "bottom_left".
- `to_text(x, digits?)`: A number as text. "+" also joins text: "RSI " + to_text(r, 1).
- `hour(tz?)`: Hour the bar opened; tz is hours from UTC (2 for Cairo winter).
- `minute(tz?)`: Minute the bar opened.
- `weekday(tz?)`: Day of the week, 1 = Monday ... 7 = Sunday.
- `monthday(tz?)`: Day of the month.
- `month(tz?)`: Month, 1 to 12.
- `year(tz?)`: Year.
- `in_session(start, end, tz?)`: yes when the bar opens inside a daily window given as hhmm; windows may cross midnight.
- `bar_minutes()`: The chart's timeframe in minutes.
- `htf(field, minutes, back = 0)`: Open, high, low or close of a higher-timeframe bar built from the chart's bars. back 0 is the bar still forming (never future data), 1 the last finished one.
- `abs(x)`: Absolute value.
- `min(a, b, ...)`: Smallest value.
- `max(a, b, ...)`: Largest value.
- `round(x, digits = 0)`: Round to digits after the point.
- `floor(x)`: Round down.
- `ceil(x)`: Round up.
- `sqrt(x)`: Square root.
- `log(x)`: Natural logarithm.
- `exp(x)`: e to the power x.
- `pow(a, b)`: a to the power b (same as a ^ b).
- `clamp(x, lo, hi)`: Keep x between lo and hi.
- `sign(x)`: -1, 0 or 1.
- `fade(color, alpha)`: Same color with opacity 0..1.

Arabic keywords and names exist for everything; see the complete kit (ai/via-for-ai.md).

## Part 4. Examples

### two-averages

Two moving averages with cross marks

متوسطان متحركان مع علامات التقاطع

```via
# en: Two moving averages with cross marks
# ar: متوسطان متحركان مع علامات التقاطع

indicator "Two averages" overlay

input fast = 9  "Fast period"  1..200
input slow = 21 "Slow period"  1..400

let a = ema(close, fast)
let b = ema(close, slow)

draw a name "Fast" color blue
draw b name "Slow" color white width 2

if crossup(a, b) then
  mark below "▲" color blue
  alert "Fast average crossed above slow at {close}"
end
if crossdown(a, b) then
  mark above "▼" color gray
  alert "Fast average crossed below slow at {close}"
end
```

### rsi-zones

RSI with zones and colored line

مؤشر القوة النسبية مع مناطق وتلوين

```via
# en: RSI with zones and colored line
# ar: مؤشر القوة النسبية مع مناطق وتلوين

indicator "RSI zones"

input length = 14 "Length" 2..100
input upper = 70 "Overbought" 50..100
input lower = 30 "Oversold" 0..50

let r = rsi(close, length)

draw r name "RSI" color r > upper ? rose : r < lower ? mint : blue width 2
level upper name "Overbought" color gray dashed
level 50 color fade(gray, 0.4)
level lower name "Oversold" color gray dashed

if crossdown(r, upper) then alert "RSI left the overbought zone: {r}"
if crossup(r, lower) then alert "RSI left the oversold zone: {r}"
```

### trailing-trend

ATR trailing trend line (uses keep)

خط اتجاه متحرك بالـ ATR (باستخدام keep)

```via
# en: ATR trailing trend line (uses keep)
# ar: خط اتجاه متحرك بالـ ATR (باستخدام keep)

indicator "Trailing trend" overlay

input length = 10 "ATR length" 1..100
input mult = 3 "Multiplier"

let band = atr(length) * mult
keep trail = close
keep dir = 1

# band is none until the ATR has enough bars; wait for it, or trail would become none too
if band > 0 then
  if dir == 1 then
    trail := max(trail, close - band)
    if close < trail then
      dir := -1
      trail := close + band
      mark above "▼" color rose
    end
  else
    trail := min(trail, close + band)
    if close > trail then
      dir := 1
      trail := close - band
      mark below "▲" color blue
    end
  end
end

draw bar > length ? trail : none name "Trail" as steps color dir == 1 ? blue : rose width 2
```

### fair-value-gaps

Fair value gaps (three-candle imbalances) drawn as boxes that disappear once filled

فجوات القيمة العادلة (فجوة بين 3 شموع) مرسومة كصناديق تختفي عندما يغلقها السعر

```via
# en: Fair value gaps (three-candle imbalances) drawn as boxes that disappear once filled
# ar: فجوات القيمة العادلة (فجوة بين 3 شموع) مرسومة كصناديق تختفي عندما يغلقها السعر
# shows: new_box(), lists of box ids, stretch(), erase(), walking a list backwards with repeat
indicator "Fair value gaps" overlay

input minSize = 0.2 "Minimum size (x ATR)" 0..5
input maxKeep = 10 "Gaps to keep on each side" 1..50

let a = atr(14)
let h2 = prev(high, 2)
let l2 = prev(low, 2)
let bullGap = low > h2 and low - h2 >= a * minSize
let bearGap = high < l2 and l2 - high >= a * minSize

keep bulls = list()
keep bears = list()

if bullGap then push(bulls, new_box(bar - 2, low, bar, h2, blue, fade(blue, 0.18), "FVG"))
if bearGap then push(bears, new_box(bar - 2, l2, bar, high, rose, fade(rose, 0.15), "FVG"))
if len(bulls) > maxKeep then erase(pop_front(bulls))
if len(bears) > maxKeep then erase(pop_front(bears))

# extend open gaps to this bar; remove the ones price has filled.
# Walk backwards so removing an item does not skip the next one, and only when the list has items:
# "repeat k from 0 to -1" would run twice (it counts down).
if len(bulls) > 0 then
  repeat k from len(bulls) - 1 to 0
    if low <= y2_of(get(bulls, k)) then
      erase(remove(bulls, k))
    else
      stretch(get(bulls, k), bar)
    end
  end
end
if len(bears) > 0 then
  repeat k from len(bears) - 1 to 0
    if high >= y1_of(get(bears, k)) then
      erase(remove(bears, k))
    else
      stretch(get(bears, k), bar)
    end
  end
end
```

### structure-breaks

Market structure: break of structure (BOS) and change of character (CHoCH) from swing points

هيكل السوق: كسر الهيكل (BOS) وتغيّر الاتجاه (CHoCH) من القمم والقيعان

```via
# en: Market structure: break of structure (BOS) and change of character (CHoCH) from swing points
# ar: هيكل السوق: كسر الهيكل (BOS) وتغيّر الاتجاه (CHoCH) من القمم والقيعان
# shows: keep state machine, new_line() from the swing to the break, labels, alerts
indicator "Structure breaks" overlay

input side = 5 "Swing size (bars on each side)" 1..30

let isHigh = prev(high, side) == highest(high, side * 2 + 1)
let isLow = prev(low, side) == lowest(low, side * 2 + 1)
let swingHigh = prev(high, side)
let swingLow = prev(low, side)

keep hiPrice = 0
keep hiBar = 0
keep hiOpen = no      # yes while the last swing high has not been broken
keep loPrice = 0
keep loBar = 0
keep loOpen = no
keep trend = 0        # 1 up, -1 down, 0 not known yet

if isHigh then
  hiPrice := swingHigh
  hiBar := bar - side
  hiOpen := yes
end
if isLow then
  loPrice := swingLow
  loBar := bar - side
  loOpen := yes
end

if hiOpen and close > hiPrice then
  new_line(hiBar, hiPrice, bar, hiPrice, blue, 1, "dashed")
  new_label(round((hiBar + bar) / 2), hiPrice, trend == -1 ? "CHoCH" : "BOS", none, "above", blue)
  alert "Structure broken up at {close}"
  hiOpen := no
  trend := 1
end
if loOpen and close < loPrice then
  new_line(loBar, loPrice, bar, loPrice, rose, 1, "dashed")
  new_label(round((loBar + bar) / 2), loPrice, trend == 1 ? "CHoCH" : "BOS", none, "below", rose)
  alert "Structure broken down at {close}"
  loOpen := no
  trend := -1
end
```

### market-dashboard

A small dashboard in the chart corner: trend, RSI, ADX, volatility and today's change

لوحة صغيرة في زاوية الشارت: الاتجاه وRSI وADX والتذبذب وتغيّر اليوم

```via
# en: A small dashboard in the chart corner: trend, RSI, ADX, volatility and today's change
# ar: لوحة صغيرة في زاوية الشارت: الاتجاه وRSI وADX والتذبذب وتغيّر اليوم
# shows: panel() and cell(), to_text(), joining text with +, unpacking adx()
indicator "Market dashboard" overlay

input where = 0 "Corner" options "Top right|Top left|Bottom right|Bottom left"

let r = rsi(close, 14)
let (strength, plusDi, minusDi) = adx(14)
let fast = ema(close, 20)
let slow = ema(close, 50)
let atrPct = atr(14) / close * 100
let dayOpen = htf("open", 1440)
let dayChange = (close - dayOpen) / dayOpen * 100
let trendUp = fast > slow

panel(where == 0 ? "top_right" : where == 1 ? "top_left" : where == 2 ? "bottom_right" : "bottom_left")

if last then
  cell(0, 0, "Chartavia", white, fade(blue, 0.7))
  cell(0, 1, "", white, fade(blue, 0.7))
  cell(1, 0, "Trend", gray)
  cell(1, 1, trendUp ? "Up" : "Down", white, trendUp ? fade(blue, 0.5) : fade(rose, 0.4))
  cell(2, 0, "RSI 14", gray)
  cell(2, 1, to_text(r, 1), r > 70 ? rose : r < 30 ? mint : white)
  cell(3, 0, "ADX 14", gray)
  cell(3, 1, to_text(strength, 1) + (strength > 25 ? " strong" : " weak"), white)
  cell(4, 0, "ATR %", gray)
  cell(4, 1, to_text(atrPct, 2) + "%", white)
  cell(5, 0, "Today", gray)
  cell(5, 1, (dayChange >= 0 ? "+" : "") + to_text(dayChange, 2) + "%", dayChange >= 0 ? blue : rose)
end
```

### average-cross-atr-stop

Moving-average cross with an ATR stop and a target at a multiple of the risk (longs and shorts)

تقاطع متوسطين مع وقف خسارة بالـ ATR وهدف بمضاعف المخاطرة (شراء وبيع)

```via
# en: Moving-average cross with an ATR stop and a target at a multiple of the risk (longs and shorts)
# ar: تقاطع متوسطين مع وقف خسارة بالـ ATR وهدف بمضاعف المخاطرة (شراء وبيع)
# shows: option lines, buy/sell with stop and target placed on the same bar
expert "Average cross with ATR stop"

option capital = 10000
option fee = 0.05
option size = 100

input fast = 20 "Fast average" 2..200
input slow = 50 "Slow average" 5..400
input stopAtr = 2 "Stop distance (x ATR)" 0.5..10
input reward = 2 "Target (x stop distance)" 0.5..10

let a = ema(close, fast)
let b = ema(close, slow)
let vol = atr(14)

draw a name "Fast" color blue
draw b name "Slow" color white width 2

if crossup(a, b) then
  buy
  stop close - vol * stopAtr
  target close + vol * stopAtr * reward
end
if crossdown(a, b) then
  sell
  stop close + vol * stopAtr
  target close - vol * stopAtr * reward
end
```

### channel-breakout-trailing

Channel breakout with a trailing ATR stop that only moves in the trade's favour (longs only)

كسر قناة مع وقف متحرك بالـ ATR يتحرك في صالح الصفقة فقط (شراء فقط)

```via
# en: Channel breakout with a trailing ATR stop that only moves in the trade's favour (longs only)
# ar: كسر قناة مع وقف متحرك بالـ ATR يتحرك في صالح الصفقة فقط (شراء فقط)
# shows: option shorts = no, updating stop every bar, keep for the trailing level
expert "Breakout with trailing stop"

option fee = 0.05
option shorts = no

input entryLen = 55 "Breakout of the last (bars)" 5..400
input trailAtr = 3 "Trailing stop (x ATR)" 0.5..10

# the channel of the bars BEFORE this one, so this bar's own high can break it
let channelHigh = prev(highest(high, entryLen))
let vol = atr(14)

keep trail = 0

draw channelHigh name "Channel high" color fade(gray, 0.7) as steps
draw position == 1 ? trail : none name "Trailing stop" color gold as steps

if position == 0 and close > channelHigh then
  buy
  trail := close - vol * trailAtr
  stop trail
end
if position == 1 then
  trail := max(trail, close - vol * trailAtr)
  stop trail
end
```
