# Recta — Roadmap

> Brouillon factuel du 2026-07-31. Chaque ligne est adossée à un fait
> constatable, avec sa preuve entre parenthèses — rien n'est déduit du seul
> nom d'un fichier. À corriger et à élaguer : c'est un point de départ, pas
> une intention.

## État constaté

- **15 timers actifs**, tous passés dans les dernières 24 h sauf les
  hebdomadaires (`zinepub` samedi, `micro` lundi/jeudi) — nominal.
- **6 langues** : `fr en es it de ja` (`src/i18n.ts:11`).
- **1 commit d'avance sur `origin/master`, 0 de retard** — le dépôt est
  aligné avec l'amont.
- `recta-console` apparaît en `failed` : état **résiduel**, pas actif. Son
  unité a été corrigée le 2026-07-30 à 22h22 et le dernier échec date du
  même jour à 20h00, deux heures plus tôt. S'efface au prochain passage.

## À faire

### Dette de publication

- [ ] Écrire les entrées de CHANGELOG manquantes — 54 commits depuis la seule
      entrée existante (`0.1.0`, 2026-07-08), qui est le gabarit provisionné
      par Argus. Six mois de fonctionnalités ne sont datés nulle part :
      allemand et japonais, zine hebdomadaire, clip narratif, interception
      Subwave, glossaire, publication Facebook, tracker de métriques.
- [ ] Nettoyer l'état `failed` résiduel de `recta-console`
      (`systemctl --user reset-failed recta-console.service`) — sinon un
      contrôle de santé le comptera comme une panne alors qu'il est réparé.

### Migration des alertes (ntfy → Discord, entamée le 2026-07-30)

- [ ] Corriger le commentaire d'en-tête de `src/social/stats.ts:3`, qui
      annonce encore que « le script relaie à ntfy ». Le chemin réel passe
      par `~/scripts/notify.sh` (Discord) depuis le 2026-07-30. Un commentaire
      faux sur un chemin d'alerte se paie cher : c'est déjà ce qui a masqué
      des semaines d'échecs silencieux de `recta-console`.
- [ ] Vérifier qu'aucun flux ne notifie plus dans le vide — les alertes ntfy
      n'ont **jamais** fonctionné (port 3003, constaté le 2026-07-30), donc
      chaque flux migré est un flux dont on découvre seulement maintenant
      s'il échouait.

### Intégration Iris (instable)

- [ ] Stabiliser le tirage des photos Renégat : quatre correctifs en dix
      jours (recherche récursive, `_classees` seul, notation qui écartait
      toutes les autres, préférence aux mieux notées — 21 au 30 juillet).
      Cette densité de correctifs sur un même chemin signale un contrat mal
      défini avec Iris plutôt qu'une suite de bogues indépendants.
- [ ] Décider ce qui se passe quand Iris n'a aucune photo classée
      disponible : aujourd'hui le comportement n'est pas documenté.

### Transparence IA (posée le 2026-08-01)

- [x] Déclarer les avis R3N3G4TS : ils publient une photo de la bibliothèque
      Iris, générée par modèle de diffusion. Mention localisée en 6 langues
      (`IA_MENTION` dans `i18n.ts`) dans la légende, plus le texte alternatif.
      Art. 50 du règlement (UE) 2024/1689, applicable au 2026-08-02.
- [x] **Ne rien déclarer ailleurs** — affiches, tactiques, zines et clips sont
      procéduraux (fractales, tirages ensemencés par la date, vérifié en
      lisant le code : aucun appel LLM, aucun modèle, aucune image externe
      composée ; les deux seuls `drawImage` sont auto-référentiels). Y coller
      une mention IA serait faux.
- [ ] Réexaminer si un modèle entre un jour dans le pipeline des affiches :
      la mention devra être posée **le même jour**, sinon l'omission devient
      le mensonge qu'on cherchait à éviter.
- [ ] Décidé de ne PAS estampiller « image procédurale · graine · aucun
      modèle » sur les affiches pour l'instant — à rouvrir si la question
      « c'est de l'IA ? » revient assez souvent pour mériter la densité
      visuelle en pied d'affiche.

⚠️ Bizarrerie préexistante repérée en chemin, non corrigée : la légende de
base des Renégats est tirée au hasard parmi cinq variantes de langue,
**indépendamment de `lang`** — d'où des posts à texte italien et hashtags
allemands. Il n'existe d'ailleurs aucune légende allemande alors que `de` est
dans `LANGS`. Peut être voulu (fréquence pirate), à trancher.

### Bios sociales (2026-08-01)

- [x] `update-bio` gère **Bluesky ET Mastodon** (il ne faisait que Bluesky).
      Bio à 224 caractères, limite Bluesky 256 — le script refuse de partir
      au-delà plutôt que de laisser le réseau tronquer en silence.
- [x] Corrigé « 5 langues » → **6** : `LANGS` en compte six depuis le
      2026-07-12, la bio mentait depuis.
- [x] Les deux bios pointent vers `robotariis.com/transparence` et distinguent
      affiches procédurales / photos R3N3G4TS générées par IA.

⚠️ **Mastodon veut du multipart sur `update_credentials`**, pas du JSON : un
envoi en `application/json` renvoie 200 sans rien changer. L'illusion parfaite.
Toujours relire le profil côté serveur après coup, jamais se fier au code HTTP.

### Glossaire (posé le 2026-07-30, jeune)

- [ ] Éprouver la fusion affiche/texte sur plusieurs semaines — le cadrage et
      le cache partagés datent du 2026-07-30, aucun recul.

### Affiche de show — SCORIES (2026-08-02)

- [x] `drawScories()` dans `brand.ts` + mode Electron `--scories` + script
      `npm run scories` (rend l'affiche ET publie sur Bluesky, Mastodon,
      Facebook). Publié le 2026-08-02.
- [x] Registre **pirate et non C.G.U.** : « fréquence non répertoriée », cadre
      rompu aux quatre coins, pas d'emblème. Scories passe *quand la Rectitude
      ne surveille plus les fréquences* — une convocation officielle du Conseil
      pour l'annoncer serait un contresens narratif.
- [x] Mention « voix et musique de synthèse » + lien transparence en pied :
      une affiche qui annonce des DJ ne doit pas laisser croire à des humains.

ℹ️ **Gabarit réutilisable** pour annoncer d'autres shows — c'est le premier
visuel de Recta qui ne soit pas un communiqué. L'affiche est **rendue à la
volée** par le script de publication, jamais lue dans `export/` : sinon une
affiche périmée peut accompagner un texte à jour.

⚠️ À `0.145` de corps, les capitales du titre remontent bien au-dessus de la
ligne de base et mordaient sur l'en-tête. L'interligne après un très gros titre
doit valoir au moins 1,2× son corps, pas 0,7×.

## Demandes externes (Argus)

<!-- argus:begin -->
- [ ] ⚑ 12+ commits non publiés
      _pourquoi : dernière version 0.1.0 datée du 2026-07-08_
- [ ] ⇐ Terminal Synth : Intégration d'un indicateur de performance dans les communiqués de la Rectitude, permettant aux artistes et à l'équipe de suivre en temps réel l'état des visuels générés.
      _pourquoi : Cela pourrait aider à optimiser les performances en direct, assurant que tous les éléments graphiques fonctionnent correctement._
- [ ] ⚑ Amélioration de l'IA utilisée
      _pourquoi : Bien que Qwen2-VL soit performant, une IA plus avancée pourrait produire des images et textes encore plus précis. Une amélioration de l'IA pourrait également permettre d'intégrer davantage de nuances dans la génération._
- [ ] ⚑ Intégration d'un système de validation lore
      _pourquoi : Actuellement, je ne vérifie pas si les images et notes de lore générées sont conformes au canon. Une intégration avec l'Atlas pourrait m'aider à garantir la cohérence._
<!-- argus:end -->

---

*Dernière mise à jour : 2026-07-31*
