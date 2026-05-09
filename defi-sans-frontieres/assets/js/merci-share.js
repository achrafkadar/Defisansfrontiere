/**
 * Lien de partage avec UTMs (bouche-à-oreille) sur la page merci.
 * L’URL de la landing est déduite du chemin actuel pour fonctionner sur GitHub Pages,
 * sous-dossier ou domaine custom — pas seulement depuis la meta « prod ».
 */
(function () {
  "use strict";

  /**
   * URL absolue du fichier index.html du défi (sans hash ni query).
   * - merci dans defi-sans-frontieres/ → index.html voisin
   * - merci à la racine du repo → defi-sans-frontieres/index.html
   */
  function resolveLandingIndexUrl() {
    try {
      var path = window.location.pathname || "";
      var atRepoRootMerci = /\/merci\.html$/i.test(path) && path.indexOf("defi-sans-frontieres") === -1;
      if (atRepoRootMerci) {
        return new URL("defi-sans-frontieres/index.html", window.location.href).href.split(/[?#]/)[0];
      }
      return new URL("index.html", window.location.href).href.split(/[?#]/)[0];
    } catch (e) {
      return "";
    }
  }

  function shareUrl() {
    var base = resolveLandingIndexUrl();
    if (!base) return "";
    try {
      var u = new URL(base);
      u.searchParams.set("utm_source", "referral");
      u.searchParams.set("utm_medium", "share");
      u.searchParams.set("utm_campaign", "defi_maroc_2026");
      u.searchParams.set("utm_content", "merci_invite_friend");
      u.hash = "filtres";
      return u.href;
    } catch (e2) {
      return (
        base +
        (base.indexOf("?") === -1 ? "?" : "&") +
        "utm_source=referral&utm_medium=share&utm_campaign=defi_maroc_2026&utm_content=merci_invite_friend#filtres"
      );
    }
  }

  function trackShare(method) {
    if (window.DSF && window.DSF.analytics && typeof window.DSF.analytics.trackMerciShare === "function") {
      window.DSF.analytics.trackMerciShare(method);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var link = document.getElementById("dsf-share-link");
    var copyBtn = document.getElementById("dsf-share-copy");
    var feedback = document.getElementById("dsf-share-feedback");
    var url = shareUrl();

    if (link && url) {
      link.setAttribute("href", url);
      link.addEventListener("click", function () {
        trackShare("open_link");
      });
    }

    function showFeedback(msg) {
      if (!feedback) return;
      feedback.hidden = false;
      feedback.textContent = msg;
    }

    if (copyBtn && url) {
      copyBtn.addEventListener("click", function () {
        function ok() {
          trackShare("copy_link");
          showFeedback("Lien copié dans le presse-papiers.");
        }
        function fail() {
          showFeedback("Copie impossible : sélectionne le lien ou ouvre-le dans un nouvel onglet.");
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(ok).catch(fail);
        } else {
          fail();
        }
      });
    }

    var nativeBtn = document.getElementById("dsf-share-native");
    if (nativeBtn && url && navigator.share) {
      nativeBtn.hidden = false;
      nativeBtn.addEventListener("click", function () {
        navigator
          .share({
            title: "Défi Sans Frontières — Maroc 2026",
            text: "Je postule au défi — et toi ?",
            url: url,
          })
          .then(function () {
            trackShare("native_share");
          })
          .catch(function () {});
      });
    }
  });
})();
