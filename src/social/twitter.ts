// Client X (Twitter API v2) — cross-posting Recta
// OAuth 1.0a via tweetsodium pour signatures

import crypto from "crypto";
import type { Env } from "./env";

const API = "https://api.twitter.com/2/tweets";

/** Générer signature OAuth 1.0a. */
function oauth1Sign(
  method: string,
  url: string,
  params: Record<string, string>,
  secrets: { consumerSecret: string; tokenSecret: string },
): string {
  const baseParams = {
    oauth_consumer_key: params.consumer_key,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: params.token,
    oauth_version: "1.0",
  };

  const allParams = { ...baseParams, ...params };
  delete allParams.consumer_key;
  delete allParams.token;

  const sorted = Object.keys(allParams)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(allParams[k])}`)
    .join("&");

  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sorted)}`;
  const signingKey = `${encodeURIComponent(secrets.consumerSecret)}&${encodeURIComponent(secrets.tokenSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

  return signature;
}

/** Poster un tweet. */
export async function postTweet(env: Env, text: string): Promise<string> {
  const key = env.RECTA_X_API_KEY;
  const secret = env.RECTA_X_API_SECRET;
  const token = env.RECTA_X_ACCESS_TOKEN;
  const tokenSecret = env.RECTA_X_ACCESS_SECRET;

  if (!key || !secret || !token || !tokenSecret) {
    throw new Error("X credentials manquants (RECTA_X_*)");
  }

  const params: Record<string, string> = {
    consumer_key: key,
    token: token,
  };

  const sig = oauth1Sign("POST", API, params, {
    consumerSecret: secret,
    tokenSecret: tokenSecret,
  });

  const authHeader =
    `OAuth oauth_consumer_key="${key}", ` +
    `oauth_token="${token}", ` +
    `oauth_signature_method="HMAC-SHA1", ` +
    `oauth_signature="${encodeURIComponent(sig)}", ` +
    `oauth_timestamp="${Math.floor(Date.now() / 1000)}", ` +
    `oauth_nonce="${crypto.randomBytes(16).toString("hex")}", ` +
    `oauth_version="1.0"`;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: authHeader,
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
