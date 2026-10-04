// ===================================================================
//  PLANTILLAS DE ANIMACIÓN · Pureza Natural
//  Cada plantilla dibuja un cuadro en el tiempo t (0 a 8 s).
//  El cuadro de t=8 es idéntico al de t=0, así el bucle no salta.
//  Ritmo: entrada lenta, ~4 s quieto para leer, salida suave.
// ===================================================================
(function () {
const W = 1080, H = 1350, M = 80;
const C = {
  canvas: '#F4F1E9', panel: '#FBF9F4', deep: '#174C46', deep2: '#123D38', accent: '#C66F45',
  water: '#007585', waterSoft: '#78B9B2', sun: '#E8B85F', text: '#24302E', text2: '#4E5D58',
  line: '#DDD6C6', onDeep: '#E3EEEA', onDeep2: '#B9D0C9', white: '#FFFFFF',
};
const FD = "'Bricolage Grotesque', system-ui, sans-serif";
const FB = "'Figtree', system-ui, sans-serif";
const FM = "'IBM Plex Mono', ui-monospace, monospace";

// Temas por fondo: color de título, cuerpo, resaltado y etiqueta (todos pasan AA)
const TEMAS = {
  niebla: { bg: C.canvas, ink: C.deep, body: C.text2, emph: C.water, kick: C.water, halo: [C.waterSoft, C.accent] },
  blanco: { bg: C.panel, ink: C.deep, body: C.text2, emph: C.water, kick: C.water, halo: [C.waterSoft, C.accent] },
  verde:  { bg: C.deep, ink: C.onDeep, body: C.onDeep2, emph: C.sun, kick: C.onDeep2, halo: [C.waterSoft, C.onDeep] },
  agua:   { bg: C.waterSoft, ink: C.deep, body: C.text, emph: C.deep2, emphLine: C.panel, kick: C.deep2, halo: [C.panel, C.deep] },
  sol:    { bg: C.sun, ink: C.deep, body: C.text, emph: C.deep2, emphLine: C.panel, kick: C.deep2, halo: [C.panel, C.accent] },
  foto:   { bg: C.deep, ink: C.onDeep, body: C.onDeep, emph: C.sun, kick: C.onDeep2, halo: null },
};

// ---------- utilidades ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIn = k => k * k * k;
const eInOut = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const eSoft = k => -(Math.cos(Math.PI * k) - 1) / 2;
const eBack = k => { const c = 1.2; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }; // rebote leve
// Muelle amortiguado: s = segundos desde que arranca. Máximo dos oscilaciones visibles.
const muelle = s => (s <= 0 ? 0 : 1 - Math.exp(-6 * s) * Math.cos(9 * s));
const TAU = Math.PI * 2;
function azar(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mezcla(a, b, k) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`;
}
function font(ctx, fam, w, size, style = '') { ctx.font = `${style} ${w} ${size}px ${fam}`.trim(); }
function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function gota(ctx, cx, cy, r) {
  ctx.beginPath(); ctx.moveTo(cx, cy - 1.8 * r);
  ctx.bezierCurveTo(cx + .35 * r, cy - 1.25 * r, cx + r, cy - .65 * r, cx + r, cy);
  ctx.arc(cx, cy, r, 0, Math.PI, false);
  ctx.bezierCurveTo(cx - r, cy - .65 * r, cx - .35 * r, cy - 1.25 * r, cx, cy - 1.8 * r);
  ctx.closePath();
}
function cubrir(ctx, img, x, y, w, h, escala = 1, fx = .5, fy = .5) {
  const s = Math.max(w / img.width, h / img.height) * escala;
  const iw = img.width * s, ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) * fx, y + (h - ih) * fy, iw, ih);
}

// Texto con *resaltados*: devuelve palabras con posición
function maquetar(ctx, texto, fam, w, size, maxW, lh, x0, y0, style = '') {
  font(ctx, fam, w, size, style);
  const tokens = []; let emph = false;
  texto.split(/(\*)/).forEach(p => { if (p === '*') { emph = !emph; return; } p.split(/\s+/).filter(Boolean).forEach(word => tokens.push({ word, emph })); });
  const sp = ctx.measureText(' ').width; const out = []; let x = x0, y = y0, linea = 0;
  tokens.forEach(tk => {
    const ww = ctx.measureText(tk.word).width;
    if (x > x0 && x + ww > x0 + maxW) { x = x0; y += size * lh; linea++; }
    out.push({ ...tk, x, y, w: ww, linea }); x += ww + sp;
  });
  out.alto = (linea + 1) * size * lh; out.lineas = linea + 1;
  return out;
}
function pintar(ctx, items, fam, w, size, tema, alpha = 1, dy = 0, style = '', ink) {
  ctx.save(); ctx.globalAlpha *= alpha; font(ctx, fam, w, size, style); ctx.textBaseline = 'alphabetic';
  items.forEach(it => {
    ctx.fillStyle = it.emph ? tema.emph : (ink || tema.ink);
    ctx.fillText(it.word, it.x, it.y + dy);
    if (it.emph && tema.emphLine) { ctx.fillStyle = tema.emphLine; ctx.fillRect(it.x, it.y + dy + size * .14, it.w + 2, Math.max(4, size * .06)); }
  });
  ctx.restore();
}
function titulo(ctx, texto, tema, { y = 190, size = 88, maxW = W - 2 * M, alpha = 1, dy = 0 } = {}) {
  const items = maquetar(ctx, texto, FD, 700, size, maxW, 1.05, M, y + size * .8);
  ctx.save(); ctx.letterSpacing = `${-size * .02}px`;
  pintar(ctx, items, FD, 700, size, tema, alpha, dy); ctx.restore();
  return y + items.alto;
}
function parrafo(ctx, texto, color, { x = M, y, size = 34, maxW = W - 2 * M, alpha = 1, w = 400, lh = 1.4, fam = FB, style = '' } = {}) {
  const items = maquetar(ctx, texto, fam, w, size, maxW, lh, x, y + size, style);
  pintar(ctx, items, fam, w, size, { ink: color, emph: color }, alpha, 0, style);
  return y + items.alto;
}
function etiqueta(ctx, texto, color, x, y, { size = 24, alpha = 1, align = 'left' } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; font(ctx, FM, 500, size); ctx.letterSpacing = `${size * .12}px`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(texto.toUpperCase(), x, y); ctx.restore();
}
function boton(ctx, texto, x, y, { size = 30, alpha = 1, align = 'left' } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; font(ctx, FB, 600, size);
  const w = ctx.measureText(texto).width + 64, h = size * 2.2; const bx = align === 'center' ? x - w / 2 : x;
  ctx.shadowColor = 'rgba(198,111,69,.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = C.accent; rrect(ctx, bx, y, w, h, h / 2); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.white; ctx.textBaseline = 'middle'; ctx.fillText(texto, bx + 32, y + h / 2 + 1); ctx.restore();
}
function fondo(ctx, tema, t, D) {
  ctx.fillStyle = tema.bg; ctx.fillRect(0, 0, W, H);
  if (!tema.halo) return;
  const a = TAU * t / D;
  [[tema.halo[0], 260 + 60 * Math.sin(a), 300 + 50 * Math.cos(a), 520, .16], [tema.halo[1], 860 + 50 * Math.cos(a), 1080 + 60 * Math.sin(a), 460, .07]]
    .forEach(([col, x, y, r, al]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); ctx.globalAlpha = al;
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    });
}
function marca(ctx, tema, p, cfg, { pie = null, color = null } = {}) {
  const y = H - 104, col = color || tema.ink;
  ctx.save(); ctx.fillStyle = col; gota(ctx, M + 12, y - 6, 12); ctx.fill();
  font(ctx, FB, 600, 26); ctx.fillText('Pureza Natural', M + 38, y + 3);
  if (cfg.distribuidor) { font(ctx, FB, 500, 21); ctx.fillStyle = color || tema.body; ctx.fillText(cfg.distribuidor, M + 38, y + 36); }
  etiqueta(ctx, pie || p.pie || cfg.cuenta, color || tema.kick, W - M, y + 2, { size: 20, align: 'right' });
  ctx.restore();
}
function kicker(ctx, p, tema, alpha = 1) { if (p.kicker) etiqueta(ctx, p.kicker, tema.kick, M, 128, { alpha }); }

// ===================================================================
//  PLANTILLAS
// ===================================================================
const P = {};

// 01 · Partículas que forman la gota
P.particulas = {
  prep(p) {
    const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d');
    o.fillStyle = '#000'; gota(o, 540, 560, 165); o.fill();
    const d = o.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += 15) for (let x = 0; x < W; x += 15) if (d[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
    const r = azar(7); pts.sort(() => r() - .5);
    p._pts = pts.slice(0, 280).map(([tx, ty]) => ({ tx, ty, sx: M + r() * (W - 2 * M), sy: 200 + r() * (H - 420), d: r() * 1.1, f: r() * TAU, c: r() < .72 ? C.deep : C.panel, s: 3.5 + r() * 2.5 }));
  },
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema);
    p._pts.forEach(q => {
      const ida = eInOut(seg(t, .5 + q.d, 1.8 + q.d)), vuelta = eInOut(seg(t, 6 + q.d * .5, 7.4 + q.d * .5));
      const k = ida - vuelta;
      const fx = q.sx + 14 * Math.sin(TAU * t / D * 2 + q.f), fy = q.sy + 14 * Math.cos(TAU * t / D + q.f);
      const br = 1 + .012 * Math.sin(TAU * t / D * 2);
      const x = lerp(fx, 540 + (q.tx - 540) * br, k), y = lerp(fy, 560 + (q.ty - 560) * br, k);
      ctx.globalAlpha = lerp(.55, 1, k); ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(x, y, q.s, 0, TAU); ctx.fill();
    });
    ctx.globalAlpha = 1;
    const a = eOut(seg(t, 2.6, 3.4)) * (1 - eSoft(seg(t, 6, 6.6)));
    const y = titulo(ctx, p.titulo, tema, { y: 830, size: 92, alpha: a, dy: (1 - a) * 24 });
    parrafo(ctx, p.texto, tema.body, { y: y + 26, size: 34, alpha: a });
    marca(ctx, tema, p, A.cfg);
  },
};

// 08 · Rutas que fluyen: gotas que bajan por las tres capas
P.rutas = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 84 });
    const xs = 170, ys = [470, 620, 770, 920, 1070];
    ctx.strokeStyle = C.line; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xs, ys[0]); ctx.lineTo(xs, ys[4]); ctx.stroke();
    // gotas: 3 en fila, ciclo de 4 s (divide al bucle de 8 s)
    const per = 4, gotasY = [];
    for (let i = 0; i < 3; i++) {
      const u = (((t / per) + i / 3) % 1) * 4, s = Math.floor(u), f = u - s;
      gotasY.push(lerp(ys[s], ys[s + 1], eInOut(f)));
    }
    p.pasos.forEach(([nom, desc], i) => {
      const cerca = Math.max(...gotasY.map(gy => 1 - clamp(Math.abs(gy - ys[i]) / 60)));
      ctx.fillStyle = tema.bg; ctx.beginPath(); ctx.arc(xs, ys[i], 20, 0, TAU); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = C.water; ctx.stroke();
      ctx.globalAlpha = .25 + .75 * cerca; ctx.fillStyle = C.water; ctx.beginPath(); ctx.arc(xs, ys[i], 11, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      const mid = i > 0 && i < 4;
      if (mid) etiqueta(ctx, '0' + i, C.water, 230, ys[i] - 22, { size: 20 });
      font(ctx, FD, 700, 40); ctx.fillStyle = tema.ink; ctx.fillText(nom, mid ? 290 : 230, ys[i] - 8);
      font(ctx, FB, 400, 28); ctx.fillStyle = tema.body; ctx.fillText(desc, 230, ys[i] + 34);
    });
    gotasY.forEach(gy => {
      const g = ctx.createLinearGradient(0, gy - 90, 0, gy); g.addColorStop(0, 'rgba(0,117,133,0)'); g.addColorStop(1, 'rgba(0,117,133,.45)');
      ctx.fillStyle = g; ctx.fillRect(xs - 3, gy - 90, 6, 90);
      ctx.fillStyle = C.water; gota(ctx, xs, gy + 4, 11); ctx.fill();
    });
    marca(ctx, tema, p, A.cfg);
  },
};

// 03 · Frase → portada
P.frase = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema);
    const bx = M, by = 170, bw = W - 2 * M, bh = 104;
    ctx.fillStyle = 'rgba(227,238,234,.07)'; ctx.strokeStyle = 'rgba(227,238,234,.22)'; ctx.lineWidth = 2;
    rrect(ctx, bx, by, bw, bh, 24); ctx.fill(); ctx.stroke();
    const limpio = p.titulo;
    const chico = maquetar(ctx, limpio, FD, 600, 32, bw - 70, 1.2, bx + 34, by + 64);
    const grande = maquetar(ctx, limpio, FD, 700, 116, W - 2 * M, 1.02, M, 470);
    let todos = 0;
    chico.forEach((a, i) => {
      const b = grande[i];
      const k = eInOut(seg(t, 1 + i * .13, 2 + i * .13)) - eInOut(seg(t, 6 + i * .07, 7 + i * .07));
      todos = Math.max(todos, k);
      const size = lerp(32, 116, k), x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k) - Math.sin(Math.PI * k) * 28;
      font(ctx, FD, k > .5 ? 700 : 600, size); ctx.letterSpacing = `${-size * .02 * k}px`;
      ctx.fillStyle = a.emph ? mezcla(C.onDeep2, C.sun, k) : mezcla(C.onDeep2, C.onDeep, k);
      ctx.fillText(a.word, x, y); ctx.letterSpacing = '0px';
    });
    if (todos < .02 && Math.floor(t * 2) % 2 === 0) { const u = chico[chico.length - 1]; ctx.fillStyle = C.onDeep2; ctx.fillRect(u.x + u.w + 8, u.y - 28, 3, 36); }
    const a = eOut(seg(t, 2.6, 3.3)) * (1 - eSoft(seg(t, 5.8, 6.2)));
    const fin = grande[grande.length - 1].y + 50;
    ctx.fillStyle = C.sun; ctx.globalAlpha = a; ctx.fillRect(M, fin + 10, 120 * eOut(seg(t, 2.6, 3.4)), 4); ctx.globalAlpha = 1;
    parrafo(ctx, p.texto, tema.body, { y: fin + 40, size: 36, alpha: a, maxW: 860 });
    marca(ctx, tema, p, A.cfg);
  },
};

// 10 · Pestañas → paneles
P.pestanas = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 84 });
    // horario: 0 → 1 → 2 → 0. La última se queda más tiempo.
    const tramos = [[2.2, 2.8, 0, 1], [4.6, 5.2, 1, 2], [7.4, 8, 2, 0]];
    let pos = 0, de = 0, a = 0, k = 1;
    if (t < 2.2) pos = 0; else if (t < 2.8) { k = eInOut(seg(t, 2.2, 2.8)); pos = k; de = 0; a = 1; }
    else if (t < 4.6) pos = 1; else if (t < 5.2) { k = eInOut(seg(t, 4.6, 5.2)); pos = 1 + k; de = 1; a = 2; }
    else if (t < 7.4) pos = 2; else { k = eInOut(seg(t, 7.4, 8)); pos = 2 - 2 * k; de = 2; a = 0; }
    const enTransito = (t >= 2.2 && t < 2.8) || (t >= 4.6 && t < 5.2) || t >= 7.4;
    const actual = Math.round(pos);
    const bx = M, by = 450, bw = W - 2 * M, bh = 100, tw = bw / 3;
    ctx.fillStyle = C.panel; ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, bx, by, bw, bh, bh / 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.deep; rrect(ctx, bx + 8 + pos * tw, by + 8, tw - 16, bh - 16, (bh - 16) / 2); ctx.fill();
    p.pestanas.forEach((pe, i) => {
      const cerca = 1 - clamp(Math.abs(pos - i));
      font(ctx, FB, 600, 32); ctx.textAlign = 'center'; ctx.fillStyle = mezcla(C.text2, C.onDeep, cerca);
      ctx.fillText(pe.nombre, bx + tw * i + tw / 2, by + bh / 2 + 11); ctx.textAlign = 'left';
    });
    const cx = M, cy = 590, cw = W - 2 * M, ch = 520;
    ctx.save(); ctx.shadowColor = 'rgba(23,76,70,.18)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    ctx.fillStyle = C.panel; rrect(ctx, cx, cy, cw, ch, 28); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, cx, cy, cw, ch, 28); ctx.stroke();
    ctx.save(); rrect(ctx, cx, cy, cw, ch, 28); ctx.clip();
    const dibuja = (idx, dx, al) => {
      ctx.save(); ctx.globalAlpha = al; ctx.translate(dx, 0);
      p.pestanas[idx].filas.forEach(([lab, val], r) => {
        const ry = cy + 40 + r * 160;
        if (r) { ctx.fillStyle = C.line; ctx.fillRect(cx + 48, ry - 20, cw - 96, 2); }
        etiqueta(ctx, lab, C.water, cx + 48, ry + 40, { size: 22 });
        font(ctx, FD, 600, 46); ctx.fillStyle = C.deep; ctx.fillText(val, cx + 48, ry + 104);
      });
      ctx.restore();
    };
    if (enTransito) { const dir = a > de || (de === 2 && a === 0) ? 1 : -1; dibuja(de, -dir * 140 * k, 1 - k); dibuja(a, dir * 140 * (1 - k), k); }
    else dibuja(actual, 0, 1);
    ctx.restore();
    if (p.nota) { const al = 1 - clamp(Math.abs(pos - 1)); parrafo(ctx, p.nota, C.text2, { y: 1130, size: 24, alpha: al }); }
    marca(ctx, tema, p, A.cfg);
  },
};

// 05 · Lupa sobre la lista
P.lupa = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 96 });
    const cx = M, cy = 380, cw = W - 2 * M, rh = 116, top = cy + 110, n = p.lista.length, ch = 110 + n * rh + 30;
    ctx.fillStyle = C.panel; rrect(ctx, cx, cy, cw, ch, 28); ctx.fill();
    etiqueta(ctx, 'Antes del purificador', C.water, cx + 48, cy + 66, { size: 22 });
    // recorrido: filas 0 → 2 → 3 → 1 → 0
    const ruta = [0, 2, 3, 1, 0]; const tramo = Math.min(3, Math.floor(t / 2)), f = t - tramo * 2;
    const fila = lerp(ruta[tramo], ruta[tramo + 1], eInOut(seg(f, 1.4, 2)));
    const ly = top + fila * rh;
    ctx.save(); ctx.shadowColor = 'rgba(23,76,70,.18)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = C.white; rrect(ctx, cx + 20, ly + 8, cw - 40, rh - 16, (rh - 16) / 2); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.water; ctx.lineWidth = 3; rrect(ctx, cx + 20, ly + 8, cw - 40, rh - 16, (rh - 16) / 2); ctx.stroke();
    p.lista.forEach((txt, i) => {
      const dist = Math.abs(i - fila), foco = 1 - clamp(dist);
      ctx.save(); ctx.filter = `blur(${Math.min(3.2, dist * 1.8).toFixed(2)}px)`;
      ctx.globalAlpha = 1 - Math.min(.5, dist * .28);
      const yy = top + i * rh + rh / 2; const s = 1 + .035 * foco;
      ctx.translate(cx + 60, yy); ctx.scale(s, s);
      font(ctx, FM, 500, 22); ctx.fillStyle = C.water; ctx.fillText('0' + (i + 1), 0, 8);
      font(ctx, FB, foco > .5 ? 600 : 500, 35); ctx.fillStyle = C.text; ctx.fillText(txt, 64, 12);
      ctx.restore();
    });
    parrafo(ctx, p.pie, tema.body, { y: cy + ch + 40, size: 32 });
    marca(ctx, tema, p, A.cfg, { pie: A.cfg.cuenta });
  },
};

// 02 · Letras con máscara (ilustración o foto dentro de la palabra)
P.mascara = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema);
    if (!p._off) { p._off = document.createElement('canvas'); p._off.width = W; p._off.height = H; }
    const o = p._off.getContext('2d'); o.clearRect(0, 0, W, H);
    font(o, FD, 800, 100); const base = o.measureText(p.palabra).width; const size = Math.min(300, 100 * (W - 2 * M) / base);
    const by = 250 + size * .78; // línea base
    const top = by - size * .78, alto = size * .8;
    const sube = eOut(seg(t, .3, 2.6)), sale = eIn(seg(t, 6, 7.8));
    const dy = lerp(alto + 140, 0, sube) - sale * (alto + 160);
    o.save(); o.translate(0, dy); o.beginPath(); o.rect(0, top - 60, W, alto + 120); o.clip();
    if (p.foto && A.fotos[p.foto]) {
      cubrir(o, A.fotos[p.foto], 0, top - 40, W, alto + 80, 1.05 + .03 * Math.sin(TAU * t / D));
    } else {
      o.fillStyle = C.accent; o.fillRect(0, top + alto * .58, W, alto * .6);                     // la vasija
      o.fillStyle = 'rgba(255,255,255,.22)'; o.fillRect(0, top + alto * .58, W, 8);
      o.fillStyle = C.deep; o.fillRect(0, top - 60, W, alto * .58 + 62);
      const r = azar(3);
      for (let i = 0; i < 22; i++) {                                                            // hojas
        const x = M - 20 + i * 44 + r() * 20, y = top + alto * .62 - r() * alto * .6, rot = -0.9 + r() * 1.8 + .12 * Math.sin(TAU * t / D + i);
        o.save(); o.translate(x, y); o.rotate(rot); o.fillStyle = i % 2 ? '#3E7D70' : C.deep2;
        o.beginPath(); o.ellipse(0, -46, 26, 54, 0, 0, TAU); o.fill(); o.restore();
      }
    }
    o.restore();
    o.globalCompositeOperation = 'destination-in'; font(o, FD, 800, size); o.textAlign = 'center'; o.fillText(p.palabra, W / 2, by);
    o.globalCompositeOperation = 'source-over';
    ctx.save(); font(ctx, FD, 800, size); ctx.textAlign = 'center'; ctx.globalAlpha = .13; ctx.fillStyle = tema.ink; ctx.fillText(p.palabra, W / 2, by); ctx.restore();
    ctx.drawImage(p._off, 0, 0);
    const a = eOut(seg(t, 1.6, 2.4)) * (1 - eSoft(seg(t, 6.4, 7)));
    ctx.fillStyle = tema.ink; ctx.globalAlpha = a; ctx.fillRect(M, by + 60, 140 * eOut(seg(t, 1.8, 2.8)), 4); ctx.globalAlpha = 1;
    const y = titulo(ctx, p.titulo, tema, { y: by + 110, size: 68, alpha: a, dy: (1 - a) * 20 });
    parrafo(ctx, p.texto, tema.body, { y: y + 24, size: 32, alpha: a });
    marca(ctx, tema, p, A.cfg);
  },
};

// 07 · Zoom al dato
P.zoom = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 80 });
    const px = M, py = 420, pw = W - 2 * M, ph = 560;
    ctx.fillStyle = C.panel; rrect(ctx, px, py, pw, ph, 28); ctx.fill();
    const tw = (pw - 48 * 2 - 40) / 3, th = 170, ty = py + 48;
    p.datos.forEach(([lab, val], i) => {
      const tx = px + 48 + i * (tw + 20);
      ctx.fillStyle = C.canvas; ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, tx, ty, tw, th, 18); ctx.fill(); ctx.stroke();
      font(ctx, FM, 500, 17); ctx.fillStyle = C.text2; ctx.fillText(lab.toUpperCase(), tx + 22, ty + 44);
      font(ctx, FD, 700, 52); ctx.fillStyle = C.deep; ctx.fillText(val, tx + 22, ty + 128);
    });
    // gráfica de fondo: antes y después
    const gy = py + ph - 50; [[.92, .05], [.6, .0], [.7, .11]].forEach(([an, de], i) => {
      const gx = px + 110 + i * 270;
      ctx.fillStyle = 'rgba(78,93,88,.22)'; ctx.fillRect(gx, gy - 260 * an, 70, 260 * an);
      ctx.fillStyle = C.water; ctx.fillRect(gx + 84, gy - Math.max(6, 260 * de), 70, Math.max(6, 260 * de));
    });
    etiqueta(ctx, 'Antes · Después', C.text2, px + pw - 48, py + ph - 16, { size: 16, align: 'right', alpha: 1 - clamp(eInOut(seg(t, 1.3, 2.3)) * 3 - eInOut(seg(t, 6, 7)) * 3) });
    // zoom a la ficha del medio
    const sx = px + 48 + tw + 20, sy = ty;
    const esq = eOut(seg(t, .3, 1)) * (1 - seg(t, 7, 7.6));
    const g = eInOut(seg(t, 1.3, 2.3)) - eInOut(seg(t, 6, 7));
    const bx = lerp(sx, M + 50, g), byy = lerp(sy, 450, g), bw = lerp(tw, W - 2 * M - 100, g), bh = lerp(th, 500, g);
    ctx.fillStyle = `rgba(18,61,56,${.45 * g})`; ctx.fillRect(px, py, pw, ph);
    if (g > .001) {
      ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = C.sun; ctx.lineWidth = 2; ctx.globalAlpha = g * .9;
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([u, v]) => { ctx.beginPath(); ctx.moveTo(sx + tw * u, sy + th * v); ctx.lineTo(bx + bw * u, byy + bh * v); ctx.stroke(); });
      ctx.restore();
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
      ctx.fillStyle = C.white; rrect(ctx, bx, byy, bw, bh, lerp(18, 30, g)); ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.strokeStyle = C.sun; ctx.lineWidth = 6; ctx.globalAlpha = esq; ctx.lineCap = 'round';
    const L = 34, m = 12; [[bx - m, byy - m, 1, 1], [bx + bw + m, byy - m, -1, 1], [bx - m, byy + bh + m, 1, -1], [bx + bw + m, byy + bh + m, -1, -1]]
      .forEach(([x, y, dx, dy]) => { ctx.beginPath(); ctx.moveTo(x, y + dy * L); ctx.lineTo(x, y); ctx.lineTo(x + dx * L, y); ctx.stroke(); });
    ctx.restore();
    const c = seg(t, 2.3, 2.7) * (1 - seg(t, 5.6, 6));
    if (c > 0) {
      ctx.save(); ctx.globalAlpha = c; const ix = bx + 56;
      etiqueta(ctx, p.dato.etiqueta, C.water, ix, byy + 80, { size: 22 });
      const v = Math.round(p.dato.valor * eOut(seg(t, 2.4, 3.6)));
      font(ctx, FD, 700, 210); ctx.letterSpacing = '-6px'; ctx.fillStyle = C.deep; ctx.fillText(v + p.dato.sufijo, ix - 8, byy + 290); ctx.letterSpacing = '0px';
      ctx.fillStyle = C.water; ctx.fillRect(ix, byy + 325, 220 * eOut(seg(t, 3, 3.8)), 4);
      font(ctx, FB, 600, 30); ctx.fillStyle = C.text; ctx.fillText(p.dato.nota, ix, byy + 382);
      parrafo(ctx, p.fuente, C.text2, { x: ix, y: byy + 400, size: 22, maxW: bw - 112 });
      ctx.restore();
    }
    parrafo(ctx, p.texto, tema.body, { y: py + ph + 44, size: 24 });
    marca(ctx, tema, p, A.cfg);
  },
};

// 14 · Capas en profundidad (el purificador pieza por pieza)
P.capas = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 84 });
    const k = eInOut(seg(t, .8, 2.2)) - eInOut(seg(t, 5.8, 7));
    const giro = .04 * Math.sin(Math.PI * seg(t, 2.2, 5.8));
    const cx = lerp(540, 330, k), cy = 820, w = 400, h = 300, sep = 160;
    const n = p.piezas.length;
    for (let i = n - 1; i >= 0; i--) {
      const [foto] = p.piezas[i]; const img = A.fotos[foto];
      const y = cy + (i - (n - 1) / 2) * sep * k;
      ctx.save(); ctx.translate(cx, y); ctx.scale(1, lerp(1, .57, k)); ctx.rotate(lerp(0, -.56, k) + giro * k);
      ctx.shadowColor = 'rgba(18,61,56,.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
      ctx.fillStyle = C.panel; rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.save(); rrect(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 20); ctx.clip(); if (img) cubrir(ctx, img, -w / 2, -h / 2, w, h); ctx.restore();
      ctx.restore();
    }
    // portada del purificador armado, se desvanece al separarse
    const cub = A.fotos[p.foto]; const ac = 1 - clamp(k * 1.6);
    if (cub && ac > 0) {
      const vert = cub.height > cub.width, fw = vert ? 450 : 600, fh = vert ? 600 : 450;
      ctx.save(); ctx.globalAlpha = ac; ctx.shadowColor = 'rgba(18,61,56,.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
      ctx.fillStyle = C.panel; rrect(ctx, cx - fw / 2, cy - fh / 2, fw, fh, 28); ctx.fill(); ctx.shadowColor = 'transparent';
      rrect(ctx, cx - fw / 2 + 8, cy - fh / 2 + 8, fw - 16, fh - 16, 22); ctx.clip();
      cubrir(ctx, cub, cx - fw / 2, cy - fh / 2, fw, fh, vert ? 1.02 : 1.15, .5, .55); ctx.restore();
    }
    p.piezas.forEach(([, nom, desc], i) => {
      const a = eOut(seg(t, 2 + i * .15, 2.6 + i * .15)) * (1 - eSoft(seg(t, 5.5, 6)));
      if (a <= 0) return; const y = cy + (i - (n - 1) / 2) * sep * k;
      ctx.save(); ctx.globalAlpha = a; const x = 640 + (1 - a) * 20;
      ctx.strokeStyle = tema.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 150, y); ctx.lineTo(x - 16, y); ctx.stroke();
      ctx.fillStyle = tema.ink; ctx.beginPath(); ctx.arc(cx + 150, y, 5, 0, TAU); ctx.fill();
      font(ctx, FD, 700, 34); ctx.fillText(nom, x, y - 6);
      parrafo(ctx, desc, tema.body, { x, y: y + 4, size: 23, maxW: W - M - x, lh: 1.3 });
      ctx.restore();
    });
    marca(ctx, tema, p, A.cfg);
  },
};

// 06 · Barras → línea
P.barras = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 84 });
    const out = 1 - eSoft(seg(t, 6.2, 7.4));
    const x0 = 150, x1 = 1000, base = 1010, alto = 420, n = 6;
    const vals = Array.from({ length: n }, (_, i) => p.mensual * 2 * (i + 1)), max = vals[n - 1];
    ctx.save(); ctx.globalAlpha = out;
    ctx.fillStyle = C.line; ctx.fillRect(x0 - 30, base, x1 - x0 + 30, 2);
    const fmt = v => (p.unidad ? v.toLocaleString('es-CO') + ' ' + p.unidad : '$' + v.toLocaleString('es-CO'));
    etiqueta(ctx, 'Referencia', C.text2, x0 - 30, 470, { size: 18 });
    const pts = vals.map((v, i) => [x0 + i * (x1 - x0 - 40) / (n - 1), base - alto * v / max]);
    const afina = eInOut(seg(t, 1.6, 2.4));
    pts.forEach(([x, y], i) => {
      const g = eBack(seg(t, .3 + i * .16, 1 + i * .16)); const bw = lerp(64, 6, afina);
      const hh = (base - y) * g; ctx.fillStyle = mezcla(C.waterSoft, C.deep, .35 + .65 * (i / (n - 1)) * (1 - afina));
      if (hh > 0) { rrect(ctx, x - bw / 2, base - hh, bw, hh, Math.min(10, bw / 2)); ctx.fill(); }
      etiqueta(ctx, 'Mes ' + (i + 1) * 2, C.text2, x, base + 40, { size: 18, align: 'center' });
    });
    const lin = eInOut(seg(t, 2.3, 3.5));
    if (lin > 0) {
      const total = pts.length - 1, hasta = lin * total;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= Math.ceil(hasta); i++) { const f = Math.min(1, hasta - (i - 1)); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); }
      ctx.strokeStyle = C.deep; ctx.lineWidth = 4; ctx.stroke();
      ctx.lineTo(lerp(pts[0][0], pts[total][0], lin), base); ctx.lineTo(pts[0][0], base); ctx.closePath();
      ctx.fillStyle = 'rgba(120,185,178,.28)'; ctx.fill();
    }
    pts.forEach(([x, y], i) => {
      const a = seg(t, 1.9 + i * .05, 2.3 + i * .05); if (!a) return; const ult = i === n - 1;
      ctx.fillStyle = ult ? C.accent : C.deep; ctx.beginPath(); ctx.arc(x, y, (ult ? 14 : 9) * eBack(a), 0, TAU); ctx.fill();
    });
    const c = eOut(seg(t, 2.6, 3.8)); if (c > 0) {
      const v = Math.round(max * c / (p.unidad ? 10 : 1000)) * (p.unidad ? 10 : 1000);
      font(ctx, FD, 700, 76); ctx.letterSpacing = '-2px'; ctx.textAlign = 'right'; ctx.fillStyle = C.deep; ctx.globalAlpha = out * seg(t, 2.6, 3);
      ctx.fillText(fmt(v), x1, pts[n - 1][1] - 50); ctx.textAlign = 'left'; ctx.letterSpacing = '0px';
      etiqueta(ctx, 'En un año', C.water, x1, pts[n - 1][1] - 140, { size: 20, align: 'right' });
    }
    ctx.restore();
    parrafo(ctx, p.texto, tema.body, { y: 1100, size: 30 });
    marca(ctx, tema, p, A.cfg);
  },
};

// 15 · Baraja con muelle
P.baraja = {
  render(ctx, t, p, tema, A, D) {
    kicker(ctx, p, tema); titulo(ctx, p.titulo, tema, { y: 170, size: 88 });
    const cw = 330, ch = 520, cx = 540, cy = 850;
    const cartas = [
      { tipo: 'cita', d: p.testimonios[0], ang: -.07, dx: -318, delay: 0 },
      { tipo: 'cierre', ang: .06, dx: 318, delay: .07 },
      { tipo: 'cita', d: p.testimonios[1], ang: -.015, dx: 0, delay: .14 },
    ];
    cartas.forEach((c, i) => {
      const abre = t < 5.6 ? muelle(t - .7 - c.delay) : 1 - muelle(t - 5.6 - c.delay);
      const ang = lerp((i - 1) * .025, c.ang, abre), dx = c.dx * abre;
      ctx.save(); ctx.translate(cx + dx, cy); ctx.rotate(ang);
      ctx.shadowColor = 'rgba(23,76,70,.22)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 26;
      const oscura = c.tipo === 'cierre';
      ctx.fillStyle = oscura ? C.deep : C.panel; rrect(ctx, -cw / 2, -ch / 2, cw, ch, 28); ctx.fill(); ctx.shadowColor = 'transparent';
      if (!oscura) { ctx.strokeStyle = C.line; ctx.lineWidth = 2; rrect(ctx, -cw / 2, -ch / 2, cw, ch, 28); ctx.stroke(); }
      const x = -cw / 2 + 40;
      if (oscura) {
        const tt = { ...TEMAS.verde };
        const it = maquetar(ctx, p.cierre, FD, 700, 40, cw - 76, 1.1, x, -ch / 2 + 110);
        pintar(ctx, it, FD, 700, 40, tt);
        boton(ctx, 'Escríbenos', x, ch / 2 - 130, { size: 26 });
      } else {
        font(ctx, FD, 700, 130); ctx.fillStyle = C.water; ctx.fillText('“', x - 6, -ch / 2 + 130);
        parrafo(ctx, c.d[0], C.text, { x, y: -ch / 2 + 150, size: 30, maxW: cw - 76, w: 500, style: 'italic', lh: 1.32 });
        ctx.fillStyle = C.line; ctx.fillRect(x, ch / 2 - 130, 60, 2);
        font(ctx, FB, 600, 28); ctx.fillStyle = C.deep; ctx.fillText(c.d[1], x, ch / 2 - 80);
        etiqueta(ctx, 'Cliente', C.water, x, ch / 2 - 44, { size: 18 });
      }
      ctx.restore();
    });
    marca(ctx, tema, p, A.cfg);
  },
};

// 13 · Persianas que descubren la foto
P.persianas = {
  render(ctx, t, p, tema, A, D) {
    const img = A.fotos[p.foto];
    const z = lerp(1.1, 1, eOut(seg(t, .8, 2.8))) + lerp(0, .1, eIn(seg(t, 6, 7.6)));
    const [fx, fy] = p.encuadre || [.5, .6]; // 0 = izquierda/arriba, 1 = derecha/abajo
    if (img) cubrir(ctx, img, 0, 0, W, H, z, fx, fy);
    const g = ctx.createLinearGradient(0, 640, 0, H); g.addColorStop(0, 'rgba(18,61,56,0)'); g.addColorStop(.45, 'rgba(18,61,56,.82)'); g.addColorStop(1, 'rgba(18,61,56,.95)');
    ctx.fillStyle = g; ctx.fillRect(0, 640, W, H - 640);
    const gt = ctx.createLinearGradient(0, 0, 0, 420); gt.addColorStop(0, 'rgba(18,61,56,.7)'); gt.addColorStop(1, 'rgba(18,61,56,0)');
    ctx.fillStyle = gt; ctx.fillRect(0, 0, W, 420);
    kicker(ctx, p, tema);
    const a = eOut(seg(t, 2.2, 3)) * (1 - eSoft(seg(t, 5.6, 6.1)));
    const y = titulo(ctx, p.titulo, tema, { y: 860, size: 84, alpha: a, dy: (1 - a) * 20 });
    parrafo(ctx, p.texto, tema.body, { y: y + 18, size: 32, alpha: a });
    marca(ctx, tema, p, A.cfg, { pie: A.cfg.cuenta });
    // lamas
    const n = 8, lw = W / n;
    for (let i = 0; i < n; i++) {
      const abre = eInOut(seg(t, .8 + i * .12, 1.6 + i * .12)), cierra = eInOut(seg(t, 6.2 + (n - 1 - i) * .12, 7 + (n - 1 - i) * .12));
      const k = abre - cierra; if (k >= .999) continue;
      const w = lw * Math.cos(k * Math.PI / 2) + .6;
      ctx.fillStyle = mezcla(C.deep, C.deep2, k); ctx.globalAlpha = 1 - Math.pow(k, 6);
      ctx.fillRect(i * lw, 0, w, H);
      ctx.fillStyle = 'rgba(227,238,234,.06)'; ctx.fillRect(i * lw, 0, 2, H); ctx.globalAlpha = 1;
    }
    // la marca sobre las lamas cerradas
    const c = 1 - Math.max(eOut(seg(t, .6, 1.2)), 0) + eOut(seg(t, 7.1, 7.8));
    if (c > .01) {
      ctx.save(); ctx.globalAlpha = clamp(c); ctx.fillStyle = C.onDeep; gota(ctx, 540, 640, 40); ctx.fill();
      font(ctx, FD, 700, 64); ctx.textAlign = 'center'; ctx.fillText('Pureza Natural', 540, 780);
      etiqueta(ctx, 'Claridad que cuida', C.onDeep2, 540, 840, { size: 22, align: 'center' }); ctx.restore();
    }
  },
};

window.ANIM = { W, H, C, TEMAS, P, fondo, marca };
})();
