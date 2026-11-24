"use strict";
// Built-in series, colors and functions of the Via language.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNC_AR = exports.FUNCS = exports.CONSTANTS = exports.THEME_DARK = exports.THEME_LIGHT = exports.COLORS = exports.POSITION_SERIES = exports.BAR_SERIES = exports.SERIES_AR = void 0;
exports.themeColor = themeColor;
// ---------- names ----------
exports.SERIES_AR = {
    "افتتاح": "open", "أعلى": "high", "اعلى": "high", "أدنى": "low", "ادنى": "low", "إغلاق": "close", "اغلاق": "close",
    "حجم": "volume", "وقت": "time", "شمعة": "bar", "أخيرة": "last", "اخيرة": "last",
};
exports.BAR_SERIES = ["open", "high", "low", "close", "volume", "time", "bar", "median", "typical", "last"];
exports.POSITION_SERIES = ["position", "entry_price", "bars_in_trade", "equity", "profit"];
// Named colors use the dark-theme value; THEME_LIGHT gives the light-theme twin so lines stay readable.
exports.COLORS = {
    blue: "#7480ff", white: "#f3efe7", ink: "#17161a", gray: "#8c8578", sky: "#6fa8ff", gold: "#ffb547",
    sand: "#c9b48a", rose: "#ff6a8c", mint: "#5fc9a8", violet: "#a08cff",
    "أزرق": "#7480ff", "ازرق": "#7480ff", "أبيض": "#f3efe7", "ابيض": "#f3efe7", "حبر": "#17161a", "رمادي": "#8c8578",
    "ذهبي": "#ffb547", "وردي": "#ff6a8c", "بنفسجي": "#a08cff", "سماوي": "#6fa8ff", "أخضر": "#5fc9a8", "اخضر": "#5fc9a8", "رملي": "#c9b48a",
};
exports.THEME_LIGHT = {
    "#7480ff": "#3540d6", "#f3efe7": "#17161a", "#17161a": "#17161a", "#8c8578": "#8f8676", "#6fa8ff": "#2f6fd6",
    "#ffb547": "#b36b00", "#c9b48a": "#8a7444", "#ff6a8c": "#c2366b", "#5fc9a8": "#1e8a6a", "#a08cff": "#6a4fd6",
};
exports.THEME_DARK = { "#17161a": "#f3efe7" };
/** Maps a script color to the active theme (keeps any alpha suffix). */
function themeColor(c, theme) {
    if (!/^#[0-9a-f]{6}/i.test(c))
        return c;
    const base = c.slice(0, 7).toLowerCase(), alpha = c.slice(7);
    const map = theme === "light" ? exports.THEME_LIGHT : exports.THEME_DARK;
    return (map[base] ?? base) + alpha;
}
exports.CONSTANTS = { pi: Math.PI };
// ---------- helpers ----------
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const nums = (s, n) => {
    const out = [];
    for (let k = 0; k < n; k++) {
        const v = s.at(k);
        if (!isNum(v))
            return null;
        out.push(v);
    }
    return out;
};
/** Runs a recursive (stateful) step once per bar, catching up missed bars when the source is full. */
function rec(c, key, x, init, step) {
    const st = c.st;
    let r = st[key];
    if (!r) {
        const b = init();
        r = st[key] = { base: b, cur: b, bar: -1 };
    }
    if (r.bar !== c.i) {
        if (r.bar >= 0)
            r.base = r.cur;
        if (x.full)
            for (let j = r.bar + 1; j < c.i; j++)
                r.base = step(r.base, x.at(c.i - j), j);
        r.bar = c.i;
    }
    r.cur = step(r.base, x.at(0), c.i);
    return r.cur;
}
const avgInit = (n) => () => ({ n, count: 0, sum: 0, val: null });
const avgStep = (alpha) => (s, v) => {
    if (!isNum(v))
        return s;
    if (s.count < s.n) {
        const count = s.count + 1, sum = s.sum + v;
        return { ...s, count, sum, val: count === s.n ? sum / s.n : null };
    }
    const a = alpha(s.n);
    return { ...s, val: v * a + s.val * (1 - a) };
};
const emaStep = avgStep((n) => 2 / (n + 1));
const wilderStep = avgStep((n) => 1 / n);
function wmaOf(vals) {
    const n = vals.length;
    let s = 0;
    for (let k = 0; k < n; k++)
        s += vals[k] * (n - k);
    return s / ((n * (n + 1)) / 2);
}
function barS(c, arr) { return { full: true, at: (k) => (c.i - k >= 0 ? arr[c.i - k] : null) }; }
function trAt(b, j) {
    if (j === 0)
        return b.high[0] - b.low[0];
    return Math.max(b.high[j] - b.low[j], Math.abs(b.high[j] - b.close[j - 1]), Math.abs(b.low[j] - b.close[j - 1]));
}
function trS(c) { return { full: true, at: (k) => (c.i - k >= 0 ? trAt(c.bars, c.i - k) : null) }; }
function typAt(b, j) { return (b.high[j] + b.low[j] + b.close[j]) / 3; }
const window1 = (fn) => ({
    min: 2, max: 2, series: [0],
    f: (a, c) => { const n = c.len(a[1], "window"); const v = nums(c.arg(0), n); return v ? fn(v) : null; },
});
const num1 = (fn) => ({
    min: 1, max: 1, pure: true,
    f: (a) => { if (!isNum(a[0]))
        return null; const r = fn(a[0]); return Number.isFinite(r) ? r : null; },
});
function stdevOf(v) { const m = v.reduce((x, y) => x + y, 0) / v.length; return Math.sqrt(v.reduce((x, y) => x + (y - m) ** 2, 0) / v.length); }
function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "").slice(0, 6);
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
    return `#${h}${a}`;
}
// ---------- functions ----------
exports.FUNCS = {
    // averages
    avg: window1((v) => v.reduce((x, y) => x + y, 0) / v.length),
    ema: { min: 2, max: 2, series: [0], f: (a, c) => rec(c, "e", c.arg(0), avgInit(c.len(a[1], "ema")), emaStep).val },
    smooth: { min: 2, max: 2, series: [0], f: (a, c) => rec(c, "w", c.arg(0), avgInit(c.len(a[1], "smooth")), wilderStep).val },
    wma: window1(wmaOf),
    hull: {
        min: 2, max: 2, series: [0],
        f: (a, c) => {
            const n = c.len(a[1], "hull");
            const h = Math.max(1, Math.floor(n / 2));
            const m = Math.max(1, Math.round(Math.sqrt(n)));
            const r = rec(c, "h", c.arg(0), () => ({ xs: [], ds: [] }), (s, v) => {
                if (!isNum(v))
                    return s;
                const xs = [v, ...s.xs].slice(0, n);
                if (xs.length < n)
                    return { xs, ds: s.ds };
                const d = 2 * wmaOf(xs.slice(0, h)) - wmaOf(xs);
                return { xs, ds: [d, ...s.ds].slice(0, m) };
            });
            return r.ds.length === m ? wmaOf(r.ds) : null;
        },
    },
    vwap: {
        min: 0, max: 0,
        f: (_a, c) => {
            const r = rec(c, "v", barS(c, c.bars.close), () => ({ day: -1, pv: 0, v: 0 }), (s, _x, j) => {
                const b = c.bars;
                const day = Math.floor(b.time[j] / 864e5);
                const base = day === s.day ? s : { day, pv: 0, v: 0 };
                const vol = b.volume[j] || 0;
                return { day, pv: base.pv + typAt(b, j) * vol, v: base.v + vol };
            });
            return r.v ? r.pv / r.v : null;
        },
    },
    // window statistics
    sum: window1((v) => v.reduce((x, y) => x + y, 0)),
    highest: window1((v) => Math.max(...v)),
    lowest: window1((v) => Math.min(...v)),
    stdev: window1(stdevOf),
    median_of: window1((v) => { const s = [...v].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }),
    since_high: window1((v) => v.indexOf(Math.max(...v))),
    since_low: window1((v) => v.indexOf(Math.min(...v))),
    // bar to bar
    prev: { min: 1, max: 2, series: [0], f: (a, c) => c.arg(0).at(a.length > 1 ? c.len(a[1], "prev") : 1) },
    change: {
        min: 1, max: 2, series: [0],
        f: (a, c) => { const s = c.arg(0); const k = a.length > 1 ? c.len(a[1], "change") : 1; const x = s.at(0), y = s.at(k); return isNum(x) && isNum(y) ? x - y : null; },
    },
    pct: {
        min: 1, max: 2, series: [0],
        f: (a, c) => { const s = c.arg(0); const k = a.length > 1 ? c.len(a[1], "pct") : 1; const x = s.at(0), y = s.at(k); return isNum(x) && isNum(y) && y !== 0 ? ((x - y) / y) * 100 : null; },
    },
    crossup: {
        min: 2, max: 2, series: [0, 1],
        f: (_a, c) => { const [x, y] = [c.arg(0), c.arg(1)]; const [x0, y0, x1, y1] = [x.at(0), y.at(0), x.at(1), y.at(1)]; return isNum(x0) && isNum(y0) && isNum(x1) && isNum(y1) && x0 > y0 && x1 <= y1; },
    },
    crossdown: {
        min: 2, max: 2, series: [0, 1],
        f: (_a, c) => { const [x, y] = [c.arg(0), c.arg(1)]; const [x0, y0, x1, y1] = [x.at(0), y.at(0), x.at(1), y.at(1)]; return isNum(x0) && isNum(y0) && isNum(x1) && isNum(y1) && x0 < y0 && x1 >= y1; },
    },
    rising: { min: 2, max: 2, series: [0], f: (a, c) => { const n = c.len(a[1], "rising"); const v = nums(c.arg(0), n + 1); if (!v)
            return false; for (let k = 0; k < n; k++)
            if (!(v[k] > v[k + 1]))
                return false; return true; } },
    falling: { min: 2, max: 2, series: [0], f: (a, c) => { const n = c.len(a[1], "falling"); const v = nums(c.arg(0), n + 1); if (!v)
            return false; for (let k = 0; k < n; k++)
            if (!(v[k] < v[k + 1]))
                return false; return true; } },
    bars_since: {
        min: 1, max: 1, series: [0],
        f: (_a, c) => rec(c, "b", c.arg(0), () => null, (s, v) => (v === true || (isNum(v) && v !== 0) ? 0 : s === null ? null : s + 1)),
    },
    either: { min: 2, max: 2, pure: true, f: (a) => (a[0] === null || (typeof a[0] === "number" && !Number.isFinite(a[0])) ? a[1] : a[0]) },
    // studies
    rsi: {
        min: 2, max: 2, series: [0],
        f: (a, c) => {
            const n = c.len(a[1], "rsi");
            const r = rec(c, "r", c.arg(0), () => ({ p: null, g: avgInit(n)(), l: avgInit(n)() }), (s, v) => {
                if (!isNum(v))
                    return s;
                if (s.p === null)
                    return { ...s, p: v };
                const d = v - s.p;
                return { p: v, g: wilderStep(s.g, Math.max(d, 0)), l: wilderStep(s.l, Math.max(-d, 0)) };
            });
            if (r.g.val === null || r.l.val === null)
                return null;
            return r.l.val === 0 ? (r.g.val === 0 ? 50 : 100) : 100 - 100 / (1 + r.g.val / r.l.val);
        },
    },
    true_range: { min: 0, max: 0, f: (_a, c) => trAt(c.bars, c.i) },
    atr: { min: 1, max: 1, f: (a, c) => rec(c, "a", trS(c), avgInit(c.len(a[0], "atr")), wilderStep).val },
    macd: {
        min: 4, max: 4, tuple: 3, series: [0],
        f: (a, c) => {
            const [f, s, g] = [c.len(a[1], "macd"), c.len(a[2], "macd"), c.len(a[3], "macd")];
            const r = rec(c, "m", c.arg(0), () => ({ f: avgInit(f)(), s: avgInit(s)(), g: avgInit(g)(), line: null }), (st, v) => {
                const nf = emaStep(st.f, v), ns = emaStep(st.s, v);
                const line = nf.val !== null && ns.val !== null ? nf.val - ns.val : null;
                return { f: nf, s: ns, g: line === null ? st.g : emaStep(st.g, line), line };
            });
            const sig = r.line === null ? null : r.g.val;
            return [r.line, sig, r.line !== null && sig !== null ? r.line - sig : null];
        },
    },
    bands: {
        min: 3, max: 3, tuple: 3, series: [0],
        f: (a, c) => {
            const n = c.len(a[1], "bands");
            const k = c.num(a[2], "bands") ?? 2;
            const v = nums(c.arg(0), n);
            if (!v)
                return [null, null, null];
            const m = v.reduce((x, y) => x + y, 0) / n;
            const d = stdevOf(v);
            return [m + k * d, m, m - k * d];
        },
    },
    stoch: {
        min: 3, max: 3, tuple: 2,
        f: (a, c) => {
            const [n, ks, ds] = [c.len(a[0], "stoch"), c.len(a[1], "stoch"), c.len(a[2], "stoch")];
            const b = c.bars;
            const r = rec(c, "s", barS(c, b.close), () => ({ raw: [], k: [] }), (s, _v, j) => {
                if (j < n - 1)
                    return s;
                let h = -Infinity, l = Infinity;
                for (let q = j - n + 1; q <= j; q++) {
                    h = Math.max(h, b.high[q]);
                    l = Math.min(l, b.low[q]);
                }
                const raw = [h === l ? 50 : ((b.close[j] - l) / (h - l)) * 100, ...s.raw].slice(0, ks);
                if (raw.length < ks)
                    return { raw, k: s.k };
                const kv = raw.reduce((x, y) => x + y, 0) / ks;
                return { raw, k: [kv, ...s.k].slice(0, ds) };
            });
            if (!r.k.length)
                return [null, null];
            return [r.k[0], r.k.length === ds ? r.k.reduce((x, y) => x + y, 0) / ds : null];
        },
    },
    adx: {
        min: 1, max: 1, tuple: 3,
        f: (a, c) => {
            const n = c.len(a[0], "adx");
            const b = c.bars;
            const r = rec(c, "d", barS(c, b.close), () => ({ tr: avgInit(n)(), p: avgInit(n)(), m: avgInit(n)(), dx: avgInit(n)(), plus: null, minus: null }), (s, _v, j) => {
                if (j === 0)
                    return s;
                const up = b.high[j] - b.high[j - 1], dn = b.low[j - 1] - b.low[j];
                const pdm = up > dn && up > 0 ? up : 0, mdm = dn > up && dn > 0 ? dn : 0;
                const tr = wilderStep(s.tr, trAt(b, j)), p = wilderStep(s.p, pdm), m = wilderStep(s.m, mdm);
                if (tr.val === null || p.val === null || m.val === null || tr.val === 0)
                    return { ...s, tr, p, m };
                const plus = (100 * p.val) / tr.val, minus = (100 * m.val) / tr.val;
                const dx = plus + minus === 0 ? 0 : (100 * Math.abs(plus - minus)) / (plus + minus);
                return { tr, p, m, dx: wilderStep(s.dx, dx), plus, minus };
            });
            return [r.dx.val, r.plus, r.minus];
        },
    },
    cci: {
        min: 1, max: 1,
        f: (a, c) => {
            const n = c.len(a[0], "cci");
            if (c.i < n - 1)
                return null;
            const t = [];
            for (let j = c.i - n + 1; j <= c.i; j++)
                t.push(typAt(c.bars, j));
            const m = t.reduce((x, y) => x + y, 0) / n;
            const md = t.reduce((x, y) => x + Math.abs(y - m), 0) / n;
            return md === 0 ? 0 : (t[n - 1] - m) / (0.015 * md);
        },
    },
    mfi: {
        min: 1, max: 1,
        f: (a, c) => {
            const n = c.len(a[0], "mfi");
            if (c.i < n)
                return null;
            let pos = 0, neg = 0;
            const b = c.bars;
            for (let j = c.i - n + 1; j <= c.i; j++) {
                const tp = typAt(b, j), pt = typAt(b, j - 1), f = tp * (b.volume[j] || 0);
                if (tp > pt)
                    pos += f;
                else if (tp < pt)
                    neg += f;
            }
            return neg === 0 ? 100 : 100 - 100 / (1 + pos / neg);
        },
    },
    obv: {
        min: 0, max: 0,
        f: (_a, c) => rec(c, "o", barS(c, c.bars.close), () => 0, (s, _v, j) => {
            if (j === 0)
                return 0;
            const b = c.bars;
            return b.close[j] > b.close[j - 1] ? s + (b.volume[j] || 0) : b.close[j] < b.close[j - 1] ? s - (b.volume[j] || 0) : s;
        }),
    },
    willr: {
        min: 1, max: 1,
        f: (a, c) => {
            const n = c.len(a[0], "willr");
            if (c.i < n - 1)
                return null;
            const b = c.bars;
            let h = -Infinity, l = Infinity;
            for (let j = c.i - n + 1; j <= c.i; j++) {
                h = Math.max(h, b.high[j]);
                l = Math.min(l, b.low[j]);
            }
            return h === l ? -50 : ((h - b.close[c.i]) / (h - l)) * -100;
        },
    },
    momentum: { min: 2, max: 2, series: [0], f: (a, c) => { const s = c.arg(0); const x = s.at(0), y = s.at(c.len(a[1], "momentum")); return isNum(x) && isNum(y) ? x - y : null; } },
    // math
    abs: num1(Math.abs), floor: num1(Math.floor), ceil: num1(Math.ceil), sqrt: num1(Math.sqrt),
    log: num1(Math.log), exp: num1(Math.exp), sign: num1(Math.sign),
    round: {
        min: 1, max: 2, pure: true,
        f: (a) => { if (!isNum(a[0]))
            return null; const d = isNum(a[1]) ? Math.max(0, Math.min(10, Math.floor(a[1]))) : 0; const p = 10 ** d; return Math.round(a[0] * p) / p; },
    },
    pow: { min: 2, max: 2, pure: true, f: (a) => (isNum(a[0]) && isNum(a[1]) && Number.isFinite(a[0] ** a[1]) ? a[0] ** a[1] : null) },
    min: { min: 1, max: 32, pure: true, f: (a) => (a.every(isNum) ? Math.min(...a) : null) },
    max: { min: 1, max: 32, pure: true, f: (a) => (a.every(isNum) ? Math.max(...a) : null) },
    clamp: { min: 3, max: 3, pure: true, f: (a) => (isNum(a[0]) && isNum(a[1]) && isNum(a[2]) ? Math.min(a[2], Math.max(a[1], a[0])) : null) },
    fade: {
        min: 2, max: 2, pure: true,
        f: (a) => (typeof a[0] === "string" && /^#[0-9a-f]{6}/i.test(a[0]) && isNum(a[1]) ? hexToRgba(a[0], a[1]) : a[0]),
    },
};
// Arabic aliases for the most used functions.
exports.FUNC_AR = {
    "متوسط": "avg", "متوسط_أسي": "ema", "سابق": "prev", "تقاطع_صاعد": "crossup", "تقاطع_هابط": "crossdown",
    "أعلى_قيمة": "highest", "أدنى_قيمة": "lowest", "مجموع": "sum", "انحراف": "stdev", "قوة_نسبية": "rsi",
    "مدى_حقيقي": "atr", "قيمة_مطلقة": "abs", "تقريب": "round", "أكبر": "max", "أصغر": "min",
};
