// Socle multilingue — FR / EN / ES / IT / JA. Chaque type de contenu (communiqué,
// tactique, NOVA-7, micro-nouvelle) fournit un PACK par langue (gabarits +
// lexiques) ; ce module donne la liste des langues, un moteur d'expansion
// combinatoire générique et l'élision propre à chaque langue.
//
// RÈGLE ABSOLUE : les NOMS de programmes et de personnages ne se traduisent
// jamais (voir memory never-translate-program-names).

import { pick, type Rng } from "./rng";

export const LANGS = ["fr", "en", "es", "it", "ja"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABEL: Record<Lang, string> = {
  fr: "Français", en: "English", es: "Español", it: "Italiano", ja: "日本語",
};

/**
 * Mention de système présente sur CHAQUE publication : le Générateur de
 * Grammaire Réglementaire (l'automate qui produit les communiqués) est obsolète
 * et non maintenu — il peut donc se tromper. In-universe : justifie les glitches
 * et ajoute du lore (un appareil de propagande qui se dégrade tout seul).
 */
export const GGR_MENTION: Record<Lang, string> = {
  fr: "Produit par le Générateur de Grammaire Réglementaire — obsolète, non maintenu. Peut contenir des erreurs.",
  en: "Produced by the Regulatory Grammar Generator — obsolete, unmaintained. May contain errors.",
  es: "Producido por el Generador de Gramática Reglamentaria — obsoleto, sin mantenimiento. Puede contener errores.",
  it: "Prodotto dal Generatore di Grammatica Regolamentare — obsoleto, non mantenuto. Può contenere errori.",
  ja: "規則文法ジェネレータ（旧式・保守停止）により生成。誤りを含む場合があります。",
};

/** Langue sans espaces entre les mots (césure au caractère). */
export function isCJK(lang: Lang): boolean {
  return lang === "ja";
}

/** Élision / contractions propres à chaque langue, appliquées après expansion. */
export function elide(text: string, lang: Lang): string {
  switch (lang) {
    case "fr":
      // \b ne matche pas avant « à » (non-ASCII) → ancrer sur l'espace/début.
      return text
        .replace(/\bde le\b/g, "du").replace(/\bde les\b/g, "des")
        .replace(/(^|\s)à les\b/g, "$1aux").replace(/(^|\s)à le\b/g, "$1au")
        .replace(/\b([dcjlmnst]e|que)\s+([aeéèêiîouyhAEÉÈÊIÎOUYH])/g, (_, w, v) => `${w.slice(0, -1)}'${v}`);
    case "it":
      return text
        .replace(/\bdi ([iI])/g, "d'$1").replace(/\blo ([aeiouAEIOU])/g, "l'$1")
        .replace(/\bla ([aeiouAEIOU])/g, "l'$1").replace(/\bune ([aeiouAEIOU])/g, "un'$1");
    case "es":
      return text.replace(/\bde el\b/g, "del").replace(/\ba el\b/g, "al");
    default:
      return text;
  }
}

/**
 * Développe récursivement les {trous} d'un gabarit à partir d'un lexique, puis
 * applique l'élision de la langue. Un slot en Majuscule capitalise sa valeur.
 */
export function expandLang(
  template: string, lex: Record<string, string[]>, rng: Rng, lang: Lang,
): string {
  const filled = template.replace(/\{(\w+)\}/g, (_, slot: string) => {
    const cap = slot[0] === slot[0].toUpperCase();
    const pool = lex[slot.toLowerCase()];
    if (!pool) return slot;
    const val = expandLang(pick(rng, pool), lex, rng, lang);
    return cap ? val.charAt(0).toUpperCase() + val.slice(1) : val;
  });
  return elide(filled, lang);
}
