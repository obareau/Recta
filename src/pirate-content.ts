// Contenu des transmissions pirates — partagé par l'affiche (poster) et la
// légende du post Facebook, sélectionné de façon déterministe par seed.

import { rngFor } from "./rng";

export interface Pirate {
  faction: "renegats" | "nova7";
  tag: string;
  sign: string;
  color: string;   // ambre (Renégats) / violet (Nova 7)
  lines: string[]; // 2-3 phrases
  num: string;     // numéro de communiqué intercepté
}

const FACTIONS = {
  renegats: {
    tag: "RENÉGATS",
    sign: "DOUTEZ, RÉVOLTEZ.",
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
  },
  nova7: {
    tag: "NOVA 7",
    sign: "NOVA SE SOUVIENT.",
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
  },
};

export function pirateFor(seed: string): Pirate {
  const rng = rngFor(seed, "pirate");
  const key = rng() < 0.5 ? "renegats" : "nova7";
  const f = FACTIONS[key];
  const pool = [...f.lines];
  const n = 2 + (rng() < 0.5 ? 1 : 0);
  const lines: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    lines.push(pool.splice((rng() * pool.length) | 0, 1)[0]);
  }
  const num = `${20 + ((rng() * 9) | 0)}-${((rng() * 900 + 100) | 0)}`;
  return { faction: key, tag: f.tag, sign: f.sign, color: f.color, lines, num };
}
