// Publication du BEAT NARRATIF du jour — le feuilleton ROBOTARIIS qui se déroule.
// Selon le jour de récit (folie de NOVA-7 croissante), l'émetteur est l'Oraculum,
// un personnage éveillé, ou NOVA-7 — et la légende s'adapte.
//
//   npm run publish              # poste le beat du jour
//   npm run publish -- --dry     # montre la légende sans rien poster
//   npm run publish -- --net=bluesky,mastodon
//
// Secrets dans ~/.config/recta/env (jamais versionnés). Voir src/social/env.ts.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { narrativeBeat, langForDay } from "./narrative";
import { beatCaptions } from "./i18n-captions";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs } from "./social/broadcast";
import type { Lang } from "./i18n";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);
  const today = new Date();
  const lang = (argOf("lang") as Lang) || langForDay(today);
  const beat = narrativeBeat(today, { lang });

  // 1. Rendre l'affiche du beat du jour (émetteur + folie + langue réels) via Electron.
  const outDir = path.resolve("export");
  const png = path.join(outDir, `beat-${today.toISOString().slice(0, 10)}-${lang}.png`);
  execFileSync("npx", ["electron", ".", "--no-sandbox", "--beat", `--beatout=${png}`, `--lang=${lang}`, "--format=story"], { stdio: "inherit" });
  if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);

  // 2. Légende adaptée à l'émetteur du jour + langue.
  const caps = beatCaptions(beat);
  console.log(`Beat du jour — jour ${beat.storyDay}, acte ${beat.act}, langue ${lang}, émetteur ${beat.sender.name} (folie ${beat.madness.toFixed(2)}).`);

  // 3. Diffusion.
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry, date: today, lang });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté la publication.");
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
