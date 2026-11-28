# Moving from Pine Script to Via

Many traders already know Pine Script. This page maps the common Pine ideas to Via so you (or your AI
assistant) can rewrite an idea in Via. Via is a different, smaller language: rewrite the logic, do not
copy lines. Only port code you wrote yourself or code whose licence allows it.

## Script header and settings

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
| `input.time(..., "T1", confirm=true)` + `input.price(..., "P1", confirm=true)` (picked on the chart) | `input t1 = point "T1"`: picked with the mouse and draggable; gives `t1` (time), `t1_price` and `t1_bar` (bar number) |
| `input.source(close, "Source")` | `input src = 3 "Source" options "Open\|High\|Low\|Close"` then pick with `?:` |
| `group="Section"` | `group "Section"` |

## Values and variables

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

## Built-in data

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

## Technical functions

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

## Drawing

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

## Lists (arrays)

| Pine | Via |
|---|---|
| `var a = array.new_float()` | `keep a = list()` |
| `array.push` / `array.unshift` | `push` / `push_front` |
| `array.pop` / `array.shift` | `pop` / `pop_front` |
| `array.get(a, i)` / `array.set` / `array.remove` | `get(a, i)` (`-1` = last) / `put` / `remove` |
| `array.size` / `array.clear` | `len` / `clear` |
| `array.max` / `array.min` / `array.sum` | `list_max` / `list_min` / `list_sum` |

## Alerts

| Pine | Via |
|---|---|
| `alertcondition(cond, "T", "msg")` / `alert("msg")` | `if cond then alert "msg {close}"` |
| `str.tostring(close)` inside the message | `{close}` or `{anyLetName}` placeholders |

## Strategies (experts)

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

## Not available in Via (yet)

Other symbols in one script, tick data, `bgcolor`/`fill`, plot offsets, polylines, matrices and maps,
user-defined types and methods, libraries/imports, `while` loops, and changing a past bar's plot.
Write around them or keep the idea simpler.
