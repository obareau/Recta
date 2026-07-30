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
  opts: { seed?: string; terme?: string; file?: string } = {},
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
  const seed = opts.seed ?? new Date().toISOString().slice(0, 10);
  return pick(rngFor(seed, "glossaire"), entries);
}
