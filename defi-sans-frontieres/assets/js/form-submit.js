/**
 * Validation, compteurs de caractères, soumission AJAX (Web3Forms ou legacy FormSubmit).
 * Sur WordPress avec WPForms, remplacer l’action du formulaire et retirer cette logique.
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

  function web3formsAccessKey() {
    var meta = document.querySelector('meta[name="web3forms-access-key"]');
    var k = meta && meta.getAttribute("content") ? meta.getAttribute("content").trim() : "";
    if (!k || /^YOUR_|^REPLACE/i.test(k)) return "";
    return k;
  }

  function resolveSubmitUrl(actionUrl) {
    if (!actionUrl) return "";
    try {
      var u = new URL(actionUrl, window.location.href);
      if (u.hostname === "formsubmit.co") {
        if (u.pathname.indexOf("/ajax/") === 0) return u.toString();
        u.pathname = "/ajax" + (u.pathname.charAt(0) === "/" ? u.pathname : "/" + u.pathname);
        return u.toString();
      }
      return u.toString();
    } catch (e) {
      if (
        actionUrl.indexOf("https://formsubmit.co/") === 0 &&
        actionUrl.indexOf("https://formsubmit.co/ajax/") !== 0
      ) {
        return actionUrl.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");
      }
      return actionUrl;
    }
  }

  function isWeb3FormsUrl(url) {
    return url.indexOf("api.web3forms.com") !== -1;
  }

  function prepareFormData(form, fd) {
    var action = resolveSubmitUrl(form.getAttribute("action") || "");
    if (!isWeb3FormsUrl(action)) return fd;

    var key = web3formsAccessKey();
    if (!key) {
      throw new Error(
        "Clé Web3Forms manquante. Ajoute ta access key dans la meta web3forms-access-key (voir web3forms.com)."
      );
    }

    if (!fd.has("access_key")) fd.append("access_key", key);

    var courriel = document.getElementById("field_courriel");
    var emailVal = courriel && courriel.value ? String(courriel.value).trim() : "";
    if (emailVal) {
      if (!fd.has("email")) fd.append("email", emailVal);
      if (!fd.has("replyto")) fd.append("replyto", emailVal);
    }

    var subjectEl = form.querySelector('input[name="_subject"]');
    if (subjectEl && subjectEl.value && !fd.has("subject")) {
      fd.append("subject", subjectEl.value);
    }

    var ccEl = form.querySelector('input[name="_cc"]');
    if (ccEl && ccEl.value && !fd.has("ccemail")) {
      fd.append(
        "ccemail",
        String(ccEl.value)
          .split(/[,;]/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
          .join(";")
      );
    }

    if (!fd.has("botcheck")) {
      fd.append("botcheck", "");
    }

    return fd;
  }

  function parseSubmitSuccess(data, res) {
    if (data && data.error) {
      return { ok: false, message: String(data.error) };
    }
    if (data && (data.success === true || data.success === "true")) {
      return { ok: true };
    }
    if (res.ok && data && !data.error && data.success !== false && data.success !== "false") {
      return { ok: true };
    }
    return {
      ok: false,
      message: (data && data.message) || "Soumission impossible pour le moment.",
    };
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
      e.preventDefault();
      var inner = document.getElementById("dsf-form-inner");
      if (inner && inner.classList.contains("dsf-form-locked")) {
        if (window.DSF && window.DSF.analytics) {
          window.DSF.analytics.trackFormError("form_locked");
        }
        return;
      }

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        if (window.DSF && window.DSF.analytics) {
          window.DSF.analytics.trackFormError("reportValidity");
        }
        return;
      }

      var vu = document.getElementById("field_video_url");
      if (vu && !validateField(vu)) {
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

      var btn = document.getElementById("dsf-submit-btn");
      if (btn) btn.classList.add("is-loading");
      var ajaxAction = resolveSubmitUrl(form.getAttribute("action") || "");
      var thankYouUrl = merciPageAbsoluteUrl();
      var fd;

      try {
        fd = prepareFormData(form, new FormData(form));
      } catch (prepErr) {
        if (btn) btn.classList.remove("is-loading");
        window.alert(prepErr.message || "Configuration du formulaire incomplète.");
        return;
      }

      fetch(ajaxAction, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      })
        .then(function (res) {
          return res.json().catch(function () {
            return { success: "false", message: "Réponse invalide du service d’envoi." };
          }).then(function (data) {
            return { res: res, data: data };
          });
        })
        .then(function (payload) {
          var parsed = parseSubmitSuccess(payload.data, payload.res);
          if (!parsed.ok) {
            throw new Error(parsed.message);
          }
          if (window.DSF && window.DSF.analytics) {
            window.DSF.analytics.trackFormSubmitSuccess();
          }
          window.location.href = thankYouUrl || "merci.html";
        })
        .catch(function (err) {
          if (btn) btn.classList.remove("is-loading");
          if (window.DSF && window.DSF.analytics) {
            window.DSF.analytics.trackFormError("ajax_submit_failed");
          }
          window.alert(
            "La soumission a échoué (" +
              (err && err.message ? err.message : "erreur inconnue") +
              "). Merci de réessayer."
          );
        });
    });
  });
})();
