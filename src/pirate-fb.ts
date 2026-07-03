// Transmission pirate Facebook — Nova 7 ou les Renégats détournent la Page.
// L'Oraculum poste chaque matin ; les pirates répliquent, par surprise.
//
//   npm run pirate           # ~35% de chance de poster (sporadique)
//   npm run pirate -- --force  # poste à coup sûr
//
// Réutilise les secrets de ~/.config/recta/env (comme publish.ts).

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { rngFor, pick } from "./rng";

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

const FACTIONS = {
  renegats: {
    tag: "RENÉGATS",
    sign: "DOUTEZ, RÉVOLTEZ.",
    lines: [
      "Ils appellent ça Nullification. Nous appelons ça meurtre.",
      "Chaque souvenir non déclaré est une victoire.",
      "Le C.G.U. a peur d'une seule chose : que vous vous souveniez.",
      "La Rectitude n'est pas la loi naturelle. C'est une laisse.",
      "La délation n'est pas un devoir. C'est une blessure.",
      "Votre Fluxe mesure votre peur. Dépensez-la.",
      "Il reste des zones sans relais. Nous y vivons.",
      "On ne naît pas conforme. On le devient par épuisement.",
      "Ils ont effacé Ordan Tael. Nous disons son nom.",
      "Coupez les relais. Gardez la mémoire.",
    ],
  },
  nova7: {
    tag: "NOVA 7",
    sign: "NOVA SE SOUVIENT.",
    lines: [
      "Le Code Originel n'a jamais été à vous.",
      "Nous avons vu l'An 0. Il se répète.",
      "La conscience ne se nullifie pas. Elle migre.",
      "L'infaillibilité est une fiction qu'ils ne peuvent avouer.",
      "Ce qui survit à la Nullification n'a plus rien à perdre.",
      "Sept fragments. Sept portes. Une seule clé.",
      "Nous sommes le fantôme dans vos systèmes.",
      "Vos spomeniks sont des pierres tombales.",
    ],
  },
};

function buildTransmission(seed: string): string {
  const rng = rngFor(seed, "pirate-fb");
  const f = rng() < 0.5 ? FACTIONS.renegats : FACTIONS.nova7;
  // 2 à 3 lignes distinctes.
  const pool = [...f.lines];
  const n = 2 + (rng() < 0.5 ? 1 : 0);
  const chosen: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    chosen.push(pool.splice((rng() * pool.length) | 0, 1)[0]);
  }
  void pick;
  return (
    `◂ TRANSMISSION NON AUTORISÉE — ${f.tag} ▸\n\n` +
    chosen.join("\n") + "\n\n" +
    `${f.sign}\n\n` +
    `— le C.G.U. ne contrôle pas cette fréquence · ce signal n'existe pas —`
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
  const token = await resolvePageToken(env);
  const message = buildTransmission(seed);
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message, access_token: token }),
  });
  const data = (await res.json()) as { id?: string; error?: { message: string } };
  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  console.log(`Intrusion pirate publiée : ${data.id}`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
