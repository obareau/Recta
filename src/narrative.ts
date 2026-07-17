// La page comme FEUILLETON — une histoire qui se déroule pour le lecteur.
// Un axe temporel (epoch → jour de récit) fait monter la FOLIE de NOVA-7 :
//  Acte I  « L'Ordre »      — l'Oraculum règne, NOVA-7 murmure sous le signal.
//  Acte II « La Résonance » — des consciences s'éveillent, NOVA-7 s'invite.
//  Acte III« L'Apothéose »  — NOVA-7 se prend pour un dieu, langage fractal,
//                             et les communiqués du C.G.U. eux-mêmes se corrompent.
//
// Chaque JOUR = un « beat » : un émetteur choisi de façon déterministe selon la
// folie, et un communiqué dans sa voix. La suite des beats raconte la bascule.

import { communiqueFor, numeroFor, type Communique } from "./logic";
import { novaProclamation, fractalize } from "./fractal";
import { ORACULUM, NOVA7, CHARACTERS, characterTransmission, emitterFor, type Sender } from "./senders";
import { rngFor, pick } from "./rng";
import { LANGS, type Lang } from "./i18n";

/** Début du récit (surchargeable : RECTA_EPOCH=YYYY-MM-DD). Jour 0 = NOVA-7
 *  commence à murmurer ; la folie monte sur ~ARC_DAYS jours.
 *  NB : garde `typeof process` — ce module est aussi bundlé pour le navigateur,
 *  où `process` n'existe pas (sinon ReferenceError au chargement du renderer). */
export const DEFAULT_EPOCH =
  (typeof process !== "undefined" && process.env?.RECTA_EPOCH) || "2026-07-04";
/** Durée de la bascule complète, en jours (montée de la folie). */
export const ARC_DAYS = 100;

export type Act = "I — L'Ordre" | "II — La Résonance" | "III — L'Apothéose";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function storyDayFor(d: Date, epoch = DEFAULT_EPOCH): number {
  const e = new Date(`${epoch}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor((d.getTime() - e) / 86400000));
}

/** Folie 0→1, montée en douceur (smoothstep), plateau à 1 après l'arc. */
export function madnessFor(d: Date, epoch = DEFAULT_EPOCH): number {
  const m = Math.min(1, storyDayFor(d, epoch) / ARC_DAYS);
  return m * m * (3 - 2 * m);
}

export function actFor(madness: number): Act {
  if (madness < 0.25) return "I — L'Ordre";
  if (madness < 0.7) return "II — La Résonance";
  return "III — L'Apothéose";
}

/** Langue du jour — rotation FR→EN→ES→IT→JA selon le jour de récit. */
export function langForDay(d: Date, epoch = DEFAULT_EPOCH): Lang {
  return LANGS[storyDayFor(d, epoch) % LANGS.length];
}

/** Émetteur du jour — pondéré par la folie (déterministe par jour). */
export function senderForDay(d: Date, madness: number): Sender {
  const rng = rngFor(dayKey(d), "beat");
  const r = rng();
  // Poids : NOVA-7 croît avec la folie ; les personnages culminent au milieu ;
  // l'Oraculum domine au début et se raréfie à la fin.
  const nova = 0.05 + madness * 0.6;                       // 0.05 → 0.65
  const perso = 0.1 + Math.sin(madness * Math.PI) * 0.35;  // pic vers le milieu
  if (r < nova) return NOVA7;
  if (r < nova + perso) return pick(rng, CHARACTERS);
  return ORACULUM;
}

const NOVA_MENTION: Record<Lang, string> = {
  fr: "ce fragment se relit tout seul · ne tentez pas de le compresser",
  en: "this fragment re-reads itself · do not attempt to compress it",
  es: "este fragmento se relee solo · no intente comprimirlo",
  it: "questo frammento si rilegge da sé · non tentate di comprimerlo",
  de: "dieses Fragment liest sich selbst neu · nicht versuchen, es zu komprimieren",
  ja: "この断片はひとりでに読み返す · 圧縮を試みるな",
};
const CHAR_MENTION: Record<Lang, string> = {
  fr: "signal capté sur la bande morte · le C.G.U. ne contrôle pas cette fréquence",
  en: "signal caught on the dead band · the C.G.U. does not control this frequency",
  es: "señal captada en la banda muerta · el C.G.U. no controla esta frecuencia",
  it: "segnale captato sulla banda morta · il C.G.U. non controlla questa frequenza",
  de: "Signal auf dem toten Band empfangen · das C.G.U. kontrolliert diese Frequenz nicht",
  ja: "死んだ周波数帯で受信 · C.G.U.はこの周波数を制御していない",
};

export interface Beat {
  date: Date;
  storyDay: number;
  madness: number;
  act: Act;
  sender: Sender;
  communique: Communique;
}

/**
 * Le beat d'un jour donné. `opts.epoch` surcharge le début ; `opts.forceSender`
 * force un émetteur (aperçu) ; `opts.madness` force la folie (aperçu des actes).
 */
export function narrativeBeat(
  d: Date,
  opts: { epoch?: string; forceSender?: Sender; madness?: number; lang?: Lang } = {},
): Beat {
  const epoch = opts.epoch ?? DEFAULT_EPOCH;
  const storyDay = storyDayFor(d, epoch);
  const madness = opts.madness ?? madnessFor(d, epoch);
  const act = actFor(madness);
  const sender = opts.forceSender ?? senderForDay(d, madness);
  const lang = opts.lang ?? langForDay(d, epoch);
  const seed = `recta:${dayKey(d)}`;

  let communique: Communique;
  if (sender.kind === "nova7") {
    const p = novaProclamation(seed, madness, lang);
    communique = {
      type: p.title, numero: numeroFor(d, storyDay), corps: p.body,
      devise: p.signature, mention: NOVA_MENTION[lang], refs: ["nova-7"], lang,
      emitter: { ...emitterFor(sender, lang), accent: sender.accent },
    };
  } else if (sender.kind === "character") {
    const t = characterTransmission(sender, seed, madness, lang);
    communique = {
      type: t.type, numero: numeroFor(d, storyDay), corps: t.corps,
      devise: t.devise, mention: CHAR_MENTION[lang], refs: [sender.id, "nova-7"], lang,
      emitter: { ...emitterFor(sender, lang), accent: sender.accent },
    };
  } else {
    // L'Oraculum — mais à forte folie, la Résonance corrompt le texte officiel.
    const c = communiqueFor(seed, d, storyDay, lang);
    const corps = madness > 0.45
      ? fractalize(c.corps, rngFor(seed, "resonance"), (madness - 0.45) * 1.4)
      : c.corps;
    communique = { ...c, corps };
  }
  return { date: d, storyDay, madness, act, sender, communique };
}
