#!/usr/bin/env bash
# Relevé hebdomadaire des audiences — lancé par recta-stats.timer (dimanche 19:00).
# Envoie le récap FB/Bluesky/Mastodon sur ntfy (topic robotariis).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

NTFY_URL="${RECTA_NTFY_URL:-http://100.64.201.127:3003/robotariis}"
LINE=$(npx tsx src/social/stats.ts 2>/dev/null | tail -1)

if [ -n "$LINE" ]; then
  curl -s -H "Title: Audiences Robotariis — semaine" -H "Tags: bar_chart" \
    -d "$LINE" "$NTFY_URL" >/dev/null 2>&1
else
  curl -s -H "Title: Stats — échec du relevé" -H "Priority: default" -H "Tags: warning" \
    -d "Le relevé hebdomadaire n'a rien renvoyé." "$NTFY_URL" >/dev/null 2>&1
fi
