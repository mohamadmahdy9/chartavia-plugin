# Cookbook · كتاب الوصفات

Every script here compiles and runs on the real Via engine (checked by `npm run check`).
Open one, copy it into https://chartavia.com/chart/script and press Run, or ask your AI to start from it.

كل سكربت هنا مُختبر على محرك ڤيا الحقيقي. افتحه وانسخه في المحرر واضغط تشغيل، أو اطلب من الذكاء الاصطناعي أن يبدأ منه.

## Basics · الأساسيات

| Script | What it does | ماذا يفعل | Shows |
|---|---|---|---|
| [two-averages](../examples/basics/two-averages.via) | Two moving averages with cross marks | متوسطان متحركان مع علامات التقاطع |  |
| [rsi-zones](../examples/basics/rsi-zones.via) | RSI with zones and colored line | مؤشر القوة النسبية مع مناطق وتلوين |  |
| [bands-squeeze](../examples/basics/bands-squeeze.via) | Volatility bands with squeeze highlight | نطاقات التذبذب مع إبراز الانضغاط |  |
| [macd-columns](../examples/basics/macd-columns.via) | MACD with colored histogram | ماكد مع مدرّج تكراري ملوّن |  |
| [trailing-trend](../examples/basics/trailing-trend.via) | ATR trailing trend line (uses keep) | خط اتجاه متحرك بالـ ATR (باستخدام keep) |  |
| [arabic](../examples/basics/arabic.via) | A full script written in Arabic | سكربت كامل مكتوب بالعربية |  |
| [swing-structure](../examples/basics/swing-structure.via) | Swing structure with zones and a panel (Via 0.2) | هيكل القمم والقيعان مع مناطق ولوحة (ڤيا 0.2) |  |
| [expert-average-cross](../examples/basics/expert-average-cross.via) | Expert: trade the average cross | خبير: تداول تقاطع المتوسطات |  |
| [expert-rsi-reversion](../examples/basics/expert-rsi-reversion.via) | Expert: RSI mean reversion with stop and target | خبير: الارتداد بمؤشر القوة النسبية مع وقف وهدف |  |
| [expert-breakout](../examples/basics/expert-breakout.via) | Expert: channel breakout with ATR stop | خبير: اختراق القناة مع وقف بالـ ATR |  |

## Indicators (analysis and drawing only) · مؤشرات (تحليل ورسم فقط)

| Script | What it does | ماذا يفعل | Shows |
|---|---|---|---|
| [anchored-vwap-from-date](../examples/indicators/anchored-vwap-from-date.via) | Anchored VWAP and range from a date you pick on a calendar | VWAP مثبّت ونطاق من تاريخ تختاره من التقويم | time inputs (date pickers), 0 = no date picked, keep sums that grow bar by bar |
| [arabic-rsi-alerts](../examples/indicators/arabic-rsi-alerts.via) | An indicator written fully in Arabic keywords: RSI with zones, marks and alerts | مؤشر مكتوب كله بالكلمات العربية: القوة النسبية بمناطقها وعلاماتها وتنبيهاتها | Arabic keywords, Arabic series and function names, Arabic variable names |
| [auto-fibonacci](../examples/indicators/auto-fibonacci.via) | Automatic Fibonacci retracement of the last swing, redrawn on the newest bar | فيبوناتشي تلقائي على آخر موجة، يُعاد رسمه على آخر شمعة | since_high()/since_low(), a list of levels, repeat over a list, a pure fn, lines + labels |
| [average-of-your-choice](../examples/indicators/average-of-your-choice.via) | One moving average, with its type picked from a list in the settings | متوسط متحرك واحد، تختار نوعه من قائمة في الإعدادات | input with options (a drop-down), yes/no input, input groups |
| [average-ribbon](../examples/indicators/average-ribbon.via) | Moving-average ribbon that changes colour with the trend | شريط متوسطات متحركة يتغير لونه مع الاتجاه | several draw lines, a colour chosen by a condition, fade(), marks when the trend flips |
| [candle-patterns](../examples/indicators/candle-patterns.via) | Classic candle patterns: engulfing, hammer, shooting star and inside bar | أنماط شموع كلاسيكية: الابتلاعية والمطرقة والشهاب والشمعة الداخلية | candle anatomy with let, yes/no inputs, new_label for frequent signals (keeps the newest 500), paint |
| [daily-average-any-timeframe](../examples/indicators/daily-average-any-timeframe.via) | A moving average of daily closes that you can see on any intraday chart | متوسط متحرك لإغلاقات الأيام تراه على أي إطار زمني أقل من يوم | detecting a new day, keeping a list of values, list_sum() / len() |
| [fair-value-gaps](../examples/indicators/fair-value-gaps.via) | Fair value gaps (three-candle imbalances) drawn as boxes that disappear once filled | فجوات القيمة العادلة (فجوة بين 3 شموع) مرسومة كصناديق تختفي عندما يغلقها السعر | new_box(), lists of box ids, stretch(), erase(), walking a list backwards with repeat |
| [heikin-ashi-trend](../examples/indicators/heikin-ashi-trend.via) | Heikin Ashi trend: colours the normal candles by the smoothed Heikin Ashi direction | اتجاه هايكن آشي: يلوّن الشموع العادية حسب اتجاه هايكن آشي | keep for a value that depends on its own previous value, paint, alerts on colour change |
| [market-dashboard](../examples/indicators/market-dashboard.via) | A small dashboard in the chart corner: trend, RSI, ADX, volatility and today's change | لوحة صغيرة في زاوية الشارت: الاتجاه وRSI وADX والتذبذب وتغيّر اليوم | panel() and cell(), to_text(), joining text with +, unpacking adx() |
| [previous-day-levels](../examples/indicators/previous-day-levels.via) | Yesterday's high, low and close, today's open and last week's range on any intraday chart | أعلى وأدنى وإغلاق الأمس، وافتتاح اليوم، ونطاق الأسبوع الماضي على أي إطار زمني أقل من يوم | htf() for higher-timeframe values without look-ahead, draw as steps, crossing alerts |
| [session-ranges](../examples/indicators/session-ranges.via) | Asia, London and New York session ranges as boxes | نطاقات جلسات آسيا ولندن ونيويورك كصناديق | in_session() with a time zone, keep + move() to grow a box while the session runs |
| [structure-breaks](../examples/indicators/structure-breaks.via) | Market structure: break of structure (BOS) and change of character (CHoCH) from swing points | هيكل السوق: كسر الهيكل (BOS) وتغيّر الاتجاه (CHoCH) من القمم والقيعان | keep state machine, new_line() from the swing to the break, labels, alerts |
| [supply-demand-zones](../examples/indicators/supply-demand-zones.via) | Supply and demand zones: the candle before a strong move, kept until price closes through it | مناطق العرض والطلب: الشمعة التي تسبق حركة قوية، وتبقى حتى يُغلق السعر متجاوزًا إياها | impulse detection with ATR, boxes with text, removing broken zones, alerts on touch |
| [support-resistance-lines](../examples/indicators/support-resistance-lines.via) | Support and resistance lines from recent swings, extended to the right | خطوط دعم ومقاومة من آخر القمم والقيعان، ممتدة لليمين | new_line() with extend "right", capping how many objects you keep, recolor() on the newest bar |
| [swing-labels](../examples/indicators/swing-labels.via) | Swing highs and lows labelled HH, LH, HL and LL | القمم والقيعان مكتوب عليها HH و LH و HL و LL | pivot detection with prev() + highest(), new_label(), keep to remember the last swing |
| [trend-pullback-alerts](../examples/indicators/trend-pullback-alerts.via) | Alerts for pullbacks inside a trend: RSI dips and recovers while the 50 average is above the 200 | تنبيهات للتصحيح داخل الاتجاه: RSI ينخفض ثم يعود والمتوسط 50 فوق الـ 200 | combining conditions, alert messages with {placeholders}, marks |
| [volume-spikes](../examples/indicators/volume-spikes.via) | Volume columns with unusual spikes highlighted | أعمدة الحجم مع إبراز الأحجام غير العادية | draw as columns with a colour per bar, a separate pane (no overlay), alerts with values |

## Experts (strategies that trade) · خبراء آليون (استراتيجيات تتداول)

| Script | What it does | ماذا يفعل | Shows |
|---|---|---|---|
| [average-cross-atr-stop](../examples/experts/average-cross-atr-stop.via) | Moving-average cross with an ATR stop and a target at a multiple of the risk (longs and shorts) | تقاطع متوسطين مع وقف خسارة بالـ ATR وهدف بمضاعف المخاطرة (شراء وبيع) | option lines, buy/sell with stop and target placed on the same bar |
| [bands-reversion](../examples/experts/bands-reversion.via) | Mean reversion on volatility bands: buy back inside the lower band, sell back inside the upper, exit at the middle | ارتداد إلى المتوسط على نطاقات التذبذب: شراء عند العودة داخل النطاق السفلي، وبيع عند العودة داخل العلوي، وخروج عند المنتصف | unpacking bands(), exit on a condition, position to know which side you are on |
| [breakeven-stop](../examples/experts/breakeven-stop.via) | Trend entries that move the stop to breakeven after one unit of risk, with a time exit | دخول مع الاتجاه، ونقل الوقف إلى نقطة الدخول بعد أن يقطع السعر مسافة المخاطرة، وخروج بالوقت | entry_price, bars_in_trade, changing the stop of an open trade |
| [channel-breakout-trailing](../examples/experts/channel-breakout-trailing.via) | Channel breakout with a trailing ATR stop that only moves in the trade's favour (longs only) | كسر قناة مع وقف متحرك بالـ ATR يتحرك في صالح الصفقة فقط (شراء فقط) | option shorts = no, updating stop every bar, keep for the trailing level |
| [risk-based-size](../examples/experts/risk-based-size.via) | Position size from risk: each trade risks a fixed percent of equity at its stop | حجم الصفقة حسب المخاطرة: تخاطر كل صفقة بنسبة ثابتة من الرصيد عند الوقف | buy <size> with a computed size, equity, a swing-low stop |
| [session-breakout](../examples/experts/session-breakout.via) | Opening-range breakout: trade the break of the first hour of the London session, close by session end | كسر نطاق الافتتاح: ادخل مع كسر الساعة الأولى من جلسة لندن، وأغلق قبل نهاية الجلسة | in_session(), building a range with keep, one trade per day, exit at a time |
| [supertrend-flip](../examples/experts/supertrend-flip.via) | SuperTrend expert: always in the market, flips long and short when the SuperTrend line flips | خبير سوبر ترند: في السوق دائمًا، يقلب بين الشراء والبيع عندما ينقلب خط السوبر ترند | a stateful indicator built with keep, trading on its signals |
| [time-filtered-macd](../examples/experts/time-filtered-macd.via) | MACD crosses traded only on chosen weekdays and hours, flat before the weekend | تقاطعات الماكد تُنفَّذ في أيام وساعات تختارها فقط، ودون صفقات مفتوحة في عطلة نهاية الأسبوع | hour(), weekday(), unpacking macd(), exit on Friday evening |

## Community library: classic studies (MIT) · مكتبة المجتمع: مؤشرات كلاسيكية (MIT)

| Script | What it does | ماذا يفعل | Shows |
|---|---|---|---|
| [sma](../examples/library/sma.via) | Simple Moving Average: Plain average of the last N closes. The most basic trend line. | المتوسط المتحرك البسيط: متوسط آخر N إغلاق. أبسط خط اتجاه. | credit: Classic study (public domain) |
| [ema](../examples/library/ema.via) | Exponential Moving Average: Average that gives more weight to recent closes, so it reacts faster than the simple one. | المتوسط المتحرك الأسي: متوسط يعطي وزنًا أكبر للشموع الأخيرة، فيتحرك أسرع من البسيط. | credit: Classic study (public domain) |
| [wma](../examples/library/wma.via) | Weighted Moving Average: Linearly weighted average: the newest close counts N times, the oldest once. | المتوسط المتحرك الموزون: متوسط موزون خطيًا: يُحسب آخر إغلاق N مرة وأقدمها مرة واحدة. | credit: Classic study (public domain) |
| [hma](../examples/library/hma.via) | Hull Moving Average: Fast, smooth average built from weighted averages to cut most of the lag. | متوسط هَل المتحرك: متوسط سريع وناعم مبني من متوسطات موزونة لتقليل التأخير. | credit: Alan Hull |
| [dema](../examples/library/dema.via) | Double Exponential Moving Average: 2 x EMA minus the EMA of the EMA: less lag than a plain EMA of the same length. | المتوسط الأسي المزدوج (DEMA): ضعف الـ EMA ناقص الـ EMA الخاص به: تأخير أقل من EMA بالطول نفسه. | credit: Patrick Mulloy |
| [tema](../examples/library/tema.via) | Triple Exponential Moving Average: Three stacked EMAs combined to follow price closely with little lag. | المتوسط الأسي الثلاثي (TEMA): ثلاثة متوسطات أسية مركّبة تتبع السعر بتأخير قليل. | credit: Patrick Mulloy |
| [kama](../examples/library/kama.via) | Kaufman Adaptive Moving Average: Speeds up when price trends cleanly and slows down in noise, using the efficiency ratio. | متوسط كوفمان التكيفي (KAMA): يتسارع عندما يتحرك السعر في اتجاه واضح ويهدأ وقت التذبذب، باستخدام نسبة الكفاءة. | credit: Perry Kaufman |
| [vwap](../examples/library/vwap.via) | VWAP: Average price weighted by volume, restarting every day (UTC). | متوسط السعر المرجح بالحجم (VWAP): متوسط السعر مرجّحًا بالحجم، ويبدأ من جديد كل يوم (بتوقيت UTC). | credit: Classic study (public domain) |
| [bollinger](../examples/library/bollinger.via) | Bollinger Bands: A moving average with bands K standard deviations above and below it. | نطاقات بولينجر: متوسط متحرك وحوله نطاقان على بُعد K انحراف معياري. | credit: John Bollinger |
| [keltner](../examples/library/keltner.via) | Keltner Channels: An EMA with bands set a multiple of the average true range away. | قنوات كيلتنر: متوسط أسي وحوله نطاقان على بُعد مضاعف من متوسط المدى الحقيقي. | credit: Chester Keltner (ATR version popularised by Linda Bradford Raschke) |
| [donchian](../examples/library/donchian.via) | Donchian Channels: Highest high and lowest low of the last N bars, with the midpoint. | قنوات دونشيان: أعلى قمة وأدنى قاع في آخر N شمعة، والمنتصف بينهما. | credit: Richard Donchian |
| [envelopes](../examples/library/envelopes.via) | Moving Average Envelopes: A moving average with lines a fixed percentage above and below it. | أغلفة المتوسط المتحرك: متوسط متحرك وخطان فوقه وتحته بنسبة مئوية ثابتة. | credit: Classic study (public domain) |
| [parabolic-sar](../examples/library/parabolic-sar.via) | Parabolic SAR: Stop-and-reverse dots that trail price and speed up as the trend extends. | البارابوليك سار: نقاط وقف وانعكاس تتبع السعر وتتسارع كلما طال الاتجاه. | credit: J. Welles Wilder Jr. |
| [supertrend](../examples/library/supertrend.via) | SuperTrend: ATR bands around the bar midpoint; the line flips sides when price closes through it. | سوبر ترند: نطاقات ATR حول منتصف الشمعة؛ ينقلب الخط إلى الجهة الأخرى عندما يُغلق السعر متجاوزًا إياه. | credit: Olivier Seban |
| [ichimoku](../examples/library/ichimoku.via) | Ichimoku Cloud: Conversion and base lines plus the cloud, drawn where it lands after the forward shift. | سحابة إيشيموكو: خط التحويل وخط الأساس والسحابة، مرسومة في مكانها بعد الإزاحة للأمام. | credit: Goichi Hosoda |
| [adx](../examples/library/adx.via) | ADX and DMI: Trend strength (ADX) with the plus and minus directional lines. | مؤشر ADX وخطوط الاتجاه DMI: قوة الاتجاه (ADX) مع خطي الاتجاه الموجب والسالب. | credit: J. Welles Wilder Jr. |
| [aroon](../examples/library/aroon.via) | Aroon: How recently the highest high and lowest low happened, as 0 to 100. | أرون: منذ متى حدثت أعلى قمة وأدنى قاع، من 0 إلى 100. | credit: Tushar Chande |
| [pivots-classic](../examples/library/pivots-classic.via) | Classic Pivot Points (daily): Floor-trader pivot, three resistances and three supports from the previous day (UTC). | نقاط الارتكاز الكلاسيكية (يومي): نقطة الارتكاز وثلاث مقاومات وثلاثة دعوم من اليوم السابق (بتوقيت UTC). | credit: Classic floor-trader pivots (public domain) |
| [rsi](../examples/library/rsi.via) | Relative Strength Index: Wilder's 0 to 100 momentum oscillator with overbought and oversold zones. | مؤشر القوة النسبية (RSI): مذبذب الزخم لوايلدر من 0 إلى 100، مع منطقتي تشبّع شرائي وبيعي. | credit: J. Welles Wilder Jr. |
| [stochastic](../examples/library/stochastic.via) | Stochastic Oscillator: Where the close sits inside the recent high-low range, with a signal line. | الاستوكاستيك: موضع الإغلاق داخل مدى القمة والقاع الأخير، مع خط إشارة. | credit: George Lane |
| [stoch-rsi](../examples/library/stoch-rsi.via) | Stochastic RSI: The stochastic formula applied to RSI instead of price, for a faster oscillator. | ستوكاستيك RSI: معادلة الاستوكاستيك مطبقة على الـ RSI بدلًا من السعر، فينتج مذبذب أسرع. | credit: Tushar Chande and Stanley Kroll |
| [macd](../examples/library/macd.via) | MACD: Difference of two EMAs, its signal line and the histogram between them. | الماكد (MACD): الفرق بين متوسطين أسيين، وخط الإشارة، والمدرّج التكراري بينهما. | credit: Gerald Appel |
| [cci](../examples/library/cci.via) | Commodity Channel Index: Distance of the typical price from its average, scaled by mean deviation. | مؤشر قناة السلع (CCI): بُعد السعر النموذجي عن متوسطه، مقسومًا على متوسط الانحراف. | credit: Donald Lambert |
| [williams-r](../examples/library/williams-r.via) | Williams %R: Close relative to the recent high-low range, from 0 down to -100. | وليامز %R: الإغلاق بالنسبة إلى مدى القمة والقاع الأخير، من 0 إلى -100. | credit: Larry Williams |
| [roc](../examples/library/roc.via) | Rate of Change: Percent change of the close over N bars. | معدل التغير (ROC): نسبة تغير الإغلاق على مدار N شمعة. | credit: Classic study (public domain) |
| [awesome](../examples/library/awesome.via) | Awesome Oscillator: 5-bar minus 34-bar simple average of the bar midpoint, as columns. | المذبذب الرائع (AO): متوسط 5 شموع ناقص متوسط 34 شمعة لمنتصف الشمعة، على شكل أعمدة. | credit: Bill Williams |
| [ultimate](../examples/library/ultimate.via) | Ultimate Oscillator: Buying pressure averaged over three windows (7, 14 and 28 bars) and weighted 4:2:1. | المذبذب النهائي: متوسط ضغط الشراء على ثلاث فترات (7 و14 و28) موزونًا 4:2:1. | credit: Larry Williams |
| [trix](../examples/library/trix.via) | TRIX: One-bar percent change of a triple-smoothed EMA, with a signal line. | تريكس (TRIX): نسبة التغير لشمعة واحدة لمتوسط أسي منعّم ثلاث مرات، مع خط إشارة. | credit: Jack Hutson |
| [cmo](../examples/library/cmo.via) | Chande Momentum Oscillator: Sum of up moves minus sum of down moves over their total, from -100 to 100. | مذبذب تشاندي للزخم: مجموع الصعود ناقص مجموع الهبوط مقسومًا على إجماليهما، من -100 إلى 100. | credit: Tushar Chande |
| [elder-ray](../examples/library/elder-ray.via) | Elder Ray (Bull and Bear Power): High minus EMA (bull power) and low minus EMA (bear power). | إلدر راي (قوة الثيران والدببة): القمة ناقص المتوسط الأسي (قوة الثيران) والقاع ناقصه (قوة الدببة). | credit: Alexander Elder |
| [coppock](../examples/library/coppock.via) | Coppock Curve: Weighted average of two rates of change; designed for long-term bottoms on monthly charts. | منحنى كوبوك: متوسط موزون لمعدلَي تغيّر؛ صُمّم للقيعان الطويلة على الشارت الشهري. | credit: Edwin Coppock |
| [atr](../examples/library/atr.via) | Average True Range: Wilder-smoothed average of the true range: how much price usually moves per bar. | متوسط المدى الحقيقي (ATR): متوسط المدى الحقيقي بتنعيم وايلدر: مقدار تحرك السعر المعتاد في الشمعة. | credit: J. Welles Wilder Jr. |
| [choppiness](../examples/library/choppiness.via) | Choppiness Index: High values mean sideways chop, low values mean a directional move. | مؤشر التذبذب العرضي (Choppiness): القيم المرتفعة تعني سوقًا عرضيًا، والمنخفضة تعني حركة في اتجاه. | credit: E. W. Dreiss |
| [historical-volatility](../examples/library/historical-volatility.via) | Historical Volatility: Annualised standard deviation of log returns, in percent. | التذبذب التاريخي: الانحراف المعياري للعوائد اللوغاريتمية على أساس سنوي، كنسبة مئوية. | credit: Classic study (public domain) |
| [obv](../examples/library/obv.via) | On Balance Volume: Running total that adds volume on up closes and subtracts it on down closes. | حجم التوازن (OBV): مجموع تراكمي يضيف الحجم عندما يرتفع الإغلاق ويطرحه عندما ينخفض. | credit: Joseph Granville |
| [mfi](../examples/library/mfi.via) | Money Flow Index: A volume-weighted RSI built from the typical price. | مؤشر تدفق الأموال (MFI): RSI مرجّح بالحجم ومبني على السعر النموذجي. | credit: Gene Quong and Avrum Soudack |
| [cmf](../examples/library/cmf.via) | Chaikin Money Flow: Money flow volume summed over N bars and divided by total volume. | تدفق أموال تشايكن (CMF): حجم تدفق الأموال على N شمعة مقسوم على إجمالي الحجم. | credit: Marc Chaikin |
| [accumulation-distribution](../examples/library/accumulation-distribution.via) | Accumulation / Distribution: Running total of money flow volume: where in the bar's range the close lands, times volume. | التجميع والتوزيع (A/D): مجموع تراكمي لحجم تدفق الأموال: موضع الإغلاق في مدى الشمعة مضروبًا في الحجم. | credit: Marc Chaikin |
| [chaikin-oscillator](../examples/library/chaikin-oscillator.via) | Chaikin Oscillator: 3-bar EMA minus 10-bar EMA of the accumulation/distribution line. | مذبذب تشايكن: متوسط أسي 3 ناقص متوسط أسي 10 لخط التجميع والتوزيع. | credit: Marc Chaikin |
| [force-index](../examples/library/force-index.via) | Elder Force Index: Price change times volume, smoothed with an EMA. | مؤشر القوة لإلدر: تغيّر السعر مضروبًا في الحجم، ومنعّمًا بمتوسط أسي. | credit: Alexander Elder |
| [volume-ma](../examples/library/volume-ma.via) | Volume with Moving Average: Volume columns with their simple average; bars above average are highlighted. | الحجم مع متوسطه: أعمدة الحجم مع متوسطها البسيط؛ وتظهر الأعمدة التي فوق المتوسط أوضح. | credit: Classic study (public domain) |
