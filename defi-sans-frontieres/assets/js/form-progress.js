/**
 * Barre de progression du formulaire (étapes 1–4).
 * Détection au scroll + focus (plus fiable que seul IntersectionObserver sur de longs blocs).
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

  /**
   * Dernière section (ordre du document) dont le haut est au-dessus de la ligne de repère
   * — même logique qu’un scrollspy : on suit la progression réelle du formulaire.
   */
  function computeStepFromScroll(fieldsets) {
    var lineY = Math.min(window.innerHeight * 0.22, 280);
    var active = 1;
    fieldsets.forEach(function (fs) {
      var r = fs.getBoundingClientRect();
      var s = parseInt(fs.getAttribute("data-dsf-step"), 10);
      if (isNaN(s)) return;
      if (r.top <= lineY) {
        active = s;
      }
    });
    return Math.min(Math.max(active, 1), STEPS.length);
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

    function update() {
      render(computeStepFromScroll(fieldsets));
    }

    var ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    wrap.addEventListener(
      "focusin",
      function (e) {
        var fs = e.target.closest ? e.target.closest("[data-dsf-step]") : null;
        if (!fs || !wrap.contains(fs)) return;
        var s = parseInt(fs.getAttribute("data-dsf-step"), 10);
        if (!isNaN(s)) {
          lastRendered = 0;
          render(s);
        }
      },
      true
    );

    lastRendered = 0;
    update();
    window.setTimeout(update, 100);
    window.setTimeout(update, 400);
  });
})();
