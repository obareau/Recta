// Relevé hebdomadaire des audiences — FB (fan_count) + Bluesky (followers) +
// Mastodon (followers). Écrit une ligne récap sur stdout (le script broadcast
// la relaie à ntfy) et journalise dans ~/.config/recta/stats.log pour la tendance.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { loadEnv } from "./env";
import { graph, resolvePageToken } from "./facebook";

const LOG = path.join(os.homedir(), ".config", "recta", "stats.log");

async function facebookFans(env: Record<string, string>): Promise<number | null> {
  try {
    if (!env.RECTA_FB_PAGE_ID) return null;
    const token = await resolvePageToken(env);
    const d = await graph<{ fan_count?: number; followers_count?: number }>(
      `/${env.RECTA_FB_PAGE_ID}`, { fields: "fan_count,followers_count", access_token: token },
    );
    return d.followers_count ?? d.fan_count ?? null;
  } catch { return null; }
}

async function blueskyFollowers(env: Record<string, string>): Promise<number | null> {
  try {
    const actor = env.RECTA_BSKY_HANDLE;
    if (!actor) return null;
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`,
    );
    const d = (await res.json()) as { followersCount?: number };
    return d.followersCount ?? null;
  } catch { return null; }
}

async function mastodonFollowers(env: Record<string, string>): Promise<number | null> {
  try {
    const inst = env.RECTA_MASTO_INSTANCE, token = env.RECTA_MASTO_TOKEN;
    if (!inst || !token) return null;
    const url = inst.startsWith("http") ? inst.replace(/\/$/, "") : `https://${inst}`;
    const res = await fetch(`${url}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = (await res.json()) as { followers_count?: number };
    return d.followers_count ?? null;
  } catch { return null; }
}

/** Dernière ligne du log → deltas depuis le dernier relevé. */
function previous(): Record<string, number> {
  if (!fs.existsSync(LOG)) return {};
  const lines = fs.readFileSync(LOG, "utf-8").trim().split("\n").filter(Boolean);
  const last = lines[lines.length - 1];
  const out: Record<string, number> = {};
  for (const m of last?.matchAll(/(FB|BSKY|MASTO)=(\d+)/g) ?? []) out[m[1]] = Number(m[2]);
  return out;
}

function fmt(label: string, now: number | null, prev?: number): string {
  if (now === null) return `${label}=—`;
  const delta = prev === undefined ? "" : ` (${now - prev >= 0 ? "+" : ""}${now - prev})`;
  return `${label}=${now}${delta}`;
}

async function main(): Promise<void> {
  const env = loadEnv();
  const prev = previous();
  const [fb, bsky, masto] = await Promise.all([
    facebookFans(env), blueskyFollowers(env), mastodonFollowers(env),
  ]);
  const parts = [
    fmt("FB", fb, prev.FB), fmt("BSKY", bsky, prev.BSKY), fmt("MASTO", masto, prev.MASTO),
  ];
  const line = parts.join(" · ");
  // Ligne journalisée (parseable) + ligne humaine sur stdout.
  const stamp = new Date().toISOString().slice(0, 10);
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.appendFileSync(LOG, `${stamp} ${line.replace(/ \([^)]*\)/g, "")}\n`);
  console.log(line);
}

main().catch((e) => { console.error(`STATS ÉCHEC : ${(e as Error).message}`); process.exit(1); });
