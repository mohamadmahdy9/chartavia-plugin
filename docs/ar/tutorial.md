<div dir="rtl">

# ڤيا في 10 دروس قصيرة

ڤيا (Via) هي لغة [شارتاڤيا](https://chartavia.com) اللي بتكتب بيها **مؤشراتك** (بتحلل وترسم بس) و**الإكسبرتات**
(استراتيجيات بتفتح وتقفل صفقات وبيطلعلها تقرير باك تست). كل درس سكريبت كامل: افتح المحرر على
https://chartavia.com/chart/script، الصق الكود، واضغط **تشغيل** (Ctrl+Enter).

## 1. أول مؤشر ليك

</div>

```via
indicator "My first average" overlay

let fast = ema(close, 20)
draw fast name "EMA 20" color blue width 2
```

<div dir="rtl">

- أول سطر بيقول نوع السكريبت: `indicator` وبعده العنوان، و`overlay` عشان يترسم على شارت السعر (من غيرها
  بياخد مساحة لوحده تحت الشارت).
- السكريبت بيشتغل مرة على كل شمعة، من الأقدم للأحدث. `close` هو إغلاق الشمعة اللي بيشتغل عليها دلوقتي، فـ`fast`
  بيبقى خط كامل، قيمة لكل شمعة.
- `let` بتدّي اسم لقيمة، و`draw` بترسمها على الشارت.

## 2. إعدادات المستخدم يقدر يغيّرها

</div>

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

<div dir="rtl">

`input` بيعمل إعداد في نافذة إعدادات المؤشر: رقم ومعاه مدى اختياري، أو نعم/لا (`yes`/`no`)، أو لون زي `#7480ff`،
أو قايمة اختيارات (`options "A|B|C"`)، أو تاريخ (`time`). `شرط ? أ : ب` بتختار قيمة، و`none` معناها "مفيش حاجة على
الشمعة دي".

## 3. الشروط والعلامات والتنبيهات

</div>

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

<div dir="rtl">

- `if ... then` ... `end`. وفيه شكل في سطر واحد: `if upCross then mark below "▲"`.
- `crossup(a, b)` بتبقى `yes` في الشمعة اللي `a` عدّت فيها فوق `b` بس، فالإشارة بتطلع مرة واحدة.
- `alert` بتبعت تنبيه لما ده يحصل على آخر شمعة مقفولة (لو المستخدم شغّل التنبيهات). `{close}` أو `{أي_اسم}` بيحط
  القيمة في الرسالة.
- نصيحة: احسب `crossup` و`ema` وباقي الدوال اللي بتبص على شموع فاتت في سطور `let` برا الـ`if`، واستخدم أساميهم جواه.

## 4. مؤشر في مساحة لوحده

</div>

```via
indicator "RSI with zones"

input length = 14 "Length" 2..100

let r = rsi(close, length)

draw r name "RSI" color r > 70 ? rose : r < 30 ? mint : blue width 2
level 70 name "Overbought" color gray dashed
level 30 name "Oversold" color gray dashed
```

<div dir="rtl">

من غير `overlay` بياخد مساحة لوحده. `level` بيرسم خط أفقي. ولون الـ`draw` ممكن يتغيّر من شمعة للتانية.

## 5. تفتكر قيمة من شمعة للتانية: `keep`

</div>

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

<div dir="rtl">

الـ`let` بيتحسب من جديد في كل شمعة ومينفعش يتغيّر. الـ`keep` بيبدأ بقيمته في أول شمعة ويفضل محتفظ بأي قيمة تحطها
بـ`:=`. ولو عايز قيمة قديمة لأي حاجة استخدم `prev(x, k)`: `prev(close)` إغلاق الشمعة اللي فاتت، و`prev(close, 5)`
إغلاق من 5 شموع. القيم الناقصة (أول شموع في أي نافذة) اسمها `none`، و`either(x, 0)` بتحط مكانها صفر.

## 6. خطوط وصناديق ولافتات

</div>

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

<div dir="rtl">

- كل نقطة عبارة عن رقم شمعة وسعر. `bar` هي الشمعة الحالية، و`bar - 20` من 20 شمعة.
- `new_box` و`new_line` و`new_label` بيرجّعوا رقم للرسمة. احفظه في `keep` عشان تحرّكها (`move`) أو تمدّها (`stretch`)
  أو تغيّر نصها (`retext`) أو لونها (`recolor`) أو تمسحها (`erase`) بعدين.
- `prev(highest(high, length))` أعلى سعر في الشموع اللي *قبل* الشمعة دي، عشان الشمعة الحالية تقدر تكسره.

## 7. لوحة صغيرة

</div>

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

<div dir="rtl">

`cell(صف, عمود, نص, لون, خلفية)` بتكتب جدول صغير في ركن الشارت، و`panel("top_left")` بتنقله لركن تاني. `last` بتبقى
`yes` في آخر شمعة بس. `to_text(x, 1)` بتحوّل الرقم لنص، و`+` بتلزق النصوص.

## 8. الوقت والفريمات الأعلى

</div>

```via
indicator "Yesterday's range" overlay

let yHigh = htf("high", 1440, 1)
let yLow = htf("low", 1440, 1)
let london = in_session(800, 1700, 0)

draw yHigh name "Yesterday high" color gold as steps
draw yLow name "Yesterday low" color gold as steps

if london and not prev(london) then mark below "London" color sky
```

<div dir="rtl">

- `htf("high", 1440, 1)` أعلى سعر في آخر يوم خلص (1440 دقيقة)، مبني من شموع الشارت نفسها من غير ما يبص على المستقبل.
  ولو حطيت `0` (أو مكتبتش حاجة) بيبقى اليوم اللي لسه بيتكوّن.
- `in_session(800, 1700, 0)` بتبقى `yes` من 8 الصبح لـ5 العصر بتوقيت UTC+0. و`hour(2)` و`weekday(2)` بيقروا وقت
  الشمعة بتوقيت UTC+2 (الأسبوع بيبدأ بالاتنين = 1).

## 9. أول إكسبرت ليك

</div>

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

<div dir="rtl">

- `expert` بدل `indicator`. الإكسبرت بس هو اللي بيدخل صفقات.
- `buy` شراء، و`sell` بيع (وبيقفل الصفقة العكسية الأول)، و`exit` قفل. `stop` وقف الخسارة و`target` الهدف. الأوامر
  بتتنفذ على افتتاح الشمعة اللي بعدها.
- `option` بيحدد رأس المال، والعمولة كنسبة في كل تنفيذ، وحجم الصفقة كنسبة من الرصيد، وهل البيع على المكشوف مسموح
  (`option shorts = no`).
- `position` بتبقى 1 في الشراء و-1 في البيع و0 من غير صفقة. وفيه كمان `entry_price` و`bars_in_trade` و`equity` و`profit`.
- المحرر بيعرض الباك تست: صافي الربح، وعدد الصفقات، ونسبة الكسب، ومعامل الربح، وأكبر تراجع، وكل صفقة. الباك تست
  اختبار على بيانات فاتت، مش وعد بأرباح.

## 10. الكلمات العربي

كل كلمة محجوزة ليها نسخة عربي، والأسامي نفسها ممكن تكون عربي:

</div>

```via
مؤشر "متوسطين" على_السعر

مدخل سريع = 20 "السريع"
اجعل خط = متوسط_أسي(إغلاق, سريع)
ارسم خط باسم "المتوسط" بلون أزرق بسمك 2

إذا تقاطع_صاعد(إغلاق, خط) إذن
  علامة تحت "▲" بلون أزرق
نهاية
```

<div dir="rtl">

## الخطوة الجاية

- [المرجع الكامل للغة](../reference/language.md) و[كل الدوال](../reference/functions.md).
- [كتاب الوصفات](../cookbook.md): سكريبتات جاهزة لمناطق على طريقة SMC والجلسات واللوحات والإكسبرتات وغيرهم.
- [الأخطاء الشائعة](../common-mistakes.md).
- [استخدم ڤيا مع ChatGPT أو Gemini أو Claude](use-with-ai.md): اوصف اللي عايزه وخد سكريبت شغّال.

</div>
