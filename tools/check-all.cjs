#!/usr/bin/env node
// Compiles and runs every example in examples/ and every complete script in docs/ with the real Via
// engine, on 3,000 hourly sample bars. Fails if anything does not compile, stops with an error, shows
// nothing on the chart, or (for experts) makes no trade.  Usage: npm run check
"use strict";
const fs = require("fs");
const path = require("path");
const { compile, execute, formatError } = require("../plugins/chartavia/skills/via/scripts/lib/src/index.js");

const root = path.join(__dirname, "..");
function bars(n = 3000) {
  const out = []; let seed = 7, price = 2000, vol = 0.004;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => { let s = 0; for (let k = 0; k < 6; k++) s += rnd(); return (s - 3) / Math.sqrt(0.5); };
  for (let i = 0; i < n; i++) {
    vol = Math.max(0.0015, Math.min(0.02, vol * (0.92 + rnd() * 0.16) + (rnd() < 0.02 ? 0.004 : 0)));
    const o = price * (1 + (rnd() < 0.03 ? gauss() * vol : 0));
    price = Math.max(1, o * (1 + Math.sin(i / 150) * 0.0006 + gauss() * vol));
    const high = Math.max(o, price) * (1 + Math.abs(gauss()) * vol * 0.5), low = Math.min(o, price) * (1 - Math.abs(gauss()) * vol * 0.5);
    out.push({ time: Date.UTC(2025, 5, 2) + i * 3600e3, open: o, high, low, close: price, volume: Math.round(500 + rnd() * 1500 * (vol / 0.004)) });
  }
  return out;
}
const data = bars();
const walk = (d, ext) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name), ext) : e.name.endsWith(ext) ? [path.join(d, e.name)] : []);

let failed = 0, count = 0;
function check(label, source) {
  count++;
  const c = compile(source);
  if (!c.ok) { failed++; console.log(`FAIL ${label}\n  ` + c.errors.map((e) => formatError(e)).join("\n  ")); return; }
  const r = execute(c.script, data);
  const visible = r.plots.some((p) => p.values.some((v) => v !== null)) || r.drawings.length || r.marks.length || r.paints.length || (r.panel && r.panel.cells.length);
  const problem = !r.ok ? formatError(r.error) : !visible ? "shows nothing on the chart" : c.script.kind === "expert" && !(r.report && r.report.trades) ? "made no trades" : "";
  if (problem) { failed++; console.log(`FAIL ${label}: ${problem}`); }
}
for (const f of walk(path.join(root, "examples"), ".via")) check(path.relative(root, f), fs.readFileSync(f, "utf8"));
for (const f of walk(path.join(root, "docs"), ".md")) {
  let k = 0;
  for (const m of fs.readFileSync(f, "utf8").matchAll(/```via\n([\s\S]*?)```/g)) {
    k++;
    if (/^\s*(indicator|expert|مؤشر|خبير)\s/.test(m[1])) check(`${path.relative(root, f)} (code block ${k})`, m[1]);
  }
}
console.log(`${count - failed} of ${count} scripts OK`);
process.exit(failed ? 1 : 0);
