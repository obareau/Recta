// Légendes bilingues (FR/EN) pour les trois flux sociaux. L'affiche reste en
// français (identité visuelle de la Rectitude) ; la légende contextualise en
// anglais pour les réseaux internationaux (Bluesky/Mastodon).
//
// v1 : le corps FR de l'affiche n'est PAS traduit mot à mot (les 200 tactiques
// sont un chantier ultérieur). La légende EN encadre l'univers et invite.

import type { Communique } from "./logic";
import type { Tactique } from "./tactiques";
import type { Pirate } from "./pirate-content";
import type { Captions } from "./social/broadcast";
import type { Beat } from "./narrative";
import { GGR_MENTION, type Lang } from "./i18n";

const LINK = "▸ robotariis.com";
const TAGS_FR = "#robotariis #retrofuturisme #scifi #dystopie";
const TAGS_EN = "#generativeart #scifi #dystopia #worldbuilding #retrofuturism";
const TAGS_ES = "#ficcionCientifica #distopia #generativeart #robotariis #mundosficticio";
const TAGS_IT = "#fantascienza #distopia #artegenerativo #robotariis #retrofuturismo";
const TAGS_JA = "#SF #ディストピア #生成アート #ロボタリス #レトロフューチャー";

export function tagsFor(lang: Lang): string {
  const map: Record<Lang, string> = { fr: TAGS_FR, en: TAGS_EN, es: TAGS_ES, it: TAGS_IT, ja: TAGS_JA };
  return map[lang] || TAGS_FR;
}

/** Communiqué du jour. */
export function communiqueCaptions(c: Communique): Captions {
  const fr =
    `⬢ COMMUNIQUÉ N° ${c.numero} — ${c.type}\n\n${c.corps}\n\n${c.devise}\n\n` +
    `${LINK}\n${TAGS_FR}`;
  const en =
    `⬢ COMMUNIQUÉ N° ${c.numero} — ${c.type}\n\n${c.corps}\n\n${c.devise}\n\n` +
    `— Daily decree from the Rectitude, a French retrofuturist SF dystopia (1940s–60s). ` +
    `Fully procedural, generated fresh each day.\n${LINK}\n${TAGS_EN}`;
  const alt = `Retrofuturist propaganda poster of the Rectitude, communiqué ${c.numero}, type ${c.type}.`;
  return { fr, en, alt };
}

/**
 * Beat narratif du jour (feuilleton) — la légende s'adapte à l'émetteur
 * (Oraculum / personnage / NOVA-7) et porte la mention GGR + l'acte en cours.
 */
export function beatCaptions(beat: Beat): Captions {
  const c = beat.communique;
  const lang = c.lang ?? "fr";
  const ggr = GGR_MENTION[lang];
  const tags = tagsFor(lang);
  let header: string;
  if (beat.sender.kind === "nova7") header = `◈ TRANSMISSION NON RÉPERTORIÉE — ${c.type}`;
  else if (beat.sender.kind === "character") header = `◂ ${c.type} — ${beat.sender.name} ▸`;
  else header = `⬢ COMMUNIQUÉ N° ${c.numero} — ${c.type}`;

  const fr =
    `${header}\n\n${c.corps}\n\n${c.devise}\n\n${ggr}\n${LINK}\n${tags}`;
  const en =
    `${header}\n\n${c.corps}\n\n${c.devise}\n\n` +
    `— ROBOTARIIS: a serialized SF dystopia unfolding day by day. ` +
    `Act ${beat.act}. The regime's grammar generator is obsolete and may err.\n${LINK}\n${tags}`;
  const alt = `Retrofuturist poster — ${beat.sender.name}, ${c.type}, act ${beat.act}.`;
  return { fr, en, alt };
}

/** Tactique Recta (directive brève). */
export function tactiqueCaptions(t: Tactique): Captions {
  const fr =
    `⬢ TACTIQUE RECTA ${t.code} — ${t.segLabel}\n\n${t.text}\n\n` +
    `Protocole de décision du C.G.U. — usage opérationnel uniquement.\n${LINK}\n${TAGS_FR}`;
  const en =
    `⬢ TACTIQUE RECTA ${t.code}\n\n${t.text}\n\n` +
    `— A cold decision directive from the Rectitude. Oblique-strategies for a ` +
    `procedurally generated dystopia.\n${LINK}\n${TAGS_EN}`;
  const alt = `Retrofuturist card, tactical directive ${t.code} of the Rectitude.`;
  return { fr, en, alt };
}

/** Transmission pirate (détournement Nova 7 / Renégats). */
export function pirateCaptions(p: Pirate): Captions {
  const fr =
    `◂ TRANSMISSION NON AUTORISÉE — ${p.tag} ▸\n\n${p.lines.join("\n")}\n\n${p.sign}\n\n` +
    `— le C.G.U. ne contrôle pas cette fréquence · ce signal n'existe pas —\n${LINK}`;
  const en =
    `◂ UNAUTHORISED TRANSMISSION — ${p.tag} ▸\n\n${p.linesEn.join("\n")}\n\n${p.signEn}\n\n` +
    `— the C.G.U. does not control this frequency · this signal does not exist —\n${LINK}\n${TAGS_EN}`;
  const alt = `Glitched pirate hijack of a Rectitude poster, faction ${p.tag}.`;
  return { fr, en, alt };
}

// INTRO vivait dans micro-publish.ts, que main.ts importait pour cette seule
// constante. Or micro-publish.ts appelle main() au niveau module : charger
// main.ts dans Electron déclenchait donc une publication de micro-nouvelle,
// qui lançait un second Electron — une récursion. C'est ce qui rendait chaque
// rendu interminable sur Roblab (~9 min) jusqu'à l'OOM killer. INTRO est une
// donnée de légende : sa place est ici, avec les autres.
export const INTRO: Record<Lang, string> = {
  fr: "Une micro-nouvelle du Distributeur d'Histoires Courtes — univers ROBOTARIIS.",
  en: "A micro-story from the Short Story Dispenser — the ROBOTARIIS universe.",
  es: "Un microrrelato del Dispensador de Relatos Breves — universo ROBOTARIIS.",
  it: "Un microracconto dal Distributore di Racconti Brevi — universo ROBOTARIIS.",
  ja: "ショートショート配給機より、ひとつの物語 — ROBOTARIIS の宇宙。",
};
