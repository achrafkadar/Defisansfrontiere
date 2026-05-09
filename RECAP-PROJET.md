# Défi Sans Frontières — Récapitulatif projet (landing)

Document de synthèse : fonctionnalités, analytics, URLs de prod, fichiers clés et décisions techniques.

---

## Domaine et déploiement

| Environnement | URL |
|-----------------|-----|
| **Production (FSO)** | `https://fso.defisansfrontieres.ca/` |
| Page merci | `https://fso.defisansfrontieres.ca/merci.html` |

**Important :** en production, le site est servi à la **racine** du sous-domaine, **pas** sous `/defi-sans-frontieres/`. Les chemins du type `…/defi-sans-frontieres/merci.html` renvoient **404** sur ce domaine.

Dans le dépôt Git, le code source vit dans **`defi-sans-frontieres/`** ; le déploiement copie ou expose le contenu à la racine du site public (`index.html`, `merci.html`, dossier `assets/`, etc.).

Fichiers alignés sur la prod :

- `defi-sans-frontieres/index.html` : `canonical`, meta `dsf-merci-page`, champ FormSubmit `_next` → `https://fso.defisansfrontieres.ca/merci.html`
- `index.html` (racine du repo) : redirection locale vers `defi-sans-frontieres/` + canonical prod

---

## Formulaire de candidature

- **Soumission :** FormSubmit → `https://formsubmit.co/wenovsolutions@gmail.com` (AJAX via `form-submit.js`, redirection vers `merci.html`).
- **Vidéo :** Uploadcare (clé dans meta `uploadcare-public-key`).
- **Gate :** 10 cases à cocher obligatoires avant déverrouillage du bloc formulaire (`form-gate.js`).
- **Consentement légal (case supplémentaire) :**  
  *« J'accepte les Règlements et je consens à la collecte de mes renseignements personnels. »*  
  Champ : `gate_consentement_reglements_renseignements_personnels`.

### Barre de progression (4 étapes)

- Bloc sticky sous le header (correction : `#postuler` en `overflow: visible` pour que `position: sticky` fonctionne malgré `.dsf-section { overflow: hidden }`).
- Étapes regroupées : 1 Profil & motivation, 2 Condition & collecte, 3 Réseaux & vidéo, 4 Engagement final.
- Script : `assets/js/form-progress.js` (scroll + focus/clic/saisie).
- Pastilles 1–4 visibles en permanence.

### Fichiers principaux

- `defi-sans-frontieres/index.html` — structure du formulaire et meta.
- `defi-sans-frontieres/assets/js/form-submit.js` — validation, `merciPageAbsoluteUrl()`, FormSubmit AJAX.
- `defi-sans-frontieres/assets/js/form-gate.js` — verrouillage.
- `defi-sans-frontieres/assets/js/form-progress.js` — progression.
- `defi-sans-frontieres/assets/css/main.css` — styles formulaire, merci, ambassadeur.

---

## Page merci (`merci.html`)

Deux fichiers selon l’arborescence déployée :

- `defi-sans-frontieres/merci.html` (chemins relatifs `assets/…`)
- `merci.html` à la racine du repo (chemins `defi-sans-frontieres/assets/…` si besoin)

### Contenu actuel

- Message de confirmation + prénom (via `sessionStorage` `dsf_merci_prenom`, défini à la soumission).
- **Prochaines étapes** (liste ordonnée) : analyse du dossier → courriel d’ici le 20 mai → annonce des 30 le 1er juin 2026.  
  **Retiré :** détail du casting (date, lieu La Basoche, 60 finalistes) et le paragraphe explicatif sur les UTMs dans les rapports.

### Partage « Invite un ami à postuler »

- Script : `assets/js/merci-share.js` — construit l’URL avec UTMs et `#filtres` à partir de l’URL courante (compatible GitHub Pages / sous-dossier / domaine custom).
- Bouton **Ouvrir la page du défi** : `target="_blank"`, href mis à jour par le script si besoin.
- **Copier le lien** / **Partager** (API native si dispo).

UTMs utilisés :

- `utm_source=referral`
- `utm_medium=share`
- `utm_campaign=defi_maroc_2026`
- `utm_content=merci_invite_friend`

---

## Analytics (GA4 + Meta + dataLayer)

Fichier : `defi-sans-frontieres/assets/js/analytics.js`

| Événement / signal | Détail |
|--------------------|--------|
| Clic CTA « postuler » (`header_postule`, `hero_postule`, `submit_form`) | GA : `postuler_click` ; Meta : **`InitiateCheckout`** + `PostulerClick` (custom) |
| Page `merci.html` chargée | `thank_you_page_view`, `generate_lead`, **`purchase`** (valeur symbolique CAD 1) ; Meta : `Lead`, **`Purchase`** — une fois par session (`dsf_purchase_tracked`) |
| Partage page merci | `merci_share` + param `share_method` : `open_link`, `copy_link`, `native_share` ; Meta custom `MerciShare` |

IDs (à adapter si besoin) : définis dans `analytics.js` (`GA_MEASUREMENT_ID`, `META_PIXEL_ID`).

---

## Email de confirmation automatique

- **Désactivé** : pas de champ FormSubmit `_autoresponse` — confirmations gérées manuellement par l’équipe.

---

## Chat en direct

- **Non implémenté** (annulé par le client) — possibilité future : Tawk.to, Crisp, etc.

---

## Intégration Google Sheets

- **Non retenu** — pas d’écriture automatique des candidatures dans le fichier de suivi.

---

## Médias — Stéphane

- Fichier : `defi-sans-frontieres/assets/img/stephane-portrait.jpg`
- **Optimisation :** image redimensionnée (~800 px de large, ~116 Ko) ; l’ancienne version ~4 Mo / 4251×3750 provoquait un chargement très lent.
- Fond de section `#stephane` référence `stephane-bg.jpg` (fichier optionnel ; placeholder si absent).

---

## WordPress (optionnel)

- `defi-sans-frontieres/wp-template/functions-additions.php` — enqueue des assets dont `form-progress.js`.
- Le markup peut être injecté depuis `index.html` via `dsf_render_landing_markup()`.

---

## Fichiers racine utiles

| Fichier | Rôle |
|---------|------|
| `index.html` | Redirection vers `defi-sans-frontieres/` en dev local / Pages |
| `merci.html` | Variante merci si site servi depuis la racine du repo |
| `CNAME` | `fso.defisansfrontieres.ca` (GitHub Pages custom domain) |
| `RECAP-PROJET.md` | Ce document |

---

## Historique des correctifs notables

1. **Liens merci / partage** : résolution relative au chemin courant ; suppression de la dépendance à un domaine erroné seul.
2. **Prod FSO** : URLs corrigées de `…/defi-sans-frontieres/…` vers la **racine** `fso.defisansfrontieres.ca` (éviter 404 après FormSubmit).
3. **Sticky barre formulaire** : `overflow: visible` sur `#postuler`.
4. **Progression étapes** : logique scroll + interaction pour éviter de rester bloqué sur l’étape 1.

---

*Dernière mise à jour : générée pour archivage projet — à faire évoluer si l’hébergement ou les URLs changent.*
