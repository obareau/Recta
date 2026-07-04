// Mettre à jour la bio Bluesky
//
//   npm run update-bio
//   npm run update-bio -- --dry

import { loadEnv } from "./social/env";
import { updateProfile } from "./social/bluesky";

const BIO = `⬢ RECTA — Feuilleton narratif procédural
Communiqués de la Rectitude • Folie escalade • 5 langues
Jour 0 : L'Ordre | Jour 100 : Apothéose
🔗 robotariis.com`;

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");

  console.log("Bio à appliquer:");
  console.log(BIO);

  if (dry) {
    console.log("\n(--dry mode, aucun changement)");
    return;
  }

  const env = loadEnv();
  try {
    await updateProfile(env, BIO);
    console.log("\n✓ Bio mise à jour sur Bluesky");
  } catch (e) {
    throw new Error(`Erreur : ${(e as Error).message}`);
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
