#!/usr/bin/env bash
# Régénère le site Recta et le pousse sur GitHub Pages si le contenu a changé.
# Lancé quotidiennement par recta-site.timer.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
export PATH="/home/olivier/.npm-global/bin:/usr/bin:/bin:$PATH"

NTFY_URL="${RECTA_NTFY_URL:-http://100.64.201.127:3003/robotariis}"

# 1. Régénérer docs/index.html (beat réel du jour + arc).
if ! npm run site >/tmp/recta-site.log 2>&1; then
  curl -s -H "Title: Site Recta — ÉCHEC génération" -H "Priority: high" -H "Tags: warning" \
    -d "$(tail -3 /tmp/recta-site.log | tr '\n' ' ')" "$NTFY_URL" >/dev/null 2>&1
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
  curl -s -H "Title: Site Recta mis à jour" -H "Tags: globe_with_meridians" \
    -d "Feuilleton du $DAY publié sur obareau.github.io/Recta" "$NTFY_URL" >/dev/null 2>&1
else
  curl -s -H "Title: Site Recta — ÉCHEC push" -H "Priority: high" -H "Tags: warning" \
    -d "commit/push échoué pour $DAY" "$NTFY_URL" >/dev/null 2>&1
  exit 1
fi
