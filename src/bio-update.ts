// Mettre à jour la bio sur Bluesky ET Mastodon
//
//   npm run update-bio
//   npm run update-bio -- --dry
//   npm run update-bio -- --only=bsky|masto

import { loadEnv } from "./social/env";
import { updateProfile as updateBluesky } from "./social/bluesky";
import { updateProfile as updateMastodon } from "./social/mastodon";

// Le nom de l'univers, pas du feuilleton : le compte ne sert aujourd'hui que
// Recta, mais il porte le monde entier — et un jour il servira autre chose.
// La bio, elle, dit précisément ce qu'on y publie.
const NAME = "⬢ ROBŌTARIIS";

// Bluesky plafonne la bio à 256 caractères ; celle-ci en fait ~230, il reste
// peu de marge. Mastodon en autorise 500 : la même passe sans problème.
//
// Deux choix qui ne sont pas cosmétiques :
//   — « procédural » est le mot qui distingue ce compte de tout ce qui défile
//     à côté en 2026. Il est vrai, vérifiable (seeds déterministes, code MIT),
//     et personne ne le revendique.
//   — la distinction affiches/photos est la déclaration IA elle-même, au seul
//     endroit qu'un lecteur consulte avant de suivre un compte.
const BIO = `⬢ RECTA — Feuilleton narratif procédural
Communiqués de la Rectitude • Folie escalade • 6 langues
Jour 0 : L'Ordre | Jour 100 : Apothéose
Affiches procédurales · photos R3N3G4TS générées par IA
🔗 robotariis.com/transparence`;

const BSKY_LIMIT = 256;

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

  console.log(`Nom : ${NAME}`);
  console.log(`Bio (${BIO.length} caractères) :`);
  console.log(BIO);

  if (BIO.length > BSKY_LIMIT) {
    throw new Error(`Bio trop longue pour Bluesky : ${BIO.length} > ${BSKY_LIMIT}`);
  }

  if (dry) {
    console.log("\n(--dry, aucun changement)");
    return;
  }

  const env = loadEnv();
  const toutes: Array<[string, () => Promise<void>]> = [
    ["Bluesky", () => updateBluesky(env, BIO, NAME)],
    ["Mastodon", () => updateMastodon(env, BIO, NAME)],
  ];
  const cibles = toutes.filter(
    ([nom]) => !only || nom.toLowerCase().startsWith(only.toLowerCase().slice(0, 4)),
  );

  // Un échec sur un réseau ne doit pas empêcher l'autre d'être mis à jour —
  // mais le code de sortie doit le refléter, sinon la panne passe inaperçue.
  let echecs = 0;
  for (const [nom, fn] of cibles) {
    try {
      await fn();
      console.log(`✓ ${nom}`);
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
