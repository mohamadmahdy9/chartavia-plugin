"use strict";
// Bilingual reference of Via's built-in functions and series. Used by the docs page and
// the Claude plugin reference (keep in step with src/builtins.ts; a test checks the names).
Object.defineProperty(exports, "__esModule", { value: true });
exports.ARABIC_FN_ALIASES = exports.FN_GROUPS = exports.SERIES_DOCS = void 0;
exports.SERIES_DOCS = [
    { name: "open", ar: "افتتاح", en: "Bar open price", arDesc: "سعر افتتاح الشمعة" },
    { name: "high", ar: "أعلى", en: "Bar high", arDesc: "أعلى سعر في الشمعة" },
    { name: "low", ar: "أدنى", en: "Bar low", arDesc: "أدنى سعر في الشمعة" },
    { name: "close", ar: "إغلاق", en: "Bar close", arDesc: "سعر إغلاق الشمعة" },
    { name: "volume", ar: "حجم", en: "Bar volume", arDesc: "حجم التداول في الشمعة" },
    { name: "time", ar: "وقت", en: "Bar open time in ms since 1970 (UTC)", arDesc: "وقت فتح الشمعة بالمللي ثانية (UTC)" },
    { name: "bar", ar: "شمعة", en: "Bar index, 0 is the oldest loaded bar", arDesc: "رقم الشمعة، 0 هي أقدم شمعة محمّلة" },
    { name: "median", en: "(high + low) / 2", arDesc: "(أعلى + أدنى) / 2" },
    { name: "typical", en: "(high + low + close) / 3", arDesc: "(أعلى + أدنى + إغلاق) / 3" },
    { name: "last", ar: "أخيرة", en: "yes only on the newest bar", arDesc: "نعم في آخر شمعة فقط" },
    { name: "position", en: "1 long, -1 short, 0 flat", arDesc: "1 شراء، -1 بيع، 0 بدون صفقة", expert: true },
    { name: "entry_price", en: "Entry price of the open position, or none", arDesc: "سعر دخول الصفقة المفتوحة أو لاشيء", expert: true },
    { name: "bars_in_trade", en: "Bars since the open position was entered", arDesc: "عدد الشموع منذ الدخول في الصفقة", expert: true },
    { name: "equity", en: "Cash plus open position value", arDesc: "الرصيد + قيمة الصفقة المفتوحة", expert: true },
    { name: "profit", en: "Open profit of the position", arDesc: "الربح غير المحقق للصفقة المفتوحة", expert: true },
];
exports.FN_GROUPS = [
    {
        id: "averages", en: "Averages and smoothing", ar: "المتوسطات والتنعيم",
        items: [
            { sig: "avg(x, n)", en: "Simple average of the last n values.", ar: "المتوسط البسيط لآخر n قيمة.", example: "avg(close, 20)" },
            { sig: "ema(x, n)", en: "Exponential average, weight 2/(n+1), seeded with the simple average.", ar: "المتوسط الأسي بوزن 2/(n+1)، يبدأ من المتوسط البسيط.", example: "ema(close, 9)" },
            { sig: "wma(x, n)", en: "Linearly weighted average (newest weighs most).", ar: "المتوسط الموزون خطيًا (الأحدث له الوزن الأكبر).", example: "wma(close, 10)" },
            { sig: "smooth(x, n)", en: "Wilder smoothing, weight 1/n.", ar: "تنعيم وايلدر بوزن 1/n.", example: "smooth(close, 14)" },
            { sig: "hull(x, n)", en: "Fast, low-lag Hull-style average.", ar: "متوسط سريع قليل التأخير على طريقة هَل.", example: "hull(close, 16)" },
            { sig: "vwap()", en: "Volume-weighted average price, resets every UTC day.", ar: "متوسط السعر المرجّح بالحجم، يبدأ من جديد كل يوم (UTC).", example: "vwap()" },
        ],
    },
    {
        id: "window", en: "Window statistics", ar: "إحصاءات النافذة",
        items: [
            { sig: "sum(x, n)", en: "Sum of the last n values.", ar: "مجموع آخر n قيمة." },
            { sig: "highest(x, n)", en: "Highest of the last n values.", ar: "أعلى قيمة في آخر n.", example: "highest(high, 20)" },
            { sig: "lowest(x, n)", en: "Lowest of the last n values.", ar: "أقل قيمة في آخر n.", example: "lowest(low, 20)" },
            { sig: "stdev(x, n)", en: "Standard deviation of the last n values.", ar: "الانحراف المعياري لآخر n قيمة." },
            { sig: "median_of(x, n)", en: "Median of the last n values.", ar: "الوسيط لآخر n قيمة." },
            { sig: "since_high(x, n)", en: "Bars since the highest value in the window (0 = this bar).", ar: "عدد الشموع منذ أعلى قيمة في النافذة (0 = الشمعة الحالية)." },
            { sig: "since_low(x, n)", en: "Bars since the lowest value in the window.", ar: "عدد الشموع منذ أقل قيمة في النافذة." },
        ],
    },
    {
        id: "bars", en: "Bar to bar", ar: "بين الشموع",
        items: [
            { sig: "prev(x, k = 1)", en: "Value of x k bars ago.", ar: "قيمة x من k شمعة فاتت.", example: "prev(close, 3)" },
            { sig: "change(x, k = 1)", en: "x minus its value k bars ago.", ar: "الفرق بين x وقيمتها من k شمعة." },
            { sig: "pct(x, k = 1)", en: "Percent change over k bars.", ar: "نسبة التغير خلال k شمعة." },
            { sig: "crossup(a, b)", en: "yes on the bar where a goes from ≤ b to > b.", ar: "نعم في الشمعة اللي a فيها عدّت فوق b.", example: "crossup(ema(close, 9), ema(close, 21))" },
            { sig: "crossdown(a, b)", en: "yes on the bar where a goes from ≥ b to < b.", ar: "نعم في الشمعة اللي a فيها نزلت تحت b." },
            { sig: "rising(x, n)", en: "x grew on each of the last n bars.", ar: "x زادت في كل شمعة من آخر n." },
            { sig: "falling(x, n)", en: "x dropped on each of the last n bars.", ar: "x قلّت في كل شمعة من آخر n." },
            { sig: "bars_since(cond)", en: "Bars since cond was last yes (none if never).", ar: "عدد الشموع من آخر مرة الشرط كان نعم." },
            { sig: "either(x, fallback)", en: "x, or fallback when x is none.", ar: "x، أو البديل لو x لاشيء.", example: "either(prev(close), open)" },
        ],
    },
    {
        id: "studies", en: "Ready-made studies", ar: "مؤشرات جاهزة",
        items: [
            { sig: "rsi(x, n)", en: "Relative strength index, 0 to 100.", ar: "مؤشر القوة النسبية من 0 لـ 100.", example: "rsi(close, 14)" },
            { sig: "atr(n)", en: "Average true range (Wilder).", ar: "متوسط المدى الحقيقي.", example: "atr(14)" },
            { sig: "true_range()", en: "True range of this bar.", ar: "المدى الحقيقي للشمعة الحالية." },
            { sig: "macd(x, fast, slow, signal)", en: "Returns (line, signal, hist).", ar: "تُرجع (الخط، الإشارة، الهيستوجرام).", example: "let (l, s, h) = macd(close, 12, 26, 9)" },
            { sig: "bands(x, n, k)", en: "Standard deviation bands. Returns (upper, middle, lower).", ar: "نطاقات الانحراف المعياري. تُرجع (العلوي، الأوسط، السفلي).", example: "let (u, m, d) = bands(close, 20, 2)" },
            { sig: "stoch(n, k_smooth, d_smooth)", en: "Stochastic oscillator. Returns (k, d).", ar: "مذبذب الاستوكاستيك. يُرجع (k, d).", example: "let (k, d) = stoch(14, 3, 3)" },
            { sig: "adx(n)", en: "Trend strength. Returns (adx, plus, minus).", ar: "قوة الاتجاه. تُرجع (adx، الموجب، السالب).", example: "let (a, p, m) = adx(14)" },
            { sig: "cci(n)", en: "Commodity channel index.", ar: "مؤشر قناة السلع." },
            { sig: "mfi(n)", en: "Money flow index, 0 to 100.", ar: "مؤشر تدفق الأموال من 0 لـ 100." },
            { sig: "obv()", en: "On-balance volume.", ar: "حجم التوازن." },
            { sig: "willr(n)", en: "Williams range, -100 to 0.", ar: "مؤشر ويليامز من -100 لـ 0." },
            { sig: "momentum(x, n)", en: "x minus x n bars ago.", ar: "x ناقص قيمتها من n شمعة." },
        ],
    },
    {
        id: "math", en: "Math", ar: "الرياضيات",
        items: [
            { sig: "abs(x)", en: "Absolute value.", ar: "القيمة المطلقة." },
            { sig: "min(a, b, ...)", en: "Smallest value.", ar: "أصغر قيمة." },
            { sig: "max(a, b, ...)", en: "Largest value.", ar: "أكبر قيمة." },
            { sig: "round(x, digits = 0)", en: "Round to digits after the point.", ar: "تقريب لعدد من الخانات العشرية." },
            { sig: "floor(x)", en: "Round down.", ar: "تقريب لأسفل." },
            { sig: "ceil(x)", en: "Round up.", ar: "تقريب لأعلى." },
            { sig: "sqrt(x)", en: "Square root.", ar: "الجذر التربيعي." },
            { sig: "log(x)", en: "Natural logarithm.", ar: "اللوغاريتم الطبيعي." },
            { sig: "exp(x)", en: "e to the power x.", ar: "e أُس x." },
            { sig: "pow(a, b)", en: "a to the power b (same as a ^ b).", ar: "a أُس b (زي a ^ b)." },
            { sig: "clamp(x, lo, hi)", en: "Keep x between lo and hi.", ar: "حصر x بين lo و hi." },
            { sig: "sign(x)", en: "-1, 0 or 1.", ar: "-1 أو 0 أو 1." },
            { sig: "fade(color, alpha)", en: "Same color with opacity 0..1.", ar: "نفس اللون بشفافية من 0 لـ 1.", example: "fade(blue, 0.4)" },
        ],
    },
];
exports.ARABIC_FN_ALIASES = [
    ["متوسط", "avg"], ["متوسط_أسي", "ema"], ["سابق", "prev"], ["تقاطع_صاعد", "crossup"], ["تقاطع_هابط", "crossdown"],
    ["أعلى_قيمة", "highest"], ["أدنى_قيمة", "lowest"], ["مجموع", "sum"], ["انحراف", "stdev"], ["قوة_نسبية", "rsi"],
    ["مدى_حقيقي", "atr"], ["قيمة_مطلقة", "abs"], ["تقريب", "round"], ["أكبر", "max"], ["أصغر", "min"],
];
