"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.parse = parse;
const errors_1 = require("./errors");
const lexer_1 = require("./lexer");
const GROUP_WORDS = ["group", "قسم"];
const TIME_WORDS = ["time", "وقت"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?$/;
/** "2026-11-20" or "2026-11-20 14:30", read as UTC; null when the date does not exist. */
function parseDate(text) {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?$/.exec(text);
    if (!m)
        return null;
    const [y, mo, d, h = "0", mi = "0"] = m.slice(1);
    const t = Date.UTC(+y, +mo - 1, +d, +h, +mi);
    const back = new Date(t);
    if (back.getUTCFullYear() !== +y || back.getUTCMonth() !== +mo - 1 || back.getUTCDate() !== +d || +h > 23 || +mi > 59)
        return null;
    return t;
}
const COLOR_RE = /^#[0-9a-f]{6}([0-9a-f]{2})?$/;
const OPTION_WORDS = ["options", "اختيارات"];
const STYLES = ["line", "columns", "dots", "area", "steps"];
const STYLE_AR = { "خط": "line", "أعمدة": "columns", "اعمدة": "columns", "نقاط": "dots", "مساحة": "area", "درجات": "steps" };
function parse(src) {
    return new Parser((0, lexer_1.lex)(src)).program();
}
class Parser {
    t;
    i = 0;
    callId = 0;
    drawIdx = 0;
    constructor(t) {
        this.t = t;
    }
    get cur() { return this.t[this.i]; }
    peek(o = 1) { return this.t[Math.min(this.i + o, this.t.length - 1)]; }
    next() { return this.t[this.i++]; }
    isKw(v, tok = this.cur) { return tok.type === "kw" && tok.value === v; }
    isOp(v, tok = this.cur) { return tok.type === "op" && tok.value === v; }
    desc(tok) { return tok.type === "nl" ? "end of line" : tok.type === "eof" ? "end of script" : `"${tok.raw}"`; }
    expect(type, value, what) {
        const tok = this.cur;
        if (tok.type !== type || (value !== undefined && tok.value !== value))
            (0, errors_1.fail)("expected", tok, { what, found: this.desc(tok) });
        return this.next();
    }
    kw(v) { return this.expect("kw", v, `"${v}"`); }
    op(v) { return this.expect("op", v, `"${v}"`); }
    skipNl() { while (this.cur.type === "nl")
        this.next(); }
    endLine() {
        if (this.cur.type === "eof")
            return;
        this.expect("nl", undefined, "end of line");
        this.skipNl();
    }
    program() {
        this.skipNl();
        const h = this.cur;
        if (!(this.isKw("indicator") || this.isKw("expert")))
            (0, errors_1.fail)("no_header", h);
        const kind = this.next().value;
        const title = this.expect("str", undefined, "a title in quotes").value;
        let overlay = kind === "expert";
        if (this.isKw("overlay")) {
            this.next();
            overlay = true;
        }
        this.endLine();
        const body = [];
        while (this.cur.type !== "eof") {
            if (this.isKw("indicator") || this.isKw("expert"))
                (0, errors_1.fail)("header_twice", this.cur);
            body.push(this.stmt());
        }
        return { kind, title, overlay, body, calls: this.callId };
    }
    block(stops) {
        const out = [];
        while (!stops.some((s) => this.isKw(s))) {
            if (this.cur.type === "eof")
                (0, errors_1.fail)("expected", this.cur, { what: '"end"', found: "end of script" });
            out.push(this.stmt());
        }
        return out;
    }
    literal() {
        const tok = this.cur;
        if (this.isKw("yes")) {
            this.next();
            return true;
        }
        if (this.isKw("no")) {
            this.next();
            return false;
        }
        let neg = false;
        if (this.isOp("-")) {
            this.next();
            neg = true;
        }
        if (this.cur.type !== "num")
            (0, errors_1.fail)("bad_input", tok);
        const v = Number(this.next().value);
        return neg ? -v : v;
    }
    signedNum() {
        let neg = false;
        if (this.isOp("-")) {
            this.next();
            neg = true;
        }
        const v = Number(this.expect("num", undefined, "a number").value);
        return neg ? -v : v;
    }
    stmt() {
        const s = this.stmtInner();
        if (s.k !== "if" && s.k !== "repeat")
            this.endLine();
        return s;
    }
    stmtInner() {
        const tok = this.cur;
        const pos = { line: tok.line, col: tok.col };
        if (tok.type === "kw") {
            switch (tok.value) {
                case "input": {
                    this.next();
                    const name = this.expect("name", undefined, "a name").value;
                    this.op("=");
                    // A colour default (#rrggbb or #rrggbbaa) makes a colour input, shown with a colour picker.
                    // `time` (Arabic وقت), optionally followed by a date in quotes, makes a date-and-time input: its value is a
                    // time in milliseconds like the `time` series, 0 when no date is set.
                    let def, isTime = false;
                    if (this.cur.type === "name" && TIME_WORDS.includes(this.cur.value)) {
                        this.next();
                        isTime = true;
                        def = 0;
                        const dt = this.cur;
                        if (dt.type === "str" && DATE_RE.test(dt.value.trim())) {
                            const d = parseDate(dt.value.trim());
                            if (d === null)
                                (0, errors_1.fail)("bad_input", this.cur);
                            def = d;
                            this.next();
                        }
                    }
                    else
                        def = this.cur.type === "color" ? this.next().value : this.literal();
                    if (typeof def === "string" && !COLOR_RE.test(def))
                        (0, errors_1.fail)("bad_input", tok);
                    const s = { k: "input", name, def, ...pos };
                    if (isTime)
                        s.time = true;
                    if (this.cur.type === "str")
                        s.label = this.next().value;
                    if (!isTime && (this.cur.type === "num" || this.isOp("-"))) {
                        s.min = this.signedNum();
                        this.op("..");
                        s.max = this.signedNum();
                    }
                    // Optional, in any order: group "Section" (shown as a section in the settings), options "A|B|C" (a list
                    // instead of a number box; the value is the chosen item's position, from 0).
                    for (;;) {
                        const w = this.cur.type === "name" ? this.cur.value : "";
                        if (GROUP_WORDS.includes(w)) {
                            this.next();
                            s.group = this.expect("str", undefined, "a section name in quotes").value;
                            continue;
                        }
                        if (OPTION_WORDS.includes(w)) {
                            this.next();
                            const t = this.expect("str", undefined, "choices in quotes, split by |");
                            s.options = t.value.split("|").map((x) => x.trim()).filter(Boolean);
                            if (typeof s.def !== "number" || s.time || s.options.length < 2)
                                (0, errors_1.fail)("bad_input", t);
                            s.min ??= 0;
                            s.max ??= s.options.length - 1;
                            continue;
                        }
                        break;
                    }
                    return s;
                }
                case "option": {
                    this.next();
                    const name = this.expect("name", undefined, "an option name").value;
                    this.op("=");
                    return { k: "option", name, v: this.literal(), ...pos };
                }
                case "info": {
                    this.next();
                    const name = this.expect("name", undefined, "an info field").value;
                    return { k: "info", name, v: this.expect("str", undefined, "a value in quotes").value, ...pos };
                }
                case "let": {
                    this.next();
                    const names = [];
                    if (this.isOp("(")) {
                        this.next();
                        names.push(this.expect("name", undefined, "a name").value);
                        while (this.isOp(",")) {
                            this.next();
                            names.push(this.expect("name", undefined, "a name").value);
                        }
                        this.op(")");
                    }
                    else
                        names.push(this.expect("name", undefined, "a name").value);
                    this.op("=");
                    return { k: "let", names, e: this.expr(), ...pos };
                }
                case "keep": {
                    this.next();
                    const name = this.expect("name", undefined, "a name").value;
                    this.op("=");
                    return { k: "keep", name, e: this.expr(), ...pos };
                }
                case "fn": {
                    this.next();
                    const name = this.expect("name", undefined, "a function name").value;
                    this.op("(");
                    const params = [];
                    if (!this.isOp(")")) {
                        params.push(this.expect("name", undefined, "a parameter name").value);
                        while (this.isOp(",")) {
                            this.next();
                            params.push(this.expect("name", undefined, "a parameter name").value);
                        }
                    }
                    this.op(")");
                    this.op("=");
                    return { k: "fn", name, params, body: this.expr(), ...pos };
                }
                case "draw": {
                    this.next();
                    const s = { k: "draw", e: this.expr(), style: "line", width: 1, idx: this.drawIdx++, ...pos };
                    for (;;) {
                        if (this.isKw("name")) {
                            this.next();
                            s.label = this.expect("str", undefined, "a label in quotes").value;
                        }
                        else if (this.isKw("color")) {
                            this.next();
                            s.color = this.expr();
                        }
                        else if (this.isKw("width")) {
                            this.next();
                            const w = this.expect("num", undefined, "a width");
                            const v = Number(w.value);
                            if (!Number.isInteger(v) || v < 1 || v > 4)
                                (0, errors_1.fail)("bad_width", w);
                            s.width = v;
                        }
                        else if (this.isKw("as")) {
                            this.next();
                            const st = this.expect("name", undefined, "a style");
                            const style = STYLES.includes(st.value) ? st.value : STYLE_AR[st.value];
                            if (!style)
                                (0, errors_1.fail)("bad_style", st, { name: st.raw });
                            s.style = style;
                        }
                        else
                            break;
                    }
                    return s;
                }
                case "level": {
                    this.next();
                    const s = { k: "level", e: this.expr(), dashed: false, ...pos };
                    for (;;) {
                        if (this.isKw("name")) {
                            this.next();
                            s.label = this.expect("str", undefined, "a label in quotes").value;
                        }
                        else if (this.isKw("color")) {
                            this.next();
                            s.color = this.expr();
                        }
                        else if (this.isKw("dashed")) {
                            this.next();
                            s.dashed = true;
                        }
                        else
                            break;
                    }
                    return s;
                }
                case "mark": {
                    this.next();
                    let where;
                    if (this.isKw("above") || this.isKw("below"))
                        where = this.next().value;
                    else
                        (0, errors_1.fail)("expected", this.cur, { what: '"above" or "below"', found: this.desc(this.cur) });
                    const text = this.expect("str", undefined, "the mark text in quotes").value;
                    const s = { k: "mark", where, text, ...pos };
                    if (this.isKw("color")) {
                        this.next();
                        s.color = this.expr();
                    }
                    return s;
                }
                case "paint":
                    this.next();
                    return { k: "paint", color: this.expr(), ...pos };
                case "alert":
                    this.next();
                    return { k: "alert", msg: this.expect("str", undefined, "the alert message in quotes").value, ...pos };
                case "buy":
                case "sell": {
                    this.next();
                    const s = { k: "order", side: tok.value, ...pos };
                    if (this.cur.type !== "nl" && this.cur.type !== "eof" && !this.isKw("end") && !this.isKw("else") && !this.isKw("elif"))
                        s.size = this.expr();
                    return s;
                }
                case "exit":
                    this.next();
                    return { k: "exit", ...pos };
                case "stop":
                case "target":
                    this.next();
                    return { k: tok.value, e: this.expr(), ...pos };
                case "if": return this.ifStmt(pos);
                case "repeat": {
                    this.next();
                    const v = this.expect("name", undefined, "a counter name").value;
                    this.kw("from");
                    const from = this.expr();
                    this.kw("to");
                    const to = this.expr();
                    this.endLine();
                    const body = this.block(["end"]);
                    this.kw("end");
                    this.endLine();
                    return { k: "repeat", v, from, to, body, ...pos };
                }
            }
        }
        if (tok.type === "name" && this.isOp(":=", this.peek())) {
            this.next();
            this.next();
            return { k: "set", name: tok.value, e: this.expr(), ...pos };
        }
        const e = this.expr();
        return { k: "expr", e, ...pos };
    }
    ifStmt(pos) {
        this.kw("if");
        const c = this.expr();
        this.kw("then");
        if (this.cur.type !== "nl") {
            // single-line form
            const s = this.stmtInner();
            if (s.k === "if" || s.k === "repeat")
                return { k: "if", branches: [{ c, body: [s] }], ...pos };
            this.endLine();
            return { k: "if", branches: [{ c, body: [s] }], ...pos };
        }
        this.endLine();
        const branches = [{ c, body: this.block(["elif", "else", "end"]) }];
        let other;
        while (this.isKw("elif")) {
            this.next();
            const c2 = this.expr();
            this.kw("then");
            this.endLine();
            branches.push({ c: c2, body: this.block(["elif", "else", "end"]) });
        }
        if (this.isKw("else")) {
            this.next();
            this.endLine();
            other = this.block(["end"]);
        }
        this.kw("end");
        this.endLine();
        return { k: "if", branches, other, ...pos };
    }
    // ---------- expressions ----------
    expr() {
        const c = this.or();
        if (this.isOp("?")) {
            const q = this.next();
            const a = this.expr();
            this.op(":");
            const b = this.expr();
            return { k: "cond", c, a, b, line: q.line, col: q.col };
        }
        return c;
    }
    or() {
        let a = this.and();
        while (this.isKw("or")) {
            const t = this.next();
            a = { k: "bin", op: "or", a, b: this.and(), line: t.line, col: t.col };
        }
        return a;
    }
    and() {
        let a = this.not();
        while (this.isKw("and")) {
            const t = this.next();
            a = { k: "bin", op: "and", a, b: this.not(), line: t.line, col: t.col };
        }
        return a;
    }
    not() {
        if (this.isKw("not")) {
            const t = this.next();
            return { k: "un", op: "not", e: this.not(), line: t.line, col: t.col };
        }
        return this.cmp();
    }
    cmp() {
        const a = this.add();
        const t = this.cur;
        if (t.type === "op" && ["==", "!=", "<", "<=", ">", ">="].includes(t.value)) {
            this.next();
            return { k: "bin", op: t.value, a, b: this.add(), line: t.line, col: t.col };
        }
        return a;
    }
    add() {
        let a = this.mul();
        while (this.isOp("+") || this.isOp("-")) {
            const t = this.next();
            a = { k: "bin", op: t.value, a, b: this.mul(), line: t.line, col: t.col };
        }
        return a;
    }
    mul() {
        let a = this.unary();
        while (this.isOp("*") || this.isOp("/") || this.isOp("%")) {
            const t = this.next();
            a = { k: "bin", op: t.value, a, b: this.unary(), line: t.line, col: t.col };
        }
        return a;
    }
    unary() {
        if (this.isOp("-")) {
            const t = this.next();
            return { k: "un", op: "-", e: this.unary(), line: t.line, col: t.col };
        }
        if (this.isOp("+")) {
            this.next();
            return this.unary();
        }
        return this.pow();
    }
    pow() {
        const a = this.primary();
        if (this.isOp("^")) {
            const t = this.next();
            return { k: "bin", op: "^", a, b: this.unary(), line: t.line, col: t.col };
        }
        return a;
    }
    primary() {
        const t = this.cur;
        const pos = { line: t.line, col: t.col };
        if (t.type === "num") {
            this.next();
            return { k: "num", v: Number(t.value), ...pos };
        }
        if (t.type === "str") {
            this.next();
            return { k: "str", v: t.value, ...pos };
        }
        if (t.type === "color") {
            this.next();
            return { k: "str", v: t.value, ...pos };
        }
        if (this.isKw("yes")) {
            this.next();
            return { k: "bool", v: true, ...pos };
        }
        if (this.isKw("no")) {
            this.next();
            return { k: "bool", v: false, ...pos };
        }
        if (this.isKw("none")) {
            this.next();
            return { k: "none", ...pos };
        }
        if (this.isOp("(")) {
            this.next();
            const e = this.expr();
            this.op(")");
            return e;
        }
        if (t.type === "name") {
            this.next();
            if (this.isOp("(")) {
                this.next();
                const args = [];
                if (!this.isOp(")")) {
                    args.push(this.expr());
                    while (this.isOp(",")) {
                        this.next();
                        args.push(this.expr());
                    }
                }
                this.op(")");
                return { k: "call", name: t.value, args, id: this.callId++, ...pos };
            }
            return { k: "name", name: t.value, ...pos };
        }
        (0, errors_1.fail)("expected", t, { what: "a value", found: this.desc(t) });
    }
}
