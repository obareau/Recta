// Poste une Tactique Recta (affiche brève) sur la Page.
//   npm run tactique          # poste la tactique du jour
//   npm run tactique -- --seed=xyz
// Réutilise les secrets de ~/.config/recta/env.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { resolveTactique } from "./tactiques-gen";

const GRAPH = "https://graph.facebook.com/v21.0";

function loadEnv(): Record<string, string> {
  const p = path.join(os.homedir(), ".config", "recta", "env");
  const env: Record<string, string> = {};
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.+)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("RECTA_FB_") && process.env[k]) env[k] = process.env[k]!;
  }
  return env;
}

async function graph<T>(pathname: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${GRAPH}${pathname}?${new URLSearchParams(params)}`);
  const data = (await res.json()) as T & { error?: { message: string } };
  if (data.error) throw new Error(`Graph API : ${data.error.message}`);
  return data;
}

async function resolvePageToken(env: Record<string, string>): Promise<string> {
  const token = env.RECTA_FB_TOKEN;
  if (!token) throw new Error("RECTA_FB_TOKEN manquant");
  const appToken = env.RECTA_FB_APP_ID && env.RECTA_FB_APP_SECRET
    ? `${env.RECTA_FB_APP_ID}|${env.RECTA_FB_APP_SECRET}` : token;
  try {
    const info = await graph<{ data?: { type?: string } }>("/debug_token", { input_token: token, access_token: appToken });
    if (info.data?.type === "PAGE") return token;
  } catch { /* résolution utilisateur */ }
  const pages = await graph<{ data?: { id: string; access_token: string }[] }>("/me/accounts", { access_token: token });
  const page = pages.data?.find((p) => p.id === env.RECTA_FB_PAGE_ID);
  if (!page) throw new Error(`Page ${env.RECTA_FB_PAGE_ID} inaccessible`);
  return page.access_token;
}

function argSeed(): string {
  const a = process.argv.find((x) => x.startsWith("--seed="));
  return a ? a.slice(7) : `tactique:${new Date().toISOString().slice(0, 10)}`;
}

async function main(): Promise<void> {
  const env = loadEnv();
  if (!env.RECTA_FB_PAGE_ID) throw new Error("RECTA_FB_PAGE_ID manquant");
  const seed = argSeed();
  const t = resolveTactique(seed);

  const png = path.resolve("export", `tactique-${seed.replace(/[^a-z0-9]+/gi, "-")}.png`);
  execFileSync("npx", ["electron", ".", "--no-sandbox", `--tactique=${seed}`, `--tactiqueout=${png}`], { stdio: "inherit" });
  if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);

  const caption =
    `⬢ TACTIQUE RECTA ${t.code} — ${t.segLabel}\n\n${t.text}\n\n` +
    `Protocole de décision du C.G.U. — usage opérationnel uniquement.\n▸ robotariis.com`;
  const token = await resolvePageToken(env);
  const form = new FormData();
  form.set("source", new Blob([fs.readFileSync(png)], { type: "image/png" }), path.basename(png));
  form.set("caption", caption);
  form.set("access_token", token);
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/photos`, { method: "POST", body: form });
  const data = (await res.json()) as { id?: string; post_id?: string; error?: { message: string } };
  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  console.log(`Tactique ${t.code} publiée : ${data.post_id ?? data.id}`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
