// Zine Recta — propagande hebdomadaire en 8 pages (A4 pliée).
// Contenu : beats, communiqués, avis, micro-nouvelles, tactiques.
// Exportable PDF (impression) + PNG (réseaux).

import * as fs from "node:fs";
import * as path from "node:path";
import PDFDocument from "pdfkit";
import { narrativeBeat, langForDay } from "./narrative";
import { microNouvelleFor } from "./micronouvelle";
import { generateRenegatCaption } from "./renegats";
import { resolveTactique } from "./tactiques-gen";
import type { Lang } from "./i18n";
import { GGR_MENTION } from "./i18n";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842; // A4
const MARGIN = 20;

interface ZineGenOptions {
  week: number; // numéro de semaine
  lang?: Lang;
  outDir?: string;
}

/** Génère un PDF Zine 8 pages (A4 pliée). */
export async function generateZinePDF(opts: ZineGenOptions): Promise<string> {
  const outDir = opts.outDir || path.resolve("export");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const today = new Date();
  const lang = opts.lang || langForDay(today);
  const weekNum = opts.week || Math.ceil((today.getDate() - today.getDay() + 1) / 7);

  // Générer contenu
  const beat = narrativeBeat(today, { lang });
  const micro1 = microNouvelleFor(`micro:${today.toISOString().slice(0, 7)}-1`, lang);
  const micro2 = microNouvelleFor(`micro:${today.toISOString().slice(0, 7)}-2`, lang);
  const micro3 = microNouvelleFor(`micro:${today.toISOString().slice(0, 7)}-3`, lang);
  const renegat = generateRenegatCaption(`zine:week${weekNum}`, undefined, lang);
  const tactique = resolveTactique(`zine:week${weekNum}`, lang);

  // Créer PDF
  const pdfPath = path.join(outDir, `zine-${today.toISOString().slice(0, 10)}-${lang}.pdf`);
  const doc = new PDFDocument({ size: "A4" });
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  // Page 1 : Couverture
  doc.fontSize(32).font("Helvetica-Bold").text("⬢ RECTA", MARGIN, 100, { align: "center" });
  doc.fontSize(16).text(`Semaine ${weekNum}`, MARGIN, 150, { align: "center" });
  doc.fontSize(12).text(`${today.toLocaleDateString("fr-FR")}`, MARGIN, 180, { align: "center" });
  doc.fontSize(10).text("Feuilleton narratif procédural", MARGIN, 250, { align: "center" });
  doc.fontSize(10).text("Communiqués de la Rectitude", MARGIN, 280, { align: "center" });
  doc.fontSize(8).text(`https://bsky.app/profile/robotariis.bsky.social`, MARGIN, 600, { align: "center" });

  // Page 2 : Beat principal
  doc.addPage();
  doc.fontSize(14).font("Helvetica-Bold").text(`BEAT — Jour ${beat.storyDay}`, MARGIN, MARGIN);
  doc.fontSize(10).font("Helvetica").text(beat.communique.corps, MARGIN, 80, { width: PAGE_WIDTH - 2 * MARGIN, align: "left" });

  // Page 3 : Micro-nouvelles 1-2
  doc.addPage();
  doc.fontSize(14).font("Helvetica-Bold").text("MICRO-NOUVELLES", MARGIN, MARGIN);
  doc.fontSize(11).font("Helvetica-Bold").text(micro1.title, MARGIN, 50);
  doc.fontSize(9).font("Helvetica").text(micro1.body, MARGIN, 80, { width: PAGE_WIDTH - 2 * MARGIN, align: "left" });
  doc.fontSize(11).font("Helvetica-Bold").text(micro2.title, MARGIN, 300);
  doc.fontSize(9).font("Helvetica").text(micro2.body, MARGIN, 330, { width: PAGE_WIDTH - 2 * MARGIN, align: "left" });

  // Page 4 : Micro-nouvelle 3
  doc.addPage();
  doc.fontSize(11).font("Helvetica-Bold").text(micro3.title, MARGIN, MARGIN);
  doc.fontSize(9).font("Helvetica").text(micro3.body, MARGIN, 50, { width: PAGE_WIDTH - 2 * MARGIN, align: "left" });

  // Page 5 : Avis R3N3G4TS
  doc.addPage();
  doc.fontSize(14).font("Helvetica-Bold").text("AVIS DE RECHERCHE", MARGIN, MARGIN);
  doc.fontSize(12).text(`R3N3G4T # ${renegat.numero}`, MARGIN, 60, { align: "center" });
  doc.fontSize(10).text(renegat.caption, MARGIN, 150, { width: PAGE_WIDTH - 2 * MARGIN, align: "left" });

  // Page 6 : Tactiques
  doc.addPage();
  doc.fontSize(14).font("Helvetica-Bold").text("TACTIQUE RECTA", MARGIN, MARGIN);
  doc.fontSize(10).font("Helvetica").text(`Code: ${tactique.code}`, MARGIN, 60);
  doc.fontSize(9).font("Helvetica").text(tactique.text, MARGIN, 100, { width: PAGE_WIDTH - 2 * MARGIN, align: "left" });

  // Page 7 : Mentions + liens
  doc.addPage();
  doc.fontSize(12).font("Helvetica-Bold").text("MENTIONS", MARGIN, MARGIN);
  doc.fontSize(8).font("Helvetica").text(GGR_MENTION[lang], MARGIN, 60, { width: PAGE_WIDTH - 2 * MARGIN });

  // Page 8 : Dos (colophon)
  doc.addPage();
  doc.fontSize(10).font("Helvetica-Bold").text("Recta", MARGIN, PAGE_HEIGHT - 100, { align: "center" });
  doc.fontSize(8).font("Helvetica").text("Feuilleton narratif procédural", MARGIN, PAGE_HEIGHT - 80, { align: "center" });
  doc.fontSize(8).text("robotariis.bsky.social", MARGIN, PAGE_HEIGHT - 60, { align: "center" });

  doc.end();

  // Attendre la fin de l'écriture
  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`Zine générée : ${pdfPath}`);
      resolve(pdfPath);
    });
    stream.on("error", reject);
  });
}
