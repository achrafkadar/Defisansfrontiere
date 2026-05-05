/**
 * Compte à rebours jusqu'à la clôture des candidatures : dernier instant du 20 mai 2026 (heure locale).
 */
(function () {
  "use strict";

  /* 20 mai 2026, 23:59:59.999 — tout le journée du 20 mai est inclus ; pas de débordement sur le 21. */
  function endDate() {
    return new Date(2026, 4, 20, 23, 59, 59, 999);
  }

  function pad(n) {
    return n < 10 ? "0" + String(n) : String(n);
  }

  function tick() {
    var end = endDate();
    var now = new Date();
    var ms = end.getTime() - now.getTime();

    var elDays = document.getElementById("dsf-cd-days");
    var elHours = document.getElementById("dsf-cd-hours");
    var elMinutes = document.getElementById("dsf-cd-minutes");
    var elSeconds = document.getElementById("dsf-cd-seconds");
    var wrap = document.getElementById("dsf-countdown");

    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    if (ms <= 0) {
      elDays.textContent = "0";
      elHours.textContent = "0";
      elMinutes.textContent = "0";
      elSeconds.textContent = "0";
      if (wrap) wrap.classList.add("dsf-countdown--ended");
      return;
    }

    var totalSec = Math.floor(ms / 1000);
    var days = Math.floor(totalSec / 86400);
    var rem = totalSec % 86400;
    var hours = Math.floor(rem / 3600);
    rem %= 3600;
    var minutes = Math.floor(rem / 60);
    var seconds = rem % 60;

    elDays.textContent = String(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  document.addEventListener("DOMContentLoaded", function () {
    tick();
    setInterval(tick, 1000);
  });
})();
