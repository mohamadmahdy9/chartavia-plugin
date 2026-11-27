# Via in 10 short lessons

Via (ڤيا) is the language of [Chartavia](https://chartavia.com) for your own **indicators** (they
analyse and draw) and **experts** (strategies that place orders and get a backtest report).
Each lesson is a complete script: open the editor at https://chartavia.com/chart/script, paste it,
and press **Run** (Ctrl+Enter).

## 1. Your first indicator

```via
indicator "My first average" overlay

let fast = ema(close, 20)
draw fast name "EMA 20" color blue width 2
```

- The first line says what the script is: `indicator`, its title, and `overlay` to draw on the price
  chart (without `overlay` it gets its own pane under the chart).
- A script runs once for every bar, from the oldest to the newest. `close` is the close of the bar
  being processed, so `fast` is a whole line, one value per bar.
- `let` gives a name to a value. `draw` puts it on the chart.

## 2. Settings the user can change

```via
indicator "Two averages" overlay

input fastLen = 20 "Fast length" 1..200
input slowLen = 50 "Slow length" 1..400
input showSlow = yes "Show the slow average"

let fast = ema(close, fastLen)
let slow = ema(close, slowLen)

draw fast name "Fast" color blue width 2
draw showSlow ? slow : none name "Slow" color white
```

`input` makes a setting in the indicator's settings dialog: a number with an optional range, `yes`/`no`,
a colour such as `#7480ff`, a list (`options "A|B|C"`) or a date (`time`). `cond ? a : b` picks a value;
`none` means "nothing on this bar".

## 3. Conditions, marks and alerts

```via
indicator "Cross signals" overlay

let fast = ema(close, 20)
let slow = ema(close, 50)
let upCross = crossup(fast, slow)
let downCross = crossdown(fast, slow)

draw fast name "Fast" color blue
draw slow name "Slow" color white

if upCross then
  mark below "▲" color blue
  alert "Fast crossed above slow at {close}"
end
if downCross then
  mark above "▼" color gray
  alert "Fast crossed below slow at {close}"
end
```

- `if ... then` ... `end`. One-line form: `if upCross then mark below "▲"`.
- `crossup(a, b)` is `yes` only on the bar where `a` crosses above `b`, so the signal fires once.
- `alert` sends a notification when it happens on the newest closed bar (if the user turned alerts
  on). `{close}` or `{anyName}` puts a value in the message.
- Tip: compute `crossup`, `ema` and other window functions in top-level `let` lines, and use the
  names inside the `if`.

## 4. An indicator in its own pane

```via
indicator "RSI with zones"

input length = 14 "Length" 2..100

let r = rsi(close, length)

draw r name "RSI" color r > 70 ? rose : r < 30 ? mint : blue width 2
level 70 name "Overbought" color gray dashed
level 30 name "Oversold" color gray dashed
```

No `overlay`, so it gets its own pane. `level` draws a horizontal line. The colour of a `draw` can change
bar by bar.

## 5. Remembering values across bars: `keep`

```via
indicator "Up bars in a row"

keep streak = 0

if close > open then
  streak := streak + 1
else
  streak := 0
end

draw streak name "Up bars in a row" as columns color blue
```

A `let` is recomputed on every bar and cannot be changed. A `keep` starts with its value on the first bar
and keeps whatever you set with `:=`. To read an older value of anything, use `prev(x, k)`: `prev(close)`
is the previous close, `prev(close, 5)` the close five bars ago. Missing values (the first bars of a
window) are `none`; `either(x, 0)` replaces them.

## 6. Lines, boxes and labels

```via
indicator "Breakout boxes" overlay

input length = 20 "Range length" 5..200

let top = prev(highest(high, length))
let bottom = prev(lowest(low, length))
let breakUp = crossup(close, top)

keep lastBox = none

if breakUp then
  erase(lastBox)
  lastBox := new_box(bar - length, top, bar, bottom, blue, fade(blue, 0.12), "Range")
  new_label(bar, high, "Break", none, "above", blue)
end
```

- Points are a bar number and a price. `bar` is the current bar, `bar - 20` is twenty bars back.
- `new_box`, `new_line` and `new_label` return an id. Keep it in a `keep` to `move`, `stretch`,
  `retext`, `recolor` or `erase` the object later.
- `prev(highest(high, length))` is the high of the bars *before* this one, so the current bar can break it.

## 7. A small dashboard

```via
indicator "Mini dashboard" overlay

let r = rsi(close, 14)
let up = ema(close, 20) > ema(close, 50)

if last then
  cell(0, 0, "Trend", gray)
  cell(0, 1, up ? "Up" : "Down", white, up ? fade(blue, 0.5) : fade(rose, 0.4))
  cell(1, 0, "RSI", gray)
  cell(1, 1, to_text(r, 1), white)
end
```

`cell(row, column, text, colour, background)` writes a small table in a corner of the chart; `panel("top_left")`
moves it. `last` is `yes` only on the newest bar. `to_text(x, 1)` turns a number into text, and `+` joins text.

## 8. Time and higher timeframes

```via
indicator "Yesterday's range" overlay

let yHigh = htf("high", 1440, 1)
let yLow = htf("low", 1440, 1)
let london = in_session(800, 1700, 0)

draw yHigh name "Yesterday high" color gold as steps
draw yLow name "Yesterday low" color gold as steps

if london and not prev(london) then mark below "London" color sky
```

- `htf("high", 1440, 1)` is the high of the last finished day (1440 minutes), built from the chart's own
  bars without looking into the future. With `0` (or nothing) it is the day still forming.
- `in_session(800, 1700, 0)` is `yes` from 08:00 to 17:00 at UTC+0. `hour(2)`, `weekday(2)` read the bar's
  time at UTC+2 (weekday 1 = Monday).

## 9. Your first expert

```via
expert "Average cross"

option capital = 10000
option fee = 0.1

input fastLen = 20 "Fast" 2..200
input slowLen = 50 "Slow" 5..400
input stopPct = 2 "Stop (%)" 0.1..20

let fast = ema(close, fastLen)
let slow = ema(close, slowLen)
let upCross = crossup(fast, slow)
let downCross = crossdown(fast, slow)

draw fast color blue
draw slow color white

if upCross then
  buy
  stop close * (1 - stopPct / 100)
  target close * (1 + stopPct * 2 / 100)
end
if downCross and position == 1 then exit
```

- `expert` instead of `indicator`. Only experts can trade.
- `buy` goes long, `sell` goes short (closing the opposite side first), `exit` closes. `stop` and
  `target` protect the trade. Orders fill at the next bar's open.
- `option` sets the starting capital, the fee in percent per fill, the trade size in percent of equity,
  and whether short trades are allowed (`option shorts = no`).
- `position` is 1 when long, -1 when short, 0 when flat. `entry_price`, `bars_in_trade`, `equity` and
  `profit` are there too.
- The editor shows the backtest: net profit, trades, win rate, profit factor, drawdown and every trade.
  A backtest is past data, not a promise.

## 10. Arabic keywords

Every keyword also has an Arabic spelling, and names may be Arabic:

```via
مؤشر "متوسطين" على_السعر

مدخل سريع = 20 "السريع"
اجعل خط = متوسط_أسي(إغلاق, سريع)
ارسم خط باسم "المتوسط" بلون أزرق بسمك 2

إذا تقاطع_صاعد(إغلاق, خط) إذن
  علامة تحت "▲" بلون أزرق
نهاية
```

## Next steps

- [Full language reference](../reference/language.md) and [every function](../reference/functions.md).
- [Cookbook](../cookbook.md): ready scripts for SMC-style zones, sessions, dashboards, experts and more.
- [Common mistakes](../common-mistakes.md).
- [Use Via with ChatGPT, Gemini or Claude](use-with-ai.md): describe what you want, get a working script.
