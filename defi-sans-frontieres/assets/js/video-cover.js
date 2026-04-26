/**
 * Remplace la cover vidéo par un iframe au clic.
 */
(function () {
  "use strict";

  function buildAutoplayUrl(url) {
    if (!url || url === "about:blank") return url;
    try {
      var u = new URL(url);
      if (!u.searchParams.get("autoplay")) u.searchParams.set("autoplay", "1");
      if (!u.searchParams.get("rel")) u.searchParams.set("rel", "0");
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
      var embedUrl = buildAutoplayUrl(frame.getAttribute("data-video-embed") || "about:blank");
      if (!embedUrl || embedUrl === "about:blank") return;

      var iframe = document.createElement("iframe");
      iframe.id = "dsf-video-iframe";
      iframe.title = frame.getAttribute("data-video-title") || "Vidéo de présentation";
      iframe.src = embedUrl;
      iframe.loading = "lazy";
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
