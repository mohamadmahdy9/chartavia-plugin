# Via for AI assistants: complete kit (Via 0.2.0)

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

#### 11. Arabic keywords

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

## Part 3. Every built-in series, function and keyword

### Via built-ins (generated, do not edit)

#### Series

| Name | Arabic | Meaning |
|---|---|---|
| `open` | `افتتاح` | Bar open price |
| `high` | `أعلى` | Bar high |
| `low` | `أدنى` | Bar low |
| `close` | `إغلاق` | Bar close |
| `volume` | `حجم` | Bar volume |
| `time` | `وقت` | Bar open time in ms since 1970 (UTC) |
| `bar` | `شمعة` | Bar number, 0 is the oldest loaded bar (the number the legend shows) |
| `median` |  | (high + low) / 2 |
| `typical` |  | (high + low + close) / 3 |
| `last` | `أخيرة` | yes only on the newest bar |
| `position` |  | 1 long, -1 short, 0 flat (experts only) |
| `entry_price` |  | Entry price of the open position, or none (experts only) |
| `bars_in_trade` |  | Bars since the open position was entered (experts only) |
| `equity` |  | Cash plus open position value (experts only) |
| `profit` |  | Open profit of the position (experts only) |

#### Averages and smoothing · المتوسطات والتنعيم

| Function | Meaning | Example |
|---|---|---|
| `avg(x, n)` | Simple average of the last n values. <br>المتوسط البسيط لآخر n قيمة. | `avg(close, 20)` |
| `ema(x, n)` | Exponential average, weight 2/(n+1), seeded with the simple average. <br>المتوسط الأسي بوزن 2/(n+1)، يبدأ من المتوسط البسيط. | `ema(close, 9)` |
| `wma(x, n)` | Linearly weighted average (newest weighs most). <br>المتوسط الموزون خطيًا (الأحدث له الوزن الأكبر). | `wma(close, 10)` |
| `smooth(x, n)` | Wilder smoothing, weight 1/n. <br>تنعيم وايلدر بوزن 1/n. | `smooth(close, 14)` |
| `hull(x, n)` | Fast, low-lag Hull-style average. <br>متوسط سريع قليل التأخير على طريقة هَل. | `hull(close, 16)` |
| `vwap()` | Volume-weighted average price, resets every UTC day. <br>متوسط السعر المرجّح بالحجم، يبدأ من جديد كل يوم (UTC). | `vwap()` |

#### Window statistics · إحصاءات النافذة

| Function | Meaning | Example |
|---|---|---|
| `sum(x, n)` | Sum of the last n values. <br>مجموع آخر n قيمة. |  |
| `highest(x, n)` | Highest of the last n values. <br>أعلى قيمة في آخر n. | `highest(high, 20)` |
| `lowest(x, n)` | Lowest of the last n values. <br>أقل قيمة في آخر n. | `lowest(low, 20)` |
| `stdev(x, n)` | Standard deviation of the last n values. <br>الانحراف المعياري لآخر n قيمة. |  |
| `median_of(x, n)` | Median of the last n values. <br>الوسيط لآخر n قيمة. |  |
| `since_high(x, n)` | Bars since the highest value in the window (0 = this bar). <br>عدد الشموع منذ أعلى قيمة في النافذة (0 = الشمعة الحالية). |  |
| `since_low(x, n)` | Bars since the lowest value in the window. <br>عدد الشموع منذ أقل قيمة في النافذة. |  |

#### Bar to bar · بين الشموع

| Function | Meaning | Example |
|---|---|---|
| `prev(x, k = 1)` | Value of x k bars ago. <br>قيمة x قبل k شمعة. | `prev(close, 3)` |
| `change(x, k = 1)` | x minus its value k bars ago. <br>الفرق بين x وقيمتها قبل k شمعة. |  |
| `pct(x, k = 1)` | Percent change over k bars. <br>نسبة التغير خلال k شمعة. |  |
| `crossup(a, b)` | yes on the bar where a goes from ≤ b to > b. <br>نعم في الشمعة التي تجاوزت فيها a صعودًا فوق b. | `crossup(ema(close, 9), ema(close, 21))` |
| `crossdown(a, b)` | yes on the bar where a goes from ≥ b to < b. <br>نعم في الشمعة التي هبطت فيها a تحت b. |  |
| `rising(x, n)` | x grew on each of the last n bars. <br>ارتفعت x في كل شمعة من آخر n. |  |
| `falling(x, n)` | x dropped on each of the last n bars. <br>انخفضت x في كل شمعة من آخر n. |  |
| `bars_since(cond)` | Bars since cond was last yes (none if never). <br>عدد الشموع منذ آخر مرة كان فيها الشرط نعم. |  |
| `either(x, fallback)` | x, or fallback when x is none. <br>x، أو البديل إن كانت x لاشيء. | `either(prev(close), open)` |

#### Ready-made studies · مؤشرات جاهزة

| Function | Meaning | Example |
|---|---|---|
| `rsi(x, n)` | Relative strength index, 0 to 100. <br>مؤشر القوة النسبية من 0 إلى 100. | `rsi(close, 14)` |
| `atr(n)` | Average true range (Wilder). <br>متوسط المدى الحقيقي. | `atr(14)` |
| `true_range()` | True range of this bar. <br>المدى الحقيقي للشمعة الحالية. |  |
| `macd(x, fast, slow, signal)` | Returns (line, signal, hist). <br>تُرجع (الخط، الإشارة، المدرّج التكراري). | `let (l, s, h) = macd(close, 12, 26, 9)` |
| `bands(x, n, k)` | Standard deviation bands. Returns (upper, middle, lower). <br>نطاقات الانحراف المعياري. تُرجع (العلوي، الأوسط، السفلي). | `let (u, m, d) = bands(close, 20, 2)` |
| `stoch(n, k_smooth, d_smooth)` | Stochastic oscillator. Returns (k, d). <br>مذبذب الاستوكاستيك. يُرجع (k, d). | `let (k, d) = stoch(14, 3, 3)` |
| `adx(n)` | Trend strength. Returns (adx, plus, minus). <br>قوة الاتجاه. تُرجع (adx، الموجب، السالب). | `let (a, p, m) = adx(14)` |
| `cci(n)` | Commodity channel index. <br>مؤشر قناة السلع. |  |
| `mfi(n)` | Money flow index, 0 to 100. <br>مؤشر تدفق الأموال من 0 إلى 100. |  |
| `obv()` | On-balance volume. <br>حجم التوازن. |  |
| `willr(n)` | Williams range, -100 to 0. <br>مؤشر ويليامز من -100 إلى 0. |  |
| `momentum(x, n)` | x minus x n bars ago. <br>x ناقص قيمتها قبل n شمعة. |  |

#### Lists (Via 0.2) · القوائم (ڤيا 0.2)

| Function | Meaning | Example |
|---|---|---|
| `list(a, b, ...)` | A new list, empty or with the given items. Keep it with `keep` so it lasts across bars. <br>قائمة جديدة فارغة أو تحتوي هذه العناصر. احفظها بـ keep لتبقى من شمعة إلى أخرى. | `keep highs = list()` |
| `push(xs, v)` | Add v at the end; returns the new length. <br>يضيف v في النهاية ويُرجع الطول الجديد. | `push(highs, high)` |
| `push_front(xs, v)` | Add v at the start. <br>يضيف v في البداية. |  |
| `pop(xs)` | Remove and return the last item. <br>يزيل آخر عنصر ويُرجعه. |  |
| `pop_front(xs)` | Remove and return the first item. <br>يزيل أول عنصر ويُرجعه. |  |
| `get(xs, i)` | Item i (0 is the first, -1 the last), or none. <br>العنصر رقم i (0 الأول و-1 الأخير)، أو لاشيء. | `get(highs, -1)` |
| `put(xs, i, v)` | Replace item i. <br>يغيّر العنصر رقم i. |  |
| `remove(xs, i)` | Remove item i and return it. <br>يزيل العنصر رقم i ويُرجعه. |  |
| `clear(xs)` | Empty the list. <br>يفرّغ القائمة. |  |
| `len(xs)` | Number of items. <br>عدد العناصر. |  |
| `list_max(xs)` | Largest number in the list. <br>أكبر رقم في القائمة. |  |
| `list_min(xs)` | Smallest number in the list. <br>أصغر رقم في القائمة. |  |
| `list_sum(xs)` | Sum of the numbers in the list. <br>مجموع الأرقام في القائمة. |  |

#### Chart objects and panel (Via 0.2) · رسومات الشارت واللوحة (ڤيا 0.2)

| Function | Meaning | Example |
|---|---|---|
| `new_line(bar1, price1, bar2, price2, color?, width?, style?, extend?)` | Draw a line between two points and return its id. style: "solid", "dashed", "dotted"; extend: "none", "right", "left", "both". At most 500 lines; the oldest goes first. <br>يرسم خطًا بين نقطتين ويُرجع رقمه. الشكل: solid أو dashed أو dotted، والامتداد: none أو right أو left أو both. 500 خط على الأكثر، ويُزال الأقدم. | `new_line(bar - 10, low, bar, high, blue, 2, "dashed")` |
| `new_box(bar1, top, bar2, bottom, color?, fill?, text?)` | Draw a filled rectangle and return its id (zones, order blocks, gaps). <br>يرسم مستطيلًا ملوّنًا ويُرجع رقمه (مناطق، أوردر بلوك، فجوات). | `new_box(bar - 3, high, bar, low, blue, fade(blue, 0.15))` |
| `new_label(bar, price, text, color?, where?, text_color?)` | Write text at a point; where is "above", "below", "center", "right" or "left". A see-through color shows the text alone. <br>يكتب نصًا عند نقطة؛ الموضع above أو below أو center أو right أو left. إن كان اللون شفافًا يظهر النص وحده. | `new_label(bar, high, "HH", gold, "above")` |
| `move(id, bar1, price1, bar2?, price2?)` | Move an object's points. <br>يحرّك نقاط الرسمة. |  |
| `stretch(id, bar2)` | Move only the right end, e.g. keep a box running to the current bar. <br>يحرّك الطرف الأيمن فقط، كأنك تمدّ صندوقًا حتى الشمعة الحالية. | `stretch(zone, bar)` |
| `retext(id, text)` | Change a label's or box's text. <br>يغيّر نص اللافتة أو الصندوق. |  |
| `recolor(id, color, fill?)` | Change an object's colors. <br>يغيّر ألوان الرسمة. |  |
| `erase(id)` | Delete an object. <br>يحذف الرسمة. |  |
| `exists(id)` | yes while the object is on the chart. <br>نعم ما دامت الرسمة موجودة. |  |
| `x1_of(id)` | Bar of an object's first point. <br>شمعة أول نقطة في الرسمة. |  |
| `y1_of(id)` | Price of an object's first point. <br>سعر أول نقطة في الرسمة. |  |
| `x2_of(id)` | Bar of an object's second point. <br>شمعة النقطة الثانية في الرسمة. |  |
| `y2_of(id)` | Price of an object's second point. <br>سعر النقطة الثانية في الرسمة. |  |
| `cell(row, col, text, color?, background?)` | Write one cell of the dashboard panel (rows 0-29, columns 0-11). The panel shows the values from the newest bar. <br>يكتب خلية في لوحة البيانات (صفوف 0-29، أعمدة 0-11). تعرض اللوحة قيم آخر شمعة. | `cell(0, 0, "Trend"); cell(0, 1, up ? "Up" : "Down", white, blue)` |
| `panel(where)` | Where the panel sits: "top_right" (default), "top_left", "bottom_right", "bottom_left". <br>موضع اللوحة: top_right (الافتراضي) أو top_left أو bottom_right أو bottom_left. |  |

#### Text, time and higher timeframes (Via 0.2) · النصوص والوقت والأطر الزمنية الأعلى (ڤيا 0.2)

| Function | Meaning | Example |
|---|---|---|
| `to_text(x, digits?)` | A number as text. "+" also joins text: "RSI " + to_text(r, 1). <br>يحوّل الرقم إلى نص. وعلامة + تصل النصوص: "RSI " + to_text(r, 1). | `to_text(close, 2)` |
| `hour(tz?)` | Hour the bar opened; tz is hours from UTC (2 for Cairo winter). <br>ساعة افتتاح الشمعة؛ tz فرق الساعات عن UTC (2 للقاهرة في الشتاء). | `hour(2)` |
| `minute(tz?)` | Minute the bar opened. <br>دقيقة افتتاح الشمعة. |  |
| `weekday(tz?)` | Day of the week, 1 = Monday ... 7 = Sunday. <br>يوم الأسبوع، من 1 = الاثنين حتى 7 = الأحد. |  |
| `monthday(tz?)` | Day of the month. <br>يوم الشهر. |  |
| `month(tz?)` | Month, 1 to 12. <br>الشهر من 1 إلى 12. |  |
| `year(tz?)` | Year. <br>السنة. |  |
| `in_session(start, end, tz?)` | yes when the bar opens inside a daily window given as hhmm; windows may cross midnight. <br>نعم إن افتُتحت الشمعة داخل فترة يومية مكتوبة hhmm؛ ويمكن أن تتجاوز الفترة منتصف الليل. | `in_session(1500, 1800, 2)` |
| `bar_minutes()` | The chart's timeframe in minutes. <br>الإطار الزمني للشارت بالدقائق. |  |
| `htf(field, minutes, back = 0)` | Open, high, low or close of a higher-timeframe bar built from the chart's bars. back 0 is the bar still forming (never future data), 1 the last finished one. <br>افتتاح أو أعلى أو أدنى أو إغلاق شمعة من إطار زمني أعلى مبنية من شموع الشارت. back = 0 الشمعة التي ما زالت تتكوّن (دون بيانات مستقبلية)، و1 آخر شمعة اكتملت. | `htf("high", 1440, 1)` |

#### Math · الرياضيات

| Function | Meaning | Example |
|---|---|---|
| `abs(x)` | Absolute value. <br>القيمة المطلقة. |  |
| `min(a, b, ...)` | Smallest value. <br>أصغر قيمة. |  |
| `max(a, b, ...)` | Largest value. <br>أكبر قيمة. |  |
| `round(x, digits = 0)` | Round to digits after the point. <br>تقريب لعدد من الخانات العشرية. |  |
| `floor(x)` | Round down. <br>تقريب لأسفل. |  |
| `ceil(x)` | Round up. <br>تقريب لأعلى. |  |
| `sqrt(x)` | Square root. <br>الجذر التربيعي. |  |
| `log(x)` | Natural logarithm. <br>اللوغاريتم الطبيعي. |  |
| `exp(x)` | e to the power x. <br>e أُس x. |  |
| `pow(a, b)` | a to the power b (same as a ^ b). <br>a أُس b (مثل a ^ b). |  |
| `clamp(x, lo, hi)` | Keep x between lo and hi. <br>حصر x بين lo و hi. |  |
| `sign(x)` | -1, 0 or 1. <br>-1 أو 0 أو 1. |  |
| `fade(color, alpha)` | Same color with opacity 0..1. <br>اللون نفسه بشفافية من 0 إلى 1. | `fade(blue, 0.4)` |

#### Arabic function names

- `متوسط` = `avg`
- `متوسط_أسي` = `ema`
- `سابق` = `prev`
- `تقاطع_صاعد` = `crossup`
- `تقاطع_هابط` = `crossdown`
- `أعلى_قيمة` = `highest`
- `أدنى_قيمة` = `lowest`
- `مجموع` = `sum`
- `انحراف` = `stdev`
- `قوة_نسبية` = `rsi`
- `مدى_حقيقي` = `atr`
- `قيمة_مطلقة` = `abs`
- `تقريب` = `round`
- `أكبر` = `max`
- `أصغر` = `min`
- `قائمة` = `list`
- `أضف` = `push`
- `اسحب` = `pop`
- `عنصر` = `get`
- `عدد` = `len`
- `خط_جديد` = `new_line`
- `صندوق_جديد` = `new_box`
- `لافتة_جديدة` = `new_label`
- `حرّك` = `move`
- `امسح` = `erase`
- `خلية` = `cell`
- `لوحة` = `panel`
- `نص` = `to_text`
- `ساعة` = `hour`
- `فريم_أعلى` = `htf`

#### Keywords and their Arabic spellings

| Keyword | All spellings |
|---|---|
| `indicator` | `indicator` `مؤشر` |
| `expert` | `expert` `خبير` |
| `overlay` | `overlay` `على_السعر` |
| `input` | `input` `مدخل` |
| `option` | `option` `خيار` |
| `info` | `info` `معلومة` |
| `let` | `let` `اجعل` |
| `keep` | `keep` `احفظ` |
| `fn` | `fn` `دالة` |
| `if` | `if` `إذا` `اذا` |
| `then` | `then` `إذن` `اذن` |
| `elif` | `elif` `وإلا_إذا` `والا_اذا` |
| `else` | `else` `وإلا` `والا` |
| `end` | `end` `نهاية` |
| `repeat` | `repeat` `كرر` |
| `from` | `from` `من` |
| `to` | `to` `إلى` `الى` |
| `draw` | `draw` `ارسم` |
| `level` | `level` `مستوى` |
| `mark` | `mark` `علامة` |
| `above` | `above` `فوق` |
| `below` | `below` `تحت` |
| `paint` | `paint` `لوّن` `لون` |
| `alert` | `alert` `نبّه` `نبه` |
| `buy` | `buy` `اشتر` `اشتري` |
| `sell` | `sell` `بع` `بيع` |
| `exit` | `exit` `اخرج` |
| `stop` | `stop` `وقف` |
| `target` | `target` `هدف` |
| `name` | `name` `باسم` |
| `color` | `color` `بلون` |
| `width` | `width` `بسمك` |
| `as` | `as` `كـ` |
| `dashed` | `dashed` `متقطع` |
| `and` | `and` `و` |
| `or` | `or` `أو` `او` |
| `not` | `not` `ليس` |
| `yes` | `yes` `true` `نعم` |
| `no` | `no` `false` `لا` |
| `none` | `none` `لاشيء` |

## Part 4. Common mistakes

### Common mistakes in Via (and the fix)

Every item below was checked against the real Via engine. When a script fails, the editor shows
the line and column of the problem, in English and Arabic.

#### Syntax from other languages

| Wrong | Right | Why |
|---|---|---|
| `close[1]` | `prev(close)` or `prev(close, 1)` | Via has no `[ ]` indexing. |
| `plot(x)` / `study("T")` | `draw x` / `indicator "T"` | Via has its own keywords. |
| `ta.sma(close, 20)` | `avg(close, 20)` | No namespaces. See the function list. |
| `var x = 0` | `keep x = 0` | `keep` is the value that lasts across bars. |
| `x = x + 1` (on a `let`) | `keep x = 0` then `x := x + 1` | `let` cannot be changed; `:=` works only on `keep`. |
| `if (a > b) { ... }` | `if a > b then` ... `end` | No braces; blocks end with `end`. |
| `a > b && c` | `a > b and c` | Logic words are `and`, `or`, `not`. |
| `x = 1; y = 2` | two lines | No semicolons, one statement per line. |
| `// comment` | `# comment` | Comments start with `#`. |
| `true` / `false` | `yes` / `no` (both work) | |
| `na`, `nz(x, 0)` | `none`, `either(x, 0)` | |
| `for i = 0 to 9` | `repeat i from 0 to 9` ... `end` | |

#### Missing values (`none`)

- The first bars of a window have no value: `avg(close, 20)` is `none` on the first 19 bars.
- Any math with `none` gives `none`; any comparison with `none` gives `no`.
- So `x == none` is **never** true. To test for a missing value use `not (x == x)`, or fill it
  with `either(x, fallback)`, or start a `keep` at `0` and test `== 0`.

#### Where statements may go

- `draw` and `level` must be at the top level, never inside `if` or `repeat`.
  To draw only on some bars: `draw cond ? value : none`.
- `input`, `option`, `info` and `fn` must be at the top level too.
- `mark`, `paint`, `alert`, orders and chart-object calls may go anywhere (usually inside `if`).
- Trading (`buy`, `sell`, `exit`, `stop`, `target`, `option`, `position`...) works only in an `expert`.
  An `indicator` can never trade.

#### Stateful functions inside `if`

`prev`, `ema`, `rsi`, `atr`, `highest`, `crossup`, `macd`, `htf` and the other window functions keep
their own history. When their input is bar data or a top-level `let`, they catch up on bars where
their line did not run. When their input is itself computed only inside an `if`, it has gaps and the
result is wrong. The simple rule that is always right: compute them in a top-level `let` and use the
name inside the `if`.

```via
indicator "Rule: stateful calls at the top level" overlay

let trend = ema(close, 50)
let high5 = prev(high, 5)
let upCross = crossup(close, trend)

if upCross then
  new_label(bar, high, to_text(high5, 2), none, "above", gray)
end
```

The condition of a top-level `if` runs on every bar, so `if crossup(a, b) then` is also fine.

#### Several return values

`macd`, `bands`, `stoch` and `adx` return several series. Unpack them with exactly that many names:

```via
let (line, signal, hist) = macd(close, 12, 26, 9)
let (upper, middle, lower) = bands(close, 20, 2)      # upper first
let (k, d) = stoch(14, 3, 3)
let (adxValue, plusDi, minusDi) = adx(14)             # adx first
```

#### Names

- A name cannot be defined twice, and cannot reuse a built-in or keyword: `close`, `high`, `low`,
  `open`, `volume`, `time`, `bar`, `last`, `median`, `typical`, `avg`, `ema`, `blue`, `gold`...
- Words that are keywords even though they look like names: `name`, `color`, `width`, `as`,
  `dashed`, `level`, `mark`, `paint`, `alert`, `stop`, `target`, `exit`, `from`, `to`, `end`,
  `input`, `option`, `info`, `above`, `below`. Use `stopPrice`, `targetPrice`, `lineWidth`...
- Names are case-sensitive. Arabic names work.
- `fn` must be defined before the line that uses it.

#### Loops and lists

- `repeat i from a to b` includes both ends and **counts down when a > b**. On an empty list,
  `repeat k from 0 to len(xs) - 1` runs for `k = 0` and `k = -1`. Guard it:
  `if len(xs) > 0 then` ... `end`.
- When you remove items while walking a list, walk backwards: `repeat k from len(xs) - 1 to 0`.
- Make lists with `keep xs = list()` (a `let` list would be new on every bar).
- At most 5,000 loop steps per bar and 5 million operations per run.

#### Marks, labels and objects

- `mark` keeps the **first** 500 marks of the chart; later ones are dropped (with a warning).
  For signals that happen often, use `new_label(bar, price, "text", none, "above", color)`:
  lines, boxes and labels keep the **newest** 500 and remove the oldest.
- Keep an object's id with `keep id = none` so you can `move`, `stretch`, `retext`, `recolor` or
  `erase` it later. Calls on an erased or `none` id do nothing, and `exists(id)` tells you if it is still there.
- Points are a bar number and a price. `bar` is this bar, `bar - 5` five bars back, `bar + 10`
  ten bars into the future.

#### Signals that fire every bar

`close > lvl` is yes on every bar above the level. For a one-time signal use
`crossup(close, lvl)` or `cond and not prev(cond)`.

#### Look-ahead

`close > highest(high, 20)` can never be true: this bar's own high is in the window. Compare with
the window that ends one bar earlier: `close > prev(highest(high, 20))`. `htf(field, minutes, 1)`
is the last finished higher-timeframe bar; `htf(field, minutes)` is the bar still forming.

#### Experts

- Orders fill at the **next bar's open**, not at this bar's close.
- `stop` and `target` written on the same bar as `buy`/`sell` apply to the new trade. Written while a
  trade is open, they move that trade's stop or target. If both are hit inside one bar, the stop wins.
- `buy` while already long does nothing (no pyramiding). `sell` while long closes the long and
  opens a short, unless `option shorts = no`.
- `buy 50` means 50% of equity. Sizes above 100 are capped at 100.
- A backtest is a test on past data, never a promise of profit.

#### Colours

Named colours (`blue white ink gray sky gold sand rose mint violet`) adapt to light and dark mode.
Hex colours (`#1f4fd1`, `#1f4fd180` with opacity) are used exactly as written. `fade(color, 0.3)`
sets opacity. `none` or `#rrggbb00` is see-through.

## Part 5. Pine Script to Via

### Moving from Pine Script to Via

Many traders already know Pine Script. This page maps the common Pine ideas to Via so you (or your AI
assistant) can rewrite an idea in Via. Via is a different, smaller language: rewrite the logic, do not
copy lines. Only port code you wrote yourself or code whose licence allows it.

#### Script header and settings

| Pine | Via |
|---|---|
| `//@version=5` | not needed |
| `indicator("My study", overlay=true)` | `indicator "My study" overlay` |
| `strategy("My strategy", initial_capital=10000, commission_value=0.1, default_qty_type=strategy.percent_of_equity, default_qty_value=100)` | `expert "My strategy"` then `option capital = 10000`, `option fee = 0.1`, `option size = 100` |
| `input.int(14, "Length", minval=1, maxval=100)` | `input length = 14 "Length" 1..100` |
| `input.float(2.0, "Mult")` | `input mult = 2 "Mult"` |
| `input.bool(true, "Show")` | `input show = yes "Show"` |
| `input.color(color.blue, "Colour")` | `input lineColor = #7480ff "Colour"` |
| `input.string("EMA", "Type", options=["SMA","EMA"])` | `input kind = 1 "Type" options "SMA\|EMA"` (the value is the position: 0, 1...) |
| `input.time(timestamp("2024-01-01"), "Start")` | `input start = time "2024-01-01" "Start"` (0 when empty) |
| `input.source(close, "Source")` | `input src = 3 "Source" options "Open\|High\|Low\|Close"` then pick with `?:` |
| `group="Section"` | `group "Section"` |

#### Values and variables

| Pine | Via |
|---|---|
| `x = ta.sma(close, 20)` | `let x = avg(close, 20)` |
| `var float count = 0` | `keep count = 0` |
| `count := count + 1` | `count := count + 1` (only on `keep`) |
| `close[1]`, `x[3]` | `prev(close)`, `prev(x, 3)` |
| `na`, `nz(x, 0)` | `none`, `either(x, 0)` |
| `na(x)` | `not (x == x)` |
| `true`, `false` | `yes`, `no` (or `true`, `false`) |
| `and`, `or`, `not` | same |
| `math.pow(a, b)` | `a ^ b` or `pow(a, b)` |
| `cond ? a : b` | same |
| `f(x) => x * 2` | `fn f(x) = x * 2` (one expression, defined before use) |
| `if c` ... (indent) / `else if` / `else` | `if c then` ... `elif c2 then` ... `else` ... `end` |
| `for i = 0 to 9` | `repeat i from 0 to 9` ... `end` |
| `switch` | nested `?:` or `if / elif` |
| `while` | not available; use `repeat` with a fixed range |
| `float`, `int`, `bool`, `string` types | no type names; values just have a kind |

#### Built-in data

| Pine | Via |
|---|---|
| `open high low close volume` | same |
| `time` | `time` (bar open time, ms since 1970 UTC) |
| `bar_index` | `bar` (0 = oldest loaded bar) |
| `hl2`, `hlc3` | `median`, `typical` |
| `barstate.islast` | `last` |
| `timeframe.multiplier` / `timeframe.in_seconds()` | `bar_minutes()` |
| `hour`, `minute`, `dayofmonth`, `month`, `year` | `hour(tz)`, `minute(tz)`, `monthday(tz)`, `month(tz)`, `year(tz)`; `tz` = hours from UTC |
| `dayofweek` (Sunday = 1) | `weekday(tz)` (**Monday = 1** ... Sunday = 7) |
| `time(timeframe.period, "0700-0800")` | `in_session(700, 800, tz)` |
| `request.security(syminfo.tickerid, "D", high[1], lookahead=barmerge.lookahead_on)` | `htf("high", 1440, 1)` (same symbol, open/high/low/close only) |

#### Technical functions

| Pine | Via | Note |
|---|---|---|
| `ta.sma` `ta.ema` `ta.wma` `ta.rma` `ta.hma` | `avg` `ema` `wma` `smooth` `hull` | |
| `ta.vwap` | `vwap()` | resets each UTC day |
| `ta.highest` `ta.lowest` `ta.stdev` `ta.median` `math.sum` | `highest` `lowest` `stdev` `median_of` `sum` | |
| `ta.highestbars(x, n)` | `-since_high(x, n)` | Via counts bars back as a positive number |
| `ta.change(x, n)` / `ta.roc(x, n)` / `ta.mom(x, n)` | `change(x, n)` / `pct(x, n)` / `momentum(x, n)` | |
| `ta.crossover` / `ta.crossunder` | `crossup` / `crossdown` | |
| `ta.rising` / `ta.falling` | `rising` / `falling` | |
| `ta.barssince(c)` | `bars_since(c)` | |
| `ta.rsi(x, n)` `ta.atr(n)` `ta.tr` | `rsi(x, n)` `atr(n)` `true_range()` | |
| `[m, s, h] = ta.macd(x, 12, 26, 9)` | `let (m, s, h) = macd(x, 12, 26, 9)` | |
| `[mid, up, lo] = ta.bb(x, 20, 2)` | `let (up, mid, lo) = bands(x, 20, 2)` | **order differs: upper first** |
| `[plus, minus, a] = ta.dmi(14, 14)` | `let (a, plus, minus) = adx(14)` | **order differs: adx first** |
| `ta.stoch` + smoothing | `let (k, d) = stoch(14, 3, 3)` | Via returns the smoothed %K and %D |
| `ta.cci` `ta.mfi` `ta.obv` `ta.wpr` | `cci(n)` `mfi(n)` `obv()` `willr(n)` | `cci` uses the typical price |
| `math.abs/min/max/round/floor/ceil/sqrt/log/exp/sign` | `abs min max round floor ceil sqrt log exp sign` | `round(x, digits)` |
| `str.tostring(x, "#.##")` | `to_text(x, 2)` | join text with `+` |

#### Drawing

| Pine | Via |
|---|---|
| `plot(x, "Name", color.blue, 2)` | `draw x name "Name" color blue width 2` (top level only) |
| `plot(..., style=plot.style_columns / histogram)` | `as columns` |
| `style_circles` / `style_area` / `style_stepline` | `as dots` / `as area` / `as steps` |
| `plot(cond ? x : na)` | `draw cond ? x : none` |
| `hline(70, "OB")` | `level 70 name "OB" dashed` |
| `plotshape(cond, location=location.belowbar, text="B")` | `if cond then mark below "B" color blue` |
| `barcolor(c)` | `paint c` |
| `color.new(c, 80)` (80 = transparency) | `fade(c, 0.2)` (0.2 = opacity) |
| `line.new(x1, y1, x2, y2)` with `bar_index` | `new_line(bar1, price1, bar2, price2, color, width, style, extend)` |
| `box.new(left, top, right, bottom)` | `new_box(bar1, top, bar2, bottom, color, fill, text)` |
| `label.new(bar_index, high, "T")` | `new_label(bar, high, "T", color, "above", textColor)` |
| `line.set_xy2` / `box.set_right` | `move(id, ...)` / `stretch(id, bar)` |
| `label.set_text` / `*.set_color` / `*.delete` | `retext` / `recolor` / `erase` |
| `line.get_price`-style reads | `x1_of y1_of x2_of y2_of` |
| `table.new(position.top_right, ...)` + `table.cell(t, column, row, text)` | `panel("top_right")` + `cell(row, column, text, color, background)` (**row first**) |
| `bgcolor`, `fill` | not available yet; use `paint` or a box |

#### Lists (arrays)

| Pine | Via |
|---|---|
| `var a = array.new_float()` | `keep a = list()` |
| `array.push` / `array.unshift` | `push` / `push_front` |
| `array.pop` / `array.shift` | `pop` / `pop_front` |
| `array.get(a, i)` / `array.set` / `array.remove` | `get(a, i)` (`-1` = last) / `put` / `remove` |
| `array.size` / `array.clear` | `len` / `clear` |
| `array.max` / `array.min` / `array.sum` | `list_max` / `list_min` / `list_sum` |

#### Alerts

| Pine | Via |
|---|---|
| `alertcondition(cond, "T", "msg")` / `alert("msg")` | `if cond then alert "msg {close}"` |
| `str.tostring(close)` inside the message | `{close}` or `{anyLetName}` placeholders |

#### Strategies (experts)

| Pine | Via |
|---|---|
| `strategy.entry("L", strategy.long)` | `buy` (or `buy 50` for 50% of equity) |
| `strategy.entry("S", strategy.short)` | `sell` |
| `strategy.close_all()` / `strategy.close("L")` | `exit` |
| `strategy.exit("x", stop=s, limit=t)` | `stop s` and `target t` |
| `strategy.position_size > 0` / `< 0` / `== 0` | `position == 1` / `-1` / `0` |
| `strategy.position_avg_price` | `entry_price` |
| `strategy.equity` / `strategy.openprofit` | `equity` / `profit` |
| `pyramiding`, partial exits, limit entries | not available: one position at a time, market orders at the next bar's open |

#### Not available in Via (yet)

Other symbols in one script, tick data, `bgcolor`/`fill`, plot offsets, polylines, matrices and maps,
user-defined types and methods, libraries/imports, `while` loops, and changing a past bar's plot.
Write around them or keep the idea simpler.

## Part 6. Examples: Basics

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

### bands-squeeze

Volatility bands with squeeze highlight

نطاقات التذبذب مع إبراز الانضغاط

```via
# en: Volatility bands with squeeze highlight
# ar: نطاقات التذبذب مع إبراز الانضغاط

indicator "Bands squeeze" overlay

input length = 20 "Length" 5..200
input dev = 2 "Width (deviations)"

let (up, mid, dn) = bands(close, length, dev)
let spread = (up - dn) / mid * 100
let tight = spread < lowest(spread, 120) * 1.1

draw up name "Upper" color fade(blue, 0.8)
draw mid name "Middle" color gray
draw dn name "Lower" color fade(blue, 0.8)

if tight then paint fade(gold, 0.35)
if tight and not prev(tight) then mark above "squeeze" color gold
```

### macd-columns

MACD with colored histogram

ماكد مع مدرّج تكراري ملوّن

```via
# en: MACD with colored histogram
# ar: ماكد مع مدرّج تكراري ملوّن

indicator "MACD columns"

input fast = 12
input slow = 26
input signal = 9

let (line, sig, hist) = macd(close, fast, slow, signal)
let growing = hist > prev(hist)

draw hist name "Histogram" as columns color hist >= 0 ? (growing ? blue : fade(blue, 0.5)) : (growing ? fade(rose, 0.5) : rose)
draw line name "MACD" color white
draw sig name "Signal" color gold
level 0 color fade(gray, 0.5)
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

### arabic

A full script written in Arabic

سكربت كامل مكتوب بالعربية

```via
# en: A full script written in Arabic
# ar: سكربت كامل مكتوب بالعربية

مؤشر "اتجاه السعر" على_السعر

مدخل الفترة = 50 "فترة المتوسط" 5..400

اجعل المتوسط = متوسط(إغلاق, الفترة)
اجعل فوقه = إغلاق > المتوسط

ارسم المتوسط باسم "المتوسط" بلون فوقه ? أزرق : رمادي بسمك 2

إذا تقاطع_صاعد(إغلاق, المتوسط) إذن
  علامة تحت "صعود" بلون أزرق
  نبّه "تجاوز السعر المتوسط صعودًا عند {إغلاق}"
نهاية
```

### swing-structure

Swing structure with zones and a panel (Via 0.2)

هيكل القمم والقيعان مع مناطق ولوحة (ڤيا 0.2)

```via
# en: Swing structure with zones and a panel (Via 0.2)
# ar: هيكل القمم والقيعان مع مناطق ولوحة (ڤيا 0.2)

indicator "Swing structure" overlay

input n = 5 "Swing strength" 2..30
input maxZones = 5 "Zones to keep" 1..20

# a swing high is the highest high of 2n+1 bars, found n bars after it happened
let ph = prev(high, n)
let pl = prev(low, n)
let bodyLow = prev(min(open, close), n)
let isHigh = bar >= 2 * n and highest(high, 2 * n + 1) == ph
let isLow = bar >= 2 * n and lowest(low, 2 * n + 1) == pl

keep lastHigh = none
keep lastLow = none
keep highLine = none
keep lowLine = none
keep trend = 0
keep zones = list()

if isHigh then
  new_label(bar - n, ph, ph > either(lastHigh, ph) ? "HH" : "LH", ph > either(lastHigh, ph) ? white : gray, "above")
  lastHigh := ph
  erase(highLine)
  highLine := new_line(bar - n, ph, bar, ph, gray, 1, "dashed", "right")
end

if isLow then
  new_label(bar - n, pl, pl < either(lastLow, pl) ? "LL" : "HL", pl < either(lastLow, pl) ? rose : blue, "below")
  lastLow := pl
  erase(lowLine)
  lowLine := new_line(bar - n, pl, bar, pl, gray, 1, "dashed", "right")
  # demand zone: from the swing low up to that candle's body
  push(zones, new_box(bar - n, bodyLow, bar, pl, blue, fade(blue, 0.12)))
  if len(zones) > maxZones then erase(pop_front(zones))
end

# keep zones running to the current bar until price closes below them
if len(zones) > 0 then
  repeat k from len(zones) - 1 to 0
    if close < y2_of(get(zones, k)) then
      erase(remove(zones, k))
    else
      stretch(get(zones, k), bar)
    end
  end
end

if close > lastHigh and trend != 1 then
  trend := 1
  mark below "▲" color white
  alert "Broke above the last swing high at {close}"
end
if close < lastLow and trend != -1 then
  trend := -1
  mark above "▼" color rose
  alert "Broke below the last swing low at {close}"
end

cell(0, 0, "Trend", gray)
cell(0, 1, trend == 1 ? "Up" : trend == -1 ? "Down" : "-", white, trend == 1 ? fade(blue, 0.5) : trend == -1 ? fade(rose, 0.5) : none)
cell(1, 0, "Last high", gray)
cell(1, 1, to_text(lastHigh, 2))
cell(2, 0, "Last low", gray)
cell(2, 1, to_text(lastLow, 2))
cell(3, 0, "Zones", gray)
cell(3, 1, len(zones))
```

### expert-average-cross

Expert: trade the average cross

خبير: تداول تقاطع المتوسطات

```via
# en: Expert: trade the average cross
# ar: خبير: تداول تقاطع المتوسطات

expert "Average cross"

option capital = 10000
option fee = 0.1
option size = 100

input fast = 9 "Fast" 1..200
input slow = 21 "Slow" 2..400

let a = ema(close, fast)
let b = ema(close, slow)
draw a name "Fast" color blue
draw b name "Slow" color white

if crossup(a, b) then buy
if crossdown(a, b) then sell
```

### expert-rsi-reversion

Expert: RSI mean reversion with stop and target

خبير: الارتداد بمؤشر القوة النسبية مع وقف وهدف

```via
# en: Expert: RSI mean reversion with stop and target
# ar: خبير: الارتداد بمؤشر القوة النسبية مع وقف وهدف

expert "RSI reversion"

option capital = 10000
option fee = 0.1
option shorts = no

input length = 14
input entry = 30 "Buy below" 5..50
input stop_pct = 3 "Stop %" 0.5..20
input target_pct = 6 "Target %" 0.5..50

let r = rsi(close, length)

if position == 0 and crossup(r, entry) then
  buy
  stop close * (1 - stop_pct / 100)
  target close * (1 + target_pct / 100)
  mark below "buy" color blue
end

if position == 1 and r > 70 then exit
```

### expert-breakout

Expert: channel breakout with ATR stop

خبير: اختراق القناة مع وقف بالـ ATR

```via
# en: Expert: channel breakout with ATR stop
# ar: خبير: اختراق القناة مع وقف بالـ ATR

expert "Channel breakout"

option capital = 10000
option fee = 0.1

input length = 20 "Channel length" 5..200
input risk = 2 "ATR stop multiple"

let top = prev(highest(high, length))
let bottom = prev(lowest(low, length))
let range = atr(14)

draw top name "Top" color fade(blue, 0.7) as steps
draw bottom name "Bottom" color fade(rose, 0.7) as steps

if close > top and position <= 0 then
  buy
  stop close - range * risk
end
if close < bottom and position >= 0 then
  sell
  stop close + range * risk
end
```

## Part 6. Examples: Indicators (analysis and drawing only)

### anchored-vwap-from-date

Anchored VWAP and range from a date you pick on a calendar

VWAP مثبّت ونطاق من تاريخ تختاره من التقويم

```via
# en: Anchored VWAP and range from a date you pick on a calendar
# ar: VWAP مثبّت ونطاق من تاريخ تختاره من التقويم
# shows: time inputs (date pickers), 0 = no date picked, keep sums that grow bar by bar
indicator "Anchored VWAP from a date" overlay

input start = time "From (empty = first loaded bar)"
input finish = time "Until (empty = now)"

let inRange = (start == 0 or time >= start) and (finish == 0 or time <= finish)

keep pv = 0
keep vv = 0
keep hi = 0
keep lo = 0

if inRange then
  pv := pv + typical * volume
  vv := vv + volume
  hi := hi == 0 ? high : max(hi, high)
  lo := lo == 0 ? low : min(lo, low)
end

draw inRange and vv > 0 ? pv / vv : none name "Anchored VWAP" color blue width 2
draw inRange ? hi : none name "Range high" color fade(gray, 0.7) as steps
draw inRange ? lo : none name "Range low" color fade(gray, 0.7) as steps
```

### arabic-rsi-alerts

An indicator written fully in Arabic keywords: RSI with zones, marks and alerts

مؤشر مكتوب كله بالكلمات العربية: القوة النسبية بمناطقها وعلاماتها وتنبيهاتها

```via
# en: An indicator written fully in Arabic keywords: RSI with zones, marks and alerts
# ar: مؤشر مكتوب كله بالكلمات العربية: القوة النسبية بمناطقها وعلاماتها وتنبيهاتها
# shows: Arabic keywords, Arabic series and function names, Arabic variable names
مؤشر "القوة النسبية بالعربي"

مدخل الطول = 14 "طول المؤشر" 2..100
مدخل فوق_الشراء = 70 "منطقة التشبع الشرائي" 50..100
مدخل تحت_البيع = 30 "منطقة التشبع البيعي" 0..50

اجعل ق = قوة_نسبية(إغلاق, الطول)
اجعل متوسطها = متوسط(ق, 9)

ارسم ق باسم "القوة النسبية" بلون أزرق بسمك 2
ارسم متوسطها باسم "متوسطها" بلون رمادي
مستوى فوق_الشراء باسم "تشبع شرائي" بلون وردي متقطع
مستوى تحت_البيع باسم "تشبع بيعي" بلون أخضر متقطع

اجعل خروج_من_التشبع = تقاطع_صاعد(ق, تحت_البيع)
اجعل خروج_من_الشراء = تقاطع_هابط(ق, فوق_الشراء)

إذا خروج_من_التشبع إذن
  علامة تحت "▲" بلون أزرق
  نبّه "خرجت القوة النسبية من التشبع البيعي: {ق}"
نهاية
إذا خروج_من_الشراء إذن
  علامة فوق "▼" بلون وردي
  نبّه "خرجت القوة النسبية من التشبع الشرائي: {ق}"
نهاية
```

### auto-fibonacci

Automatic Fibonacci retracement of the last swing, redrawn on the newest bar

فيبوناتشي تلقائي على آخر موجة، يُعاد رسمه على آخر شمعة

```via
# en: Automatic Fibonacci retracement of the last swing, redrawn on the newest bar
# ar: فيبوناتشي تلقائي على آخر موجة، يُعاد رسمه على آخر شمعة
# shows: since_high()/since_low(), a list of levels, repeat over a list, a pure fn, lines + labels
indicator "Auto Fibonacci" overlay

input lookback = 100 "Bars to look back" 10..2000
input extendRight = yes "Extend lines to the right"

let hi = highest(high, lookback)
let lo = lowest(low, lookback)
let hiAgo = since_high(high, lookback)
let loAgo = since_low(low, lookback)
let upMove = loAgo > hiAgo           # the low came first, so the swing is up

fn fibPrice(f, up, top, bottom) = up ? top - (top - bottom) * f : bottom + (top - bottom) * f

keep levels = list(0, 0.236, 0.382, 0.5, 0.618, 0.786, 1)

if last then
  repeat k from 0 to len(levels) - 1
    new_line(bar - max(hiAgo, loAgo), fibPrice(get(levels, k), upMove, hi, lo), bar, fibPrice(get(levels, k), upMove, hi, lo), get(levels, k) == 0.618 ? gold : fade(gray, 0.8), 1, "solid", extendRight ? "right" : "none")
    new_label(bar + 2, fibPrice(get(levels, k), upMove, hi, lo), to_text(get(levels, k) * 100, 1) + "%  " + to_text(fibPrice(get(levels, k), upMove, hi, lo), 2), none, "right", gray)
  end
end
```

### average-of-your-choice

One moving average, with its type picked from a list in the settings

متوسط متحرك واحد، تختار نوعه من قائمة في الإعدادات

```via
# en: One moving average, with its type picked from a list in the settings
# ar: متوسط متحرك واحد، تختار نوعه من قائمة في الإعدادات
# shows: input with options (a drop-down), yes/no input, input groups
indicator "Average of your choice" overlay

input length = 50 "Length" 1..500 group "Average"
input kind = 1 "Type" options "Simple|Exponential|Weighted|Wilder|Hull" group "Average"
input showCross = yes "Mark price crosses" group "Signals"

# kind is the position of the chosen item, from 0
let ma = kind == 0 ? avg(close, length) : kind == 1 ? ema(close, length) : kind == 2 ? wma(close, length) : kind == 3 ? smooth(close, length) : hull(close, length)

draw ma name "Average" color blue width 2

let upCross = crossup(close, ma)
let downCross = crossdown(close, ma)
if showCross and upCross then mark below "▲" color blue
if showCross and downCross then mark above "▼" color gray
```

### average-ribbon

Moving-average ribbon that changes colour with the trend

شريط متوسطات متحركة يتغير لونه مع الاتجاه

```via
# en: Moving-average ribbon that changes colour with the trend
# ar: شريط متوسطات متحركة يتغير لونه مع الاتجاه
# shows: several draw lines, a colour chosen by a condition, fade(), marks when the trend flips
indicator "Average ribbon" overlay

input base = 10 "Shortest length" 2..100
input gap = 10 "Step between lines" 1..50

let m1 = ema(close, base)
let m2 = ema(close, base + gap)
let m3 = ema(close, base + gap * 2)
let m4 = ema(close, base + gap * 3)
let m5 = ema(close, base + gap * 4)
let up = m1 > m5
let tone = up ? blue : gray

draw m1 name "1" color tone width 2
draw m2 name "2" color fade(tone, 0.85)
draw m3 name "3" color fade(tone, 0.7)
draw m4 name "4" color fade(tone, 0.55)
draw m5 name "5" color fade(tone, 0.4) width 2

let turnedUp = up and not prev(up)
let turnedDown = m1 < m5 and prev(up)

if turnedUp then
  mark below "▲" color blue
  alert "Ribbon turned up at {close}"
end
if turnedDown then
  mark above "▼" color gray
  alert "Ribbon turned down at {close}"
end
```

### candle-patterns

Classic candle patterns: engulfing, hammer, shooting star and inside bar

أنماط شموع كلاسيكية: الابتلاعية والمطرقة والشهاب والشمعة الداخلية

```via
# en: Classic candle patterns: engulfing, hammer, shooting star and inside bar
# ar: أنماط شموع كلاسيكية: الابتلاعية والمطرقة والشهاب والشمعة الداخلية
# shows: candle anatomy with let, yes/no inputs, new_label for frequent signals (keeps the newest 500), paint
indicator "Candle patterns" overlay

input useEngulf = yes "Engulfing"
input useHammer = yes "Hammer and shooting star"
input useInside = no "Inside bar"

let body = abs(close - open)
let size = high - low
let upperWick = high - max(open, close)
let lowerWick = min(open, close) - low
let po = prev(open)
let pc = prev(close)
let ph = prev(high)
let pl = prev(low)
# Patterns can be frequent. mark keeps only the first 500 marks of the chart, so the newest bars would
# lose theirs; new_label keeps the newest 500 instead.
let bigEnough = size > atr(14) * 0.8   # ignore tiny candles

let bullEngulf = bigEnough and close > open and pc < po and close >= po and open <= pc
let bearEngulf = bigEnough and close < open and pc > po and close <= po and open >= pc
let hammer = bigEnough and body > 0 and lowerWick >= body * 2 and upperWick <= body * 0.3
let star = bigEnough and body > 0 and upperWick >= body * 2 and lowerWick <= body * 0.3
let inside = high < ph and low > pl

if useEngulf and bullEngulf then
  new_label(bar, low, "Engulf", none, "below", blue)
  alert "Bullish engulfing at {close}"
end
if useEngulf and bearEngulf then
  new_label(bar, high, "Engulf", none, "above", rose)
  alert "Bearish engulfing at {close}"
end
if useHammer and hammer then new_label(bar, low, "Hammer", none, "below", sky)
if useHammer and star then new_label(bar, high, "Star", none, "above", gold)
if useInside and inside then paint fade(violet, 0.6)
```

### daily-average-any-timeframe

A moving average of daily closes that you can see on any intraday chart

متوسط متحرك لإغلاقات الأيام تراه على أي إطار زمني أقل من يوم

```via
# en: A moving average of daily closes that you can see on any intraday chart
# ar: متوسط متحرك لإغلاقات الأيام تراه على أي إطار زمني أقل من يوم
# shows: detecting a new day, keeping a list of values, list_sum() / len()
indicator "Daily average on any timeframe" overlay

input days = 20 "Days" 1..200

let md = monthday()
let newDay = md != prev(md)
let yesterdayClose = htf("close", 1440, 1)

keep closes = list()
keep dailyAvg = none

if newDay and yesterdayClose > 0 then
  push(closes, yesterdayClose)
  if len(closes) > days then pop_front(closes)
  if len(closes) == days then dailyAvg := list_sum(closes) / len(closes)
end

draw dailyAvg name "Daily average" color gold width 2 as steps
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

### heikin-ashi-trend

Heikin Ashi trend: colours the normal candles by the smoothed Heikin Ashi direction

اتجاه هايكن آشي: يلوّن الشموع العادية حسب اتجاه هايكن آشي

```via
# en: Heikin Ashi trend: colours the normal candles by the smoothed Heikin Ashi direction
# ar: اتجاه هايكن آشي: يلوّن الشموع العادية حسب اتجاه هايكن آشي
# shows: keep for a value that depends on its own previous value, paint, alerts on colour change
indicator "Heikin Ashi trend" overlay

let haClose = (open + high + low + close) / 4
let prevHaClose = prev(haClose)

keep haOpen = (open + close) / 2
if bar > 0 then haOpen := (haOpen + prevHaClose) / 2

let haUp = haClose > haOpen
paint haUp ? blue : gray

let flippedUp = haUp and not prev(haUp)
let flippedDown = not haUp and prev(haUp)
if flippedUp then alert "Heikin Ashi turned up at {close}"
if flippedDown then alert "Heikin Ashi turned down at {close}"
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

### previous-day-levels

Yesterday's high, low and close, today's open and last week's range on any intraday chart

أعلى وأدنى وإغلاق الأمس، وافتتاح اليوم، ونطاق الأسبوع الماضي على أي إطار زمني أقل من يوم

```via
# en: Yesterday's high, low and close, today's open and last week's range on any intraday chart
# ar: أعلى وأدنى وإغلاق الأمس، وافتتاح اليوم، ونطاق الأسبوع الماضي على أي إطار زمني أقل من يوم
# shows: htf() for higher-timeframe values without look-ahead, draw as steps, crossing alerts
indicator "Previous day levels" overlay

input showWeek = yes "Show last week's high and low"

let pdh = htf("high", 1440, 1)       # 1 = the last finished day
let pdl = htf("low", 1440, 1)
let pdc = htf("close", 1440, 1)
let todayOpen = htf("open", 1440)    # 0 = the day still forming
let pwh = htf("high", 10080, 1)
let pwl = htf("low", 10080, 1)
let intraday = bar_minutes() < 1440

draw intraday ? pdh : none name "Yesterday high" color gold as steps
draw intraday ? pdl : none name "Yesterday low" color gold as steps
draw intraday ? pdc : none name "Yesterday close" color fade(gray, 0.7) as steps
draw intraday ? todayOpen : none name "Today open" color fade(white, 0.5) as steps
draw intraday and showWeek ? pwh : none name "Last week high" color violet as steps width 2
draw intraday and showWeek ? pwl : none name "Last week low" color violet as steps width 2

let breakUp = crossup(close, pdh)
let breakDown = crossdown(close, pdl)
if intraday and breakUp then
  mark below "PDH" color gold
  alert "Closed above yesterday's high: {close}"
end
if intraday and breakDown then
  mark above "PDL" color gold
  alert "Closed below yesterday's low: {close}"
end
```

### session-ranges

Asia, London and New York session ranges as boxes

نطاقات جلسات آسيا ولندن ونيويورك كصناديق

```via
# en: Asia, London and New York session ranges as boxes
# ar: نطاقات جلسات آسيا ولندن ونيويورك كصناديق
# shows: in_session() with a time zone, keep + move() to grow a box while the session runs
indicator "Session ranges" overlay

input tz = 0 "Time zone of the hours below (hours from UTC)" -12..14 group "Sessions"
input asiaStart = 0 "Asia start (hhmm)" 0..2359 group "Sessions"
input asiaEnd = 800 "Asia end (hhmm)" 0..2359 group "Sessions"
input londonStart = 700 "London start (hhmm)" 0..2359 group "Sessions"
input londonEnd = 1600 "London end (hhmm)" 0..2359 group "Sessions"
input nyStart = 1300 "New York start (hhmm)" 0..2359 group "Sessions"
input nyEnd = 2200 "New York end (hhmm)" 0..2359 group "Sessions"

let inAsia = in_session(asiaStart, asiaEnd, tz)
let inLondon = in_session(londonStart, londonEnd, tz)
let inNy = in_session(nyStart, nyEnd, tz)

keep asiaBox = none
keep asiaHi = 0
keep asiaLo = 0
if inAsia and not prev(inAsia) then
  asiaHi := high
  asiaLo := low
  asiaBox := new_box(bar, high, bar, low, sky, fade(sky, 0.08), "Asia")
elif inAsia then
  asiaHi := max(asiaHi, high)
  asiaLo := min(asiaLo, low)
  move(asiaBox, x1_of(asiaBox), asiaHi, bar, asiaLo)
end

keep londonBox = none
keep londonHi = 0
keep londonLo = 0
if inLondon and not prev(inLondon) then
  londonHi := high
  londonLo := low
  londonBox := new_box(bar, high, bar, low, blue, fade(blue, 0.08), "London")
elif inLondon then
  londonHi := max(londonHi, high)
  londonLo := min(londonLo, low)
  move(londonBox, x1_of(londonBox), londonHi, bar, londonLo)
end

keep nyBox = none
keep nyHi = 0
keep nyLo = 0
if inNy and not prev(inNy) then
  nyHi := high
  nyLo := low
  nyBox := new_box(bar, high, bar, low, gold, fade(gold, 0.08), "New York")
elif inNy then
  nyHi := max(nyHi, high)
  nyLo := min(nyLo, low)
  move(nyBox, x1_of(nyBox), nyHi, bar, nyLo)
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

### supply-demand-zones

Supply and demand zones: the candle before a strong move, kept until price closes through it

مناطق العرض والطلب: الشمعة التي تسبق حركة قوية، وتبقى حتى يُغلق السعر متجاوزًا إياها

```via
# en: Supply and demand zones: the candle before a strong move, kept until price closes through it
# ar: مناطق العرض والطلب: الشمعة التي تسبق حركة قوية، وتبقى حتى يُغلق السعر متجاوزًا إياها
# shows: impulse detection with ATR, boxes with text, removing broken zones, alerts on touch
indicator "Supply and demand zones" overlay

input k = 1.5 "Strong move = body bigger than (x ATR)" 0.5..5
input maxKeep = 8 "Zones to keep on each side" 1..30

let a = atr(14)
let body = abs(close - open)
let strongUp = close > open and body > a * k
let strongDown = close < open and body > a * k
let ph = prev(high)
let pl = prev(low)

keep demand = list()
keep supply = list()

if strongUp then push(demand, new_box(bar - 1, ph, bar, pl, blue, fade(blue, 0.15), "Demand"))
if strongDown then push(supply, new_box(bar - 1, ph, bar, pl, rose, fade(rose, 0.12), "Supply"))
if len(demand) > maxKeep then erase(pop_front(demand))
if len(supply) > maxKeep then erase(pop_front(supply))

if len(demand) > 0 then
  repeat i from len(demand) - 1 to 0
    if close < y2_of(get(demand, i)) then
      erase(remove(demand, i))
    else
      stretch(get(demand, i), bar)
    end
  end
end
if len(supply) > 0 then
  repeat i from len(supply) - 1 to 0
    if close > y1_of(get(supply, i)) then
      erase(remove(supply, i))
    else
      stretch(get(supply, i), bar)
    end
  end
end

# alert when price dips into the newest demand zone
let inDemand = len(demand) > 0 and low <= y1_of(get(demand, -1)) and close >= y2_of(get(demand, -1))
if inDemand and not prev(inDemand) then alert "Price is back in a demand zone at {close}"
```

### support-resistance-lines

Support and resistance lines from recent swings, extended to the right

خطوط دعم ومقاومة من آخر القمم والقيعان، ممتدة لليمين

```via
# en: Support and resistance lines from recent swings, extended to the right
# ar: خطوط دعم ومقاومة من آخر القمم والقيعان، ممتدة لليمين
# shows: new_line() with extend "right", capping how many objects you keep, recolor() on the newest bar
indicator "Support and resistance lines" overlay

input swing = 10 "Swing size (bars on each side)" 2..50
input count = 6 "Lines to keep" 1..30

let isHigh = prev(high, swing) == highest(high, swing * 2 + 1)
let isLow = prev(low, swing) == lowest(low, swing * 2 + 1)
let swingHigh = prev(high, swing)
let swingLow = prev(low, swing)

keep lines = list()

if isHigh then push(lines, new_line(bar - swing, swingHigh, bar, swingHigh, rose, 1, "solid", "right"))
if isLow then push(lines, new_line(bar - swing, swingLow, bar, swingLow, blue, 1, "solid", "right"))
if len(lines) > count then erase(pop_front(lines))

# on the newest bar: blue = below price (support), rose = above price (resistance)
if last and len(lines) > 0 then
  repeat k from 0 to len(lines) - 1
    recolor(get(lines, k), close > y1_of(get(lines, k)) ? blue : rose)
  end
end
```

### swing-labels

Swing highs and lows labelled HH, LH, HL and LL

القمم والقيعان مكتوب عليها HH و LH و HL و LL

```via
# en: Swing highs and lows labelled HH, LH, HL and LL
# ar: القمم والقيعان مكتوب عليها HH و LH و HL و LL
# shows: pivot detection with prev() + highest(), new_label(), keep to remember the last swing
indicator "Swing labels" overlay

input side = 5 "Bars on each side of a swing" 1..50

# a swing high is confirmed `side` bars later: the bar `side` bars ago is the highest of the window
let isHigh = prev(high, side) == highest(high, side * 2 + 1)
let isLow = prev(low, side) == lowest(low, side * 2 + 1)
let swingHigh = prev(high, side)
let swingLow = prev(low, side)

keep lastHigh = 0
keep lastLow = 0

if isHigh then
  new_label(bar - side, swingHigh, lastHigh == 0 ? "H" : swingHigh > lastHigh ? "HH" : "LH", none, "above", gold)
  lastHigh := swingHigh
end
if isLow then
  new_label(bar - side, swingLow, lastLow == 0 ? "L" : swingLow > lastLow ? "HL" : "LL", none, "below", sky)
  lastLow := swingLow
end
```

### trend-pullback-alerts

Alerts for pullbacks inside a trend: RSI dips and recovers while the 50 average is above the 200

تنبيهات للتصحيح داخل الاتجاه: RSI ينخفض ثم يعود والمتوسط 50 فوق الـ 200

```via
# en: Alerts for pullbacks inside a trend: RSI dips and recovers while the 50 average is above the 200
# ar: تنبيهات للتصحيح داخل الاتجاه: RSI ينخفض ثم يعود والمتوسط 50 فوق الـ 200
# shows: combining conditions, alert messages with {placeholders}, marks
indicator "Trend pullback alerts" overlay

input rsiLen = 14 "RSI length" 2..100
input dip = 40 "Pullback RSI level (uptrend)" 10..50
input pop = 60 "Pullback RSI level (downtrend)" 50..90

let fast = ema(close, 50)
let slow = ema(close, 200)
let r = rsi(close, rsiLen)
let upTrend = fast > slow
let downTrend = fast < slow

let longSetup = upTrend and crossup(r, dip)
let shortSetup = downTrend and crossdown(r, pop)

draw fast name "EMA 50" color blue
draw slow name "EMA 200" color white width 2

if longSetup then
  mark below "Buy dip" color blue
  alert "Uptrend pullback finished: close {close}, RSI {r}"
end
if shortSetup then
  mark above "Sell rally" color rose
  alert "Downtrend rally finished: close {close}, RSI {r}"
end
```

### volume-spikes

Volume columns with unusual spikes highlighted

أعمدة الحجم مع إبراز الأحجام غير العادية

```via
# en: Volume columns with unusual spikes highlighted
# ar: أعمدة الحجم مع إبراز الأحجام غير العادية
# shows: draw as columns with a colour per bar, a separate pane (no overlay), alerts with values
indicator "Volume spikes"

input length = 20 "Average length" 2..200
input k = 2 "Spike = volume above (x average)" 1..10

let va = avg(volume, length)
let spike = volume > va * k

draw volume name "Volume" as columns color spike ? gold : close >= open ? fade(blue, 0.7) : fade(gray, 0.6)
draw va name "Average" color white
draw va * k name "Spike line" color fade(gold, 0.5)

if spike then
  alert "Volume spike: {volume} (average {va})"
end
```

## Part 6. Examples: Experts (strategies that trade)

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

### bands-reversion

Mean reversion on volatility bands: buy back inside the lower band, sell back inside the upper, exit at the middle

ارتداد إلى المتوسط على نطاقات التذبذب: شراء عند العودة داخل النطاق السفلي، وبيع عند العودة داخل العلوي، وخروج عند المنتصف

```via
# en: Mean reversion on volatility bands: buy back inside the lower band, sell back inside the upper, exit at the middle
# ar: ارتداد إلى المتوسط على نطاقات التذبذب: شراء عند العودة داخل النطاق السفلي، وبيع عند العودة داخل العلوي، وخروج عند المنتصف
# shows: unpacking bands(), exit on a condition, position to know which side you are on
expert "Bands mean reversion"

option fee = 0.05

input length = 20 "Bands length" 5..200
input dev = 2 "Bands width (deviations)" 0.5..5
input stopAtr = 1.5 "Stop beyond the band (x ATR)" 0.2..10

let (upperBand, middle, lowerBand) = bands(close, length, dev)
let vol = atr(14)

draw upperBand name "Upper" color fade(gray, 0.7)
draw middle name "Middle" color fade(white, 0.5)
draw lowerBand name "Lower" color fade(gray, 0.7)

let backAboveLower = crossup(close, lowerBand)
let backBelowUpper = crossdown(close, upperBand)
let reachedMiddleUp = crossup(close, middle)
let reachedMiddleDown = crossdown(close, middle)

if position == 0 and backAboveLower then
  buy
  stop lowerBand - vol * stopAtr
end
if position == 0 and backBelowUpper then
  sell
  stop upperBand + vol * stopAtr
end
if position == 1 and reachedMiddleUp then exit
if position == -1 and reachedMiddleDown then exit
```

### breakeven-stop

Trend entries that move the stop to breakeven after one unit of risk, with a time exit

دخول مع الاتجاه، ونقل الوقف إلى نقطة الدخول بعد أن يقطع السعر مسافة المخاطرة، وخروج بالوقت

```via
# en: Trend entries that move the stop to breakeven after one unit of risk, with a time exit
# ar: دخول مع الاتجاه، ونقل الوقف إلى نقطة الدخول بعد أن يقطع السعر مسافة المخاطرة، وخروج بالوقت
# shows: entry_price, bars_in_trade, changing the stop of an open trade
expert "Breakeven stop"

option fee = 0.05
option shorts = no

input trendLen = 100 "Trend average" 10..500
input stopAtr = 2 "Stop (x ATR)" 0.5..10
input maxBars = 48 "Close after (bars)" 1..1000

let trendLine = ema(close, trendLen)
let r = rsi(close, 14)
let vol = atr(14)
let entrySignal = close > trendLine and crossup(r, 50)

keep risk = 0
keep atBreakeven = no

draw trendLine name "Trend" color white width 2

if position == 0 and entrySignal then
  buy
  risk := vol * stopAtr
  atBreakeven := no
  stop close - risk
  target close + risk * 3
end

if position == 1 and not atBreakeven and high >= entry_price + risk then
  stop entry_price
  atBreakeven := yes
  mark above "BE" color gold
end

if position == 1 and bars_in_trade >= maxBars then exit
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

### risk-based-size

Position size from risk: each trade risks a fixed percent of equity at its stop

حجم الصفقة حسب المخاطرة: تخاطر كل صفقة بنسبة ثابتة من الرصيد عند الوقف

```via
# en: Position size from risk: each trade risks a fixed percent of equity at its stop
# ar: حجم الصفقة حسب المخاطرة: تخاطر كل صفقة بنسبة ثابتة من الرصيد عند الوقف
# shows: buy <size> with a computed size, equity, a swing-low stop
expert "Risk-based position size"

option capital = 10000
option fee = 0.05
option shorts = no

input riskPct = 1 "Risk per trade (% of equity)" 0.1..10
input swingLen = 10 "Stop under the lowest low of (bars)" 2..100
input reward = 2 "Target (x risk)" 0.5..10

let fast = ema(close, 20)
let slow = ema(close, 50)
let swingLow = lowest(low, swingLen)
let entrySignal = crossup(fast, slow)

# how far the stop is, in percent of the price
let stopPct = (close - swingLow) / close * 100
# size (in % of equity) so that hitting the stop loses riskPct of equity; never more than 100%
let sizePct = stopPct > 0 ? min(100, riskPct * 100 / stopPct) : 0

draw fast name "Fast" color blue
draw slow name "Slow" color white

if position == 0 and entrySignal and sizePct > 0 then
  buy sizePct
  stop swingLow
  target close + (close - swingLow) * reward
end
```

### session-breakout

Opening-range breakout: trade the break of the first hour of the London session, close by session end

كسر نطاق الافتتاح: ادخل مع كسر الساعة الأولى من جلسة لندن، وأغلق قبل نهاية الجلسة

```via
# en: Opening-range breakout: trade the break of the first hour of the London session, close by session end
# ar: كسر نطاق الافتتاح: ادخل مع كسر الساعة الأولى من جلسة لندن، وأغلق قبل نهاية الجلسة
# shows: in_session(), building a range with keep, one trade per day, exit at a time
expert "Session opening range breakout"

option fee = 0.05

input tz = 0 "Time zone of the hours below (hours from UTC)" -12..14
input rangeStart = 700 "Range start (hhmm)" 0..2359
input rangeEnd = 800 "Range end (hhmm)" 0..2359
input tradeEnd = 1600 "Close trades at (hhmm)" 0..2359
input reward = 1.5 "Target (x range height)" 0.5..10

let inRange = in_session(rangeStart, rangeEnd, tz)
let inTrade = in_session(rangeEnd, tradeEnd, tz)
let rangeStarted = inRange and not prev(inRange)

keep hi = 0
keep lo = 0
keep tradedToday = no

if rangeStarted then
  hi := high
  lo := low
  tradedToday := no
elif inRange then
  hi := max(hi, high)
  lo := min(lo, low)
end

draw hi > 0 ? hi : none name "Range high" color fade(blue, 0.8) as steps
draw lo > 0 ? lo : none name "Range low" color fade(blue, 0.8) as steps

if inTrade and not tradedToday and position == 0 and hi > 0 then
  if close > hi then
    buy
    stop lo
    target close + (hi - lo) * reward
    tradedToday := yes
  elif close < lo then
    sell
    stop hi
    target close - (hi - lo) * reward
    tradedToday := yes
  end
end

if not inTrade and not inRange and position != 0 then exit
```

### supertrend-flip

SuperTrend expert: always in the market, flips long and short when the SuperTrend line flips

خبير سوبر ترند: في السوق دائمًا، يقلب بين الشراء والبيع عندما ينقلب خط السوبر ترند

```via
# en: SuperTrend expert: always in the market, flips long and short when the SuperTrend line flips
# ar: خبير سوبر ترند: في السوق دائمًا، يقلب بين الشراء والبيع عندما ينقلب خط السوبر ترند
# shows: a stateful indicator built with keep, trading on its signals
expert "SuperTrend flip"

option fee = 0.05

input period = 10 "ATR period" 1..200
input mult = 3 "ATR multiple" 0.5..20

let a = atr(period)
let upBasic = median + mult * a
let dnBasic = median - mult * a
let pc = prev(close)

keep started = no
keep upper = 0
keep lower = 0
keep trend = 1

if either(a, -1) >= 0 then
  if not started then
    upper := upBasic
    lower := dnBasic
    started := yes
  else
    upper := (upBasic < upper or pc > upper) ? upBasic : upper
    lower := (dnBasic > lower or pc < lower) ? dnBasic : lower
    if trend == -1 and close > upper then
      trend := 1
    elif trend == 1 and close < lower then
      trend := -1
    end
  end
end

draw started and trend == 1 ? lower : none name "Up" as steps color blue width 2
draw started and trend == -1 ? upper : none name "Down" as steps color rose width 2

let flipUp = trend == 1 and prev(trend) == -1
let flipDown = trend == -1 and prev(trend) == 1
if flipUp then buy
if flipDown then sell
```

### time-filtered-macd

MACD crosses traded only on chosen weekdays and hours, flat before the weekend

تقاطعات الماكد تُنفَّذ في أيام وساعات تختارها فقط، ودون صفقات مفتوحة في عطلة نهاية الأسبوع

```via
# en: MACD crosses traded only on chosen weekdays and hours, flat before the weekend
# ar: تقاطعات الماكد تُنفَّذ في أيام وساعات تختارها فقط، ودون صفقات مفتوحة في عطلة نهاية الأسبوع
# shows: hour(), weekday(), unpacking macd(), exit on Friday evening
expert "MACD with a time filter"

option fee = 0.05

input tz = 2 "Your time zone (hours from UTC)" -12..14
input fromHour = 9 "Trade from hour" 0..23
input toHour = 20 "Trade until hour" 0..23
input fridayClose = 21 "Close everything on Friday at hour" 0..23

let (line, signal, hist) = macd(close, 12, 26, 9)
let h = hour(tz)
let day = weekday(tz)              # 1 = Monday ... 7 = Sunday
let tradingTime = day <= 5 and h >= fromHour and h < toHour
let upCross = crossup(line, signal)
let downCross = crossdown(line, signal)

draw hist name "Histogram" as columns color hist >= 0 ? fade(blue, 0.6) : fade(rose, 0.5)

if tradingTime and upCross then buy
if tradingTime and downCross then sell
if day == 5 and h >= fridayClose and position != 0 then exit
```

## Part 6. Examples: Community library: classic studies (MIT)

### sma

Simple Moving Average: Plain average of the last N closes. The most basic trend line.

المتوسط المتحرك البسيط: متوسط آخر N إغلاق. أبسط خط اتجاه.

```via
indicator "Simple Moving Average" overlay
info id "library.sma"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential"
info license "MIT"
info description "Plain average of the last N closes. The most basic trend line."

input length = 20 "Length" 1..500
draw avg(close, length) name "SMA" color blue width 2
```

### ema

Exponential Moving Average: Average that gives more weight to recent closes, so it reacts faster than the simple one.

المتوسط المتحرك الأسي: متوسط يعطي وزنًا أكبر للشموع الأخيرة، فيتحرك أسرع من البسيط.

```via
indicator "Exponential Moving Average" overlay
info id "library.ema"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/moving-averages-simple-and-exponential"
info license "MIT"
info description "Average that gives more weight to recent closes, so it reacts faster than the simple one."

input length = 20 "Length" 1..500
draw ema(close, length) name "EMA" color blue width 2
```

### wma

Weighted Moving Average: Linearly weighted average: the newest close counts N times, the oldest once.

المتوسط المتحرك الموزون: متوسط موزون خطيًا: يُحسب آخر إغلاق N مرة وأقدمها مرة واحدة.

```via
indicator "Weighted Moving Average" overlay
info id "library.wma"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://en.wikipedia.org/wiki/Moving_average#Weighted_moving_average"
info license "MIT"
info description "Linearly weighted average: the newest close counts N times, the oldest once."

input length = 20 "Length" 1..500
draw wma(close, length) name "WMA" color blue width 2
```

### hma

Hull Moving Average: Fast, smooth average built from weighted averages to cut most of the lag.

متوسط هَل المتحرك: متوسط سريع وناعم مبني من متوسطات موزونة لتقليل التأخير.

```via
indicator "Hull Moving Average" overlay
info id "library.hma"
info version "1.0.0"
info author "Chartavia Library"
info credit "Alan Hull"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/hull-moving-average-hma"
info license "MIT"
info description "Fast, smooth average built from weighted averages to cut most of the lag."

input length = 21 "Length" 2..500
let h = hull(close, length)
draw h name "HMA" color h > prev(h) ? white : blue width 2
```

### dema

Double Exponential Moving Average: 2 x EMA minus the EMA of the EMA: less lag than a plain EMA of the same length.

المتوسط الأسي المزدوج (DEMA): ضعف الـ EMA ناقص الـ EMA الخاص به: تأخير أقل من EMA بالطول نفسه.

```via
indicator "Double Exponential Moving Average" overlay
info id "library.dema"
info version "1.0.0"
info author "Chartavia Library"
info credit "Patrick Mulloy"
info source "https://en.wikipedia.org/wiki/Double_exponential_moving_average"
info license "MIT"
info description "2 x EMA minus the EMA of the EMA: less lag than a plain EMA of the same length."

input length = 20 "Length" 1..500
let e1 = ema(close, length)
let e2 = ema(e1, length)
draw 2 * e1 - e2 name "DEMA" color blue width 2
```

### tema

Triple Exponential Moving Average: Three stacked EMAs combined to follow price closely with little lag.

المتوسط الأسي الثلاثي (TEMA): ثلاثة متوسطات أسية مركّبة تتبع السعر بتأخير قليل.

```via
indicator "Triple Exponential Moving Average" overlay
info id "library.tema"
info version "1.0.0"
info author "Chartavia Library"
info credit "Patrick Mulloy"
info source "https://en.wikipedia.org/wiki/Triple_exponential_moving_average"
info license "MIT"
info description "Three stacked EMAs combined to follow price closely with little lag."

input length = 20 "Length" 1..500
let e1 = ema(close, length)
let e2 = ema(e1, length)
let e3 = ema(e2, length)
draw 3 * e1 - 3 * e2 + e3 name "TEMA" color blue width 2
```

### kama

Kaufman Adaptive Moving Average: Speeds up when price trends cleanly and slows down in noise, using the efficiency ratio.

متوسط كوفمان التكيفي (KAMA): يتسارع عندما يتحرك السعر في اتجاه واضح ويهدأ وقت التذبذب، باستخدام نسبة الكفاءة.

```via
indicator "Kaufman Adaptive Moving Average" overlay
info id "library.kama"
info version "1.0.0"
info author "Chartavia Library"
info credit "Perry Kaufman"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/kaufmans-adaptive-moving-average-kama"
info license "MIT"
info description "Speeds up when price trends cleanly and slows down in noise, using the efficiency ratio."

input length = 10 "Efficiency length" 2..200
input fast = 2 "Fast period" 1..50
input slow = 30 "Slow period" 2..200

let direction = abs(change(close, length))
let noise = sum(abs(change(close)), length)
let er = noise > 0 ? direction / noise : 0
let fastSc = 2 / (fast + 1)
let slowSc = 2 / (slow + 1)
let sc = pow(er * (fastSc - slowSc) + slowSc, 2)

keep k = none
if bar == length then
  k := close
elif bar > length then
  k := k + sc * (close - k)
end
draw k name "KAMA" color blue width 2
```

### vwap

VWAP: Average price weighted by volume, restarting every day (UTC).

متوسط السعر المرجح بالحجم (VWAP): متوسط السعر مرجّحًا بالحجم، ويبدأ من جديد كل يوم (بتوقيت UTC).

```via
indicator "VWAP" overlay
info id "library.vwap"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://en.wikipedia.org/wiki/Volume-weighted_average_price"
info license "MIT"
info description "Average price weighted by volume, restarting every day (UTC)."

draw vwap() name "VWAP" color gold width 2
```

### bollinger

Bollinger Bands: A moving average with bands K standard deviations above and below it.

نطاقات بولينجر: متوسط متحرك وحوله نطاقان على بُعد K انحراف معياري.

```via
indicator "Bollinger Bands" overlay
info id "library.bollinger"
info version "1.0.0"
info author "Chartavia Library"
info credit "John Bollinger"
info source "https://en.wikipedia.org/wiki/Bollinger_Bands"
info license "MIT"
info description "A moving average with bands K standard deviations above and below it."

input length = 20 "Length" 2..500
input mult = 2 "Deviations" 0.1..10
let (upper, middle, lower) = bands(close, length, mult)
draw upper name "Upper" color fade(blue, 0.8)
draw middle name "Basis" color gray
draw lower name "Lower" color fade(blue, 0.8)
```

### keltner

Keltner Channels: An EMA with bands set a multiple of the average true range away.

قنوات كيلتنر: متوسط أسي وحوله نطاقان على بُعد مضاعف من متوسط المدى الحقيقي.

```via
indicator "Keltner Channels" overlay
info id "library.keltner"
info version "1.0.0"
info author "Chartavia Library"
info credit "Chester Keltner (ATR version popularised by Linda Bradford Raschke)"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/keltner-channels"
info license "MIT"
info description "An EMA with bands set a multiple of the average true range away."

input length = 20 "EMA length" 1..500
input atrLength = 10 "ATR length" 1..500
input mult = 2 "ATR multiple" 0.1..10
let mid = ema(close, length)
let a = atr(atrLength)
draw mid + mult * a name "Upper" color fade(blue, 0.8)
draw mid name "Middle" color gray
draw mid - mult * a name "Lower" color fade(blue, 0.8)
```

### donchian

Donchian Channels: Highest high and lowest low of the last N bars, with the midpoint.

قنوات دونشيان: أعلى قمة وأدنى قاع في آخر N شمعة، والمنتصف بينهما.

```via
indicator "Donchian Channels" overlay
info id "library.donchian"
info version "1.0.0"
info author "Chartavia Library"
info credit "Richard Donchian"
info source "https://en.wikipedia.org/wiki/Donchian_channel"
info license "MIT"
info description "Highest high and lowest low of the last N bars, with the midpoint."

input length = 20 "Length" 1..500
let up = highest(high, length)
let dn = lowest(low, length)
draw up name "Upper" color blue
draw (up + dn) / 2 name "Middle" color gray
draw dn name "Lower" color blue
```

### envelopes

Moving Average Envelopes: A moving average with lines a fixed percentage above and below it.

أغلفة المتوسط المتحرك: متوسط متحرك وخطان فوقه وتحته بنسبة مئوية ثابتة.

```via
indicator "Moving Average Envelopes" overlay
info id "library.envelopes"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays"
info license "MIT"
info description "A moving average with lines a fixed percentage above and below it."

input length = 20 "Length" 1..500
input percent = 2.5 "Percent" 0.1..50
input exponential = no "Use EMA"
let mid = exponential ? ema(close, length) : avg(close, length)
draw mid * (1 + percent / 100) name "Upper" color fade(blue, 0.8)
draw mid name "Basis" color gray
draw mid * (1 - percent / 100) name "Lower" color fade(blue, 0.8)
```

### parabolic-sar

Parabolic SAR: Stop-and-reverse dots that trail price and speed up as the trend extends.

البارابوليك سار: نقاط وقف وانعكاس تتبع السعر وتتسارع كلما طال الاتجاه.

```via
indicator "Parabolic SAR" overlay
info id "library.parabolic-sar"
info version "1.0.0"
info author "Chartavia Library"
info credit "J. Welles Wilder Jr."
info source "https://en.wikipedia.org/wiki/Parabolic_SAR"
info license "MIT"
info description "Stop-and-reverse dots that trail price and speed up as the trend extends."

input start = 0.02 "Start" 0.001..1
input step = 0.02 "Increment" 0.001..1
input maxAf = 0.2 "Maximum" 0.01..1

keep up = yes
keep sar = none
keep ep = none
keep af = 0
keep next = none

if bar == 1 then
  up := close >= prev(close)
  sar := up ? min(low, prev(low)) : max(high, prev(high))
  ep := up ? high : low
  af := start
elif bar > 1 then
  next := sar + af * (ep - sar)
  if up then
    next := min(next, prev(low), prev(low, 2))
    if low < next then
      up := no
      next := ep
      ep := low
      af := start
    elif high > ep then
      ep := high
      af := min(af + step, maxAf)
    end
  else
    next := max(next, prev(high), prev(high, 2))
    if high > next then
      up := yes
      next := ep
      ep := high
      af := start
    elif low < ep then
      ep := low
      af := min(af + step, maxAf)
    end
  end
  sar := next
end

draw sar name "SAR" as dots color up ? white : blue width 2
if bar > 2 and up and not prev(up) then alert "Parabolic SAR flipped up at {close}"
if bar > 2 and not up and prev(up) then alert "Parabolic SAR flipped down at {close}"
```

### supertrend

SuperTrend: ATR bands around the bar midpoint; the line flips sides when price closes through it.

سوبر ترند: نطاقات ATR حول منتصف الشمعة؛ ينقلب الخط إلى الجهة الأخرى عندما يُغلق السعر متجاوزًا إياه.

```via
indicator "SuperTrend" overlay
info id "library.supertrend"
info version "1.0.0"
info author "Chartavia Library"
info credit "Olivier Seban"
info source "https://www.barchart.com/education/technical-indicators/supertrend"
info license "MIT"
info description "ATR bands around the bar midpoint; the line flips sides when price closes through it."

input period = 10 "ATR period" 1..200
input mult = 3 "ATR multiple" 0.1..20

let a = atr(period)
let upBasic = median + mult * a
let dnBasic = median - mult * a

keep started = no
keep fu = none
keep fl = none
keep pfu = none
keep pfl = none
keep trend = 1

if either(a, -1) >= 0 then
  if not started then
    fu := upBasic
    fl := dnBasic
    started := yes
  else
    pfu := fu
    pfl := fl
    fu := (upBasic < pfu or prev(close) > pfu) ? upBasic : pfu
    fl := (dnBasic > pfl or prev(close) < pfl) ? dnBasic : pfl
    if trend == -1 and close > pfu then
      trend := 1
    elif trend == 1 and close < pfl then
      trend := -1
    end
  end
end

draw started and trend == 1 ? fl : none name "Up trend" as steps color white width 2
draw started and trend == -1 ? fu : none name "Down trend" as steps color blue width 2
if trend == 1 and prev(trend) == -1 then
  mark below "▲" color white
  alert "SuperTrend turned up at {close}"
end
if trend == -1 and prev(trend) == 1 then
  mark above "▼" color blue
  alert "SuperTrend turned down at {close}"
end
```

### ichimoku

Ichimoku Cloud: Conversion and base lines plus the cloud, drawn where it lands after the forward shift.

سحابة إيشيموكو: خط التحويل وخط الأساس والسحابة، مرسومة في مكانها بعد الإزاحة للأمام.

```via
indicator "Ichimoku Cloud" overlay
info id "library.ichimoku"
info version "1.0.0"
info author "Chartavia Library"
info credit "Goichi Hosoda"
info source "https://en.wikipedia.org/wiki/Ichimoku_Kink%C5%8D_Hy%C5%8D"
info license "MIT"
info description "Conversion and base lines plus the cloud, drawn where it lands after the forward shift."

input convLength = 9 "Conversion length" 1..200
input baseLength = 26 "Base length" 1..200
input spanBLength = 52 "Leading span B length" 1..400
input shift = 26 "Displacement" 1..200

fn mid(n) = (highest(high, n) + lowest(low, n)) / 2
let conv = mid(convLength)
let base = mid(baseLength)
let spanA = (conv + base) / 2
let spanB = mid(spanBLength)
# The cloud is projected forward: the value on this bar was computed shift - 1 bars ago.
let cloudA = prev(spanA, shift - 1)
let cloudB = prev(spanB, shift - 1)

draw conv name "Conversion" color sky
draw base name "Base" color gold
draw cloudA name "Leading span A" color fade(white, 0.6)
draw cloudB name "Leading span B" color fade(blue, 0.8)
```

### adx

ADX and DMI: Trend strength (ADX) with the plus and minus directional lines.

مؤشر ADX وخطوط الاتجاه DMI: قوة الاتجاه (ADX) مع خطي الاتجاه الموجب والسالب.

```via
indicator "ADX and DMI"
info id "library.adx"
info version "1.0.0"
info author "Chartavia Library"
info credit "J. Welles Wilder Jr."
info source "https://en.wikipedia.org/wiki/Average_directional_movement_index"
info license "MIT"
info description "Trend strength (ADX) with the plus and minus directional lines."

input length = 14 "Length" 1..200
input threshold = 25 "Trend threshold" 0..100
let (a, plus, minus) = adx(length)
draw a name "ADX" color gold width 2
draw plus name "+DI" color white
draw minus name "-DI" color blue
level threshold name "Trend" color gray dashed
```

### aroon

Aroon: How recently the highest high and lowest low happened, as 0 to 100.

أرون: منذ متى حدثت أعلى قمة وأدنى قاع، من 0 إلى 100.

```via
indicator "Aroon"
info id "library.aroon"
info version "1.0.0"
info author "Chartavia Library"
info credit "Tushar Chande"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/aroon"
info license "MIT"
info description "How recently the highest high and lowest low happened, as 0 to 100."

input length = 14 "Length" 1..500
let up = 100 * (length - since_high(high, length + 1)) / length
let dn = 100 * (length - since_low(low, length + 1)) / length
draw up name "Aroon up" color white width 2
draw dn name "Aroon down" color blue width 2
level 70 color fade(gray, 0.5) dashed
level 30 color fade(gray, 0.5) dashed
```

### pivots-classic

Classic Pivot Points (daily): Floor-trader pivot, three resistances and three supports from the previous day (UTC).

نقاط الارتكاز الكلاسيكية (يومي): نقطة الارتكاز وثلاث مقاومات وثلاثة دعوم من اليوم السابق (بتوقيت UTC).

```via
indicator "Classic Pivot Points (daily)" overlay
info id "library.pivots-classic"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic floor-trader pivots (public domain)"
info source "https://en.wikipedia.org/wiki/Pivot_point_(technical_analysis)"
info license "MIT"
info description "Floor-trader pivot, three resistances and three supports from the previous day (UTC)."

let day = floor(time / 86400000)
keep curDay = -1
keep dh = none
keep dl = none
keep pp = none
keep r1 = none
keep r2 = none
keep r3 = none
keep s1 = none
keep s2 = none
keep s3 = none

if day != curDay then
  if curDay >= 0 then
    pp := (dh + dl + prev(close)) / 3
    r1 := 2 * pp - dl
    s1 := 2 * pp - dh
    r2 := pp + (dh - dl)
    s2 := pp - (dh - dl)
    r3 := dh + 2 * (pp - dl)
    s3 := dl - 2 * (dh - pp)
  end
  curDay := day
  dh := high
  dl := low
else
  dh := max(dh, high)
  dl := min(dl, low)
end

draw r3 name "R3" as steps color fade(gray, 0.6)
draw r2 name "R2" as steps color fade(gray, 0.8)
draw r1 name "R1" as steps color gray
draw pp name "Pivot" as steps color gold width 2
draw s1 name "S1" as steps color blue
draw s2 name "S2" as steps color fade(blue, 0.8)
draw s3 name "S3" as steps color fade(blue, 0.6)
```

### rsi

Relative Strength Index: Wilder's 0 to 100 momentum oscillator with overbought and oversold zones.

مؤشر القوة النسبية (RSI): مذبذب الزخم لوايلدر من 0 إلى 100، مع منطقتي تشبّع شرائي وبيعي.

```via
indicator "Relative Strength Index"
info id "library.rsi"
info version "1.0.0"
info author "Chartavia Library"
info credit "J. Welles Wilder Jr."
info source "https://en.wikipedia.org/wiki/Relative_strength_index"
info license "MIT"
info description "Wilder's 0 to 100 momentum oscillator with overbought and oversold zones."

input length = 14 "Length" 2..200
input upper = 70 "Overbought" 50..100
input lower = 30 "Oversold" 0..50
let r = rsi(close, length)
draw r name "RSI" color blue width 2
level upper name "Overbought" color gray dashed
level 50 color fade(gray, 0.4)
level lower name "Oversold" color gray dashed
if crossdown(r, upper) then alert "RSI left overbought: {r}"
if crossup(r, lower) then alert "RSI left oversold: {r}"
```

### stochastic

Stochastic Oscillator: Where the close sits inside the recent high-low range, with a signal line.

الاستوكاستيك: موضع الإغلاق داخل مدى القمة والقاع الأخير، مع خط إشارة.

```via
indicator "Stochastic Oscillator"
info id "library.stochastic"
info version "1.0.0"
info author "Chartavia Library"
info credit "George Lane"
info source "https://en.wikipedia.org/wiki/Stochastic_oscillator"
info license "MIT"
info description "Where the close sits inside the recent high-low range, with a signal line."

input length = 14 "%K length" 1..200
input kSmooth = 1 "%K smoothing" 1..50
input dSmooth = 3 "%D length" 1..50
let (k, d) = stoch(length, kSmooth, dSmooth)
draw k name "%K" color blue width 2
draw d name "%D" color gold
level 80 color gray dashed
level 20 color gray dashed
```

### stoch-rsi

Stochastic RSI: The stochastic formula applied to RSI instead of price, for a faster oscillator.

ستوكاستيك RSI: معادلة الاستوكاستيك مطبقة على الـ RSI بدلًا من السعر، فينتج مذبذب أسرع.

```via
indicator "Stochastic RSI"
info id "library.stoch-rsi"
info version "1.0.0"
info author "Chartavia Library"
info credit "Tushar Chande and Stanley Kroll"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "The stochastic formula applied to RSI instead of price, for a faster oscillator."

input rsiLength = 14 "RSI length" 2..200
input stochLength = 14 "Stochastic length" 1..200
input kSmooth = 3 "%K smoothing" 1..50
input dSmooth = 3 "%D length" 1..50
let r = rsi(close, rsiLength)
let lo = lowest(r, stochLength)
let hi = highest(r, stochLength)
let raw = hi > lo ? 100 * (r - lo) / (hi - lo) : 50
let k = avg(raw, kSmooth)
let d = avg(k, dSmooth)
draw k name "%K" color blue width 2
draw d name "%D" color gold
level 80 color gray dashed
level 20 color gray dashed
```

### macd

MACD: Difference of two EMAs, its signal line and the histogram between them.

الماكد (MACD): الفرق بين متوسطين أسيين، وخط الإشارة، والمدرّج التكراري بينهما.

```via
indicator "MACD"
info id "library.macd"
info version "1.0.0"
info author "Chartavia Library"
info credit "Gerald Appel"
info source "https://en.wikipedia.org/wiki/MACD"
info license "MIT"
info description "Difference of two EMAs, its signal line and the histogram between them."

input fast = 12 "Fast length" 1..200
input slow = 26 "Slow length" 1..400
input signal = 9 "Signal length" 1..100
let (line, sig, hist) = macd(close, fast, slow, signal)
draw hist name "Histogram" as columns color hist >= 0 ? fade(white, 0.6) : fade(blue, 0.7)
draw line name "MACD" color blue width 2
draw sig name "Signal" color gold
level 0 color fade(gray, 0.5)
if crossup(line, sig) then alert "MACD crossed above signal"
if crossdown(line, sig) then alert "MACD crossed below signal"
```

### cci

Commodity Channel Index: Distance of the typical price from its average, scaled by mean deviation.

مؤشر قناة السلع (CCI): بُعد السعر النموذجي عن متوسطه، مقسومًا على متوسط الانحراف.

```via
indicator "Commodity Channel Index"
info id "library.cci"
info version "1.0.0"
info author "Chartavia Library"
info credit "Donald Lambert"
info source "https://en.wikipedia.org/wiki/Commodity_channel_index"
info license "MIT"
info description "Distance of the typical price from its average, scaled by mean deviation."

input length = 20 "Length" 2..500
draw cci(length) name "CCI" color blue width 2
level 100 color gray dashed
level 0 color fade(gray, 0.4)
level -100 color gray dashed
```

### williams-r

Williams %R: Close relative to the recent high-low range, from 0 down to -100.

وليامز %R: الإغلاق بالنسبة إلى مدى القمة والقاع الأخير، من 0 إلى -100.

```via
indicator "Williams %R"
info id "library.williams-r"
info version "1.0.0"
info author "Chartavia Library"
info credit "Larry Williams"
info source "https://en.wikipedia.org/wiki/Williams_%25R"
info license "MIT"
info description "Close relative to the recent high-low range, from 0 down to -100."

input length = 14 "Length" 1..500
draw willr(length) name "%R" color blue width 2
level -20 color gray dashed
level -80 color gray dashed
```

### roc

Rate of Change: Percent change of the close over N bars.

معدل التغير (ROC): نسبة تغير الإغلاق على مدار N شمعة.

```via
indicator "Rate of Change"
info id "library.roc"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://en.wikipedia.org/wiki/Momentum_(technical_analysis)"
info license "MIT"
info description "Percent change of the close over N bars."

input length = 9 "Length" 1..500
draw pct(close, length) name "ROC %" color blue width 2
level 0 color fade(gray, 0.5)
```

### awesome

Awesome Oscillator: 5-bar minus 34-bar simple average of the bar midpoint, as columns.

المذبذب الرائع (AO): متوسط 5 شموع ناقص متوسط 34 شمعة لمنتصف الشمعة، على شكل أعمدة.

```via
indicator "Awesome Oscillator"
info id "library.awesome"
info version "1.0.0"
info author "Chartavia Library"
info credit "Bill Williams"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "5-bar minus 34-bar simple average of the bar midpoint, as columns."

input fast = 5 "Fast" 1..100
input slow = 34 "Slow" 2..400
let ao = avg(median, fast) - avg(median, slow)
draw ao name "AO" as columns color ao >= prev(ao) ? fade(white, 0.7) : fade(blue, 0.8)
level 0 color fade(gray, 0.5)
```

### ultimate

Ultimate Oscillator: Buying pressure averaged over three windows (7, 14 and 28 bars) and weighted 4:2:1.

المذبذب النهائي: متوسط ضغط الشراء على ثلاث فترات (7 و14 و28) موزونًا 4:2:1.

```via
indicator "Ultimate Oscillator"
info id "library.ultimate"
info version "1.0.0"
info author "Chartavia Library"
info credit "Larry Williams"
info source "https://en.wikipedia.org/wiki/Ultimate_oscillator"
info license "MIT"
info description "Buying pressure averaged over three windows (7, 14 and 28 bars) and weighted 4:2:1."

input short = 7 "Short" 1..100
input medium = 14 "Medium" 1..200
input long = 28 "Long" 1..400
let pc = prev(close)
let bp = close - min(low, pc)
let tr = max(high, pc) - min(low, pc)
fn ratio(n) = sum(bp, n) / sum(tr, n)
let uo = 100 * (4 * ratio(short) + 2 * ratio(medium) + ratio(long)) / 7
draw uo name "UO" color blue width 2
level 70 color gray dashed
level 30 color gray dashed
```

### trix

TRIX: One-bar percent change of a triple-smoothed EMA, with a signal line.

تريكس (TRIX): نسبة التغير لشمعة واحدة لمتوسط أسي منعّم ثلاث مرات، مع خط إشارة.

```via
indicator "TRIX"
info id "library.trix"
info version "1.0.0"
info author "Chartavia Library"
info credit "Jack Hutson"
info source "https://en.wikipedia.org/wiki/Trix_(technical_analysis)"
info license "MIT"
info description "One-bar percent change of a triple-smoothed EMA, with a signal line."

input length = 15 "Length" 1..200
input signal = 9 "Signal" 1..100
let e3 = ema(ema(ema(close, length), length), length)
let t = pct(e3)
draw t name "TRIX %" color blue width 2
draw ema(t, signal) name "Signal" color gold
level 0 color fade(gray, 0.5)
```

### cmo

Chande Momentum Oscillator: Sum of up moves minus sum of down moves over their total, from -100 to 100.

مذبذب تشاندي للزخم: مجموع الصعود ناقص مجموع الهبوط مقسومًا على إجماليهما، من -100 إلى 100.

```via
indicator "Chande Momentum Oscillator"
info id "library.cmo"
info version "1.0.0"
info author "Chartavia Library"
info credit "Tushar Chande"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "Sum of up moves minus sum of down moves over their total, from -100 to 100."

input length = 9 "Length" 1..200
let ch = change(close)
let ups = sum(max(ch, 0), length)
let downs = sum(max(-ch, 0), length)
let c = ups + downs > 0 ? 100 * (ups - downs) / (ups + downs) : 0
draw c name "CMO" color blue width 2
level 50 color gray dashed
level 0 color fade(gray, 0.4)
level -50 color gray dashed
```

### elder-ray

Elder Ray (Bull and Bear Power): High minus EMA (bull power) and low minus EMA (bear power).

إلدر راي (قوة الثيران والدببة): القمة ناقص المتوسط الأسي (قوة الثيران) والقاع ناقصه (قوة الدببة).

```via
indicator "Elder Ray (Bull and Bear Power)"
info id "library.elder-ray"
info version "1.0.0"
info author "Chartavia Library"
info credit "Alexander Elder"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "High minus EMA (bull power) and low minus EMA (bear power)."

input length = 13 "EMA length" 1..200
let e = ema(close, length)
draw high - e name "Bull power" as columns color fade(white, 0.6)
draw low - e name "Bear power" as columns color fade(blue, 0.7)
level 0 color fade(gray, 0.5)
```

### coppock

Coppock Curve: Weighted average of two rates of change; designed for long-term bottoms on monthly charts.

منحنى كوبوك: متوسط موزون لمعدلَي تغيّر؛ صُمّم للقيعان الطويلة على الشارت الشهري.

```via
indicator "Coppock Curve"
info id "library.coppock"
info version "1.0.0"
info author "Chartavia Library"
info credit "Edwin Coppock"
info source "https://en.wikipedia.org/wiki/Coppock_curve"
info license "MIT"
info description "Weighted average of two rates of change; designed for long-term bottoms on monthly charts."

input longRoc = 14 "Long ROC" 1..200
input shortRoc = 11 "Short ROC" 1..200
input wmaLength = 10 "WMA length" 1..200
let c = wma(pct(close, longRoc) + pct(close, shortRoc), wmaLength)
draw c name "Coppock" color blue width 2
level 0 color fade(gray, 0.5)
```

### atr

Average True Range: Wilder-smoothed average of the true range: how much price usually moves per bar.

متوسط المدى الحقيقي (ATR): متوسط المدى الحقيقي بتنعيم وايلدر: مقدار تحرك السعر المعتاد في الشمعة.

```via
indicator "Average True Range"
info id "library.atr"
info version "1.0.0"
info author "Chartavia Library"
info credit "J. Welles Wilder Jr."
info source "https://en.wikipedia.org/wiki/Average_true_range"
info license "MIT"
info description "Wilder-smoothed average of the true range: how much price usually moves per bar."

input length = 14 "Length" 1..500
draw atr(length) name "ATR" color blue width 2
```

### choppiness

Choppiness Index: High values mean sideways chop, low values mean a directional move.

مؤشر التذبذب العرضي (Choppiness): القيم المرتفعة تعني سوقًا عرضيًا، والمنخفضة تعني حركة في اتجاه.

```via
indicator "Choppiness Index"
info id "library.choppiness"
info version "1.0.0"
info author "Chartavia Library"
info credit "E. W. Dreiss"
info source "https://www.barchart.com/trader/help/studies/chop.php"
info license "MIT"
info description "High values mean sideways chop, low values mean a directional move."

input length = 14 "Length" 2..500
let range = highest(high, length) - lowest(low, length)
let chop = range > 0 ? 100 * log(sum(true_range(), length) / range) / log(length) : none
draw chop name "CHOP" color blue width 2
level 61.8 color gray dashed
level 38.2 color gray dashed
```

### historical-volatility

Historical Volatility: Annualised standard deviation of log returns, in percent.

التذبذب التاريخي: الانحراف المعياري للعوائد اللوغاريتمية على أساس سنوي، كنسبة مئوية.

```via
indicator "Historical Volatility"
info id "library.historical-volatility"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://en.wikipedia.org/wiki/Volatility_(finance)"
info license "MIT"
info description "Annualised standard deviation of log returns, in percent."

input length = 20 "Length" 2..500
input perYear = 365 "Bars per year" 1..100000
let r = log(close / prev(close))
draw 100 * stdev(r, length) * sqrt(perYear) name "HV %" color blue width 2
```

### obv

On Balance Volume: Running total that adds volume on up closes and subtracts it on down closes.

حجم التوازن (OBV): مجموع تراكمي يضيف الحجم عندما يرتفع الإغلاق ويطرحه عندما ينخفض.

```via
indicator "On Balance Volume"
info id "library.obv"
info version "1.0.0"
info author "Chartavia Library"
info credit "Joseph Granville"
info source "https://en.wikipedia.org/wiki/On-balance_volume"
info license "MIT"
info description "Running total that adds volume on up closes and subtracts it on down closes."

input signal = 20 "Signal EMA" 1..500
let o = obv()
draw o name "OBV" color blue width 2
draw ema(o, signal) name "Signal" color gold
```

### mfi

Money Flow Index: A volume-weighted RSI built from the typical price.

مؤشر تدفق الأموال (MFI): RSI مرجّح بالحجم ومبني على السعر النموذجي.

```via
indicator "Money Flow Index"
info id "library.mfi"
info version "1.0.0"
info author "Chartavia Library"
info credit "Gene Quong and Avrum Soudack"
info source "https://en.wikipedia.org/wiki/Money_flow_index"
info license "MIT"
info description "A volume-weighted RSI built from the typical price."

input length = 14 "Length" 1..500
draw mfi(length) name "MFI" color blue width 2
level 80 color gray dashed
level 20 color gray dashed
```

### cmf

Chaikin Money Flow: Money flow volume summed over N bars and divided by total volume.

تدفق أموال تشايكن (CMF): حجم تدفق الأموال على N شمعة مقسوم على إجمالي الحجم.

```via
indicator "Chaikin Money Flow"
info id "library.cmf"
info version "1.0.0"
info author "Chartavia Library"
info credit "Marc Chaikin"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "Money flow volume summed over N bars and divided by total volume."

input length = 20 "Length" 1..500
let mfm = high > low ? ((close - low) - (high - close)) / (high - low) : 0
let vsum = sum(volume, length)
let c = vsum > 0 ? sum(mfm * volume, length) / vsum : 0
draw c name "CMF" as area color c >= 0 ? fade(white, 0.5) : fade(blue, 0.6)
level 0 color fade(gray, 0.5)
```

### accumulation-distribution

Accumulation / Distribution: Running total of money flow volume: where in the bar's range the close lands, times volume.

التجميع والتوزيع (A/D): مجموع تراكمي لحجم تدفق الأموال: موضع الإغلاق في مدى الشمعة مضروبًا في الحجم.

```via
indicator "Accumulation / Distribution"
info id "library.accumulation-distribution"
info version "1.0.0"
info author "Chartavia Library"
info credit "Marc Chaikin"
info source "https://en.wikipedia.org/wiki/Accumulation/distribution_index"
info license "MIT"
info description "Running total of money flow volume: where in the bar's range the close lands, times volume."

let mfm = high > low ? ((close - low) - (high - close)) / (high - low) : 0
keep ad = 0
ad := ad + mfm * volume
draw ad name "A/D" color blue width 2
```

### chaikin-oscillator

Chaikin Oscillator: 3-bar EMA minus 10-bar EMA of the accumulation/distribution line.

مذبذب تشايكن: متوسط أسي 3 ناقص متوسط أسي 10 لخط التجميع والتوزيع.

```via
indicator "Chaikin Oscillator"
info id "library.chaikin-oscillator"
info version "1.0.0"
info author "Chartavia Library"
info credit "Marc Chaikin"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "3-bar EMA minus 10-bar EMA of the accumulation/distribution line."

input fast = 3 "Fast" 1..100
input slow = 10 "Slow" 2..200
let mfm = high > low ? ((close - low) - (high - close)) / (high - low) : 0
keep ad = 0
ad := ad + mfm * volume
let osc = ema(ad, fast) - ema(ad, slow)
draw osc name "Chaikin Osc" color blue width 2
level 0 color fade(gray, 0.5)
```

### force-index

Elder Force Index: Price change times volume, smoothed with an EMA.

مؤشر القوة لإلدر: تغيّر السعر مضروبًا في الحجم، ومنعّمًا بمتوسط أسي.

```via
indicator "Elder Force Index"
info id "library.force-index"
info version "1.0.0"
info author "Chartavia Library"
info credit "Alexander Elder"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators/force-index"
info license "MIT"
info description "Price change times volume, smoothed with an EMA."

input length = 13 "EMA length" 1..200
let f = ema(change(close) * volume, length)
draw f name "Force" color blue width 2
level 0 color fade(gray, 0.5)
```

### volume-ma

Volume with Moving Average: Volume columns with their simple average; bars above average are highlighted.

الحجم مع متوسطه: أعمدة الحجم مع متوسطها البسيط؛ وتظهر الأعمدة التي فوق المتوسط أوضح.

```via
indicator "Volume with Moving Average"
info id "library.volume-ma"
info version "1.0.0"
info author "Chartavia Library"
info credit "Classic study (public domain)"
info source "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-indicators"
info license "MIT"
info description "Volume columns with their simple average; bars above average are highlighted."

input length = 20 "Average length" 1..500
let va = avg(volume, length)
draw volume name "Volume" as columns color volume > va ? fade(white, 0.6) : fade(blue, 0.5)
draw va name "Average" color gold
```

## Part 7. Error messages

### Via error messages (generated)

The editor and `tools/check.cjs` show each problem with its line and column, in English and Arabic.
Values in quotes below are examples.

| Code | English | العربية |
|---|---|---|
| `bad_char` | unexpected character "@" | حرف غير متوقع "@" |
| `bad_string` | text is missing its closing quote | النص ينقصه علامة التنصيص في آخره |
| `bad_number` | "1x" is not a valid number | "1x" ليس رقمًا صحيحًا |
| `expected` | expected a value, found "then" | كان المتوقع a value، لكن وُجد "then" |
| `no_header` | a script must start with `indicator "title"` or `expert "title"` | يجب أن يبدأ السكربت بـ `indicator "العنوان"` أو `expert "العنوان"` |
| `header_twice` | the header can appear only once, on the first line | سطر العنوان يُكتب مرة واحدة فقط في أول السكربت |
| `unknown_name` | unknown name "clse". Did you mean "close"? | اسم غير معروف "clse". هل تقصد "close"؟ |
| `unknown_fn` | unknown function "clse". Did you mean "close"? | دالة غير معروفة "clse". هل تقصد "close"؟ |
| `not_fn` | "clse" is not a function | "clse" ليست دالة |
| `arity` | "clse" takes 2 argument(s), got 3 | "clse" تأخذ 2 مُعطى، وتم تمرير 3 |
| `redefined` | "clse" is already defined | "clse" معرّف بالفعل |
| `reserved` | "clse" is a built-in name and cannot be redefined | "clse" اسم محجوز ولا يمكن إعادة تعريفه |
| `not_keep` | "clse" can be changed with := only if it was declared with keep | لا يمكن تغيير "clse" بـ := إلا إذا عُرّف بـ keep |
| `top_only` | "a value" must be at the top level, not inside a block | "a value" يُكتب في المستوى الأعلى وليس داخل كتلة |
| `expert_only` | "a value" can be used only in an expert | "a value" يُستخدم في الخبير (expert) فقط |
| `not_in_fn` | "a value" cannot be used inside a function | "a value" لا يُستخدم داخل دالة |
| `tuple_count` | "clse" returns 2 values, but 3 names were given | "clse" تُرجع 2 قيم، لكن تم كتابة 3 أسماء |
| `tuple_needed` | "clse" returns several values; unpack them with let (a, b, ...) = clse(...) | "clse" تُرجع عدة قيم؛ استخدم let (a, b, ...) = clse(...) |
| `not_tuple` | "clse" returns a single value | "clse" تُرجع قيمة واحدة |
| `bad_input` | an input's default must be a number, yes/no or a colour like #7480ff | القيمة الافتراضية للمدخل يجب أن تكون رقمًا أو نعم/لا أو لونًا مثل #7480ff |
| `bad_option` | unknown option "clse" (use capital, fee, size or shorts) | خيار غير معروف "clse" (المتاح: capital, fee, size, shorts) |
| `bad_info` | unknown info field "clse" (use version, author, description, license, homepage, id, credit or source) | حقل معلومات غير معروف "clse" (المتاح: version, author, description, license, homepage, id, credit, source) |
| `bad_style` | unknown style "clse" (use line, columns, dots, area or steps) | شكل غير معروف "clse" (المتاح: line, columns, dots, area, steps) |
| `bad_width` | width must be a whole number from 1 to 4 | يجب أن يكون السُمك عددًا صحيحًا من 1 إلى 4 |
| `too_many` | too many a value (max 16) | عدد كبير جدًا من a value (الحد 16) |
| `fn_order` | function "clse" must be defined before it is used | الدالة "clse" يجب تعريفها قبل استخدامها |
| `type_num` | "+" needs numbers, got 3 | "+" تحتاج إلى أرقام، لكن وُجد 3 |
| `bad_length` | length for "clse" must be a whole number ≥ 1, got 3 | الطول في "clse" يجب أن يكون عددًا صحيحًا ≥ 1، لكن وُجد 3 |
| `loop_limit` | a loop ran more than 5,000 times on one bar | تكرار عمل أكثر من 5,000 مرة على شمعة واحدة |
| `op_limit` | the script did too much work (operation limit reached) | أجرى السكربت حسابات كثيرة جدًا (بلغ حد العمليات) |
| `time_limit` | the script took too long to run | استغرق تشغيل السكربت وقتًا طويلًا جدًا |
| `type_list` | "push" needs a list made with list() | "push" تحتاج إلى قائمة منشأة بـ list() |
| `list_limit` | a list can hold at most 16 items | تتسع القائمة لـ 16 عنصر على الأكثر |
| `bad_point` | "a value" needs a bar number and a price for each point | "a value" تحتاج إلى رقم شمعة وسعر لكل نقطة |
| `bad_cell` | cell row must be 0-29 and column 0-11 | يجب أن يكون صف الخلية من 0 إلى 29 والعمود من 0 إلى 11 |
| `bad_panel` | unknown panel place "3" (use "top_right", "top_left", "bottom_right" or "bottom_left") | مكان لوحة غير معروف "3" (المتاح: "top_right", "top_left", "bottom_right", "bottom_left") |
| `bad_field` | unknown field "3" (use "open", "high", "low" or "close") | حقل غير معروف "3" (المتاح: "open", "high", "low", "close") |
| `limit_marks` | more than 500 marks; extra marks were dropped | أكثر من 500 علامة؛ تم تجاهل الزائد |
