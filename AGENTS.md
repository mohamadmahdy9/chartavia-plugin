# Instructions for AI coding agents

This repository documents **Via** (ڤيا), the scripting language of Chartavia (https://chartavia.com) for
chart indicators and trading experts. When the user asks for an indicator, expert, strategy, alert or
backtest for Chartavia, or works on a `.via` file:

1. Read `ai/via-for-ai.md` (the complete reference, rules and examples). Via is not Pine Script, MQL or
   Python: use only what that file describes.
2. Start from the closest script in `examples/` (`basics/`, `indicators/`, `experts/`, `library/`); the
   index is `docs/cookbook.md`.
3. Write the script to a `.via` file and check it with the real compiler before showing it:
   `node tools/check.cjs path/to/script.via --run` (add `--ar` for Arabic messages, `--json` for
   structured output, `--bars data.csv` for the user's own `time,open,high,low,close,volume` bars).
   Fix every reported problem and run it again until it prints `ran OK`, the `draw` lines have values,
   and experts make trades.
4. Answer in the user's language (Egyptian Arabic if they write Arabic) with the whole script, what it
   does, the settings they can change, and how to run it: https://chartavia.com/chart/script, paste,
   Run (Ctrl+Enter). Never present a backtest as a promise of profit.

Run `npm run check` after changing any example or doc in this repository.
