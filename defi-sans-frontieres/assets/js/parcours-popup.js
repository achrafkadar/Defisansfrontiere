(function () {
  "use strict";

  var data = {
    jour1: {
      label: "Jours 1 et 2",
      title: "Marrakech et les premières montagnes",
      lead:
        "Vol vers Marrakech, puis le guide vous conduit au village d'Aït Ourir, au pied du Haut Atlas : première immersion entre montagnes et art de vivre local.",
      details: [
        "Vol de nuit pour Marrakech (selon programmation des vols).",
        "Transfert vers Aït Ourir : maison d'hôte construite en terre de façon traditionnelle.",
        "Temps libre pour se détendre au bord de la piscine et parcourir le jardin potager, avec vue sur les montagnes.",
        "Nuit en maison d'hôte."
      ]
    },
    jours2a5: {
      label: "Jours 3 à 7",
      title: "Approche du Saghro et trek volcanique",
      lead:
        "Traversée du Haut Atlas par le col du Tizi n'Tichka, puis entrée dans le massif du Saghro : paysages volcaniques, sentiers rocailleux, mules pour le matériel.",
      details: [
        "Jour 3 : transfert vers la vallée du Dadès (~6 h de route), arrêt déjeuner vers Ouarzazate ; à Aït Youl, l'équipe de muletiers attend — premier campement.",
        "Jours 4 à 7 : trek dans les montagnes volcaniques — mules pour vivres, affaires et matériel commun ; cols, villages dans les canyons, sortie par l'oued Afourar face aux aiguilles de Bab N'Ali.",
        "Sentiers sauvages et superbes, nuits en campement ; une nuit en gîte chez l'habitant en fin de trek.",
        "Niveau modéré : en moyenne 5 à 6 h de marche par jour dans le Saghro ; vous ne portez que votre sac de jour."
      ]
    },
    jour6: {
      label: "Jour 8",
      title: "De la vallée du Drâa aux dunes",
      lead:
        "Route vers le sud : l'oued Drâa dessine une coulée de verdure, ksours et oasis, jusqu'au campement au pied des dunes de Regabi Hniti.",
      details: [
        "Environ 4 h de route vers la vallée du Drâa : palmiers doum, ksours fortifiés, Zagora puis les dunes de Tidri.",
        "Découverte du reg : vaste plaine de cailloux, paysage de plus en plus désertique.",
        "Fin d'après-midi : courte marche vers un campement entre dunes et palmeraie ; possibilité de dormir à la belle étoile si la nuit est claire.",
        "Nuit en campement sous les étoiles."
      ]
    },
    jours7a11: {
      label: "Jours 9 à 12",
      title: "Trek saharien dans la vallée du Drâa",
      lead:
        "Immensité et solitude : hamada, palmeraies et kasbahs, nomades Aït Atta et Nouaji — logistique portée par les dromadaires.",
      details: [
        "Marche le long de la hamada du Drâa, palmeraies et kasbahs ; après le lit asséché de l'oued et les villages, l'éloignement du tourisme de masse.",
        "Nomades Aït Atta : hiver dans le Sud avant la transhumance vers le Haut Atlas ; grandes tentes en poils de chameau et de chèvre.",
        "Puis territoire des Nouaji — nuits au creux des dunes, dernières étapes vers Bounou et le campement d'Ouled Driss.",
        "Marches d'environ 4 à 6 h par jour ; randonnée chamelière — les dromadaires portent toute la logistique."
      ]
    },
    jour12: {
      label: "Jour 13",
      title: "Route vers Marrakech",
      lead:
        "Remontée vers Marrakech par Tamgroute : patrimoine et artisans, puis installation au cœur de la médina.",
      details: [
        "Route pour Marrakech en passant par Tamgroute.",
        "Visite possible de la bibliothèque coranique (manuscrits anciens ; fermée le samedi — entrée non incluse).",
        "Tamgroute est aussi réputée pour ses potiers.",
        "Arrivée à Marrakech en fin d'après-midi : installation en riad au cœur de la médina."
      ]
    },
    jour13: {
      label: "Jour 14",
      title: "Marrakech",
      lead:
        "Journée libre dans la « perle du Sud » : médina, souks et place Jemâa el-Fna — repas du midi à votre charge.",
      details: [
        "Journée libre à Marrakech pour explorer la médina à votre rythme.",
        "Repas du midi non inclus (comme au programme Karavaniers).",
        "La ville mêle patrimoine et modernité : souks, riads, fontaines et art de vivre marocain.",
        "Deux nuits en riad."
      ]
    },
    jour14: {
      label: "Jour 15",
      title: "Vol de retour",
      lead:
        "Transfert aéroport selon l'horaire du vol ; retour vers le Québec. L'itinéraire sur le terrain peut évoluer selon la météo, la sécurité ou de belles opportunités locales.",
      details: [
        "Transfert à l'aéroport en fonction de l'heure de décollage.",
        "Vol de retour vers le Québec.",
        "Rappel : rien n'est figé — imprévus ou découvertes peuvent adapter le parcours sous la responsabilité du guide."
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
      detailsEl.innerHTML = item.details
        .map(function (line) {
          return "<li>" + line + "</li>";
        })
        .join("");
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
