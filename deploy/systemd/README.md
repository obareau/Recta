# Automatisation Recta — timers systemd (user)

Le feuilleton ROBOTARIIS se diffuse tout seul via des timers systemd utilisateur.
Chaque service appelle `scripts/broadcast.sh <flux>`, qui rend l'affiche (Electron
offscreen) puis diffuse via `src/social/*` et notifie ntfy.

| Timer | Cadence | Flux |
|---|---|---|
| `recta-publish` | tous les jours 09:00 | beat du feuilleton (`npm run publish`) |
| `recta-tactique` | tous les jours 15:00 | Tactique Recta (`npm run tactique`) |
| `recta-pirate` | ~20:47, ~35% | intrusion Nova 7 / Renégats (`npm run pirate`) |
| `recta-micro` | tous les ~4 jours 12:00 | micro-nouvelle multilingue (`npm run micropub`) |

## Installation

Les units référencent le chemin absolu `/home/olivier/DEV/Recta`. Adapter si besoin.

```bash
cp deploy/systemd/recta-*.{service,timer} ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now recta-publish.timer recta-tactique.timer \
  recta-pirate.timer recta-micro.timer
loginctl enable-linger "$USER"   # pour que les timers tournent hors session
systemctl --user list-timers 'recta-*'
```

## Secrets

Jamais versionnés. Voir `src/social/env.ts` — fichier `~/.config/recta/env` (chmod 600) :
`RECTA_FB_*` (Facebook, actif), `RECTA_BSKY_*` / `RECTA_MASTO_*` (dormants tant que
les comptes n'existent pas). `RECTA_EPOCH=YYYY-MM-DD` surcharge le jour 0 du récit.
