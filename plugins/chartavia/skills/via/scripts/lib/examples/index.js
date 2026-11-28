"use strict";
// Example scripts. Source of truth for the editor, the docs and the Claude plugin
// (`npm run via:examples` writes them out as .via files).
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXAMPLES = void 0;
exports.EXAMPLES = [
    {
        id: "two-averages",
        en: "Two moving averages with cross marks",
        ar: "متوسطان متحركان مع علامات التقاطع",
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
        ar: "ماكد مع مدرّج تكراري ملوّن",
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
`,
    },
    {
        id: "arabic",
        en: "A full script written in Arabic",
        ar: "سكربت كامل مكتوب بالعربية",
        source: `مؤشر "اتجاه السعر" على_السعر

مدخل الفترة = 50 "فترة المتوسط" 5..400

اجعل المتوسط = متوسط(إغلاق, الفترة)
اجعل فوقه = إغلاق > المتوسط

ارسم المتوسط باسم "المتوسط" بلون فوقه ? أزرق : رمادي بسمك 2

إذا تقاطع_صاعد(إغلاق, المتوسط) إذن
  علامة تحت "صعود" بلون أزرق
  نبّه "تجاوز السعر المتوسط صعودًا عند {إغلاق}"
نهاية
`,
    },
    {
        id: "swing-structure",
        en: "Swing structure with zones and a panel (Via 0.2)",
        ar: "هيكل القمم والقيعان مع مناطق ولوحة (ڤيا 0.2)",
        source: `indicator "Swing structure" overlay

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
`,
    },
    {
        id: "gann-two-points",
        en: "Gann angles from two points you pick on the chart",
        ar: "زوايا جان من نقطتين تختارهما على الشارت",
        source: `indicator "Gann angles from two points" overlay

input t1 = point "T1" group "Points"
input t2 = point "T2" group "Points"
input star = yes "Gann star (angles both ways)" group "Drawing"
input showBox = yes "Price box between the points" group "Drawing"
input bars = 0 "Line length in bars (0 = to the right edge)" 0..5000 group "Drawing"
input fanColor = #7480ff "Angles colour" group "Colours"
input mainColor = #f3efe7 "1x1 colour" group "Colours"

# 1x1 = the move from T1 to T2, in price per bar. Other angles are multiples of it.
keep ratios = list(0.125, 0.25, 0.333333, 0.5, 1, 2, 3, 4, 8)
keep names = list("1x8", "1x4", "1x3", "1x2", "1x1", "2x1", "3x1", "4x1", "8x1")

if last and t1 > 0 and t2 > 0 and t2_bar != t1_bar then
  let dx = t2_bar - t1_bar
  let unit = (t2_price - t1_price) / dx
  let len = bars > 0 ? bars : max(abs(dx), bar - t1_bar)
  let dir = dx > 0 ? 1 : -1
  let ways = star ? 2 : 1
  repeat w from 1 to ways
    let side = w == 1 ? 1 : -1
    repeat k from 0 to len(ratios) - 1
      let r = get(ratios, k)
      let endBar = t1_bar + dir * len
      let endPrice = t1_price + side * unit * r * dir * len
      new_line(t1_bar, t1_price, endBar, endPrice, r == 1 ? mainColor : fade(fanColor, 0.35), r == 1 ? 2 : 1, w == 1 ? "solid" : "dashed", bars > 0 ? "none" : "right")
      new_label(endBar, endPrice, get(names, k), none, "right", r == 1 ? mainColor : fanColor)
    end
  end
  if showBox then
    new_box(t1_bar, t1_price, t2_bar, t2_price, fanColor, fade(fanColor, 0.08))
  end
  new_label(t1_bar, t1_price, "T1 " + to_text(t1_price, 2), none, "left", mainColor)
  new_label(t2_bar, t2_price, "T2 " + to_text(t2_price, 2), none, "left", mainColor)
  new_label(t2_bar, t2_price, to_text(abs(dx), 0) + " bars", none, "below", fanColor)
end

# Until both points are picked, say so on the newest candle.
if last and (t1 == 0 or t2 == 0) then
  new_label(bar, high, "Pick T1 and T2 on the chart · اختر T1 وT2 على الشارت", none, "above", gray)
end
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
