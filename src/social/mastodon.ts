// Client Mastodon (API REST) en fetch pur.
// Flux : POST /api/v2/media (multipart + description=alt) → POST /api/v1/statuses.
// Limite d'un statut : 500 caractères (par défaut sur la plupart des instances).

import type { Env } from "./env";
import { clamp } from "./text";

export const MASTO_LIMIT = 500;

function base(env: Env): string {
  const inst = env.RECTA_MASTO_INSTANCE;
  if (!inst) throw new Error("RECTA_MASTO_INSTANCE manquant");
  return inst.startsWith("http") ? inst.replace(/\/$/, "") : `https://${inst}`;
}

/** Poste une image + texte sur Mastodon. Retourne l'URL du statut. */
export async function postImage(env: Env, png: Buffer, text: string, alt: string): Promise<string> {
  const token = env.RECTA_MASTO_TOKEN;
  if (!token) throw new Error("RECTA_MASTO_TOKEN manquant");
  const url = base(env);
  const auth = { Authorization: `Bearer ${token}` };

  // 1. Upload du média (v2 = traitement asynchrone possible ; l'id suffit).
  const media = new FormData();
  media.set("file", new Blob([new Uint8Array(png)], { type: "image/png" }), "recta.png");
  media.set("description", clamp(alt, 1500));
  const mres = await fetch(`${url}/api/v2/media`, { method: "POST", headers: auth, body: media });
  const mdata = (await mres.json()) as { id?: string; error?: string };
  if (!mres.ok || mdata.error || !mdata.id) throw new Error(`Mastodon média : ${mdata.error ?? mres.status}`);

  // 2. Publication du statut avec le média attaché.
  const sres = await fetch(`${url}/api/v1/statuses`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ status: clamp(text, MASTO_LIMIT), media_ids: [mdata.id], language: "fr" }),
  });
  const sdata = (await sres.json()) as { url?: string; error?: string };
  if (!sres.ok || sdata.error) throw new Error(`Mastodon statut : ${sdata.error ?? sres.status}`);
  return sdata.url ?? "?";
}
