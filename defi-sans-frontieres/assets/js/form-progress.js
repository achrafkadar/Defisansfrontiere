/**
 * Barre de progression du formulaire (étapes 1–4) selon la section visible.
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

  document.addEventListener("DOMContentLoaded", function () {
    var wrap = document.getElementById("dsf-form-inner");
    if (!wrap) return;

    var fieldsets = wrap.querySelectorAll(".dsf-form-fieldset[data-dsf-step]");
    var fillEl = document.getElementById("dsf-form-progress-fill");
    var barEl = document.getElementById("dsf-form-progress-bar");
    var currentEl = document.getElementById("dsf-form-step-current");
    var nameEl = document.getElementById("dsf-form-step-name");

    if (!fieldsets.length || !fillEl || !barEl) return;

    var visible = new Map();
    fieldsets.forEach(function (fs) {
      visible.set(fs, false);
    });

    function maxVisibleStep() {
      var max = 1;
      fieldsets.forEach(function (fs) {
        if (visible.get(fs)) {
          var n = parseInt(fs.getAttribute("data-dsf-step"), 10);
          if (!isNaN(n) && n > max) max = n;
        }
      });
      return max;
    }

    function render(stepNum) {
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
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          visible.set(en.target, en.isIntersecting && en.intersectionRatio > 0.08);
        });
        render(maxVisibleStep());
      },
      {
        root: null,
        rootMargin: "-14% 0px -46% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    fieldsets.forEach(function (fs) {
      io.observe(fs);
    });

    render(1);
  });
})();
