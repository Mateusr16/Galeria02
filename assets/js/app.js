/* =====================================================================
   CÓDIGO DO ÁLBUM — faz tudo funcionar. Normalmente você não edita aqui.

   Ele lê:  config.js (textos)  +  assets/js/galeria.js (lista de arquivos)
   e monta o álbum. Seções deste arquivo:
     1. Atalhos e caminhos das pastas
     2. Dados de demonstração (usados só quando as pastas estão vazias)
     3. Fotos e vídeos -> páginas
     4. Montagem das páginas (capa, rosto, fotos, mensagem)
     5. Folha que vira (curva da página, luz e sombra)
     6. Navegação (abrir, seguir, voltar, fechar, arrastar)
     7. Vídeos (tocam só nas páginas visíveis, sem som)
     8. Música e som de papel
     9. Compartilhar
   ===================================================================== */
(function () {
"use strict";

/* ---------- 1. Atalhos e caminhos ---------- */
const C = window.CONFIG || {}, G = window.GALERIA || {}, T = C.textos || {}, A = C.album || {};
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const enc = p => p.split("/").map(encodeURIComponent).join("/");
const div = (cls, html) => { const d = document.createElement("div"); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RAD = Math.PI / 180;
const allowDemo = C.mostrarDemo !== false;
const PASTA = { fotos: "assets/fotos/", videos: "assets/video/", musica: "assets/musica/", capa: "assets/capa/" };

/* ---------- 2. Demonstração ---------- */
const un = (id, w, q) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;
const DEMO = {
  fotos: ["photo-1519741497674-611481863552","photo-1511285560929-80b456fea0bc","photo-1537633552985-df8429e8048b","photo-1523438885200-e635ba2c371e","photo-1529636798458-92182e662485","photo-1519225421980-715cb0215aed","photo-1511988617509-a57c8a288659","photo-1464366400600-7168b8af9bc3","photo-1520857014576-2c4f4c972b57","photo-1507504031003-b417219a0fde","photo-1511795409834-ef04bbd61622","photo-1465495976277-4387d4b0e4a6","photo-1508214751196-bcfd4ca60f91","photo-1532712938310-34cb3982ef74","photo-1515934751635-c81c6bc9a2d8","photo-1511895426328-dc8714191300"].map(id => un(id, 1000, 80)),
  videos: ["ForBiggerJoyrides","ForBiggerEscapes","ForBiggerFun"].map(n => `https://storage.googleapis.com/gtv-videos-bucket/sample/${n}.mp4`),
  capa: un("photo-1511285560929-80b456fea0bc", 900, 85)
};

/* ---------- 3. Fotos e vídeos -> páginas ---------- */
let fotos = (G.fotos || []).map(f => ({ t: "foto", src: PASTA.fotos + enc(f) }));
let vids = (G.videos || []).map(f => ({ t: "video", src: PASTA.videos + enc(f) }));
if (!fotos.length && !vids.length && allowDemo) {
  fotos = DEMO.fotos.map(src => ({ t: "foto", src }));
  vids = DEMO.videos.map(src => ({ t: "video", src }));
}
const N4 = Math.max(0, Number(A.videoACada == null ? 4 : A.videoACada));
const items = []; let vi = 0;
fotos.forEach((f, i) => { items.push(f); if (N4 && (i + 1) % N4 === 0 && vi < vids.length) items.push(vids[vi++]); });
while (vi < vids.length) items.push(vids[vi++]);

const SIZE = { solo: 1, duo: 2, trio: 3, quad: 4 };
const modelos = (A.modelos && A.modelos.length ? A.modelos : ["trio", "solo", "duo", "quad"]).filter(m => SIZE[m]);
if (!modelos.length) modelos.push("trio");
const P = [];
for (let k = 0, li = 0; k < items.length;) {
  let nome = modelos[li++ % modelos.length], n = SIZE[nome];
  const resta = items.length - k;
  if (resta < n) { n = resta; nome = ["", "solo", "duo", "trio", "quad"][n]; }
  P.push({ layout: nome, items: items.slice(k, k + n) }); k += n;
}
// sequência de páginas: [rosto, fotos..., (vazia), mensagem]  — sempre em número par
const seq = [{ k: "rosto" }];
P.forEach(p => seq.push({ k: "fotos", p }));
if (seq.length % 2 === 0) seq.push({ k: "vazia" });
seq.push({ k: "fim" });
const S = seq.length / 2;              // páginas duplas

/* ---------- textos ---------- */
const n1 = (C.noivos || {}).nome1 || "Nome 1", n2 = (C.noivos || {}).nome2 || "Nome 2";
document.title = `${n1} & ${n2}${C.data ? " — " + C.data : ""}`;
const setText = (id, v) => { const el = $(id); if (el && v != null && v !== "") el.textContent = v; };
setText("openBtn", T.botaoAbrir); setText("prevBtn", T.botaoVoltar); setText("nextBtn", T.botaoSeguir);

/* ---------- 4. Montagem das páginas ---------- */
const book = $("book"), slotL = $("slotL"), slotR = $("slotR");
const cache = new Map();

function shell(side, extra) {
  const pg = div(`pg ${side}${extra ? " " + extra : ""}`), clip = div("clip");
  pg.appendChild(clip); return { pg, clip };
}
function photosPage(p, num, side) {
  const d = div("page l-" + p.layout);
  p.items.forEach((it, j) => {
    const f = document.createElement("figure");
    f.className = "ph" + ((num + j) % 2 === 0 ? " tape" : "");
    f.style.setProperty("--r", (((num * 7 + j * 5) % 7) - 3) * .45 + "deg");
    const m = div("m");
    if (it.t === "video") {
      const v = document.createElement("video");
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.disablePictureInPicture = true;
      v.src = it.src + "#t=0.1";
      m.appendChild(v); m.appendChild(div("vtag", "VÍDEO"));
    } else {
      const im = new Image(); im.alt = ""; im.draggable = false; im.src = it.src; m.appendChild(im);
    }
    f.appendChild(m); d.appendChild(f);
  });
  d.appendChild(div("pn", String(num)));
  return d;
}
function makePage(i) {
  if (i < 0 || i >= seq.length) return null;
  if (cache.has(i)) return cache.get(i);
  const side = i % 2 === 0 ? "l" : "r", s = seq[i], { pg, clip } = shell(side);
  if (s.k === "rosto") {
    clip.appendChild(div("fp",
      `<div class="fp-eyebrow">${esc(T.apresenta || "")}</div>` +
      `<div class="fp-names serif">${esc(n1)}<span>&amp;</span>${esc(n2)}</div>` +
      `<div class="orn">✦</div><div class="fp-date">${esc(C.data || "")}</div>` +
      (T.dedicatoria ? `<div class="fp-note">${esc(T.dedicatoria)}</div>` : "")));
  } else if (s.k === "fotos") {
    clip.appendChild(photosPage(s.p, i, side));
  } else if (s.k === "vazia") {
    clip.appendChild(div("page l-vazia", "✦"));
  } else {
    clip.appendChild(div("end-in",
      `<h3 class="serif">${esc(T.cartaTitulo || "Com carinho")}</h3><div class="orn">✦</div>` +
      (C.mensagem || []).map(p => `<p>${esc(p)}</p>`).join("") +
      `<p class="sig serif">${esc(T.assinatura || "")}</p>` +
      `<div class="end-btns"><button class="mini" data-act="replay">${esc(T.botaoRever || "Rever álbum")}</button>` +
      `<button class="mini" data-act="share">${esc(T.botaoCompartilhar || "Compartilhar")}</button></div>`));
  }
  cache.set(i, pg); return pg;
}

// capa (frente) e parte de dentro da capa (verso)
const capaImg = G.capa ? PASTA.capa + enc(G.capa) : (fotos[0] ? fotos[0].src : (allowDemo ? DEMO.capa : null));
const coverEl = (() => {
  const { pg, clip } = shell("r", "cover");
  clip.innerHTML = `<div class="c-spine"></div><div class="c-frame"></div><div class="c-in">` +
    `<div class="c-eyebrow gold">${esc(T.capaFrase || "")}</div>` +
    (capaImg ? `<div class="c-photo" style="background-image:url('${capaImg.replace(/'/g, "%27")}')"></div>` : "") +
    `<div class="c-names serif gold">${esc(n1)}<span>&amp;</span>${esc(n2)}</div>` +
    `<div class="c-date gold">${esc(C.data || "")}</div></div><div class="c-sheen"></div>`;
  return pg;
})();
const endpEl = (() => { const { pg, clip } = shell("l", "endp"); clip.appendChild(div("endp-in", "✦")); return pg; })();
const blankR = () => shell("r").pg;

function setSlot(slot, el) {
  [...slot.children].forEach(c => { if (!c.classList.contains("shd")) c.remove(); });
  if (el) slot.insertBefore(el, slot.firstChild);
}

/* ---------- 5. Folha que vira ----------
   A folha é dividida em tiras verticais encadeadas; cada tira gira um pouco
   mais que a anterior, formando a curva do papel. Luz e sombra acompanham o ângulo. */
const BEND = 42;   // quanto o papel curva (graus)
const shadeF = a => a >= 90 ? .6 : .5 * (1 - Math.cos(a * RAD));          // frente escurece ao girar
const shadeB = a => a <= 90 ? .6 : .5 * (1 + Math.cos(a * RAD));          // verso clareia ao deitar
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let shadowOwner = null;

function snapshot(src, W) {
  const c = src.cloneNode(true), ov = src.querySelectorAll("video");
  c.querySelectorAll("video").forEach((v, j) => {
    const o = ov[j], cv = document.createElement("canvas");
    cv.width = o.videoWidth || 320; cv.height = o.videoHeight || 180; cv.className = "vcap";
    try { if (o.readyState >= 2) cv.getContext("2d").drawImage(o, 0, 0, cv.width, cv.height); } catch (e) {}
    v.replaceWith(cv);
  });
  c.querySelectorAll("[data-act]").forEach(b => b.removeAttribute("data-act"));
  c.style.width = W + "px";
  return c;
}

function Flip(frontEl, backEl, opt) {
  opt = opt || {};
  const N = opt.rigid ? 1 : (opt.n || 14);
  const W = book.offsetWidth / 2, w = W / N, ov = N > 1 ? .9 : 0;
  const root = div("flip");
  root.style.transform = `perspective(${Math.round(W * 4.4)}px)`;
  const strips = [];
  let parent = root;
  for (let i = 0; i < N; i++) {
    const st = div("st"); st.style.left = (i ? w : 0) + "px"; st.style.width = w + "px";
    const ff = div("sf f"), bf = div("sf b");
    ff.style.width = bf.style.width = (w + ov) + "px";
    const fc = snapshot(frontEl, W); fc.style.left = (-i * w) + "px"; ff.appendChild(fc);
    const bc = snapshot(backEl, W); bc.style.left = (-(W - (i + 1) * w - ov)) + "px"; bf.appendChild(bc);
    const fl = div("lit"), bl = div("lit"); ff.appendChild(fl); bf.appendChild(bl);
    st.appendChild(ff); st.appendChild(bf); parent.appendChild(st); parent = st;
    strips.push({ st, fl, bl });
  }
  book.appendChild(root);
  const ang = new Array(N);
  const self = {
    R: 0,
    set(R) {
      self.R = R = clamp(R, 0, 180);
      const t = R / 180, d = opt.rigid ? 0 : BEND * Math.sin(2 * Math.PI * t) * (opt.bendScale || 1);
      let prev = 0, xp = 0;
      for (let i = 0; i < N; i++) {
        const u = N > 1 ? i / (N - 1) : 0;
        const Ri = clamp(R + d * Math.pow(u, 1.25), 0, 180);
        strips[i].st.style.transform = `rotateY(${-(Ri - prev)}deg)`;
        prev = Ri; ang[i] = Ri; xp += w * Math.cos(Ri * RAD);
      }
      for (let i = 0; i < N; i++) {
        const a0 = ang[i], a1 = i + 1 < N ? ang[i + 1] : ang[i];
        strips[i].fl.style.background = `linear-gradient(90deg,rgba(0,0,0,${shadeF(a0).toFixed(3)}),rgba(0,0,0,${shadeF(a1).toFixed(3)}))`;
        strips[i].bl.style.background = `linear-gradient(90deg,rgba(0,0,0,${shadeB(a1).toFixed(3)}),rgba(0,0,0,${shadeB(a0).toFixed(3)}))`;
      }
      if (opt.order != null) root.style.zIndex = R < 90 ? 50 - opt.order : 50 + opt.order;
      else root.style.zIndex = 50;
      // sombra que a folha projeta nas páginas de baixo
      if (!opt.noShadow) {
        shadowOwner = self;
        const a = (.42 * Math.sin(R * RAD)).toFixed(3), sp = W * .16 * Math.sin(R * RAD) + 6;
        if (xp >= 0) {
          slotR.firstElementChild && (slotR.lastElementChild.style.background = `linear-gradient(90deg,transparent ${xp}px,rgba(0,0,0,${a}) ${xp}px,transparent ${xp + sp}px)`);
          slotL.lastElementChild.style.background = "none";
        } else {
          const e = W + xp;
          slotL.lastElementChild.style.background = `linear-gradient(90deg,transparent ${e - sp}px,rgba(0,0,0,${a}) ${e}px,transparent ${e}px)`;
          slotR.lastElementChild.style.background = "none";
        }
      }
    },
    animate(to, dur, done, ez) {
      const from = self.R, t0 = performance.now(), f = ez || ease;
      (function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        self.set(from + (to - from) * f(p));
        if (p < 1) requestAnimationFrame(step); else done && done();
      })(t0);
    },
    remove() {
      root.remove();
      if (shadowOwner === self) { slotL.lastElementChild.style.background = "none"; slotR.lastElementChild.style.background = "none"; shadowOwner = null; }
    }
  };
  self.set(opt.start || 0);
  return self;
}

/* ---------- 6. Navegação ---------- */
let k = 0, busy = false;           // k = página dupla atual (0 = fechado)
const DUR = 1000;

function render() {
  if (k === 0) { setSlot(slotL, null); setSlot(slotR, coverEl); }
  else { setSlot(slotL, makePage(2 * k - 2)); setSlot(slotR, makePage(2 * k - 1)); }
}
function preload() { for (let i = 2 * k - 6; i <= 2 * k + 5; i++) makePage(i); }
function settle() { busy = false; updateUI(); preload(); updateVideos(); }
function updateUI() {
  $("counter").textContent = k > 0 ? `${k} / ${S}` : "";
  $("prevBtn").disabled = k <= 0;
  $("nextBtn").disabled = k >= S;
}

// começa a virar para frente: devolve a folha (sem animar)
function startForward() {
  const f = Flip(makePage(2 * k - 1), makePage(2 * k), { start: 0 });
  setSlot(slotR, makePage(2 * k + 1));
  return f;
}
function endForward(f, completed) {
  if (completed) { setSlot(slotL, makePage(2 * k)); k++; }
  else setSlot(slotR, makePage(2 * k - 1));
  f.remove();
}
function startBack() {
  const f = Flip(makePage(2 * k - 3), makePage(2 * k - 2), { start: 180 });
  setSlot(slotL, makePage(2 * k - 4));
  return f;
}
function endBack(f, completed) {
  if (completed) { setSlot(slotR, makePage(2 * k - 3)); k--; }
  else setSlot(slotL, makePage(2 * k - 2));
  f.remove();
}

function next(dur, cb) {
  if (busy) return;
  if (k === 0) return openAlbum();
  if (k >= S) return;
  busy = true; Swish(.05, .55, 0);
  const f = startForward();
  f.animate(180, dur || DUR, () => { endForward(f, true); settle(); cb && cb(); });
}
function prev(dur, cb) {
  if (busy || k <= 0) return;
  if (k === 1) return closeAlbum();
  busy = true; Swish(.05, .55, 0);
  const f = startBack();
  f.animate(0, dur || DUR, () => { endBack(f, true); settle(); cb && cb(); });
}

// ABERTURA: a capa abre e várias folhas passam até a primeira página dupla
function openAlbum() {
  if (k !== 0 || busy) return;
  busy = true;
  Music.start();
  document.body.classList.add("is-open");
  if (temMusica) musicBtn.classList.add("show");
  book.classList.remove("closed");
  const n = clamp(A.folhasAoAbrir == null ? 6 : A.folhasAoAbrir, 0, 12);
  const rosto = makePage(0), pag1 = makePage(1);
  const cover = Flip(coverEl, n ? endpEl : rosto, { rigid: true, order: 0, noShadow: true });
  setSlot(slotR, n ? blankR() : pag1);
  setSlot(slotL, null);
  Swish(.06, .7, 0);
  cover.animate(180, 1500);
  const flips = [cover];
  const start = 380, gap = 115, dur = 1050;
  for (let j = 0; j < n; j++) {
    setTimeout(() => {
      if (j === n - 1) setSlot(slotR, pag1);
      const f = Flip(blankR(), rosto, { order: j + 1, n: 10, noShadow: j < n - 1, bendScale: .9 });
      flips.push(f); Swish(.03, .4, 0);
      f.animate(180, dur);
    }, start + j * gap);
  }
  const total = n ? start + (n - 1) * gap + dur + 40 : 1540;
  setTimeout(() => {
    setSlot(slotL, rosto);
    flips.forEach(f => f.remove());
    k = 1; settle();
  }, Math.max(total, 1540));
}
// FECHAR: a capa volta por cima de tudo
function closeAlbum() {
  if (k !== 1 || busy) return;
  busy = true; Swish(.06, .7, 0);
  const f = Flip(coverEl, makePage(0), { rigid: true, start: 180 });
  setSlot(slotL, null);
  setTimeout(() => book.classList.add("closed"), 450);
  f.animate(0, 1300, () => {
    setSlot(slotR, coverEl); f.remove();
    document.body.classList.remove("is-open");
    k = 0; settle();
  });
}
// volta ao começo virando as folhas rapidamente
function replay() {
  if (busy || k <= 1) return;
  const d = clamp(2600 / (k - 1), 300, 700);
  (function step() { if (k > 1) prev(d, step); })();
}

$("openBtn").addEventListener("click", openAlbum);
$("nextBtn").addEventListener("click", () => next());
$("prevBtn").addEventListener("click", () => prev());
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
  else if ((e.key === "Enter" || e.key === " ") && k === 0) { e.preventDefault(); openAlbum(); }
});

// botões da última página
book.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (b) { e.stopPropagation(); b.dataset.act === "replay" ? replay() : share(); return; }
  if (k === 0) openAlbum();
});

// ARRASTAR a página com o mouse ou o dedo (como num álbum de verdade)
let drag = null;
book.addEventListener("pointerdown", e => {
  if (busy || k === 0 || e.target.closest("[data-act]") || e.button > 0) return;
  const r = book.getBoundingClientRect();
  drag = { x0: e.clientX, side: e.clientX > r.left + r.width / 2 ? "r" : "l", started: false, f: null, lx: e.clientX, lt: performance.now(), v: 0 };
});
addEventListener("pointermove", e => {
  if (!drag) return;
  if (!drag.started) {
    if (Math.abs(e.clientX - drag.x0) < 8) return;
    drag.started = true;
    if (drag.side === "r" && k < S) { drag.dir = 1; drag.f = startForward(); }
    else if (drag.side === "l" && k > 1) { drag.dir = -1; drag.f = startBack(); }
    if (drag.f) { busy = true; Swish(.04, .5, 0); }
  }
  if (!drag.f) return;
  const r = book.getBoundingClientRect(), spine = r.left + r.width / 2, W = r.width / 2;
  drag.f.set(Math.acos(clamp((e.clientX - spine) / W, -1, 1)) / RAD);
  const now = performance.now();
  drag.v = (e.clientX - drag.lx) / Math.max(1, now - drag.lt); drag.lx = e.clientX; drag.lt = now;
});
function endDrag() {
  if (!drag) return;
  const d = drag; drag = null;
  if (!d.started) { d.side === "r" ? next() : prev(); return; }
  if (!d.f) return;
  const R = d.f.R;
  const done = d.dir === 1 ? (R > 70 || d.v < -.35) : (R < 110 || d.v > .35);
  const target = d.dir === 1 ? (done ? 180 : 0) : (done ? 0 : 180);
  const dur = 220 + 600 * Math.abs(target - R) / 180;
  d.f.animate(target, dur, () => { d.dir === 1 ? endForward(d.f, done) : endBack(d.f, done); settle(); }, t => 1 - Math.pow(1 - t, 3));
}
addEventListener("pointerup", endDrag);
addEventListener("pointercancel", endDrag);

/* ---------- 7. Vídeos: só tocam nas páginas visíveis ---------- */
function updateVideos() {
  cache.forEach(pg => pg.querySelectorAll("video").forEach(v => {
    if (slotL.contains(v) || slotR.contains(v)) { v.muted = true; v.play().catch(() => {}); } else v.pause();
  }));
}

/* ---------- 8. Música e som de papel ---------- */
const MUSIC_FILE = G.musica ? PASTA.musica + enc(G.musica) : null;
const volumeArquivo = (C.musica && typeof C.musica.volume === "number") ? C.musica.volume : .55;
const usarTrilha = !(C.musica && C.musica.usarTrilhaGerada === false);

const Music = (() => {
  let ctx, master, wet, on = false, muted = false, audio, fadeT, ci = 0;
  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  const chords = [[48,55,64,71],[45,52,64,72],[41,48,64,69],[43,50,62,71]];
  const penta = [72,74,76,79,81,84,86];
  function reverb() {
    const len = ctx.sampleRate * 4, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const cv = ctx.createConvolver(); cv.buffer = b; return cv;
  }
  function pad(t, notes, dur) {
    notes.forEach((m, i) => [["sine", 0], ["triangle", 5]].forEach(([type, det]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = type; o.frequency.value = mf(m); o.detune.value = det * (i % 2 ? 1 : -1);
      f.type = "lowpass"; f.frequency.value = 1100;
      const peak = (m < 50 ? .05 : .028) * (type === "sine" ? 1 : .6);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 2.8);
      g.gain.setValueAtTime(peak, t + dur - 3.2); g.gain.linearRampToValueAtTime(0, t + dur + 1);
      o.connect(f); f.connect(g); g.connect(master); g.connect(wet);
      o.start(t); o.stop(t + dur + 1.2);
    }));
  }
  function pluck(t, m) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = mf(m);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + 3.2);
    o.connect(g); g.connect(master); g.connect(wet); o.start(t); o.stop(t + 3.4);
  }
  function compasso() {
    const t = ctx.currentTime + .05;
    pad(t, chords[ci % chords.length], 8.5);
    let tt = t + 1;
    for (let i = 0; i < 5; i++) { pluck(tt, penta[Math.floor(Math.random() * penta.length)]); tt += 1.2 + Math.random() * .9; }
    ci++;
  }
  function fade(v) {
    clearInterval(fadeT);
    fadeT = setInterval(() => {
      const d = v - audio.volume;
      if (Math.abs(d) < .02) { audio.volume = v; clearInterval(fadeT); }
      else audio.volume = Math.max(0, Math.min(1, audio.volume + Math.sign(d) * .02));
    }, 60);
  }
  function start() {
    if (on) return; on = true;
    if (MUSIC_FILE) {
      audio = new Audio(MUSIC_FILE); audio.loop = true; audio.volume = 0;
      audio.play().then(() => fade(volumeArquivo)).catch(() => {});
      return;
    }
    if (!usarTrilha) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    wet = ctx.createGain(); wet.gain.value = .55;
    const rv = reverb(); wet.connect(rv); rv.connect(master); master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(.9, ctx.currentTime + 5);
    ctx.resume(); compasso(); setInterval(compasso, 8000);
  }
  function setMuted(m) {
    muted = m;
    if (audio) { fade(m ? 0 : volumeArquivo); return; }
    if (!master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(m ? 0 : .9, t + .8);
  }
  document.addEventListener("visibilitychange", () => {
    if (!on) return;
    if (document.hidden) { ctx && ctx.suspend(); audio && audio.pause(); }
    else { ctx && ctx.resume(); audio && !muted && audio.play().catch(() => {}); }
  });
  return { start, setMuted, get muted() { return muted; } };
})();

const Swish = (() => {
  let ctx;
  return (gain, dur, delayMs) => setTimeout(() => {
    if (Music.muted || (C.sons && C.sons.virarPagina === false)) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = ctx || new AC(); if (ctx.state === "suspended") ctx.resume();
      const n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) { const t = i / n; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) * Math.pow(1 - t, .6); }
      const src = ctx.createBufferSource(); src.buffer = b;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = .7;
      f.frequency.setValueAtTime(1400, ctx.currentTime); f.frequency.linearRampToValueAtTime(3600, ctx.currentTime + dur);
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    } catch (e) {}
  }, delayMs || 0);
})();

const temMusica = !!MUSIC_FILE || usarTrilha;
const musicBtn = $("musicBtn");
if (temMusica) {
  musicBtn.classList.remove("hide");
  musicBtn.addEventListener("click", () => {
    Music.setMuted(!Music.muted);
    musicBtn.classList.toggle("off", Music.muted);
    $("musicLabel").textContent = Music.muted ? "Som desligado" : "Música";
  });
}
if (!temMusica || T.dicaMusica === "") $("introHint").classList.add("hide"); else setText("introHint", T.dicaMusica);

/* ---------- 9. Compartilhar ---------- */
function toast(t) { const el = $("toast"); el.textContent = t; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2200); }
async function share() {
  try {
    if (navigator.share) await navigator.share({ title: document.title, url: location.href });
    else { await navigator.clipboard.writeText(location.href); toast("Link copiado!"); }
  } catch (e) {}
}

render(); preload(); updateUI();
})();
