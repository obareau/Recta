# Recta — Communiqués de la Rectitude

> **Générateur d'affiches de propagande du C.G.U.** pour l'univers **ROBOTARIIS**.
> L'Oraculum diffuse. Vous écoutez.

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20Electron-blueviolet)

Recta génère des **communiqués officiels de la Rectitude** — couvre-feux, directives,
avis de recherche, célébrations obligatoires, avis de Nullification — rendus en affiches
PNG rétrofuturistes prêtes pour les réseaux sociaux, avec le lien **robotariis.com** en teaser.

Chaque communiqué est produit par une grammaire combinatoire seedée, **ancrée dans le canon**
du vault d'écriture : l'émetteur est **l'Oraculum** (contrôle des communications, censure,
propagande), la langue est l'**Omniglossa Recta**, les slogans sont les **33 Slogans canoniques**
(« Obéir, c'est exister. »), les sanctions suivent l'échelle officielle (Mise à Jour Éthique →
Reclassification → Nullification) et les services cités (Chronographe, Inquisitio Mentis,
Cliniciens du Bien-Être…) sortent de l'architecture administrative canonique.

## Page web

**▶ https://obareau.github.io/Recta/** — un communiqué à chaque visite, régénération,
téléchargement PNG (carré 1080×1080 ou story 1080×1920).

## Export automatique en lot

```bash
npm install
npm run export                       # 5 affiches PNG du jour → ./export/
npm run export:story                 # idem au format story

# Ou en précisant tout :
npx tsx build.ts && electron . --no-sandbox --n=10 --outdir=/chemin/dossier --format=carre
```

Les affiches du jour sont **déterministes** (seed = date + numéro) : relancer l'export
reproduit la même série — pratique pour la programmation éditoriale.

Chaque export écrit aussi la **note de lore** du communiqué dans le vault d'écriture
(`~/robotariis-writing/com-recta/`, désactivable via `--vault=off`) : frontmatter canonique,
relations `connecte:` vers le C.G.U. et les lieux Atlas cités — les communiqués font partie
intégrante du canon, et l'Atlas les voit.

## Publication automatique (Facebook / réseaux)

L'export en lot est la première moitié du pipeline. Pour poster automatiquement :

1. Créer une **Page Facebook** dédiée (pas un profil).
2. Créer une app sur [developers.facebook.com](https://developers.facebook.com), lui donner
   les permissions `pages_manage_posts` + `pages_read_engagement`.
3. Générer un **jeton d'accès de Page** longue durée.
4. Poster via l'API Graph : `POST /{page-id}/photos` avec l'image et le texte.

Un script `publish.ts` pourra alors enchaîner export → post (cron quotidien). Non inclus
tant que la Page et le jeton n'existent pas.

## Développement

```bash
npm start        # fenêtre Electron de prévisualisation
npm test         # grammaire : déterminisme, variété, élision, numéros
```

Fait partie de l'écosystème **ROBOTARIIS** ([cartes Terra-Incognita](https://obareau.github.io/terra-incognita/),
[Radio Robotariis](https://obareau.github.io/terra-incognita/radio/)).

*La désobéissance commence par la lecture.*
