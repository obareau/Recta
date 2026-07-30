#!/usr/bin/env bash
# Diffusion multi-réseaux Recta — un seul script paramétré, lancé par les timers.
#   broadcast.sh communique   → communiqué du jour  (Facebook + Bluesky + Mastodon)
#   broadcast.sh tactique     → Tactique Recta       (Facebook + Bluesky + Mastodon)
#   broadcast.sh pirate       → intrusion sporadique (auto-limitée ~35%)
#   broadcast.sh micro        → micro-nouvelle tous les 3-4 jours
#   broadcast.sh console      → vidéo télématique (Bluesky)
#   broadcast.sh clip         → clip narratif (title→reveal→tactique→pirate, Bluesky)
#   broadcast.sh interception → banter Subwave capté (Bluesky + Mastodon)
#   broadcast.sh glossaire    → fiche terminologique (entrée du glossaire canon)
#   broadcast.sh zinepub      → Zine hebdomadaire (samedi 08:00)
#   broadcast.sh renegat      → avis R3N3G4TS (recherchés)
#   broadcast.sh hybrid       → HybR1D rallié/aligné
# En cas d'échec total, alerte via ~/scripts/notify.sh (Discord).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

FLUX="${1:-communique}"
# ⚠️ Les alertes passaient par ntfy et n'ont JAMAIS fonctionné : le port 3003
# local est en HTTPS, on y postait du HTTP, le serveur répondait 400 — et comme
# l'appel était en `curl -s` avec la sortie jetée, personne ne pouvait le voir.
# Constaté le 2026-07-30, ntfy abandonné.
#
# Tout passe désormais par notify.sh, hors de ce dépôt : celui-ci est PUBLIC et
# l'URL du webhook Discord est un secret. Le script lit sa configuration dans
# ~/.config/robotariis/notify.env et vérifie le code de retour HTTP.
NOTIFY="${RECTA_NOTIFY:-$HOME/scripts/notify.sh}"
LOG=$(mktemp)

case "$FLUX" in
  communique) CMD="npm run publish -- --net=facebook,bluesky,mastodon"; TITLE="Feuilleton — beat du jour";     TAG="robot" ;;
  tactique)   CMD="npm run tactique -- --seed=tactique:$(date +%Y-%m-%dT%H) --net=facebook,bluesky,mastodon"; TITLE="Tactique Recta diffusée"; TAG="dart" ;;
  pirate)     CMD="npm run pirate -- --net=facebook,bluesky,mastodon";  TITLE="Onde pirate détectée";          TAG="pirate_flag" ;;
  micro)      CMD="npm run micropub -- --net=facebook,bluesky,mastodon"; TITLE="Micro-nouvelle diffusée";       TAG="ticket" ;;
  console)    CMD="npm run console";                  TITLE="Vidéo télématique diffusée";      TAG="film_frames" ;;
  clip)       CMD="npm run clippub";                   TITLE="Clip narratif diffusé";           TAG="clapper" ;;
  interception) CMD="npm run interception";            TITLE="Interception diffusée";           TAG="satellite" ;;
  glossaire)  CMD="npm run glossaire";                 TITLE="Fiche terminologique diffusée"; TAG="books" ;;
  zinepub)    CMD="npm run zinepub";                  TITLE="Zine propagande hebdomadaire";    TAG="newspaper" ;;
  renegat)    CMD="npm run renegat";                   TITLE="Avis de recherche R3N3G4T";     TAG="wanted" ;;
  hybrid)     CMD="npm run hybrid";                    TITLE="HybR1D aligné diffusé";           TAG="dna" ;;
  faction)    # Alternance quotidienne : jours pairs = HybR1D (rallié), impairs = R3N3G4T (recherché).
    if [ $(( 10#$(date +%j) % 2 )) -eq 0 ]; then
      CMD="npm run hybrid";  TITLE="HybR1D aligné diffusé";       TAG="dna"
    else
      CMD="npm run renegat"; TITLE="Avis de recherche R3N3G4T";   TAG="wanted"
    fi ;;
  *)
    # Flux inconnu — le seul cas où le script doit crier AVANT de mourir.
    # Sans cette branche, CMD restait indéfini, `set -u` tuait le script à la
    # première utilisation… c'est-à-dire DANS le bloc qui envoie la notification
    # d'échec. L'alerte ne partait donc jamais : recta-console a échoué chaque
    # mardi, jeudi et samedi pendant des semaines, en silence, parce que son
    # unité appelait « videopub » au lieu de « console » (corrigé le 2026-07-30).
    echo "Flux inconnu : '$FLUX'. Attendus : communique tactique pirate micro console clip interception glossaire zinepub renegat hybrid faction" >&2
    "$NOTIFY" -p "Recta — flux inconnu" \
      "broadcast.sh appelé avec '$FLUX', qui n'existe pas. Vérifier l'unité systemd qui l'invoque." || true
    rm -f "$LOG"
    exit 2 ;;
esac

if $CMD >"$LOG" 2>&1; then
  # Bilan par réseau (lignes "✓ reseau : id" / "✗ reseau : erreur").
  OK=$(grep -c '^✓' "$LOG" 2>/dev/null || echo 0)
  KO=$(grep -c '^✗' "$LOG" 2>/dev/null || echo 0)
  if [ "$FLUX" = "pirate" ] && grep -q "Pas d'intrusion" "$LOG"; then
    rm -f "$LOG"; exit 0   # silence : les pirates sont discrets
  fi
  if [ "$FLUX" = "interception" ] && grep -q "rien à publier" "$LOG"; then
    rm -f "$LOG"; exit 0   # silence : pas de banter à deux voix récent, jour sans matière
  fi
  # Bilan de diffusion : routine tant qu'au moins un réseau a accepté. Le mot
  # « échec » y désigne un COMPTEUR, pas l'issue — ne pas le lire comme une alerte.
  "$NOTIFY" "$TITLE" "Diffusé — $OK réseau(x) OK, $KO en échec." || true
else
  "$NOTIFY" -p "$TITLE — ÉCHEC" "Diffusion échouée. $(tail -3 "$LOG" | tr '\n' ' ')" || true
fi
rm -f "$LOG"
