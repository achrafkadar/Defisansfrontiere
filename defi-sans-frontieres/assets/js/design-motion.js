/**
 * Effets UX/UI dynamiques:
 * - reveal au scroll (IntersectionObserver)
 * - parallax subtil du hero
 * - tilt léger des cards desktop
 * Respecte prefers-reduced-motion.
 */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    if (reducedMotion) return;
    var targets = document.querySelectorAll(
      ".dsf-section__title, .dsf-section__lead, .dsf-card, .dsf-phase, .dsf-box, .dsf-faq-item"
    );
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.classList.add("dsf-reveal");
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initHeroParallax() {
    if (reducedMotion) return;
    var hero = document.querySelector(".dsf-hero");
    var bg = document.querySelector(".dsf-hero__bg");
    if (!hero || !bg) return;

    function update() {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      var progress = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
      var y = Math.round(progress * -22);
      bg.style.transform = "translate3d(0," + y + "px,0) scale(1.03)";
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initCardTilt() {
    if (reducedMotion) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    var cards = document.querySelectorAll(".dsf-card");
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * 5;
        var ry = (px - 0.5) * 7;
        card.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initHeroParallax();
    initCardTilt();
  });
})();

