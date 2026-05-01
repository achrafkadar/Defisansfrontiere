(function () {
  "use strict";

  var data = {
    jour1: {
      label: "Jour 1",
      title: "Arrivee au Maroc",
      lead: "Accueil de l'equipe, installation et premiere immersion pour lancer l'aventure dans de bonnes conditions.",
      details: [
        "Arrivee a l'aeroport et transfert vers l'hebergement.",
        "Brief securite et presentation du parcours complet.",
        "Verification du materiel de trek et des sacs.",
        "Soiree d'integration avec l'equipe de production."
      ]
    },
    jours2a5: {
      label: "Jours 2 a 5",
      title: "Trek du Saghro",
      lead: "Une sequence exigeante et magnifique dans le massif volcanique du Saghro, entre roches, reliefs et villages berberes.",
      details: [
        "Etapes quotidiennes avec denivele progressif et adaptation au rythme du groupe.",
        "Passage dans des paysages mineraux et zones culturelles berberes.",
        "Nuits en bivouac/gite avec debrief de la journee.",
        "Captation documentaire sur l'effort, l'entraide et le depassement."
      ]
    },
    jour6: {
      label: "Jour 6",
      title: "Transition vers le desert",
      lead: "Journee de liaison pour entrer dans l'ambiance saharienne et preparer le second chapitre du parcours.",
      details: [
        "Route panoramique vers le sud marocain.",
        "Pause recuperation et hydratation renforcee.",
        "Reorganisation logistique pour la partie desert.",
        "Brief de nuit sur les conditions du Sahara."
      ]
    },
    jours7a11: {
      label: "Jours 7 a 11",
      title: "Trek saharien",
      lead: "Le coeur de l'experience: dunes, silence, bivouacs et cohesion totale du groupe dans la vallee du Draa.",
      details: [
        "Marche encadree avec gestion de l'effort sur sable et pistes.",
        "Bivouacs sous tente et vie collective dans le desert.",
        "Captations au lever/coucher du soleil pour le documentaire.",
        "Moments forts d'introspection et d'esprit d'equipe."
      ]
    },
    jour12: {
      label: "Jour 12",
      title: "Retour vers Marrakech",
      lead: "Sortie progressive du desert et retour vers la ville rouge pour cloturer la partie trek.",
      details: [
        "Derniere etape du parcours terrain.",
        "Transfert retour avec haltes panoramiques.",
        "Recuperation active et suivi du groupe.",
        "Preparation de la conclusion du documentaire."
      ]
    },
    jour13: {
      label: "Jour 13",
      title: "Marrakech",
      lead: "Journee de respiration: celebration, bilans individuels et images finales en contexte urbain.",
      details: [
        "Temps libre encadre et decouverte de la medina.",
        "Entretiens camera de fin d'aventure.",
        "Soiree de cloture avec l'equipe.",
        "Mise en perspective de l'impact pour la cause."
      ]
    },
    jour14: {
      label: "Jour 14",
      title: "Retour",
      lead: "Derniere journee du defi: depart, souvenirs et retour avec une transformation personnelle durable.",
      details: [
        "Checkout et transfert aeroport.",
        "Retour vers le Canada.",
        "Debut du suivi post-aventure par l'equipe FSO.",
        "Suite du projet documentaire et communications."
      ]
    }
  };

  function init() {
    var modal = document.getElementById("dsf-parcours-modal");
    if (!modal) return;

    var titleEl = document.getElementById("dsf-parcours-modal-title");
    var labelEl = document.getElementById("dsf-parcours-modal-label");
    var leadEl = document.getElementById("dsf-parcours-modal-lead");
    var detailsEl = document.getElementById("dsf-parcours-modal-details");
    var closeBtn = modal.querySelector("[data-parcours-close]");
    var triggers = document.querySelectorAll(".dsf-phase[data-parcours-key]");
    var activeTrigger = null;

    function fillModal(key) {
      var item = data[key];
      if (!item) return false;
      titleEl.textContent = item.title;
      labelEl.textContent = item.label;
      leadEl.textContent = item.lead;
      detailsEl.innerHTML = item.details.map(function (line) {
        return "<li>" + line + "</li>";
      }).join("");
      return true;
    }

    function openModal(trigger) {
      var key = trigger.getAttribute("data-parcours-key");
      if (!fillModal(key)) return;
      activeTrigger = trigger;
      if (typeof modal.showModal === "function") {
        modal.showModal();
      } else {
        modal.setAttribute("open", "");
      }
    }

    function closeModal() {
      if (typeof modal.close === "function") {
        modal.close();
      } else {
        modal.removeAttribute("open");
      }
      if (activeTrigger && typeof activeTrigger.focus === "function") {
        activeTrigger.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openModal(trigger);
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        openModal(trigger);
      });
    });

    closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", function (e) {
      var rect = modal.getBoundingClientRect();
      var isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) closeModal();
    });

    modal.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();

