// Client Bluesky (protocole atproto) en fetch pur — aucune dépendance npm.
// Flux : createSession → uploadBlob (PNG) → createRecord (app.bsky.feed.post
// avec embed app.bsky.embed.images + alt text).
// Limite d'un post : 300 graphèmes (voir text.clamp).

import type { Env } from "./env";
import { clamp } from "./text";

const PDS = "https://bsky.social/xrpc";
export const BSKY_LIMIT = 300;

interface Session { accessJwt: string; did: string; }
interface BlobRef { $type: "blob"; ref: { $link: string }; mimeType: string; size: number; }

async function xrpc<T>(
  method: string, endpoint: string,
  opts: { token?: string; json?: unknown; body?: Buffer; contentType?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.body) {
    headers["Content-Type"] = opts.contentType ?? "application/octet-stream";
    body = new Uint8Array(opts.body);
  }
  const res = await fetch(`${PDS}/${endpoint}`, { method, headers, body });
  const data = (await res.json()) as T & { error?: string; message?: string };
  if (!res.ok || (data as { error?: string }).error) {
    throw new Error(`Bluesky ${endpoint} : ${data.message ?? data.error ?? res.status}`);
  }
  return data;
}

async function createSession(env: Env): Promise<Session> {
  const identifier = env.RECTA_BSKY_HANDLE;
  const password = env.RECTA_BSKY_PASSWORD;
  if (!identifier || !password) throw new Error("RECTA_BSKY_HANDLE / RECTA_BSKY_PASSWORD manquants");
  return xrpc<Session>("POST", "com.atproto.server.createSession", { json: { identifier, password } });
}

/** Poste une image + texte sur Bluesky. Retourne l'URI at:// du post. */
export async function postImage(env: Env, png: Buffer, text: string, alt: string): Promise<string> {
  const session = await createSession(env);
  const blob = await xrpc<{ blob: BlobRef }>("POST", "com.atproto.repo.uploadBlob", {
    token: session.accessJwt, body: png, contentType: "image/png",
  });
  const record = {
    $type: "app.bsky.feed.post",
    text: clamp(text, BSKY_LIMIT),
    createdAt: new Date().toISOString(),
    langs: ["fr", "en"],
    embed: {
      $type: "app.bsky.embed.images",
      images: [{ alt: clamp(alt, 1000), image: blob.blob }],
    },
  };
  const out = await xrpc<{ uri: string }>("POST", "com.atproto.repo.createRecord", {
    token: session.accessJwt,
    json: { repo: session.did, collection: "app.bsky.feed.post", record },
  });
  return out.uri;
}
