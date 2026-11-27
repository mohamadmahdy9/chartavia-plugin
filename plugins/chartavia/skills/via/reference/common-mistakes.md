# Common mistakes in Via (and the fix)

Every item below was checked against the real Via engine. When a script fails, the editor shows
the line and column of the problem, in English and Arabic.

## Syntax from other languages

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

## Missing values (`none`)

- The first bars of a window have no value: `avg(close, 20)` is `none` on the first 19 bars.
- Any math with `none` gives `none`; any comparison with `none` gives `no`.
- So `x == none` is **never** true. To test for a missing value use `not (x == x)`, or fill it
  with `either(x, fallback)`, or start a `keep` at `0` and test `== 0`.

## Where statements may go

- `draw` and `level` must be at the top level, never inside `if` or `repeat`.
  To draw only on some bars: `draw cond ? value : none`.
- `input`, `option`, `info` and `fn` must be at the top level too.
- `mark`, `paint`, `alert`, orders and chart-object calls may go anywhere (usually inside `if`).
- Trading (`buy`, `sell`, `exit`, `stop`, `target`, `option`, `position`...) works only in an `expert`.
  An `indicator` can never trade.

## Stateful functions inside `if`

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

## Several return values

`macd`, `bands`, `stoch` and `adx` return several series. Unpack them with exactly that many names:

```via
let (line, signal, hist) = macd(close, 12, 26, 9)
let (upper, middle, lower) = bands(close, 20, 2)      # upper first
let (k, d) = stoch(14, 3, 3)
let (adxValue, plusDi, minusDi) = adx(14)             # adx first
```

## Names

- A name cannot be defined twice, and cannot reuse a built-in or keyword: `close`, `high`, `low`,
  `open`, `volume`, `time`, `bar`, `last`, `median`, `typical`, `avg`, `ema`, `blue`, `gold`...
- Words that are keywords even though they look like names: `name`, `color`, `width`, `as`,
  `dashed`, `level`, `mark`, `paint`, `alert`, `stop`, `target`, `exit`, `from`, `to`, `end`,
  `input`, `option`, `info`, `above`, `below`. Use `stopPrice`, `targetPrice`, `lineWidth`...
- Names are case-sensitive. Arabic names work.
- `fn` must be defined before the line that uses it.

## Loops and lists

- `repeat i from a to b` includes both ends and **counts down when a > b**. On an empty list,
  `repeat k from 0 to len(xs) - 1` runs for `k = 0` and `k = -1`. Guard it:
  `if len(xs) > 0 then` ... `end`.
- When you remove items while walking a list, walk backwards: `repeat k from len(xs) - 1 to 0`.
- Make lists with `keep xs = list()` (a `let` list would be new on every bar).
- At most 5,000 loop steps per bar and 5 million operations per run.

## Marks, labels and objects

- `mark` keeps the **first** 500 marks of the chart; later ones are dropped (with a warning).
  For signals that happen often, use `new_label(bar, price, "text", none, "above", color)`:
  lines, boxes and labels keep the **newest** 500 and remove the oldest.
- Keep an object's id with `keep id = none` so you can `move`, `stretch`, `retext`, `recolor` or
  `erase` it later. Calls on an erased or `none` id do nothing, and `exists(id)` tells you if it is still there.
- Points are a bar number and a price. `bar` is this bar, `bar - 5` five bars back, `bar + 10`
  ten bars into the future.

## Signals that fire every bar

`close > lvl` is yes on every bar above the level. For a one-time signal use
`crossup(close, lvl)` or `cond and not prev(cond)`.

## Look-ahead

`close > highest(high, 20)` can never be true: this bar's own high is in the window. Compare with
the window that ends one bar earlier: `close > prev(highest(high, 20))`. `htf(field, minutes, 1)`
is the last finished higher-timeframe bar; `htf(field, minutes)` is the bar still forming.

## Experts

- Orders fill at the **next bar's open**, not at this bar's close.
- `stop` and `target` written on the same bar as `buy`/`sell` apply to the new trade. Written while a
  trade is open, they move that trade's stop or target. If both are hit inside one bar, the stop wins.
- `buy` while already long does nothing (no pyramiding). `sell` while long closes the long and
  opens a short, unless `option shorts = no`.
- `buy 50` means 50% of equity. Sizes above 100 are capped at 100.
- A backtest is a test on past data, never a promise of profit.

## Colours

Named colours (`blue white ink gray sky gold sand rose mint violet`) adapt to light and dark mode.
Hex colours (`#1f4fd1`, `#1f4fd180` with opacity) are used exactly as written. `fade(color, 0.3)`
sets opacity. `none` or `#rrggbb00` is see-through.
