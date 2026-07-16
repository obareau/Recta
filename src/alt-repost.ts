// Republie deux images avec leur texte alternatif, et supprime les originaux.
//
// Pourquoi cette brutalité : Bluesky n'édite pas les posts. putRecord réécrit
// bien l'enregistrement dans le dépôt (vérifié : l'alt y est), mais l'AppView
// n'indexe jamais la mise à jour d'un post — le public continue de voir la
// version d'origine, muette. Écrire au bon endroit ne suffit pas si personne
// n'y regarde. Seul un post neuf porte son alt.
//
// Ordre : on publie D'ABORD, on supprime ENSUITE. Si la publication échoue,
// l'original est toujours là — on ne veut pas d'un trou dans le fil.
//
//   npx tsx src/alt-repost.ts --dry
//   npx tsx src/alt-repost.ts

import * as fs from "node:fs";
import { loadEnv } from "./social/env";

const XRPC = "https://bsky.social/xrpc";

type Job = { rkey: string; file: string; alt: string; text: string };

const JOBS: Job[] = [
  {
    rkey: "3mqpl7voddk2r",
    file: "/tmp/claude-1000/-home-olivier-homelab-install/0133dd03-b7e2-4562-83b5-c451f8a16b77/scratchpad/post1.jpg",
    text: "",
    alt:
      "Fiche de présentation de Robōtariis, en noir et blanc, typographie à chasse fixe. " +
      "Titre : ROBŌTARIIS — méta-univers de science-fiction. « Un méta-univers. Une radio. " +
      "Un jeu de rôle improvisé. » Ce que ça explore : ce qui reste quand on retire l'émotion " +
      "d'un être conscient, et ce qui revient malgré tout. Robōtariis réunit un site de lore, " +
      "une webradio chiptune en direct 24h/24 et un jeu de rôle improvisé, de l'An 0 à l'ère " +
      "de la Fragmentation : six tomes, sept factions, des personnages hybrides, IA, " +
      "archivistes et renégats qui se disputent la mémoire et le droit d'exister. L'univers " +
      "vit aussi en outils : propagande générée (Recta), portraits pixel-art (Quidam), " +
      "atelier d'image 1-bit (MONO°). " +
      "FACTIONS — La Rectitude : le code dominant, discipline, surveillance, nullification. " +
      "Nova 7 : l'entité fractale, au-delà des factions. Les Renégats : la résistance, " +
      "mémoire, liberté, clandestinité. Fractales Libres : les ingénieurs de la résistance. " +
      "Harmonie Synthétique : l'élite artistique, beauté, perfection, détachement. " +
      "Illuminés de la Singularité : la foi technologique, transcendance ou fanatisme. " +
      "PERSONNAGES — Zoe : l'hybride fondatrice, mère des 7 enfants. Winston-6 : " +
      "l'archiviste, gardien de la mémoire interdite. Les 7 Enfants de Zoe : hybrides, " +
      "héritiers de Joy et Mik-L. Mik-L : le stratège, père tactique, disparu. Haiku-12 : " +
      "le poète synthétique, conscience fragmentée. Orion-99 : le passeur, entre deux mondes. " +
      "Lignée Kessler : cinq générations, de l'invention à la trahison. " +
      "Liens : radio.robotariis.com (webradio en direct 24h/24), robotariis.com, Hub Robōtariis. " +
      "Auteur : Olivier Bareau.",
  },
  {
    rkey: "3mqpl5wguec2r",
    file: "/tmp/claude-1000/-home-olivier-homelab-install/0133dd03-b7e2-4562-83b5-c451f8a16b77/scratchpad/post2.jpg",
    text: "",
    alt:
      "Affiche verticale, fond noir. À gauche, un pylône de radio en fil de fer monte hors du " +
      "cadre, surmonté d'une balise orange qui rayonne dans l'obscurité. Au centre, le sigle " +
      "de Robōtariis : une forme carrée aux bords tramés, blanche et lumineuse, barrée de deux " +
      "traits orange horizontaux comme un regard. En dessous, en grandes capitales espacées, " +
      "ROBŌTARIIS — dont le premier I est orange. Sous le titre : « Un méta-univers. Une radio. " +
      "Un jeu de rôle improvisé. » En haut de l'affiche : MÉTA-UNIVERS DE SCIENCE-FICTION. " +
      "Des petits sigles identiques flottent dans le noir alentour, comme des signaux lointains.",
  },
];

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const env = loadEnv();

  const s = await (await fetch(`${XRPC}/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: env.RECTA_BSKY_HANDLE, password: env.RECTA_BSKY_PASSWORD }),
  })).json() as any;
  if (!s.accessJwt) throw new Error("connexion refusée");

  for (const j of JOBS) {
    const bytes = fs.readFileSync(j.file);
    console.log(`  ${j.rkey} : ${(bytes.length / 1024).toFixed(0)} Ko · alt ${j.alt.length} car`);
    if (dry) continue;

    // 1. Renvoyer l'image : le blob d'origine appartient à l'ancien record.
    const blob = await (await fetch(`${XRPC}/com.atproto.repo.uploadBlob`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.accessJwt}`, "Content-Type": "image/jpeg" },
      body: bytes,
    })).json() as any;
    if (!blob.blob) throw new Error(`upload refusé : ${JSON.stringify(blob).slice(0, 120)}`);

    // 2. Publier AVANT de supprimer : si ça casse ici, l'original reste en place.
    const created = await (await fetch(`${XRPC}/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.accessJwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        repo: s.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text: j.text,
          createdAt: new Date().toISOString(),
          langs: ["fr"],
          embed: {
            $type: "app.bsky.embed.images",
            images: [{ image: blob.blob, alt: j.alt }],
          },
        },
      }),
    })).json() as any;
    if (!created.uri) throw new Error(`publication refusée : ${JSON.stringify(created).slice(0, 120)}`);
    console.log(`    ✓ republié : ${created.uri.split("/").pop()}`);

    // 3. Seulement maintenant, retirer le muet.
    await fetch(`${XRPC}/com.atproto.repo.deleteRecord`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.accessJwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ repo: s.did, collection: "app.bsky.feed.post", rkey: j.rkey }),
    });
    console.log(`    ✓ ancien supprimé : ${j.rkey}`);
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
