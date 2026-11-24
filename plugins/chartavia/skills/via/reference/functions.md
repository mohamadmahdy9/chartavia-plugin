# Via built-ins (generated, do not edit)

## Series

| Name | Arabic | Meaning |
|---|---|---|
| `open` | `افتتاح` | Bar open price |
| `high` | `أعلى` | Bar high |
| `low` | `أدنى` | Bar low |
| `close` | `إغلاق` | Bar close |
| `volume` | `حجم` | Bar volume |
| `time` | `وقت` | Bar open time in ms since 1970 (UTC) |
| `bar` | `شمعة` | Bar index, 0 is the oldest loaded bar |
| `median` |  | (high + low) / 2 |
| `typical` |  | (high + low + close) / 3 |
| `last` | `أخيرة` | yes only on the newest bar |
| `position` |  | 1 long, -1 short, 0 flat (experts only) |
| `entry_price` |  | Entry price of the open position, or none (experts only) |
| `bars_in_trade` |  | Bars since the open position was entered (experts only) |
| `equity` |  | Cash plus open position value (experts only) |
| `profit` |  | Open profit of the position (experts only) |

## Averages and smoothing · المتوسطات والتنعيم

| Function | Meaning | Example |
|---|---|---|
| `avg(x, n)` | Simple average of the last n values. <br>المتوسط البسيط لآخر n قيمة. | `avg(close, 20)` |
| `ema(x, n)` | Exponential average, weight 2/(n+1), seeded with the simple average. <br>المتوسط الأسي بوزن 2/(n+1)، يبدأ من المتوسط البسيط. | `ema(close, 9)` |
| `wma(x, n)` | Linearly weighted average (newest weighs most). <br>المتوسط الموزون خطيًا (الأحدث له الوزن الأكبر). | `wma(close, 10)` |
| `smooth(x, n)` | Wilder smoothing, weight 1/n. <br>تنعيم وايلدر بوزن 1/n. | `smooth(close, 14)` |
| `hull(x, n)` | Fast, low-lag Hull-style average. <br>متوسط سريع قليل التأخير على طريقة هَل. | `hull(close, 16)` |
| `vwap()` | Volume-weighted average price, resets every UTC day. <br>متوسط السعر المرجّح بالحجم، يبدأ من جديد كل يوم (UTC). | `vwap()` |

## Window statistics · إحصاءات النافذة

| Function | Meaning | Example |
|---|---|---|
| `sum(x, n)` | Sum of the last n values. <br>مجموع آخر n قيمة. |  |
| `highest(x, n)` | Highest of the last n values. <br>أعلى قيمة في آخر n. | `highest(high, 20)` |
| `lowest(x, n)` | Lowest of the last n values. <br>أقل قيمة في آخر n. | `lowest(low, 20)` |
| `stdev(x, n)` | Standard deviation of the last n values. <br>الانحراف المعياري لآخر n قيمة. |  |
| `median_of(x, n)` | Median of the last n values. <br>الوسيط لآخر n قيمة. |  |
| `since_high(x, n)` | Bars since the highest value in the window (0 = this bar). <br>عدد الشموع منذ أعلى قيمة في النافذة (0 = الشمعة الحالية). |  |
| `since_low(x, n)` | Bars since the lowest value in the window. <br>عدد الشموع منذ أقل قيمة في النافذة. |  |

## Bar to bar · بين الشموع

| Function | Meaning | Example |
|---|---|---|
| `prev(x, k = 1)` | Value of x k bars ago. <br>قيمة x من k شمعة فاتت. | `prev(close, 3)` |
| `change(x, k = 1)` | x minus its value k bars ago. <br>الفرق بين x وقيمتها من k شمعة. |  |
| `pct(x, k = 1)` | Percent change over k bars. <br>نسبة التغير خلال k شمعة. |  |
| `crossup(a, b)` | yes on the bar where a goes from ≤ b to > b. <br>نعم في الشمعة اللي a فيها عدّت فوق b. | `crossup(ema(close, 9), ema(close, 21))` |
| `crossdown(a, b)` | yes on the bar where a goes from ≥ b to < b. <br>نعم في الشمعة اللي a فيها نزلت تحت b. |  |
| `rising(x, n)` | x grew on each of the last n bars. <br>x زادت في كل شمعة من آخر n. |  |
| `falling(x, n)` | x dropped on each of the last n bars. <br>x قلّت في كل شمعة من آخر n. |  |
| `bars_since(cond)` | Bars since cond was last yes (none if never). <br>عدد الشموع من آخر مرة الشرط كان نعم. |  |
| `either(x, fallback)` | x, or fallback when x is none. <br>x، أو البديل لو x لاشيء. | `either(prev(close), open)` |

## Ready-made studies · مؤشرات جاهزة

| Function | Meaning | Example |
|---|---|---|
| `rsi(x, n)` | Relative strength index, 0 to 100. <br>مؤشر القوة النسبية من 0 لـ 100. | `rsi(close, 14)` |
| `atr(n)` | Average true range (Wilder). <br>متوسط المدى الحقيقي. | `atr(14)` |
| `true_range()` | True range of this bar. <br>المدى الحقيقي للشمعة الحالية. |  |
| `macd(x, fast, slow, signal)` | Returns (line, signal, hist). <br>تُرجع (الخط، الإشارة، الهيستوجرام). | `let (l, s, h) = macd(close, 12, 26, 9)` |
| `bands(x, n, k)` | Standard deviation bands. Returns (upper, middle, lower). <br>نطاقات الانحراف المعياري. تُرجع (العلوي، الأوسط، السفلي). | `let (u, m, d) = bands(close, 20, 2)` |
| `stoch(n, k_smooth, d_smooth)` | Stochastic oscillator. Returns (k, d). <br>مذبذب الاستوكاستيك. يُرجع (k, d). | `let (k, d) = stoch(14, 3, 3)` |
| `adx(n)` | Trend strength. Returns (adx, plus, minus). <br>قوة الاتجاه. تُرجع (adx، الموجب، السالب). | `let (a, p, m) = adx(14)` |
| `cci(n)` | Commodity channel index. <br>مؤشر قناة السلع. |  |
| `mfi(n)` | Money flow index, 0 to 100. <br>مؤشر تدفق الأموال من 0 لـ 100. |  |
| `obv()` | On-balance volume. <br>حجم التوازن. |  |
| `willr(n)` | Williams range, -100 to 0. <br>مؤشر ويليامز من -100 لـ 0. |  |
| `momentum(x, n)` | x minus x n bars ago. <br>x ناقص قيمتها من n شمعة. |  |

## Math · الرياضيات

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
| `pow(a, b)` | a to the power b (same as a ^ b). <br>a أُس b (زي a ^ b). |  |
| `clamp(x, lo, hi)` | Keep x between lo and hi. <br>حصر x بين lo و hi. |  |
| `sign(x)` | -1, 0 or 1. <br>-1 أو 0 أو 1. |  |
| `fade(color, alpha)` | Same color with opacity 0..1. <br>نفس اللون بشفافية من 0 لـ 1. | `fade(blue, 0.4)` |

## Arabic function names

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

## Keywords and their Arabic spellings

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
