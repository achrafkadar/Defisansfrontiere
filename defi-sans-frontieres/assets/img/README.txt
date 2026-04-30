Placeholders et visuels finaux
===============================

Remplace les fichiers suivants par les exports du brand book Wenov / FSO :

- logo-fso-officiel.svg ou .png
- hero-desert.jpg (WebP + fallback JPG) — silhouettes sur dune, coucher de soleil
- stephane-portrait.jpg
- og-1200x630.jpg (partage social)

Le dépôt contient pour l’instant :
- hero-header-bg.png — photo désert (hero). Remplace ce fichier par **ta** image en gardant le même nom (PNG ou adapte l’extension dans main.css).
- hero-desert-placeholder.svg — secours SVG (non utilisé si le JPG est présent)
- logo-fso-placeholder.svg

Images attendues par section (landing):
- video-bg.jpg
- concept-parcours-bg.jpg — **une seule image** pour le bloc « Le concept » + « Le parcours » : exporter ton visuel en **1920 × 2160 px** (deux bandes 1920×1080 empilées), fichier `concept-parcours-bg.jpg`. Le fond est appliqué **une fois** sur le conteneur `.dsf-concept-parcours-wrap` dans `index.html` (`cover`, centre) : plus de coupure entre les deux sections.
- pourquoi-inclus-bg.jpg — **une seule image** pour le bloc « Pourquoi participer » + « Ce qui est inclus — ou pas » : exporter en **1920 × 2160 px** (ou ratio équivalent), fichier `pourquoi-inclus-bg.jpg`. Le fond est appliqué sur `.dsf-pourquoi-inclus-wrap`.
- pourquoi-bg.jpg
- inclus-bg.jpg
- filtres-bg.jpg
- postuler-bg.jpg
- stephane-bg.jpg
- fondation-bg.jpg
- faq-bg.jpg

Si une image manque, la landing utilise automatiquement `hero-desert-placeholder.svg` comme fallback.

---
Dimensions et poids cibles (page longue = chaque ko compte)
============================================================
Format d’export recommandé : **WebP** (qualité ~75–82) + **JPG** en secours si besoin.
Règle simple : **largeur max 1920 px** pour les fonds de section (le CSS fait `cover` ; inutile d’exporter 4000 px).

| Fichier / usage              | Dimensions export    | Poids cible    | Note |
|-----------------------------|----------------------|----------------|------|
| Fonds de section (*-bg.jpg) | 1920 × 1080 à 1280   | 80–200 ko /img | 16:9 ou 3:2 ; flou léger OK en bas si texte |
| hero-header-bg (hero)       | 1920 × 1080 min.     | 120–250 ko     | Zone lisible centre/bas pour le texte |
| Miniature vidéo             | **1280 × 720**       | **≤ 120 ko**   | Même ratio que la vidéo 16:9 |
| Logo header / footer (PNG)  | largeur 400–800 px @1x | 15–40 ko     | SVG préféré si dispo |
| Portrait Stéphane           | **800 × 1000** env.  | 60–120 ko      | Ratio portrait ; rognage carré possible en CSS |
| og:image (réseaux)          | **1200 × 630**       | **≤ 300 ko**   | Ratio imposé ; texte lisible au centre |
| Icônes / pictos             | SVG ou PNG 64–128 px | < 15 ko        | |

Budget global réaliste pour toute la landing (hors vidéo embed) : viser < 1,5–2 Mo total pour les images si possible ; au-delà, prioriser WebP et réduire la hauteur des fonds (1080 → 900 px) avant de baisser trop la qualité.
