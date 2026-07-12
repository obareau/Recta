# Automatisation Recta — timers systemd (user)

Le feuilleton ROBOTARIIS se diffuse tout seul via des timers systemd utilisateur.
Chaque service appelle `scripts/broadcast.sh <flux>`, qui rend l'affiche (Electron
offscreen) puis diffuse via `src/social/*` et notifie ntfy.

| Timer | Cadence | Flux |
|---|---|---|
| `recta-publish` | tous les jours 09:00 | beat du feuilleton (`npm run publish`) — Facebook + Bluesky + Mastodon |
| `recta-tactique` | tous les jours 13:00 | Tactique Recta (`npm run tactique`) — Facebook + Bluesky + Mastodon |
| `recta-pirate` | ~20:47, ~35% | intrusion Nova 7 / Renégats (`npm run pirate`) — Facebook + Bluesky + Mastodon |
| `recta-micro` | Lun + Jeu 18:00 (tous les 3-4 jours) | micro-nouvelle multilingue (`npm run micropub`) — Facebook + Bluesky + Mastodon |

⚠️ Historique : les beats/tactiques sont déterministes **par jour** (`narrativeBeat`/`resolveTactique`
sont seedés sur la date, pas sur l'heure) — les faire tourner plusieurs fois par jour poste
plusieurs fois le MÊME contenu (incident du 2026-07-04, cadence réduite de 8×/j à 1×/j). Ne
jamais repasser ces deux timers à une cadence intra-journalière sans changer le seed en
conséquence. Le pool de phrases des personnages éveillés (`src/senders.ts`, `CHAR_PACKS`)
a aussi été élargi le 2026-07-12 : un pool de 3 phrases par palier de folie produisait des
quasi-doublons entre personnages sur une fenêtre de 30 jours.

Pour un calendrier éditorial pré-généré (ex. planification manuelle Meta Business Suite),
voir `npm run campaign` — exporte N jours de beats distincts + micro-nouvelles tous les
3-4 jours, avec légende `.txt` jumelle par image (`src/main.ts` → `runCampaign`).

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
`RECTA_FB_*`, `RECTA_BSKY_*`, `RECTA_MASTO_*` — les trois réseaux sont configurés et actifs.
`RECTA_EPOCH=YYYY-MM-DD` surcharge le jour 0 du récit.
