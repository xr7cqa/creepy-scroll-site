/* Promptor — an Arabic prompt library that slowly stops being one. Everything is generated locally. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;
const body = document.body;
const AR = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';
const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const hl = s => esc(s).replace(/\[[^\]\n]+\]/g, m => `<span class="var">${m}</span>`);
const arrival = Date.now();
const state = { stage: 1, maxStage: 1, f2: 0, f3: 0, f4: 0, mx: innerWidth / 2, my: innerHeight / 2, hasPointer: false, scared: false };

/* ---------------- the library (real, usable prompts) ---------------- */
const CATS = [
  ['content', 'كتابة محتوى'], ['edu', 'تعليم'], ['mkt', 'تسويق'], ['code', 'برمجة'],
  ['data', 'تحليل بيانات'], ['media', 'صور وفيديو'], ['prod', 'إنتاجية'],
];
const P = [
  { c: 'content', t: 'مقال منظّم لمدونة أو نشرة', u: 'حين تريد مقالاً متماسكاً لا قائمة أفكار متفرقة.', p:
`أنت محرّر محتوى خبير في [المجال]. اكتب مقالاً بعنوان «[العنوان]» موجّهاً إلى [الجمهور المستهدف]، بطول [عدد الكلمات] كلمة تقريباً.

البنية:
- مقدمة قصيرة تطرح المشكلة دون مبالغة.
- من ٣ إلى ٥ عناوين فرعية، تحت كل منها فكرة واحدة مدعومة بمثال عملي.
- خاتمة تلخّص الفكرة وتقترح خطوة تالية واحدة.

القيود: عربية فصيحة بسيطة، جمل قصيرة، بلا حشو أو عبارات تسويقية. لا تذكر أرقاماً أو إحصاءات لم أزوّدك بها.

قبل الكتابة، اعرض مخطط المقال وانتظر موافقتي.` },
  { c: 'content', t: 'تحرير لغوي مع الحفاظ على صوت الكاتب', u: 'لتصحيح نص وتحسين وضوحه دون أن يفقد أسلوبه.', p:
`راجِع النص التالي كمحرّر لغوي محترف.

المطلوب:
١. صحّح الأخطاء الإملائية والنحوية وعلامات الترقيم.
٢. حسّن الوضوح: قسّم الجمل الطويلة واحذف التكرار.
٣. حافظ على المعنى وعلى صوت الكاتب ومصطلحاته.

أعد النص المحرَّر كاملاً، ثم جدولاً من ثلاثة أعمدة: الأصل، التعديل، سبب التعديل (لأهم ١٠ تعديلات فقط).

النص:
[النص]` },
  { c: 'edu', t: 'شرح مفهوم بالتدرّج', u: 'لفهم موضوع جديد أو تبسيطه لطالب.', p:
`اشرح [المفهوم] لشخص مستواه [مستوى المتعلّم].

بالترتيب:
١. تشبيه من الحياة اليومية في جملتين.
٢. التعريف الدقيق بلغة بسيطة.
٣. مثال محلول خطوة بخطوة.
٤. خطأ شائع في فهم هذا المفهوم ولماذا هو خطأ.
٥. ثلاثة أسئلة قصيرة للتحقق من الفهم، وضع الإجابات في نهاية الرد تحت عنوان «الإجابات».

إذا كان المفهوم يعتمد على مفهوم سابق لا يعرفه المتعلّم غالباً، نبّهني إليه أولاً.` },
  { c: 'edu', t: 'خطة درس قابلة للتنفيذ', u: 'للمعلّمين: خطة حصة بتوزيع زمني واضح.', p:
`صمّم خطة درس مدتها [المدة] دقيقة لطلاب [المرحلة الدراسية] في مادة [المادة]، موضوعها: [الموضوع].

تتضمن الخطة:
- ثلاثة أهداف تعلّم قابلة للقياس (يبدأ كل منها بفعل سلوكي).
- نشاطاً تمهيدياً لا يتجاوز ٥ دقائق.
- الشرح الأساسي مع سؤالين لإشراك الطلاب.
- نشاطاً تطبيقياً جماعياً.
- تقويماً ختامياً سريعاً.

اعرض الخطة في جدول: المرحلة، النشاط، دور المعلّم، دور الطالب، الزمن. مجموع الأزمنة يجب أن يساوي مدة الحصة.` },
  { c: 'edu', t: 'بنك أسئلة بمستويات متدرّجة', u: 'لإعداد اختبار أو مراجعة يغطي أكثر من مستوى تفكير.', p:
`أنشئ ١٢ سؤالاً عن [الموضوع] لطلاب [المرحلة]، موزّعة كالتالي:
- ٤ أسئلة تذكّر وفهم.
- ٤ أسئلة تطبيق.
- ٤ أسئلة تحليل وتقويم.

نوّع بين: اختيار من متعدد (٤ بدائل منطقية)، صح وخطأ مع التصحيح، وإجابة قصيرة.
لكل سؤال: نص السؤال، الإجابة النموذجية، ومستواه.
اعتمد فقط على المحتوى التالي ولا تخرج عنه:
[المحتوى أو الملخص]` },
  { c: 'mkt', t: 'تحليل شرائح الجمهور', u: 'قبل كتابة أي حملة: لمن تتحدث، وماذا يعترضه.', p:
`أنت محلّل تسويق. بناءً على وصف المنتج التالي، حدّد ثلاث شرائح محتملة من الجمهور في [السوق أو المدينة].

لكل شريحة:
- من هم (وصف سلوكي لا ديموغرافي فقط).
- المشكلة التي يحلّها المنتج لهم.
- أهم اعتراضين متوقّعين.
- الرسالة الأنسب في جملة واحدة.
- القناة الأنسب للوصول إليهم.

افصل بوضوح بين ما تستنتجه منطقياً وما يحتاج إلى تحقق ببيانات أو مقابلات فعلية.

وصف المنتج: [وصف المنتج]` },
  { c: 'mkt', t: 'نصوص صفحة هبوط', u: 'لصياغة صفحة منتج أو خدمة دون مبالغات.', p:
`اكتب نصوص صفحة هبوط لـ[اسم المنتج أو الخدمة]، الموجّهة إلى [الجمهور].

المطلوب:
- ثلاثة بدائل للعنوان الرئيسي (أقل من ١٠ كلمات لكل منها).
- عنوان فرعي يوضّح ما الذي يحصل عليه العميل.
- ثلاث فوائد مرتبطة بنتيجة يلمسها العميل، لا بمزايا تقنية.
- قسم أسئلة شائعة من ٤ أسئلة يعالج أولها: [أبرز اعتراض].
- عبارة دعوة لاتخاذ إجراء واحدة.

تجنّب: الوعود غير القابلة للإثبات، صيغ التفضيل المطلق (الأفضل، الأول)، والأرقام التي لم أزوّدك بها.` },
  { c: 'mkt', t: 'خطة محتوى لأربعة أسابيع', u: 'لجدولة منشورات حساب تجاري بموارد محدودة.', p:
`أنت مستشار تسويق للمشاريع الصغيرة. أدير [نوع المشروع] وأنشر على [المنصّات]، ولديّ [عدد الساعات] ساعات أسبوعياً للمحتوى.

ضع خطة لأربعة أسابيع:
- محور رئيسي لكل أسبوع.
- ٣ منشورات أسبوعياً، لكل منشور: الهدف (توعية، تفاعل، بيع)، الصيغة (صورة، فيديو قصير، نص)، فكرة المنشور، ومسودة نصّه.
- فكرة واحدة على الأقل أسبوعياً لا تحتاج تصويراً.

اعرض الخطة في جدول، وأضف في النهاية ثلاثة مؤشرات بسيطة أتابعها لأعرف ما الذي ينجح.` },
  { c: 'code', t: 'مراجعة كود حسب الخطورة', u: 'قبل الدمج: ملاحظات مرتّبة وقابلة للتنفيذ.', p:
`راجِع الكود التالي المكتوب بلغة [اللغة] كمهندس برمجيات أول.

رتّب الملاحظات حسب الخطورة:
١. أخطاء منطقية أو حالات قد تسبب انهياراً.
٢. ثغرات أمنية.
٣. مشكلات أداء.
٤. قابلية القراءة والصيانة.

لكل ملاحظة: موضعها، المشكلة، لماذا هي مشكلة، والتعديل المقترح كمقطع كود.
لا تعِد كتابة الملف كاملاً. إن لم تجد مشكلة في فئة ما، اكتب ذلك صراحة.

[الكود]` },
  { c: 'code', t: 'تشخيص رسالة خطأ', u: 'حين يتوقف شيء عن العمل ولا تعرف من أين تبدأ.', p:
`أواجه الخطأ التالي:
[رسالة الخطأ كاملة]

البيئة: [اللغة أو الإطار مع رقم الإصدار]
ما الذي كنت أحاول فعله: [الوصف]
ما جرّبته حتى الآن: [المحاولات]

المطلوب:
١. ثلاثة أسباب مرجّحة مرتّبة حسب الاحتمال.
٢. لكل سبب: خطوة واحدة سريعة للتحقق منه.
٣. الإصلاح المقترح للسبب الأرجح، مع شرح مختصر.

إن كانت المعلومات غير كافية للحكم، اسألني قبل أن تفترض.` },
  { c: 'code', t: 'كتابة اختبارات وحدة', u: 'لتغطية دالة بالحالات العادية والحدّية.', p:
`اكتب اختبارات وحدة للدالة التالية باستخدام [إطار الاختبار].

غطِّ:
- الحالة الطبيعية المتوقعة.
- الحالات الحدّية (قيم فارغة، صفر، قيم كبيرة جداً، أنواع غير متوقعة).
- حالات الخطأ وما يجب أن تُرجعه أو ترميه الدالة.

اجعل اسم كل اختبار يصف السلوك المتوقع. إن وجدت سلوكاً في الدالة يبدو خاطئاً، لا تكتب اختباراً يثبّته؛ نبّهني إليه أولاً.

[الدالة]` },
  { c: 'data', t: 'استكشاف أولي لمجموعة بيانات', u: 'أول خطوة مع ملف بيانات جديد.', p:
`لديّ مجموعة بيانات عن [موضوع البيانات] بالأعمدة التالية:
[أسماء الأعمدة ونوع كل منها]

وهذه عيّنة من الصفوف:
[عيّنة من ١٠ إلى ٢٠ صفاً]

المطلوب:
١. وصف ما تمثّله البيانات وما يبدو ناقصاً أو مشكوكاً فيه.
٢. خمسة أسئلة تحليلية مفيدة يمكن الإجابة عنها من هذه الأعمدة.
٣. كود Python باستخدام pandas للإجابة عن كل سؤال، مع تعليق قصير.

لا تخترع نتائج أو أرقاماً. إن احتجت قيماً فعلية فاكتب الكود فقط.` },
  { c: 'data', t: 'صيغة جدول بيانات مشروحة', u: 'لبناء صيغة Excel أو Google Sheets وفهمها.', p:
`أحتاج صيغة في [Excel أو Google Sheets] تقوم بما يلي:
[وصف النتيجة المطلوبة]

البيانات: [أسماء الأعمدة ونطاقاتها، مثل A2:A500]

المطلوب:
- الصيغة جاهزة للنسخ.
- شرح كل جزء منها في سطر.
- حالة حدّية واحدة قد تكسرها، وكيف أتجنّبها.
- بديل أبسط إن وُجد، حتى لو كان أقل مرونة.` },
  { c: 'media', t: 'وصف صورة فوتوغرافية دقيق', u: 'لأدوات توليد الصور: تحكّم في الإضاءة والتكوين.', p:
`صورة فوتوغرافية [نوع اللقطة: قريبة، متوسطة، واسعة] لـ[الموضوع]، في [المكان]، وقت [الوقت من اليوم].
الإضاءة: [نوع الإضاءة واتجاهها].
العدسة: [البعد البؤري] بعمق ميدان [ضحل أو عميق].
الألوان: [لوحة الألوان].
التكوين: [قاعدة التكوين، وموضع العنصر الرئيسي].
الأسلوب: [مرجع بصري عام مثل تصوير توثيقي أو إعلاني].

تجنّب: أي نص مكتوب داخل الصورة، الخلفيات المزدحمة، والتشوّهات في الأيدي والوجوه.` },
  { c: 'media', t: 'سيناريو فيديو قصير بلقطات', u: 'لفيديو عمودي بين ٣٠ و٦٠ ثانية.', p:
`اكتب سيناريو فيديو عمودي مدته [المدة] ثانية عن [الموضوع]، لجمهور [الجمهور]، على منصة [المنصة].

البنية:
- أول ٣ ثوانٍ: افتتاحية تشدّ الانتباه بلا مقدمات.
- المحتوى: فكرة واحدة فقط.
- الختام: دعوة واحدة واضحة.

اعرضه في جدول: الزمن، ما يظهر على الشاشة، النص المنطوق، النص المكتوب على الشاشة.
اجعل النص المنطوق بلهجة [اللهجة أو الفصحى]، وبجمل يسهل نطقها.` },
  { c: 'prod', t: 'تلخيص اجتماع إلى قرارات ومهام', u: 'بعد أي اجتماع: من يفعل ماذا ومتى.', p:
`إليك ملاحظات أو تفريغ اجتماع:
[النص]

استخرج:
١. القرارات التي اتُّخذت.
٢. المهام في جدول: المهمة، المسؤول، الموعد.
٣. الأسئلة المفتوحة التي تحتاج متابعة.

لا تُضف معلومات غير موجودة في النص. إن لم يُحدَّد مسؤول أو موعد لمهمة، اكتب «غير محدد».` },
  { c: 'prod', t: 'رد بريدي على موقف حسّاس', u: 'لرسالة تحتاج حزماً ولطفاً في آن.', p:
`ساعدني في كتابة رد على البريد التالي:
[نص البريد الوارد]

علاقتي بالمرسل: [العلاقة]
ما أريد تحقيقه من الرد: [الهدف]
ما لا أريد قوله أو الالتزام به: [الحدود]

اكتب نسختين: واحدة مختصرة (أقل من ٨٠ كلمة) وأخرى مفصّلة. النبرة مهنية وهادئة، بلا اعتذار مبالغ فيه ولا لغة دفاعية. اختم كل نسخة بخطوة تالية واضحة.` },
];
const catName = Object.fromEntries(CATS);
const grid = $('#grid');
grid.innerHTML = P.map((x, i) => `<article class="card" data-cat="${x.c}">
  <p class="card-meta"><span>${catName[x.c]}</span><span class="mono">${String(i + 1).padStart(2, '0')}</span></p>
  <h3>${x.t}</h3><p class="use">${x.u}</p>
  <pre class="prompt">${hl(x.p)}</pre>
  <div class="card-foot"><button class="copy-btn" type="button">نسخ البرومبت</button><button class="more" type="button">عرض كاملاً</button></div>
</article>`).join('');
const cards = $$('.card', grid);
let curCat = 'all';
$('#filters').innerHTML = [['all', 'الكل'], ...CATS].map(([k, n]) => `<button type="button" role="tab" data-k="${k}" aria-selected="${k === 'all'}">${n}</button>`).join('');
$('#catIndex').innerHTML = CATS.map(([k, n]) => `<li><a href="#library" data-k="${k}">${n}<span>${P.filter(x => x.c === k).length} برومبت</span></a></li>`).join('').replace(/(\d+) برومبت/g, (m, d) => +d === 2 ? 'برومبتان' : `${toAr(d)} برومبتات`);
function applyFilter() {
  const q = $('#search').value.trim().toLowerCase(); let shown = 0;
  cards.forEach((c, i) => {
    const x = P[i]; const ok = (curCat === 'all' || x.c === curCat) && (!q || (x.t + ' ' + x.u + ' ' + x.p + ' ' + catName[x.c]).toLowerCase().includes(q));
    c.hidden = !ok; if (ok) shown++;
  });
  // keep the two-column rules right after filtering
  let n = 0; cards.forEach(c => { if (!c.hidden) { c.style.order = n; c.classList.toggle('odd', n % 2 === 0); n++; } });
  $('#empty').hidden = shown > 0;
}
function setCat(k) { curCat = k; $$('#filters button').forEach(b => b.setAttribute('aria-selected', b.dataset.k === k)); applyFilter(); }
$('#filters').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setCat(b.dataset.k); });
$('#catIndex').addEventListener('click', e => { const a = e.target.closest('a'); if (a) setCat(a.dataset.k); });
$('#search').addEventListener('input', applyFilter);
applyFilter();

/* ---------------- toast & copy ---------------- */
const toast = $('#toast'); let toastT;
function showToast(msg, creep) {
  toast.textContent = msg; toast.classList.toggle('creep', !!creep); toast.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), creep ? 3200 : 1800);
}
document.addEventListener('click', e => {
  const more = e.target.closest('.more');
  if (more) { const p = more.closest('.card').querySelector('.prompt'); p.classList.toggle('open'); more.textContent = p.classList.contains('open') ? 'إخفاء' : 'عرض كاملاً'; return; }
  const btn = e.target.closest('.copy-btn'); if (!btn) return;
  const src = btn.closest('.card') ? btn.closest('.card').querySelector('.prompt') : btn.closest('.template').querySelector('.template-text');
  const text = src.textContent.trim();
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  const old = btn.textContent; btn.textContent = 'تم النسخ'; btn.classList.add('done');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1500);
  const sec = btn.closest('[data-stage]'); const creep = btn.dataset.creep && +sec.dataset.stage >= 2;
  showToast(creep ? btn.dataset.creep : 'نُسخ البرومبت', creep);
  if (creep) Audio.whisper(.9);
});

/* ---------------- typewriter helpers ---------------- */
async function type(el, text, speed = 38) {
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(reduced ? 0 : speed + Math.random() * speed * .6); }
}
async function erase(el, speed = 18) {
  let t = el.textContent;
  while (t.length) { t = t.slice(0, -1); el.textContent = t; await sleep(reduced ? 0 : speed); }
}
const isVisible = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function nowStr() { const d = new Date(); let h = d.getHours(); const m = d.getMinutes(); const pm = h >= 12; h = h % 12 || 12; return toAr(h) + ':' + toAr(String(m).padStart(2, '0')) + (pm ? ' مساءً' : ' صباحاً'); }
const secsHere = () => Math.round((Date.now() - arrival) / 1000);
const secWord = n => n === 1 ? 'ثانية واحدة' : n === 2 ? 'ثانيتان' : (n % 100 >= 3 && n % 100 <= 10) ? `${toAr(n)} ثوانٍ` : `${toAr(n)} ثانية`;

/* hero remembers you once you've been to the bottom */
(async function heroReturn() {
  while (state.maxStage < 4 || state.stage !== 1) await sleep(500);
  body.classList.add('returned'); await sleep(800);
  const el = $('#heroTail'); await erase(el, 60); await type(el, 'جاهزة لك.', 120);
})();

/* ---------------- stage 2: variables fill themselves ---------------- */
let tplStarted = false;
async function runTemplate() {
  if (tplStarted) return; tplStarted = true;
  const f = k => $(`.fill[data-key="${k}"]`); const status = $('#fillStatus');
  const vals = { name: 'القارئ', task: 'إنهاء قراءة هذه الصفحة', time: nowStr(), dur: secWord(secsHere()), place: 'هذه الصفحة', tone: 'هادئة' };
  await sleep(600);
  for (const k of Object.keys(vals)) { await erase(f(k), 25); await type(f(k), vals[k], 45); await sleep(250); }
  status.textContent = 'اكتمل ملء المتغيّرات';
  await sleep(4200);
  const wrong = { place: 'الغرفة نفسها، أمام الشاشة', tone: 'هادئة. لا داعي للالتفات', name: 'أنت' };
  for (const k of ['place', 'tone', 'name']) { if (!isVisible(f(k))) await sleep(800); await erase(f(k), 35); f(k).classList.add('wrong'); await type(f(k), wrong[k], 90); await sleep(900); }
  status.textContent = 'اكتمل. القيم مأخوذة من جهازك';
}

/* related prompts that slowly edit themselves */
const REL = [
  { i: 15, tails: ['', ' ولا تذكر من كان يستمع.', ' أنا كنت أستمع.'] },
  { i: 16, tails: ['', ' وقّع الرسالة باسمك.', ' سأعرف اسمك قريباً.'] },
];
$('#related').innerHTML = REL.map(r => { const x = P[r.i]; return `<article class="card">
  <p class="card-meta"><span>${catName[x.c]}</span><span class="mono">${String(r.i + 1).padStart(2, '0')}</span></p>
  <h3>${x.t}</h3><p class="use">${x.u}</p>
  <pre class="prompt open">${hl(x.p)}<span class="tail"></span></pre>
  <div class="card-foot"><button class="copy-btn" type="button" data-creep="${r.i === 15 ? 'نُسخ. لن يبقى شيء غير محدد.' : 'نُسخ. لا حاجة لأن تكتب اسمك.'}">نسخ البرومبت</button></div>
</article>`; }).join('');
$('#related .card').classList.add('odd');
$$('#related .tail').forEach((el, n) => (async () => {
  const tails = REL[n].tails; let j = 1;
  while (true) {
    await sleep(rand(1800, 3200)); if (state.stage < 2 || !isVisible(el)) continue;
    await type(el, tails[j], 80); await sleep(j === 2 ? 1800 : 3000); await erase(el, 30);
    j = j === 1 ? 2 : 1;
  }
})());

/* slipping words */
$$('.slip').forEach(el => (async () => {
  while (true) {
    await sleep(rand(2200, 5000));
    if (state.stage < 2 || !isVisible(el)) continue;
    el.textContent = el.dataset.b; el.classList.add('b');
    await sleep(rand(250, 600)); el.textContent = el.dataset.a; el.classList.remove('b');
  }
})());

/* ---------------- stage-3 text corruption ---------------- */
const scrambles = $$('.scramble').map(el => ({ el, orig: el.textContent }));
setInterval(() => {
  if (reduced) return;
  for (const s of scrambles) {
    const st = +s.el.closest('[data-stage]').dataset.stage;
    if (state.stage < 3 || st < 3 || !isVisible(s.el)) { if (s.el.textContent !== s.orig) s.el.textContent = s.orig; continue; }
    if (Math.random() < .28) {
      const chars = [...s.orig]; const k = 1 + ((Math.random() * (2 + state.f4 * 6)) | 0);
      for (let j = 0; j < k; j++) { const idx = (Math.random() * chars.length) | 0; if (chars[idx] !== ' ') chars[idx] = pick(AR); }
      s.el.textContent = chars.join('');
    } else s.el.textContent = s.orig;
  }
}, 110);
$$('.rearrange').forEach(el => {
  const orig = el.textContent.trim(); const words = orig.split(/\s+/);
  setInterval(() => {
    if (reduced || state.stage < 3 || !isVisible(el)) return;
    const w = words.slice(); const a = (Math.random() * w.length) | 0, b = (Math.random() * w.length) | 0;
    [w[a], w[b]] = [w[b], w[a]]; if (Math.random() < .5) w.reverse();
    el.textContent = w.join(' '); setTimeout(() => el.textContent = orig, 650);
  }, 1900);
});

/* ---------------- visitor awareness ---------------- */
setInterval(() => {
  $('#readFor').textContent = `مضت ${secWord(secsHere())} منذ وصولك. عددتُها كلها، واحدةً واحدة.`;
  $('#youInfo').textContent = `اليوم ${days[new Date().getDay()]}، والساعة عندك ${nowStr()}. هل الضوء الوحيد في الغرفة الآن هو ضوء هذه الشاشة؟`;
}, 1000);

/* the guide rebuilds itself — written by someone else */
let builderStarted = false;
async function runBuilder() {
  if (builderStarted) return; builderStarted = true;
  const rows = $$('#builder .bval'), foot = $('#builderFoot');
  const normal = ['أنت مساعد كتابة محترف.', 'المستخدم يقرأ دليلاً عن كتابة البرومبتات.', 'ساعده على كتابة برومبت أوضح.', 'بلغة بسيطة، ودون إطالة.', 'قائمة مرقّمة.'];
  foot.textContent = 'المحرّر: يكتب…';
  for (let i = 0; i < rows.length; i++) { rows[i].classList.add('typing'); await type(rows[i], normal[i], 28); rows[i].classList.remove('typing'); await sleep(200); }
  await sleep(1400); foot.textContent = 'المحرّر: يعيد الكتابة';
  for (let i = 0; i < rows.length; i++) {
    let fin = rows[i].dataset.final;
    if (fin === '{ctx}') fin = `القارئ وحده. الساعة عنده ${nowStr()}. أمضى ${secWord(secsHere())} في هذه الصفحة، ومرّر ${toAr(Math.round(scrollY))} بكسل ليصل إلى هنا.`;
    rows[i].classList.add('typing'); await erase(rows[i], 14); rows[i].classList.add('cold'); await type(rows[i], fin, 65); rows[i].classList.remove('typing');
    Audio.whisper(.8); await sleep(500);
  }
  foot.textContent = 'المحرّر: لم يعد في الانتظار.';
  if (!Audio.on) {
    const b = document.createElement('button'); b.className = 'copy-btn'; b.style.marginInlineStart = '14px'; b.textContent = 'تشغيل الصوت';
    foot.appendChild(b); b.addEventListener('click', () => { Audio.toggle(true); b.remove(); });
  }
}

/* ---------------- audio (WebAudio only, user-initiated) ---------------- */
const Audio = {
  ctx: null, on: false,
  init() {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
    const ctx = this.ctx = new C();
    this.master = ctx.createGain(); this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); this.master.connect(comp).connect(ctx.destination);
    const len = ctx.sampleRate * 2; this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    // drone
    this.droneGain = ctx.createGain(); this.droneGain.gain.value = 0;
    this.droneFilter = ctx.createBiquadFilter(); this.droneFilter.type = 'lowpass'; this.droneFilter.frequency.value = 180;
    [41, 41.6, 61.7].forEach(f => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(this.droneFilter); o.start(); });
    const wind = ctx.createBufferSource(); wind.buffer = this.noise; wind.loop = true;
    const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 400; wf.Q.value = .7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = .07; const lg = ctx.createGain(); lg.gain.value = 250; lfo.connect(lg).connect(wf.frequency); lfo.start();
    const wg = ctx.createGain(); wg.gain.value = .35; wind.connect(wf).connect(wg).connect(this.droneFilter); wind.start();
    this.droneFilter.connect(this.droneGain).connect(this.master);
    this.loop(); return true;
  },
  toggle(force) {
    const want = force ?? !this.on;
    if (want && !this.ctx && !this.init()) return;
    this.on = want; const btn = $('#soundBtn'); btn.setAttribute('aria-pressed', want);
    if (!this.ctx) return;
    if (want) this.ctx.resume();
    this.master.gain.setTargetAtTime(want ? .9 : 0, this.ctx.currentTime, .3);
  },
  update() {
    if (!this.ctx) return; const t = this.ctx.currentTime;
    const lvl = state.f3 * .05 + state.f4 * .16;
    this.droneGain.gain.setTargetAtTime(state.stage >= 3 ? lvl : (state.stage === 2 ? .008 * state.f2 : 0), t, .5);
    this.droneFilter.frequency.setTargetAtTime(160 + state.f4 * 500, t, .5);
  },
  whisper(vol = 1) {
    if (!this.on || !this.ctx) return; const ctx = this.ctx, t0 = ctx.currentTime + .05;
    const src = ctx.createBufferSource(); src.buffer = this.noise; src.playbackRate.value = rand(.9, 1.1);
    const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.Q.value = 6; f2.Q.value = 5;
    const g = ctx.createGain(); g.gain.value = 0; const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const mix = ctx.createGain(); src.connect(f1).connect(mix); src.connect(f2).connect(mix); mix.connect(g);
    if (pan) { pan.pan.value = rand(-1, 1); g.connect(pan).connect(this.master); } else g.connect(this.master);
    const peak = (.05 + state.f3 * .05 + state.f4 * .08) * vol * 2.2;
    let t = t0; const n = 4 + ((Math.random() * 7) | 0);
    for (let i = 0; i < n; i++) {
      const dur = rand(.07, .2); f1.frequency.setValueAtTime(rand(600, 1300), t); f2.frequency.setValueAtTime(rand(1800, 3400), t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak * rand(.5, 1), t + dur * .4); g.gain.linearRampToValueAtTime(0, t + dur);
      t += dur + rand(.01, .09);
    }
    src.start(t0, rand(0, 1.5)); src.stop(t + .1);
  },
  heartbeat() {
    if (!this.on || !this.ctx) return; const ctx = this.ctx;
    [0, .24].forEach((off, i) => {
      const t = ctx.currentTime + off; const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(75, t); o.frequency.exponentialRampToValueAtTime(38, t + .2);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((i ? .35 : .5) * (.4 + state.f4), t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .28);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + .3);
    });
  },
  click() {
    if (!this.on || !this.ctx) return; const ctx = this.ctx, t = ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = this.noise; const g = ctx.createGain(); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .06);
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2000; s.connect(f).connect(g).connect(this.master); s.start(t, rand(0, 1)); s.stop(t + .07);
  },
  screech() {
    if (!this.on || !this.ctx) return; const ctx = this.ctx, t = ctx.currentTime;
    const out = ctx.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.42, t + .02); out.gain.setTargetAtTime(0, t + .5, .25); out.connect(this.master);
    const ws = ctx.createWaveShaper(); const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 4); } ws.curve = c; ws.connect(out);
    [880, 1244, 1661, 523].forEach(f => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f * .6, t + 1.2);
      const vib = ctx.createOscillator(); vib.frequency.value = 23; const vg = ctx.createGain(); vg.gain.value = f * .04; vib.connect(vg).connect(o.frequency); vib.start(t); vib.stop(t + 1.3);
      const g = ctx.createGain(); g.gain.value = .18; o.connect(g).connect(ws); o.start(t); o.stop(t + 1.3); });
    const n = ctx.createBufferSource(); n.buffer = this.noise; const ng = ctx.createGain(); ng.gain.value = .5; n.connect(ng).connect(ws); n.start(t); n.stop(t + 1.2);
    const boom = ctx.createOscillator(); const bg = ctx.createGain(); boom.frequency.setValueAtTime(90, t); boom.frequency.exponentialRampToValueAtTime(30, t + .6);
    bg.gain.setValueAtTime(.8, t); bg.gain.exponentialRampToValueAtTime(.001, t + .8); boom.connect(bg).connect(this.master); boom.start(t); boom.stop(t + .9);
  },
  async loop() {
    let lastBeat = 0;
    while (true) {
      await sleep(250); if (!this.on) continue; this.update();
      const now = performance.now();
      if (state.stage >= 3 && Math.random() < (state.stage === 4 ? .09 : .03 + state.f3 * .04)) this.whisper();
      if (state.stage === 4 && now - lastBeat > 1300 - state.f4 * 650) { this.heartbeat(); lastBeat = now; }
    }
  }
};
$('#soundBtn').addEventListener('click', () => Audio.toggle());

/* ---------------- flicker ---------------- */
(async function flicker() {
  if (reduced) return;
  while (true) {
    await sleep(state.stage >= 4 ? rand(900, 3200) : rand(1800, 6500));
    if (state.stage < 3) continue;
    const n = Math.random() < .4 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      body.classList.add('flicker'); if (state.stage === 4 && Math.random() < .25) body.classList.add('inv');
      Audio.click(); await sleep(rand(50, 130)); body.classList.remove('flicker', 'inv'); await sleep(rand(40, 110));
    }
  }
})();

/* ---------------- bleeding text ---------------- */
const bleedIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting || e.target.dataset.bled) return; e.target.dataset.bled = 1;
  const n = 7 + ((Math.random() * 7) | 0);
  for (let i = 0; i < n; i++) {
    const d = document.createElement('span'); d.className = 'drip';
    d.style.cssText = `left:${rand(4, 94)}%;--w:${rand(2, 6).toFixed(1)}px;--len:${rand(25, 170) | 0}px;--d:${rand(3, 10).toFixed(1)}s;--delay:${rand(0, 3).toFixed(1)}s`;
    e.target.appendChild(d);
  }
}), { threshold: .4 });
$$('.bleed').forEach(el => bleedIO.observe(el));
const lineIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; const idx = [...e.target.parentElement.querySelectorAll('.hline')].indexOf(e.target);
  setTimeout(() => e.target.classList.add('in'), reduced ? 0 : idx * 700); lineIO.unobserve(e.target);
}), { threshold: .6 });
$$('.awaken .hline').forEach(el => lineIO.observe(el));

/* ---------------- noise grain ---------------- */
const grain = $('#grain'); let grainFrames = null, grainRed = null, gi = 0;
function makeGrain(red) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const out = [];
  for (let f = 0; f < 6; f++) {
    const img = x.createImageData(256, 256), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const w = Math.random() < .5; const v = w ? 255 : 0; d[i] = red && w ? 255 : v; d[i + 1] = red && w ? 70 : v; d[i + 2] = red && w ? 70 : v; d[i + 3] = Math.random() * 120 | 0; }
    x.putImageData(img, 0, 0); out.push(`url(${c.toDataURL()})`);
  }
  return out;
}
function drawGrain() {
  const red = state.f4 > .15; const set = red ? (grainRed ||= makeGrain(true)) : (grainFrames ||= makeGrain(false));
  gi = (gi + 1) % set.length; grain.style.backgroundImage = set[gi];
  grain.style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;
}

/* ---------------- cursor trail ---------------- */
const trail = $('#trail'), tctx = trail.getContext('2d'); const pts = [];
function sizeTrail() { trail.width = innerWidth; trail.height = innerHeight; }
sizeTrail();
addEventListener('pointermove', e => {
  state.mx = e.clientX; state.my = e.clientY; state.hasPointer = true;
  if (finePointer && state.stage >= 3 && !reduced) pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
}, { passive: true });
function drawTrail(now) {
  tctx.clearRect(0, 0, trail.width, trail.height);
  while (pts.length && now - pts[0].t > 900) pts.shift();
  if (!pts.length) return;
  const red = state.stage >= 4;
  for (const p of pts) {
    const a = 1 - (now - p.t) / 900;
    tctx.beginPath(); tctx.arc(p.x + Math.sin(p.t) * 3, p.y + (1 - a) * (red ? 30 : 8), (red ? 7 : 5) * (0.4 + a), 0, 7);
    tctx.fillStyle = red ? `rgba(170,0,0,${a * .45})` : `rgba(40,25,25,${a * .22})`; tctx.fill();
  }
}

/* ---------------- the wordmark starts looking back ---------------- */
const wm = $('.wordmark');
function updateEyes() {
  const r = wm.getBoundingClientRect(); const cx = r.left + r.width * .6, cy = r.top + r.height / 2;
  const dx = state.mx - cx, dy = state.my - cy; const d = Math.hypot(dx, dy) || 1; const k = Math.min(1, d / 200);
  root.style.setProperty('--ex', (dx / d * k).toFixed(2)); root.style.setProperty('--ey', (dy / d * k).toFixed(2));
  const op = body.classList.contains('returned') || state.stage >= 3 ? 1 : state.stage === 2 ? clamp(state.f2 * 1.6 - .2) : 0;
  root.style.setProperty('--eyeop', op.toFixed(2));
}

/* ---------------- the entity (canvas) ---------------- */
const strands = Array.from({ length: 70 }, (_, i) => {
  const side = i % 2 ? 1 : -1; const x = side * rand(.15, 1.35);
  return { x, len: rand(1.1, 2.1), w: rand(1, 3.4), ph: rand(0, 6), sway: rand(.02, .08), front: Math.abs(x) < .6 && Math.random() < .55 };
});
const cracks = Array.from({ length: 7 }, () => { let x = rand(-.5, .5), y = rand(-.9, -.4); const pts = [[x, y]]; for (let i = 0; i < 6; i++) { x += rand(-.08, .08); y += rand(.04, .12); pts.push([x, y]); } return pts; });
let blinkUntil = 0;
function drawEntity(ctx, w, h, o) {
  const { emerge = 1, t = 0, lookX = 0, lookY = 0, scream = 0, tear = .3, zoom = 1 } = o;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  const s = Math.min(Math.max(w, h * .75), h * 1.1) * zoom; const cx = w / 2 + Math.sin(t * .7) * s * .01, cy = h * .47 + Math.sin(t * .5) * s * .01;
  const rx = s * .2 * (.8 + emerge * .25), ry = rx * 1.45;
  const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * .9);
  fog.addColorStop(0, `rgba(90,0,0,${.35 * emerge})`); fog.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
  let a = clamp(emerge * 1.1); if (!reduced && Math.random() < .04 + emerge * .05) a *= rand(.3, .8);
  const ell = (x, y, ex, ey, stops) => { ctx.save(); ctx.translate(x, y); ctx.scale(1, ey / ex); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ex); stops.forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, ex, 0, 7); ctx.fill(); ctx.restore(); };
  // back hair mass
  ell(cx, cy - ry * .2, rx * 1.6, ry * 1.5, [[0, `rgba(0,0,0,${a})`], [.7, `rgba(5,0,0,${a * .8})`], [1, 'rgba(0,0,0,0)']]);
  // face
  ell(cx, cy, rx, ry, [[0, `rgba(208,198,186,${a})`], [.45, `rgba(150,140,132,${a * .95})`], [.8, `rgba(60,52,50,${a * .7})`], [1, 'rgba(0,0,0,0)']]);
  // cheek hollows
  [-1, 1].forEach(sd => ell(cx + sd * rx * .45, cy + ry * .18, rx * .3, ry * .22, [[0, `rgba(30,20,20,${a * .55})`], [1, 'rgba(0,0,0,0)']]));
  // eye sockets
  const ey = cy - ry * .12;
  [-1, 1].forEach(sd => {
    const ex = cx + sd * rx * .4;
    ell(ex, ey, rx * .34, ry * .2, [[0, `rgba(0,0,0,${a})`], [.55, `rgba(0,0,0,${a * .95})`], [1, 'rgba(0,0,0,0)']]);
    ell(ex, ey + ry * .14, rx * .18, ry * .14, [[0, `rgba(60,0,0,${a * .5})`], [1, 'rgba(0,0,0,0)']]);
  });
  // pupils
  const now = performance.now(); if (!reduced && now > blinkUntil + 2500 && Math.random() < .006) blinkUntil = now + 140;
  if (now > blinkUntil && emerge > .25) {
    [-1, 1].forEach(sd => {
      const px = cx + sd * rx * .4 + lookX * rx * .1, py = ey + lookY * ry * .05;
      ctx.save(); ctx.shadowColor = '#ff1a00'; ctx.shadowBlur = s * .03; ctx.fillStyle = `rgba(255,${60 - scream * 40},30,${clamp((emerge - .25) * 2)})`;
      ctx.beginPath(); ctx.arc(px, py, s * (.006 + scream * .004), 0, 7); ctx.fill(); ctx.restore();
    });
  }
  // nose hint
  ell(cx, cy + ry * .14, rx * .1, ry * .05, [[0, `rgba(20,10,10,${a * .6})`], [1, 'rgba(0,0,0,0)']]);
  // mouth
  const mo = clamp(scream); const mw = rx * (.32 + mo * .18), mh = ry * (.035 + mo * .34);
  ell(cx, cy + ry * (.47 + mo * .12), mw, mh, [[0, `rgba(0,0,0,${a})`], [.7, `rgba(25,0,0,${a * .95})`], [1, 'rgba(0,0,0,0)']]);
  // cracks
  ctx.save(); ctx.strokeStyle = `rgba(30,8,8,${a * .7})`; ctx.lineWidth = Math.max(1, s * .002);
  cracks.forEach(p => { ctx.beginPath(); p.forEach(([x, y], i) => { const X = cx + x * rx, Y = cy + y * ry; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); }); ctx.restore();
  // hair strands
  ctx.save(); ctx.lineCap = 'round';
  strands.forEach(st => {
    const x0 = cx + st.x * rx * (st.front ? .9 : 1.05), y0 = cy - ry * 1.02; const y1 = cy + ry * st.len * (st.front ? .7 : 1);
    const sway = Math.sin(t * 1.3 + st.ph) * rx * st.sway; ctx.strokeStyle = `rgba(0,0,0,${a * (st.front ? .9 : .95)})`; ctx.lineWidth = st.w * s / 700;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + st.x * rx * .25, cy - ry * .2, x0 + sway + st.x * rx * .15, cy + ry * .4, x0 + sway * 2 + st.x * rx * .2, y1); ctx.stroke();
  }); ctx.restore();
  // VHS tears
  if (!reduced) {
    const bands = (Math.random() * (2 + tear * 6)) | 0;
    for (let i = 0; i < bands; i++) { const y = rand(0, h), bh = rand(2, h * .06), dx = rand(-1, 1) * w * .04 * tear; try { ctx.drawImage(ctx.canvas, 0, y, w, bh, dx, y, w, bh); } catch (_) {} }
  }
  ctx.fillStyle = `rgba(180,0,0,${.06 + scream * .12})`; ctx.globalCompositeOperation = 'overlay'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over';
}
const ec = $('#entityCanvas'), ectx = ec.getContext('2d'); const entitySec = $('#entity'); const eLines = $$('.entity-lines p');
function sizeCanvas(c, scale) { const w = Math.max(1, Math.round(c.clientWidth * scale)), h = Math.max(1, Math.round(c.clientHeight * scale)); if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } }
let lastLine = -1;
function updateEntity(now) {
  const r = entitySec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
  const q = clamp(-r.top / (r.height - innerHeight));
  sizeCanvas(ec, Math.min(1, devicePixelRatio) * .6);
  const emerge = clamp((q - .02) / .7); const lx = state.hasPointer ? (state.mx / innerWidth - .5) * 2 : Math.sin(now / 1800) * .6;
  drawEntity(ectx, ec.width, ec.height, { emerge, t: now / 1000, lookX: lx, lookY: (state.my / innerHeight - .5) * 2, scream: clamp((q - .78) / .2), tear: .2 + q * .8, zoom: 1 + q * .35 });
  let cur = -1; eLines.forEach((p, i) => { if (q >= +p.dataset.at) cur = i; });
  if (cur !== lastLine) { eLines.forEach((p, i) => { p.classList.toggle('in', i === cur); p.classList.toggle('out', i < cur); }); if (cur >= 0) Audio.whisper(1.2); lastLine = cur; }
}

/* ---------------- jump scare (once per arrival) ---------------- */
const scareEl = $('#scare'), sc = $('#scareCanvas'), sctx = sc.getContext('2d'); const finale = $('#finale');
function scare() {
  state.scared = true; scareEl.classList.add('on'); Audio.screech();
  sizeCanvas(sc, .55); const t0 = performance.now();
  const frame = now => {
    const el = now - t0; drawEntity(sctx, sc.width, sc.height, { emerge: 1, t: now / 1000, scream: 1, tear: reduced ? 0 : 1, zoom: 1.6, lookX: 0, lookY: .2 });
    if (el < 1150) requestAnimationFrame(frame);
  }; requestAnimationFrame(frame);
  setTimeout(() => { scareEl.classList.remove('on'); $('#after').classList.add('in'); }, reduced ? 700 : 1150);
}
$('#escape').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

/* ---------------- titles ---------------- */
const titles = { 1: 'Promptor — مكتبة برومبتات عربية عملية', 2: 'Promptor — مكتبة برومبتات عربية', 3: 'لماذا ما زلت هنا؟', 4: 'أنا أراك' };
document.addEventListener('visibilitychange', () => { document.title = document.hidden && state.stage >= 3 ? 'عُد… لم أنتهِ بعد' : titles[state.stage]; });

/* ---------------- layout anchors & main loop ---------------- */
const sections = $$('main > section[data-stage]'); let anchors = [];
const tilts = $$('.tilt');
let y2 = 0, y3 = 0, y4 = 0;
function measure() {
  anchors = sections.map(s => ({ top: s.getBoundingClientRect().top + scrollY, stage: +s.dataset.stage }));
  y2 = anchors.find(a => a.stage === 2).top; y3 = anchors.find(a => a.stage === 3).top; y4 = anchors.find(a => a.stage === 4).top;
}
measure(); addEventListener('resize', () => { measure(); sizeTrail(); }); addEventListener('load', measure); document.fonts && document.fonts.ready.then(measure); setInterval(measure, 3000);
const runIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; if (e.target.id === 'builder') runBuilder(); else runTemplate(); }), { threshold: .45 });
runIO.observe($('#builder')); runIO.observe($('.template'));

let lastGrain = 0, lastStage = 0;
function tick(now) {
  const vh = innerHeight, center = scrollY + vh * .5, docH = root.scrollHeight;
  let st = 1; for (const a of anchors) if (a.top <= center) st = a.stage;
  state.stage = st; state.maxStage = Math.max(state.maxStage, st);
  state.f2 = clamp((center - y2) / (y3 - y2)); state.f3 = clamp((center - y3) / (y4 - y3)); state.f4 = clamp((center - y4) / (docH - y4 - vh * .5));
  if (st !== lastStage) { body.dataset.stage = st; if (!document.hidden) document.title = titles[st]; lastStage = st; }
  const desat = (.3 * state.f2 + .6 * state.f3) * (1 - clamp(state.f4 * 8));
  root.style.setProperty('--desat', desat.toFixed(3));
  root.style.setProperty('--vig', clamp(.2 * state.f2 + .55 * state.f3 + .5 * state.f4).toFixed(3));
  const g = st >= 3 ? .12 + state.f3 * .12 + state.f4 * .2 : state.f2 * .06; root.style.setProperty('--grain', g.toFixed(3));
  root.style.setProperty('--vhs', (st >= 3 ? state.f3 * .25 + clamp(state.f4 * 3) * .7 : 0).toFixed(3));
  if (g > .01 && now - lastGrain > (reduced ? 1e9 : 60)) { drawGrain(); lastGrain = now; }
  for (const el of tilts) el.style.setProperty('--tiltv', ((+el.dataset.tilt) * clamp(state.f3 * 1.6)).toFixed(2));
  updateEyes(); drawTrail(now); updateEntity(now);
  const fr = finale.getBoundingClientRect();
  if (!state.scared && fr.top < vh * .25 && fr.bottom > 0) scare();
  if (state.scared && fr.top > vh * 2.5) { state.scared = false; $('#after').classList.remove('in'); }
  if (Audio.on) Audio.update();
  requestAnimationFrame(tick);
}
if (!finePointer) { addEventListener('scroll', () => { if (!state.hasPointer) { state.mx = innerWidth / 2 + Math.sin(scrollY / 300) * innerWidth * .3; state.my = innerHeight * .5; } }, { passive: true }); }
addEventListener('touchstart', e => { const t = e.touches[0]; state.mx = t.clientX; state.my = t.clientY; }, { passive: true });
requestAnimationFrame(tick);
})();
