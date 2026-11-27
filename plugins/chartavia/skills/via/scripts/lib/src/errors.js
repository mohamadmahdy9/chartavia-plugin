"use strict";
// Bilingual error messages for the Via language.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViaFail = exports.ERROR_CODES = void 0;
exports.makeError = makeError;
exports.fail = fail;
exports.formatError = formatError;
exports.closest = closest;
const M = {
    bad_char: (p) => ({ en: `unexpected character "${p.ch}"`, ar: `حرف غير متوقع "${p.ch}"` }),
    bad_string: () => ({ en: "text is missing its closing quote", ar: "النص ينقصه علامة التنصيص في آخره" }),
    bad_number: (p) => ({ en: `"${p.text}" is not a valid number`, ar: `"${p.text}" ليس رقمًا صحيحًا` }),
    expected: (p) => ({ en: `expected ${p.what}, found ${p.found}`, ar: `كان المتوقع ${p.what}، لكن وُجد ${p.found}` }),
    no_header: () => ({
        en: 'a script must start with `indicator "title"` or `expert "title"`',
        ar: 'السكريبت لازم يبدأ بـ `indicator "العنوان"` أو `expert "العنوان"`',
    }),
    header_twice: () => ({ en: "the header can appear only once, on the first line", ar: "سطر العنوان يُكتب مرة واحدة فقط في أول السكريبت" }),
    unknown_name: (p) => ({
        en: `unknown name "${p.name}"${p.hint ? `. Did you mean "${p.hint}"?` : ""}`,
        ar: `اسم غير معروف "${p.name}"${p.hint ? `. هل تقصد "${p.hint}"؟` : ""}`,
    }),
    unknown_fn: (p) => ({
        en: `unknown function "${p.name}"${p.hint ? `. Did you mean "${p.hint}"?` : ""}`,
        ar: `دالة غير معروفة "${p.name}"${p.hint ? `. هل تقصد "${p.hint}"؟` : ""}`,
    }),
    not_fn: (p) => ({ en: `"${p.name}" is not a function`, ar: `"${p.name}" ليست دالة` }),
    arity: (p) => ({
        en: `"${p.name}" takes ${p.want} argument(s), got ${p.got}`,
        ar: `"${p.name}" تأخذ ${p.want} مُعطى، وتم تمرير ${p.got}`,
    }),
    redefined: (p) => ({ en: `"${p.name}" is already defined`, ar: `"${p.name}" معرّف بالفعل` }),
    reserved: (p) => ({ en: `"${p.name}" is a built-in name and cannot be redefined`, ar: `"${p.name}" اسم محجوز ولا يمكن إعادة تعريفه` }),
    not_keep: (p) => ({
        en: `"${p.name}" can be changed with := only if it was declared with keep`,
        ar: `لا يمكن تغيير "${p.name}" بـ := إلا إذا عُرّف بـ keep`,
    }),
    top_only: (p) => ({ en: `"${p.what}" must be at the top level, not inside a block`, ar: `"${p.what}" يُكتب في المستوى الأعلى وليس داخل كتلة` }),
    expert_only: (p) => ({ en: `"${p.what}" can be used only in an expert`, ar: `"${p.what}" يُستخدم في الخبير (expert) فقط` }),
    not_in_fn: (p) => ({ en: `"${p.what}" cannot be used inside a function`, ar: `"${p.what}" لا يُستخدم داخل دالة` }),
    tuple_count: (p) => ({
        en: `"${p.name}" returns ${p.want} values, but ${p.got} names were given`,
        ar: `"${p.name}" تُرجع ${p.want} قيم، لكن تم كتابة ${p.got} أسماء`,
    }),
    tuple_needed: (p) => ({
        en: `"${p.name}" returns several values; unpack them with let (a, b, ...) = ${p.name}(...)`,
        ar: `"${p.name}" تُرجع عدة قيم؛ استخدم let (a, b, ...) = ${p.name}(...)`,
    }),
    not_tuple: (p) => ({ en: `"${p.name}" returns a single value`, ar: `"${p.name}" تُرجع قيمة واحدة` }),
    bad_input: () => ({ en: "an input's default must be a number, yes/no or a colour like #7480ff", ar: "القيمة الافتراضية للمدخل لازم تكون رقم أو نعم/لا أو لون زي #7480ff" }),
    bad_option: (p) => ({ en: `unknown option "${p.name}" (use capital, fee, size or shorts)`, ar: `خيار غير معروف "${p.name}" (المتاح: capital, fee, size, shorts)` }),
    bad_info: (p) => ({ en: `unknown info field "${p.name}" (use version, author, description, license, homepage, id, credit or source)`, ar: `حقل معلومات غير معروف "${p.name}" (المتاح: version, author, description, license, homepage, id, credit, source)` }),
    bad_style: (p) => ({ en: `unknown style "${p.name}" (use line, columns, dots, area or steps)`, ar: `شكل غير معروف "${p.name}" (المتاح: line, columns, dots, area, steps)` }),
    bad_width: () => ({ en: "width must be a whole number from 1 to 4", ar: "السُمك لازم يكون رقم صحيح من 1 إلى 4" }),
    too_many: (p) => ({ en: `too many ${p.what} (max ${p.max})`, ar: `عدد كبير جدًا من ${p.what} (الحد ${p.max})` }),
    fn_order: (p) => ({
        en: `function "${p.name}" must be defined before it is used`,
        ar: `الدالة "${p.name}" لازم تتعرّف قبل استخدامها`,
    }),
    // runtime
    type_num: (p) => ({ en: `"${p.op}" needs numbers, got ${p.got}`, ar: `"${p.op}" تحتاج أرقام، لكن وُجد ${p.got}` }),
    bad_length: (p) => ({ en: `length for "${p.name}" must be a whole number ≥ 1, got ${p.got}`, ar: `الطول في "${p.name}" لازم يكون رقم صحيح ≥ 1، لكن وُجد ${p.got}` }),
    loop_limit: () => ({ en: "a loop ran more than 5,000 times on one bar", ar: "تكرار اشتغل أكتر من 5,000 مرة على شمعة واحدة" }),
    op_limit: () => ({ en: "the script did too much work (operation limit reached)", ar: "السكريبت عمل حسابات كتير جدًا (تم الوصول لحد العمليات)" }),
    time_limit: () => ({ en: "the script took too long to run", ar: "السكريبت أخد وقت طويل جدًا" }),
    type_list: (p) => ({ en: `"${p.fn}" needs a list made with list()`, ar: `"${p.fn}" محتاجة قائمة معمولة بـ list()` }),
    list_limit: (p) => ({ en: `a list can hold at most ${p.max} items`, ar: `القائمة تشيل ${p.max} عنصر بالكتير` }),
    bad_point: (p) => ({ en: `"${p.what}" needs a bar number and a price for each point`, ar: `"${p.what}" محتاجة رقم شمعة وسعر لكل نقطة` }),
    bad_cell: () => ({ en: "cell row must be 0-29 and column 0-11", ar: "صف الخلية لازم من 0 لـ 29 والعمود من 0 لـ 11" }),
    bad_panel: (p) => ({ en: `unknown panel place "${p.got}" (use "top_right", "top_left", "bottom_right" or "bottom_left")`, ar: `مكان لوحة غير معروف "${p.got}" (المتاح: "top_right", "top_left", "bottom_right", "bottom_left")` }),
    bad_field: (p) => ({ en: `unknown field "${p.got}" (use "open", "high", "low" or "close")`, ar: `حقل غير معروف "${p.got}" (المتاح: "open", "high", "low", "close")` }),
    limit_marks: () => ({ en: "more than 500 marks; extra marks were dropped", ar: "أكتر من 500 علامة؛ تم تجاهل الزيادة" }),
};
/** Every error and warning code, for the generated error reference. */
exports.ERROR_CODES = Object.keys(M);
function makeError(code, pos, p = {}) {
    const m = (M[code] ?? (() => ({ en: code, ar: code })))(p);
    return { code, line: pos.line, col: pos.col, en: m.en, ar: m.ar };
}
class ViaFail extends Error {
    err;
    constructor(err) {
        super(`line ${err.line}, col ${err.col}: ${err.en}`);
        this.err = err;
    }
}
exports.ViaFail = ViaFail;
function fail(code, pos, p = {}) {
    throw new ViaFail(makeError(code, pos, p));
}
function formatError(e, lang = "en") {
    return lang === "ar" ? `السطر ${e.line}، العمود ${e.col}: ${e.ar}` : `line ${e.line}, col ${e.col}: ${e.en}`;
}
function closest(name, candidates) {
    let best, bestD = Infinity;
    for (const c of candidates) {
        const d = lev(name.toLowerCase(), c.toLowerCase());
        if (d < bestD) {
            bestD = d;
            best = c;
        }
    }
    const limit = name.length <= 3 ? 1 : 2;
    return bestD <= limit ? best : undefined;
}
function lev(a, b) {
    if (Math.abs(a.length - b.length) > 3)
        return 99;
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = dp[j];
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
            prev = tmp;
        }
    }
    return dp[b.length];
}
