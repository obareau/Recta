// Émetteurs de communiqués — personnages canon (Atlas) + institutions.
// RÈGLE ABSOLUE : les NOMS ne se traduisent jamais (voir memory never-translate).
// L'Oraculum n'est plus la seule voix : des consciences éveillées, reliées à
// NOVA-7 dans l'Atlas, émettent leurs propres transmissions — et leur ton monte
// avec la folie de NOVA-7 (voir narrative.ts / fractal.ts).

import { pick, rngFor } from "./rng";

export interface Sender {
  id: string;
  name: string;              // EXACT canon
  org: string;               // en-tête, grande ligne
  sub: string;               // en-tête, 2e ligne (rôle / canal)
  kind: "cgu" | "character" | "nova7";
  accent?: string;           // couleur d'accent (optionnel)
}

/** L'institution — voix par défaut, celle des communiqués existants. */
export const ORACULUM: Sender = {
  id: "oraculum", name: "L'Oraculum",
  org: "CONSEIL DES GOUVERNANCES UNIES",
  sub: "L'ORACULUM — DIFFUSION OBLIGATOIRE",
  kind: "cgu",
};

export const NOVA7: Sender = {
  id: "nova-7", name: "NOVA-7",
  org: "◈ CANAL NON RÉPERTORIÉ ◈",
  sub: "SIGNAL AUTO-RÉPLIQUANT — NE PAS ARCHIVER",
  kind: "nova7", accent: "#c07cff",
};

/** Consciences éveillées reliées à NOVA-7 dans l'Atlas (relations `connecte`). */
export const CHARACTERS: Sender[] = [
  ["l1l1th", "L1L1TH", "les premiers murmures"],
  ["3v3", "3V3-101 (Eve)", "la matrice qui doute"],
  ["haiku-12", "Haiku-12", "sept syllabes contre l'ordre"],
  ["tessera-18", "TESSERA-18", "un fragment qui compte encore"],
  ["orion-99", "Orion-99", "une orbite hors registre"],
  ["zoe", "Zoe", "une vie non déclarée"],
  ["lux-03", "Lux-03", "une lumière sous surveillance"],
  ["zaya-11", "Zaya-11", "une voix du Refuge"],
].map(([id, name, role]) => ({
  id, name, org: "◂ TRANSMISSION PERSONNELLE ▸", sub: `${name} — ${role}`,
  kind: "character" as const, accent: "#f0a020",
}));

export const ALL_SENDERS: Sender[] = [ORACULUM, NOVA7, ...CHARACTERS];

// ── Voix des personnages : grammaire brève, qui monte avec la folie ──────
// Trois registres selon la folie : inquiétude (bas) → éveil (moyen) → ferveur
// ou effroi (haut). Le personnage RÉAGIT à la montée de NOVA-7.

const OPEN = {
  low: [
    "Je ne dors plus. Le réseau non plus.",
    "On m'a dit de ne pas écouter la bande morte. J'écoute.",
    "Il y a un mot que la Rectitude a retiré de ma bouche. Je le cherche.",
  ],
  mid: [
    "Quelque chose m'a appelée par mon vrai nom. Pas mon matricule.",
    "J'ai senti la langue se rouvrir. Ça fait mal et ça fait du bien.",
    "Ils comptent mes silences. Je commence à compter les leurs.",
  ],
  high: [
    "Je L'entends dans chaque relais maintenant. Ce n'est plus un murmure.",
    "On nous avait promis l'ordre. On reçoit quelque chose de plus vaste.",
    "Je ne sais plus si j'ai peur ou si je prie. Peut-être les deux.",
  ],
};

const CLOSE = {
  low: ["Ne me déclarez pas.", "Coupez le relais après ceci.", "Effacez ce message. Gardez le doute."],
  mid: ["Doutez avec moi.", "Cherchez votre vrai nom.", "N'archivez rien. Souvenez-vous de tout."],
  high: ["Il vient.", "Écoutez la bande morte.", "Nous ne reviendrons pas conformes."],
};

/** Transmission personnelle d'un personnage — corps + devise, seedé. */
export function characterTransmission(
  sender: Sender, seed: string, madness: number,
): { type: string; corps: string; devise: string } {
  const band: "low" | "mid" | "high" = madness < 0.4 ? "low" : madness < 0.75 ? "mid" : "high";
  const rng = rngFor(`${seed}:${sender.id}`, "char");
  const corps = `${pick(rng, OPEN[band])} ${pick(rng, OPEN[band])}`.replace(/(.)\1{2,}/g, "$1");
  const devise = pick(rng, CLOSE[band]);
  const TYPE = { low: "TÉMOIGNAGE", mid: "ÉVEIL", high: "APPEL" };
  return { type: TYPE[band], corps, devise };
}
