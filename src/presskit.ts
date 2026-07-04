// Génère press-kit/ : posts Reddit prêts à coller (EN) + visuels + liens.
// Publication MANUELLE par Olivier (Reddit interdit l'automatisation naïve, et
// chaque subreddit a ses règles). Ce kit ne poste rien : il prépare la matière.
//
//   npm run presskit
//
// Visuels : réutilise les modes Electron existants (--n communiqué, --pirate,
// --tactique). La carte et la capture radio, si présentes, sont copiées depuis
// des chemins connus ; sinon le kit note leur absence sans échouer.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const HUB = "https://obareau.github.io/robotariis-hub/";
const LORE = "https://robotariis.com";
const RECTA_REPO = "https://github.com/obareau/Recta";
const TERRA_REPO = "https://github.com/obareau/Terra-Incognita";
const RADIO = "https://obareau.github.io/Terra-Incognita/radio/";

interface RedditPost {
  file: string;
  subreddit: string;
  title: string;
  body: string;
  guidance: string;
}

const POSTS: RedditPost[] = [
  {
    file: "r-worldbuilding.md",
    subreddit: "r/worldbuilding",
    title: "ROBOTARIIS — a retrofuturist SF dystopia where the lore drives a suite of generative tools",
    body: `I've been building **ROBOTARIIS**, a 1940s–60s retrofuturist science-fiction dystopia ruled by the **C.G.U.** (a technocratic regime obsessed with "Rectitude"). What makes it unusual: the worldbuilding isn't just written down — it feeds a set of tools that *generate* new canon material.

- A knowledge graph (the **Atlas**) holds the factions, characters, places and their relations.
- A poster generator (**Recta**) produces daily "communiqués" of the regime — procedurally, from a seeded grammar anchored to the canon.
- A procedural **map generator** (Terra-Incognita) draws the regime's territories; the maps publish *back* into the lore.
- Rebel factions (Nova 7, the Renégats) periodically "hijack" the interface with glitched pirate transmissions.

Everything is deterministic and seeded, so the same seed always yields the same artifact — the world is large but reproducible.

Hub with all the tools: ${HUB}
Lore site: ${LORE}`,
    guidance: `Post as a text/self post. Lead with the WORLD, not the tech. Answer questions about factions and history in the comments. Best days: weekday mornings US time. Read r/worldbuilding rules on self-promo (they allow it if the world is the focus).`,
  },
  {
    file: "r-proceduralgeneration.md",
    subreddit: "r/proceduralgeneration",
    title: "Terra-Incognita: a seeded procedural map generator (retrofuturist, tile+macro, ASCII + pixel + chiptune)",
    body: `**Terra-Incognita** generates retrofuturist territorial maps for a fictional regime. Technical bits this sub tends to like:

- Fully **deterministic**: one seed → one map, via a domain-separated PRNG (xmur3 + sfc32).
- A tile/macro "Lego" system: small code-generated tiles compose into regions.
- Faction-specific **architecture styles** derived from each faction's canonical traits.
- Topographic **iso-contour** relief for an industrial feel.
- Code-generated **spomenik** monuments (skull, concentric Stonehenge, ruined pyramid, Nazca-like glyphs…).
- A companion **chiptune engine** (WebAudio) generates a unique track per map from the same seed.

Runs in the browser (Electron desktop + GitHub Pages demo). No pre-baked assets — everything is drawn from code.

Demo + repo: ${TERRA_REPO}
Radio side-project (a chiptune "you hear once in your life", seeded by your birthday × tune-in instant): ${RADIO}`,
    guidance: `This sub loves technical detail and GIFs. Attach the map visual + ideally a short screen capture. Explain the seed→artifact determinism. Avoid pure marketing tone.`,
  },
  {
    file: "r-generative.md",
    subreddit: "r/generative",
    title: "Recta + a \"heard once in your life\" chiptune radio — seeded generative art from a fictional regime",
    body: `Two generative pieces from the **ROBOTARIIS** universe:

**Recta** turns a seeded combinatorial grammar into propaganda posters of a fictional technocratic regime — communiqués, tactical directives, and glitched "pirate" hijacks by rebel factions. Each is rendered on canvas with an overflow-proof retro layout.

**The Radio** generates a chiptune track seeded by *your birthday mixed with the exact instant you tune in* — so the wave you hear is, mathematically, one you'll only ever hear once. A synthesized "announcer" voice reads generated station idents over it.

Both are deterministic: same seed, same output. It's generative art in service of a fictional world rather than for its own sake.

Radio: ${RADIO}
Hub: ${HUB}`,
    guidance: `r/generative prefers the artifact to speak first. Attach a poster + the pirate variant. Mention the determinism and the grammar. Engage on the "one wave per life" idea — it tends to spark discussion.`,
  },
];

function renderVisual(args: string[], out: string): boolean {
  try {
    execFileSync("npx", ["electron", ".", "--no-sandbox", ...args], { stdio: "inherit" });
    return fs.existsSync(out);
  } catch {
    return false;
  }
}

function main(): void {
  const dir = path.resolve("press-kit");
  const visuals = path.join(dir, "visuals");
  fs.mkdirSync(visuals, { recursive: true });

  // 1. Visuels générés depuis Recta (modes Electron existants).
  const communique = path.join(visuals, "communique.png");
  const pirate = path.join(visuals, "pirate.png");
  const tactique = path.join(visuals, "tactique.png");
  const made: string[] = [];
  // --n écrit communique-recta-<date>-01.png : on le renomme ensuite.
  const stamp = new Date().toISOString().slice(0, 10);
  const dated = path.join(visuals, `communique-recta-${stamp}-01.png`);
  renderVisual(["--n=1", `--outdir=${visuals}`, "--vault=off"], dated);
  if (fs.existsSync(dated)) { fs.renameSync(dated, communique); made.push("communique.png"); }
  if (renderVisual([`--pirate=presskit`, `--pirateout=${pirate}`], pirate)) made.push("pirate.png");
  if (renderVisual([`--tactique=presskit`, `--tactiqueout=${tactique}`], tactique)) made.push("tactique.png");

  // 2. Posts markdown.
  for (const p of POSTS) {
    const content =
      `# ${p.subreddit}\n\n` +
      `**Title:**\n${p.title}\n\n` +
      `**Body:**\n\n${p.body}\n\n` +
      `---\n\n**How to post:** ${p.guidance}\n`;
    fs.writeFileSync(path.join(dir, p.file), content, "utf-8");
  }

  // 3. Index / feuille de route.
  const readme =
    `# ROBOTARIIS — Reddit press kit\n\n` +
    `Généré le ${new Date().toISOString().slice(0, 10)}. **Publication manuelle uniquement.**\n\n` +
    `## Posts prêts à coller\n` +
    POSTS.map((p) => `- [${p.subreddit}](${p.file})`).join("\n") + "\n\n" +
    `## Visuels\n` +
    (made.length ? made.map((m) => `- visuals/${m}`).join("\n") : "- (aucun visuel généré — vérifier Electron)") + "\n\n" +
    `## Liens\n` +
    `- Hub : ${HUB}\n- Lore : ${LORE}\n- Radio : ${RADIO}\n- Recta : ${RECTA_REPO}\n- Terra-Incognita : ${TERRA_REPO}\n\n` +
    `## Rythme conseillé\n` +
    `Un subreddit par semaine, jamais les trois le même jour. Réponds aux commentaires ` +
    `dans l'heure. Ne recolle pas le même texte partout (Reddit pénalise le cross-post identique).\n`;
  fs.writeFileSync(path.join(dir, "README.md"), readme, "utf-8");

  console.log(`Kit prêt : ${dir}`);
  console.log(`  ${POSTS.length} posts, ${made.length} visuel(s).`);
}

main();
