# Recta — Comptes de publication automatisée

> [!danger] Aucun secret dans ce fichier
> Ce dépôt est **public**. Les credentials vivent dans `~/.config/recta/env` (chmod 600),
> jamais ici. Ce fichier documente les comptes, les bios et les calendriers — pas les valeurs.
>
> *Purgé le 2026-07-14 : des jetons Bluesky et Mastodon y étaient en clair et ont été révoqués.*
Documentation des comptes sociaux et credentials pour la publication multilingue du feuilleton narratif.

---

## Bluesky (@robotariis.bsky.social)

**Statut:** ✅ Actif — publication automatique 24/7

### Credentials
```
Handle: robotariis.bsky.social
App Password: <voir ~/.config/recta/env>
```

### Bio
```
⬢ RECTA — Feuilleton narratif procédural / Communiqués de la Rectitude 
• Folie escalade • 5 langues / Jour 0 : L'Ordre | Jour 100 : Apothéose / 🔗 robotariis.com
```

### Calendrier automatique
- **Beats**: 00/03/06/09/12/15/18/21:00 UTC (rotation FR/EN/ES/IT/JA)
- **Micro-nouvelles**: 18:00 UTC (rotation langues)
- **Tactiques**: 15:00 UTC (FR)
- **Avis R3N3G4TS**: 14:00 + 22:00 UTC (90 photos)

---

## Mastodon (@robotariis@mastodon.social)

**Statut:** ✅ Actif — publication automatique 24/7

### Credentials
```
Instance: mastodon.social
OAuth Application ID: <voir ~/.config/recta/env>
OAuth Secret: <voir ~/.config/recta/env>
Access Token: <voir ~/.config/recta/env>
Scopes: all (sauf admin)
```

### Bio & Profil
```
Display Name: ⬢ RECTA

Bio:
Feuilleton narratif procédural — Communiqués de la Rectitude

Folie escalade en 100 jours
5 langues (FR/EN/ES/IT/JA)

Day 0: Ordre | Day 100: Apothéose

🔗 robotariis.com
```

### Champs du profil
| Nom | Valeur |
|---|---|
| Site Web | https://robotariis.com/ |

### Calendrier automatique
- **Beats**: 00/03/06/09/12/15/18/21:00 UTC (rotation FR/EN/ES/IT/JA)
- **Micro-nouvelles**: 18:00 UTC (rotation langues)
- **Tactiques**: 15:00 UTC (FR)
- **Avis R3N3G4TS**: 14:00 + 22:00 UTC (90 photos)

---

## Configuration locale (~/.config/recta/env)

```bash
# Bluesky (atproto) — handle + app password
RECTA_BSKY_HANDLE=<voir ~/.config/recta/env>
RECTA_BSKY_PASSWORD=<voir ~/.config/recta/env>

# Mastodon
RECTA_MASTO_INSTANCE=<voir ~/.config/recta/env>
RECTA_MASTO_TOKEN=<voir ~/.config/recta/env>

# Facebook (obsolète — audience historique nulle)
# RECTA_FB_* (non utilisé)

# X / Twitter (obsolète — API payante, tier gratuit bloqué)
# RECTA_X_* (supprimé)
```

---

## Automatisation (systemd timers)

Tous les timers postent sur **Bluesky + Mastodon** automatiquement:

```bash
# Actifs
systemctl --user status recta-publish.timer        # Beats 6/jour
systemctl --user status recta-micro.timer          # Micro-nouvelles
systemctl --user status recta-tactique.timer       # Tactiques
systemctl --user status recta-renegat.timer        # Avis R3N3G4TS

# Vérifier les timers
systemctl --user list-timers recta*
```

---

## Publication manuelle (pour test)

```bash
# Beats
npm run publish -- --net=bluesky,mastodon
npm run publish -- --net=mastodon --lang=en

# Micro-nouvelles
npm run micropub -- --net=bluesky,mastodon

# Tactiques
npm run tactique -- --net=bluesky,mastodon

# Avis R3N3G4TS
npm run renegat

# Onde pirate (sporadique ~35%)
npm run pirate -- --net=bluesky,mastodon --force
```

---

## Contenu généré

### Beats quotidiens
- 1 affiche PNG (1080×1440) par jour
- Rotation linguistique: FR → EN → ES → IT → JA → FR...
- Escalade de folie NOVA-7 sur 100 jours (émetteur varie)
- Légende + hashtags localisés + mention GGR obsolescence

### Micro-nouvelles
- 1 ticket thermique (pâle #e8e4d8) par jour
- 6 phrases flash fiction
- Rotation langues (même que beats)

### Tactiques Recta
- Protocole de décision opérationnel
- Curées (200 manuelles FR) + générées (EN/ES/IT/JA)
- Quotidien, toujours FR

### Avis R3N3G4TS
- 90 photos + captions générées
- Numero unique (100-999), rotation langues
- Anti-doublons (cache 100 derniers)
- 2× par jour (14:00 + 22:00 UTC)

---

## Historique / Notes

| Date | Action |
|---|---|
| 2026-07-04 | Création compte Mastodon @robotariis@mastodon.social |
| 2026-07-04 | Intégration cross-post Bluesky + Mastodon |
| 2026-07-04 | Suppression cross-post X (API payante) |
| 2026-06-29 | Lancement Bluesky (@robotariis.bsky.social) |
| 2026-06-29 | Multilingue FR/EN/ES/IT/JA activé |
| 2026-06-29 | Escalade NOVA-7 + voix caractères implémentées |

---

## Dépannage

### Token invalide / expiré
1. Vérifier l'env: `cat ~/.config/recta/env | grep RECTA_`
2. Régénérer le token sur la page application (Settings → Applications)
3. Updater l'env, redémarrer les timers: `systemctl --user restart recta-*.service`

### Post échoué
```bash
# Vérifier les logs systemd
journalctl --user -u recta-publish.service -n 50

# Tester manuellement
npm run publish -- --dry --net=mastodon
npm run publish -- --net=mastodon
```

### Doublons R3N3G4TS
Vérifier le cache: `cat ~/.config/recta/renegat-cache.json`

---

**Dernière mise à jour:** 2026-07-04
