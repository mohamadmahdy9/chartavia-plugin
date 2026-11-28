# Use Via with ChatGPT, Gemini, Claude or any AI

Give your AI assistant one file and it can write Via indicators and experts for you from a plain
description, in Arabic or English.

## Step 1: download the AI file

| File | When to use it |
|---|---|
| [`ai/via-for-ai.md`](../../ai/via-for-ai.md) | **The main file.** The whole language, every function, the rules, and dozens of checked examples. Upload it. |
| [`ai/via-quick.md`](../../ai/via-quick.md) | A shorter version you can paste into a chat when you cannot upload files. |
| [`ai/instructions.md`](../../ai/instructions.md) | Short instructions for the "Instructions" box of a custom GPT, a Gem or a Claude project. |

To download from GitHub: open the file and press the **Download raw file** button (the arrow at the top
right of the file). The same file is also at https://chartavia.com/via/via-for-ai.md.

## Step 2: give it to your AI

### ChatGPT

**Quick (any account):** start a new chat, press **+** (attach), choose `via-for-ai.md`, and write
"Read this file. You will write Via scripts for Chartavia." Then ask for what you want.

**Once and for all, with a Project:** in the sidebar choose **Projects → New project**, name it "Via".
Open the project, add `via-for-ai.md` to its **files**, and paste the text of `instructions.md` into the
project **instructions**. Every chat inside the project now knows Via.

**Your own GPT (paid plans can create one):** go to **Explore GPTs → Create → Configure**. Name: "Via for
Chartavia". Instructions: paste `instructions.md`. Knowledge: upload `via-for-ai.md`. Save. You can keep it
private or share its link.

### Gemini

**Quick:** at gemini.google.com start a chat, press **+** to upload `via-for-ai.md`, and ask.

**With a Gem:** open **Gems → New Gem**. Name: "Via for Chartavia". Instructions: paste `instructions.md`.
Knowledge: add `via-for-ai.md`. Save, then chat with the Gem whenever you need a script.

### Claude

**Quick:** at claude.ai start a chat, attach `via-for-ai.md`, and ask.

**With a Project:** **Projects → Create project** named "Via". Add `via-for-ai.md` to the project
knowledge and paste `instructions.md` into the project instructions.

**Claude Code:** install the plugin, which also lets Claude check each script with the real Via compiler
before showing it:

```
/plugin marketplace add mohamadmahdy9/chartavia-plugin
/plugin install chartavia@chartavia
```

### Cursor, Copilot, Codex and other coding agents

Clone this repository and open it. Agents read [`AGENTS.md`](../../AGENTS.md) automatically. They can
check every script with `node tools/check.cjs my-script.via --run` (Node 18 or newer).

### Any other AI

Paste the whole text of `via-quick.md` as your first message, then ask. If the AI can read web pages,
you can also give it the link https://github.com/mohamadmahdy9/chartavia-plugin/blob/main/ai/via-for-ai.md

## Step 3: ask for what you want

Describe the idea the way you would explain it to a person. Say whether it is an indicator (draws and
alerts) or an expert (trades), and what you want to be able to change. Examples:

- "An indicator that draws the high and low of the first hour of the London session, and alerts me when price breaks either side."
- "Mark every fair value gap bigger than half an ATR as a box that disappears once price fills it."
- "An expert that buys when RSI crosses above 30 while price is above the 200 EMA, stop 1.5 ATR, target 2 times the stop, longs only."
- "Turn my idea into a dashboard in the top left corner with trend, RSI and today's change."
- «اكتب لي مؤشرًا يرسم قمم السوق وقيعانه ويكتب عليها HH وLL»
- «أريد خبيرًا آليًا يشتري عندما يقطع المتوسط 20 المتوسط 50 صعودًا، ووقف الخسارة تحت آخر قاع»

## Step 4: run it on Chartavia

1. Open https://chartavia.com/chart/script (you need to be signed in).
2. Delete what is in the editor, paste the script, and press **Run** (or Ctrl+Enter).
3. Indicators appear on the chart; experts also show a full backtest report.
4. If the editor shows an error, it gives the line and column. Copy the error message back to your AI:
   "The editor says: line 7, col 12: unknown name ... Fix it." It will send a corrected script.
5. Happy with it? Keep improving it with the AI, or publish it in the Store to share it with other members.

A backtest is a test on past data, not a promise of profit. Check every expert yourself before you trust it.
