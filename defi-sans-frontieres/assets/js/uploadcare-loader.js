/**
 * Charge le widget Uploadcare uniquement si meta uploadcare-public-key est renseignée.
 * Dashboard Uploadcare → projet → API keys → Public key.
 * Meta optionnelle uploadcare-cdn-base : base d’URL des fichiers (voir doc Delivery / CDN).
 * Doit être défini avant le chargement du script widget.
 * Exécuté en defer : le DOM du formulaire est déjà disponible.
 */
(function () {
  "use strict";

  var m = document.querySelector('meta[name="uploadcare-public-key"]');
  var k = m && m.content ? String(m.content).trim() : "";
  if (!k || /^YOUR_UPLOADCARE_PUBLIC_KEY$/i.test(k)) {
    return;
  }
  window.UPLOADCARE_PUBLIC_KEY = k;
  window.UPLOADCARE_LOCALE = "fr";

  var cdnM = document.querySelector('meta[name="uploadcare-cdn-base"]');
  var cdn =
    cdnM && cdnM.content ? String(cdnM.content).trim() : "";
  if (cdn && !/^disabled$/i.test(cdn)) {
    window.UPLOADCARE_CDN_BASE = cdn.replace(/\/$/, "");
  }

  var s = document.createElement("script");
  s.src = "https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js";
  s.async = true;
  (document.head || document.documentElement).appendChild(s);
})();
