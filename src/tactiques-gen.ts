// Générateur grammatical de Tactiques Recta — grammaire combinatoire seedée,
// dérivée des 200 tactiques fournies. Produit des directives inédites dans la
// voix froide / paranoïaque du C.G.U. Même mécanique que la grammaire des
// communiqués (gabarits à trous + lexiques).

import { pick, rngFor, type Rng } from "./rng";
import { tactiqueFor as tactiqueForCurated, type Tactique } from "./tactiques";

const LEX: Record<string, string[]> = {
  // Abstractions humaines à réduire.
  affect: [
    "la pitié", "le doute", "la colère", "la confiance", "la nostalgie",
    "l'urgence", "la fierté", "la compassion", "l'empathie", "l'espoir",
    "l'enthousiasme", "la fatigue", "la peur de l'échec", "le besoin de reconnaissance",
    "la loyauté", "l'hésitation",
  ],
  // Métaphores mécaniques / systémiques.
  metaphore: [
    "un reflux biologique", "un bug de mémoire", "une fuite de pression",
    "un pic d'énergie inutile", "une vulnérabilité logicielle", "une donnée mal indexée",
    "une variable instable", "un défaut d'alignement", "une anomalie statistique",
    "une baisse de tension", "un algorithme mort", "une friction mécanique prévisible",
  ],
  // Actions froides à exécuter.
  action: [
    "Retire-la de l'équation.", "Formate le secteur concerné.", "Colmate la fuite.",
    "Convertis-la en précision chirurgicale.", "N'installe pas ce patch.",
    "Trouve sa case.", "Rends-la aussi rigide que possible.", "Coupe son alimentation.",
    "Attends dix secondes qu'il passe, puis agis.", "Efface le cache.",
    "Isole-toi de ce stimulus.", "Purge la cause avant l'effet.",
  ],
  // Comportements observés chez la cible.
  comportement: [
    "sourient", "se taisent", "s'excusent", "demandent des éclaircissements",
    "s'unissent pour un projet", "changent de ton", "t'évitent dans les couloirs",
    "prétendent avoir compris", "demandent de l'autonomie", "te regardent dans les yeux",
    "t'offrent un café", "arrivent en avance", "approuvent trop vite",
  ],
  // Interprétation paranoïaque du comportement.
  interpretation: [
    "c'est qu'ils ont trouvé une faille dans ton protocole",
    "c'est le début d'une cellule dissidente",
    "c'est qu'ils calculent déjà le coût de leur prochaine faute",
    "c'est pour évaluer tes défenses",
    "c'est qu'ils ont trouvé un nouvel allié dans la hiérarchie",
    "c'est un test de ton autorité",
    "c'est qu'on t'a caché la moitié des données",
    "c'est que le sabotage est déjà en cours",
  ],
  contremesure: [
    "Cherche-la.", "Divise les tâches.", "Augmente la surveillance.",
    "Active les contre-mesures.", "Identifie-le.", "Verrouille les accès.",
    "Reste derrière le comptoir.", "Raccourcis la chaîne.", "Durcis le ton.",
  ],
  cible: [
    "chaque individu de l'équation", "la crise", "ton corps", "le chaos ambiant",
    "chaque conflit", "la résistance", "l'anomalie", "chaque intermédiaire",
    "le silence de l'adversaire", "leur créativité",
  ],
  reduction: [
    "un simple commutateur : ouvert ou fermé", "une suite de chiffres non triés",
    "une unité de confinement", "un simple problème d'allocation de ressources",
    "une accélération du calendrier", "une friction prévisible",
    "un vecteur potentiel de corruption", "une collecte de données",
  ],
  vertu: [
    "La Rectitude", "L'ordre", "L'efficacité du calcul", "L'intégrité du cadre",
    "La conformité", "La constance du vecteur",
  ],
  froid: [
    "retire-le du calcul", "abroge-le immédiatement", "élimine-le en priorité",
    "le calcul est clos", "la discussion est close", "ne le regrette pas",
    "corrige le signal",
  ],
  question: [
    "le coût exact de ton hésitation", "le maillon le plus faible de ton réseau",
    "la variable qui t'empêche de dormir", "le protocole que tu appliques par habitude",
    "le facteur limitant de ton attention", "la variable introduite par pure vanité",
  ],
};

const TEMPLATES = [
  "{Affect} est {metaphore}. {action}",
  "{Affect} est {metaphore}. {action}",
  "S'ils {comportement}, {interpretation}. {contremesure}",
  "S'ils {comportement}, {interpretation}. {contremesure}",
  "Considère {cible} comme {reduction}.",
  "Ne cherche pas à être {compris}. Cherche à être {exige}.",
  "Nomme {question}. {Froid}",
  "Si {condition} : {Froid}",
  "{Vertu} ne négocie pas avec le désordre. Elle le subsume ou l'efface.",
];

const EXTRA: Record<string, string[]> = {
  compris: ["compris", "aimé", "rassuré", "remercié"],
  exige: ["exécuté", "appliqué", "obéi", "craint"],
  condition: [
    "la solution demande du courage", "le plan dépend d'une seule personne",
    "la solution est belle", "le doute persiste", "un agent devient indispensable",
    "la vérité est inconfortable", "le rapport est trop parfait",
  ],
};

function up(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function expand(template: string, rng: Rng): string {
  return template.replace(/\{(\w+)\}/g, (_, slot: string) => {
    const cap = slot[0] === slot[0].toUpperCase();
    const key = slot.toLowerCase();
    const pool = LEX[key] ?? EXTRA[key];
    if (!pool) return slot;
    const val = expand(pick(rng, pool), rng);
    return cap ? up(val) : val;
  });
}

/** Une tactique GÉNÉRÉE (inédite) déterministe par seed. */
export function generatedTactique(seed: string): Tactique {
  const rng = rngFor(seed, "tactique-gen");
  let text = expand(pick(rng, TEMPLATES), rng).trim();
  if (!/[.?»]$/.test(text)) text += ".";
  // Élision.
  text = text.replace(/\bde le\b/g, "du").replace(/\bde les\b/g, "des");
  const n = 900 + ((rng() * 99) | 0);
  return {
    n, code: `RT-${n}`, protocole: "généré", seg: "GEN",
    segLabel: "Protocole Génératif", text,
  };
}

/** Sélection unifiée : 50/50 curée vs générée (même règle partout). */
export function resolveTactique(seed: string): Tactique {
  return seed.charCodeAt(seed.length - 1) % 2 === 0
    ? tactiqueForCurated(seed)
    : generatedTactique(seed);
}
