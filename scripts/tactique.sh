#!/usr/bin/env bash
# Poste une Tactique Recta (seed = horodatage → tactique différente à chaque tir).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

NTFY_URL="${RECTA_NTFY_URL:-http://100.64.201.127:3003/robotariis}"
SEED="tactique:$(date +%Y-%m-%dT%H)"
OUT=$(npm run tactique -- --seed="$SEED" 2>&1)
if echo "$OUT" | grep -q "Tactique .* publiée"; then
  code=$(echo "$OUT" | grep -oE 'RT-[0-9]+' | head -1)
  curl -s -H "Title: Tactique Recta diffusée" -H "Tags: dart" \
    -d "$code publiée sur la Page." "$NTFY_URL" >/dev/null 2>&1
elif echo "$OUT" | grep -q "ÉCHEC"; then
  curl -s -H "Title: Tactique — échec" -H "Priority: high" -H "Tags: warning" \
    -d "$(echo "$OUT" | tail -1)" "$NTFY_URL" >/dev/null 2>&1
fi
