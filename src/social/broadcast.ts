// Orchestrateur multi-réseaux — poste une affiche + légende vers N réseaux.
// Chaque réseau est isolé dans son propre try/catch : une panne (token expiré,
// instance down) ne bloque pas les autres. Retourne un bilan par réseau.
//
// Alternance FR/EN : l'affiche reste FR (identité visuelle) ; sur Bluesky et
// Mastodon, la LÉGENDE alterne selon le jour du mois (pair=FR, impair=EN).
// Facebook garde le FR (audience francophone historique de la Page).

import type { Env } from "./env";
import type { Lang } from "../i18n";
import { tagsFor } from "../i18n-captions";
import { postPhoto } from "./facebook";
import * as bluesky from "./bluesky";
import * as mastodon from "./mastodon";

export type Network = "facebook" | "bluesky" | "mastodon";

export interface Captions {
  fr: string;
  en: string;
  alt: string; // texte alternatif (accessibilité) — court, factuel
}

export interface BroadcastResult {
  network: Network;
  ok: boolean;
  id?: string;
  error?: string;
}

/** Langue de la légende du jour pour les réseaux bilingues. */
export function langForDate(d: Date): "fr" | "en" {
  return d.getDate() % 2 === 0 ? "fr" : "en";
}

/** Légende à utiliser pour un réseau donné. FB toujours FR ; le reste alterne. */
export function captionFor(network: Network, caps: Captions, d: Date): string {
  if (network === "facebook") return caps.fr;
  return langForDate(d) === "en" ? caps.en : caps.fr;
}

/**
 * Diffuse l'affiche vers les réseaux demandés. `dry` = n'appelle aucune API,
 * renvoie juste ce qui SERAIT posté (pour --dry).
 */
export async function broadcast(
  env: Env,
  png: Buffer,
  caps: Captions,
  networks: Network[],
  opts: { dry?: boolean; date?: Date; lang?: Lang } = {},
): Promise<BroadcastResult[]> {
  const d = opts.date ?? new Date();
  const lang = opts.lang ?? "fr";
  const results: BroadcastResult[] = [];
  for (const network of networks) {
    let text = captionFor(network, caps, d);
    // Ajouter hashtags selon la langue du day (pour Bluesky seul)
    if (network === "bluesky" && !text.includes("#")) {
      text = `${text}\n${tagsFor(lang)}`;
    }
    if (opts.dry) {
      console.log(`\n─── ${network.toUpperCase()} ───\n${text}\n[alt] ${caps.alt}`);
      results.push({ network, ok: true, id: "(dry)" });
      continue;
    }
    try {
      let id: string;
      if (network === "facebook") id = await postPhoto(env, png, text);
      else if (network === "bluesky") id = await bluesky.postImage(env, png, text, caps.alt);
      else id = await mastodon.postImage(env, png, text, caps.alt);
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

/** Parse --net=facebook,bluesky (défaut : les trois). */
export function networksFromArgs(argv: string[]): Network[] {
  const arg = argv.find((a) => a.startsWith("--net="))?.slice(6);
  const all: Network[] = ["facebook", "bluesky", "mastodon"];
  if (!arg) return all;
  return arg.split(",").map((s) => s.trim()).filter((s): s is Network =>
    all.includes(s as Network));
}
