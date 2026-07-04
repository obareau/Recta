// Utilitaires de texte pour les limites de caractères des réseaux.
// Bluesky compte en graphèmes (300), Mastodon en caractères (500).

/** Découpe une chaîne en graphèmes (Intl.Segmenter si dispo, sinon code points). */
export function graphemes(s: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Seg) {
    const seg = new Seg(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(s), (x) => (x as { segment: string }).segment);
  }
  return Array.from(s); // code points : correct pour l'immense majorité des cas
}

export function graphemeLength(s: string): number {
  return graphemes(s).length;
}

/**
 * Tronque `text` à `max` graphèmes en préservant l'ellipsis. Coupe sur un
 * espace quand c'est possible pour ne pas casser un mot en plein milieu.
 */
export function clamp(text: string, max: number): string {
  const g = graphemes(text);
  if (g.length <= max) return text;
  const ell = "…";
  let cut = max - ell.length;
  let s = g.slice(0, cut).join("");
  const lastSpace = s.lastIndexOf(" ");
  if (lastSpace > cut * 0.6) s = s.slice(0, lastSpace);
  return s.replace(/[\s.,;:—-]+$/, "") + ell;
}
