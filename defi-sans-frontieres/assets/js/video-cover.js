/**
 * Remplace la cover vidéo par un iframe au clic.
 * Accepte une URL d’embed OU une URL YouTube/Vimeo « classique » (conversion automatique vers /embed/).
 */
(function () {
  "use strict";

  /**
   * youtube.com/watch et youtu.be ne fonctionnent pas en iframe — il faut /embed/VIDEO_ID.
   */
  function normalizeVideoEmbedUrl(url) {
    if (!url || url === "about:blank") return url;
    try {
      var u = new URL(url.trim());
      var host = u.hostname.replace(/^www\./, "").toLowerCase();

      if (host === "youtu.be") {
        var id = u.pathname.replace(/^\//, "").split("/")[0];
        if (id) {
          return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id.split("?")[0]);
        }
      }

      if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
        if (u.pathname === "/watch" || u.pathname.indexOf("/watch") === 0) {
          var v = u.searchParams.get("v");
          if (v) {
            return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v);
          }
        }
        if (u.pathname.indexOf("/shorts/") === 0) {
          var parts = u.pathname.split("/").filter(Boolean);
          var sid = parts[parts.indexOf("shorts") + 1];
          if (sid) {
            return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(sid.split("?")[0]);
          }
        }
        if (u.pathname.indexOf("/embed/") === 0) {
          var base = "https://www.youtube-nocookie.com" + u.pathname;
          return u.search ? base + u.search : base;
        }
      }

      if (host === "vimeo.com") {
        var segs = u.pathname.split("/").filter(Boolean);
        if (segs.length && /^\d+$/.test(segs[0])) {
          return "https://player.vimeo.com/video/" + segs[0];
        }
      }

      return url;
    } catch (e) {
      return url;
    }
  }

  function buildAutoplayUrl(url) {
    if (!url || url === "about:blank") return url;
    try {
      var u = new URL(url);
      if (!u.searchParams.get("autoplay")) u.searchParams.set("autoplay", "1");
      if (u.hostname.indexOf("youtube") !== -1 && !u.searchParams.get("rel")) {
        u.searchParams.set("rel", "0");
      }
      return u.toString();
    } catch (e) {
      return url;
    }
  }

  function initVideoCover() {
    var frame = document.querySelector(".dsf-video__frame--cover");
    var btn = document.getElementById("dsf-video-play");
    if (!frame || !btn) return;

    btn.addEventListener("click", function () {
      var raw = (frame.getAttribute("data-video-embed") || "").trim();
      var normalized = normalizeVideoEmbedUrl(raw);
      var embedUrl = buildAutoplayUrl(normalized);
      if (!embedUrl || embedUrl === "about:blank") return;

      var iframe = document.createElement("iframe");
      iframe.id = "dsf-video-iframe";
      iframe.title = frame.getAttribute("data-video-title") || "Vidéo de présentation";
      iframe.src = embedUrl;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.setAttribute("allowfullscreen", "");

      frame.innerHTML = "";
      frame.appendChild(iframe);

      if (window.DSF && window.DSF.analytics) {
        window.DSF.analytics.trackVideoPlay(false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initVideoCover);
})();
