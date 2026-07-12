// Zine Recta — micro-zine propagande : 8 mini-pages sur UNE feuille A4 paysage.
// Imposition « plier 3× + une coupe » (format fringearts / mini-zine classique).
// La rangée du haut est imprimée à l'envers (180°) pour le pliage final.
//
//   Disposition sur la feuille (paysage, 4 colonnes × 2 rangées),
//   imposition fringearts (dos & couverture au centre-bas) :
//     Haut  (180°) :  p7  p6  p5  p4
//     Bas   (0°)   :  p8(dos)  p1(couv)  p2  p3
//
// Pages logiques (ordre de lecture du livret plié) :
//   1 couverture · 2 beat · 3 communiqué · 4 micro-1
//   5 micro-2 · 6 avis R3N3G4T · 7 tactique · 8 dos/colophon
//
// Exportable PDF (impression recto) + PNG (réseaux).

import * as fs from "node:fs";
import * as path from "node:path";
import PDFDocument from "pdfkit";
import { narrativeBeat, langForDay } from "./narrative";
import { microNouvelleFor } from "./micronouvelle";
import { generateRenegatCaption } from "./renegats";
import { resolveTactique } from "./tactiques-gen";
import type { Lang } from "./i18n";
import { GGR_MENTION } from "./i18n";

// A4 paysage (points PDF).
const SHEET_W = 842;
const SHEET_H = 595;
const COLS = 4;
const ROWS = 2;
const CELL_W = SHEET_W / COLS; // 210.5
const CELL_H = SHEET_H / ROWS; // 297.5
const PAD = 12;

// Imposition : quelle page logique (1-8) va dans chaque cellule [row][col],
// et si elle est pivotée à 180° (rangée du haut).
// row 0 = haut (180°), row 1 = bas (0°).
const IMPOSITION: { page: number; rotated: boolean }[][] = [
  // Rangée haut (à l'envers) : p7 p6 p5 p4
  [
    { page: 7, rotated: true },
    { page: 6, rotated: true },
    { page: 5, rotated: true },
    { page: 4, rotated: true },
  ],
  // Rangée bas (à l'endroit) : p8(dos) p1(couv) p2 p3
  [
    { page: 8, rotated: false },
    { page: 1, rotated: false },
    { page: 2, rotated: false },
    { page: 3, rotated: false },
  ],
];

interface ZineGenOptions {
  week: number;
  lang?: Lang;
  outDir?: string;
  /** Jour représenté par le zine (défaut : maintenant) — nécessaire pour un
   *  calendrier éditorial (npm run campaign) qui génère plusieurs jours à l'avance. */
  date?: Date;
}

type Doc = PDFKit.PDFDocument;

/** Tronque un texte à n caractères, coupe sur un mot, ajoute « … ». */
function trunc(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

/** Dessine un hexagone plein (le sigil ⬢ de la Rectitude) centré en (cx, cy). */
function hexagon(doc: Doc, cx: number, cy: number, r: number): void {
  doc.save();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2; // pointe en haut
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) doc.moveTo(px, py);
    else doc.lineTo(px, py);
  }
  doc.closePath().fillColor("#000000").fill();
  doc.restore();
}

/** Contenu d'une mini-page, dessiné en coordonnées locales (origine = coin cellule). */
type PageDrawer = (doc: Doc, x: number, y: number) => void;

/** Dessine une mini-page dans sa cellule, avec rotation 180° optionnelle. */
function drawCell(doc: Doc, row: number, col: number, rotated: boolean, draw: PageDrawer): void {
  const x = col * CELL_W;
  const y = row * CELL_H;

  // Cadre de coupe (gris clair, guide d'impression).
  doc.save();
  doc.lineWidth(0.3).strokeColor("#cccccc").rect(x, y, CELL_W, CELL_H).stroke();
  doc.restore();

  doc.save();
  if (rotated) {
    doc.rotate(180, { origin: [x + CELL_W / 2, y + CELL_H / 2] });
  }
  doc.fillColor("#000000");
  draw(doc, x, y);
  doc.restore();
}

/** Génère le micro-zine PDF (1 feuille A4 paysage, 8 mini-pages). */
export async function generateZinePDF(opts: ZineGenOptions): Promise<string> {
  const outDir = opts.outDir || path.resolve("export");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const today = opts.date ?? new Date();
  const lang = opts.lang || langForDay(today);
  const weekNum = opts.week || Math.ceil((today.getDate() - today.getDay() + 1) / 7);

  // Contenu procédural.
  const iso = today.toISOString().slice(0, 10);
  const beat = narrativeBeat(today, { lang });
  const micro1 = microNouvelleFor(`zine-micro-a:${iso}:w${weekNum}`, lang);
  const micro2 = microNouvelleFor(`zine-micro-b:${iso}:w${weekNum}`, lang);
  const renegat = generateRenegatCaption(`zine:week${weekNum}`, undefined, lang);
  const tactique = resolveTactique(`zine:week${weekNum}`, lang);

  // Largeur de texte utile dans une cellule.
  const tw = CELL_W - 2 * PAD;

  // Définition des 8 mini-pages (contenu compact — mini-format).
  const PAGES: Record<number, PageDrawer> = {
    // 1 — Couverture
    1: (d, x, y) => {
      hexagon(d, x + CELL_W / 2, y + 74, 16);
      d.fontSize(22).font("Helvetica-Bold").text("RECTA", x + PAD, y + 92, { width: tw, align: "center" });
      d.fontSize(9).font("Helvetica").text(`Semaine ${weekNum}`, x + PAD, y + 130, { width: tw, align: "center" });
      d.fontSize(8).text(today.toLocaleDateString("fr-FR"), x + PAD, y + 146, { width: tw, align: "center" });
      d.fontSize(7).text("Communiqués de la Rectitude", x + PAD, y + 200, { width: tw, align: "center" });
      d.fontSize(6).fillColor("#555555").text("robotariis.bsky.social", x + PAD, y + CELL_H - 30, { width: tw, align: "center" });
    },
    // 2 — Beat
    2: (d, x, y) => {
      d.fontSize(9).font("Helvetica-Bold").text(`BEAT · JOUR ${beat.storyDay}`, x + PAD, y + PAD, { width: tw });
      d.fontSize(6.5).font("Helvetica").text(trunc(beat.communique.corps, 620), x + PAD, y + PAD + 22, { width: tw, align: "justify" });
    },
    // 3 — Communiqué (devise + type)
    3: (d, x, y) => {
      d.fontSize(9).font("Helvetica-Bold").text(beat.communique.type, x + PAD, y + PAD, { width: tw });
      d.fontSize(7).font("Helvetica-Oblique").text(`« ${trunc(beat.communique.devise, 120)} »`, x + PAD, y + PAD + 26, { width: tw });
      d.fontSize(6.5).font("Helvetica").text(trunc(beat.communique.corps.split(".").slice(-3).join("."), 420), x + PAD, y + PAD + 80, { width: tw, align: "justify" });
    },
    // 4 — Micro-nouvelle 1
    4: (d, x, y) => {
      d.fontSize(9).font("Helvetica-Bold").text(trunc(micro1.title, 40), x + PAD, y + PAD, { width: tw });
      d.fontSize(6.5).font("Helvetica").text(trunc(micro1.body, 640), x + PAD, y + PAD + 24, { width: tw, align: "justify" });
    },
    // 5 — Micro-nouvelle 2
    5: (d, x, y) => {
      d.fontSize(9).font("Helvetica-Bold").text(trunc(micro2.title, 40), x + PAD, y + PAD, { width: tw });
      d.fontSize(6.5).font("Helvetica").text(trunc(micro2.body, 640), x + PAD, y + PAD + 24, { width: tw, align: "justify" });
    },
    // 6 — Avis de recherche R3N3G4T
    6: (d, x, y) => {
      d.fontSize(9).font("Helvetica-Bold").text("AVIS DE RECHERCHE", x + PAD, y + PAD, { width: tw, align: "center" });
      d.fontSize(16).font("Helvetica-Bold").text(`# ${renegat.numero}`, x + PAD, y + PAD + 28, { width: tw, align: "center" });
      d.rect(x + PAD + 20, y + PAD + 60, tw - 40, tw - 40).lineWidth(1).strokeColor("#000000").stroke();
      d.fontSize(6).font("Helvetica").text("R3N3G4T", x + PAD, y + PAD + 60 + (tw - 40) / 2 - 4, { width: tw, align: "center" });
      d.fontSize(6).text(trunc(renegat.caption, 140), x + PAD, y + CELL_H - 60, { width: tw, align: "center" });
    },
    // 7 — Tactique
    7: (d, x, y) => {
      d.fontSize(9).font("Helvetica-Bold").text("TACTIQUE RECTA", x + PAD, y + PAD, { width: tw });
      d.fontSize(7).font("Helvetica-Bold").text(tactique.code, x + PAD, y + PAD + 22, { width: tw });
      d.fontSize(6.5).font("Helvetica").text(trunc(tactique.text, 560), x + PAD, y + PAD + 42, { width: tw, align: "justify" });
    },
    // 8 — Dos / colophon
    8: (d, x, y) => {
      d.fontSize(6).font("Helvetica").fillColor("#333333").text(trunc(GGR_MENTION[lang], 300), x + PAD, y + PAD, { width: tw, align: "justify" });
      hexagon(d, x + CELL_W / 2, y + CELL_H - 78, 8);
      d.fontSize(8).font("Helvetica-Bold").fillColor("#000000").text("RECTA", x + PAD, y + CELL_H - 68, { width: tw, align: "center" });
      d.fontSize(6).font("Helvetica").text("Feuilleton narratif procédural", x + PAD, y + CELL_H - 56, { width: tw, align: "center" });
      d.fontSize(6).fillColor("#555555").text("robotariis.bsky.social", x + PAD, y + CELL_H - 42, { width: tw, align: "center" });
    },
  };

  // Créer le PDF (A4 paysage, marges nulles — la feuille EST le zine).
  const pdfPath = path.join(outDir, `zine-${today.toISOString().slice(0, 10)}-${lang}.pdf`);
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Poser les 8 mini-pages selon l'imposition.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const { page, rotated } = IMPOSITION[row][col];
      drawCell(doc, row, col, rotated, PAGES[page]);
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`Micro-zine généré : ${pdfPath}`);
      resolve(pdfPath);
    });
    stream.on("error", reject);
  });
}
