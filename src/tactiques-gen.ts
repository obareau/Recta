// Générateur grammatical de Tactiques Recta — grammaire combinatoire seedée,
// multilingue, dérivée des 200 tactiques fournies. Produit des directives inédites
// dans la voix froide/paranoïaque du C.G.U. Même mécanique que la grammaire des
// communiqués (gabarits à trous + lexiques).

import { pick, rngFor, type Rng } from "./rng";
import { tactiqueFor as tactiqueForCurated, type Tactique } from "./tactiques";
import { TACTIQUE_PACKS } from "./tactiques-lang";
import type { Lang } from "./i18n";

function up(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function expand(template: string, lex: Record<string, string[]>, extra: Record<string, string[]>, rng: Rng): string {
  return template.replace(/\{(\w+)\}/g, (_, slot: string) => {
    const cap = slot[0] === slot[0].toUpperCase();
    const key = slot.toLowerCase();
    const pool = lex[key] ?? extra[key];
    if (!pool) return slot;
    const val = expand(pick(rng, pool), lex, extra, rng);
    return cap ? up(val) : val;
  });
}

/** Une tactique GÉNÉRÉE (inédite) déterministe par seed, multilingue. */
export function generatedTactique(seed: string, lang: Lang = "fr"): Tactique {
  const pack = TACTIQUE_PACKS[lang];
  const rng = rngFor(seed, `tactique:${lang}`);
  const template = pick(rng, pack.templates);
  const text = expand(template, pack.lex, pack.extra, rng);
  const n = Math.floor(rng() * 1000) + 1;
  const code = `RT-${String(n).padStart(3, "0")}`;
  return {
    n,
    code,
    protocole: rng() < 0.5 ? "operatoire" : "paranoia",
    seg: ["ALPHA", "BETA", "GAMMA", "DELTA"][Math.floor(rng() * 4)],
    segLabel: "Directive générée",
    text,
  };
}

/**
 * Résout une tactique : en FR, 50/50 curée vs générée (canon) ;
 * en autres langues, toujours générée (localisée). Déterministe par seed.
 */
export function resolveTactique(seed: string, lang: Lang = "fr"): Tactique {
  if (lang === "fr") {
    const rng = rngFor(seed, "tactique:resolve");
    if (rng() < 0.5) {
      return tactiqueForCurated(seed);
    }
  }
  return generatedTactique(seed, lang);
}
