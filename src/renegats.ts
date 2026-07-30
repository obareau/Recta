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

interface ImageCandidate {
  path: string;
  rating: number;
}

/** Note 0-5 lue dans le sidecar JSON qu'Iris écrit à côté de chaque photo
 * (même fichier que la galerie affiche/édite — pas d'API entre les deux
 * outils, juste le système de fichiers partagé). Absent/illisible = 0. */
function readRating(imagePath: string): number {
  try {
    const sidecarPath = imagePath.replace(/\.[^.]+$/, ".json");
    if (!fs.existsSync(sidecarPath)) return 0;
    const data = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
    return typeof data.rating === "number" ? data.rating : 0;
  } catch {
    return 0;
  }
}

/** Parcourt récursivement `dir` (organisé en sous-dossiers par
 * catégorie/couleur/format depuis qu'Iris trie les photos) et retourne
 * chaque image trouvée avec sa note, à n'importe quelle profondeur. */
function listImagesWithRating(dir: string): ImageCandidate[] {
  const out: ImageCandidate[] = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...listImagesWithRating(full));
    else if (/\.(jpg|jpeg|png|webp)$/i.test(f.name)) out.push({ path: full, rating: readRating(full) });
  }
  return out;
}


/** Tirage pondéré : chaque candidat pèse `weightOf(rating)`. Déterministe pour
 * une seed donnée, comme tout le reste de Recta — deux exécutions le même jour
 * doivent sortir la même photo, sinon l'archive du feuilleton mentirait. */
function pickWeighted(
  rng: () => number,
  items: ImageCandidate[],
  weightOf: (rating: number) => number,
): string {
  const weights = items.map((c) => weightOf(c.rating));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i].path;
  }
  return items[items.length - 1].path; // garde-fou d'arrondi flottant
}

/** Générer avis de recherche avec numéro (100-999).
 * `forceImagePath` (ex: choix fait dans la galerie Iris) court-circuite le
 * tirage aléatoire dans RENEGATS_SOURCE_DIR et impose cette photo précise. */
export function generateRenegatCaption(
  seed: string,
  forceNumero?: number,
  lang?: Lang,
  forceImagePath?: string
): Renegat {
  const rng = rngFor(seed, `renegat:caption:${lang || "fr"}`);
  lang = lang || ("fr" as Lang);

  // Lister images du dossier — absent/vide n'empêche pas la légende (le zine
  // n'utilise que numéro + texte) ; seuls les posts avec photo l'exigent.
    // Priorité aux mieux notées, par PONDÉRATION et non par exclusion.
    //
    // ⚠️ La version précédente ne tirait que parmi les photos portant la
    // meilleure note trouvée. Son repli « aucune note → tirage uniforme » ne
    // jouait que si AUCUNE photo n'était notée : dès la première étoile posée
    // dans Iris, tout le reste disparaissait. Mesuré le 2026-07-30 — 383 photos
    // classées dont 378 non notées, 1 à trois étoiles, 2 à quatre et 2 à cinq :
    // Recta ne tirait plus que parmi DEUX images et republiait la même en
    // boucle. Noter une photo ne doit pas écarter les autres.
    //
    // Poids : une cinq étoiles sort deux fois plus souvent qu'une non notée, et
    // pas davantage — la notation guide le tirage, elle ne le confisque pas.
    const candidates = fs.existsSync(RENEGATS_SOURCE_DIR) ? listImagesWithRating(RENEGATS_SOURCE_DIR) : [];
    const weightOf = (rating: number) => 1 + Math.max(0, Math.min(5, rating)) / 5;

    const imagePath = forceImagePath || (candidates.length ? pickWeighted(rng, candidates, weightOf) : "");
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
