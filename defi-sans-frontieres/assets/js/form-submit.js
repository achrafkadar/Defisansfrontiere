/**
 * Validation, compteurs de caractères, soumission (fallback démo front-end).
 * TODO FSO : brancher l’action réelle WPForms / endpoint serveur — ne pas conserver le mode démo en prod.
 */
(function () {
  "use strict";

  var DEMO_MODE = true;

  function bindCharCount(textareaId, outId) {
    var ta = document.getElementById(textareaId);
    var out = document.getElementById(outId);
    if (!ta || !out) return;
    function refresh() {
      out.textContent = String(ta.value.length);
    }
    ta.addEventListener("input", refresh);
    refresh();
  }

  function setFieldError(input, message) {
    var id = input.getAttribute("aria-describedby");
    var help = id ? document.getElementById(id) : null;
    input.classList.toggle("dsf-input-invalid", !!message);
    if (help) help.textContent = message || "";
  }

  function validateField(input) {
    if (!input) return true;
    if (input.hasAttribute("required") && !input.value.trim()) {
      setFieldError(input, "Champ obligatoire.");
      if (window.DSF && window.DSF.analytics) {
        window.DSF.analytics.trackFormError("required_" + (input.name || input.id));
      }
      return false;
    }
    if (input.type === "email" && input.value) {
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      if (!ok) {
        setFieldError(input, "Courriel invalide.");
        return false;
      }
    }
    if (input.type === "url" && input.value) {
      try {
        new URL(input.value);
      } catch (e) {
        setFieldError(input, "URL invalide.");
        return false;
      }
    }
    setFieldError(input, "");
    return true;
  }

  function bindBlurValidation(form) {
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("blur", function () {
        if (el.type === "checkbox") return;
        validateField(el);
      });
    });
  }

  function setTimestamp() {
    var el = document.getElementById("hidden_timestamp");
    if (el) el.value = new Date().toISOString();
  }

  function showSuccess(prenom) {
    var form = document.getElementById("dsf-candidature-form");
    var success = document.getElementById("dsf-success");
    if (!form || !success) return;
    form.style.display = "none";
    success.classList.add("is-visible");
    success.querySelector("[data-dsf-success-name]").textContent = prenom || "toi";
    success.focus();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindCharCount("field_motivation", "count_motivation");
    bindCharCount("field_plan", "count_plan");

    var form = document.getElementById("dsf-candidature-form");
    if (!form) return;

    bindBlurValidation(form);

    form.addEventListener("submit", function (e) {
      var inner = document.getElementById("dsf-form-inner");
      if (inner && inner.classList.contains("dsf-form-locked")) {
        e.preventDefault();
        if (window.DSF && window.DSF.analytics) {
          window.DSF.analytics.trackFormError("form_locked");
        }
        return;
      }

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        e.preventDefault();
        if (window.DSF && window.DSF.analytics) {
          window.DSF.analytics.trackFormError("reportValidity");
        }
        return;
      }

      if (!DEMO_MODE) {
        setTimestamp();
        return;
      }

      e.preventDefault();
      setTimestamp();

      var btn = document.getElementById("dsf-submit-btn");
      if (btn) {
        btn.classList.add("is-loading");
        btn.setAttribute("disabled", "disabled");
      }

      window.setTimeout(function () {
        if (btn) {
          btn.classList.remove("is-loading");
          btn.removeAttribute("disabled");
        }
        var prenom = (document.getElementById("field_prenom") || {}).value || "";
        if (window.DSF && window.DSF.analytics) {
          window.DSF.analytics.trackFormSubmitSuccess();
        }
        showSuccess(prenom.trim());
      }, 650);
    });
  });
})();
