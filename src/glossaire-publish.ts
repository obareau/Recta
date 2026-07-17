// Publication « définition du glossaire » (Bluesky + Mastodon), texte + lien.
//
//   npm run glossaire -- --dry     # compose et montre, ne poste rien
//   npm run glossaire              # poste la définition du jour (anti-doublon)
//   npm run glossaire -- --force   # ignore le cache
//   npm run glossaire -- --seed=xxx
//
// Source : ~/robotariis-writing/00-CANON/glossaire.json (générée depuis le canon).
// Cadrage diégétique : la Rectitude « définit », ou les Archives Libres « fuitent ».
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { loadEnv } from "./social/env";

const XRPC = "https://bsky.social/xrpc";
const enc = new TextEncoder();
const GLOSS = join(homedir(), "robotariis-writing/00-CANON/glossaire.json");
const CACHE = join(homedir(), "DEV/Recta/.glossaire-cache.json");
const URL_BASE = "https://robotariis.com/glossaire#";

interface Entry { terme: string; anchor: string; definition: string; abbreviation: string; categorie: string; }
const gl = (s: string) => [...new Intl.Segmenter().segment(s)].length;
const argOf = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);

function hash(s: string): number { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

// Cadre selon la catégorie : le pouvoir définit, la résistance fuite.
function frame(e: Entry): { head: string; link: string } {
  const c = e.categorie.toLowerCase();
  const rectitude = /faction|c\.?g\.?u|police|grade|division|administration|rectitude|codex|loi/.test(c);
  const head = rectitude ? "▮ LEXIQUE DE LA RECTITUDE" : "⟡ Archives Libres — fragment fuité";
  return { head, link: URL_BASE + e.anchor };
}

function compose(e: Entry): string {
  const { head, link } = frame(e);
  const abbr = e.abbreviation ? ` (${e.abbreviation})` : "";
  const tail = `\n\n↳ ${link}`;
  const fixed = `${head}\n\n${e.terme}${abbr} — ` + tail;
  const budget = 300 - gl(fixed) - 1;
  let def = e.definition.trim();
  if (gl(def) > budget) def = [...new Intl.Segmenter().segment(def)].slice(0, Math.max(0, budget - 1)).map((x) => x.segment).join("").trimEnd() + "…";
  return `${head}\n\n${e.terme}${abbr} — ${def}${tail}`;
}

function linkFacets(text: string) {
  const facets: any[] = [];
  const re = /https?:\/\/[^\s]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const byteStart = enc.encode(text.slice(0, m.index)).length;
    facets.push({ index: { byteStart, byteEnd: byteStart + enc.encode(m[0]).length },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: m[0] }] });
  }
  return facets;
}

async function main() {
  const dry = process.argv.includes("--dry");
  const force = process.argv.includes("--force");
  const entries: Entry[] = JSON.parse(readFileSync(GLOSS, "utf-8"));
  let cache: string[] = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf-8")) : [];
  let pool = force ? entries : entries.filter((e) => !cache.includes(e.anchor));
  if (pool.length === 0) { cache = []; pool = entries; }               // cycle épuisé → on repart
  const seed = argOf("seed") || new Date().toISOString().slice(0, 10);
  const e = pool[hash(seed) % pool.length];
  const text = compose(e);
  console.log(`définition : ${e.terme} [${e.categorie}]  (${gl(text)} graphèmes)`);
  console.log("─".repeat(48) + `\n${text}\n` + "─".repeat(48));
  if (gl(text) > 300) throw new Error("post > 300 graphèmes");
  if (dry) { console.log("(--dry : rien posté)"); return; }

  const env = loadEnv();
  // Bluesky (facet lien)
  const s: any = await (await fetch(`${XRPC}/com.atproto.server.createSession`, { method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: env.RECTA_BSKY_HANDLE, password: env.RECTA_BSKY_PASSWORD }) })).json();
  if (!s.accessJwt) throw new Error("Bluesky : connexion refusée");
  const facets = linkFacets(text);
  const rec: any = { $type: "app.bsky.feed.post", text, createdAt: new Date().toISOString(), langs: ["fr"], ...(facets.length ? { facets } : {}) };
  const bres: any = await (await fetch(`${XRPC}/com.atproto.repo.createRecord`, { method: "POST",
    headers: { Authorization: `Bearer ${s.accessJwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ repo: s.did, collection: "app.bsky.feed.post", record: rec }) })).json();
  if (!bres.uri) throw new Error(`Bluesky refusé : ${JSON.stringify(bres).slice(0, 120)}`);
  console.log(`  ✓ Bluesky : ${bres.uri.split("/").pop()}`);

  // Mastodon (auto-lien)
  if (env.RECTA_MASTO_TOKEN && env.RECTA_MASTO_INSTANCE) {
    const inst = env.RECTA_MASTO_INSTANCE.replace(/\/$/, "");
    const mres: any = await (await fetch(`${inst}/api/v1/statuses`, { method: "POST",
      headers: { Authorization: `Bearer ${env.RECTA_MASTO_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: text, language: "fr" }) })).json();
    if (mres.url) console.log(`  ✓ Mastodon : ${mres.url}`); else console.log(`  ⚠ Mastodon : ${mres.error ?? "?"}`);
  }

  cache.push(e.anchor);
  writeFileSync(CACHE, JSON.stringify(cache));
  console.log(`  → cache : ${cache.length}/${entries.length} définitions postées`);
}
main().catch((e) => { console.error(`ÉCHEC : ${(e as Error).message}`); process.exit(1); });
