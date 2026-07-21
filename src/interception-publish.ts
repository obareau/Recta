// Publication d'une Interception Recta — un échange de banter Subwave (deux
// voix, radio Robotariis) présenté comme un signal capté par l'Oraculum.
// Bluesky + Mastodon (pas Facebook — format expérimental, cf. autres flux).
//
//   npm run interception            # poste l'interception du jour
//   npm run interception -- --dry
//
// La donnée (findInterception) est résolue UNE SEULE FOIS ici, écrite dans un
// fichier temporaire, puis passée telle quelle au rendu Electron — l'affiche
// et la légende doivent partager exactement le même échange, or l'état
// Subwave source (sessions/*.json) continue d'évoluer en direct pendant
// qu'on publie.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { findInterception } from "./interception";
import { interceptionCaptions } from "./i18n-captions";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs } from "./social/broadcast";

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv).filter((n) => n !== "facebook");

  const data = findInterception();
  if (!data) {
    console.log("Aucune interception disponible aujourd'hui (pas de banter à deux voix récent) — rien à publier.");
    return;
  }

  const tmpData = path.join(os.tmpdir(), `recta-interception-${Date.now()}.json`);
  fs.writeFileSync(tmpData, JSON.stringify(data));
  const png = path.resolve("export", `interception-${new Date().toISOString().slice(0, 10)}.png`);

  try {
    execFileSync("npx", [
      "electron", ".", "--no-sandbox", "--interception",
      `--interceptiondata=${tmpData}`, `--interceptionout=${png}`,
    ], { stdio: "inherit" });
  } finally {
    fs.rmSync(tmpData, { force: true });
  }
  if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);

  const caps = interceptionCaptions(data.showName);
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté l'interception.");
  }
  console.log(`Interception (${data.showName}) traitée.`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
