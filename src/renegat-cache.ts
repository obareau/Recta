// Cache des avis postés pour éviter les doublons
// Stocke les numéros + seeds déjà utilisés

import * as fs from "fs";
import * as path from "path";

const CACHE_FILE = path.join(process.env.HOME || "/root", ".cache", "recta-renegats.json");

export interface RenegatEntry {
  numero: number;
  seed: string;
  timestamp: string;
  uri: string;
}

export function loadCache(): RenegatEntry[] {
  try {
    if (!fs.existsSync(CACHE_FILE)) return [];
    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCache(entries: RenegatEntry[]): void {
  const dir = path.dirname(CACHE_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(entries, null, 2));
}

export function addToCache(entry: RenegatEntry): void {
  const cache = loadCache();
  cache.push(entry);
  // Garder que les 100 derniers pour ne pas bloquer le fichier
  if (cache.length > 100) cache.shift();
  saveCache(cache);
}

export function hasBeenPosted(numero: number): boolean {
  const cache = loadCache();
  return cache.some((e) => e.numero === numero);
}

/** Trouver un numéro non posté après max tentatives. */
export function findUniqueNumero(maxTries: number = 50): number {
  const cache = loadCache();
  const posted = new Set(cache.map((e) => e.numero));

  for (let i = 0; i < maxTries; i++) {
    const num = 100 + Math.floor(Math.random() * 900);
    if (!posted.has(num)) return num;
  }

  throw new Error("Impossible de générer un numéro unique après 50 tentatives");
}
