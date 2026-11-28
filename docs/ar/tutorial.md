<div dir="rtl">

# ڤيا في 10 دروس قصيرة

ڤيا (Via) هي لغة [شارتاڤيا](https://chartavia.com) التي تكتب بها **مؤشراتك** (تحلل وترسم فقط) و**الخبراء الآليين**
(استراتيجيات تفتح الصفقات وتغلقها ويُخرج لها تقرير اختبار رجعي). كل درس سكربت كامل: افتح المحرر على
https://chartavia.com/chart/script، والصق الشيفرة، واضغط **تشغيل** (Ctrl+Enter).

## 1. مؤشرك الأول

</div>

```via
indicator "My first average" overlay

let fast = ema(close, 20)
draw fast name "EMA 20" color blue width 2
```

<div dir="rtl">

- يحدد السطر الأول نوع السكربت: `indicator` وبعده العنوان، و`overlay` ليُرسم على شارت السعر (ومن دونها
  يأخذ مساحة مستقلة أسفل الشارت).
- يعمل السكربت مرة على كل شمعة، من الأقدم إلى الأحدث. `close` هو إغلاق الشمعة التي يعمل عليها الآن، فيكون `fast`
  خطًا كاملًا، بقيمة لكل شمعة.
- `let` تعطي اسمًا لقيمة، و`draw` ترسمها على الشارت.

## 2. إعدادات يستطيع المستخدم تغييرها

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

`input` يُنشئ إعدادًا في نافذة إعدادات المؤشر: رقمًا ومعه مدى اختياري، أو نعم/لا (`yes`/`no`)، أو لونًا مثل `#7480ff`،
أو قائمة اختيارات (`options "A|B|C"`)، أو تاريخًا (`time`). `شرط ? أ : ب` تختار قيمة، و`none` تعني "لا شيء على
هذه الشمعة".

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

- `if ... then` ... `end`. وهناك صيغة في سطر واحد: `if upCross then mark below "▲"`.
- تكون `crossup(a, b)` بقيمة `yes` في الشمعة التي تجاوزت فيها `a` صعودًا فوق `b` فقط، فتظهر الإشارة مرة واحدة.
- ترسل `alert` تنبيهًا عندما يحدث ذلك على آخر شمعة مغلقة (إن فعّل المستخدم التنبيهات). و`{close}` أو `{أي_اسم}` يضع
  القيمة في الرسالة.
- نصيحة: احسب `crossup` و`ema` وبقية الدوال التي تنظر إلى الشموع السابقة في سطور `let` خارج `if`، واستخدم أسماءها داخلها.

## 4. مؤشر في مساحة مستقلة

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

من دون `overlay` يأخذ مساحة مستقلة. و`level` يرسم خطًا أفقيًا. ويمكن أن يتغيّر لون `draw` من شمعة إلى أخرى.

## 5. تذكّر قيمة من شمعة إلى أخرى: `keep`

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

يُحسب `let` من جديد في كل شمعة ولا يمكن تغييره. أما `keep` فيبدأ بقيمته في الشمعة الأولى ويحتفظ بأي قيمة تضعها
بـ`:=`. وإن أردت قيمة سابقة لأي شيء فاستخدم `prev(x, k)`: `prev(close)` إغلاق الشمعة السابقة، و`prev(close, 5)`
الإغلاق قبل 5 شموع. والقيم الناقصة (أولى الشموع في أي نافذة) اسمها `none`، و`either(x, 0)` تضع مكانها صفرًا.

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

- كل نقطة عبارة عن رقم شمعة وسعر. `bar` هي الشمعة الحالية، و`bar - 20` قبل 20 شمعة.
- تُرجع `new_box` و`new_line` و`new_label` رقمًا للرسمة. احفظه في `keep` لتحرّكها (`move`) أو تمدّها (`stretch`)
  أو تغيّر نصها (`retext`) أو لونها (`recolor`) أو تحذفها (`erase`) لاحقًا.
- `prev(highest(high, length))` أعلى سعر في الشموع التي *قبل* هذه الشمعة، لتتمكن الشمعة الحالية من كسره.

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

`cell(صف, عمود, نص, لون, خلفية)` تكتب جدولًا صغيرًا في زاوية الشارت، و`panel("top_left")` تنقله إلى زاوية أخرى. وتكون `last`
بقيمة `yes` في آخر شمعة فقط. `to_text(x, 1)` تحوّل الرقم إلى نص، و`+` تصل النصوص.

## 8. الوقت والأطر الزمنية الأعلى

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

- `htf("high", 1440, 1)` أعلى سعر في آخر يوم مكتمل (1440 دقيقة)، مبني من شموع الشارت نفسها دون النظر إلى المستقبل.
  وإن وضعت `0` (أو لم تكتب شيئًا) فهو اليوم الذي ما زال يتكوّن.
- تكون `in_session(800, 1700, 0)` بقيمة `yes` من 8 صباحًا حتى 5 مساءً بتوقيت UTC+0. و`hour(2)` و`weekday(2)` يقرآن وقت
  الشمعة بتوقيت UTC+2 (يبدأ الأسبوع بالاثنين = 1).

## 9. خبيرك الآلي الأول

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

- `expert` بدلًا من `indicator`. الخبير الآلي وحده هو الذي يدخل الصفقات.
- `buy` شراء، و`sell` بيع (ويغلق الصفقة المعاكسة أولًا)، و`exit` إغلاق. `stop` وقف الخسارة و`target` الهدف. تُنفَّذ الأوامر
  عند افتتاح الشمعة التالية.
- `option` يحدد رأس المال، والعمولة كنسبة في كل تنفيذ، وحجم الصفقة كنسبة من الرصيد، وهل البيع على المكشوف مسموح
  (`option shorts = no`).
- تكون `position` بقيمة 1 في الشراء و-1 في البيع و0 دون صفقة. وهناك أيضًا `entry_price` و`bars_in_trade` و`equity` و`profit`.
- يعرض المحرر الاختبار الرجعي: صافي الربح، وعدد الصفقات، ونسبة الربح، ومعامل الربح، وأكبر تراجع، وكل صفقة. الاختبار الرجعي
  تجربة على بيانات سابقة، وليس وعدًا بالأرباح.

## 10. الكلمات العربية

لكل كلمة محجوزة صيغة عربية، ويمكن أن تكون الأسماء نفسها عربية:

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

## الخطوة التالية

- [المرجع الكامل للغة](../reference/language.md) و[كل الدوال](../reference/functions.md).
- [كتاب الوصفات](../cookbook.md): سكربتات جاهزة لمناطق على طريقة SMC والجلسات واللوحات والخبراء الآليين وغيرها.
- [الأخطاء الشائعة](../common-mistakes.md).
- [استخدم ڤيا مع ChatGPT أو Gemini أو Claude](use-with-ai.md): صف ما تريده واحصل على سكربت يعمل.

</div>
