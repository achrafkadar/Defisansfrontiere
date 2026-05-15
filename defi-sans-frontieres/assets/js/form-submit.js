/**
 * Validation, compteurs de caractères, soumission AJAX (Basin, Web3Forms JSON, FormSubmit legacy).
 */
(function () {
  "use strict";

  var LEGACY_STRIP = [
    "_template",
    "_captcha",
    "_next",
    "_replyto",
    "_cc",
    "_subject",
    "_honey",
    "redirect",
    "botcheck",
    "access_key",
  ];

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

  function formEndpointMeta() {
    var meta = document.querySelector('meta[name="dsf-form-endpoint"]');
    var v = meta && meta.getAttribute("content") ? meta.getAttribute("content").trim() : "";
    if (!v || /^YOUR_|^REPLACE/i.test(v)) return "";
    return v;
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

  function getSubmitUrl(form) {
    var fromMeta = formEndpointMeta();
    if (fromMeta) return resolveSubmitUrl(fromMeta);
    return resolveSubmitUrl(form.getAttribute("action") || "");
  }

  function isWeb3FormsUrl(url) {
    return url.indexOf("api.web3forms.com") !== -1;
  }

  function isBasinUrl(url) {
    return url.indexOf("usebasin.com") !== -1;
  }

  function assertNotSpam(form) {
    var honey = form.querySelector('input[name="_honey"]');
    if (honey && String(honey.value || "").trim()) {
      throw new Error("Soumission bloquée (anti-spam).");
    }
    var botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      throw new Error("Soumission bloquée (anti-spam).");
    }
  }

  function shouldSkipFieldName(name) {
    if (!name) return true;
    if (name.charAt(0) === "_") return true;
    return LEGACY_STRIP.indexOf(name) !== -1;
  }

  function buildWeb3FormsPayload(form) {
    var key = web3formsAccessKey();
    if (!key) {
      throw new Error(
        "Configuration formulaire incomplète. Utilise Basin (meta dsf-form-endpoint) ou une clé Web3Forms."
      );
    }

    assertNotSpam(form);

    var payload = {
      access_key: key,
      from_name: "Défi Sans Frontières — FSO",
    };

    var subjectEl = form.querySelector('input[name="_subject"]');
    if (subjectEl && subjectEl.value) {
      payload.subject = subjectEl.value;
    }

    var courriel = document.getElementById("field_courriel");
    var emailVal = courriel && courriel.value ? String(courriel.value).trim() : "";
    if (emailVal) {
      payload.email = emailVal;
      payload.replyto = emailVal;
    }

    form.querySelectorAll("input, textarea, select").forEach(function (el) {
      var name = el.name;
      if (shouldSkipFieldName(name)) return;
      if (el.type === "checkbox" || el.type === "radio") {
        if (!el.checked) return;
      }
      if (el.type === "file") return;
      if (el.disabled) return;
      var val = el.value;
      if (val === undefined || val === null) return;
      payload[name] = String(val);
    });

    return payload;
  }

  function prepareFormData(form, fd) {
    assertNotSpam(form);
    LEGACY_STRIP.forEach(function (name) {
      fd.delete(name);
    });
    return fd;
  }

  function parseSubmitSuccess(data, res) {
    if (data && data.error) {
      return { ok: false, message: String(data.error) };
    }
    if (data && (data.success === true || data.success === "true")) {
      return { ok: true };
    }
    if (res.ok && data && data.success !== false && data.success !== "false") {
      return { ok: true };
    }
    var msg = (data && data.message) || "Soumission impossible pour le moment.";
    if (/security reasons/i.test(msg)) {
      msg +=
        " Web3Forms bloque peut‑être ce domaine — configure Basin (voir meta dsf-form-endpoint) ou contacte web3forms.com/contact.";
    }
    return { ok: false, message: msg };
  }

  function sendForm(form, btn, thankYouUrl) {
    var endpoint = getSubmitUrl(form);

    if (isWeb3FormsUrl(endpoint)) {
      var payload = buildWeb3FormsPayload(form);
      return fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    var fd = prepareFormData(form, new FormData(form));
    return fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: fd,
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindCharCount("field_s2_pourquoi", "count_s2a");
    bindCharCount("field_s2_cause", "count_s2b");
    bindCharCount("field_s2_defi", "count_s2c");
    bindCharCount("field_s2_distinction", "count_s2d");
    bindCharCount("field_strategie_10k", "count_strategie");

    var form = document.getElementById("dsf-candidature-form");
    if (!form) return;

    var basinEndpoint = formEndpointMeta();
    if (basinEndpoint) {
      form.setAttribute("action", basinEndpoint);
    }

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
      var thankYouUrl = merciPageAbsoluteUrl();

      var fetchPromise;
      try {
        fetchPromise = sendForm(form, btn, thankYouUrl);
      } catch (prepErr) {
        if (btn) btn.classList.remove("is-loading");
        window.alert(prepErr.message || "Configuration du formulaire incomplète.");
        return;
      }

      fetchPromise
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
