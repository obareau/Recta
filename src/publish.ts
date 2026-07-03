// Publication Facebook — l'Oraculum poste le communiqué du jour sur la Page.
//
//   npm run publish            # exporte l'affiche du jour puis la poste
//
// Secrets dans ~/.config/recta/env (jamais versionnés) :
//   RECTA_FB_APP_ID, RECTA_FB_APP_SECRET, RECTA_FB_PAGE_ID, RECTA_FB_TOKEN
// RECTA_FB_TOKEN peut être un token utilisateur (EAA…) : l'échange longue
// durée et la résolution du token de Page sont automatiques.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { communiqueFor } from "./logic";

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
  const url = `${GRAPH}${pathname}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const data = (await res.json()) as T & { error?: { message: string } };
  if (data.error) throw new Error(`Graph API : ${data.error.message}`);
  return data;
}

/** Token utilisateur court → longue durée → token de la Page. */
async function resolvePageToken(env: Record<string, string>): Promise<string> {
  let token = env.RECTA_FB_TOKEN;
  if (!token) throw new Error("RECTA_FB_TOKEN manquant dans ~/.config/recta/env");
  if (env.RECTA_FB_APP_ID && env.RECTA_FB_APP_SECRET) {
    const long = await graph<{ access_token: string }>("/oauth/access_token", {
      grant_type: "fb_exchange_token",
      client_id: env.RECTA_FB_APP_ID,
      client_secret: env.RECTA_FB_APP_SECRET,
      fb_exchange_token: token,
    });
    token = long.access_token;
  }
  // Si c'est un token utilisateur, récupère celui de la Page visée.
  const pages = await graph<{ data?: { id: string; access_token: string }[] }>("/me/accounts", { access_token: token });
  const page = pages.data?.find((p) => p.id === env.RECTA_FB_PAGE_ID);
  return page?.access_token ?? token; // déjà un token de Page sinon
}

async function main(): Promise<void> {
  const env = loadEnv();
  if (!env.RECTA_FB_PAGE_ID) throw new Error("RECTA_FB_PAGE_ID manquant dans ~/.config/recta/env");

  // 1. L'affiche du jour (n=1 : le communiqué A) + la note vault.
  const outDir = path.resolve("export");
  execFileSync("npx", ["electron", ".", "--no-sandbox", "--n=1", `--outdir=${outDir}`], { stdio: "inherit" });
  const today = new Date();
  const stamp = today.toISOString().slice(0, 10);
  const png = path.join(outDir, `communique-recta-${stamp}-01.png`);
  if (!fs.existsSync(png)) throw new Error(`Affiche introuvable : ${png}`);

  // 2. Le texte du post — même seed que l'affiche.
  const c = communiqueFor(`recta:${today.toDateString()}`, today, 0);
  const caption =
    `⬢ COMMUNIQUÉ N° ${c.numero} — ${c.type}\n\n${c.corps}\n\n${c.devise}\n\n` +
    `▸ robotariis.com\n#robotariis #retrofuturisme #scifi`;

  // 3. Publication.
  const token = await resolvePageToken(env);
  const form = new FormData();
  form.set("source", new Blob([fs.readFileSync(png)], { type: "image/png" }), path.basename(png));
  form.set("caption", caption);
  form.set("access_token", token);
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/photos`, { method: "POST", body: form });
  const data = (await res.json()) as { id?: string; post_id?: string; error?: { message: string } };
  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  console.log(`Publié : post ${data.post_id ?? data.id} — l'Oraculum a diffusé.`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  console.error("L'affiche et la note vault restent produites dans export/ et com-recta/.");
  process.exit(1);
});
