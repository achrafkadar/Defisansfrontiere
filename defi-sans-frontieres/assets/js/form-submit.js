/**
 * Validation, compteurs de caractères, soumission vers FormSubmit (courriel ads@wenov.ca).
 * Sur WordPress avec WPForms, remplacer l’action du formulaire et retirer la logique FormSubmit.
 */
(function () {
  "use strict";

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

  function setFormSubmitNextUrl() {
    var next = document.getElementById("dsf-form-next");
    if (!next) return;
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("merci", "1");
      u.hash = "dsf-success";
      next.value = u.toString();
    } catch (e) {
      next.value =
        window.location.origin +
        window.location.pathname +
        (window.location.search ? window.location.search + "&" : "?") +
        "merci=1#dsf-success";
    }
  }

  function showSuccess(prenom) {
    var form = document.getElementById("dsf-candidature-form");
    var success = document.getElementById("dsf-success");
    if (!form || !success) return;
    form.style.display = "none";
    success.classList.add("is-visible");
    var nameSpan = success.querySelector("[data-dsf-success-name]");
    if (nameSpan) nameSpan.textContent = prenom || "toi";
    success.focus();
  }

  function tryShowSuccessFromRedirect() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get("merci") !== "1") return;
      var prenom = "";
      try {
        prenom = sessionStorage.getItem("dsf_merci_prenom") || "";
        sessionStorage.removeItem("dsf_merci_prenom");
      } catch (e) {}
      showSuccess(prenom.trim());
      if (history.replaceState) {
        var u = new URL(window.location.href);
        u.searchParams.delete("merci");
        history.replaceState({}, "", u.pathname + u.search + (u.hash || "#dsf-success"));
      }
    } catch (e2) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindCharCount("field_motivation", "count_motivation");
    bindCharCount("field_plan", "count_plan");

    var form = document.getElementById("dsf-candidature-form");
    if (!form) return;

    setFormSubmitNextUrl();
    tryShowSuccessFromRedirect();

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

      setTimestamp();
      setFormSubmitNextUrl();

      var courriel = document.getElementById("field_courriel");
      var replyto = document.getElementById("dsf-form-replyto");
      if (courriel && replyto) replyto.value = courriel.value.trim();

      var prenomEl = document.getElementById("field_prenom");
      try {
        sessionStorage.setItem("dsf_merci_prenom", (prenomEl && prenomEl.value ? prenomEl.value : "").trim());
      } catch (err) {}

      if (window.DSF && window.DSF.analytics) {
        window.DSF.analytics.trackFormSubmitSuccess();
      }

      var btn = document.getElementById("dsf-submit-btn");
      if (btn) btn.classList.add("is-loading");
      /* Pas de preventDefault : navigation POST vers FormSubmit puis _next */
    });
  });
})();
