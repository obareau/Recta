// Ajoute un texte alternatif à un post Bluesky déjà publié.
//
// Recta remplit toujours l'alt de ses posts automatiques ; les posts déposés à
// la main dans l'appli, non. Deux images muettes au milieu de quatre-vingts
// décrites, ça se voit — et le feuilleton devient illisible pour qui ne voit pas.
//
// putRecord réécrit l'enregistrement en place (même rkey) : le post garde son
// URI, ses likes et ses réponses. On repart TOUJOURS de l'existant — omettre un
// champ ne le laisse pas tranquille, il l'efface.
//
//   npx tsx src/alt-fix.ts --dry
//   npx tsx src/alt-fix.ts

import { loadEnv } from "./social/env";

const XRPC = "https://bsky.social/xrpc";

// rkey → alt. Les deux fiches de présentation postées le 2026-07-15 à 20h36.
const FIXES: Record<string, string> = {
  "3mqpl7voddk2r":
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

  "3mqpl5wguec2r":
    "Affiche verticale, fond noir. À gauche, un pylône de radio en fil de fer monte hors du " +
    "cadre, surmonté d'une balise orange qui rayonne dans l'obscurité. Au centre, le sigle " +
    "de Robōtariis : une forme carrée aux bords tramés, blanche et lumineuse, barrée de deux " +
    "traits orange horizontaux comme un regard. En dessous, en grandes capitales espacées, " +
    "ROBŌTARIIS — dont le premier I est orange. Sous le titre : « Un méta-univers. Une radio. " +
    "Un jeu de rôle improvisé. » En haut de l'affiche : MÉTA-UNIVERS DE SCIENCE-FICTION. " +
    "Des petits sigles identiques flottent dans le noir alentour, comme des signaux lointains.",
};

async function xrpc(method: "GET" | "POST", path: string, token: string, body?: unknown) {
  const url = `${XRPC}/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path} : ${JSON.stringify(data).slice(0, 160)}`);
  return data as any;
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const env = loadEnv();

  const session = await (await fetch(`${XRPC}/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: env.RECTA_BSKY_HANDLE, password: env.RECTA_BSKY_PASSWORD }),
  })).json() as any;
  if (!session.accessJwt) throw new Error("connexion refusée");

  for (const [rkey, alt] of Object.entries(FIXES)) {
    const got = await xrpc("GET",
      `com.atproto.repo.getRecord?repo=${session.did}&collection=app.bsky.feed.post&rkey=${rkey}`,
      session.accessJwt);

    const rec = got.value;
    const imgs = rec?.embed?.images;
    if (!Array.isArray(imgs) || !imgs.length) {
      console.log(`  ${rkey} : pas d'image, ignoré`);
      continue;
    }

    console.log(`  ${rkey} : alt "${(imgs[0].alt || "").slice(0, 20)}" → ${alt.length} caractères`);
    if (dry) continue;

    // On ne touche qu'à l'alt : le reste du record (blob, aspectRatio, langs,
    // createdAt) est repris tel quel, sinon putRecord l'effacerait.
    const record = {
      ...rec,
      embed: { ...rec.embed, images: imgs.map((im: any) => ({ ...im, alt })) },
    };

    await xrpc("POST", "com.atproto.repo.putRecord", session.accessJwt, {
      repo: session.did,
      collection: "app.bsky.feed.post",
      rkey,
      record,
    });
    console.log(`  ${rkey} : ✓ alt posé`);
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
