// Post d'annonce sur la page Facebook — texte + lien (aperçu rendu par FB).
//
// Le pipeline normal (broadcast/postPhoto) publie une image : c'est le feuilleton.
// Ici on veut un lien vers le blog, avec son aperçu — donc /feed et pas /photos.
// Rare par nature : à lancer à la main, jamais par timer.
//
//   npx tsx src/announce-fb.ts --dry
//   npx tsx src/announce-fb.ts
//
// Secrets dans ~/.config/recta/env.

import { loadEnv } from "./social/env";
import { resolvePageToken } from "./social/facebook";

// graph() de social/facebook.ts fait un GET (il ne sert qu'à résoudre les
// tokens). Publier exige un POST, d'où ce fetch direct.
const GRAPH = "https://graph.facebook.com/v21.0";

// La page est l'Oraculum : tout ce qui y paraît est in-universe. Un « j'ai écrit
// des articles sur comment j'ai fait » y casserait la seule voix qui tient la
// fiction. D'où l'angle : l'administration signale elle-même l'archive, sans
// l'approuver ni l'interdire. Le lien passe, la fiction tient.
const MESSAGE = `⬢ AVIS DE L'ORACULUM — CLASSIFICATION : ANOMALIE DOCUMENTAIRE

Une archive non autorisée a été découverte en périphérie du réseau.

Elle ne contient ni directive, ni sanction, ni célébration. Elle décrit la fabrication des machines : comment les voix sont calculées, comment les images sont tramées, comment les erreurs ont été commises. Son auteur y consigne ses propres pannes.

La Rectitude n'a pas d'avis sur ce document. Il est consultable.

Obéir, c'est exister.`;

const LINK = "https://robotariis.com/Machines/";

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const env = loadEnv();

  if (dry) {
    console.log("--- message ---");
    console.log(MESSAGE);
    console.log("--- lien ---");
    console.log(LINK);
    console.log("\n(--dry : rien n'a été publié)");
    return;
  }

  const token = await resolvePageToken(env);
  const body = new URLSearchParams({ message: MESSAGE, link: LINK, access_token: token });
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/feed`, { method: "POST", body });
  const data = (await res.json()) as { id?: string; error?: { message: string } };

  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  if (!data.id) throw new Error("Facebook n'a pas renvoyé d'identifiant de post");
  console.log(`✓ facebook : ${data.id}`);
  console.log(`  https://www.facebook.com/${data.id.replace("_", "/posts/")}`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
