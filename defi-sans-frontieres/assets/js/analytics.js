/**
 * Analytics — GA4 (gtag) + pixel Meta + UTMs (localStorage 30 jours).
 * TODO FSO : remplacer les IDs factices. Ne jamais journaliser de données personnelles.
 */
(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-YB8V8LS6YD";
  var META_PIXEL_ID = "1569680114265654";

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var STORAGE_KEY = "dsf_utm_params";
  var STORAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  function safeDataLayer(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function loadGtag() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("XXXX") !== -1) {
      return;
    }
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
  }

  function loadMetaPixel() {
    if (!META_PIXEL_ID || META_PIXEL_ID.indexOf("XXXX") !== -1) {
      return;
    }
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function readUtmsFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var out = {};
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) out[k] = v;
    });
    return out;
  }

  function persistUtms() {
    try {
      var fromUrl = readUtmsFromUrl();
      var raw = localStorage.getItem(STORAGE_KEY);
      var stored = raw ? JSON.parse(raw) : null;
      var now = Date.now();
      var merged = {};

      if (stored && stored.expires > now && stored.values) {
        merged = Object.assign({}, stored.values);
      }
      Object.keys(fromUrl).forEach(function (k) {
        merged[k] = fromUrl[k];
      });

      if (Object.keys(merged).length) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ expires: now + STORAGE_TTL_MS, values: merged })
        );
      }
      return merged;
    } catch (e) {
      return readUtmsFromUrl();
    }
  }

  function applyUtmsToForm() {
    var merged = persistUtms();
    UTM_KEYS.forEach(function (k) {
      var el = document.getElementById("hidden_" + k);
      if (el && merged[k]) el.value = merged[k];
    });
    var ref = document.getElementById("hidden_referrer");
    if (ref && document.referrer) ref.value = document.referrer;
  }

  function trackScrollDepth() {
    var marks = { 25: false, 50: false, 75: false, 100: false };
    var doc = document.documentElement;

    function onScroll() {
      var h = doc.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var p = (window.scrollY / h) * 100;
      [25, 50, 75, 100].forEach(function (thr) {
        if (!marks[thr] && p >= thr) {
          marks[thr] = true;
          safeDataLayer({ event: "scroll_depth", depth_percent: thr });
          if (window.gtag) {
            window.gtag("event", "scroll", { percent_scrolled: String(thr) });
          }
          if (thr >= 50 && window.fbq) {
            window.fbq("track", "ViewContent", { content_name: "dsf_landing_scroll_50" });
          }
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function bindCtaTracking() {
    document.querySelectorAll("[data-dsf-cta]").forEach(function (el) {
      el.addEventListener("click", function () {
        var label = el.getAttribute("data-dsf-cta") || "cta";
        safeDataLayer({ event: "cta_click", button_label: label });
        if (window.gtag) {
          window.gtag("event", "cta_click", { button_label: label });
        }
        if (window.fbq) {
          window.fbq("trackCustom", "CTAClick", { button_label: label });
        }
        if (
          label === "header_postule" ||
          label === "hero_postule" ||
          label === "submit_form"
        ) {
          safeDataLayer({ event: "postuler_click", button_label: label });
          if (window.gtag) {
            window.gtag("event", "postuler_click", { button_label: label });
          }
          if (window.fbq) {
            window.fbq("track", "InitiateCheckout");
            window.fbq("trackCustom", "PostulerClick", { button_label: label });
          }
        }
      });
    });
  }

  function trackThankYouPageView() {
    var p = (window.location.pathname || "").toLowerCase();
    if (p.indexOf("merci.html") === -1) return;

    safeDataLayer({ event: "thank_you_page_view" });
    if (window.gtag) {
      window.gtag("event", "thank_you_page_view");
      window.gtag("event", "generate_lead", { form_id: "dsf_maroc_2026" });
    }
    if (window.fbq) {
      window.fbq("track", "Lead");
    }
  }

  function trackFilterCheckbox(name) {
    safeDataLayer({ event: "filter_checkbox_check", checkbox_name: name });
    if (window.gtag) {
      window.gtag("event", "filter_checkbox_check", { checkbox_name: name });
    }
  }

  function trackFilterAllChecked() {
    safeDataLayer({ event: "filter_all_checked" });
    if (window.gtag) {
      window.gtag("event", "filter_all_checked");
    }
  }

  function trackFormStart() {
    var started = false;
    var form = document.getElementById("dsf-candidature-form");
    if (!form) return;
    form.addEventListener(
      "focusin",
      function (e) {
        if (started) return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          started = true;
          safeDataLayer({ event: "form_start" });
          if (window.gtag) window.gtag("event", "form_start");
        }
      },
      true
    );
  }

  function trackFormSubmitSuccess() {
    safeDataLayer({ event: "form_submit", form_id: "dsf_maroc_2026" });
    if (window.gtag) {
      window.gtag("event", "generate_lead", { form_id: "dsf_maroc_2026" });
    }
    if (window.fbq) {
      window.fbq("track", "Lead");
    }
  }

  function trackFormError(reason) {
    safeDataLayer({ event: "form_error", reason: reason });
    if (window.gtag) {
      window.gtag("event", "form_error", { reason: reason });
    }
  }

  function trackVideoPlay(isComplete) {
    if (isComplete) {
      safeDataLayer({ event: "video_complete" });
      if (window.gtag) window.gtag("event", "video_complete");
    } else {
      safeDataLayer({ event: "video_play" });
      if (window.gtag) window.gtag("event", "video_start");
    }
  }

  window.DSF = window.DSF || {};
  window.DSF.analytics = {
    init: function () {
      loadGtag();
      loadMetaPixel();
      applyUtmsToForm();
      trackScrollDepth();
      bindCtaTracking();
      trackFormStart();
      trackThankYouPageView();
    },
    trackFilterCheckbox: trackFilterCheckbox,
    trackFilterAllChecked: trackFilterAllChecked,
    trackFormSubmitSuccess: trackFormSubmitSuccess,
    trackFormError: trackFormError,
    trackVideoPlay: trackVideoPlay,
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.DSF.analytics.init();
  });
})();
