<div dir="rtl">

# ڤيا: لغة المؤشرات والإكسبرتات في شارتاڤيا

**ڤيا (Via)** هي اللغة اللي بتكتب بيها مؤشراتك وإكسبرتاتك على [شارتاڤيا](https://chartavia.com). المستودع ده فيه كل
حاجة عن اللغة: الشرح، والمرجع الكامل، وعشرات الأمثلة المتجربة، وملف جاهز تدّيه لأي ذكاء اصطناعي.

**الفكرة ببساطة:** نزّل ملف واحد، ادّيه لـ ChatGPT أو Gemini أو Claude، واطلب المؤشر اللي في دماغك بالعربي. هيكتبهولك
بلغة ڤيا، وانت تلزقه في محرر شارتاڤيا وتشغّله.

## ابدأ في 3 خطوات

1. نزّل الملف [`ai/via-for-ai.md`](ai/via-for-ai.md) (افتحه واضغط زرار التنزيل **Download raw file**).
2. ارفعه في شات مع الذكاء الاصطناعي اللي بتستخدمه، واطلب: «اعملي مؤشر بيعلّم الفجوات السعرية ويمسحها لما تتقفل».
3. انسخ الكود اللي طلع، وافتح [محرر ڤيا](https://chartavia.com/chart/script)، الصقه، واضغط تشغيل.

**الشرح خطوة بخطوة لكل أداة (ChatGPT وGemini وClaude وغيرهم):** [docs/ar/use-with-ai.md](docs/ar/use-with-ai.md)

## اتعلم اللغة بنفسك

- [ڤيا في 10 دروس قصيرة](docs/ar/tutorial.md)
- [كتاب الوصفات: سكريبتات جاهزة](docs/cookbook.md)
- [المرجع الكامل](docs/reference/language.md) و[كل الدوال](docs/reference/functions.md) و[رسائل الأخطاء](docs/reference/errors.md)
- [الأخطاء الشائعة](docs/common-mistakes.md)
- [لو جاي من Pine Script](docs/pine-to-via.md)
- [التوثيق على الموقع](https://chartavia.com/docs/via)

</div>

---

# Via: the indicator and expert language of Chartavia

**Via** is the language for your own indicators and trading experts on [Chartavia](https://chartavia.com).
This repository has everything about it: a tutorial, the full reference, dozens of checked examples, and
one file you can give to any AI assistant.

**In short:** download one file, give it to ChatGPT, Gemini or Claude, and ask for the indicator you have
in mind. It writes it in Via; you paste it into the Chartavia editor and run it.

## Start in 3 steps

1. Download [`ai/via-for-ai.md`](ai/via-for-ai.md) (open it and press **Download raw file**).
2. Upload it in a chat with your AI and ask: "Make an indicator that boxes fair value gaps and removes them once filled."
3. Copy the script, open the [Via editor](https://chartavia.com/chart/script), paste it and press Run.

**Step-by-step for each tool (ChatGPT, Gemini, Claude, coding agents):** [docs/en/use-with-ai.md](docs/en/use-with-ai.md)

## What's inside

| Path | What |
|---|---|
| [`ai/via-for-ai.md`](ai/via-for-ai.md) | The complete kit in one file for AI assistants (also [`llms-full.txt`](llms-full.txt)) |
| [`ai/via-quick.md`](ai/via-quick.md) | A shorter version to paste into a chat |
| [`ai/instructions.md`](ai/instructions.md) | Instructions for a custom GPT, a Gem or a Claude project |
| [`docs/`](docs) | [Tutorial](docs/en/tutorial.md) ([عربي](docs/ar/tutorial.md)), [reference](docs/reference/language.md), [functions](docs/reference/functions.md), [errors](docs/reference/errors.md), [cookbook](docs/cookbook.md), [common mistakes](docs/common-mistakes.md), [Pine Script to Via](docs/pine-to-via.md) |
| [`examples/`](examples) | Working scripts: `basics/`, `indicators/`, `experts/`, and the 41-script community `library/` |
| [`tools/`](tools) | `check.cjs`: check and test-run any `.via` file with the real compiler (Node 18+) |
| [`plugins/chartavia`](plugins/chartavia) | The Claude Code plugin |
| [`AGENTS.md`](AGENTS.md) | Instructions for coding agents (Cursor, Copilot, Codex, Claude Code...) |

## Claude Code plugin

```
/plugin marketplace add mohamadmahdy9/chartavia-plugin
/plugin install chartavia@chartavia
```

## Check a script on your computer

```
node tools/check.cjs my-script.via --run        # compile and run on sample bars
node tools/check.cjs my-script.via --run --ar   # messages in Arabic
npm run check                                   # check every example in this repository
```

Every example and every complete script in the docs is compiled and run against the real Via engine
before each release. A backtest is a test on past data, never a promise of profit.

## Licence

Docs, AI files and examples: MIT (see [LICENSE](LICENSE)). The scripts you write are yours.

This repository is generated from the Chartavia app, where the language lives. To report a mistake in the
docs or suggest an example, open an issue.
