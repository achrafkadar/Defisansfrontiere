/**
 * Défi Sans Frontières — envoi candidatures par Gmail (gratuit).
 *
 * Installation (une fois) :
 * 1. https://script.google.com → Nouveau projet
 * 2. Coller ce fichier, enregistrer
 * 3. Déployer → Nouveau déploiement → Application Web
 *    - Exécuter en tant que : Moi
 *    - Qui peut accéder : Tous
 * 4. Copier l’URL se terminant par /exec
 * 5. La coller dans index.html → meta name="dsf-form-endpoint"
 */

var CONFIG = {
  to: "wenovsolutions@gmail.com",
  cc: "ads@wenov.ca,abenzakour@fondationsanteoutaouais.ca,icarbonneau@fondationsanteoutaouais.ca,jpigeon@fondationsanteoutaouais.ca",
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

    var body = formatBody_(data);
    var opts = {
      to: CONFIG.to,
      cc: CONFIG.cc,
      subject: subject,
      body: body,
    };
    if (replyTo) opts.replyTo = replyTo;

    MailApp.sendEmail(opts);
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, message: String(err) });
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

function formatBody_(data) {
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

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
