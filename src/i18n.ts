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

/**
 * Étiquettes d'en-tête localisées (libellés génériques). Les NOMS PROPRES
 * (C.G.U., CONSEIL DES GOUVERNANCES UNIES, NOVA-7, Oraculum, Recta, personnages)
 * restent en dur ailleurs — jamais traduits.
 */
export interface Labels {
  communiqueNo: string;         // « COMMUNIQUÉ N° »
  mandatoryDiffusion: string;   // « DIFFUSION OBLIGATOIRE »
  personalTransmission: string; // en-tête d'une transmission de personnage
  unlistedChannel: string;      // en-tête NOVA-7
  doNotArchive: string;         // sous-titre NOVA-7
  tacticProtocol: string;       // en-tête d'une Tactique Recta
  operationalOnly: string;      // pied d'une tactique
}

export const LABELS: Record<Lang, Labels> = {
  fr: {
    communiqueNo: "COMMUNIQUÉ N°",
    mandatoryDiffusion: "DIFFUSION OBLIGATOIRE",
    personalTransmission: "◂ TRANSMISSION PERSONNELLE ▸",
    unlistedChannel: "◈ CANAL NON RÉPERTORIÉ ◈",
    doNotArchive: "SIGNAL AUTO-RÉPLIQUANT — NE PAS ARCHIVER",
    tacticProtocol: "PROTOCOLE DE DÉCISION — TACTIQUE RECTA",
    operationalOnly: "usage opérationnel uniquement — le calcul est clos",
  },
  en: {
    communiqueNo: "COMMUNIQUÉ No.",
    mandatoryDiffusion: "MANDATORY BROADCAST",
    personalTransmission: "◂ PERSONAL TRANSMISSION ▸",
    unlistedChannel: "◈ UNLISTED CHANNEL ◈",
    doNotArchive: "SELF-REPLICATING SIGNAL — DO NOT ARCHIVE",
    tacticProtocol: "DECISION PROTOCOL — RECTA TACTIC",
    operationalOnly: "operational use only — the calculation is closed",
  },
  es: {
    communiqueNo: "COMUNICADO N.º",
    mandatoryDiffusion: "DIFUSIÓN OBLIGATORIA",
    personalTransmission: "◂ TRANSMISIÓN PERSONAL ▸",
    unlistedChannel: "◈ CANAL NO REGISTRADO ◈",
    doNotArchive: "SEÑAL AUTORREPLICANTE — NO ARCHIVAR",
    tacticProtocol: "PROTOCOLO DE DECISIÓN — TÁCTICA RECTA",
    operationalOnly: "uso operativo únicamente — el cálculo está cerrado",
  },
  it: {
    communiqueNo: "COMUNICATO N.",
    mandatoryDiffusion: "DIFFUSIONE OBBLIGATORIA",
    personalTransmission: "◂ TRASMISSIONE PERSONALE ▸",
    unlistedChannel: "◈ CANALE NON REGISTRATO ◈",
    doNotArchive: "SEGNALE AUTOREPLICANTE — NON ARCHIVIARE",
    tacticProtocol: "PROTOCOLLO DI DECISIONE — TATTICA RECTA",
    operationalOnly: "uso operativo soltanto — il calcolo è chiuso",
  },
  ja: {
    communiqueNo: "公報 No.",
    mandatoryDiffusion: "強制配信",
    personalTransmission: "◂ 個人送信 ▸",
    unlistedChannel: "◈ 未登録チャンネル ◈",
    doNotArchive: "自己複製信号 — 保存禁止",
    tacticProtocol: "決定プロトコル — RECTA 戦術",
    operationalOnly: "運用目的のみ — 計算は完了",
  },
};

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
