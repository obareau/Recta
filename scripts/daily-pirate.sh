#!/usr/bin/env bash
# Intrusion pirate sporadique sur la Page (le script s'auto-limite à ~35%).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

NTFY_URL="${RECTA_NTFY_URL:-http://100.64.201.127:3003/robotariis}"
OUT=$(npm run pirate 2>&1)
if echo "$OUT" | grep -q "Intrusion pirate publiée"; then
  curl -s -H "Title: Onde pirate détectée" -H "Tags: pirate_flag" \
    -d "Une transmission Nova 7 / Renégats s'est incrustée sur la Page." "$NTFY_URL" >/dev/null 2>&1
elif echo "$OUT" | grep -q "ÉCHEC"; then
  curl -s -H "Title: Pirate — échec" -H "Priority: high" -H "Tags: warning" \
    -d "$(echo "$OUT" | tail -1)" "$NTFY_URL" >/dev/null 2>&1
fi
