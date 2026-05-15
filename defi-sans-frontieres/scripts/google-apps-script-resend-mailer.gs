/**
 * Défi Sans Frontières — envoi candidatures via Resend (clé secrète côté serveur).
 *
 * NE JAMAIS coller la clé API Resend dans index.html ni sur GitHub.
 *
 * Installation :
 * 1. https://script.google.com → Nouveau projet → coller ce fichier
 * 2. Projet → Paramètres du projet → Propriétés du script → Ajouter :
 *    - RESEND_API_KEY  = ta clé (re_…)
 *    - RESEND_FROM     = ex. « Défi Sans Frontières <candidatures@defisansfrontieres.ca> »
 *      (domaine vérifié dans Resend ; sinon test : onboarding@resend.dev)
 * 3. Déployer → Application Web → Exécuter : Moi → Accès : Tous
 * 4. URL /exec → meta name="dsf-form-endpoint" dans index.html
 */

/** Ouverture de l’URL /exec dans le navigateur (GET) — le formulaire utilise doPost. */
function doGet() {
  return ContentService.createTextOutput(
    "Endpoint candidatures DSF actif. Les envois passent par POST depuis fso.defisansfrontieres.ca."
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

    sendViaResend_(subject, replyTo, htmlBody, textBody);
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, message: String(err) });
  }
}

function sendViaResend_(subject, replyTo, html, text) {
  var key = PropertiesService.getScriptProperties().getProperty("RESEND_API_KEY");
  if (!key) {
    throw new Error("RESEND_API_KEY manquant (Propriétés du script Google).");
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
  if (code < 200 || code >= 300) {
    throw new Error("Resend HTTP " + code + " — " + res.getContentText());
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

function formatBodyText_(data) {
  var skip = { access_key: 1, botcheck: 1, _honey: 1 };
  var lines = ["Nouvelle candidature — Défi Sans Frontières", ""];
  Object.keys(data)
    .sort()
    .forEach(function (key) {
      if (skip[key] || (key.charAt(0) === "_" && key !== "_subject")) return;
      var val = data[key];
      if (val === undefined || val === null || val === "") return;
      lines.push(key + ":\n" + val);
      lines.push("");
    });
  return lines.join("\n");
}

function formatBodyHtml_(data) {
  var skip = { access_key: 1, botcheck: 1, _honey: 1 };
  var rows = [];
  Object.keys(data)
    .sort()
    .forEach(function (key) {
      if (skip[key] || (key.charAt(0) === "_" && key !== "_subject")) return;
      var val = data[key];
      if (val === undefined || val === null || val === "") return;
      var safe = String(val)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      rows.push(
        "<tr><td style=\"padding:8px 12px;border:1px solid #ddd;font-weight:bold;vertical-align:top\">" +
          key +
          "</td><td style=\"padding:8px 12px;border:1px solid #ddd\">" +
          safe +
          "</td></tr>"
      );
    });
  return (
    "<h2 style=\"font-family:sans-serif\">Nouvelle candidature — Défi Sans Frontières</h2>" +
    "<table style=\"border-collapse:collapse;font-family:sans-serif;font-size:14px\">" +
    rows.join("") +
    "</table>"
  );
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
