// Annonce du show SCORIES sur Bluesky, Mastodon et Facebook.
//
//   npm run scories            # rend l'affiche puis publie
//   npm run scories -- --dry   # rend l'affiche, montre la légende, ne poste rien
//
// L'affiche est rendue à la volée (Electron, mode --scories) plutôt que lue
// dans export/ : la légende et l'image partent ainsi du même passage, et une
// affiche périmée ne peut pas accompagner un texte à jour.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { loadEnv } from "./social/env";
import { postImage as postBluesky } from "./social/bluesky";
import { postImage as postMastodon } from "./social/mastodon";
import { postPhoto as postFacebook } from "./social/facebook";

const AFFICHE = path.resolve("export/scories.png");

// 289 caractères — Bluesky plafonne à 300. Toute rallonge doit être mesurée.
const TEXTE = `⬢ SCORIES — nouveau rendez-vous sur la webradio

indus · dark ambient · powernoise
Vespera Nyx & Iris aux platines

Chaque nuit de samedi à dimanche, 02:00 → 06:00
▸ radio.robotariis.com

Voix et musique de synthèse : robotariis.com/transparence`;

const ALT = "Affiche du show SCORIES : indus, dark ambient et powernoise, " +
  "animé par Vespera Nyx et Iris, chaque nuit de samedi à dimanche de 2h à 6h " +
  "sur radio.robotariis.com. Typographie monospace vert phosphore sur fond noir.";

const BSKY_LIMIT = 300;

function rendreAffiche(): Buffer {
  execFileSync("npx", ["tsx", "build.ts"], { stdio: "ignore" });
  execFileSync("npx", ["electron", ".", "--no-sandbox", `--scories=${AFFICHE}`],
    { stdio: "ignore" });
  if (!fs.existsSync(AFFICHE)) throw new Error(`affiche non produite : ${AFFICHE}`);
  return fs.readFileSync(AFFICHE);
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");

  console.log(`Légende (${TEXTE.length} caractères) :\n${TEXTE}\n`);
  if (TEXTE.length > BSKY_LIMIT) {
    throw new Error(`légende trop longue pour Bluesky : ${TEXTE.length} > ${BSKY_LIMIT}`);
  }

  const png = rendreAffiche();
  console.log(`Affiche : ${AFFICHE} (${(png.length / 1024).toFixed(0)} Ko)`);

  if (dry) {
    console.log("\n(--dry, rien n'est publié)");
    return;
  }

  const env = loadEnv();
  // Un réseau qui échoue ne doit pas empêcher les deux autres — mais le code
  // de sortie doit le refléter, sinon la panne passe inaperçue.
  const cibles: Array<[string, () => Promise<string>]> = [
    ["Bluesky", () => postBluesky(env, png, TEXTE, ALT)],
    ["Mastodon", () => postMastodon(env, png, TEXTE, ALT)],
    ["Facebook", () => postFacebook(env, png, TEXTE)],
  ];

  let echecs = 0;
  for (const [nom, fn] of cibles) {
    try {
      console.log(`✓ ${nom} : ${await fn()}`);
    } catch (e) {
      console.error(`✗ ${nom} : ${(e as Error).message}`);
      echecs++;
    }
  }
  if (echecs) process.exit(1);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
