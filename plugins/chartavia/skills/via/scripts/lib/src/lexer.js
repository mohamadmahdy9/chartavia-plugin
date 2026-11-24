"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYWORDS = void 0;
exports.lex = lex;
const errors_1 = require("./errors");
// Arabic spellings map to the canonical English keyword.
exports.KEYWORDS = {
    indicator: "indicator", "مؤشر": "indicator",
    expert: "expert", "خبير": "expert",
    overlay: "overlay", "على_السعر": "overlay",
    input: "input", "مدخل": "input",
    option: "option", "خيار": "option",
    info: "info", "معلومة": "info",
    let: "let", "اجعل": "let",
    keep: "keep", "احفظ": "keep",
    fn: "fn", "دالة": "fn",
    if: "if", "إذا": "if", "اذا": "if",
    then: "then", "إذن": "then", "اذن": "then",
    elif: "elif", "وإلا_إذا": "elif", "والا_اذا": "elif",
    else: "else", "وإلا": "else", "والا": "else",
    end: "end", "نهاية": "end",
    repeat: "repeat", "كرر": "repeat",
    from: "from", "من": "from",
    to: "to", "إلى": "to", "الى": "to",
    draw: "draw", "ارسم": "draw",
    level: "level", "مستوى": "level",
    mark: "mark", "علامة": "mark",
    above: "above", "فوق": "above",
    below: "below", "تحت": "below",
    paint: "paint", "لوّن": "paint", "لون": "paint",
    alert: "alert", "نبّه": "alert", "نبه": "alert",
    buy: "buy", "اشتر": "buy", "اشتري": "buy",
    sell: "sell", "بع": "sell", "بيع": "sell",
    exit: "exit", "اخرج": "exit",
    stop: "stop", "وقف": "stop",
    target: "target", "هدف": "target",
    name: "name", "باسم": "name",
    color: "color", "بلون": "color",
    width: "width", "بسمك": "width",
    as: "as", "كـ": "as",
    dashed: "dashed", "متقطع": "dashed",
    and: "and", "و": "and",
    or: "or", "أو": "or", "او": "or",
    not: "not", "ليس": "not",
    yes: "yes", true: "yes", "نعم": "yes",
    no: "no", false: "no", "لا": "no",
    none: "none", "لاشيء": "none",
};
const OPS = [":=", "==", "!=", "<=", ">=", "..", "+", "-", "*", "/", "%", "^", "<", ">", "=", "(", ")", ",", "?", ":"];
// After these tokens a newline does not end the statement.
const CONTINUES = new Set(["+", "-", "*", "/", "%", "^", "<", ">", "<=", ">=", "==", "!=", "=", ":=", ",", "(", "?", ":", "and", "or", "not"]);
const isLetter = (c) => /[\p{L}_]/u.test(c);
const isIdent = (c) => /[\p{L}\p{N}\p{Mn}_]/u.test(c);
const isDigit = (c) => c >= "0" && c <= "9";
function lex(src) {
    const out = [];
    let i = 0, line = 1, col = 1, depth = 0;
    const push = (type, value, raw, l, c) => out.push({ type, value, raw, line: l, col: c });
    const adv = (n = 1) => { for (let k = 0; k < n; k++) {
        if (src[i] === "\n") {
            line++;
            col = 1;
        }
        else
            col++;
        i++;
    } };
    while (i < src.length) {
        const c = src[i];
        const l = line, cl = col;
        if (c === "\n") {
            const last = out[out.length - 1];
            const cont = depth > 0 || (last && (last.type === "op" || last.type === "kw") && CONTINUES.has(last.value));
            if (!cont && last && last.type !== "nl")
                push("nl", "\n", "\n", l, cl);
            adv();
            continue;
        }
        if (c === " " || c === "\t" || c === "\r" || c === "‏" || c === "‎") {
            adv();
            continue;
        }
        if (c === "#") {
            const m = /^#([0-9a-fA-F]{8}|[0-9a-fA-F]{6})(?![\p{L}\p{N}_])/u.exec(src.slice(i, i + 10));
            if (m) {
                push("color", "#" + m[1].toLowerCase(), m[0], l, cl);
                adv(m[0].length);
                continue;
            }
            while (i < src.length && src[i] !== "\n")
                adv();
            continue;
        }
        if (c === '"' || c === "“" || c === "”") {
            adv();
            let s = "";
            while (i < src.length && src[i] !== '"' && src[i] !== "”" && src[i] !== "“") {
                if (src[i] === "\n")
                    (0, errors_1.fail)("bad_string", { line: l, col: cl });
                if (src[i] === "\\" && i + 1 < src.length) {
                    adv();
                    s += src[i] === "n" ? "\n" : src[i];
                    adv();
                    continue;
                }
                s += src[i];
                adv();
            }
            if (i >= src.length)
                (0, errors_1.fail)("bad_string", { line: l, col: cl });
            adv();
            push("str", s, s, l, cl);
            continue;
        }
        if (isDigit(c) || (c === "." && isDigit(src[i + 1] ?? ""))) {
            let j = i;
            while (j < src.length && (isDigit(src[j]) || src[j] === "_"))
                j++;
            if (src[j] === "." && src[j + 1] !== ".") {
                j++;
                while (j < src.length && (isDigit(src[j]) || src[j] === "_"))
                    j++;
            }
            if ((src[j] === "e" || src[j] === "E") && /[0-9+-]/.test(src[j + 1] ?? "")) {
                j++;
                if (src[j] === "+" || src[j] === "-")
                    j++;
                while (j < src.length && isDigit(src[j]))
                    j++;
            }
            const raw = src.slice(i, j);
            const v = Number(raw.replace(/_/g, ""));
            if (!Number.isFinite(v) || (j < src.length && isLetter(src[j])))
                (0, errors_1.fail)("bad_number", { line: l, col: cl }, { text: raw + (src[j] ?? "") });
            push("num", String(v), raw, l, cl);
            adv(j - i);
            continue;
        }
        if (isLetter(c)) {
            let j = i;
            while (j < src.length && isIdent(src[j]))
                j++;
            // the Arabic "as" keyword ends with a tatweel; include it
            while (src[j] === "ـ")
                j++;
            const raw = src.slice(i, j);
            const norm = raw.normalize("NFC");
            const kw = Object.hasOwn(exports.KEYWORDS, norm) ? exports.KEYWORDS[norm] : undefined;
            if (kw)
                push("kw", kw, raw, l, cl);
            else
                push("name", norm, raw, l, cl);
            adv(j - i);
            continue;
        }
        const op = OPS.find((o) => src.startsWith(o, i));
        if (op) {
            if (op === "(")
                depth++;
            if (op === ")")
                depth = Math.max(0, depth - 1);
            push("op", op, op, l, cl);
            adv(op.length);
            continue;
        }
        (0, errors_1.fail)("bad_char", { line: l, col: cl }, { ch: c });
    }
    if (out.length && out[out.length - 1].type !== "nl")
        push("nl", "\n", "\n", line, col);
    push("eof", "", "", line, col);
    return out;
}
