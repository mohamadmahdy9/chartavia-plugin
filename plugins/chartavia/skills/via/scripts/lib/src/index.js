"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIA_VERSION = exports.KEYWORDS = exports.themeColor = exports.POSITION_SERIES = exports.BAR_SERIES = exports.COLORS = exports.FUNCS = exports.formatError = void 0;
exports.compile = compile;
exports.execute = execute;
exports.runSource = runSource;
const check_1 = require("./check");
const errors_1 = require("./errors");
const parser_1 = require("./parser");
const runtime_1 = require("./runtime");
var errors_2 = require("./errors");
Object.defineProperty(exports, "formatError", { enumerable: true, get: function () { return errors_2.formatError; } });
var builtins_1 = require("./builtins");
Object.defineProperty(exports, "FUNCS", { enumerable: true, get: function () { return builtins_1.FUNCS; } });
Object.defineProperty(exports, "COLORS", { enumerable: true, get: function () { return builtins_1.COLORS; } });
Object.defineProperty(exports, "BAR_SERIES", { enumerable: true, get: function () { return builtins_1.BAR_SERIES; } });
Object.defineProperty(exports, "POSITION_SERIES", { enumerable: true, get: function () { return builtins_1.POSITION_SERIES; } });
Object.defineProperty(exports, "themeColor", { enumerable: true, get: function () { return builtins_1.themeColor; } });
var lexer_1 = require("./lexer");
Object.defineProperty(exports, "KEYWORDS", { enumerable: true, get: function () { return lexer_1.KEYWORDS; } });
exports.VIA_VERSION = "0.1.0";
/** Parses and checks a script. Never throws on bad input. */
function compile(source) {
    let program;
    try {
        program = (0, parser_1.parse)(source);
    }
    catch (e) {
        if (e instanceof errors_1.ViaFail)
            return { ok: false, errors: [e.err] };
        throw e;
    }
    const errors = (0, check_1.check)(program);
    if (errors.length)
        return { ok: false, errors };
    return { ok: true, script: { program, kind: program.kind, title: program.title, overlay: program.overlay, inputs: (0, runtime_1.inputsOf)(program), meta: metaOf(program) } };
}
function metaOf(p) {
    const m = {};
    for (const s of p.body)
        if (s.k === "info")
            m[s.name] = s.v;
    return m;
}
/** Runs a compiled script over bars (oldest first). */
function execute(script, bars, opts) {
    return (0, runtime_1.run)(script.program, bars, opts);
}
/** Compile and run in one step. */
function runSource(source, bars, opts) {
    const c = compile(source);
    return c.ok ? { compile: c, result: execute(c.script, bars, opts) } : { compile: c };
}
