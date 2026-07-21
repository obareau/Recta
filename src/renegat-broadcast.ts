// Diffusion d'un avis R3N3G4T sur les 3 réseaux — extrait de renegat-publish.ts
// pour être partagé avec renegat-cli.ts (déclenché depuis la galerie Iris).
// Chaque réseau isolé dans son propre try/catch, comme social/broadcast.ts.

import type { Env } from "./social/env";
import * as bluesky from "./social/bluesky";
import * as mastodon from "./social/mastodon";
import { postPhoto as fbPostPhoto } from "./social/facebook";

export type RenegatNetwork = "facebook" | "bluesky" | "mastodon";

export interface RenegatPostResult {
  network: RenegatNetwork;
  ok: boolean;
  id?: string;
  error?: string;
}

export async function postRenegat(
  env: Env,
  png: Buffer,
  caption: string,
  alt: string
): Promise<RenegatPostResult[]> {
  const results: RenegatPostResult[] = [];
  for (const network of ["facebook", "bluesky", "mastodon"] as const) {
    try {
      let id: string;
      if (network === "facebook") id = await fbPostPhoto(env, png, caption);
      else if (network === "bluesky") id = await bluesky.postImage(env, png, caption, alt);
      else id = await mastodon.postImage(env, png, caption, alt);
      results.push({ network, ok: true, id });
      console.log(`✓ ${network} : ${id}`);
    } catch (e) {
      const error = (e as Error).message;
      results.push({ network, ok: false, error });
      console.error(`✗ ${network} : ${error}`);
    }
  }
  return results;
}
