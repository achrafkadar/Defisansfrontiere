/**
 * Ancres avec offset (header sticky) + accordéon FAQ (une ouverture à la fois).
 */
(function () {
  "use strict";

  var HEADER_SEL = ".dsf-header";

  function headerOffset() {
    var h = document.querySelector(HEADER_SEL);
    return h ? h.getBoundingClientRect().height + 8 : 0;
  }

  function scrollToHash(hash, behavior) {
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: behavior || "smooth" });
  }

  function bindAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var hash = a.getAttribute("href");
        if (!hash || hash.length < 2) return;
        if (!document.querySelector(hash)) return;
        e.preventDefault();
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollToHash(hash, reduced ? "auto" : "smooth");
        history.pushState(null, "", hash);
        var focusTarget = document.querySelector(hash);
        if (focusTarget) {
          focusTarget.setAttribute("tabindex", "-1");
          focusTarget.focus({ preventScroll: true });
        }
      });
    });
  }

  function bindFaqAccordion() {
    var root = document.querySelector(".dsf-faq");
    if (!root) return;

    root.querySelectorAll("details.dsf-faq-item").forEach(function (det) {
      det.addEventListener("toggle", function () {
        if (!det.open) return;
        root.querySelectorAll("details.dsf-faq-item").forEach(function (other) {
          if (other !== det) other.removeAttribute("open");
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindAnchors();
    bindFaqAccordion();
    if (window.location.hash) {
      setTimeout(function () {
        scrollToHash(window.location.hash, "auto");
      }, 0);
    }
  });
})();
