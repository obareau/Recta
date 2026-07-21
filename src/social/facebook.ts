// Client Facebook (Graph API v21.0) — extrait des ex-publish/pirate-fb/tactique-fb.
// Le token stocké est un token de Page longue durée (obtenu au setup) ; on le
// vérifie via debug_token et on le résout au besoin.

import type { Env } from "./env";

const GRAPH = "https://graph.facebook.com/v21.0";

export async function graph<T>(pathname: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${GRAPH}${pathname}?${new URLSearchParams(params)}`);
  const data = (await res.json()) as T & { error?: { message: string } };
  if (data.error) throw new Error(`Graph API : ${data.error.message}`);
  return data;
}

/** Token utilisateur court → longue durée → token de la Page. */
export async function resolvePageToken(env: Env): Promise<string> {
  const token = env.RECTA_FB_TOKEN;
  if (!token) throw new Error("RECTA_FB_TOKEN manquant dans ~/.config/recta/env");
  const appToken = env.RECTA_FB_APP_ID && env.RECTA_FB_APP_SECRET
    ? `${env.RECTA_FB_APP_ID}|${env.RECTA_FB_APP_SECRET}` : token;
  try {
    const info = await graph<{ data?: { type?: string } }>("/debug_token", {
      input_token: token, access_token: appToken,
    });
    if (info.data?.type === "PAGE") return token;
  } catch {
    // debug_token indisponible : on tente la résolution utilisateur ci-dessous.
  }
  const pages = await graph<{ data?: { id: string; access_token: string }[] }>(
    "/me/accounts", { access_token: token },
  );
  const page = pages.data?.find((p) => p.id === env.RECTA_FB_PAGE_ID);
  if (!page) throw new Error(`La Page ${env.RECTA_FB_PAGE_ID} n'est pas accessible avec ce token.`);
  return page.access_token;
}

/** Poste une photo + légende sur la Page. Retourne l'id du post. */
export async function postPhoto(env: Env, png: Buffer, caption: string): Promise<string> {
  if (!env.RECTA_FB_PAGE_ID) throw new Error("RECTA_FB_PAGE_ID manquant");
  const token = await resolvePageToken(env);
  const form = new FormData();
  form.set("source", new Blob([new Uint8Array(png)], { type: "image/png" }), "recta.png");
  form.set("caption", caption);
  form.set("access_token", token);
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/photos`, { method: "POST", body: form });
  const data = (await res.json()) as { id?: string; post_id?: string; error?: { message: string } };
  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  return data.post_id ?? data.id ?? "?";
}

/** Poste une vidéo MP4 + légende sur la Page. Retourne l'id de la vidéo. */
export async function postVideo(env: Env, mp4: Buffer, description: string): Promise<string> {
  if (!env.RECTA_FB_PAGE_ID) throw new Error("RECTA_FB_PAGE_ID manquant");
  const token = await resolvePageToken(env);
  const form = new FormData();
  form.set("source", new Blob([new Uint8Array(mp4)], { type: "video/mp4" }), "recta.mp4");
  form.set("description", description);
  form.set("access_token", token);
  const res = await fetch(`${GRAPH}/${env.RECTA_FB_PAGE_ID}/videos`, { method: "POST", body: form });
  const data = (await res.json()) as { id?: string; error?: { message: string } };
  if (data.error) throw new Error(`Publication refusée : ${data.error.message}`);
  return data.id ?? "?";
}
