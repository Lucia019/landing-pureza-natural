/* Seguimiento de Pureza Natural: Google Analytics 4 + Meta Pixel.
   Pega aquí tus dos códigos. Mientras digan PEGAR_..., no se carga nada. */
(function () {
  'use strict';
  var GA_ID = 'G-PEGAR_AQUI';      // Google Analytics 4: ID de medición (empieza por G-)
  var PIXEL_ID = 'PEGAR_AQUI';     // Meta: ID del píxel (solo números)

  var GTM_ID = 'GTM-TGFJLRQM';     // Google Tag Manager: ID del contenedor (empieza por GTM-)

  var gaOn = /^G-[A-Z0-9]{6,}$/.test(GA_ID);
  var pxOn = /^\d{8,}$/.test(PIXEL_ID);
  var gtmOn = /^GTM-[A-Z0-9]{4,}$/.test(GTM_ID);

  /* ---- Google Tag Manager ---- */
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  if (gtmOn) {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var g = document.createElement('script');
    g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(g);
  }

  /* ---- Google Analytics 4 (directo; no lo uses si ya lo cargas desde GTM) ---- */
  if (gaOn) {
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  /* ---- Meta Pixel ---- */
  if (pxOn) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  var page = location.pathname.indexOf('catalogo') > -1 ? 'catalogo' : 'landing';

  function send(ga, name, params, px) {
    if (gaOn) gtag('event', ga, params || {});
    if (gtmOn) { var d = { event: ga }; for (var k in (params || {})) d[k] = params[k]; window.dataLayer.push(d); }
    if (pxOn) fbq('track', px || name, params || {});
  }

  /* Clic o envío hacia WhatsApp = lead. Evita contar dos veces el mismo intento. */
  var lastLead = 0;
  function lead(origen) {
    var now = Date.now();
    if (now - lastLead < 1500) return;
    lastLead = now;
    send('generate_lead', 'Lead', { origen: origen, pagina: page, currency: 'COP' }, 'Contact');
    if (pxOn) fbq('track', 'Lead', { origen: origen });
  }

  /* Cualquier enlace a WhatsApp */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"], a.wa-link');
    if (a) lead('boton_whatsapp');

    /* Catálogo: agregar al pedido */
    var b = e.target.closest && e.target.closest('[data-add]');
    if (b) {
      var id = b.getAttribute('data-add') || 'sin_id';
      send('add_to_cart', 'AddToCart', { item_id: id, currency: 'COP', pagina: page });
    }
  }, true);

  /* Formularios que abren WhatsApp con window.open */
  var open0 = window.open;
  window.open = function (url) {
    if (typeof url === 'string' && url.indexOf('wa.me') > -1) lead('formulario');
    return open0.apply(window, arguments);
  };

  /* Cuánto lee la gente: 25, 50, 75 y 90 % de la página */
  var hitos = [25, 50, 75, 90], vistos = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h <= 0) return;
    var p = scrollY / h * 100;
    hitos.forEach(function (m) {
      if (p >= m && !vistos[m]) { vistos[m] = 1; if (gaOn) gtag('event', 'scroll_profundo', { porcentaje: m, pagina: page }); if (gtmOn) window.dataLayer.push({ event: 'scroll_profundo', porcentaje: m, pagina: page }); }
    });
  }, { passive: true });

  /* Visitas de calidad: 30 s con la pestaña abierta */
  setTimeout(function () { if (gaOn) gtag('event', 'visita_30s', { pagina: page }); if (gtmOn) window.dataLayer.push({ event: 'visita_30s', pagina: page }); }, 30000);
})();
