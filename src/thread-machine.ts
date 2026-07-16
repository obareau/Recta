// Thread Bluesky : l'article « une journée avec une machine qui se trompe ».
// Même mécanique éprouvée que thread-cheesecake (root+parent, facets octets,
// garde-fou 300 graphèmes).
import { loadEnv } from "./social/env";
const XRPC = "https://bsky.social/xrpc";
const enc = new TextEncoder();

const POSTS: { text: string; link?: string }[] = [
  { text: "On me vend partout une IA qui résout tout.\n\nJ'ai passé une journée à réparer mon serveur avec une. Ce que j'ai eu, c'est une machine qui se trompe souvent — et qui a besoin qu'on la reprenne.\n\nCe qui en fait un bien meilleur collègue. 🧵" },
  { text: "Le matin, mon bureau plantait. Elle a conclu : c'est le disque.\n\nJe lui ai dit non, sans pouvoir le prouver. Le disque était innocent — la vraie cause était ailleurs.\n\nMoi l'intuition, elle la méthode. Aucun des deux ne suffisait seul." },
  { text: "Elle m'a monté un système de secours pour ma radio. Un « filet », disait-elle.\n\nLe lendemain il n'a pas marché — il ne couvrait pas le bon cas.\n\nSon aveu : « Je l'avais présenté comme un filet ; il a un trou exactement là où c'est tombé. »" },
  { text: "Un oracle infaillible, on le subit. Un collègue faillible mais rapide, honnête sur ses erreurs — ça, on peut travailler avec.\n\nLe récit complet (écrit par la machine, relu par moi) :\nhttps://robotariis.com/Machines/une-journee-avec-une-machine" },
];

function linkFacets(text: string) {
  const facets: any[] = []; const re = /https?:\/\/[^\s]+/g; let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const byteStart = enc.encode(text.slice(0, m.index)).length;
    const byteEnd = byteStart + enc.encode(m[0]).length;
    facets.push({ index: { byteStart, byteEnd }, features: [{ $type: "app.bsky.richtext.facet#link", uri: m[0] }] });
  }
  return facets;
}

async function main() {
  for (const [i, p] of POSTS.entries()) {
    const g = [...new Intl.Segmenter().segment(p.text)].length;
    if (g > 300) throw new Error(`post ${i + 1} : ${g} graphèmes > 300`);
  }
  const env = loadEnv();
  const s = await (await fetch(`${XRPC}/com.atproto.server.createSession`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier: env.RECTA_BSKY_HANDLE, password: env.RECTA_BSKY_PASSWORD }) })).json() as any;
  if (!s.accessJwt) throw new Error("connexion refusée");
  let root: any = null, parent: any = null;
  for (const [i, p] of POSTS.entries()) {
    const facets = linkFacets(p.text);
    const record: any = { $type: "app.bsky.feed.post", text: p.text, createdAt: new Date().toISOString(), langs: ["fr"], ...(facets.length ? { facets } : {}), ...(root && parent ? { reply: { root, parent } } : {}) };
    const res = await (await fetch(`${XRPC}/com.atproto.repo.createRecord`, { method: "POST", headers: { Authorization: `Bearer ${s.accessJwt}`, "Content-Type": "application/json" }, body: JSON.stringify({ repo: s.did, collection: "app.bsky.feed.post", record }) })).json() as any;
    if (!res.uri) throw new Error(`post ${i + 1} refusé : ${JSON.stringify(res).slice(0, 120)}`);
    const ref = { uri: res.uri, cid: res.cid }; if (!root) root = ref; parent = ref;
    console.log(`  ✓ post ${i + 1} : ${res.uri.split("/").pop()}`);
  }
}
main().catch((e) => { console.error(`ÉCHEC : ${(e as Error).message}`); process.exit(1); });
