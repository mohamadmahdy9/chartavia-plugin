# Chartavia plugin for Claude Code

Teaches Claude **Via** (ڤيا), Chartavia's language for chart indicators and trading
experts. Claude can write a script from a plain description (English or Arabic), check it
with the same compiler the site uses, test-run it on sample or real bars, and explain or
fix your own scripts.

## Install

```
/plugin marketplace add mohamadmahdy9/chartavia-plugin
/plugin install chartavia@chartavia
```

Then ask, for example:

- "Write a Chartavia indicator that colors bars when RSI is above 70."
- "اكتبلي خبير بيشتري لما السعر يقفل فوق متوسط 50 ووقف خسارة 2%"
- "Why does my .via script say unknown name?"

Paste the result into the editor at https://chartavia.com/chart/script and press Run.

## What's inside

- `skills/via/SKILL.md`: how to write Via, the rules that trip people up, and the workflow.
- `skills/via/reference/`: the full language spec and every built-in function (generated).
- `skills/via/examples/`: nine working scripts (generated).
- `skills/via/scripts/check.cjs`: the Via compiler and runtime as a command-line checker
  (`node check.cjs my.via --run`). Needs Node 18 or newer.

The language itself lives in the Chartavia app repository; this plugin is generated from it.
