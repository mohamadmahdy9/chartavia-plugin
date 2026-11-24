"use strict";
// Example scripts. Source of truth for the editor, the docs and the Claude plugin
// (`npm run via:examples` writes them out as .via files).
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXAMPLES = void 0;
exports.EXAMPLES = [
    {
        id: "two-averages",
        en: "Two moving averages with cross marks",
        ar: "متوسطين متحركين مع علامات التقاطع",
        source: `indicator "Two averages" overlay

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
`,
    },
    {
        id: "rsi-zones",
        en: "RSI with zones and colored line",
        ar: "مؤشر القوة النسبية مع مناطق وتلوين",
        source: `indicator "RSI zones"

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
`,
    },
    {
        id: "bands-squeeze",
        en: "Volatility bands with squeeze highlight",
        ar: "نطاقات التذبذب مع إبراز الانضغاط",
        source: `indicator "Bands squeeze" overlay

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
`,
    },
    {
        id: "macd-columns",
        en: "MACD with colored histogram",
        ar: "ماكد مع هيستوجرام ملوّن",
        source: `indicator "MACD columns"

input fast = 12
input slow = 26
input signal = 9

let (line, sig, hist) = macd(close, fast, slow, signal)
let growing = hist > prev(hist)

draw hist name "Histogram" as columns color hist >= 0 ? (growing ? blue : fade(blue, 0.5)) : (growing ? fade(rose, 0.5) : rose)
draw line name "MACD" color white
draw sig name "Signal" color gold
level 0 color fade(gray, 0.5)
`,
    },
    {
        id: "trailing-trend",
        en: "ATR trailing trend line (uses keep)",
        ar: "خط اتجاه متحرك بالـ ATR (باستخدام keep)",
        source: `indicator "Trailing trend" overlay

input length = 10 "ATR length" 1..100
input mult = 3 "Multiplier"

let band = atr(length) * mult
keep trail = close
keep dir = 1

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

draw bar > length ? trail : none name "Trail" as steps color dir == 1 ? blue : rose width 2
`,
    },
    {
        id: "arabic",
        en: "A full script written in Arabic",
        ar: "سكريبت كامل مكتوب بالعربي",
        source: `مؤشر "اتجاه السعر" على_السعر

مدخل الفترة = 50 "فترة المتوسط" 5..400

اجعل المتوسط = متوسط(إغلاق, الفترة)
اجعل فوقه = إغلاق > المتوسط

ارسم المتوسط باسم "المتوسط" بلون فوقه ? أزرق : رمادي بسمك 2

إذا تقاطع_صاعد(إغلاق, المتوسط) إذن
  علامة تحت "صعود" بلون أزرق
  نبّه "السعر عدّى فوق المتوسط عند {إغلاق}"
نهاية
`,
    },
    {
        id: "expert-average-cross",
        en: "Expert: trade the average cross",
        ar: "خبير: تداول تقاطع المتوسطات",
        source: `expert "Average cross"

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
`,
    },
    {
        id: "expert-rsi-reversion",
        en: "Expert: RSI mean reversion with stop and target",
        ar: "خبير: الارتداد بمؤشر القوة النسبية مع وقف وهدف",
        source: `expert "RSI reversion"

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
`,
    },
    {
        id: "expert-breakout",
        en: "Expert: channel breakout with ATR stop",
        ar: "خبير: اختراق القناة مع وقف بالـ ATR",
        source: `expert "Channel breakout"

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
`,
    },
];
