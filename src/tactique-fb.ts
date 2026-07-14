// Publication d'une Tactique Recta — multi-réseaux (Bluesky + Mastodon + Facebook).
//   npm run tactique                 # poste la tactique du jour
//   npm run tactique -- --seed=xyz
//   npm run tactique -- --lang=ja    # force la langue
//   npm run tactique -- --dry
// Réutilise les secrets de ~/.config/recta/env (voir src/social/env.ts).

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolveTactique } from "./tactiques-gen";
import { tactiqueCaptions } from "./i18n-captions";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs } from "./social/broadcast";
import { LANGS, type Lang } from "./i18n";
import { pick, rngFor } from "./rng";

function argSeed(): string {
  const a = process.argv.find((x) => x.startsWith("--seed="));
  return a ? a.slice(7) : `tactique:${new Date().toISOString().slice(0, 10)}`;
}

// Une seule langue par tactique, tirée au sort — mais seedée sur la tactique
// elle-même, comme senderForDay : deux exécutions du même seed donnent la même
// langue, donc l'export reste reproductible. Un cycle fixe (à la langForDay)
// rendait la langue devinable à la date ; ici la distribution est imprévisible
// sans cesser d'être déterministe. --lang=xx force, pour les tests.
function argLang(seed: string): Lang {
  const a = process.argv.find((x) => x.startsWith("--lang="));
  const forced = a?.slice(7) as Lang | undefined;
  if (forced && (LANGS as readonly string[]).includes(forced)) return forced;
  return pick(rngFor(seed, "tactique-lang"), LANGS);
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);
  const seed = argSeed();
  const lang = argLang(seed);
  const t = resolveTactique(seed, lang);

  const png = path.resolve("export", `tactique-${seed.replace(/[^a-z0-9]+/gi, "-")}.png`);

  // Le rendu Electron est le seul poste coûteux (Chromium complet pour un PNG,
  // et la densité fractale monte avec la folie). Lancé à l'heure de publication,
  // il s'est fait tuer par l'OOM killer (recta-tactique, 14 juil.). Comme le
  // seed est déterministe, l'affiche du jour J peut être rendue la veille au
  // calme : on ne régénère que ce qui manque. `npm run pregen` remplit le cache.
  // Narrativement c'est indistinguable — seule la publication a une date.
  if (fs.existsSync(png)) {
    console.log(`Affiche pré-générée réutilisée : ${path.basename(png)}`);
  } else {
    execFileSync("npx", ["electron", ".", "--no-sandbox", `--tactique=${seed}`, `--tactiqueout=${png}`], { stdio: "inherit" });
    if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);
  }

  const caps = tactiqueCaptions(t);
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté la tactique.");
  }
  console.log(`Tactique ${t.code} traitée [${lang}].`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
