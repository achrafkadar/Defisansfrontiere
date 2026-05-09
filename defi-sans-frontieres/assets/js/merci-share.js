/**
 * Lien de partage avec UTMs (bouche-à-oreille) sur la page merci.
 */
(function () {
  "use strict";

  function landingUrlFromMeta() {
    var meta = document.querySelector('meta[name="dsf-share-landing"]');
    var raw = meta && meta.getAttribute("content") ? meta.getAttribute("content").trim() : "";
    if (raw && /^https?:\/\//i.test(raw)) return raw;
    try {
      return new URL("index.html", window.location.href).href;
    } catch (e) {
      return "";
    }
  }

  function trackShare(method) {
    if (window.DSF && window.DSF.analytics && typeof window.DSF.analytics.trackMerciShare === "function") {
      window.DSF.analytics.trackMerciShare(method);
    }
  }

  function shareUrl() {
    var base = landingUrlFromMeta();
    if (!base) return "";
    try {
      var root = base.split(/[?#]/)[0];
      var u = new URL("index.html", root.endsWith("/") ? root : root + "/");
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
