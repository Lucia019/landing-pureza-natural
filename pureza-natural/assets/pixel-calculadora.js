/* Píxel de Meta para el formulario /gasto-hormiga y la calculadora.
   No envía nombre, celular, correo ni las cifras de la calculadora.
   Solo se carga en purezanatural.co (las pruebas locales no cuentan). */
(function () {
  'use strict';
  var PIXEL_ID = '1709415957558898';
  if (!/(^|\.)purezanatural\.co$/.test(location.hostname)) return;
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* Sin recolección automática de botones ni de campos del formulario */
  fbq('set', 'autoConfig', false, PIXEL_ID);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
})();
