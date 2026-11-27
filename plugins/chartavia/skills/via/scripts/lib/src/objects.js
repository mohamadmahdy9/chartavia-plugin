"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJECT_FUNC_AR = exports.OBJECT_FUNCS = exports.MAX_CELLS = exports.MAX_LIST = exports.MAX_OBJECTS = void 0;
exports.toText = toText;
exports.MAX_OBJECTS = 500; // per type; the oldest is removed when a script makes more
exports.MAX_LIST = 10_000;
exports.MAX_CELLS = { rows: 30, cols: 12 };
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isList = (v) => Array.isArray(v);
const str = (v) => (typeof v === "string" ? v : undefined);
/** Text form of a value, used by to_text() and by "+" when one side is text. */
function toText(v, digits) {
    if (v === null || v === undefined)
        return "—";
    if (typeof v === "boolean")
        return v ? "yes" : "no";
    if (typeof v === "string")
        return v;
    if (Array.isArray(v))
        return `[${v.map((x) => toText(x, digits)).join(", ")}]`;
    if (!Number.isFinite(v))
        return "—";
    if (digits !== undefined)
        return v.toFixed(Math.max(0, Math.min(10, Math.floor(digits))));
    return String(Math.round(v * 1e6) / 1e6);
}
const STYLES = ["solid", "dashed", "dotted"];
const EXTENDS = ["none", "right", "left", "both"];
const WHERE = ["top_right", "top_left", "bottom_right", "bottom_left"];
function listArg(c, v, fn) {
    if (!isList(v))
        c.fx.fail("type_list", { fn });
    return v;
}
function index(xs, i) {
    if (!isNum(i))
        return null;
    const k = Math.trunc(i) < 0 ? xs.length + Math.trunc(i) : Math.trunc(i);
    return k >= 0 && k < xs.length ? k : null;
}
function grow(c, xs) { if (xs.length >= exports.MAX_LIST)
    c.fx.fail("list_limit", { max: exports.MAX_LIST }); }
const effect = (min, max, f) => ({ min, max, effect: true, f });
const pure = (min, max, f) => ({ min, max, pure: true, f });
function point(c, a, k, what) {
    const b = a[k], p = a[k + 1];
    if (!isNum(b) || !isNum(p))
        c.fx.fail("bad_point", { what });
    return [Math.round(b), p];
}
const timeParts = (t, tz) => {
    const d = new Date(t + (isNum(tz) ? tz : 0) * 3_600_000);
    return d;
};
exports.OBJECT_FUNCS = {
    // ---------- lists ----------
    list: { min: 0, max: 32, f: (a) => [...a] },
    push: effect(2, 2, (a, c) => { const xs = listArg(c, a[0], "push"); grow(c, xs); xs.push(a[1]); return xs.length; }),
    push_front: effect(2, 2, (a, c) => { const xs = listArg(c, a[0], "push_front"); grow(c, xs); xs.unshift(a[1]); return xs.length; }),
    pop: effect(1, 1, (a, c) => listArg(c, a[0], "pop").pop() ?? null),
    pop_front: effect(1, 1, (a, c) => listArg(c, a[0], "pop_front").shift() ?? null),
    remove: effect(2, 2, (a, c) => { const xs = listArg(c, a[0], "remove"); const k = index(xs, a[1]); return k === null ? null : xs.splice(k, 1)[0]; }),
    put: effect(3, 3, (a, c) => { const xs = listArg(c, a[0], "put"); const k = index(xs, a[1]); if (k !== null)
        xs[k] = a[2]; return a[2]; }),
    clear: effect(1, 1, (a, c) => { listArg(c, a[0], "clear").length = 0; return 0; }),
    get: { min: 2, max: 2, f: (a, c) => { const xs = listArg(c, a[0], "get"); const k = index(xs, a[1]); return k === null ? null : xs[k]; } },
    len: { min: 1, max: 1, f: (a, c) => listArg(c, a[0], "len").length },
    list_max: { min: 1, max: 1, f: (a, c) => { const v = listArg(c, a[0], "list_max").filter(isNum); return v.length ? Math.max(...v) : null; } },
    list_min: { min: 1, max: 1, f: (a, c) => { const v = listArg(c, a[0], "list_min").filter(isNum); return v.length ? Math.min(...v) : null; } },
    list_sum: { min: 1, max: 1, f: (a, c) => listArg(c, a[0], "list_sum").filter(isNum).reduce((x, y) => x + y, 0) },
    // ---------- chart objects ----------
    // new_line(bar1, price1, bar2, price2, color?, width?, style?, extend?)
    new_line: effect(4, 8, (a, c) => {
        const [x1, y1] = point(c, a, 0, "new_line"), [x2, y2] = point(c, a, 2, "new_line");
        const w = isNum(a[5]) ? Math.max(1, Math.min(4, Math.round(a[5]))) : 1;
        const style = STYLES.includes(a[6]) ? a[6] : "solid";
        const extend = EXTENDS.includes(a[7]) ? a[7] : "none";
        return c.fx.add({ type: "line", x1, y1, x2, y2, color: str(a[4]) ?? "#7480ff", width: w, style, extend });
    }),
    // new_box(bar1, top, bar2, bottom, color?, fill?, text?)
    new_box: effect(4, 7, (a, c) => {
        const [x1, y1] = point(c, a, 0, "new_box"), [x2, y2] = point(c, a, 2, "new_box");
        const color = str(a[4]) ?? "#7480ff";
        return c.fx.add({ type: "box", x1, y1, x2, y2, color, fill: str(a[5]) ?? color + "33", width: 1, style: "solid", extend: "none", text: str(a[6]) });
    }),
    // new_label(bar, price, text, color?, where?, text_color?). A see-through color (none, or alpha 00) shows the text alone.
    new_label: effect(3, 6, (a, c) => {
        const [x1, y1] = point(c, a, 0, "new_label");
        const where = ["above", "below", "center", "right", "left"].find((w) => w === a[4]) ?? "center";
        return c.fx.add({ type: "label", x1, y1, x2: x1, y2: y1, color: a[3] === null ? "#00000000" : str(a[3]) ?? "#7480ff", width: 1, style: "solid",
            extend: "none", text: toText(a[2]), where, textColor: str(a[5]) });
    }),
    // move(id, bar1, price1, bar2?, price2?)
    move: effect(3, 5, (a, c) => {
        const d = c.fx.get(a[0]);
        if (!d)
            return null;
        const [x1, y1] = point(c, a, 1, "move");
        d.x1 = x1;
        d.y1 = y1;
        if (a.length >= 5) {
            const [x2, y2] = point(c, a, 3, "move");
            d.x2 = x2;
            d.y2 = y2;
        }
        else if (d.type === "label") {
            d.x2 = x1;
            d.y2 = y1;
        }
        return d.id;
    }),
    // stretch(id, bar2): moves only the right end, e.g. to keep a box running to the current bar
    stretch: effect(2, 2, (a, c) => { const d = c.fx.get(a[0]); if (!d || !isNum(a[1]))
        return null; d.x2 = Math.round(a[1]); return d.id; }),
    retext: effect(2, 2, (a, c) => { const d = c.fx.get(a[0]); if (!d)
        return null; d.text = toText(a[1]); return d.id; }),
    recolor: effect(2, 3, (a, c) => {
        const d = c.fx.get(a[0]);
        if (!d)
            return null;
        if (typeof a[1] === "string")
            d.color = a[1];
        if (typeof a[2] === "string")
            d.fill = a[2];
        return d.id;
    }),
    erase: effect(1, 1, (a, c) => { c.fx.erase(a[0]); return null; }),
    exists: { min: 1, max: 1, f: (a, c) => !!c.fx.get(a[0]) },
    y1_of: { min: 1, max: 1, f: (a, c) => c.fx.get(a[0])?.y1 ?? null },
    y2_of: { min: 1, max: 1, f: (a, c) => c.fx.get(a[0])?.y2 ?? null },
    x1_of: { min: 1, max: 1, f: (a, c) => c.fx.get(a[0])?.x1 ?? null },
    x2_of: { min: 1, max: 1, f: (a, c) => c.fx.get(a[0])?.x2 ?? null },
    // ---------- dashboard panel ----------
    // cell(row, col, text, color?, background?)
    cell: effect(3, 5, (a, c) => {
        const r0 = a[0], c0 = a[1];
        if (!isNum(r0) || !isNum(c0))
            return c.fx.fail("bad_cell", {});
        const row = Math.trunc(r0), col = Math.trunc(c0);
        if (row < 0 || col < 0 || row >= exports.MAX_CELLS.rows || col >= exports.MAX_CELLS.cols)
            c.fx.fail("bad_cell", {});
        c.fx.cell({ row, col, text: toText(a[2]), color: str(a[3]), bg: str(a[4]) });
        return null;
    }),
    panel: effect(1, 1, (a, c) => {
        if (!WHERE.includes(a[0]))
            c.fx.fail("bad_panel", { got: toText(a[0]) });
        c.fx.panel(a[0]);
        return null;
    }),
    // ---------- text ----------
    to_text: pure(1, 2, (a) => toText(a[0], isNum(a[1]) ? a[1] : undefined)),
    // ---------- time of day (tz = hours from UTC, e.g. 2 for Cairo winter) ----------
    hour: { min: 0, max: 1, f: (a, c) => timeParts(c.bars.time[c.i], a[0]).getUTCHours() },
    minute: { min: 0, max: 1, f: (a, c) => timeParts(c.bars.time[c.i], a[0]).getUTCMinutes() },
    weekday: { min: 0, max: 1, f: (a, c) => { const d = timeParts(c.bars.time[c.i], a[0]).getUTCDay(); return d === 0 ? 7 : d; } },
    monthday: { min: 0, max: 1, f: (a, c) => timeParts(c.bars.time[c.i], a[0]).getUTCDate() },
    month: { min: 0, max: 1, f: (a, c) => timeParts(c.bars.time[c.i], a[0]).getUTCMonth() + 1 },
    year: { min: 0, max: 1, f: (a, c) => timeParts(c.bars.time[c.i], a[0]).getUTCFullYear() },
    // in_session(start_hhmm, end_hhmm, tz?): yes when the bar opens inside the window; windows may cross midnight
    in_session: {
        min: 2, max: 3,
        f: (a, c) => {
            if (!isNum(a[0]) || !isNum(a[1]))
                return false;
            const d = timeParts(c.bars.time[c.i], a[2]);
            const now = d.getUTCHours() * 60 + d.getUTCMinutes();
            const s = Math.floor(a[0] / 100) * 60 + (a[0] % 100), e = Math.floor(a[1] / 100) * 60 + (a[1] % 100);
            return s <= e ? now >= s && now < e : now >= s || now < e;
        },
    },
    // bar_minutes(): the chart's timeframe in minutes, read from the spacing of the loaded bars
    bar_minutes: {
        min: 0, max: 0,
        f: (_a, c) => {
            const t = c.bars.time;
            if (t.length < 2)
                return null;
            const gaps = [];
            for (let j = 1; j < Math.min(t.length, 50); j++)
                gaps.push(t[j] - t[j - 1]);
            gaps.sort((x, y) => x - y);
            return gaps[gaps.length >> 1] / 60_000;
        },
    },
    // ---------- higher timeframe ----------
    // htf(field, minutes, back = 0): open/high/low/close of a higher-timeframe bar built from the chart's bars.
    // back = 0 is the bar still forming (only data up to this bar, never the future); 1 is the last finished one.
    htf: {
        min: 2, max: 3,
        f: (a, c) => {
            const field = a[0], mins = a[1];
            if (field !== "open" && field !== "high" && field !== "low" && field !== "close")
                return c.fx.fail("bad_field", { got: toText(field) });
            if (!isNum(mins) || mins < 1)
                return c.fx.fail("bad_length", { name: "htf", got: toText(mins) });
            const back = isNum(a[2]) ? Math.max(0, Math.trunc(a[2])) : 0;
            const ms = Math.round(mins) * 60_000;
            const shift = ms % (7 * 864e5) === 0 ? 4 * 864e5 : 0; // weeks start on Monday
            const st = c.st;
            const bk = (st.bk ??= []);
            const b = c.bars;
            for (let j = (st.upto ?? -1) + 1; j <= c.i; j++) {
                const k = Math.floor((b.time[j] - shift) / ms);
                const last = bk[bk.length - 1];
                if (!last || last.k !== k) {
                    bk.push({ k, open: b.open[j], high: b.high[j], low: b.low[j], close: b.close[j] });
                    if (bk.length > 1000)
                        bk.shift();
                }
                else {
                    last.high = Math.max(last.high, b.high[j]);
                    last.low = Math.min(last.low, b.low[j]);
                    last.close = b.close[j];
                }
            }
            st.upto = c.i;
            return bk[bk.length - 1 - back]?.[field] ?? null;
        },
    },
};
exports.OBJECT_FUNC_AR = {
    "قائمة": "list", "أضف": "push", "اسحب": "pop", "عنصر": "get", "عدد": "len",
    "خط_جديد": "new_line", "صندوق_جديد": "new_box", "لافتة_جديدة": "new_label", "حرّك": "move", "امسح": "erase",
    "خلية": "cell", "لوحة": "panel", "نص": "to_text", "ساعة": "hour", "فريم_أعلى": "htf",
};
