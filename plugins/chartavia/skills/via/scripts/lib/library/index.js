"use strict";
// Chartavia free indicator library: classic studies written in Via.
//
// Every script here is written from the published formula of the study, not copied from another
// product's code. Each one credits the person who created the study (`credit`) and links to a
// public description of it (`source`). Our Via code is released under the MIT license (see
// LICENSE.md next to this file); community ports that start from someone else's open-source code keep
// that author's license instead and are listed in NOTICE.md.
//
// The Store reads this list (scripts/seed-library.mjs publishes it as free, open-source products).
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIBRARY = exports.LIBRARY_LICENSE = exports.LIBRARY_AUTHOR = void 0;
exports.librarySource = librarySource;
exports.LIBRARY_AUTHOR = "Chartavia Library";
exports.LIBRARY_LICENSE = "MIT";
const CS = "https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays";
const WP = "https://en.wikipedia.org/wiki";
/** The full Via source of a library script, header and `info` lines included. */
function librarySource(s) {
    const q = (v) => v.replace(/"/g, "'");
    return [
        `indicator "${q(s.titleEn)}"${s.overlay ? " overlay" : ""}`,
        `info id "library.${s.id}"`,
        `info version "${s.version}"`,
        `info author "${exports.LIBRARY_AUTHOR}"`,
        `info credit "${q(s.credit)}"`,
        `info source "${s.source}"`,
        `info license "${s.license}"`,
        `info description "${q(s.summaryEn)}"`,
        "",
        s.body.trim(),
        "",
    ].join("\n");
}
const v1 = { license: exports.LIBRARY_LICENSE, version: "1.0.0" };
exports.LIBRARY = [
    // ---------------------------------------------------------------- averages
    { id: "sma", category: "averages", overlay: true, ...v1,
        titleEn: "Simple Moving Average", titleAr: "المتوسط المتحرك البسيط",
        summaryEn: "Plain average of the last N closes. The most basic trend line.",
        summaryAr: "متوسط آخر N إغلاق. أبسط خط اتجاه.",
        credit: "Classic study (public domain)", source: `${CS}/technical-overlays/moving-averages-simple-and-exponential`,
        body: `
input length = 20 "Length" 1..500
draw avg(close, length) name "SMA" color blue width 2
` },
    { id: "ema", category: "averages", overlay: true, ...v1,
        titleEn: "Exponential Moving Average", titleAr: "المتوسط المتحرك الأسي",
        summaryEn: "Average that gives more weight to recent closes, so it reacts faster than the simple one.",
        summaryAr: "متوسط يعطي وزنًا أكبر للشموع الأخيرة، فيتحرك أسرع من البسيط.",
        credit: "Classic study (public domain)", source: `${CS}/technical-overlays/moving-averages-simple-and-exponential`,
        body: `
input length = 20 "Length" 1..500
draw ema(close, length) name "EMA" color blue width 2
` },
    { id: "wma", category: "averages", overlay: true, ...v1,
        titleEn: "Weighted Moving Average", titleAr: "المتوسط المتحرك الموزون",
        summaryEn: "Linearly weighted average: the newest close counts N times, the oldest once.",
        summaryAr: "متوسط موزون خطيًا: يُحسب آخر إغلاق N مرة وأقدمها مرة واحدة.",
        credit: "Classic study (public domain)", source: `${WP}/Moving_average#Weighted_moving_average`,
        body: `
input length = 20 "Length" 1..500
draw wma(close, length) name "WMA" color blue width 2
` },
    { id: "hma", category: "averages", overlay: true, ...v1,
        titleEn: "Hull Moving Average", titleAr: "متوسط هَل المتحرك",
        summaryEn: "Fast, smooth average built from weighted averages to cut most of the lag.",
        summaryAr: "متوسط سريع وناعم مبني من متوسطات موزونة لتقليل التأخير.",
        credit: "Alan Hull", source: `${CS}/technical-overlays/hull-moving-average-hma`,
        body: `
input length = 21 "Length" 2..500
let h = hull(close, length)
draw h name "HMA" color h > prev(h) ? white : blue width 2
` },
    { id: "dema", category: "averages", overlay: true, ...v1,
        titleEn: "Double Exponential Moving Average", titleAr: "المتوسط الأسي المزدوج (DEMA)",
        summaryEn: "2 x EMA minus the EMA of the EMA: less lag than a plain EMA of the same length.",
        summaryAr: "ضعف الـ EMA ناقص الـ EMA الخاص به: تأخير أقل من EMA بالطول نفسه.",
        credit: "Patrick Mulloy", source: `${WP}/Double_exponential_moving_average`,
        body: `
input length = 20 "Length" 1..500
let e1 = ema(close, length)
let e2 = ema(e1, length)
draw 2 * e1 - e2 name "DEMA" color blue width 2
` },
    { id: "tema", category: "averages", overlay: true, ...v1,
        titleEn: "Triple Exponential Moving Average", titleAr: "المتوسط الأسي الثلاثي (TEMA)",
        summaryEn: "Three stacked EMAs combined to follow price closely with little lag.",
        summaryAr: "ثلاثة متوسطات أسية مركّبة تتبع السعر بتأخير قليل.",
        credit: "Patrick Mulloy", source: `${WP}/Triple_exponential_moving_average`,
        body: `
input length = 20 "Length" 1..500
let e1 = ema(close, length)
let e2 = ema(e1, length)
let e3 = ema(e2, length)
draw 3 * e1 - 3 * e2 + e3 name "TEMA" color blue width 2
` },
    { id: "kama", category: "averages", overlay: true, ...v1,
        titleEn: "Kaufman Adaptive Moving Average", titleAr: "متوسط كوفمان التكيفي (KAMA)",
        summaryEn: "Speeds up when price trends cleanly and slows down in noise, using the efficiency ratio.",
        summaryAr: "يتسارع عندما يتحرك السعر في اتجاه واضح ويهدأ وقت التذبذب، باستخدام نسبة الكفاءة.",
        credit: "Perry Kaufman", source: `${CS}/technical-overlays/kaufmans-adaptive-moving-average-kama`,
        body: `
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
` },
    { id: "vwap", category: "averages", overlay: true, ...v1,
        titleEn: "VWAP", titleAr: "متوسط السعر المرجح بالحجم (VWAP)",
        summaryEn: "Average price weighted by volume, restarting every day (UTC).",
        summaryAr: "متوسط السعر مرجّحًا بالحجم، ويبدأ من جديد كل يوم (بتوقيت UTC).",
        credit: "Classic study (public domain)", source: `${WP}/Volume-weighted_average_price`,
        body: `
draw vwap() name "VWAP" color gold width 2
` },
    // ---------------------------------------------------------------- channels
    { id: "bollinger", category: "channels", overlay: true, ...v1,
        titleEn: "Bollinger Bands", titleAr: "نطاقات بولينجر",
        summaryEn: "A moving average with bands K standard deviations above and below it.",
        summaryAr: "متوسط متحرك وحوله نطاقان على بُعد K انحراف معياري.",
        credit: "John Bollinger", source: `${WP}/Bollinger_Bands`,
        body: `
input length = 20 "Length" 2..500
input mult = 2 "Deviations" 0.1..10
let (upper, middle, lower) = bands(close, length, mult)
draw upper name "Upper" color fade(blue, 0.8)
draw middle name "Basis" color gray
draw lower name "Lower" color fade(blue, 0.8)
` },
    { id: "keltner", category: "channels", overlay: true, ...v1,
        titleEn: "Keltner Channels", titleAr: "قنوات كيلتنر",
        summaryEn: "An EMA with bands set a multiple of the average true range away.",
        summaryAr: "متوسط أسي وحوله نطاقان على بُعد مضاعف من متوسط المدى الحقيقي.",
        credit: "Chester Keltner (ATR version popularised by Linda Bradford Raschke)", source: `${CS}/technical-overlays/keltner-channels`,
        body: `
input length = 20 "EMA length" 1..500
input atrLength = 10 "ATR length" 1..500
input mult = 2 "ATR multiple" 0.1..10
let mid = ema(close, length)
let a = atr(atrLength)
draw mid + mult * a name "Upper" color fade(blue, 0.8)
draw mid name "Middle" color gray
draw mid - mult * a name "Lower" color fade(blue, 0.8)
` },
    { id: "donchian", category: "channels", overlay: true, ...v1,
        titleEn: "Donchian Channels", titleAr: "قنوات دونشيان",
        summaryEn: "Highest high and lowest low of the last N bars, with the midpoint.",
        summaryAr: "أعلى قمة وأدنى قاع في آخر N شمعة، والمنتصف بينهما.",
        credit: "Richard Donchian", source: `${WP}/Donchian_channel`,
        body: `
input length = 20 "Length" 1..500
let up = highest(high, length)
let dn = lowest(low, length)
draw up name "Upper" color blue
draw (up + dn) / 2 name "Middle" color gray
draw dn name "Lower" color blue
` },
    { id: "envelopes", category: "channels", overlay: true, ...v1,
        titleEn: "Moving Average Envelopes", titleAr: "أغلفة المتوسط المتحرك",
        summaryEn: "A moving average with lines a fixed percentage above and below it.",
        summaryAr: "متوسط متحرك وخطان فوقه وتحته بنسبة مئوية ثابتة.",
        credit: "Classic study (public domain)", source: `${CS}/technical-overlays`,
        body: `
input length = 20 "Length" 1..500
input percent = 2.5 "Percent" 0.1..50
input exponential = no "Use EMA"
let mid = exponential ? ema(close, length) : avg(close, length)
draw mid * (1 + percent / 100) name "Upper" color fade(blue, 0.8)
draw mid name "Basis" color gray
draw mid * (1 - percent / 100) name "Lower" color fade(blue, 0.8)
` },
    // ---------------------------------------------------------------- trend
    { id: "parabolic-sar", category: "trend", overlay: true, ...v1,
        titleEn: "Parabolic SAR", titleAr: "البارابوليك سار",
        summaryEn: "Stop-and-reverse dots that trail price and speed up as the trend extends.",
        summaryAr: "نقاط وقف وانعكاس تتبع السعر وتتسارع كلما طال الاتجاه.",
        credit: "J. Welles Wilder Jr.", source: `${WP}/Parabolic_SAR`,
        body: `
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
` },
    { id: "supertrend", category: "trend", overlay: true, ...v1,
        titleEn: "SuperTrend", titleAr: "سوبر ترند",
        summaryEn: "ATR bands around the bar midpoint; the line flips sides when price closes through it.",
        summaryAr: "نطاقات ATR حول منتصف الشمعة؛ ينقلب الخط إلى الجهة الأخرى عندما يُغلق السعر متجاوزًا إياه.",
        credit: "Olivier Seban", source: "https://www.barchart.com/education/technical-indicators/supertrend",
        body: `
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
` },
    { id: "ichimoku", category: "trend", overlay: true, ...v1,
        titleEn: "Ichimoku Cloud", titleAr: "سحابة إيشيموكو",
        summaryEn: "Conversion and base lines plus the cloud, drawn where it lands after the forward shift.",
        summaryAr: "خط التحويل وخط الأساس والسحابة، مرسومة في مكانها بعد الإزاحة للأمام.",
        credit: "Goichi Hosoda", source: `${WP}/Ichimoku_Kink%C5%8D_Hy%C5%8D`,
        body: `
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
` },
    { id: "adx", category: "trend", ...v1,
        titleEn: "ADX and DMI", titleAr: "مؤشر ADX وخطوط الاتجاه DMI",
        summaryEn: "Trend strength (ADX) with the plus and minus directional lines.",
        summaryAr: "قوة الاتجاه (ADX) مع خطي الاتجاه الموجب والسالب.",
        credit: "J. Welles Wilder Jr.", source: `${WP}/Average_directional_movement_index`,
        body: `
input length = 14 "Length" 1..200
input threshold = 25 "Trend threshold" 0..100
let (a, plus, minus) = adx(length)
draw a name "ADX" color gold width 2
draw plus name "+DI" color white
draw minus name "-DI" color blue
level threshold name "Trend" color gray dashed
` },
    { id: "aroon", category: "trend", ...v1,
        titleEn: "Aroon", titleAr: "أرون",
        summaryEn: "How recently the highest high and lowest low happened, as 0 to 100.",
        summaryAr: "منذ متى حدثت أعلى قمة وأدنى قاع، من 0 إلى 100.",
        credit: "Tushar Chande", source: `${CS}/technical-indicators/aroon`,
        body: `
input length = 14 "Length" 1..500
let up = 100 * (length - since_high(high, length + 1)) / length
let dn = 100 * (length - since_low(low, length + 1)) / length
draw up name "Aroon up" color white width 2
draw dn name "Aroon down" color blue width 2
level 70 color fade(gray, 0.5) dashed
level 30 color fade(gray, 0.5) dashed
` },
    // ---------------------------------------------------------------- levels
    { id: "pivots-classic", category: "levels", overlay: true, ...v1,
        titleEn: "Classic Pivot Points (daily)", titleAr: "نقاط الارتكاز الكلاسيكية (يومي)",
        summaryEn: "Floor-trader pivot, three resistances and three supports from the previous day (UTC).",
        summaryAr: "نقطة الارتكاز وثلاث مقاومات وثلاثة دعوم من اليوم السابق (بتوقيت UTC).",
        credit: "Classic floor-trader pivots (public domain)", source: `${WP}/Pivot_point_(technical_analysis)`,
        body: `
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
` },
    // ---------------------------------------------------------------- momentum
    { id: "rsi", category: "momentum", ...v1,
        titleEn: "Relative Strength Index", titleAr: "مؤشر القوة النسبية (RSI)",
        summaryEn: "Wilder's 0 to 100 momentum oscillator with overbought and oversold zones.",
        summaryAr: "مذبذب الزخم لوايلدر من 0 إلى 100، مع منطقتي تشبّع شرائي وبيعي.",
        credit: "J. Welles Wilder Jr.", source: `${WP}/Relative_strength_index`,
        body: `
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
` },
    { id: "stochastic", category: "momentum", ...v1,
        titleEn: "Stochastic Oscillator", titleAr: "الاستوكاستيك",
        summaryEn: "Where the close sits inside the recent high-low range, with a signal line.",
        summaryAr: "موضع الإغلاق داخل مدى القمة والقاع الأخير، مع خط إشارة.",
        credit: "George Lane", source: `${WP}/Stochastic_oscillator`,
        body: `
input length = 14 "%K length" 1..200
input kSmooth = 1 "%K smoothing" 1..50
input dSmooth = 3 "%D length" 1..50
let (k, d) = stoch(length, kSmooth, dSmooth)
draw k name "%K" color blue width 2
draw d name "%D" color gold
level 80 color gray dashed
level 20 color gray dashed
` },
    { id: "stoch-rsi", category: "momentum", ...v1,
        titleEn: "Stochastic RSI", titleAr: "ستوكاستيك RSI",
        summaryEn: "The stochastic formula applied to RSI instead of price, for a faster oscillator.",
        summaryAr: "معادلة الاستوكاستيك مطبقة على الـ RSI بدلًا من السعر، فينتج مذبذب أسرع.",
        credit: "Tushar Chande and Stanley Kroll", source: `${CS}/technical-indicators`,
        body: `
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
` },
    { id: "macd", category: "momentum", ...v1,
        titleEn: "MACD", titleAr: "الماكد (MACD)",
        summaryEn: "Difference of two EMAs, its signal line and the histogram between them.",
        summaryAr: "الفرق بين متوسطين أسيين، وخط الإشارة، والمدرّج التكراري بينهما.",
        credit: "Gerald Appel", source: `${WP}/MACD`,
        body: `
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
` },
    { id: "cci", category: "momentum", ...v1,
        titleEn: "Commodity Channel Index", titleAr: "مؤشر قناة السلع (CCI)",
        summaryEn: "Distance of the typical price from its average, scaled by mean deviation.",
        summaryAr: "بُعد السعر النموذجي عن متوسطه، مقسومًا على متوسط الانحراف.",
        credit: "Donald Lambert", source: `${WP}/Commodity_channel_index`,
        body: `
input length = 20 "Length" 2..500
draw cci(length) name "CCI" color blue width 2
level 100 color gray dashed
level 0 color fade(gray, 0.4)
level -100 color gray dashed
` },
    { id: "williams-r", category: "momentum", ...v1,
        titleEn: "Williams %R", titleAr: "وليامز %R",
        summaryEn: "Close relative to the recent high-low range, from 0 down to -100.",
        summaryAr: "الإغلاق بالنسبة إلى مدى القمة والقاع الأخير، من 0 إلى -100.",
        credit: "Larry Williams", source: `${WP}/Williams_%25R`,
        body: `
input length = 14 "Length" 1..500
draw willr(length) name "%R" color blue width 2
level -20 color gray dashed
level -80 color gray dashed
` },
    { id: "roc", category: "momentum", ...v1,
        titleEn: "Rate of Change", titleAr: "معدل التغير (ROC)",
        summaryEn: "Percent change of the close over N bars.",
        summaryAr: "نسبة تغير الإغلاق على مدار N شمعة.",
        credit: "Classic study (public domain)", source: `${WP}/Momentum_(technical_analysis)`,
        body: `
input length = 9 "Length" 1..500
draw pct(close, length) name "ROC %" color blue width 2
level 0 color fade(gray, 0.5)
` },
    { id: "awesome", category: "momentum", ...v1,
        titleEn: "Awesome Oscillator", titleAr: "المذبذب الرائع (AO)",
        summaryEn: "5-bar minus 34-bar simple average of the bar midpoint, as columns.",
        summaryAr: "متوسط 5 شموع ناقص متوسط 34 شمعة لمنتصف الشمعة، على شكل أعمدة.",
        credit: "Bill Williams", source: `${CS}/technical-indicators`,
        body: `
input fast = 5 "Fast" 1..100
input slow = 34 "Slow" 2..400
let ao = avg(median, fast) - avg(median, slow)
draw ao name "AO" as columns color ao >= prev(ao) ? fade(white, 0.7) : fade(blue, 0.8)
level 0 color fade(gray, 0.5)
` },
    { id: "ultimate", category: "momentum", ...v1,
        titleEn: "Ultimate Oscillator", titleAr: "المذبذب النهائي",
        summaryEn: "Buying pressure averaged over three windows (7, 14 and 28 bars) and weighted 4:2:1.",
        summaryAr: "متوسط ضغط الشراء على ثلاث فترات (7 و14 و28) موزونًا 4:2:1.",
        credit: "Larry Williams", source: `${WP}/Ultimate_oscillator`,
        body: `
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
` },
    { id: "trix", category: "momentum", ...v1,
        titleEn: "TRIX", titleAr: "تريكس (TRIX)",
        summaryEn: "One-bar percent change of a triple-smoothed EMA, with a signal line.",
        summaryAr: "نسبة التغير لشمعة واحدة لمتوسط أسي منعّم ثلاث مرات، مع خط إشارة.",
        credit: "Jack Hutson", source: `${WP}/Trix_(technical_analysis)`,
        body: `
input length = 15 "Length" 1..200
input signal = 9 "Signal" 1..100
let e3 = ema(ema(ema(close, length), length), length)
let t = pct(e3)
draw t name "TRIX %" color blue width 2
draw ema(t, signal) name "Signal" color gold
level 0 color fade(gray, 0.5)
` },
    { id: "cmo", category: "momentum", ...v1,
        titleEn: "Chande Momentum Oscillator", titleAr: "مذبذب تشاندي للزخم",
        summaryEn: "Sum of up moves minus sum of down moves over their total, from -100 to 100.",
        summaryAr: "مجموع الصعود ناقص مجموع الهبوط مقسومًا على إجماليهما، من -100 إلى 100.",
        credit: "Tushar Chande", source: `${CS}/technical-indicators`,
        body: `
input length = 9 "Length" 1..200
let ch = change(close)
let ups = sum(max(ch, 0), length)
let downs = sum(max(-ch, 0), length)
let c = ups + downs > 0 ? 100 * (ups - downs) / (ups + downs) : 0
draw c name "CMO" color blue width 2
level 50 color gray dashed
level 0 color fade(gray, 0.4)
level -50 color gray dashed
` },
    { id: "elder-ray", category: "momentum", ...v1,
        titleEn: "Elder Ray (Bull and Bear Power)", titleAr: "إلدر راي (قوة الثيران والدببة)",
        summaryEn: "High minus EMA (bull power) and low minus EMA (bear power).",
        summaryAr: "القمة ناقص المتوسط الأسي (قوة الثيران) والقاع ناقصه (قوة الدببة).",
        credit: "Alexander Elder", source: `${CS}/technical-indicators`,
        body: `
input length = 13 "EMA length" 1..200
let e = ema(close, length)
draw high - e name "Bull power" as columns color fade(white, 0.6)
draw low - e name "Bear power" as columns color fade(blue, 0.7)
level 0 color fade(gray, 0.5)
` },
    { id: "coppock", category: "momentum", ...v1,
        titleEn: "Coppock Curve", titleAr: "منحنى كوبوك",
        summaryEn: "Weighted average of two rates of change; designed for long-term bottoms on monthly charts.",
        summaryAr: "متوسط موزون لمعدلَي تغيّر؛ صُمّم للقيعان الطويلة على الشارت الشهري.",
        credit: "Edwin Coppock", source: `${WP}/Coppock_curve`,
        body: `
input longRoc = 14 "Long ROC" 1..200
input shortRoc = 11 "Short ROC" 1..200
input wmaLength = 10 "WMA length" 1..200
let c = wma(pct(close, longRoc) + pct(close, shortRoc), wmaLength)
draw c name "Coppock" color blue width 2
level 0 color fade(gray, 0.5)
` },
    // ---------------------------------------------------------------- volatility
    { id: "atr", category: "volatility", ...v1,
        titleEn: "Average True Range", titleAr: "متوسط المدى الحقيقي (ATR)",
        summaryEn: "Wilder-smoothed average of the true range: how much price usually moves per bar.",
        summaryAr: "متوسط المدى الحقيقي بتنعيم وايلدر: مقدار تحرك السعر المعتاد في الشمعة.",
        credit: "J. Welles Wilder Jr.", source: `${WP}/Average_true_range`,
        body: `
input length = 14 "Length" 1..500
draw atr(length) name "ATR" color blue width 2
` },
    { id: "choppiness", category: "volatility", ...v1,
        titleEn: "Choppiness Index", titleAr: "مؤشر التذبذب العرضي (Choppiness)",
        summaryEn: "High values mean sideways chop, low values mean a directional move.",
        summaryAr: "القيم المرتفعة تعني سوقًا عرضيًا، والمنخفضة تعني حركة في اتجاه.",
        credit: "E. W. Dreiss", source: "https://www.barchart.com/trader/help/studies/chop.php",
        body: `
input length = 14 "Length" 2..500
let range = highest(high, length) - lowest(low, length)
let chop = range > 0 ? 100 * log(sum(true_range(), length) / range) / log(length) : none
draw chop name "CHOP" color blue width 2
level 61.8 color gray dashed
level 38.2 color gray dashed
` },
    { id: "historical-volatility", category: "volatility", ...v1,
        titleEn: "Historical Volatility", titleAr: "التذبذب التاريخي",
        summaryEn: "Annualised standard deviation of log returns, in percent.",
        summaryAr: "الانحراف المعياري للعوائد اللوغاريتمية على أساس سنوي، كنسبة مئوية.",
        credit: "Classic study (public domain)", source: `${WP}/Volatility_(finance)`,
        body: `
input length = 20 "Length" 2..500
input perYear = 365 "Bars per year" 1..100000
let r = log(close / prev(close))
draw 100 * stdev(r, length) * sqrt(perYear) name "HV %" color blue width 2
` },
    // ---------------------------------------------------------------- volume
    { id: "obv", category: "volume", ...v1,
        titleEn: "On Balance Volume", titleAr: "حجم التوازن (OBV)",
        summaryEn: "Running total that adds volume on up closes and subtracts it on down closes.",
        summaryAr: "مجموع تراكمي يضيف الحجم عندما يرتفع الإغلاق ويطرحه عندما ينخفض.",
        credit: "Joseph Granville", source: `${WP}/On-balance_volume`,
        body: `
input signal = 20 "Signal EMA" 1..500
let o = obv()
draw o name "OBV" color blue width 2
draw ema(o, signal) name "Signal" color gold
` },
    { id: "mfi", category: "volume", ...v1,
        titleEn: "Money Flow Index", titleAr: "مؤشر تدفق الأموال (MFI)",
        summaryEn: "A volume-weighted RSI built from the typical price.",
        summaryAr: "RSI مرجّح بالحجم ومبني على السعر النموذجي.",
        credit: "Gene Quong and Avrum Soudack", source: `${WP}/Money_flow_index`,
        body: `
input length = 14 "Length" 1..500
draw mfi(length) name "MFI" color blue width 2
level 80 color gray dashed
level 20 color gray dashed
` },
    { id: "cmf", category: "volume", ...v1,
        titleEn: "Chaikin Money Flow", titleAr: "تدفق أموال تشايكن (CMF)",
        summaryEn: "Money flow volume summed over N bars and divided by total volume.",
        summaryAr: "حجم تدفق الأموال على N شمعة مقسوم على إجمالي الحجم.",
        credit: "Marc Chaikin", source: `${CS}/technical-indicators`,
        body: `
input length = 20 "Length" 1..500
let mfm = high > low ? ((close - low) - (high - close)) / (high - low) : 0
let vsum = sum(volume, length)
let c = vsum > 0 ? sum(mfm * volume, length) / vsum : 0
draw c name "CMF" as area color c >= 0 ? fade(white, 0.5) : fade(blue, 0.6)
level 0 color fade(gray, 0.5)
` },
    { id: "accumulation-distribution", category: "volume", ...v1,
        titleEn: "Accumulation / Distribution", titleAr: "التجميع والتوزيع (A/D)",
        summaryEn: "Running total of money flow volume: where in the bar's range the close lands, times volume.",
        summaryAr: "مجموع تراكمي لحجم تدفق الأموال: موضع الإغلاق في مدى الشمعة مضروبًا في الحجم.",
        credit: "Marc Chaikin", source: `${WP}/Accumulation/distribution_index`,
        body: `
let mfm = high > low ? ((close - low) - (high - close)) / (high - low) : 0
keep ad = 0
ad := ad + mfm * volume
draw ad name "A/D" color blue width 2
` },
    { id: "chaikin-oscillator", category: "volume", ...v1,
        titleEn: "Chaikin Oscillator", titleAr: "مذبذب تشايكن",
        summaryEn: "3-bar EMA minus 10-bar EMA of the accumulation/distribution line.",
        summaryAr: "متوسط أسي 3 ناقص متوسط أسي 10 لخط التجميع والتوزيع.",
        credit: "Marc Chaikin", source: `${CS}/technical-indicators`,
        body: `
input fast = 3 "Fast" 1..100
input slow = 10 "Slow" 2..200
let mfm = high > low ? ((close - low) - (high - close)) / (high - low) : 0
keep ad = 0
ad := ad + mfm * volume
let osc = ema(ad, fast) - ema(ad, slow)
draw osc name "Chaikin Osc" color blue width 2
level 0 color fade(gray, 0.5)
` },
    { id: "force-index", category: "volume", ...v1,
        titleEn: "Elder Force Index", titleAr: "مؤشر القوة لإلدر",
        summaryEn: "Price change times volume, smoothed with an EMA.",
        summaryAr: "تغيّر السعر مضروبًا في الحجم، ومنعّمًا بمتوسط أسي.",
        credit: "Alexander Elder", source: `${CS}/technical-indicators/force-index`,
        body: `
input length = 13 "EMA length" 1..200
let f = ema(change(close) * volume, length)
draw f name "Force" color blue width 2
level 0 color fade(gray, 0.5)
` },
    { id: "volume-ma", category: "volume", ...v1,
        titleEn: "Volume with Moving Average", titleAr: "الحجم مع متوسطه",
        summaryEn: "Volume columns with their simple average; bars above average are highlighted.",
        summaryAr: "أعمدة الحجم مع متوسطها البسيط؛ وتظهر الأعمدة التي فوق المتوسط أوضح.",
        credit: "Classic study (public domain)", source: `${CS}/technical-indicators`,
        body: `
input length = 20 "Average length" 1..500
let va = avg(volume, length)
draw volume name "Volume" as columns color volume > va ? fade(white, 0.6) : fade(blue, 0.5)
draw va name "Average" color gold
` },
];
