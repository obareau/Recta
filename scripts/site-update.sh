#!/usr/bin/env bash
# Régénère le site Recta et le pousse sur GitHub Pages si le contenu a changé.
# Lancé quotidiennement par recta-site.timer.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

# ntfy abandonné le 2026-07-30 : ses alertes n'ont jamais fonctionné (port 3003
# en HTTPS interrogé en HTTP → 400, invisible car curl -s). Tout passe par
# notify.sh, qui vit HORS de ce dépôt — celui-ci est public et l'URL du webhook
# Discord est un secret.
NOTIFY="${RECTA_NOTIFY:-$HOME/scripts/notify.sh}"

# 1. Régénérer docs/index.html (beat réel du jour + arc).
if ! npm run site >/tmp/recta-site.log 2>&1; then
  "$NOTIFY" -p "Site Recta — ÉCHEC génération" "$(tail -3 /tmp/recta-site.log | tr '\n' ' ')" || true
  exit 1
fi

# 2. Rien à pousser si le rendu est identique.
if git diff --quiet -- docs/; then
  exit 0
fi

# 3. Commit + push.
git add docs/index.html
DAY=$(date +%Y-%m-%d)
if git commit -q -m "site: mise à jour du jour ($DAY) [auto]" && git push -q origin master; then
  "$NOTIFY" "Site Recta mis à jour" "Feuilleton du $DAY publié sur obareau.github.io/Recta" || true
else
  "$NOTIFY" -p "Site Recta — ÉCHEC push" "commit/push échoué pour $DAY" || true
  exit 1
fi
