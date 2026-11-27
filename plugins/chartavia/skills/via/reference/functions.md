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
| `bar` | `شمعة` | Bar number, 0 is the oldest loaded bar (the number the legend shows) |
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

## Lists (Via 0.2) · القوائم (ڤيا 0.2)

| Function | Meaning | Example |
|---|---|---|
| `list(a, b, ...)` | A new list, empty or with the given items. Keep it with `keep` so it lasts across bars. <br>قائمة جديدة فاضية أو فيها العناصر دي. احفظها بـ keep عشان تفضل من شمعة للتانية. | `keep highs = list()` |
| `push(xs, v)` | Add v at the end; returns the new length. <br>يضيف v في الآخر ويرجّع الطول الجديد. | `push(highs, high)` |
| `push_front(xs, v)` | Add v at the start. <br>يضيف v في الأول. |  |
| `pop(xs)` | Remove and return the last item. <br>يشيل آخر عنصر ويرجّعه. |  |
| `pop_front(xs)` | Remove and return the first item. <br>يشيل أول عنصر ويرجّعه. |  |
| `get(xs, i)` | Item i (0 is the first, -1 the last), or none. <br>العنصر رقم i (0 الأول و-1 الأخير)، أو لاشيء. | `get(highs, -1)` |
| `put(xs, i, v)` | Replace item i. <br>يغيّر العنصر رقم i. |  |
| `remove(xs, i)` | Remove item i and return it. <br>يشيل العنصر رقم i ويرجّعه. |  |
| `clear(xs)` | Empty the list. <br>يفضّي القائمة. |  |
| `len(xs)` | Number of items. <br>عدد العناصر. |  |
| `list_max(xs)` | Largest number in the list. <br>أكبر رقم في القائمة. |  |
| `list_min(xs)` | Smallest number in the list. <br>أصغر رقم في القائمة. |  |
| `list_sum(xs)` | Sum of the numbers in the list. <br>مجموع الأرقام في القائمة. |  |

## Chart objects and panel (Via 0.2) · رسومات الشارت واللوحة (ڤيا 0.2)

| Function | Meaning | Example |
|---|---|---|
| `new_line(bar1, price1, bar2, price2, color?, width?, style?, extend?)` | Draw a line between two points and return its id. style: "solid", "dashed", "dotted"; extend: "none", "right", "left", "both". At most 500 lines; the oldest goes first. <br>يرسم خط بين نقطتين ويرجّع رقمه. الشكل: solid أو dashed أو dotted، والامتداد: none أو right أو left أو both. 500 خط بالكتير، والأقدم بيتشال. | `new_line(bar - 10, low, bar, high, blue, 2, "dashed")` |
| `new_box(bar1, top, bar2, bottom, color?, fill?, text?)` | Draw a filled rectangle and return its id (zones, order blocks, gaps). <br>يرسم مستطيل ملوّن ويرجّع رقمه (مناطق، أوردر بلوك، فجوات). | `new_box(bar - 3, high, bar, low, blue, fade(blue, 0.15))` |
| `new_label(bar, price, text, color?, where?, text_color?)` | Write text at a point; where is "above", "below", "center", "right" or "left". A see-through color shows the text alone. <br>يكتب نص عند نقطة؛ المكان above أو below أو center أو right أو left. لو اللون شفاف بيظهر النص لوحده. | `new_label(bar, high, "HH", gold, "above")` |
| `move(id, bar1, price1, bar2?, price2?)` | Move an object's points. <br>يحرّك نقط الرسمة. |  |
| `stretch(id, bar2)` | Move only the right end, e.g. keep a box running to the current bar. <br>يحرّك الطرف اليمين بس، زي إنك تمد صندوق لحد الشمعة الحالية. | `stretch(zone, bar)` |
| `retext(id, text)` | Change a label's or box's text. <br>يغيّر نص اللافتة أو الصندوق. |  |
| `recolor(id, color, fill?)` | Change an object's colors. <br>يغيّر ألوان الرسمة. |  |
| `erase(id)` | Delete an object. <br>يمسح الرسمة. |  |
| `exists(id)` | yes while the object is on the chart. <br>نعم طول ما الرسمة موجودة. |  |
| `x1_of(id)` | Bar of an object's first point. <br>شمعة أول نقطة في الرسمة. |  |
| `y1_of(id)` | Price of an object's first point. <br>سعر أول نقطة في الرسمة. |  |
| `x2_of(id)` | Bar of an object's second point. <br>شمعة تاني نقطة في الرسمة. |  |
| `y2_of(id)` | Price of an object's second point. <br>سعر تاني نقطة في الرسمة. |  |
| `cell(row, col, text, color?, background?)` | Write one cell of the dashboard panel (rows 0-29, columns 0-11). The panel shows the values from the newest bar. <br>يكتب خلية في لوحة البيانات (صفوف 0-29، أعمدة 0-11). اللوحة بتعرض قيم آخر شمعة. | `cell(0, 0, "Trend"); cell(0, 1, up ? "Up" : "Down", white, blue)` |
| `panel(where)` | Where the panel sits: "top_right" (default), "top_left", "bottom_right", "bottom_left". <br>مكان اللوحة: top_right (الافتراضي) أو top_left أو bottom_right أو bottom_left. |  |

## Text, time and higher timeframes (Via 0.2) · النصوص والوقت والفريمات الأعلى (ڤيا 0.2)

| Function | Meaning | Example |
|---|---|---|
| `to_text(x, digits?)` | A number as text. "+" also joins text: "RSI " + to_text(r, 1). <br>يحوّل الرقم لنص. وعلامة + بتلزق النصوص: "RSI " + to_text(r, 1). | `to_text(close, 2)` |
| `hour(tz?)` | Hour the bar opened; tz is hours from UTC (2 for Cairo winter). <br>ساعة فتح الشمعة؛ tz فرق الساعات عن UTC (2 للقاهرة في الشتا). | `hour(2)` |
| `minute(tz?)` | Minute the bar opened. <br>دقيقة فتح الشمعة. |  |
| `weekday(tz?)` | Day of the week, 1 = Monday ... 7 = Sunday. <br>يوم الأسبوع، 1 = الاتنين لحد 7 = الحد. |  |
| `monthday(tz?)` | Day of the month. <br>يوم الشهر. |  |
| `month(tz?)` | Month, 1 to 12. <br>الشهر من 1 لـ 12. |  |
| `year(tz?)` | Year. <br>السنة. |  |
| `in_session(start, end, tz?)` | yes when the bar opens inside a daily window given as hhmm; windows may cross midnight. <br>نعم لو الشمعة فتحت جوه فترة يومية مكتوبة hhmm؛ الفترة ممكن تعدّي نص الليل. | `in_session(1500, 1800, 2)` |
| `bar_minutes()` | The chart's timeframe in minutes. <br>فريم الشارت بالدقايق. |  |
| `htf(field, minutes, back = 0)` | Open, high, low or close of a higher-timeframe bar built from the chart's bars. back 0 is the bar still forming (never future data), 1 the last finished one. <br>افتتاح أو أعلى أو أدنى أو إغلاق شمعة فريم أعلى مبنية من شموع الشارت. back = 0 الشمعة اللي لسه بتتكوّن (من غير بيانات مستقبلية)، و1 آخر شمعة خلصت. | `htf("high", 1440, 1)` |

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
