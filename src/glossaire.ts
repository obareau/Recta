// Définition du glossaire — une entrée du canon présentée comme une fiche
// terminologique émise par l'Oraculum.
//
// La sélection est SEEDÉE PAR LA DATE, comme tout le reste de Recta : deux
// exécutions le même jour tirent la même entrée, et rejouer une date passée la
// reproduit. Sans ça, un incident de publication produirait un terme différent
// au rattrapage, et l'archive du feuilleton mentirait sur ce qui a été émis.
//
// Le glossaire vit dans le vault (00-CANON/glossaire.json), pas dans ce dépôt :
// il est alimenté par le travail d'écriture, et Recta ne fait que le lire.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { rngFor, pick } from "./rng";

export interface GlossaireEntry {
  terme: string;
  anchor: string;
  definition: string;
  abbreviation: string;
  categorie: string;
}

const VAULT_GLOSSAIRE = path.join(
  os.homedir(), "robotariis-writing", "00-CANON", "glossaire.json",
);


// ── Cadrage diégétique (repris de la version du 2026-07-17) ────────────────
// Le choix de la catégorie DIT quelque chose : ce qui relève du pouvoir est
// « défini » par la Rectitude, le reste « fuite » des Archives Libres. Traiter
// les 348 entrées de la même façon perdrait cette lecture.
const RECTITUDE_CAT = /faction|c\.?g\.?u|police|grade|division|administration|rectitude|codex|loi/;

export interface GlossaireFrame {
  head: string;
  link: string;
  rectitude: boolean;
}

export function frameOf(e: GlossaireEntry): GlossaireFrame {
  const rectitude = RECTITUDE_CAT.test((e.categorie || "").toLowerCase());
  return {
    head: rectitude ? "LEXIQUE DE LA RECTITUDE" : "ARCHIVES LIBRES — FRAGMENT FUITÉ",
    link: `https://robotariis.com/glossaire#${e.anchor}`,
    rectitude,
  };
}

// ── Anti-doublon ───────────────────────────────────────────────────────────
// 348 entrées : sans mémoire, le tirage seedé finirait par republier un terme
// avant d'avoir fait le tour. Le cache garde les ancres déjà sorties et se vide
// tout seul quand le cycle est épuisé.
const CACHE_FILE = path.join(process.cwd(), ".glossaire-cache.json");

export function loadCache(file = CACHE_FILE): string[] {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")) as string[]; } catch { return []; }
}

export function recordPublished(anchor: string, file = CACHE_FILE): void {
  const cache = loadCache(file);
  if (!cache.includes(anchor)) cache.push(anchor);
  fs.writeFileSync(file, JSON.stringify(cache));
}

/** Longueur mini d'une définition : une entrée d'un mot ne fait pas une affiche. */
const MIN_DEF = 40;

export function loadGlossaire(file = VAULT_GLOSSAIRE): GlossaireEntry[] {
  const raw = JSON.parse(fs.readFileSync(file, "utf-8")) as GlossaireEntry[];
  return raw.filter(
    (e) => e && typeof e.terme === "string" && e.terme.trim()
      && typeof e.definition === "string" && e.definition.trim().length >= MIN_DEF,
  );
}

/**
 * L'entrée du jour. `seed` par défaut = la date, donc stable dans la journée.
 * `--terme=xxx` permet de forcer une entrée précise (aperçu, rattrapage ciblé).
 */
export function glossaireOfDay(
  opts: { seed?: string; terme?: string; file?: string; force?: boolean } = {},
): GlossaireEntry | null {
  let entries: GlossaireEntry[];
  try {
    entries = loadGlossaire(opts.file);
  } catch {
    return null; // vault absent (autre machine, dépôt public cloné seul)
  }
  if (entries.length === 0) return null;

  if (opts.terme) {
    const want = opts.terme.toLowerCase();
    return entries.find(
      (e) => e.terme.toLowerCase() === want || e.anchor?.toLowerCase() === want,
    ) ?? null;
  }
  // On écarte ce qui est déjà sorti ; cycle épuisé → on repart du début.
  const cache = opts.force ? [] : loadCache();
  let pool = entries.filter((e) => !cache.includes(e.anchor));
  if (pool.length === 0) pool = entries;

  const seed = opts.seed ?? new Date().toISOString().slice(0, 10);
  return pick(rngFor(seed, "glossaire"), pool);
}
