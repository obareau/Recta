// Publication d'une fiche terminologique — une entrée du glossaire canon,
// présentée comme une note de définition de l'Oraculum.
//
//   npm run glossaire                  # l'entrée du jour
//   npm run glossaire -- --dry
//   npm run glossaire -- --terme=absolons     # forcer une entrée précise
//
// L'entrée est résolue UNE SEULE FOIS ici, puis passée au rendu Electron par
// fichier temporaire — même raison que pour l'interception : l'affiche et la
// légende doivent porter le même terme, y compris si la date bascule entre les
// deux (la sélection est seedée par la date).

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { glossaireOfDay } from "./glossaire";
import { glossaireCaptions } from "./i18n-captions";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs } from "./social/broadcast";

function argOf(name: string): string | undefined {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : undefined;
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);

  const entry = glossaireOfDay({ terme: argOf("terme") });
  if (!entry) {
    // Pas une erreur : le vault n'est pas dans ce dépôt (public), donc une
    // machine sans vault n'a simplement rien à publier.
    console.log("Aucune entrée de glossaire disponible (vault absent ou vide) — rien à publier.");
    return;
  }

  const tmpData = path.join(os.tmpdir(), `recta-glossaire-${Date.now()}.json`);
  fs.writeFileSync(tmpData, JSON.stringify(entry));
  const png = path.resolve("export", `glossaire-${new Date().toISOString().slice(0, 10)}.png`);

  try {
    execFileSync("npx", [
      "electron", ".", "--no-sandbox", "--glossaire",
      `--glossairedata=${tmpData}`, `--glossaireout=${png}`,
    ], { stdio: "inherit" });
  } finally {
    fs.rmSync(tmpData, { force: true });
  }
  if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);

  const caps = glossaireCaptions(entry);
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté la fiche terminologique.");
  }
  console.log(`Fiche « ${entry.terme} » traitée.`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
