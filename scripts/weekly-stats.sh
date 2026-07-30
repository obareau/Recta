#!/usr/bin/env bash
# Relevé hebdomadaire des audiences — lancé par recta-stats.timer (dimanche 19:00).
# Envoie le récap FB/Bluesky/Mastodon sur Discord (via ~/scripts/notify.sh).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

NOTIFY="${RECTA_NOTIFY:-$HOME/scripts/notify.sh}"
LINE=$(npx tsx src/social/stats.ts 2>/dev/null | tail -1)

if [ -n "$LINE" ]; then
  "$NOTIFY" "Audiences Robotariis — semaine" "$LINE" || true
else
  "$NOTIFY" -p "Stats — échec du relevé" "Le relevé hebdomadaire n'a rien renvoyé." || true
fi
