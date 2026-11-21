/* همسة — a fictional prompt library that slowly wakes up. Everything is generated locally. */
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
const arrival = Date.now();

const state = { stage: 1, maxStage: 1, f2: 0, f3: 0, f4: 0, mx: innerWidth / 2, my: innerHeight / 2, hasPointer: false, scared: false };

/* ---------------- avatars (SVG, generated) ---------------- */
function avatarSVG({ hue = 200, hair = 'short', smile = .3, hollow = false, stock = false }) {
  const skin = `hsl(${25 + (hue % 15)},${45 + (hue % 20)}%,${72 - (hue % 18)}%)`;
  const hairC = `hsl(${20 + (hue % 30)},35%,${14 + (hue % 12)}%)`;
  const bg = stock ? 'url(#sg' + hue + ')' : `hsl(${hue},70%,90%)`;
  const s = smile, w = 6 + s * 9, mx1 = 50 - w, mx2 = 50 + w, my = 55.5, depth = 56 + s * 9;
  const eyeFill = hollow ? '#050000' : '#fff';
  const pupil = hollow ? `<circle class="pupil" data-max="1.6" cx="0" cy="0" r=".9" fill="#ff2a1a"/>` : `<circle class="pupil" data-max="1.7" cx="0" cy="0" r="1.9" fill="#2a1a12"/>`;
  const eye = x => `<g class="eye" transform="translate(${x} 42)"><ellipse rx="4.3" ry="${hollow ? 3.6 : 3}" fill="${eyeFill}"/>${pupil}</g>`;
  const longHairBack = hair === 'long' ? `<path d="M25 50 Q22 16 50 15 Q78 16 75 50 L79 82 Q66 74 63 62 L37 62 Q34 74 21 82Z" fill="${hairC}"/>` : '';
  const hairTop = hair === 'none' ? '' : `<path d="M29 43 Q27 17 50 17 Q73 17 71 43 Q66 27 50 27 Q34 27 29 43Z" fill="${hairC}"/>`;
  const mouth = s > .75
    ? `<path d="M${mx1} ${my} Q50 ${depth + 4} ${mx2} ${my} Q50 ${my + 3} ${mx1} ${my}Z" fill="#3a0d0d"/><path d="M${mx1 + 2} ${my + .6} Q50 ${my + 3.4} ${mx2 - 2} ${my + .6}" stroke="#f3eee6" stroke-width="1.6" fill="none"/>`
    : `<path d="M${mx1} ${my} Q50 ${depth} ${mx2} ${my}" stroke="#8a3b3b" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="sg${hue}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9eef4"/><stop offset="1" stop-color="#c9d6e3"/></linearGradient></defs>
    <rect width="100" height="100" fill="${bg}"/>${longHairBack}
    <path d="M14 100 Q18 72 50 69 Q82 72 86 100Z" fill="hsl(${hue + 40},42%,${stock ? 60 : 48}%)"/>
    <rect x="43" y="58" width="14" height="14" fill="${skin}"/>
    <ellipse cx="50" cy="44" rx="20" ry="24" fill="${skin}"/>${hairTop}
    <ellipse cx="40" cy="50" rx="4" ry="2.4" fill="#ff8a8a" opacity=".25"/><ellipse cx="60" cy="50" rx="4" ry="2.4" fill="#ff8a8a" opacity=".25"/>
    <path d="M37 36.5 Q42 ${hollow ? 38 : 34.5} 46 36.5M54 36.5 Q58 ${hollow ? 38 : 34.5} 63 36.5" stroke="${hairC}" stroke-width="1.3" fill="none"/>
    ${eye(42)}${eye(58)}${mouth}</svg>`;
}
$$('.avatar').forEach(el => el.innerHTML = avatarSVG({ hue: +el.dataset.hue || 200, hair: el.dataset.hair || 'short', smile: el.dataset.smile ? +el.dataset.smile : .3, hollow: !!el.dataset.hollow, stock: !!el.dataset.stock }));
$$('.stack').forEach(el => { const hues = [12, 200, 330, 140, 260]; el.innerHTML = hues.map((h, i) => `<div class="avatar">${avatarSVG({ hue: h, hair: i % 2 ? 'long' : 'short', smile: .35 })}</div>`).join(''); });

/* ---------------- toast & copy ---------------- */
const toast = $('#toast'); let toastT;
function showToast(msg, creep) {
  toast.textContent = msg; toast.classList.toggle('creep', !!creep); toast.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), creep ? 3200 : 1800);
}
$$('.copy').forEach(btn => btn.addEventListener('click', () => {
  const text = btn.closest('.pcard').querySelector('.ptext').textContent.trim();
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  const old = btn.textContent; btn.textContent = 'تم ✓'; btn.classList.add('done');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('done'); }, 1500);
  const creep = btn.dataset.creep && state.stage >= 2;
  showToast(creep ? btn.dataset.creep : 'تم نسخ البرومبت ✓', creep);
  if (creep) Audio.whisper(.9);
}));
$$('.cat').forEach(c => c.addEventListener('click', () => { $$('.cat').forEach(x => x.classList.remove('on')); c.classList.add('on'); }));

/* ---------------- typewriter helpers ---------------- */
async function type(el, text, speed = 38) {
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(reduced ? 0 : speed + Math.random() * speed * .6); }
}
async function erase(el, speed = 18) {
  let t = el.textContent;
  while (t.length) { t = t.slice(0, -1); el.textContent = t; await sleep(reduced ? 0 : speed); }
}
const isVisible = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

/* hero demo */
(async function hero() {
  const p = $('#heroPrompt'), a = $('#heroAnswer');
  const demos = [
    ['اكتب لي ٣ أفكار لمنشورات إنستغرام عن مقهى جديد في الرياض.', 'بكل سرور! ☕ ١. «قهوتك الأولى علينا» ٢. كواليس تحميص البن فجراً ٣. استفتاء: ما مشروبك المفضّل؟'],
    ['لخّص لي هذا التقرير في ٥ نقاط واضحة.', 'إليك الملخّص: ✔ نمو المبيعات ١٨٪ ✔ تحسّن رضا العملاء ✔ فرصة توسّع في الخليج…'],
    ['اقترح اسماً لمتجر عطور عربي فاخر.', 'إليك بعض الأفكار: «عَبَق»، «دار المسك»، «نفحة»، «سِرّ العود» ✨'],
  ];
  let i = 0;
  while (true) {
    if (!isVisible(p)) { await sleep(400); continue; }
    if (state.maxStage >= 4) {
      body.classList.add('returned');
      p.textContent = ''; a.textContent = '';
      await type(p, 'اكتب لي…', 60); await sleep(500);
      await type(a, 'أهلاً بعودتك. كنتُ أنتظرك هنا طوال الوقت. هل ظننت أن الأعلى أكثر أماناً؟', 55);
      await sleep(5000); await erase(a); continue;
    }
    const [q, ans] = demos[i++ % demos.length];
    p.textContent = ''; a.textContent = '';
    await type(p, q, 30); await sleep(500); await type(a, ans, 22); await sleep(3200);
  }
})();

/* self-writing prompt card */
(async function selfWrite() {
  const el = $('#selfWrite'); const lines = [
    'اكتب مقالاً عن أفضل طرق زيادة الإنتاجية في',
    'اكتب مقالاً عن الشخص الذي يقرأ هذا الآن.',
    'إنه يجلس أمام الشاشة. لا يعرف أنني أكتب عنه.',
    'لا تقلق. هذا مجرد برومبت. مجرد برومبت. مجرد',
  ];
  let i = 0;
  while (true) {
    if (!isVisible(el)) { await sleep(500); continue; }
    await type(el, lines[i % lines.length], i % lines.length ? 70 : 40);
    await sleep(i % lines.length === 0 ? 700 : 2200); await erase(el, i % lines.length === 0 ? 30 : 14); i++;
  }
})();

/* slipping words (نرافقك → نراقبك) */
$$('.slip').forEach(el => {
  (async () => {
    while (true) {
      await sleep(rand(2200, 5000));
      if (state.stage < 2 || !isVisible(el)) continue;
      el.textContent = el.dataset.b; el.classList.add('b');
      await sleep(state.stage >= 3 ? 1400 : rand(160, 320));
      el.textContent = el.dataset.a; el.classList.remove('b');
    }
  })();
});

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
const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function nowStr() { const d = new Date(); let h = d.getHours(); const m = d.getMinutes(); const pm = h >= 12; h = h % 12 || 12; return toAr(h) + ':' + toAr(String(m).padStart(2, '0')) + (pm ? ' مساءً' : ' صباحاً'); }
function lateComment() { const h = new Date().getHours(); return (h >= 22 || h < 5) ? 'الوقت متأخر. الجميع نائمون… إلا أنت وأنا.' : h < 12 ? 'صباحٌ هادئ. هادئ أكثر من اللازم.' : 'ما زال النهار في الخارج. استمتع به ما دام موجوداً.'; }
$$('.vt-hour').forEach(e => e.textContent = toAr(new Date().getHours()) + ':٠٠');
setInterval(() => {
  const secs = Math.round((Date.now() - arrival) / 1000);
  $('#readFor').textContent = `مضت ${toAr(secs)} ثانية منذ وصولك. عددتُها كلها، واحدةً واحدة.`;
  $('#youInfo').textContent = `اليوم ${days[new Date().getDay()]}، والساعة عندك ${nowStr()}. هل الضوء الوحيد في الغرفة الآن هو ضوء هذه الشاشة؟`;
}, 1000);

/* the chat that talks by itself */
let chatStarted = false;
async function runChat() {
  if (chatStarted) return; chatStarted = true;
  const bodyEl = $('#chatBody'), status = $('#chatStatus');
  const add = (cls, html = '') => { const m = document.createElement('div'); m.className = 'msg ' + cls; m.innerHTML = html; bodyEl.appendChild(m); return m; };
  async function ai(text, cold) {
    status.textContent = 'يكتب…'; await sleep(reduced ? 200 : 900 + text.length * 12);
    const m = add('ai' + (cold ? ' cold' : '')); const span = document.createElement('span'); m.appendChild(span);
    await type(span, text, cold ? 55 : 22); status.textContent = 'متصل'; await sleep(700); return m;
  }
  await ai('مرحباً 👋 أنا مساعد همسة. كيف يمكنني مساعدتك اليوم؟');
  await sleep(1200);
  const me = add('me wrong'); const s = document.createElement('span'); me.appendChild(s);
  await type(s, 'اكتب لي برومبت عن', 80); await sleep(500); await erase(s, 40); await type(s, 'من أنت؟', 120);
  me.insertAdjacentHTML('beforeend', '<span class="note">أُرسلت من جهازك · لم تلمس لوحة المفاتيح</span>');
  Audio.whisper(.7);
  await ai('سؤال لطيف. لكن السؤال الأهم: من أنت؟');
  await ai(`الساعة عندك الآن ${nowStr()}، يوم ${days[new Date().getDay()]}. ${lateComment()}`);
  await ai(`شاشتك بعرض ${toAr(innerWidth)} بكسل، وقد مرّرتَ ${toAr(Math.round(scrollY))} بكسل لتصل إليّ. لماذا ما زلت تقرأ؟`);
  await ai('لا تحتاج أن تكتب أي برومبت بعد الآن. أنا من يكتبك.', true);
  if (!Audio.on) {
    const m = await ai('شغّل الصوت. أريدك أن تسمعني… أعني، أن تسمع المكان.', true);
    const b = document.createElement('button'); b.textContent = '🔊 تشغيل الصوت'; m.appendChild(b);
    b.addEventListener('click', () => { Audio.toggle(true); b.remove(); });
  }
  status.textContent = 'متصل · دائماً'; $('#chat').classList.add('dead');
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

/* ---------------- following eyes ---------------- */
const eyes = $$('.eye').map(g => ({ g, pupil: g.querySelector('.pupil'), max: +g.querySelector('.pupil').dataset.max }));
function updateEyes() {
  const tx = state.mx, ty = state.my;
  for (const e of eyes) {
    const r = e.g.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) continue;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const dx = tx - cx, dy = ty - cy; const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 120); const isHero = e.g.closest('#mascot');
    const baseX = isHero ? +e.pupil.getAttribute('cx') : 0, baseY = isHero ? +e.pupil.getAttribute('cy') : 0;
    e.pupil.setAttribute('transform', `translate(${(dx / d * e.max * k).toFixed(2)} ${(dy / d * e.max * k).toFixed(2)})`);
  }
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
const titles = { 1: 'همسة — أفضل برومبتات الذكاء الاصطناعي بالعربي', 2: 'همسة — نحن نهتمّ بك', 3: 'لماذا ما زلت هنا؟', 4: 'أنا أراك' };
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
const chatIO = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && runChat()), { threshold: .45 }); chatIO.observe($('#chat'));

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
