// Générateur du site Recta — foyer permanent du feuilleton.
// Rend un dossier docs/ autonome (self-contained) pour GitHub Pages :
//   - L'ARC : la folie de NOVA-7 sur 100 jours, échantillonnée
//   - TACTIQUES : directives C.G.U. générées
//   - MICRO-NOUVELLES : tickets thermiques
//   - FACTIONS : R3N3G4TS (recherchés) vs HybR1Ds (ralliés)
//
//   npm run site           # génère docs/index.html
//
// Look : propagande rétro, fond sombre, monospace, sigil ⬢.

import * as fs from "node:fs";
import * as path from "node:path";
import { narrativeBeat, DEFAULT_EPOCH } from "./narrative";
import { resolveTactique } from "./tactiques-gen";
import { microNouvelleFor } from "./micronouvelle";
import { listHybridImages } from "./hybrids";
import { GGR_MENTION, type Lang } from "./i18n";

const OUT_DIR = path.resolve("docs");
const BSKY = "https://bsky.app/profile/robotariis.bsky.social";
const MASTO = "https://mastodon.social/@robotariis";
const SITE = "https://robotariis.com";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dateForDay(day: number): Date {
  const e = new Date(`${DEFAULT_EPOCH}T00:00:00Z`).getTime();
  return new Date(e + day * 86400000);
}

const LANG_BADGE: Record<Lang, string> = { fr: "FR", en: "EN", es: "ES", it: "IT", ja: "JA" };

/** Section L'ARC — échantillonne l'arc de folie sur 100 jours. */
function renderArc(): string {
  const sampleDays = [0, 6, 12, 20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100];
  const cards = sampleDays
    .map((day) => {
      const d = dateForDay(day);
      const beat = narrativeBeat(d);
      const pct = Math.round(beat.madness * 100);
      const corps = esc(beat.communique.corps.slice(0, 240)) + (beat.communique.corps.length > 240 ? "…" : "");
      return `
      <article class="beat">
        <header>
          <span class="day">JOUR ${day}</span>
          <span class="act">${esc(beat.act)}</span>
          <span class="lang">${LANG_BADGE[beat.communique.lang ?? "fr"]}</span>
        </header>
        <div class="madness" title="folie ${pct}%">
          <div class="bar" style="width:${pct}%"></div>
          <span class="pct">FOLIE ${pct}%</span>
        </div>
        <div class="emitter">${esc(beat.sender.name)}</div>
        <h3>${esc(beat.communique.type)}</h3>
        <p>${corps}</p>
        <div class="devise">« ${esc(beat.communique.devise)} »</div>
      </article>`;
    })
    .join("\n");
  return `<section id="arc"><h2>L'ARC — 100 JOURS</h2>
    <p class="lede">Le générateur monte. Jour 0 : l'Ordre. Jour 100 : l'Apothéose.
    NOVA-7 finit par se prendre pour Dieu et parle en langage fractal.</p>
    <div class="beats">${cards}</div></section>`;
}

/** Section TACTIQUES — directives C.G.U. générées. */
function renderTactiques(): string {
  const cards = Array.from({ length: 12 }, (_, i) => {
    const t = resolveTactique(`site:tactique:${i}`, "fr");
    return `<article class="tac">
      <span class="code">${esc(t.code)}</span>
      <p>${esc(t.text)}</p>
    </article>`;
  }).join("\n");
  return `<section id="tactiques"><h2>TACTIQUES RECTA</h2>
    <p class="lede">Protocoles de décision du C.G.U. — usage opérationnel uniquement.</p>
    <div class="tacs">${cards}</div></section>`;
}

/** Section MICRO-NOUVELLES — tickets thermiques. */
function renderMicro(): string {
  const cards = Array.from({ length: 6 }, (_, i) => {
    const mn = microNouvelleFor(`site:micro:${i}`, "fr");
    return `<article class="ticket">
      <h3>${esc(mn.title)}</h3>
      <p>${esc(mn.body)}</p>
    </article>`;
  }).join("\n");
  return `<section id="micro"><h2>MICRO-NOUVELLES</h2>
    <p class="lede">Distributeur d'Histoires Courtes — une nouvelle imprimée, chaque jour.</p>
    <div class="tickets">${cards}</div></section>`;
}

/** Section FACTIONS — R3N3G4TS vs HybR1Ds. */
function renderFactions(): string {
  let hybCount = 0;
  try { hybCount = listHybridImages().length; } catch { /* dossier absent en CI */ }
  return `<section id="factions"><h2>DEUX FACTIONS</h2>
    <div class="factions">
      <article class="faction wanted">
        <h3>R3N3G4TS</h3>
        <p class="tag">RECHERCHÉS</p>
        <p>Fréquences hors-la-loi. Signaux non répertoriés. Le C.G.U. émet des avis de recherche numérotés.</p>
      </article>
      <article class="faction aligned">
        <h3>HybR1Ds</h3>
        <p class="tag">RALLIÉS · ALIGNÉS</p>
        <p>Renégats assimilés. Dissonance corrigée. La Rectitude les enregistre et les reconnaît.
        ${hybCount ? `<br><span class="count">${hybCount} portraits au registre</span>` : ""}</p>
      </article>
    </div></section>`;
}

const CSS = `
:root{--bg:#0a0a0a;--fg:#e8e4d8;--dim:#8a8577;--acc:#c9a227;--red:#b23a3a;--grn:#4a7c4a;--line:#2a2a2a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:"Courier New",ui-monospace,monospace;line-height:1.5}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
header.top{text-align:center;padding:60px 20px 40px;border-bottom:1px solid var(--line)}
.sigil{width:56px;height:auto;margin:0 auto 12px;display:block}
h1{font-size:42px;letter-spacing:6px;margin:0 0 8px}
.tagline{color:var(--dim);letter-spacing:2px;margin:0 0 20px}
.links a{color:var(--acc);text-decoration:none;margin:0 10px;border-bottom:1px solid transparent}
.links a:hover{border-bottom-color:var(--acc)}
h2{font-size:24px;letter-spacing:4px;border-left:4px solid var(--acc);padding-left:12px;margin:56px 0 8px}
.lede{color:var(--dim);margin:0 0 24px;max-width:640px}
section{scroll-margin-top:20px}
.beats,.tacs,.tickets{display:grid;gap:16px}
.beats{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.tacs{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.tickets{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.beat,.tac,.ticket,.faction{background:#111;border:1px solid var(--line);padding:16px;border-radius:2px}
.beat header{display:flex;gap:8px;align-items:center;font-size:11px;letter-spacing:1px;margin-bottom:10px;flex-wrap:wrap}
.day{color:var(--acc);font-weight:bold}
.act{color:var(--dim)}
.lang{margin-left:auto;border:1px solid var(--line);padding:1px 6px;color:var(--dim)}
.madness{position:relative;height:16px;background:#0a0a0a;border:1px solid var(--line);margin-bottom:10px}
.madness .bar{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--grn),var(--acc),var(--red))}
.madness .pct{position:absolute;right:6px;top:1px;font-size:10px;color:var(--fg);mix-blend-mode:difference}
.emitter{font-size:11px;color:var(--acc);letter-spacing:1px;margin-bottom:4px}
.beat h3{font-size:14px;margin:0 0 8px;letter-spacing:1px}
.beat p{font-size:12px;color:var(--dim);margin:0 0 10px}
.devise{font-style:italic;font-size:12px;color:var(--fg);border-top:1px dashed var(--line);padding-top:8px}
.tac .code{color:var(--acc);font-weight:bold;font-size:12px;letter-spacing:1px}
.tac p{font-size:12px;color:var(--dim);margin:8px 0 0}
.ticket h3{font-size:15px;margin:0 0 8px;color:var(--acc)}
.ticket p{font-size:12px;color:var(--dim);margin:0}
.factions{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.faction h3{font-size:20px;letter-spacing:3px;margin:0 0 4px}
.faction .tag{font-size:11px;letter-spacing:2px;margin:0 0 10px}
.faction.wanted{border-color:var(--red)}
.faction.wanted .tag{color:var(--red)}
.faction.aligned{border-color:var(--grn)}
.faction.aligned .tag{color:var(--grn)}
.faction p{font-size:12px;color:var(--dim)}
.count{color:var(--acc)}
footer{margin:64px 0 40px;padding-top:24px;border-top:1px solid var(--line);text-align:center;color:var(--dim);font-size:11px}
footer .ggr{max-width:560px;margin:0 auto 12px;font-style:italic}
@media(max-width:600px){.factions{grid-template-columns:1fr}h1{font-size:32px}}
`;

const SIGIL_SVG = `<svg class="sigil" viewBox="0 0 100 100" aria-hidden="true">
  <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="#c9a227"/>
</svg>`;

export function generateSite(): string {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RECTA — Feuilleton narratif procédural</title>
<meta name="description" content="Communiqués de la Rectitude. La folie de NOVA-7 monte sur 100 jours. 5 langues. Généré algorithmiquement.">
<style>${CSS}</style>
</head>
<body>
<header class="top">
  ${SIGIL_SVG}
  <h1>RECTA</h1>
  <p class="tagline">FEUILLETON NARRATIF PROCÉDURAL · COMMUNIQUÉS DE LA RECTITUDE</p>
  <nav class="links">
    <a href="#arc">L'Arc</a>
    <a href="#tactiques">Tactiques</a>
    <a href="#micro">Micro-nouvelles</a>
    <a href="#factions">Factions</a>
    <a href="${BSKY}">Bluesky</a>
    <a href="${MASTO}">Mastodon</a>
  </nav>
</header>
<main class="wrap">
  ${renderArc()}
  ${renderTactiques()}
  ${renderMicro()}
  ${renderFactions()}
</main>
<footer class="wrap">
  <p class="ggr">${esc(GGR_MENTION.fr)}</p>
  <p><a href="${SITE}" style="color:var(--acc);text-decoration:none">robotariis.com</a> ·
     <a href="${BSKY}" style="color:var(--acc);text-decoration:none">@robotariis.bsky.social</a> ·
     <a href="${MASTO}" style="color:var(--acc);text-decoration:none">@robotariis@mastodon.social</a></p>
  <p>Généré le ${now} · tout est algorithmique</p>
</footer>
</body>
</html>`;

  const outPath = path.join(OUT_DIR, "index.html");
  fs.writeFileSync(outPath, html);
  // .nojekyll pour que GitHub Pages serve tel quel.
  fs.writeFileSync(path.join(OUT_DIR, ".nojekyll"), "");
  console.log(`Site généré : ${outPath}`);
  return outPath;
}

if (process.argv[1] && process.argv[1].endsWith("site-gen.ts")) {
  generateSite();
}
