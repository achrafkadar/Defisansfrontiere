# Défi Sans Frontières — Landing recrutement (FSO)

Livrable **production-ready** : page statique testable localement + gabarits WordPress + courriel HTML.

## Structure

```
defi-sans-frontieres/
├── index.html
├── assets/css/{variables.css,main.css}
├── assets/js/{analytics.js,smooth-scroll.js,form-gate.js,form-submit.js}
├── assets/img/          # Placeholders — remplacer par visuels finaux / brand book
├── wp-template/         # À copier dans le thème enfant FSO
├── email-templates/
└── README.md
```

## Test local

```bash
cd defi-sans-frontieres
python3 -m http.server 8080
```

Ouvre `http://localhost:8080` — les chemins relatifs `assets/...` fonctionnent depuis ce dossier.

## Intégration WordPress (thème enfant)

1. Copie **tout le dossier** `defi-sans-frontieres/` dans le répertoire du thème enfant (ex. `wp-content/themes/fso-enfant/defi-sans-frontieres/`).
2. Copie `wp-template/page-defi-sans-frontieres.php` à la **racine du thème enfant** sous le nom `page-defi-sans-frontieres.php` (WordPress charge `page-{slug}.php` pour la page dont le permalien est `defi-sans-frontieres`).
3. Dans `functions.php` du thème enfant, ajoute :

```php
require_once get_stylesheet_directory() . '/defi-sans-frontieres/wp-template/functions-additions.php';
```

4. Crée une page WP avec le slug **`defi-sans-frontieres`**, sans modèle personnalisé si tu utilises `page-defi-sans-frontieres.php` à la racine.
5. **WPForms** : deux approches courantes — (a) remplacer dans `index.html` le bloc `<form id="dsf-candidature-form">…</form>` par le shortcode WPForms en conservant les filtres `#filtres` au-dessus ; (b) ou laisser le HTML et poster via hook `wpforms_process_complete` (plus technique). Les champs cachés UTM doivent être mappés dans WPForms.
6. **Gravity Forms** : lis les notes en tête de `wp-template/page-defi-sans-frontieres-gravity.php` (éviter le double formulaire). Copie le fichier à la racine du thème enfant seulement si tu utilises le **Template Name** dans l’éditeur de page.

### Shortcodes de secours

- `[dsf_hero_cta]` — lien « Je postule » vers `#filtres` (contenu minimal injectable dans une page existante).
- `[dsf_assets_notice]` — rappel admin : vérifier que les assets sont enqueued (debug).

## Fichiers à configurer avant prod

| Élément | Fichier / zone |
|--------|----------------|
| ID GA4 | `assets/js/analytics.js` — `GA_MEASUREMENT_ID` |
| Pixel Meta | `assets/js/analytics.js` — `META_PIXEL_ID` |
| URL embed vidéo Stéphane | `index.html` + templates PHP — `iframe` section vidéo |
| Logo FSO, photo Stéphane | `assets/img/` + chemins dans HTML/PHP |
| Objet / expéditeur courriel | Outil d’envoi (WPForms notifications) + `email-templates/confirmation-soumission.html` comme gabarit visuel |
| Lien dépôt vidéo | Courriel + textes « À CONFIRMER » |
| Lieu casting exact | FAQ + courriel — balises `<!-- À VALIDER CLIENT -->` |

## Checklist QA (synthèse)

### Performance

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Lighthouse SEO ≥ 95
- [ ] Temps de chargement &lt; 2 s en 4G simulé
- [ ] Images WebP + fallback JPG
- [ ] Vidéos `loading="lazy"` + poster

### Responsive

- [ ] iPhone SE (375 px), iPhone 14 (390 px), Pixel 7 (412 px)
- [ ] iPad 768 px, iPad Pro 1024 px
- [ ] Bureau 1440 px et 1920 px

### Accessibilité

- [ ] Tab / Entrée / Échap (accordéon)
- [ ] Focus visible partout
- [ ] Contrastes AA (AAA pour CTA / titres clés si possible)
- [ ] Alt sur toutes les images
- [ ] ARIA sur filtres, formulaire, accordéon
- [ ] VoiceOver / TalkBack
- [ ] `prefers-reduced-motion` sur animations (pulse halo, etc.)

### Formulaire

- [ ] Soumission impossible sans les 8 engagements (HTML `required` + gate JS)
- [ ] Validation blur / temps réel
- [ ] Messages d’erreur en français québécois
- [ ] Écran de confirmation après succès
- [ ] Courriel auto &lt; 1 min (côté serveur / WPForms)
- [ ] UTM présents dans la soumission + persistance 30 jours

### Tracking

- [ ] GA4 DebugView : tous les events listés dans `analytics.js`
- [ ] Meta Events Manager : PageView, ViewContent, Lead
- [ ] Tous les CTA avec `data-dsf-cta`

### Légal

- [ ] Mentions + politique + accessibilité (URLs FSO finales)
- [ ] Consentement candidature ≠ opt-in marketing
- [ ] Numéro d’organisme 10758 8477 RR0001 affiché

### Contenu & marque

- [ ] Français québécois (pas « week-end », etc.)
- [ ] Lever tous les `<!-- À VALIDER CLIENT -->`
- [ ] Tokens CSS = brand book
- [ ] Badge Défi Maroc + slogans hero + section FSO

### Domaine

- [ ] `fso.defisansfrontieres.ca` → landing `/defi-sans-frontieres/`
- [ ] Redirections obsolètes retirées (Patrick Sinsen)
- [ ] HTTPS + choix www cohérent avec le site FSO

---

## PROCHAINES ÉTAPES (de ce livrable à la prod)

1. **Valider** tous les textes marqués `À VALIDER CLIENT` avec la com FSO et Stéphane (nom complet, lieu casting, montants hors forfait).
2. **Intégrer** logo officiel, badge « Défi Maroc », photo Stéphane et visuel OG 1200×630 dans `assets/img/` (compresser en WebP).
3. **Coller** l’URL finale de la vidéo Wenov dans l’`iframe` (section 2).
4. **Créer** le formulaire WPForms (ou Gravity) avec les mêmes champs + champs cachés UTM ; désactiver la notification par défaut si doublon avec courriel custom.
5. **Renseigner** `GA_MEASUREMENT_ID` et `META_PIXEL_ID` dans `analytics.js` (ou via `wp_localize_script` depuis `functions-additions.php` pour ne pas versionner les IDs).
6. **Brancher** l’action de soumission serveur (pas seulement le fallback JS) : endpoint WPForms, anti-spam, consentements Loi 25.
7. **Configurer** le courriel transactionnel dans WPForms en t’inspirant de `email-templates/confirmation-soumission.html` (souvent les clients mail stripent le CSS — tester Gmail / Outlook / Apple Mail).
8. **Copier** `page-defi-sans-frontieres.php` à la racine du thème enfant et vérifier le slug de page `defi-sans-frontieres`.
9. **Tester** sur staging : formulaire réel, courriel, CRM, pas de `console.log` de données personnelles.
10. **Lancer** Lighthouse + axe DevTools + test clavier complet, puis bascule DNS / redirection `fso.defisansfrontieres.ca` le jour J.
