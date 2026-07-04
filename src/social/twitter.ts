// Client X (Twitter API v2) — cross-posting Recta
// Bearer Token (OAuth 2.0)

import type { Env } from "./env";

const API = "https://api.twitter.com/2/tweets";

/** Poster un tweet via Bearer Token. */
export async function postTweet(env: Env, text: string): Promise<string> {
  const bearerToken = env.RECTA_X_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error("RECTA_X_BEARER_TOKEN manquant");
  }

  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = (await res.json()) as any;
  if (!res.ok || data.errors) {
    throw new Error(`X API : ${data.errors?.[0]?.message || res.status}`);
  }

  return `https://twitter.com/i/web/status/${data.data.id}`;
}
