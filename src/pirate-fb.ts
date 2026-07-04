// Transmission pirate — Nova 7 ou les Renégats détournent la Page, sur les trois
// réseaux (Facebook + Bluesky + Mastodon). Sporadique (~35%).
//
//   npm run pirate            # ~35% de chance de poster
//   npm run pirate -- --force # poste à coup sûr
//   npm run pirate -- --dry
// Réutilise les secrets de ~/.config/recta/env (voir src/social/env.ts).

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { rngFor } from "./rng";
import { pirateFor } from "./pirate-content";
import { pirateCaptions } from "./i18n-captions";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs } from "./social/broadcast";

const FIRE_CHANCE = 0.35; // sporadique : ~1 jour sur 3

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);
  const today = new Date();
  const seed = `pirate:${today.toISOString().slice(0, 13)}`; // varie à l'heure près
  if (!force && !dry && rngFor(seed, "gate")() > FIRE_CHANCE) {
    console.log("Pas d'intrusion aujourd'hui (les pirates sont discrets).");
    return;
  }
  const env = loadEnv();

  // 1. Rendre l'affiche pirate détournée (même seed) via Electron.
  const png = path.resolve("export", `pirate-${today.toISOString().slice(0, 13).replace(":", "")}.png`);
  execFileSync("npx", ["electron", ".", "--no-sandbox", `--pirate=${seed}`, `--pirateout=${png}`], { stdio: "inherit" });
  if (!fs.existsSync(png)) throw new Error(`Affiche pirate introuvable : ${png}`);

  // 2. Diffuser image + légende bilingue (même seed → contenu cohérent).
  const caps = pirateCaptions(pirateFor(seed));
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté l'intrusion.");
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
