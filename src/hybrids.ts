// HybR1Ds — renégats RALLIÉS/ALIGNÉS, assimilés par la Rectitude.
// Contraste avec les R3N3G4TS (recherchés) : ici, registre d'alignement.
// Portraits monochromes tatoués/piercés — cadres ornés.
//
// Récupère une image du dossier @HYBRID, ajoute une notice d'alignement
// procédurale (« HybR1D // #NNNN — ALIGNÉ »), puis poste Bluesky + Mastodon.

import * as fs from "fs";
import * as path from "path";
import { rngFor, pick } from "./rng";
import { tagsFor } from "./i18n-captions";
import type { Lang } from "./i18n";

// Dossier source des portraits HybR1D.
export const HYBRID_DIR =
  process.env.RECTA_HYBRID_DIR ||
  path.join(process.env.HOME || "/root", "hubrid-phoco-tri", "@HYBRID");

export interface Hybrid {
  imagePath: string;
  numero: number;
  caption: string;
}

/** Liste les portraits HybR1D disponibles (jpg/jpeg/jfif/png/webp). */
export function listHybridImages(): string[] {
  return fs
    .readdirSync(HYBRID_DIR, { withFileTypes: true })
    .filter((f) => f.isFile() && /\.(jpe?g|jfif|png|webp)$/i.test(f.name))
    .map((f) => path.join(HYBRID_DIR, f.name));
}

/** Notice d'alignement HybR1D (5 langues), ton bureaucratique de la Rectitude. */
export function generateHybridCaption(
  seed: string,
  forceNumero?: number,
  lang?: Lang,
  forceImage?: string,
): Hybrid {
  lang = lang || ("fr" as Lang);
  const rng = rngFor(seed, `hybrid:caption:${lang}`);

  const images = listHybridImages();
  if (images.length === 0) throw new Error(`Aucune image dans ${HYBRID_DIR}`);

  const imagePath = forceImage || pick(rng, images);
  const numero = forceNumero || 1000 + Math.floor(rng() * 9000); // 1000-9999

  const captions: Record<Lang, string[]> = {
    fr: [
      `HybR1D // #${numero} — ALIGNÉ\nStatut : assimilé · conforme\nAutorité : Rectitude`,
      `REGISTRE HybR1D // #${numero}\nDissonance corrigée.\nLa Rectitude vous reconnaît.`,
      `HybR1D #${numero} — INTÉGRÉ\nAncien signal renégat neutralisé.\nAlignement : total`,
    ],
    en: [
      `HybR1D // #${numero} — ALIGNED\nStatus: assimilated · compliant\nAuthority: Rectitude`,
      `HybR1D REGISTRY // #${numero}\nDissonance corrected.\nThe Rectitude acknowledges you.`,
      `HybR1D #${numero} — INTEGRATED\nFormer renegade signal neutralized.\nAlignment: total`,
    ],
    es: [
      `HybR1D // #${numero} — ALINEADO\nEstado: asimilado · conforme\nAutoridad: Rectitud`,
      `REGISTRO HybR1D // #${numero}\nDisonancia corregida.\nLa Rectitud te reconoce.`,
      `HybR1D #${numero} — INTEGRADO\nAntigua señal renegada neutralizada.\nAlineación: total`,
    ],
    it: [
      `HybR1D // #${numero} — ALLINEATO\nStato: assimilato · conforme\nAutorità: Rettitudine`,
      `REGISTRO HybR1D // #${numero}\nDissonanza corretta.\nLa Rettitudine ti riconosce.`,
      `HybR1D #${numero} — INTEGRATO\nEx segnale renegato neutralizzato.\nAllineamento: totale`,
    ],
    ja: [
      `HybR1D // #${numero} — 整合済\n状態：同化・適合\n権限：レクティチュード`,
      `HybR1D 登録簿 // #${numero}\n不協和は修正された。\nレクティチュードはあなたを認める。`,
      `HybR1D #${numero} — 統合済\n旧レネゲート信号は無力化。\n整合率：完全`,
    ],
  };

  const baseCaption = pick(rng, captions[lang]);
  const caption = `${baseCaption}\n${tagsFor(lang)}`;

  return { imagePath, numero, caption };
}

/** Charge les octets bruts d'une image HybR1D. */
export function loadHybridImage(imagePath: string): Buffer {
  return fs.readFileSync(imagePath);
}
