// ===================================================================
//  MÚSICA ORIGINAL DE LAS DESTACADAS · Pureza Natural
//  No es una pista grabada: se compone sola a partir de la animación.
//  · Cada destacada tiene su propia música (instrumentos, ritmo y tono),
//    para que pasar de una a otra no canse.
//  · Dentro de una destacada cada historia entra en otro acorde y alterna
//    densidad: llena / ligera.
//  · Cada historia abre con un hook de sonido elegido por su contenido.
//  · Cada movimiento deja un evento (gota, campana, cuerda...) que suena
//    en el mismo cuadro, y los movimientos caen en el pulso de la música.
//  Funciona igual en el navegador (vista previa) y en Node (exportar).
// ===================================================================
(function (root) {
  'use strict';
  const SR = 44100;

  // prog: cuatro acordes (MIDI). La historia N empieza en el acorde N y avanza uno por compás.
  const AMBIENTES = {
    nosotros: { nombre: 'Bienvenida · guitarra acústica', bpm: 84, compas: 4,
      prog: [[40, 52, 56, 59, 63, 66], [37, 49, 52, 56, 59, 64], [33, 45, 49, 52, 56, 61], [35, 47, 52, 54, 59, 64]],
      escala: [64, 66, 68, 71, 73, 76, 78, 80, 83, 85], voz: 'campana', base: ['guitarra', 'bajo', 'colchon'] },
    empieza: { nombre: 'Mañana clara · marimba y gotas', bpm: 96, compas: 4,
      prog: [[38, 50, 54, 57, 64, 66], [35, 47, 50, 54, 57, 61], [31, 43, 47, 50, 54, 59], [33, 45, 49, 52, 54, 57]],
      escala: [62, 64, 66, 69, 71, 74, 76, 78, 81, 83], voz: 'marimba', base: ['marimba', 'gotas', 'colchon'] },
    pruebas: { nombre: 'Precisión · pulsos de vidrio', bpm: 108, compas: 4,
      prog: [[33, 45, 52, 55, 59, 60], [29, 41, 48, 52, 55, 57], [36, 48, 52, 55, 59, 62], [31, 43, 50, 52, 55, 59]],
      escala: [69, 72, 74, 76, 79, 81, 84, 86, 88, 91], voz: 'pulso', base: ['pulsos', 'tic', 'bajo', 'colchon'] },
    clientes: { nombre: 'Calidez de casa · piano suave', bpm: 70, compas: 4,
      prog: [[41, 53, 57, 60, 64, 67], [38, 50, 53, 57, 60, 64], [34, 46, 50, 53, 57, 62], [36, 48, 53, 55, 58, 62]],
      escala: [65, 67, 69, 72, 74, 77, 79, 81, 84, 86], voz: 'piano', base: ['piano', 'colchon'] },
    cuentas: { nombre: 'Pulso ligero · pizzicato y reloj', bpm: 100, compas: 4,
      prog: [[36, 48, 52, 55, 60, 64], [33, 45, 52, 55, 57, 60], [29, 41, 53, 57, 60, 65], [31, 43, 50, 55, 59, 62]],
      escala: [72, 74, 76, 79, 81, 84, 86, 88, 91, 93], voz: 'pizz', base: ['pizz', 'tictac', 'bajo'] },
    pedir: { nombre: 'Impulso · beat suave', bpm: 104, compas: 4,
      prog: [[43, 55, 59, 62, 66, 69], [40, 52, 55, 59, 62, 66], [36, 48, 52, 55, 59, 64], [38, 50, 54, 57, 62, 64]],
      escala: [67, 69, 71, 74, 76, 79, 81, 83, 86, 88], voz: 'campana', base: ['bombo', 'shaker', 'bajo', 'campanas', 'colchon'] },
    cuidados: { nombre: 'Arrullo · caja de música en 3/4', bpm: 72, compas: 3,
      prog: [[34, 46, 50, 53, 58, 62], [31, 43, 50, 53, 55, 58], [39, 51, 55, 58, 62, 63], [41, 53, 57, 60, 63, 65]],
      escala: [70, 72, 74, 77, 79, 82, 84, 86, 89, 91], voz: 'cajita', base: ['cajita', 'colchon'] },
  };
  const CORTE = { verde: 650, niebla: 1000, agua: 1500 };

  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

  function renderizar(plan) {
    const amb = AMBIENTES[plan.mood] || AMBIENTES.empieza;
    const hi = plan.hi || 0, ligera = hi % 2 === 1;
    const beat = 60 / amb.bpm, bar = beat * amb.compas;
    const n = Math.ceil((plan.dur + 0.05) * SR);
    const L = new Float32Array(n), R = new Float32Array(n), envio = new Float32Array(n);
    const azar = rng(97 + hi * 131 + Math.round(plan.dur * 1000) + plan.eventos.length);
    const acordeEn = t => amb.prog[(hi + Math.max(0, Math.floor(t / bar))) % amb.prog.length];
    const grado = (g, oct = 0) => hz(amb.escala[((g % amb.escala.length) + amb.escala.length) % amb.escala.length] + 12 * oct);

    function pon(i, v, pan, rev) {
      if (i < 0 || i >= n) return;
      const a = (pan + 1) * Math.PI / 4;
      L[i] += v * Math.cos(a); R[i] += v * Math.sin(a); envio[i] += v * rev;
    }
    // tono genérico: parciales [multiplicador, amplitud, caída en s]
    function tono(t, f, { parc = [[1, 1, 1]], ataque = 0.004, largo = 2, vol = 0.1, pan = 0, rev = 0.4 } = {}) {
      const i0 = Math.round(t * SR), N = Math.round(largo * SR);
      for (let k = 0; k < N; k++) {
        const s = k / SR; let v = 0;
        for (const [m, a, d] of parc) v += Math.sin(2 * Math.PI * f * m * s) * a * Math.exp(-s / d);
        pon(i0 + k, v * Math.min(1, s / ataque) * Math.min(1, (N - k) / 400) * vol, pan, rev);
      }
    }
    function cuerdaF(t, f, { vol = 1, pan = 0, decae = 0.996, largo = 2.2 } = {}) { // Karplus-Strong
      const per = Math.max(2, Math.round(SR / f)), buf = new Float32Array(per);
      for (let k = 0; k < per; k++) buf[k] = azar() * 2 - 1;
      const i0 = Math.round(t * SR), N = Math.round(largo * SR);
      for (let k = 0; k < N; k++) {
        const j = k % per, v = buf[j];
        buf[j] = decae * 0.5 * (v + buf[(j + 1) % per]);
        const s = k / SR;
        pon(i0 + k, (v * 0.22 + Math.sin(2 * Math.PI * f * s) * Math.exp(-s / 0.5) * 0.06) * vol * Math.min(1, (N - k) / 400), pan, 0.4);
      }
    }
    function ruido(t, largo, { desde = 400, hasta = 1500, q = 0.35, vol = 0.07, env = x => Math.sin(Math.PI * x), pan = 0, rev = 0.5 } = {}) {
      const i0 = Math.round(t * SR), N = Math.round(largo * SR);
      let lo = 0, ba = 0;
      for (let k = 0; k < N; k++) {
        const x = k / N, fc = 2 * Math.sin(Math.PI * desde * Math.pow(hasta / desde, x) / SR);
        const hp = (azar() * 2 - 1) - lo - q * ba; ba += fc * hp; lo += fc * ba;
        pon(i0 + k, ba * env(x) * vol, typeof pan === 'function' ? pan(x) : pan, rev);
      }
    }

    // ---------- instrumentos ----------
    const INST = {
      campana: (t, f, v = 1, p = 0) => tono(t, f, { parc: [[1, 1, 1.7], [2.01, 0.32, 0.8], [3, 0.12, 0.45], [4.17, 0.06, 0.28]], largo: 2.6, vol: 0.15 * v, pan: p, rev: 0.5 }),
      marimba: (t, f, v = 1, p = 0) => tono(t, f, { parc: [[1, 1, 0.5], [3.93, 0.25, 0.08], [9.2, 0.06, 0.03]], ataque: 0.002, largo: 1.2, vol: 0.17 * v, pan: p, rev: 0.35 }),
      piano: (t, f, v = 1, p = 0) => { tono(t, f, { parc: [[1, 1, 1.8], [2, 0.35, 0.9], [3, 0.12, 0.5], [4, 0.05, 0.3]], ataque: 0.006, largo: 2.6, vol: 0.12 * v, pan: p, rev: 0.45 }); },
      pulso: (t, f, v = 1, p = 0) => tono(t, f, { parc: [[1, 1, 0.09], [2, 0.2, 0.05]], ataque: 0.002, largo: 0.35, vol: 0.12 * v, pan: p, rev: 0.55 }),
      pizz: (t, f, v = 1, p = 0) => cuerdaF(t, f, { vol: 0.9 * v, pan: p, decae: 0.982, largo: 0.5 }),
      guitarra: (t, f, v = 1, p = 0) => cuerdaF(t, f, { vol: 0.8 * v, pan: p, decae: 0.996, largo: 2 }),
      cajita: (t, f, v = 1, p = 0) => tono(t, f * 2, { parc: [[1, 1, 0.9], [2, 0.3, 0.4], [5.4, 0.08, 0.15]], ataque: 0.002, largo: 1.6, vol: 0.085 * v, pan: p, rev: 0.6 }),
    };
    function gota(t, { grande = false, alto = 0, vol = 1 } = {}) {
      const i0 = Math.round(t * SR), largo = (grande ? 0.3 : 0.14) * SR;
      const f0 = (grande ? 360 : 640) * (1 + alto * 0.12), sube = Math.log(grande ? 2.2 : 2.6) / 0.06;
      const tau = grande ? 0.07 : 0.035, pan = (azar() - 0.5) * 0.5;
      let fase = 0;
      for (let k = 0; k < largo; k++) {
        const s = k / SR, f = f0 * Math.exp(sube * Math.min(s, 0.06));
        fase += 2 * Math.PI * f / SR;
        let v = Math.sin(fase) * Math.min(1, s / 0.003) * Math.exp(-s / tau) * (grande ? 0.42 : 0.34);
        if (grande) v += Math.sin(2 * Math.PI * 85 * s) * Math.exp(-s / 0.12) * 0.28 * Math.min(1, s / 0.004);
        pon(i0 + k, v * vol, pan, 0.55);
      }
    }
    function bombo(t, vol = 1) {
      const i0 = Math.round(t * SR);
      for (let j = 0; j < 0.3 * SR; j++) {
        const s = j / SR, f = 55 + 70 * Math.exp(-s / 0.03);
        pon(i0 + j, Math.sin(2 * Math.PI * f * s) * Math.min(1, s / 0.003) * Math.exp(-s / 0.13) * 0.3 * vol, 0, 0.08);
      }
    }
    function tic(t, k = 0, vol = 1) {
      const i0 = Math.round(t * SR), f = 1300 + k * 70;
      for (let j = 0; j < 0.08 * SR; j++) {
        const s = j / SR;
        pon(i0 + j, (Math.sin(2 * Math.PI * f * s) * Math.exp(-s / 0.018) + (j < 80 ? (azar() - 0.5) * 0.4 : 0)) * 0.1 * vol, k % 2 ? 0.3 : -0.3, 0.25);
      }
    }
    const shaker = (t, vol = 1) => ruido(t, 0.07, { desde: 6000, hasta: 9000, q: 0.6, vol: 0.05 * vol, env: x => Math.exp(-x * 5) * Math.min(1, x * 20), pan: 0.35, rev: 0.15 });
    const bajo = (t, f, dur, vol = 1) => tono(t, f, { parc: [[1, 1, 0.9], [2, 0.25, 0.4]], ataque: 0.012, largo: dur, vol: 0.13 * vol, rev: 0.1 });
    function colchon(desde, dur) {
      const fc = 2 * Math.sin(Math.PI * (CORTE[plan.fondo] || 1000) / SR);
      const bars = Math.ceil(dur / bar) + 1;
      for (let b = 0; b < bars; b++) {
        const t0 = Math.max(desde, b * bar), t1 = Math.min(dur, (b + 1) * bar);
        if (t1 <= t0) continue;
        acordeEn(b * bar + 0.001).slice(1, 5).forEach((m, vi) => {
          [-0.003, 0.003].forEach((det, oi) => {
            const f = hz(m) * (1 + det), pan = (vi / 3 - 0.5) * 1.1 * (oi ? 1 : -1);
            let lo = 0;
            for (let k = Math.round(t0 * SR); k < t1 * SR && k < n; k++) {
              const s = k / SR;
              const env = Math.min(1, (s - desde) / 1.2) * Math.min(1, (dur - s) / 1.2) * Math.min(1, (s - t0) / 0.15 + (t0 === desde ? 1 : 0)) * Math.min(1, (t1 - s) / 0.15 + (t1 === dur ? 1 : 0));
              const x = Math.sin(2 * Math.PI * f * s) + 0.3 * Math.sin(4 * Math.PI * f * s);
              lo += fc * (x - lo);
              pon(k, lo * env * 0.022 * (ligera ? 0.8 : 1), pan, 0.45);
            }
          });
        });
      }
    }

    // ---------- la base musical de cada destacada ----------
    const entra = ligera ? beat * 2 : 0; // en las historias ligeras la base entra un poco después del hook
    const fin = plan.dur - 0.5;
    const pasos = (div, cb) => { for (let k = 0, t = 0; (t = k * beat / div) < fin; k++) if (t >= entra) cb(t, k); };
    const den = ligera ? 0.6 : 1;
    for (const inst of amb.base) {
      switch (inst) {
        case 'colchon': colchon(entra, plan.dur); break;
        case 'guitarra': pasos(2, (t, k) => { if (ligera && k % 2) return; const a = acordeEn(t); INST.guitarra(t, hz(a[[1, 3, 2, 4, 3, 5, 4, 2][k % 8]]), 0.55 * den, (k % 2 ? 0.3 : -0.3)); }); break;
        case 'marimba': pasos(2, (t, k) => { if ([1, 5].includes(k % 8) || (ligera && k % 2)) return; const a = acordeEn(t); INST.marimba(t, hz(a[[3, 4, 5, 4][k % 4]] + 12), 0.55 * den, k % 2 ? 0.4 : -0.4); }); break;
        case 'gotas': pasos(2, (t, k) => { if (k % 4 === 3 && !ligera) gota(t, { alto: 2 + (k % 3), vol: 0.35 }); }); break;
        case 'pulsos': pasos(4, (t, k) => { if (ligera && k % 2) return; const a = acordeEn(t); INST.pulso(t, hz(a[2 + (k % 4)] + 12), (k % 4 === 0 ? 0.9 : 0.5) * den, Math.sin(k) * 0.6); }); break;
        case 'tic': pasos(2, (t, k) => { if (k % 2) tic(t, 6, 0.3 * den); }); break;
        case 'piano': pasos(1, (t, k) => {
          const a = acordeEn(t), enCompas = k % amb.compas;
          if (enCompas === 0) a.slice(1, 5).forEach((m, i) => INST.piano(t + i * 0.025, hz(m), 0.55, -0.3 + i * 0.2));
          else if (!ligera && enCompas === 2) INST.piano(t, hz(a[5]), 0.4, 0.3);
        }); break;
        case 'pizz': pasos(2, (t, k) => { if (ligera && k % 2) return; const a = acordeEn(t); INST.pizz(t, hz(a[[2, 4, 3, 5][k % 4]]), 0.7 * den, k % 2 ? 0.35 : -0.35); }); break;
        case 'tictac': pasos(1, (t, k) => tic(t, k % 2 ? 0 : 3, 0.35)); break;
        case 'bajo': pasos(1, (t, k) => { if (k % amb.compas === 0 || (!ligera && k % amb.compas === 2)) bajo(t, hz(acordeEn(t)[0] + 12), beat * 1.6, 0.9); }); break;
        case 'bombo': pasos(1, (t, k) => { if (!ligera || k % 2 === 0) bombo(t, k % 2 ? 0.7 : 1); }); break;
        case 'shaker': pasos(2, (t, k) => { if (k % 2) shaker(t, ligera ? 0.6 : 1); }); break;
        case 'campanas': pasos(1, (t, k) => { if (k % 4 === 3) INST.campana(t, grado([4, 5, 7, 4][(k >> 2) % 4]), 0.45, 0.4); }); break;
        case 'cajita': pasos(1, (t, k) => { const mel = [0, 2, 4, 2, 5, 4, 2, 1, 0, 4, 2, 0]; if (!ligera || k % 3 === 0) INST.cajita(t, grado(mel[(k + hi * 3) % mel.length]), 0.8, Math.sin(k) * 0.5); }); break;
      }
    }

    // ---------- hooks: el primer medio segundo, para frenar el scroll ----------
    const vozDe = (t, g, v = 1, oct = 0, p = 0) => (INST[amb.voz] || INST.campana)(t, grado(g, oct), v, p);
    const HOOKS = {
      logo: t => { [0, 2, 4].forEach((g, i) => vozDe(t + i * beat / 2, g, 1.1, 0, -0.3 + i * 0.3)); gota(t + beat * 1.5, { alto: 4, vol: 0.9 }); },
      tension: (t, hasta) => { // crece hacia la pregunta y se corta en seco
        const largo = Math.max(0.4, hasta - t);
        ruido(t, largo, { desde: 500, hasta: 3500, q: 0.5, vol: 0.09, env: x => Math.pow(x, 2.5) });
        tono(t, hz(acordeEn(t)[4] + 12), { parc: [[1, 1, 99]], ataque: largo * 0.95, largo, vol: 0.05, rev: 0.6 });
      },
      riser: (t, hasta) => ruido(t, Math.max(0.4, hasta - t), { desde: 300, hasta: 4500, q: 0.4, vol: 0.08, env: x => Math.pow(x, 1.8), pan: x => (x - 0.5) * 0.8 }),
      impacto: t => { bombo(t, 1.1); vozDe(t, 7, 0.8, 0, 0.2); },
      llamado: t => { vozDe(t, 4, 1.2, 0, -0.2); vozDe(t + 0.13, 7, 1.2, 0, 0.2); },
      eco: t => [0, 1, 2].forEach(i => gota(t + i * beat * 0.75, { alto: 3 - i, vol: 0.9 / (i * 0.9 + 1) })),
      intimo: t => { ruido(t, 1.2, { desde: 2500, hasta: 3200, vol: 0.02 }); vozDe(t + 0.1, 0, 0.6, -1, 0); },
    };

    // ---------- eventos sincronizados con la animación ----------
    const voz = (e, v) => vozDe(e.t, e.grado || 0, v * (e.vol || 1), e.oct || 0, (azar() - 0.5) * 0.6);
    for (const e of plan.eventos) {
      switch (e.tipo) {
        case 'hook': (HOOKS[e.clase] || HOOKS.eco)(e.t, e.hasta); break;
        case 'gota': gota(e.t, e); break;
        case 'campana': voz(e, 1); break;
        case 'cuerda': cuerdaF(e.t, grado(e.grado || 0), { vol: e.vol || 1, pan: (azar() - 0.5) * 0.7 }); break;
        case 'acorde': acordeEn(e.t).slice(1).forEach((m, i) => tono(e.t + i * 0.05, hz(m + 12), { parc: [[1, 1, 1.4], [2, 0.25, 0.4]], ataque: 0.01, largo: 3, vol: 0.05 * (e.vol || 1), pan: -0.5 + i * 0.25, rev: 0.6 })); break;
        case 'brillo': [0, 1, 2].forEach(i => tono(e.t + i * 0.06, grado(amb.escala.length - 3 + i), { parc: [[1, 1, 0.3]], ataque: 0.003, largo: 0.9, vol: 0.05 * (e.vol || 1), pan: -0.6 + i * 0.6, rev: 0.7 })); break;
        case 'aire': ruido(e.t, 0.8, { desde: 2800, hasta: 3400, vol: 0.022, env: x => Math.sin(Math.PI * x) ** 2, rev: 0.8 }); break;
        case 'flujo': ruido(e.t, e.dur || 1.2, { desde: 350, hasta: 1500, vol: 0.07, env: x => Math.pow(Math.sin(Math.PI * x), 1.5), pan: x => Math.sin(x * Math.PI * 2) * 0.4 }); break;
        case 'tic': tic(e.t, e.k, e.vol); break;
        case 'gliss': [2, 3, 4, 5].forEach((g, i) => cuerdaF(e.t + i * 0.055, grado(g), { vol: 0.7, pan: -0.4 + i * 0.25 })); break;
      }
    }

    // ---------- reverberación (sala pequeña de madera) ----------
    const reverb = desfase => {
      const out = new Float32Array(n);
      [1116, 1188, 1277, 1356, 1422, 1491].forEach(c => {
        const len = c + desfase, buf = new Float32Array(len); let idx = 0, filt = 0;
        for (let k = 0; k < n; k++) {
          const y = buf[idx]; filt = y * 0.65 + filt * 0.35;
          buf[idx] = envio[k] + filt * 0.82; idx = (idx + 1) % len; out[k] += y / 6;
        }
      });
      [556, 441, 341].forEach(a => {
        const len = a + desfase, buf = new Float32Array(len); let idx = 0;
        for (let k = 0; k < n; k++) { const b = buf[idx], x = out[k]; out[k] = -x + b; buf[idx] = x + b * 0.5; idx = (idx + 1) % len; }
      });
      return out;
    };
    const rL = reverb(0), rR = reverb(23), cola = 0.45 * SR;
    // volumen parejo entre historias (cerca de -16 LUFS) para que ninguna salte
    let suma = 0;
    for (let k = 0; k < n; k++) { const l = L[k] + rL[k] * 0.9, r = R[k] + rR[k] * 0.9; suma += l * l + r * r; }
    const nivel = Math.min(4, Math.max(0.4, 0.15 / (Math.sqrt(suma / (2 * n)) || 1)));
    for (let k = 0; k < n; k++) {
      const g = Math.min(1, k / 900) * Math.min(1, (n - k) / cola) * nivel;
      L[k] = Math.tanh((L[k] + rL[k] * 0.9) * g) * 0.89;
      R[k] = Math.tanh((R[k] + rR[k] * 0.9) * g) * 0.89;
    }
    return { L, R, sr: SR };
  }

  const api = { renderizar, AMBIENTES, SR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MUSICA = api;
})(typeof window !== 'undefined' ? window : globalThis);
