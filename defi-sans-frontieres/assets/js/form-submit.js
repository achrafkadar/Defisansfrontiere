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

  /**
   * URL absolue de merci.html.
   * Priorité : même origine que la page actuelle (évite les surprises inter-domaines),
   * puis fallback meta `dsf-merci-page`.
   */
  function merciPageAbsoluteUrl() {
    var meta = document.querySelector('meta[name="dsf-merci-page"]');
    var fromMeta = meta && meta.getAttribute("content") ? meta.getAttribute("content").trim() : "";
    var host = window.location.hostname || "";
    var isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      window.location.protocol === "file:";

    try {
      var u = new URL(window.location.href);
      var p = u.pathname;
      if (p.endsWith("/")) {
        u.pathname = p + "merci.html";
      } else if (/\.html?$/i.test(p)) {
        u.pathname = p.replace(/[^/]+$/, "merci.html");
      } else {
        u.pathname = (p.endsWith("/") ? p : p + "/") + "merci.html";
      }
      u.search = "";
      u.hash = "";
      var out = u.toString();
      if (/^https?:\/\//i.test(out)) return out;
    } catch (e) {}

    if (fromMeta && /^https?:\/\//i.test(fromMeta) && !isLocal) return fromMeta;
    try {
      return new URL("merci.html", window.location.href).href;
    } catch (e2) {
      return fromMeta || "";
    }
  }

  function setFormSubmitNextUrl() {
    var next = document.getElementById("dsf-form-next");
    if (!next) return;
    var url = merciPageAbsoluteUrl();
    if (url) next.value = url;
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindCharCount("field_s2_pourquoi", "count_s2a");
    bindCharCount("field_s2_cause", "count_s2b");
    bindCharCount("field_s2_defi", "count_s2c");
    bindCharCount("field_s2_distinction", "count_s2d");
    bindCharCount("field_strategie_10k", "count_strategie");

    var form = document.getElementById("dsf-candidature-form");
    if (!form) return;

    setFormSubmitNextUrl();

    bindBlurValidation(form);

    var videoChosenEl = document.getElementById("video_file_chosen");
    var uploadcareInput = document.getElementById("field_uploadcare");
    if (uploadcareInput && videoChosenEl) {
      uploadcareInput.addEventListener("change", function () {
        var v = uploadcareInput.value ? String(uploadcareInput.value).trim() : "";
        videoChosenEl.textContent = v ? "Vidéo enregistrée : " + v : "";
      });
    }

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

      var vu = document.getElementById("field_video_url");
      if (vu && !validateField(vu)) {
        e.preventDefault();
        return;
      }

      setTimestamp();
      setFormSubmitNextUrl();

      var courriel = document.getElementById("field_courriel");
      var replyto = document.getElementById("dsf-form-replyto");
      if (courriel && replyto) replyto.value = courriel.value.trim();

      var nomCompletEl = document.getElementById("field_nom_complet");
      var prenomFromComplet = "";
      if (nomCompletEl && nomCompletEl.value) {
        var parts = String(nomCompletEl.value).trim().split(/\s+/);
        prenomFromComplet = parts.length ? parts[0] : "";
      }
      try {
        sessionStorage.setItem("dsf_merci_prenom", prenomFromComplet);
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
