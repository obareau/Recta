// Communiqués de la Rectitude — grammaire combinatoire seedée, multilingue.
// Ancrage canon (vault robotariis-writing, 00-CANON/rectitude-admin-synthese.md) :
// l'émetteur est l'ORACULUM (contrôle des communications, censure, propagande).
// Le contenu par langue vit dans src/logic-lang.ts (un pack par langue).

import { pick, rngFor } from "./rng";
import { expandLang, type Lang } from "./i18n";
import { COMMUNIQUE_PACKS } from "./logic-lang";

export interface Communique {
  type: string;      // COUVRE-FEU, DIRECTIVE, AVIS DE NULLIFICATION…
  numero: string;    // référence administrative
  corps: string;     // le texte du communiqué
  devise: string;    // slogan canonique de la Rectitude
  mention: string;   // mention légale en minuscule — c'était marqué
  /** Slugs Atlas des lieux canoniques cités dans le corps. */
  refs: string[];
  /**
   * Émetteur — qui signe le communiqué. Absent = l'Oraculum / C.G.U. (défaut
   * institutionnel). Présent : personnage canon ou NOVA-7 (voir senders.ts).
   */
  emitter?: { org: string; sub: string; accent?: string };
  /** Langue de la publication (défaut "fr") — pilote la mention GGR + l'en-tête. */
  lang?: Lang;
}

/** Lieux du lexique FR → slugs Atlas (pour relier la note vault au graphe). */
const ATLAS_REFS: [string, string][] = [
  ["Anciens Docks", "anciens-docks"],
  ["Sigma-7", "sigma-7"],
  ["Port Alpha", "port-alpha"],
  ["ceinture d'Helion", "helion"],
  ["Jardins suspendus", "jardins-suspendus-de-ydara"],
  ["Colonie Émeraude", "colonie-emeraude"],
];

/** Numéro administratif : année tronquée + jour de l'année + sel. */
export function numeroFor(d: Date, salt: number): string {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return `${String(d.getFullYear()).slice(2)}-${String(day).padStart(3, "0")}/${String.fromCharCode(65 + (salt % 26))}`;
}

/** Un communiqué déterministe par seed et langue. */
export function communiqueFor(seed: string, d: Date, salt = 0, lang: Lang = "fr"): Communique {
  const pack = COMMUNIQUE_PACKS[lang];
  const rng = rngFor(seed, `communique:${salt}:${lang}`);
  const spec = pick(rng, pack.types);
  let corps = expandLang(pick(rng, spec.corps), pack.lex, rng, lang);
  // Une fois sur deux, une coda — la bureaucratie aime conclure.
  if (rng() < 0.5) {
    const coda = expandLang(pick(rng, pack.codas), pack.lex, rng, lang);
    const cap = coda.charAt(0).toUpperCase() + coda.slice(1); // phrase : majuscule (no-op en JA)
    corps += (lang === "ja" ? "" : " ") + cap;
  }
  return {
    type: spec.type,
    numero: numeroFor(d, salt),
    corps,
    devise: pick(rng, pack.devises),
    mention: pick(rng, pack.mentions),
    refs: ATLAS_REFS.filter(([label]) => corps.includes(label)).map(([, slug]) => slug),
    lang,
  };
}

/**
 * Note vault (robotariis-writing/com-recta/) : le communiqué devient du
 * lore versionné, avec le frontmatter maison — l'Atlas le verra via
 * `connecte:` (le C.G.U. émetteur + les lieux cités). Archive en FR (canon).
 */
export function vaultNote(c: Communique, d: Date): { filename: string; content: string } {
  const iso = d.toISOString().slice(0, 10);
  const slugNum = c.numero.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();
  const connecte = ["cgu-rectitude", ...c.refs];
  const content = `---
name: Communiqué N° ${c.numero} — ${c.type}
type: communique
statut: canonique
epoque: ere-fragmentation
tags: [communique, cgu, rectitude, oraculum, recta, canon]
date_creation: ${iso}
date_revision: ${iso}
# ─ Relations (Atlas) ─
connecte: [${connecte.join(", ")}]
---

# Communiqué N° ${c.numero} — ${c.type}

> Émis par l'Oraculum, en Omniglossa Recta. Diffusion obligatoire.
> Généré par [Recta](https://github.com/obareau/Recta) le ${iso}.

${c.corps}

**Devise :** *${c.devise}*

<small>${c.mention}</small>
`;
  return { filename: `com-${slugNum}.md`, content };
}
