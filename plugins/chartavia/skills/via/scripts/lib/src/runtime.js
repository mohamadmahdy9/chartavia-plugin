"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputsOf = inputsOf;
exports.run = run;
const builtins_1 = require("./builtins");
const check_1 = require("./check");
const errors_1 = require("./errors");
const objects_1 = require("./objects");
const LOOP_LIMIT = 5000, MAX_MARKS = 500;
const DEFAULT_COLORS = ["#7480ff", "#f3efe7", "#ffb547", "#6fa8ff", "#ff6a8c", "#5fc9a8", "#a08cff", "#c9b48a"];
function inputsOf(p) {
    return p.body.filter((s) => s.k === "input").map((s) => ({
        name: s.name, label: s.label, def: s.def, min: s.min, max: s.max, type: s.time ? "time" : typeof s.def === "boolean" ? "bool" : typeof s.def === "string" ? "color" : "number",
        ...(s.group ? { group: s.group } : {}), ...(s.options ? { options: s.options } : {}),
    }));
}
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const truthy = (v) => v === true || (isNum(v) && v !== 0);
const kindOf = (v) => (v === null ? "none" : Array.isArray(v) ? "a group" : typeof v === "boolean" ? "yes/no" : typeof v === "string" ? "text" : "number");
function run(p, input, opts = {}) {
    const n = input.length;
    const bars = {
        time: input.map((b) => b.time), open: input.map((b) => b.open), high: input.map((b) => b.high),
        low: input.map((b) => b.low), close: input.map((b) => b.close), volume: input.map((b) => b.volume ?? 0),
    };
    const maxOps = opts.maxOps ?? 5_000_000, maxMs = opts.maxMs ?? 1500;
    const started = Date.now();
    let ops = 0;
    const warnings = [];
    // ---------- setup ----------
    const env = new Map();
    const hist = new Map();
    const keeps = new Set();
    const lets = [];
    const fns = new Map();
    const options = { capital: 10000, fee: 0, size: 100, shorts: true };
    for (const s of p.body) {
        if (s.k === "input") {
            const given = opts.inputs?.[s.name];
            let v = given !== undefined && typeof given === typeof s.def ? given : s.def;
            if (typeof v === "string" && !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v))
                v = s.def;
            if (typeof v === "string")
                v = v.toLowerCase();
            if (typeof v === "number" && !Number.isFinite(v))
                v = s.def;
            if (typeof v === "number") {
                if (s.min !== undefined)
                    v = Math.max(s.min, v);
                if (s.max !== undefined)
                    v = Math.min(s.max, v);
            }
            env.set(s.name, v);
        }
        else if (s.k === "option")
            options[s.name] = s.v;
        else if (s.k === "fn")
            fns.set(s.name, s);
    }
    const collect = (list) => {
        for (const s of list) {
            if (s.k === "let")
                for (const nm of s.names) {
                    if (!lets.includes(nm))
                        lets.push(nm);
                    hist.set(nm, []);
                }
            if (s.k === "keep") {
                keeps.add(s.name);
                hist.set(s.name, []);
            }
            if (s.k === "if") {
                s.branches.forEach((b) => collect(b.body));
                if (s.other)
                    collect(s.other);
            }
            if (s.k === "repeat")
                collect(s.body);
        }
    };
    collect(p.body);
    const plots = [];
    const levels = [];
    const marks = [];
    const paints = [];
    const alerts = [];
    const objects = new Map(); // insertion order = creation order
    const perType = { line: [], box: [], label: [] };
    let nextId = 1;
    let panelWhere = "top_right";
    const cells = new Map();
    let callPos = { line: 0, col: 0 };
    const fx = {
        add(d) {
            const id = nextId++;
            objects.set(id, { id, ...d });
            const q = perType[d.type];
            q.push(id);
            if (q.length > objects_1.MAX_OBJECTS)
                objects.delete(q.shift());
            return id;
        },
        get(id) { return typeof id === "number" ? objects.get(id) : undefined; },
        erase(id) {
            if (typeof id !== "number")
                return;
            const d = objects.get(id);
            if (!d)
                return;
            objects.delete(id);
            const q = perType[d.type];
            const k = q.indexOf(id);
            if (k >= 0)
                q.splice(k, 1);
        },
        cell(c) {
            if (!cells.has(`${c.row}:${c.col}`) && cells.size >= objects_1.MAX_CELLS.rows * objects_1.MAX_CELLS.cols)
                return;
            cells.set(`${c.row}:${c.col}`, c);
        },
        panel(w) { panelWhere = w; },
        fail(code, args = {}) { (0, errors_1.fail)(code, callPos, args); },
    };
    const finish = () => ({
        drawings: [...objects.values()],
        panel: cells.size ? { where: panelWhere, cells: [...cells.values()].sort((a, b) => a.row - b.row || a.col - b.col) } : null,
    });
    const draws = p.body.filter((s) => s.k === "draw");
    draws.forEach((d, k) => plots.push({
        name: d.label ?? `plot ${k + 1}`, style: d.style, width: d.width, color: DEFAULT_COLORS[k % DEFAULT_COLORS.length],
        values: new Array(n).fill(null), colors: new Array(n).fill(null),
    }));
    // per-call-site state, keyed by call path
    const state = new Map();
    // ---------- trading ----------
    const bt = p.kind === "expert" ? newBacktest(options, n) : null;
    let i = 0;
    const tick = (pos) => {
        if (++ops > maxOps)
            (0, errors_1.fail)("op_limit", pos);
        if ((ops & 0x3fff) === 0 && Date.now() - started > maxMs)
            (0, errors_1.fail)("time_limit", pos);
    };
    const seriesValue = (name, k) => {
        const j = i - k;
        if (j < 0)
            return null;
        switch (name) {
            case "open": return bars.open[j];
            case "high": return bars.high[j];
            case "low": return bars.low[j];
            case "close": return bars.close[j];
            case "volume": return bars.volume[j];
            case "time": return bars.time[j];
            case "bar": return j;
            case "median": return (bars.high[j] + bars.low[j]) / 2;
            case "typical": return (bars.high[j] + bars.low[j] + bars.close[j]) / 3;
            case "last": return j === n - 1;
        }
        return null;
    };
    const lookup = (name, locals, pos) => {
        if (locals?.has(name))
            return locals.get(name);
        if (env.has(name))
            return env.get(name);
        const sn = (0, check_1.resolveSeries)(name);
        if (builtins_1.BAR_SERIES.includes(sn))
            return seriesValue(sn, 0);
        if (bt && sn in bt.series)
            return bt.series[sn]();
        if (Object.hasOwn(builtins_1.COLORS, name))
            return builtins_1.COLORS[name];
        if (Object.hasOwn(builtins_1.CONSTANTS, name))
            return builtins_1.CONSTANTS[name];
        (0, errors_1.fail)("unknown_name", pos, { name, hint: "" });
    };
    const numOp = (v, op, pos) => {
        if (v === null)
            return null;
        if (typeof v === "number")
            return Number.isFinite(v) ? v : null;
        (0, errors_1.fail)("type_num", pos, { op, got: kindOf(v) });
    };
    const evalE = (e, locals, path) => {
        tick(e);
        switch (e.k) {
            case "num": return e.v;
            case "bool": return e.v;
            case "str": return e.v;
            case "none": return null;
            case "name": return lookup(e.name, locals, e);
            case "un": {
                const v = evalE(e.e, locals, path);
                if (e.op === "not")
                    return !truthy(v);
                const x = numOp(v, "-", e);
                return x === null ? null : -x;
            }
            case "cond": return truthy(evalE(e.c, locals, path)) ? evalE(e.a, locals, path) : evalE(e.b, locals, path);
            case "bin": {
                if (e.op === "and")
                    return truthy(evalE(e.a, locals, path)) && truthy(evalE(e.b, locals, path));
                if (e.op === "or")
                    return truthy(evalE(e.a, locals, path)) || truthy(evalE(e.b, locals, path));
                const a = evalE(e.a, locals, path), b = evalE(e.b, locals, path);
                if (e.op === "+" && (typeof a === "string" || typeof b === "string"))
                    return (0, objects_1.toText)(a) + (0, objects_1.toText)(b);
                if (e.op === "==" || e.op === "!=") {
                    if (a === null || b === null)
                        return false;
                    return e.op === "==" ? a === b : a !== b;
                }
                const x = numOp(a, e.op, e), y = numOp(b, e.op, e);
                if (x === null || y === null)
                    return e.op === "<" || e.op === ">" || e.op === "<=" || e.op === ">=" ? false : null;
                switch (e.op) {
                    case "+": return x + y;
                    case "-": return x - y;
                    case "*": return x * y;
                    case "/": return y === 0 ? null : x / y;
                    case "%": return y === 0 ? null : x % y;
                    case "^": {
                        const r = x ** y;
                        return Number.isFinite(r) ? r : null;
                    }
                    case "<": return x < y;
                    case "<=": return x <= y;
                    case ">": return x > y;
                    case ">=": return x >= y;
                }
                return null;
            }
            case "call": return call(e, locals, path);
        }
    };
    const call = (e, locals, path) => {
        const key = path + e.id;
        const user = fns.get(e.name);
        if (user) {
            const scope = new Map();
            user.params.forEach((pn, k) => scope.set(pn, evalE(e.args[k], locals, path)));
            return evalE(user.body, scope, key + "/");
        }
        const f = builtins_1.FUNCS[(0, check_1.resolveFn)(e.name)];
        if (!f)
            (0, errors_1.fail)("unknown_fn", e, { name: e.name, hint: "" });
        let slot = state.get(key);
        if (!slot) {
            slot = { st: {}, bufs: [] };
            state.set(key, slot);
        }
        const s = slot;
        const vals = [];
        const views = [];
        e.args.forEach((a, k) => {
            if (f.series?.includes(k)) {
                // history-backed view for plain names, buffered view for expressions
                if (a.k === "name" && !locals?.has(a.name)) {
                    const nm = a.name, sn = (0, check_1.resolveSeries)(nm);
                    if (builtins_1.BAR_SERIES.includes(sn)) {
                        views[k] = { full: true, at: (q) => seriesValue(sn, q) };
                        vals[k] = seriesValue(sn, 0);
                        return;
                    }
                    const h = hist.get(nm);
                    if (h) {
                        const cur = env.get(nm) ?? null;
                        views[k] = { full: true, at: (q) => (q === 0 ? cur : i - q >= 0 ? h[i - q] ?? null : null) };
                        vals[k] = cur;
                        return;
                    }
                    if (env.has(nm)) {
                        const c = env.get(nm);
                        views[k] = { full: true, at: () => c };
                        vals[k] = c;
                        return;
                    }
                }
                const v = evalE(a, locals, path);
                const buf = (s.bufs[k] ??= { bar: -1, vals: [] });
                if (buf.bar === i)
                    buf.vals[buf.vals.length - 1] = v;
                else {
                    buf.vals.push(v);
                    buf.bar = i;
                }
                const arr = buf.vals;
                views[k] = { full: false, at: (q) => (q < arr.length ? arr[arr.length - 1 - q] : null) };
                vals[k] = v;
            }
            else
                vals[k] = evalE(a, locals, path);
        });
        callPos = e;
        const ctx = {
            i, bars, st: s.st, fx,
            arg: (k) => views[k] ?? { full: false, at: (q) => (q === 0 ? vals[k] : null) },
            num: (v, what) => { if (v === null)
                return null; if (typeof v !== "number")
                (0, errors_1.fail)("type_num", e, { op: what, got: kindOf(v) }); return v; },
            len: (v, name) => {
                if (!isNum(v) || v < 1 || Math.floor(v) !== v || v > 5000)
                    (0, errors_1.fail)("bad_length", e, { name: e.name || name, got: v === null ? "none" : String(v) });
                return v;
            },
        };
        return f.f(vals, ctx);
    };
    const interp = (msg, locals) => msg.replace(/\{([^{}]+)\}/g, (m, nm) => {
        const name = nm.trim();
        try {
            const v = lookup(name, locals, { line: 0, col: 0 });
            return v === null ? "—" : typeof v === "number" ? String(Math.round(v * 1e6) / 1e6) : String(v);
        }
        catch {
            return m;
        }
    });
    const color = (e, locals, fallback) => {
        if (!e)
            return fallback;
        const v = evalE(e, locals, "");
        return typeof v === "string" ? v : fallback;
    };
    const exec = (list, locals) => {
        for (const s of list) {
            tick(s);
            switch (s.k) {
                case "input":
                case "option":
                case "info":
                case "fn": break;
                case "let": {
                    const v = evalE(s.e, locals, "");
                    if (s.names.length === 1)
                        env.set(s.names[0], v);
                    else
                        s.names.forEach((nm, k) => env.set(nm, Array.isArray(v) ? v[k] ?? null : null));
                    break;
                }
                case "keep":
                    if (!env.has(s.name))
                        env.set(s.name, evalE(s.e, locals, ""));
                    break;
                case "set": {
                    const v = evalE(s.e, locals, "");
                    if (locals?.has(s.name))
                        locals.set(s.name, v);
                    else
                        env.set(s.name, v);
                    break;
                }
                case "draw": {
                    const pl = plots[draws.indexOf(s)];
                    const v = evalE(s.e, locals, "");
                    pl.values[i] = isNum(v) ? v : typeof v === "boolean" ? (v ? 1 : 0) : null;
                    if (s.color) {
                        const c = evalE(s.color, locals, "");
                        pl.colors[i] = typeof c === "string" ? c : null;
                        if (i === n - 1 && typeof c === "string")
                            pl.color = c;
                    }
                    if (i === 0 && s.color) {
                        const c = pl.colors[0];
                        if (c)
                            pl.color = c;
                    }
                    break;
                }
                case "level":
                    if (i === 0) {
                        const v = evalE(s.e, locals, "");
                        if (isNum(v))
                            levels.push({ value: v, name: s.label, color: color(s.color, locals, "#8c8578"), dashed: s.dashed });
                    }
                    break;
                case "mark":
                    if (marks.length < MAX_MARKS)
                        marks.push({ bar: i, time: bars.time[i], where: s.where, text: s.text, color: color(s.color, locals, builtins_1.COLORS.blue) });
                    else if (!warnings.some((w) => w.code === "limit_marks"))
                        warnings.push((0, errors_1.makeError)("limit_marks", s));
                    break;
                case "paint": {
                    const c = evalE(s.color, locals, "");
                    if (typeof c === "string")
                        paints.push({ bar: i, color: c });
                    break;
                }
                case "alert":
                    alerts.push({ bar: i, time: bars.time[i], message: interp(s.msg, locals) });
                    break;
                case "if": {
                    let done = false;
                    for (const b of s.branches)
                        if (truthy(evalE(b.c, locals, ""))) {
                            exec(b.body, locals);
                            done = true;
                            break;
                        }
                    if (!done && s.other)
                        exec(s.other, locals);
                    break;
                }
                case "repeat": {
                    const a = numOp(evalE(s.from, locals, ""), "repeat", s), b = numOp(evalE(s.to, locals, ""), "repeat", s);
                    if (a === null || b === null)
                        break;
                    const scope = new Map(locals ?? []);
                    const step = a <= b ? 1 : -1;
                    let count = 0;
                    for (let v = a; step > 0 ? v <= b : v >= b; v += step) {
                        if (++count > LOOP_LIMIT)
                            (0, errors_1.fail)("loop_limit", s);
                        scope.set(s.v, v);
                        exec(s.body, scope);
                    }
                    if (locals)
                        for (const [k, v] of scope)
                            if (locals.has(k))
                                locals.set(k, v);
                    break;
                }
                case "order": {
                    const size = s.size ? numOp(evalE(s.size, locals, ""), s.side, s) : null;
                    bt?.order(s.side, size);
                    break;
                }
                case "exit":
                    bt?.order("exit", null);
                    break;
                case "stop":
                case "target": {
                    const v = numOp(evalE(s.e, locals, ""), s.k, s);
                    if (v !== null)
                        bt?.protect(s.k, v);
                    break;
                }
                case "expr":
                    evalE(s.e, locals, "");
                    break;
            }
        }
    };
    try {
        for (i = 0; i < n; i++) {
            for (const nm of lets)
                env.set(nm, null);
            bt?.beforeBar(i, bars);
            exec(p.body, null);
            for (const [nm, h] of hist)
                h[i] = env.get(nm) ?? null;
            bt?.afterBar(i, bars);
        }
    }
    catch (x) {
        if (x instanceof errors_1.ViaFail) {
            return { ok: false, error: x.err, plots, levels, marks, paints, alerts, ...finish(), warnings, ops, report: bt?.report(bars) };
        }
        throw x;
    }
    return { ok: true, plots, levels, marks, paints, alerts, ...finish(), warnings, ops, report: bt?.report(bars) };
}
// ---------- backtester ----------
function newBacktest(o, n) {
    const capital = typeof o.capital === "number" && o.capital > 0 ? o.capital : 10000;
    const feePct = typeof o.fee === "number" && o.fee >= 0 ? o.fee : 0;
    const defSize = typeof o.size === "number" && o.size > 0 ? o.size : 100;
    const shorts = o.shorts !== false;
    let cash = capital, qty = 0; // qty > 0 long, < 0 short
    let entryPrice = 0, entryBar = -1, entryTime = 0;
    let stop = null, target = null;
    let pending = null;
    let pendingStop = null, pendingTarget = null;
    let curBar = 0, lastClose = 0;
    const list = [];
    const equity = new Array(n).fill(capital);
    const fee = (notional) => (Math.abs(notional) * feePct) / 100;
    const eq = (price) => cash + qty * price;
    const close = (price, bar, time, reason) => {
        if (qty === 0)
            return;
        const side = qty > 0 ? "long" : "short";
        const q = Math.abs(qty);
        const entryFee = fee(q * entryPrice), exitFee = fee(q * price);
        cash += qty * price - exitFee;
        const gross = side === "long" ? (price - entryPrice) * q : (entryPrice - price) * q;
        const profit = gross - entryFee - exitFee;
        list.push({ side, qty: q, entryBar, entryTime, entryPrice, exitBar: bar, exitTime: time, exitPrice: price, profit, pct: (profit / (q * entryPrice)) * 100, reason });
        qty = 0;
        stop = target = null;
    };
    const open = (side, sizePct, price, bar, time) => {
        const e = eq(price);
        if (e <= 0 || price <= 0)
            return;
        const q = (e * Math.min(sizePct, 100)) / 100 / price;
        qty = side === "long" ? q : -q;
        cash -= qty * price + fee(q * price);
        entryPrice = price;
        entryBar = bar;
        entryTime = time;
        stop = pendingStop;
        target = pendingTarget;
        pendingStop = pendingTarget = null;
    };
    return {
        series: {
            position: () => (qty > 0 ? 1 : qty < 0 ? -1 : 0),
            entry_price: () => (qty !== 0 ? entryPrice : null),
            bars_in_trade: () => (qty !== 0 ? curBar - entryBar : 0),
            equity: () => eq(lastClose),
            profit: () => (qty !== 0 ? qty * (lastClose - entryPrice) : 0),
        },
        order(kind, size) { pending = { kind, size }; },
        protect(kind, v) {
            if (qty !== 0 && !(pending && pending.kind !== "exit")) {
                if (kind === "stop")
                    stop = v;
                else
                    target = v;
            }
            else {
                if (kind === "stop")
                    pendingStop = v;
                else
                    pendingTarget = v;
            }
        },
        beforeBar(i, b) {
            curBar = i;
            lastClose = b.close[i];
            const px = b.open[i], t = b.time[i];
            if (pending) {
                const p = pending;
                pending = null;
                if (p.kind === "exit")
                    close(px, i, t, "exit");
                else if (p.kind === "buy") {
                    if (qty < 0)
                        close(px, i, t, "signal");
                    if (qty === 0)
                        open("long", p.size ?? defSize, px, i, t);
                }
                else {
                    if (qty > 0)
                        close(px, i, t, "signal");
                    if (qty === 0 && shorts)
                        open("short", p.size ?? defSize, px, i, t);
                }
            }
            if (qty !== 0) {
                const long = qty > 0;
                const hitStop = stop !== null && (long ? b.low[i] <= stop : b.high[i] >= stop);
                const hitTarget = target !== null && (long ? b.high[i] >= target : b.low[i] <= target);
                if (hitStop)
                    close(long ? Math.min(px, stop) : Math.max(px, stop), i, t, "stop");
                else if (hitTarget)
                    close(long ? Math.max(px, target) : Math.min(px, target), i, t, "target");
            }
        },
        afterBar(i, b) { equity[i] = eq(b.close[i]); },
        report(b) {
            const last = b.close.length - 1;
            let openTrade = null;
            if (qty !== 0 && last >= 0) {
                const q = Math.abs(qty), px = b.close[last];
                const profit = (qty > 0 ? px - entryPrice : entryPrice - px) * q - fee(q * entryPrice) - fee(q * px);
                openTrade = { side: qty > 0 ? "long" : "short", qty: q, entryBar, entryTime, entryPrice, exitBar: last, exitTime: b.time[last], exitPrice: px, profit, pct: (profit / (q * entryPrice)) * 100, reason: "end" };
            }
            const wins = list.filter((t) => t.profit > 0);
            const gp = wins.reduce((s, t) => s + t.profit, 0);
            const gl = list.filter((t) => t.profit < 0).reduce((s, t) => s - t.profit, 0);
            let peak = capital, dd = 0, ddPct = 0;
            for (const e of equity) {
                peak = Math.max(peak, e);
                if (peak - e > dd) {
                    dd = peak - e;
                    ddPct = ((peak - e) / peak) * 100;
                }
            }
            const final = equity[equity.length - 1] ?? capital;
            return {
                capital, netProfit: final - capital, netPct: ((final - capital) / capital) * 100,
                trades: list.length, wins: wins.length, winRate: list.length ? (wins.length / list.length) * 100 : 0,
                profitFactor: gl === 0 ? (gp > 0 ? null : 0) : gp / gl,
                maxDrawdown: dd, maxDrawdownPct: ddPct,
                avgTrade: list.length ? list.reduce((s, t) => s + t.profit, 0) / list.length : 0,
                list, equity, open: openTrade,
            };
        },
    };
}
