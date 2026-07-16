// Poste un thread Bluesky : le dialogue « cheesecake » des deux animatrices,
// + le lien vers l'article de making-of.
//
// Un thread, pas un post unique : le dialogue dépasse les 300 graphèmes que
// Bluesky autorise. Chaque post référence la racine ET son parent (c'est ce
// qui les enchaîne visuellement).
//
// Les liens ne sont PAS auto-détectés par Bluesky : il faut des « facets » qui
// pointent des plages d'octets UTF-8 (byteStart/byteEnd, pas des index de
// caractères — d'où l'encodage explicite). Sans ça, l'URL s'affiche en texte
// mort, non cliquable.
//
//   npx tsx src/thread-cheesecake.ts --dry
//   npx tsx src/thread-cheesecake.ts

import { loadEnv } from "./social/env";

const XRPC = "https://bsky.social/xrpc";
const enc = new TextEncoder();

// Chaque entrée = un post. `link` (optionnel) devient un facet cliquable.
const POSTS: { text: string; link?: string }[] = [
  {
    text:
      "Ma radio a deux animatrices IA. Hier j'ai pris le modèle le moins cher du catalogue pour faire des économies — il s'est révélé le plus mordant.\n\n" +
      "Vingt minutes plus tard, le serveur plante en plein morceau. Elles réagissent, sans que rien ne soit écrit :",
  },
  {
    text:
      "Solène — Tu trouves du charme à la destruction systémique, c'est fascinant, mais je parie que tu pleurerais si ton cheesecake tombait par terre.\n\n" +
      "Vespera — Le cheesecake est une entité sacrée, Solène, contrairement à ce serveur qui semble rendre l'âme en rythme.",
  },
  {
    text:
      "Solène — Bien sûr, la logique tient toujours quand il s'agit de citron, peu importe le bruit ambiant.\n\n" +
      "Personne n'a écrit ce dialogue. Il y a juste deux fiches de perso — l'une « adore le cheesecake au citron ». Le modèle a fait le reste.",
  },
  {
    text: "Le making-of : https://robotariis.com/Machines/deux-pipelettes\n\nEt elles sont à l'antenne, là, maintenant : https://radio.robotariis.com",
  },
];

// Construit les facets pour toutes les URL présentes dans le texte.
function linkFacets(text: string) {
  const facets: any[] = [];
  const bytes = enc.encode(text);
  const re = /https?:\/\/[^\s]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    // byteStart/byteEnd sont des offsets d'OCTETS, pas de caractères.
    const byteStart = enc.encode(text.slice(0, m.index)).length;
    const byteEnd = byteStart + enc.encode(m[0]).length;
    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: m[0] }],
    });
  }
  return { facets, bytes };
}

async function main() {
  const dry = process.argv.includes("--dry");

  // Contrôle de longueur AVANT tout : Bluesky compte en graphèmes, 300 max.
  let bad = false;
  for (const [i, p] of POSTS.entries()) {
    const g = [...new Intl.Segmenter().segment(p.text)].length;
    console.log(`  post ${i + 1} : ${g} graphèmes${g > 300 ? "  ⚠️ TROP LONG" : ""}`);
    if (g > 300) bad = true;
  }
  if (bad) throw new Error("un post dépasse 300 graphèmes — raccourcir avant de poster");
  if (dry) {
    console.log("\n(--dry : rien posté)");
    return;
  }

  const env = loadEnv();
  const s = (await (await fetch(`${XRPC}/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: env.RECTA_BSKY_HANDLE, password: env.RECTA_BSKY_PASSWORD }),
  })).json()) as any;
  if (!s.accessJwt) throw new Error("connexion refusée");

  let root: { uri: string; cid: string } | null = null;
  let parent: { uri: string; cid: string } | null = null;

  for (const [i, p] of POSTS.entries()) {
    const { facets } = linkFacets(p.text);
    const record: any = {
      $type: "app.bsky.feed.post",
      text: p.text,
      createdAt: new Date().toISOString(),
      langs: ["fr"],
      ...(facets.length ? { facets } : {}),
      ...(root && parent ? { reply: { root, parent } } : {}),
    };

    const res = (await (await fetch(`${XRPC}/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: { Authorization: `Bearer ${s.accessJwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ repo: s.did, collection: "app.bsky.feed.post", record }),
    })).json()) as any;
    if (!res.uri) throw new Error(`post ${i + 1} refusé : ${JSON.stringify(res).slice(0, 120)}`);

    const ref = { uri: res.uri, cid: res.cid };
    if (!root) root = ref; // le premier post est la racine du thread
    parent = ref;
    console.log(`  ✓ post ${i + 1} : ${res.uri.split("/").pop()}`);
  }

  console.log(`\n  → https://bsky.app/profile/${env.RECTA_BSKY_HANDLE}`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
