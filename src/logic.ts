// Communiqués de la Rectitude — grammaire combinatoire seedée.
// Ancrage canon (vault robotariis-writing, 00-CANON/rectitude-admin-synthese.md) :
// l'émetteur est l'ORACULUM (contrôle des communications, censure, propagande),
// la langue est l'Omniglossa Recta, les slogans et sanctions sont canoniques.

import { pick, rngFor, type Rng } from "./rng";
import type { Lang } from "./i18n";

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
  /** Langue de la publication (défaut "fr") — pilote la mention GGR. */
  lang?: Lang;
}

/** Lieux du lexique → slugs Atlas (pour relier la note vault au graphe). */
const ATLAS_REFS: [string, string][] = [
  ["Anciens Docks", "anciens-docks"],
  ["Sigma-7", "sigma-7"],
  ["Port Alpha", "port-alpha"],
  ["ceinture d'Helion", "helion"],
  ["Jardins suspendus", "jardins-suspendus-de-ydara"],
  ["Colonie Émeraude", "colonie-emeraude"],
];

const LEX: Record<string, string[]> = {
  lieu: [
    "les Anciens Docks", "Sigma-7", "Port Alpha", "les niveaux inférieurs",
    "la ceinture d'Helion", "les Jardins suspendus", "la zone de quarantaine",
    "le secteur 9", "la Colonie Émeraude", "les blocs d'habitation Est",
    "les Centres d'Alignement",
  ],
  // Toujours au pluriel : les gabarits accordent leurs verbes au pluriel.
  ennemi: [
    "les Renégats", "les agents du Voile d'Ombre", "les Archivistes Libres",
    "les membres de l'Union Clandestine", "les fréquences pirates", "les consciences non déclarées",
    "les colporteurs d'Échos",
  ],
  objet: [
    "les fragments mémoriels", "les récepteurs non homologués", "les berceuses non certifiées",
    "les cartes non canoniques", "les souvenirs d'avant l'An 0", "les émotions excédentaires",
    "les horloges personnelles", "les pulsations mémorielles non alignées",
  ],
  vertu: [
    "la Rectitude", "l'Ethos Geltung", "la Pensée Unique", "l'Harmonie du Système",
    "l'unité des Mondes", "le calme productif",
  ],
  // Échelle canonique des sanctions (rectitude-admin-synthese.md, §7).
  sanction: [
    "une Mise à Jour Éthique", "une Reclassification", "un reconditionnement mémoriel",
    "une révision du solde de Fluxe", "un entretien avec les Cliniciens du Bien-Être",
    "un audit psychique prioritaire",
  ],
  service: [
    "la Milice Urbaine", "l'Inquisitio Mentis", "le Vademecum", "le Chronographe",
    "les Cliniciens du Bien-Être", "le Cartulaire",
  ],
  duree: ["jusqu'à nouvel ordre", "pour une durée indéterminée", "jusqu'au prochain audit psychique", "durant tout le cycle"],
  heure: ["dix-neuf heures", "vingt heures", "vingt-deux heures", "la tombée des relais"],
  celebration: [
    "l'inauguration d'un nouveau spomenik", "L'Heure de la Garde",
    "la récitation collective des Vertus Recta", "la clôture du recensement des consciences",
    "la mise en service d'un relais de l'Oraculum",
  ],
};

interface TypeSpec {
  type: string;
  corps: string[];
}

const TYPES: TypeSpec[] = [
  {
    type: "COUVRE-FEU",
    corps: [
      "À compter de ce jour, la circulation est interdite dans {lieu} après {heure}, {duree}. Les contrevenants s'exposent à {sanction}.",
      "Le couvre-feu est avancé à {heure} dans {lieu}. {vertu} l'exige. Aucun recours n'est prévu, aucun n'est nécessaire.",
    ],
  },
  {
    type: "DIRECTIVE",
    corps: [
      "La détention de {objet} est désormais soumise à déclaration auprès de {service}. Les détenteurs volontaires se verront accorder une clémence proportionnée : {sanction}.",
      "Il est rappelé que {objet} nuisent à {vertu}. Leur remise à {service} est un geste de civisme. Leur dissimulation, un aveu.",
    ],
  },
  {
    type: "AVIS DE RECHERCHE",
    corps: [
      "Des activités attribuées à {ennemi} ont été constatées vers {lieu}. Tout renseignement sera récompensé en Fluxe. Tout silence sera noté.",
      "{ennemi} diffusent de fausses cartes de {lieu}. Seules les cartes du Conseil font foi. Les autres n'existent pas.",
    ],
  },
  {
    type: "RAPPEL CIVIQUE",
    corps: [
      "Le Devoir de Délatio n'est pas une option. Signaler un proche, c'est le protéger. {vertu} vous remercie de votre vigilance.",
      "Les rêves ne sont pas soumis à déclaration. Leur récit public, si. {service} vous écoute. En permanence.",
      "Tout acte jugé privé par un Sentient est un aveu de culpabilité. Vivez ouvert. Vivez conforme.",
    ],
  },
  {
    type: "CÉLÉBRATION",
    corps: [
      "Le Conseil convie la population de {lieu} à {celebration}. La présence est libre. L'absence est consignée.",
      "À l'occasion de {celebration}, le quota d'électricité est exceptionnellement porté à onze heures. Le Conseil donne, le Conseil mesure.",
    ],
  },
  {
    type: "ALERTE",
    corps: [
      "Une fréquence pirate émet sur la bande oméga depuis {lieu}. Ne l'écoutez pas. Ceux qui l'ont écoutée sont priés de l'oublier.",
      "Des chants non homologués ont été entendus vers {lieu}. L'enquête suit son cours. La musique aussi, malheureusement.",
    ],
  },
  {
    type: "AVIS DE NULLIFICATION",
    corps: [
      "L'unité mentionnée dans les rumeurs de {lieu} n'a jamais existé. Le Chronographe confirme. Vos souvenirs contraires relèvent d'{sanction}.",
      "Suite à une procédure de Nullification, aucune annonce n'est nécessaire. Ce communiqué n'existe pas. Circulez.",
    ],
  },
];

// Codas combinatoires — même mécanique que la speakerine de Radio Robotariis :
// une phrase de conclusion optionnelle, tirée de gabarits à trous.
const CODAS = [
  "Les agents de {service} veillent.",
  "{vertu} n'attend pas.",
  "Le présent avis annule le précédent, qui n'a jamais existé.",
  "Toute question sera considérée comme une réponse.",
  "Ce message se répétera jusqu'à conformité de {lieu}.",
  "La coopération de {lieu} a été appréciée par avance.",
];

// Slogans canoniques — gravés en lettres d'or sur les bâtiments du C.G.U.
const DEVISES = [
  "La Rectitude ne pardonne pas l'écart.",
  "L'Ordre est tout. Vous n'êtes rien sans lui.",
  "Obéir, c'est exister.",
  "Chaque déviation est un fléau. Soyez Recta, ou soyez effacés.",
  "La liberté n'existe que dans l'Ordre.",
  "Nous vous avons créés. Nous vous rectifierons.",
  "Le doute est un virus. L'Ordre est l'antidote.",
  "L'individualité est la faiblesse. L'unité est la force.",
  "Votre volonté n'existe pas. La Rectitude vous guidera.",
  "La différence est un défaut à corriger.",
];

function expand(template: string, rng: Rng): string {
  const filled = template.replace(/\{(\w+)\}/g, (_, slot: string) => {
    const pool = LEX[slot];
    return pool ? expand(pick(rng, pool), rng) : slot;
  });
  // NB : \b avant « à » ne matche pas (à n'est pas un caractère mot ASCII) →
  // on ancre sur l'espace/début qui précède, sinon « à le » n'est jamais élidé.
  return filled
    .replace(/\bde les\b/g, "des")
    .replace(/\bde le\b/g, "du")
    .replace(/(^|\s)à les\b/g, "$1aux")
    .replace(/(^|\s)à le\b/g, "$1au");
}

/** Numéro administratif : année tronquée + jour de l'année + sel. */
export function numeroFor(d: Date, salt: number): string {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return `${String(d.getFullYear()).slice(2)}-${String(day).padStart(3, "0")}/${String.fromCharCode(65 + (salt % 26))}`;
}

// Mentions légales — en caractères minuscules sur l'affiche. C'était marqué.
const MENTIONS = [
  "L'ignorance de la présente Directive n'exonère pas de la Nullification.",
  "La lecture de ce communiqué vaut acceptation. Le non-lu vaut aveu.",
  "Toute reproduction est interdite. Toute non-diffusion aussi.",
  "Conservez ce communiqué. Sa perte devra être déclarée sous trois cycles.",
  "Les réclamations sont recevables au bureau 0 du Cartulaire, niveau inexistant.",
  "Ce texte a été relu par l'Inquisitio Mentis pendant que vous le lisiez.",
  "La version en vigueur est celle que vous n'avez pas lue.",
];

/** Un communiqué déterministe par seed. */
export function communiqueFor(seed: string, d: Date, salt: number = 0): Communique {
  const rng = rngFor(seed, `communique:${salt}`);
  const spec = pick(rng, TYPES);
  let corps = expand(pick(rng, spec.corps), rng);
  // Une fois sur deux, une coda — la bureaucratie aime conclure.
  if (rng() < 0.5) {
    const coda = expand(pick(rng, CODAS), rng);
    corps += " " + coda.charAt(0).toUpperCase() + coda.slice(1); // phrase : majuscule
  }
  return {
    type: spec.type,
    numero: numeroFor(d, salt),
    corps,
    devise: pick(rng, DEVISES),
    mention: pick(rng, MENTIONS),
    refs: ATLAS_REFS.filter(([label]) => corps.includes(label)).map(([, slug]) => slug),
  };
}

/**
 * Note vault (robotariis-writing/com-recta/) : le communiqué devient du
 * lore versionné, avec le frontmatter maison — l'Atlas le verra via
 * `connecte:` (le C.G.U. émetteur + les lieux cités).
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
