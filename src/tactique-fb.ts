// Publication d'une Tactique Recta — multi-réseaux (Bluesky + Mastodon + Facebook).
//   npm run tactique                 # poste la tactique du jour
//   npm run tactique -- --seed=xyz
//   npm run tactique -- --dry
// Réutilise les secrets de ~/.config/recta/env (voir src/social/env.ts).

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolveTactique } from "./tactiques-gen";
import { tactiqueCaptions } from "./i18n-captions";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs } from "./social/broadcast";

function argSeed(): string {
  const a = process.argv.find((x) => x.startsWith("--seed="));
  return a ? a.slice(7) : `tactique:${new Date().toISOString().slice(0, 10)}`;
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);
  const seed = argSeed();
  const t = resolveTactique(seed);

  const png = path.resolve("export", `tactique-${seed.replace(/[^a-z0-9]+/gi, "-")}.png`);
  execFileSync("npx", ["electron", ".", "--no-sandbox", `--tactique=${seed}`, `--tactiqueout=${png}`], { stdio: "inherit" });
  if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);

  const caps = tactiqueCaptions(t);
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté la tactique.");
  }
  console.log(`Tactique ${t.code} traitée.`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
