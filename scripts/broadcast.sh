#!/usr/bin/env bash
# Diffusion multi-réseaux Recta — un seul script paramétré, lancé par les timers.
#   broadcast.sh communique   → communiqué du jour  (FB + Bluesky + Mastodon)
#   broadcast.sh tactique     → Tactique Recta       (FB + Bluesky + Mastodon)
#   broadcast.sh pirate       → intrusion sporadique (auto-limitée ~35%)
# En cas d'échec total, notifie via ntfy (topic robotariis).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

FLUX="${1:-communique}"
NTFY_URL="${RECTA_NTFY_URL:-http://100.64.201.127:3003/robotariis}"
LOG=$(mktemp)

case "$FLUX" in
  communique) CMD="npm run publish -- --net=bluesky"; TITLE="Feuilleton — beat du jour";     TAG="robot" ;;
  tactique)   CMD="npm run tactique -- --seed=tactique:$(date +%Y-%m-%dT%H) --net=bluesky"; TITLE="Tactique Recta diffusée"; TAG="dart" ;;
  pirate)     CMD="npm run pirate -- --net=bluesky";  TITLE="Onde pirate détectée";          TAG="pirate_flag" ;;
  micro)      CMD="npm run micropub -- --net=bluesky"; TITLE="Micro-nouvelle diffusée";       TAG="ticket" ;;
  renegat)    CMD="npm run renegat";                   TITLE="Avis de recherche R3N3G4T";     TAG="wanted" ;;
  cross-post-beat-x) CMD="npm run cross-post-x -- --beat"; TITLE="Beat posté sur X";     TAG="twitter" ;;
  *) echo "flux inconnu : $FLUX (communique|tactique|pirate|micro|renegat|cross-post-beat-x)"; exit 2 ;;
esac

if $CMD >"$LOG" 2>&1; then
  # Bilan par réseau (lignes "✓ reseau : id" / "✗ reseau : erreur").
  OK=$(grep -c '^✓' "$LOG" 2>/dev/null || echo 0)
  KO=$(grep -c '^✗' "$LOG" 2>/dev/null || echo 0)
  if [ "$FLUX" = "pirate" ] && grep -q "Pas d'intrusion" "$LOG"; then
    rm -f "$LOG"; exit 0   # silence : les pirates sont discrets
  fi
  curl -s -H "Title: $TITLE" -H "Tags: $TAG" \
    -d "Diffusé — $OK réseau(x) OK, $KO en échec." "$NTFY_URL" >/dev/null 2>&1
else
  curl -s -H "Title: $TITLE — ÉCHEC" -H "Priority: high" -H "Tags: warning" \
    -d "Diffusion échouée. $(tail -3 "$LOG" | tr '\n' ' ')" "$NTFY_URL" >/dev/null 2>&1
fi
rm -f "$LOG"
