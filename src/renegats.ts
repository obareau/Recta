// Avis de recherche R3N3G4TS — photos + légende procédurale
// Usage: npm run renegat [--out=fichier.png]
//
// Récupère une photo aléatoire du dossier ~/renegats-photos, ajoute un
// avis de recherche ("R3N3G4T // # NNN") généré, puis poste sur Bluesky.

import * as fs from "fs";
import * as path from "path";
import { rngFor, pick } from "./rng";
import { tagsFor } from "./i18n-captions";
import type { Lang } from "./i18n";

const RENEGATS_DIR = path.join(process.env.HOME || "/root", "renegats-photos");
// Iris trie dans _classees/ (traité) et _a_trier/ (staging, jamais publiable) —
// on ne pioche que dans _classees.
const RENEGATS_SOURCE_DIR = path.join(RENEGATS_DIR, "_classees");

export interface Renegat {
  imagePath: string;
  numero: number;
  caption: string;
}

/** Parcourt récursivement RENEGATS_DIR (organisé en sous-dossiers par
 * catégorie/couleur/format depuis qu'Iris trie les photos) et retourne
 * tous les chemins d'images trouvés, à n'importe quelle profondeur. */
function listImagesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...listImagesRecursive(full));
    else if (/\.(jpg|jpeg|png|webp)$/i.test(f.name)) out.push(full);
  }
  return out;
}

/** Générer avis de recherche avec numéro (100-999). */
export function generateRenegatCaption(seed: string, forceNumero?: number, lang?: Lang): Renegat {
  const rng = rngFor(seed, `renegat:caption:${lang || "fr"}`);
  lang = lang || ("fr" as Lang);

  // Lister images du dossier — absent/vide n'empêche pas la légende (le zine
  // n'utilise que numéro + texte) ; seuls les posts avec photo l'exigent.
  const images = fs.existsSync(RENEGATS_SOURCE_DIR) ? listImagesRecursive(RENEGATS_SOURCE_DIR) : [];

  const imagePath = images.length ? pick(rng, images) : "";
  const numero = forceNumero || (100 + Math.floor(rng() * 900)); // 100-999

  const captions = [
    `R3N3G4T // # ${numero}\n📡 AVIS DE RECHERCHE\nContact : Rectitude`,
    `WANTED: R3N3G4T\n# ${numero}\nOutlaw Frequency`,
    `BUSCADO: R3N3G4T\n# ${numero}\nFrecuencia Prohibida`,
    `RICERCATO: R3N3G4T\n# ${numero}\nFrequenza Illegale`,
    `指名手配: R3N3G4T\n# ${numero}\n違法周波数`,
  ];

  const baseCaption = pick(rng, captions);
  const tags = tagsFor(lang);
  const caption = `${baseCaption}\n${tags}`;

  return { imagePath, numero, caption };
}

/** Charger image PNG (pour upload Bluesky). */
export function loadRenegatImage(imagePath: string): Buffer {
  if (!imagePath) throw new Error(`Aucune photo disponible — remplir ${RENEGATS_DIR}`);
  // Si c'est JPG, on devrait convertir en PNG, mais pour l'instant,
  // laisser l'utilisateur fournir des PNGs ou faire la conversion ailleurs.
  return fs.readFileSync(imagePath);
}
