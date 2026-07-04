// Cache des HybR1Ds postés — anti-doublon par IMAGE (pas par numéro).
// Avec 359 portraits fixes, on veut cycler sans répéter tant que possible.

import * as fs from "fs";
import * as path from "path";

const CACHE_FILE = path.join(process.env.HOME || "/root", ".cache", "recta-hybrids.json");

export interface HybridEntry {
  image: string; // basename de l'image
  numero: number;
  timestamp: string;
  uri: string;
}

export function loadCache(): HybridEntry[] {
  try {
    if (!fs.existsSync(CACHE_FILE)) return [];
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function saveCache(entries: HybridEntry[]): void {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(entries, null, 2));
}

export function addToCache(entry: HybridEntry): void {
  const cache = loadCache();
  cache.push(entry);
  saveCache(cache);
}

/**
 * Choisit une image non encore postée parmi `allImages`.
 * Quand toutes ont été montrées, réinitialise le cycle (garde l'historique
 * mais autorise à repiocher — on efface les marques de cycle).
 */
export function pickUnusedImage(allImages: string[]): string {
  const cache = loadCache();
  const used = new Set(cache.map((e) => e.image));
  const remaining = allImages.filter((img) => !used.has(path.basename(img)));

  if (remaining.length === 0) {
    // Cycle complet : on repart de zéro (nouveau tour sur le lot).
    saveCache([]);
    return allImages[Math.floor(Math.random() * allImages.length)];
  }
  return remaining[Math.floor(Math.random() * remaining.length)];
}
