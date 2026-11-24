#!/usr/bin/env node
// Checks and test-runs a Via script with the same compiler and runtime Chartavia uses.
//
//   node check.cjs script.via              compile only: prints problems or "OK"
//   node check.cjs script.via --run        also run on 600 sample bars and print a summary
//   node check.cjs script.via --run --bars data.csv   run on your own bars (time,open,high,low,close,volume)
//   node check.cjs - --run < script.via    read the script from stdin
//   add --json for machine-readable output, --ar for Arabic messages
"use strict";
const fs = require("fs");
const { compile, execute, formatError } = require("./lib/src/index.js");

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
if (!file) { console.error("usage: node check.cjs <script.via | -> [--run] [--bars file.csv] [--json] [--ar]"); process.exit(2); }

const source = file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8");
const lang = flag("--ar") ? "ar" : "en";
const json = flag("--json");

function sampleBars(n = 600) {
  const out = []; let seed = 42, price = 30000;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const open = price;
    price = Math.max(1, price * (1 + Math.sin(i / 40) * 0.004 + (rnd() - 0.5) * 0.012));
    const close = price, wick = price * 0.004;
    out.push({ time: Date.UTC(2025, 0, 1) + i * 4 * 3600e3, open, high: Math.max(open, close) + rnd() * wick, low: Math.min(open, close) - rnd() * wick, close, volume: 100 + rnd() * 900 });
  }
  return out;
}
function readBars(path) {
  const text = fs.readFileSync(path, "utf8").trim();
  if (text.startsWith("[")) return JSON.parse(text);
  const rows = text.split(/\r?\n/).filter(Boolean);
  const head = rows[0].toLowerCase().split(",");
  const hasHead = head.includes("close");
  const idx = (k, d) => (hasHead ? head.indexOf(k) : d);
  const cols = { time: idx("time", 0), open: idx("open", 1), high: idx("high", 2), low: idx("low", 3), close: idx("close", 4), volume: idx("volume", 5) };
  return rows.slice(hasHead ? 1 : 0).map((r) => {
    const c = r.split(",");
    const t = c[cols.time]; const time = /^\d+$/.test(t) ? Number(t) : Date.parse(t);
    return { time, open: +c[cols.open], high: +c[cols.high], low: +c[cols.low], close: +c[cols.close], volume: cols.volume >= 0 ? +c[cols.volume] || 0 : 0 };
  });
}

const c = compile(source);
if (!c.ok) {
  if (json) console.log(JSON.stringify({ ok: false, errors: c.errors }, null, 2));
  else { console.log(`${c.errors.length} problem(s):`); for (const e of c.errors) console.log("  " + formatError(e, lang)); }
  process.exit(1);
}
const s = c.script;
const head = { ok: true, kind: s.kind, title: s.title, overlay: s.overlay, inputs: s.inputs, meta: s.meta };
if (!flag("--run")) {
  if (json) console.log(JSON.stringify(head, null, 2));
  else console.log(`OK: ${s.kind} "${s.title}"${s.overlay ? " (overlay)" : ""}, ${s.inputs.length} input(s)`);
  process.exit(0);
}

const bars = opt("--bars") ? readBars(opt("--bars")) : sampleBars();
const r = execute(s, bars);
const last = (arr) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] !== null) return arr[i]; return null; };
const firstIdx = (arr) => arr.findIndex((v) => v !== null);
const summary = {
  ...head,
  bars: bars.length,
  runOk: r.ok,
  error: r.error ? formatError(r.error, lang) : undefined,
  warnings: r.warnings.map((w) => formatError(w, lang)),
  plots: r.plots.map((p) => ({ name: p.name, style: p.style, firstValueAtBar: firstIdx(p.values), last: last(p.values), empty: firstIdx(p.values) < 0 })),
  levels: r.levels,
  marks: r.marks.length,
  paints: r.paints.length,
  alerts: r.alerts.length,
  lastAlerts: r.alerts.slice(-3).map((a) => a.message),
  ops: r.ops,
};
if (r.report) {
  const p = r.report;
  summary.report = {
    netProfit: +p.netProfit.toFixed(2), netPct: +p.netPct.toFixed(2), trades: p.trades, winRate: +p.winRate.toFixed(1),
    profitFactor: p.profitFactor === null ? "inf" : +p.profitFactor.toFixed(2), maxDrawdownPct: +p.maxDrawdownPct.toFixed(2),
    openPosition: p.open ? p.open.side : "none", firstTrades: p.list.slice(0, 3).map((t) => `${t.side} @${t.entryPrice.toFixed(2)} -> ${t.exitPrice.toFixed(2)} (${t.reason}, ${t.profit.toFixed(2)})`),
  };
}
if (json) console.log(JSON.stringify(summary, null, 2));
else {
  console.log(`${s.kind} "${s.title}" on ${bars.length} ${opt("--bars") ? "" : "sample "}bars: ${r.ok ? "ran OK" : "STOPPED"}`);
  if (!r.ok) console.log("  " + summary.error);
  for (const w of summary.warnings) console.log("  warning: " + w);
  for (const p of summary.plots) console.log(`  draw "${p.name}" (${p.style}): ${p.empty ? "NO VALUES (check the formula)" : `starts at bar ${p.firstValueAtBar}, last = ${p.last}`}`);
  for (const l of r.levels) console.log(`  level ${l.value}${l.name ? ` "${l.name}"` : ""}`);
  console.log(`  marks: ${summary.marks}, painted bars: ${summary.paints}, alerts: ${summary.alerts}, operations: ${r.ops}`);
  if (summary.report) {
    const p = summary.report;
    console.log(`  backtest: net ${p.netProfit} (${p.netPct}%), ${p.trades} trades, win ${p.winRate}%, PF ${p.profitFactor}, max DD ${p.maxDrawdownPct}%, open: ${p.openPosition}`);
    for (const t of p.firstTrades) console.log("    " + t);
  }
}
process.exit(r.ok ? 0 : 1);
