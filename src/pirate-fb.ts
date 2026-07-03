// Transmission pirate Facebook — Nova 7 ou les Renégats détournent la Page.
// L'Oraculum poste chaque matin ; les pirates répliquent, par surprise.
//
//   npm run pirate           # ~35% de chance de poster (sporadique)
//   npm run pirate -- --force  # poste à coup sûr
//
// Réutilise les secrets de ~/.config/recta/env (comme publish.ts).

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { rngFor } from "./rng";
import { pirateFor } from "./pirate-content";

const GRAPH = "https://graph.facebook.com/v21.0";
const FIRE_CHANCE = 0.35; // sporadique : ~1 jour sur 3

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
  } catch { /* on tentera la résolution utilisateur */ }
  const pages = await graph<{ data?: { id: string; access_token: string }[] }>("/me/accounts", { access_token: token });
  const page = pages.data?.find((p) => p.id === env.RECTA_FB_PAGE_ID);
  if (!page) throw new Error(`Page ${env.RECTA_FB_PAGE_ID} inaccessible`);
  return page.access_token;
}

/** Légende du post — même seed que l'affiche (contenu cohérent). */
function buildCaption(seed: string): string {
  const p = pirateFor(seed);
  return (
    `◂ TRANSMISSION NON AUTORISÉE — ${p.tag} ▸\n\n` +
    p.lines.join("\n") + "\n\n" +
    `${p.sign}\n\n` +
    `— le C.G.U. ne contrôle pas cette fréquence · ce signal n'existe pas —\n▸ robotariis.com`
  );
}

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const today = new Date();
  const seed = `pirate:${today.toISOString().slice(0, 13)}`; // varie à l'heure près
  if (!force && rngFor(seed, "gate")() > FIRE_CHANCE) {
    console.log("Pas d'intrusion aujourd'hui (les pirates sont discrets).");
    return;
  }
  const env = loadEnv();
  if (!env.RECTA_FB_PAGE_ID) throw new Error("RECTA_FB_PAGE_ID manquant");

  // 1. Rendre l'affiche pirate détournée (même seed) via Electron.
  const png = path.resolve("export", `pirate-${today.toISOString().slice(0, 13).replace(":", "")}.png`);
  execFileSync("npx", ["electron", ".", "--no-sandbox", `--pirate=${seed}`, `--pirateout=${png}`], { stdio: "inherit" });
  if (!fs.existsSync(png)) throw new Error(`Affiche pirate introuvable : ${png}`);

  // 2. Poster l'IMAGE avec la légende.
  const token = await resolvePageToken(env);
  const form = new FormData();
  form.set("source", new Blob([fs.readFileSync(png)], { type: "image/png" }), path.basename(png));
  form.set("caption", buildCaption(seed));
  form.set("access_token", token);
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/photos`, { method: "POST", body: form });
  const data = (await res.json()) as { id?: string; post_id?: string; error?: { message: string } };
  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  console.log(`Intrusion pirate publiée : ${data.post_id ?? data.id}`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
