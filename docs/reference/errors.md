# Via error messages (generated)

The editor and `tools/check.cjs` show each problem with its line and column, in English and Arabic.
Values in quotes below are examples.

| Code | English | العربية |
|---|---|---|
| `bad_char` | unexpected character "@" | حرف غير متوقع "@" |
| `bad_string` | text is missing its closing quote | النص ينقصه علامة التنصيص في آخره |
| `bad_number` | "1x" is not a valid number | "1x" ليس رقمًا صحيحًا |
| `expected` | expected a value, found "then" | كان المتوقع a value، لكن وُجد "then" |
| `no_header` | a script must start with `indicator "title"` or `expert "title"` | السكريبت لازم يبدأ بـ `indicator "العنوان"` أو `expert "العنوان"` |
| `header_twice` | the header can appear only once, on the first line | سطر العنوان يُكتب مرة واحدة فقط في أول السكريبت |
| `unknown_name` | unknown name "clse". Did you mean "close"? | اسم غير معروف "clse". هل تقصد "close"؟ |
| `unknown_fn` | unknown function "clse". Did you mean "close"? | دالة غير معروفة "clse". هل تقصد "close"؟ |
| `not_fn` | "clse" is not a function | "clse" ليست دالة |
| `arity` | "clse" takes 2 argument(s), got 3 | "clse" تأخذ 2 مُعطى، وتم تمرير 3 |
| `redefined` | "clse" is already defined | "clse" معرّف بالفعل |
| `reserved` | "clse" is a built-in name and cannot be redefined | "clse" اسم محجوز ولا يمكن إعادة تعريفه |
| `not_keep` | "clse" can be changed with := only if it was declared with keep | لا يمكن تغيير "clse" بـ := إلا إذا عُرّف بـ keep |
| `top_only` | "a value" must be at the top level, not inside a block | "a value" يُكتب في المستوى الأعلى وليس داخل كتلة |
| `expert_only` | "a value" can be used only in an expert | "a value" يُستخدم في الخبير (expert) فقط |
| `not_in_fn` | "a value" cannot be used inside a function | "a value" لا يُستخدم داخل دالة |
| `tuple_count` | "clse" returns 2 values, but 3 names were given | "clse" تُرجع 2 قيم، لكن تم كتابة 3 أسماء |
| `tuple_needed` | "clse" returns several values; unpack them with let (a, b, ...) = clse(...) | "clse" تُرجع عدة قيم؛ استخدم let (a, b, ...) = clse(...) |
| `not_tuple` | "clse" returns a single value | "clse" تُرجع قيمة واحدة |
| `bad_input` | an input's default must be a number, yes/no or a colour like #7480ff | القيمة الافتراضية للمدخل لازم تكون رقم أو نعم/لا أو لون زي #7480ff |
| `bad_option` | unknown option "clse" (use capital, fee, size or shorts) | خيار غير معروف "clse" (المتاح: capital, fee, size, shorts) |
| `bad_info` | unknown info field "clse" (use version, author, description, license, homepage, id, credit or source) | حقل معلومات غير معروف "clse" (المتاح: version, author, description, license, homepage, id, credit, source) |
| `bad_style` | unknown style "clse" (use line, columns, dots, area or steps) | شكل غير معروف "clse" (المتاح: line, columns, dots, area, steps) |
| `bad_width` | width must be a whole number from 1 to 4 | السُمك لازم يكون رقم صحيح من 1 إلى 4 |
| `too_many` | too many a value (max 16) | عدد كبير جدًا من a value (الحد 16) |
| `fn_order` | function "clse" must be defined before it is used | الدالة "clse" لازم تتعرّف قبل استخدامها |
| `type_num` | "+" needs numbers, got 3 | "+" تحتاج أرقام، لكن وُجد 3 |
| `bad_length` | length for "clse" must be a whole number ≥ 1, got 3 | الطول في "clse" لازم يكون رقم صحيح ≥ 1، لكن وُجد 3 |
| `loop_limit` | a loop ran more than 5,000 times on one bar | تكرار اشتغل أكتر من 5,000 مرة على شمعة واحدة |
| `op_limit` | the script did too much work (operation limit reached) | السكريبت عمل حسابات كتير جدًا (تم الوصول لحد العمليات) |
| `time_limit` | the script took too long to run | السكريبت أخد وقت طويل جدًا |
| `type_list` | "push" needs a list made with list() | "push" محتاجة قائمة معمولة بـ list() |
| `list_limit` | a list can hold at most 16 items | القائمة تشيل 16 عنصر بالكتير |
| `bad_point` | "a value" needs a bar number and a price for each point | "a value" محتاجة رقم شمعة وسعر لكل نقطة |
| `bad_cell` | cell row must be 0-29 and column 0-11 | صف الخلية لازم من 0 لـ 29 والعمود من 0 لـ 11 |
| `bad_panel` | unknown panel place "3" (use "top_right", "top_left", "bottom_right" or "bottom_left") | مكان لوحة غير معروف "3" (المتاح: "top_right", "top_left", "bottom_right", "bottom_left") |
| `bad_field` | unknown field "3" (use "open", "high", "low" or "close") | حقل غير معروف "3" (المتاح: "open", "high", "low", "close") |
| `limit_marks` | more than 500 marks; extra marks were dropped | أكتر من 500 علامة؛ تم تجاهل الزيادة |
