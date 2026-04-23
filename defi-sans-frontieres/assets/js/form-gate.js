/**
 * Verrou du formulaire : les engagements (section 7) doivent être tous cochés
 * avant de déflouter / déverrouiller la zone de candidature (section 8).
 * S’appuie sur la classe html.dsf-enhanced (ajoutée ici au chargement).
 */
(function () {
  "use strict";

  var CHECK_SELECTOR = 'input[type="checkbox"][data-dsf-filter="1"]';
  var formInner = null;
  var filterInputs = [];
  var countEl = null;
  var msgEl = null;
  var unlockIcon = null;
  var sentAllChecked = false;

  function countChecked() {
    return filterInputs.filter(function (i) {
      return i.checked;
    }).length;
  }

  function allChecked() {
    return filterInputs.length > 0 && countChecked() === filterInputs.length;
  }

  function updateUI() {
    var n = countChecked();
    var total = filterInputs.length;
    if (countEl) {
      countEl.textContent = n + "/" + total + " cases cochées";
    }

    var locked = !allChecked();
    if (formInner) {
      formInner.classList.toggle("dsf-form-locked", locked);
      formInner.setAttribute("aria-hidden", locked ? "true" : "false");
      if (locked) {
        formInner.setAttribute("inert", "");
      } else {
        formInner.removeAttribute("inert");
      }
    }

    if (msgEl) {
      if (locked) {
        msgEl.textContent = "Coche toutes les cases pour accéder au formulaire.";
        msgEl.classList.remove("dsf-filter-msg--ok");
        msgEl.classList.add("dsf-filter-msg--err");
      } else {
        msgEl.textContent = "Parfait — tu peux remplir ta candidature.";
        msgEl.classList.remove("dsf-filter-msg--err");
        msgEl.classList.add("dsf-filter-msg--ok");
      }
    }

    if (unlockIcon) {
      unlockIcon.textContent = locked ? "🔒" : "🔓";
      unlockIcon.setAttribute("aria-label", locked ? "Formulaire verrouillé" : "Formulaire déverrouillé");
    }

    if (!locked && !sentAllChecked && window.DSF && window.DSF.analytics) {
      sentAllChecked = true;
      window.DSF.analytics.trackFilterAllChecked();
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var postuler = document.getElementById("postuler");
      if (postuler) {
        var top = postuler.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
      }
    }

    if (locked) {
      sentAllChecked = false;
    }
  }

  function onFilterChange(ev) {
    var t = ev.target;
    if (t && t.matches && t.matches(CHECK_SELECTOR) && window.DSF && window.DSF.analytics) {
      window.DSF.analytics.trackFilterCheckbox(t.name || "filter");
    }
    updateUI();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.classList.add("dsf-enhanced");
    formInner = document.getElementById("dsf-form-inner");
    filterInputs = Array.prototype.slice.call(document.querySelectorAll(CHECK_SELECTOR));
    countEl = document.getElementById("dsf-filter-count");
    msgEl = document.getElementById("dsf-filter-msg");
    unlockIcon = document.getElementById("dsf-unlock-icon");

    filterInputs.forEach(function (cb) {
      cb.addEventListener("change", onFilterChange);
    });

    if (formInner) {
      formInner.classList.add("dsf-form-locked");
      formInner.setAttribute("aria-hidden", "true");
    }
    updateUI();
  });
})();
