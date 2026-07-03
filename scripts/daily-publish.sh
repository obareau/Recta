#!/usr/bin/env bash
# Publication quotidienne de l'Oraculum — lancé par le timer systemd.
# En cas d'échec, notifie via ntfy (topic robotariis).
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

NTFY_URL="${RECTA_NTFY_URL:-http://100.64.201.127:3003/robotariis}"
LOG=$(mktemp)

if npm run publish >"$LOG" 2>&1; then
  POST=$(grep -oE 'post [0-9_]+' "$LOG" | tail -1)
  curl -s -H "Title: Oraculum — diffusion du jour" -H "Tags: robot" \
    -d "Communiqué publié sur la Page Robotariis. $POST" "$NTFY_URL" >/dev/null 2>&1
else
  curl -s -H "Title: Oraculum — ÉCHEC de diffusion" -H "Priority: high" -H "Tags: warning" \
    -d "La publication a échoué. $(tail -3 "$LOG" | tr '\n' ' ')" "$NTFY_URL" >/dev/null 2>&1
fi
rm -f "$LOG"
