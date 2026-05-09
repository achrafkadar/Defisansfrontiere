/**
 * Barre de progression du formulaire (étapes 1–4).
 * Scroll + interactions (focus, clic, saisie) pour une mise à jour fiable.
 */
(function () {
  "use strict";

  var STEPS = [
    { num: 1, title: "Profil & motivation" },
    { num: 2, title: "Condition & collecte" },
    { num: 3, title: "Réseaux & vidéo" },
    { num: 4, title: "Engagement final" },
  ];

  function stepMeta(num) {
    var i = Math.min(Math.max(num, 1), STEPS.length) - 1;
    return STEPS[i];
  }

  function clampStep(s) {
    return Math.min(Math.max(s, 1), STEPS.length);
  }

  /**
   * 1) Section dont la zone englobe la « ligne de lecture » (~20 % du haut du viewport).
   * 2) Sinon, scrollspy : dernière section dont le haut a dépassé cette ligne (ordre du document).
   */
  function computeStepFromScroll(fieldsets) {
    var h = window.innerHeight || 600;
    var marker = Math.min(h * 0.2, 220);
    var active = 1;
    var i;

    for (i = 0; i < fieldsets.length; i++) {
      var fs = fieldsets[i];
      var r = fs.getBoundingClientRect();
      var s = parseInt(fs.getAttribute("data-dsf-step"), 10);
      if (isNaN(s)) continue;
      if (r.top <= marker && r.bottom >= marker) {
        return clampStep(s);
      }
    }

    fieldsets.forEach(function (fs) {
      var r = fs.getBoundingClientRect();
      var s = parseInt(fs.getAttribute("data-dsf-step"), 10);
      if (isNaN(s)) return;
      if (r.top <= marker) {
        active = s;
      }
    });
    return clampStep(active);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.getElementById("dsf-form-inner");
    if (!wrap) return;

    var fieldsets = wrap.querySelectorAll(".dsf-form-fieldset[data-dsf-step]");
    var fillEl = document.getElementById("dsf-form-progress-fill");
    var barEl = document.getElementById("dsf-form-progress-bar");
    var currentEl = document.getElementById("dsf-form-step-current");
    var nameEl = document.getElementById("dsf-form-step-name");
    var pills = wrap.querySelectorAll("[data-dsf-progress-step]");

    if (!fieldsets.length || !fillEl || !barEl) return;

    var lastRendered = 0;

    function render(stepNum) {
      if (stepNum === lastRendered) return;
      lastRendered = stepNum;

      var meta = stepMeta(stepNum);
      var pct = (stepNum / STEPS.length) * 100;
      fillEl.style.width = pct + "%";
      barEl.setAttribute("aria-valuenow", String(stepNum));
      barEl.setAttribute("aria-valuemax", String(STEPS.length));
      barEl.setAttribute(
        "aria-valuetext",
        "Étape " + stepNum + " sur " + STEPS.length + " — " + meta.title
      );
      if (currentEl) currentEl.textContent = String(stepNum);
      if (nameEl) nameEl.textContent = meta.title;

      pills.forEach(function (pill) {
        var sn = parseInt(pill.getAttribute("data-dsf-progress-step"), 10);
        if (isNaN(sn)) return;
        pill.classList.toggle("is-current", sn === stepNum);
        pill.classList.toggle("is-done", sn < stepNum);
      });
    }

    function updateFromScroll() {
      render(computeStepFromScroll(fieldsets));
    }

    function updateFromFieldsetInteraction(ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var fs = t.closest("[data-dsf-step]");
      if (!fs || !wrap.contains(fs)) return;
      var s = parseInt(fs.getAttribute("data-dsf-step"), 10);
      if (isNaN(s)) return;
      lastRendered = 0;
      render(s);
    }

    var ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        updateFromScroll();
      });
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    document.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    wrap.addEventListener("focusin", updateFromFieldsetInteraction, true);
    wrap.addEventListener("pointerdown", updateFromFieldsetInteraction, true);
    wrap.addEventListener("input", updateFromFieldsetInteraction, true);

    lastRendered = 0;
    updateFromScroll();
    window.setTimeout(updateFromScroll, 80);
    window.setTimeout(updateFromScroll, 350);
  });
})();
