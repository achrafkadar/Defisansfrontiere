# Defisansfrontiere

## Landing FSO — Défi Sans Frontières (livraison actuelle)

Le livrable **production-ready** se trouve dans **`defi-sans-frontieres/`** (HTML, CSS, JS, gabarits WordPress, courriel).

- Aperçu local : `cd defi-sans-frontieres && python3 -m http.server 8080`
- Intégration WP : voir `defi-sans-frontieres/README.md`

**URL publique (déploiement « branche ») :**  
[https://achrafkadar.github.io/Defisansfrontiere/](https://achrafkadar.github.io/Defisansfrontiere/) → redirige vers  
[https://achrafkadar.github.io/Defisansfrontiere/defi-sans-frontieres/](https://achrafkadar.github.io/Defisansfrontiere/defi-sans-frontieres/)

Si tu configures Pages sur **GitHub Actions** avec l’artefact `defi-sans-frontieres`, la landing sera à la racine `/` : enlève alors la redirection dans `index.html` à la racine (voir commentaire dans ce fichier).

La racine `styles.css` n’est plus utilisée par la landing actuelle (tout est sous `defi-sans-frontieres/`).
