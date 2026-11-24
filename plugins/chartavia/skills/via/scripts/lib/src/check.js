"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INFO_FIELDS = exports.OPTIONS = void 0;
exports.resolveFn = resolveFn;
exports.resolveSeries = resolveSeries;
exports.check = check;
const builtins_1 = require("./builtins");
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
exports.OPTIONS = ["capital", "fee", "size", "shorts"];
exports.INFO_FIELDS = ["version", "author", "description", "license", "homepage", "id"];
const MAX_DRAW = 16, MAX_LEVEL = 8;
function resolveFn(name) { return builtins_1.FUNC_AR[name] ?? name; }
function resolveSeries(name) { return builtins_1.SERIES_AR[name] ?? name; }
function check(p) {
    const errs = [];
    const err = (code, pos, args = {}) => errs.push((0, errors_1.makeError)(code, pos, args));
    const expert = p.kind === "expert";
    const builtinNames = new Set([
        ...builtins_1.BAR_SERIES, ...Object.keys(builtins_1.SERIES_AR), ...Object.keys(builtins_1.COLORS), ...Object.keys(builtins_1.CONSTANTS),
        ...(expert ? builtins_1.POSITION_SERIES : []),
    ]);
    const reserved = new Set([...builtinNames, ...builtins_1.POSITION_SERIES, ...Object.keys(builtins_1.FUNCS), ...Object.keys(builtins_1.FUNC_AR)]);
    const globals = new Set();
    const keeps = new Set();
    const userFns = new Map();
    let draws = 0, levels = 0;
    const define = (name, pos, scope) => {
        if (reserved.has(name) || Object.hasOwn(lexer_1.KEYWORDS, name))
            err("reserved", pos, { name });
        else if (scope.has(name) || globals.has(name) || userFns.has(name))
            err("redefined", pos, { name });
        scope.add(name);
    };
    const expr = (e, locals, inFn, wantTuple = 0) => {
        switch (e.k) {
            case "num":
            case "bool":
            case "str":
            case "none": return;
            case "name": {
                if (locals.has(e.name) || globals.has(e.name) || builtinNames.has(e.name))
                    return;
                if (builtins_1.POSITION_SERIES.includes(e.name)) {
                    err("expert_only", e, { what: e.name });
                    return;
                }
                if (builtins_1.FUNCS[resolveFn(e.name)] || userFns.has(e.name)) {
                    err("expected", e, { what: `"${e.name}(...)"`, found: `"${e.name}"` });
                    return;
                }
                err("unknown_name", e, { name: e.name, hint: (0, errors_1.closest)(e.name, [...locals, ...globals, ...builtinNames]) ?? "" });
                return;
            }
            case "un":
                expr(e.e, locals, inFn);
                return;
            case "bin":
                expr(e.a, locals, inFn);
                expr(e.b, locals, inFn);
                return;
            case "cond":
                expr(e.c, locals, inFn);
                expr(e.a, locals, inFn);
                expr(e.b, locals, inFn);
                return;
            case "call": {
                const fname = resolveFn(e.name);
                const f = builtins_1.FUNCS[fname];
                if (f) {
                    if (e.args.length < f.min || e.args.length > f.max) {
                        err("arity", e, { name: e.name, want: f.min === f.max ? f.min : `${f.min}-${f.max}`, got: e.args.length });
                    }
                    if (f.tuple && wantTuple === 0)
                        err("tuple_needed", e, { name: e.name });
                    else if (f.tuple && wantTuple !== f.tuple)
                        err("tuple_count", e, { name: e.name, want: f.tuple, got: wantTuple });
                    else if (!f.tuple && wantTuple > 1)
                        err("not_tuple", e, { name: e.name });
                }
                else if (userFns.has(e.name)) {
                    const want = userFns.get(e.name);
                    if (e.args.length !== want)
                        err("arity", e, { name: e.name, want, got: e.args.length });
                    if (wantTuple > 1)
                        err("not_tuple", e, { name: e.name });
                }
                else if (globals.has(e.name) || locals.has(e.name) || builtinNames.has(e.name)) {
                    err("not_fn", e, { name: e.name });
                }
                else {
                    err("unknown_fn", e, { name: e.name, hint: (0, errors_1.closest)(fname, [...Object.keys(builtins_1.FUNCS), ...userFns.keys()]) ?? "" });
                }
                for (const a of e.args)
                    expr(a, locals, inFn);
                return;
            }
        }
    };
    const block = (list, top, locals) => {
        for (const s of list)
            stmt(s, top, locals);
    };
    const stmt = (s, top, locals) => {
        const topOnly = (what) => { if (!top)
            err("top_only", s, { what }); };
        const expertOnly = (what) => { if (!expert)
            err("expert_only", s, { what }); };
        switch (s.k) {
            case "input":
                topOnly("input");
                define(s.name, s, globals);
                return;
            case "option":
                topOnly("option");
                expertOnly("option");
                if (!exports.OPTIONS.includes(s.name))
                    err("bad_option", s, { name: s.name });
                return;
            case "info":
                topOnly("info");
                if (!exports.INFO_FIELDS.includes(s.name))
                    err("bad_info", s, { name: s.name });
                return;
            case "let":
                expr(s.e, locals, false, s.names.length > 1 ? s.names.length : 0);
                for (const n of s.names) {
                    if (locals.size && locals.has(n))
                        err("redefined", s, { name: n });
                    else if (!globals.has(n))
                        define(n, s, globals);
                    else
                        err("redefined", s, { name: n });
                }
                return;
            case "keep":
                expr(s.e, locals, false);
                define(s.name, s, globals);
                keeps.add(s.name);
                return;
            case "set":
                if (!keeps.has(s.name) && !locals.has(s.name)) {
                    if (globals.has(s.name))
                        err("not_keep", s, { name: s.name });
                    else
                        err("unknown_name", s, { name: s.name, hint: (0, errors_1.closest)(s.name, [...keeps]) ?? "" });
                }
                expr(s.e, locals, false);
                return;
            case "fn": {
                topOnly("fn");
                const params = new Set();
                for (const pn of s.params)
                    define(pn, s, params);
                expr(s.body, params, true);
                if (reserved.has(s.name))
                    err("reserved", s, { name: s.name });
                else if (globals.has(s.name) || userFns.has(s.name))
                    err("redefined", s, { name: s.name });
                userFns.set(s.name, s.params.length);
                return;
            }
            case "draw":
                topOnly("draw");
                if (++draws > MAX_DRAW)
                    err("too_many", s, { what: "draw", max: MAX_DRAW });
                expr(s.e, locals, false);
                if (s.color)
                    expr(s.color, locals, false);
                return;
            case "level":
                topOnly("level");
                if (++levels > MAX_LEVEL)
                    err("too_many", s, { what: "level", max: MAX_LEVEL });
                expr(s.e, locals, false);
                if (s.color)
                    expr(s.color, locals, false);
                return;
            case "mark":
                if (s.color)
                    expr(s.color, locals, false);
                return;
            case "paint":
                expr(s.color, locals, false);
                return;
            case "alert": return;
            case "if":
                for (const b of s.branches) {
                    expr(b.c, locals, false);
                    block(b.body, false, locals);
                }
                if (s.other)
                    block(s.other, false, locals);
                return;
            case "repeat": {
                expr(s.from, locals, false);
                expr(s.to, locals, false);
                const inner = new Set(locals);
                if (globals.has(s.v) || reserved.has(s.v))
                    err("redefined", s, { name: s.v });
                inner.add(s.v);
                block(s.body, false, inner);
                return;
            }
            case "order":
                expertOnly(s.side);
                if (s.size)
                    expr(s.size, locals, false);
                return;
            case "exit":
                expertOnly("exit");
                return;
            case "stop":
            case "target":
                expertOnly(s.k);
                expr(s.e, locals, false);
                return;
            case "expr":
                expr(s.e, locals, false);
                return;
        }
    };
    block(p.body, true, new Set());
    return errs;
}
