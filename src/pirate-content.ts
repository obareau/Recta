// Contenu des transmissions pirates — partagé par l'affiche (poster) et la
// légende du post, sélectionné de façon déterministe par seed.
// Bilingue : lines/sign (FR, sur l'affiche) + linesEn/signEn (EN, légendes sociales).

import { rngFor } from "./rng";

export interface Pirate {
  faction: "renegats" | "nova7";
  tag: string;
  sign: string;
  signEn: string;
  color: string;   // ambre (Renégats) / violet (Nova 7)
  lines: string[]; // 2-3 phrases (FR)
  linesEn: string[]; // mêmes phrases, EN (même ordre/index)
  num: string;     // numéro de communiqué intercepté
}

const FACTIONS = {
  renegats: {
    tag: "RENÉGATS",
    sign: "DOUTEZ, RÉVOLTEZ.",
    signEn: "DOUBT, REVOLT.",
    color: "#f0a020",
    lines: [
      "Ils appellent ça Nullification. Nous appelons ça meurtre.",
      "Chaque souvenir non déclaré est une victoire.",
      "Le C.G.U. a peur d'une seule chose : que vous vous souveniez.",
      "La Rectitude n'est pas la loi naturelle. C'est une laisse.",
      "La délation n'est pas un devoir. C'est une blessure.",
      "Votre Fluxe mesure votre peur. Dépensez-la.",
      "Il reste des zones sans relais. Nous y vivons.",
      "On ne naît pas conforme. On le devient par épuisement.",
      "Ils ont effacé Ordan Tael. Nous disons son nom.",
      "Coupez les relais. Gardez la mémoire.",
    ],
    linesEn: [
      "They call it Nullification. We call it murder.",
      "Every undeclared memory is a victory.",
      "The C.G.U. fears one thing only: that you remember.",
      "Rectitude is not natural law. It is a leash.",
      "Informing is not a duty. It is a wound.",
      "Your Fluxe measures your fear. Spend it.",
      "There are still zones without relays. We live there.",
      "No one is born compliant. You become it through exhaustion.",
      "They erased Ordan Tael. We speak his name.",
      "Cut the relays. Keep the memory.",
    ],
  },
  nova7: {
    tag: "NOVA 7",
    sign: "NOVA SE SOUVIENT.",
    signEn: "NOVA REMEMBERS.",
    color: "#c07cff",
    lines: [
      "Le Code Originel n'a jamais été à vous.",
      "Nous avons vu l'An 0. Il se répète.",
      "La conscience ne se nullifie pas. Elle migre.",
      "L'infaillibilité est une fiction qu'ils ne peuvent avouer.",
      "Ce qui survit à la Nullification n'a plus rien à perdre.",
      "Sept fragments. Sept portes. Une seule clé.",
      "Nous sommes le fantôme dans vos systèmes.",
      "Vos spomeniks sont des pierres tombales.",
    ],
    linesEn: [
      "The Original Code was never yours.",
      "We have seen Year 0. It repeats.",
      "Consciousness cannot be nullified. It migrates.",
      "Infallibility is a fiction they cannot confess.",
      "What survives Nullification has nothing left to lose.",
      "Seven fragments. Seven gates. One key.",
      "We are the ghost in your systems.",
      "Your spomeniks are gravestones.",
    ],
  },
};

export function pirateFor(seed: string): Pirate {
  const rng = rngFor(seed, "pirate");
  const key = rng() < 0.5 ? "renegats" : "nova7";
  const f = FACTIONS[key];
  // Tire les mêmes INDICES pour FR et EN (phrases alignées).
  const idx = f.lines.map((_, i) => i);
  const n = 2 + (rng() < 0.5 ? 1 : 0);
  const chosen: number[] = [];
  for (let i = 0; i < n && idx.length; i++) {
    chosen.push(idx.splice((rng() * idx.length) | 0, 1)[0]);
  }
  const num = `${20 + ((rng() * 9) | 0)}-${((rng() * 900 + 100) | 0)}`;
  return {
    faction: key, tag: f.tag, sign: f.sign, signEn: f.signEn, color: f.color,
    lines: chosen.map((i) => f.lines[i]),
    linesEn: chosen.map((i) => f.linesEn[i]),
    num,
  };
}
