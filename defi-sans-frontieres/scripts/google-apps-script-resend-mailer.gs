/**
 * Défi Sans Frontières — candidatures : Resend si configuré, sinon Gmail (MailApp).
 * Clé Resend : Propriétés du script → RESEND_API_KEY, RESEND_FROM (optionnel).
 *
 * PREMIÈRE FOIS — autoriser Gmail :
 * 1. Dans l’éditeur : choisir la fonction authorizeMailScope → Exécuter
 * 2. Autoriser toutes les permissions demandées (envoi de courriel)
 * 3. Déployer → Gérer les déploiements → Modifier → Nouvelle version → Déployer
 */

/**
 * Exécuter une fois manuellement (bouton Exécuter) pour accorder script.send_mail.
 */
function authorizeMailScope() {
  var quota = MailApp.getRemainingDailyQuota();
  MailApp.sendEmail({
    to: CONFIG.to,
    subject: "[DSF] Test autorisation formulaire candidatures",
    body:
      "Si vous recevez ce message, le script peut envoyer les candidatures.\nQuota restant : " +
      quota,
  });
  return "Autorisation OK — quota Gmail restant : " + quota;
}

function doGet() {
  return ContentService.createTextOutput(
    "Endpoint candidatures DSF actif. Envoi via POST depuis le formulaire."
  ).setMimeType(ContentService.MimeType.TEXT);
}

var CONFIG = {
  to: "wenovsolutions@gmail.com",
  cc: [
    "ads@wenov.ca",
    "abenzakour@fondationsanteoutaouais.ca",
    "icarbonneau@fondationsanteoutaouais.ca",
    "jpigeon@fondationsanteoutaouais.ca",
  ],
  defaultSubject: "Candidature — Défi Sans Frontières Maroc 2026",
};

function doPost(e) {
  try {
    var data = parseBody_(e);
    if (data._honey && String(data._honey).trim()) {
      return json_({ success: false, message: "Spam detected" });
    }
    if (data.botcheck === "on" || data.botcheck === true) {
      return json_({ success: false, message: "Spam detected" });
    }

    var subject = data.subject || data._subject || CONFIG.defaultSubject;
    var replyTo = data.email || data.courriel || data.replyto || "";
    var textBody = formatBodyText_(data);
    var htmlBody = formatBodyHtml_(data);

    var props = PropertiesService.getScriptProperties();
    var resendKey = props.getProperty("RESEND_API_KEY");
    var resendFrom = props.getProperty("RESEND_FROM") || "";
    var resendOk =
      resendKey && resendFrom && !/onboarding@resend\.dev/i.test(resendFrom);

    var via = "gmail";
    if (resendOk) {
      try {
        sendViaResend_(subject, replyTo, htmlBody, textBody);
        via = "resend";
      } catch (err) {
        Logger.log("Resend échec, repli Gmail : " + err);
        sendViaGmail_(subject, replyTo, htmlBody, textBody);
      }
    } else {
      sendViaGmail_(subject, replyTo, htmlBody, textBody);
    }

    return json_({ success: true, via: via });
  } catch (err) {
    Logger.log("doPost erreur : " + err);
    var msg = String(err);
    if (/permission|authorization|script\.send_mail/i.test(msg)) {
      msg =
        "Autorisation Gmail manquante. Dans Apps Script : exécuter la fonction authorizeMailScope, accepter les permissions, puis redéployer l’application Web.";
    }
    return json_({ success: false, message: msg });
  }
}

function sendViaGmail_(subject, replyTo, htmlBody, textBody) {
  var opts = {
    to: CONFIG.to,
    cc: CONFIG.cc.join(","),
    subject: subject,
    htmlBody: htmlBody,
    /* Pas de body texte : évite que Gmail affiche la version brute au lieu du tableau HTML. */
    body: "Nouvelle candidature DSF — ouvrez ce message en HTML pour le tableau complet.",
  };
  if (replyTo) opts.replyTo = replyTo;
  MailApp.sendEmail(opts);
}

function sendViaResend_(subject, replyTo, html, text) {
  var key = PropertiesService.getScriptProperties().getProperty("RESEND_API_KEY");
  if (!key) {
    throw new Error("RESEND_API_KEY manquant");
  }

  var from =
    PropertiesService.getScriptProperties().getProperty("RESEND_FROM") ||
    "Défi Sans Frontières <onboarding@resend.dev>";

  var payload = {
    from: from,
    to: [CONFIG.to],
    cc: CONFIG.cc,
    subject: subject,
    html: html,
    text: text,
  };
  if (replyTo) payload.reply_to = replyTo;

  var res = UrlFetchApp.fetch("https://api.resend.com/emails", {
    method: "post",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  var code = res.getResponseCode();
  var body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error("Resend HTTP " + code + " — " + body);
  }
}

function parseBody_(e) {
  if (e.postData && e.postData.contents) {
    var type = (e.postData.type || "").toLowerCase();
    if (type.indexOf("application/json") !== -1) {
      return JSON.parse(e.postData.contents);
    }
  }
  return e.parameter || {};
}

/** Sections et libellés — style proche FormSubmit (_template=table). */
var EMAIL_SECTIONS = [
  {
    title: "Attribution & suivi",
    fields: [
      ["utm_source", "utm_source"],
      ["utm_medium", "utm_medium"],
      ["utm_campaign", "utm_campaign"],
      ["utm_content", "utm_content"],
      ["utm_term", "utm_term"],
      ["referrer", "referrer"],
      ["timestamp_submit", "timestamp_submit"],
    ],
  },
  {
    title: "Profil",
    fields: [
      ["nom_complet", "nom_complet"],
      ["age", "age"],
      ["ville", "ville"],
      ["courriel", "courriel"],
      ["telephone", "telephone"],
    ],
  },
  {
    title: "Motivation",
    fields: [
      ["motif_participation_maroc", "motif_participation_maroc"],
      ["cause_motivation", "cause_motivation"],
      ["defi_physique_passe", "defi_physique_passe"],
      ["distinction_candidat", "distinction_candidat"],
    ],
  },
  {
    title: "Physique & expérience",
    fields: [
      ["condition_physique", "condition_physique"],
      ["trek_expedition", "trek_expedition"],
      ["trek_expedition_precisions", "trek_expedition_precisions"],
      ["marche_multi_jours", "marche_multi_jours"],
      ["limitations_medicales", "limitations_medicales"],
    ],
  },
  {
    title: "Collecte de fonds",
    fields: [
      ["experience_levee_fonds", "experience_levee_fonds"],
      ["experience_levee_fonds_precisions", "experience_levee_fonds_precisions"],
      ["strategie_levee_fonds", "strategie_levee_fonds"],
    ],
  },
  {
    title: "Réseaux & vidéo",
    fields: [
      ["reseaux_sociaux", "reseaux_sociaux"],
      ["pret_zone_confort", "pret_zone_confort"],
      ["contraintes_selection", "contraintes_selection"],
      ["video_uploadcare", "video_uploadcare"],
      ["video_url", "video_url"],
    ],
  },
  {
    title: "Conditions préalables (filtres)",
    fields: [
      ["gate_age_majorite", "gate_age_majorite"],
      ["gate_engagement_10000", "gate_engagement_10000"],
      ["gate_casting_gatineau_mai2026", "gate_casting_gatineau_mai2026"],
      ["gate_voyage_maroc_oct_nov", "gate_voyage_maroc_oct_nov"],
      ["gate_tournage_juin_oct", "gate_tournage_juin_oct"],
      ["gate_image_documentaire_fso", "gate_image_documentaire_fso"],
      ["gate_declaration_medicale", "gate_declaration_medicale"],
      ["gate_frais_vaccins_assurance_materiel", "gate_frais_vaccins_assurance_materiel"],
      ["gate_acceptation_prealable_contrat", "gate_acceptation_prealable_contrat"],
      ["gate_consentement_reglements_renseignements_personnels", "gate_consentement_reglements_renseignements_personnels"],
    ],
  },
  {
    title: "Engagement final",
    fields: [
      ["confirm_infos_exactes", "confirm_infos_exactes"],
      ["confirm_exigences", "confirm_exigences"],
      ["confirm_engagement_complet", "confirm_engagement_complet"],
      ["consent_candidature", "consent_candidature"],
      ["consent_marketing", "consent_marketing"],
    ],
  },
];

var SKIP_FIELDS = {
  access_key: 1,
  botcheck: 1,
  _honey: 1,
  subject: 1,
  email: 1,
  replyto: 1,
};

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatFieldValue_(key, raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return "—";
  }
  var v = String(raw).trim();
  if (v === "on" || v === "oui") return "Oui";
  if (v === "off" || v === "non") return "Non";
  if (key.indexOf("video_") === 0 || key === "referrer" || /^https?:\/\//i.test(v)) {
    var safe = escapeHtml_(v);
    return '<a href="' + safe + '" style="color:#0a3d91">' + safe + "</a>";
  }
  return escapeHtml_(v).replace(/\n/g, "<br>");
}

function formatFieldValuePlain_(key, raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return "—";
  }
  var v = String(raw).trim();
  if (v === "on" || v === "oui") return "Oui";
  if (v === "off" || v === "non") return "Non";
  return v;
}

function collectUsedKeys_(data) {
  var used = {};
  Object.keys(data).forEach(function (k) {
    used[k] = true;
  });
  return used;
}

function buildTableRows_(data, used) {
  var rows = [];
  var tdLabel =
    'style="padding:10px 12px;border:1px solid #cccccc;background-color:#f4f4f4;font-weight:bold;vertical-align:top;width:32%;font-family:Arial,sans-serif;font-size:13px;"';
  var tdVal =
    'style="padding:10px 12px;border:1px solid #cccccc;vertical-align:top;background-color:#ffffff;font-family:Arial,sans-serif;font-size:13px;"';

  function addRow(label, key) {
    if (SKIP_FIELDS[key]) return;
    rows.push(
      "<tr><td " +
        tdLabel +
        ">" +
        escapeHtml_(label) +
        "</td><td " +
        tdVal +
        ">" +
        formatFieldValue_(key, data[key]) +
        "</td></tr>"
    );
    if (used) delete used[key];
  }

  EMAIL_SECTIONS.forEach(function (section) {
    section.fields.forEach(function (pair) {
      addRow(pair[1], pair[0]);
    });
  });

  if (used) {
    Object.keys(used)
      .sort()
      .forEach(function (key) {
        if (SKIP_FIELDS[key] || key.charAt(0) === "_") return;
        addRow(key, key);
      });
  }

  return rows;
}

/** Tableau unique style FormSubmit (_template=table), UTMs en tête. */
function formatBodyHtml_(data) {
  var used = collectUsedKeys_(data);
  var rows = buildTableRows_(data, used);
  var th =
    'style="padding:10px 12px;border:1px solid #cccccc;background-color:#0a3d91;color:#ffffff;text-align:left;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;"';

  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:16px;font-family:Arial,sans-serif;">' +
    '<p style="margin:0 0 12px;font-size:16px;color:#0a3d91;"><strong>Nouvelle candidature</strong> — Défi Sans Frontières Maroc 2026</p>' +
    '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:720px;border:1px solid #cccccc;">' +
    "<thead><tr><th " +
    th +
    ">Champ</th><th " +
    th +
    ">Réponse</th></tr></thead><tbody>" +
    rows.join("") +
    "</tbody></table>" +
    '<p style="margin:16px 0 0;font-size:11px;color:#888888;">fso.defisansfrontieres.ca</p>' +
    "</body></html>"
  );
}

function formatBodyText_(data) {
  return "Nouvelle candidature DSF — consultez la version HTML du courriel pour le tableau complet.";
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
