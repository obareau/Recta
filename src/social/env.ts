// Chargement des secrets ~/.config/recta/env (chmod 600, jamais versionné).
// Partagé par tous les clients réseaux (Facebook, Bluesky, Mastodon).
//
// Clés attendues :
//   RECTA_FB_APP_ID, RECTA_FB_APP_SECRET, RECTA_FB_PAGE_ID, RECTA_FB_TOKEN
//   RECTA_BSKY_HANDLE, RECTA_BSKY_PASSWORD
//   RECTA_MASTO_INSTANCE, RECTA_MASTO_TOKEN

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export type Env = Record<string, string>;

/** Lit le fichier env + surcharge par les variables RECTA_* du process. */
export function loadEnv(): Env {
  const p = path.join(os.homedir(), ".config", "recta", "env");
  const env: Env = {};
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.+)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  for (const k of Object.keys(process.env)) {
    if (k.startsWith("RECTA_") && process.env[k]) env[k] = process.env[k]!;
  }
  return env;
}
