// Tracker de métriques Recta — la seule boussole qui compte : l'audience.
// Collecte followers + engagement par TYPE de post (Bluesky + Mastodon),
// pour piloter la cadence et le mix de contenu avec des faits.
//
//   npm run metrics              # instantané quotidien (append JSONL)
//   npm run metrics -- --report  # évolution followers + bilan par type
//
// Données : ~/.local/share/recta/metrics.jsonl (une ligne par collecte).

import * as fs from "node:fs";
import * as path from "node:path";
import { loadEnv } from "./social/env";

const DATA_DIR = path.join(process.env.HOME || "/root", ".local", "share", "recta");
const FILE = path.join(DATA_DIR, "metrics.jsonl");
const WINDOW_DAYS = 7; // fenêtre d'engagement par type

interface Counts { posts: number; likes: number; reposts: number; replies: number }
interface Snapshot {
  ts: string;
  bsky?: { followers: number; posts: number };
  masto?: { followers: number; posts: number };
  types?: Record<string, Counts>;
}

/** Classe un post par son texte (marqueurs distinctifs des flux Recta). */
function classify(text: string): string {
  const t = text || "";
  if (/HybR1D/i.test(t)) return "hybrid";
  if (/R3N3G4T/i.test(t)) return "renegat";
  if (/TACTIQUE|RT-\d/i.test(t)) return "tactique";
  if (/ZINE/i.test(t)) return "zine";
  if (/télématique|telematic|telemátic|telematico|テレマティック/i.test(t)) return "console";
  if (/Distributeur|Dispenser|Dispensador|Distributore|配給機/i.test(t)) return "micro";
  if (/pirate|intrusion|onde/i.test(t)) return "pirate";
  return "beat";
}

function add(types: Record<string, Counts>, kind: string, likes: number, reposts: number, replies: number): void {
  const c = (types[kind] ??= { posts: 0, likes: 0, reposts: 0, replies: 0 });
  c.posts++; c.likes += likes; c.reposts += reposts; c.replies += replies;
}

/** Bluesky : profil + feed via l'API publique (sans auth). */
async function collectBsky(handle: string, since: number, types: Record<string, Counts>) {
  const base = "https://public.api.bsky.app/xrpc";
  const prof = (await (await fetch(`${base}/app.bsky.actor.getProfile?actor=${handle}`)).json()) as any;
  const feed = (await (await fetch(`${base}/app.bsky.feed.getAuthorFeed?actor=${handle}&limit=100`)).json()) as any;
  for (const item of feed.feed ?? []) {
    const p = item?.post;
    if (!p?.record?.createdAt || new Date(p.record.createdAt).getTime() < since) continue;
    add(types, classify(p.record.text), p.likeCount ?? 0, p.repostCount ?? 0, p.replyCount ?? 0);
  }
  return { followers: prof.followersCount ?? 0, posts: prof.postsCount ?? 0 };
}

/** Mastodon : compte + statuts récents (token requis). */
async function collectMasto(instance: string, token: string, since: number, types: Record<string, Counts>) {
  const auth = { Authorization: `Bearer ${token}` };
  const me = (await (await fetch(`https://${instance}/api/v1/accounts/verify_credentials`, { headers: auth })).json()) as any;
  if (!me.id) throw new Error(me.error || "verify_credentials sans id");
  const sts = (await (await fetch(`https://${instance}/api/v1/accounts/${me.id}/statuses?limit=40&exclude_replies=true`, { headers: auth })).json()) as any;
  for (const s of Array.isArray(sts) ? sts : []) {
    if (new Date(s.created_at).getTime() < since) continue;
    const text = String(s.content || "").replace(/<[^>]+>/g, " "); // strip HTML
    add(types, classify(text), s.favourites_count ?? 0, s.reblogs_count ?? 0, s.replies_count ?? 0);
  }
  return { followers: me.followers_count ?? 0, posts: me.statuses_count ?? 0 };
}

function loadHistory(): Snapshot[] {
  try {
    return fs.readFileSync(FILE, "utf-8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch { return []; }
}

function report(): void {
  const hist = loadHistory();
  if (hist.length === 0) { console.log("Aucune donnée — lancer d'abord : npm run metrics"); return; }

  console.log("── FOLLOWERS (évolution) ─────────────────────────");
  let prev: Snapshot | undefined;
  for (const s of hist.slice(-14)) {
    const db = prev?.bsky && s.bsky ? s.bsky.followers - prev.bsky.followers : 0;
    const dm = prev?.masto && s.masto ? s.masto.followers - prev.masto.followers : 0;
    const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
    console.log(`${s.ts.slice(0, 10)}  bsky ${s.bsky?.followers ?? "?"} (${fmt(db)})   masto ${s.masto?.followers ?? "?"} (${fmt(dm)})`);
    prev = s;
  }

  const last = hist[hist.length - 1];
  if (last.types) {
    console.log(`\n── ENGAGEMENT PAR TYPE (${WINDOW_DAYS} derniers jours) ──────`);
    const rows = Object.entries(last.types).sort((a, b) => (b[1].likes + b[1].reposts) - (a[1].likes + a[1].reposts));
    for (const [kind, c] of rows) {
      const per = c.posts ? ((c.likes + c.reposts) / c.posts).toFixed(1) : "0";
      console.log(`${kind.padEnd(9)} ${String(c.posts).padStart(3)} posts · ${String(c.likes).padStart(3)} likes · ${String(c.reposts).padStart(3)} reposts · ${String(c.replies).padStart(3)} rép. · ${per}/post`);
    }
    console.log("\n→ Le ratio (likes+reposts)/post dit quel format garder ou couper.");
  }
}

async function main(): Promise<void> {
  if (process.argv.includes("--report")) { report(); return; }

  const env = loadEnv();
  const since = Date.now() - WINDOW_DAYS * 86400000;
  const types: Record<string, Counts> = {};
  const snap: Snapshot = { ts: new Date().toISOString() };

  try {
    snap.bsky = await collectBsky(env.RECTA_BSKY_HANDLE || "robotariis.bsky.social", since, types);
  } catch (e) { console.error(`✗ bsky : ${(e as Error).message}`); }
  try {
    if (env.RECTA_MASTO_INSTANCE && env.RECTA_MASTO_TOKEN)
      snap.masto = await collectMasto(env.RECTA_MASTO_INSTANCE, env.RECTA_MASTO_TOKEN, since, types);
  } catch (e) { console.error(`✗ masto : ${(e as Error).message}`); }
  snap.types = types;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.appendFileSync(FILE, JSON.stringify(snap) + "\n");
  console.log(`✓ instantané : bsky ${snap.bsky?.followers ?? "?"} followers · masto ${snap.masto?.followers ?? "?"} followers → ${FILE}`);
}

main().catch((e) => { console.error(`ÉCHEC : ${(e as Error).message}`); process.exit(1); });
