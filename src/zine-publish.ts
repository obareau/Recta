// Publication Zine Recta hebdomadaire — Bluesky
// Convertit PDF → PNG (première page) + poste avec caption
//
//   npm run zinepub                 # poste le Zine de la semaine
//   npm run zinepub -- --dry        # génère sans poster

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { loadEnv } from "./social/env";
import { generateZinePDF } from "./zine-gen";
import * as bluesky from "./social/bluesky";
import { langForDay } from "./narrative";
import type { Lang } from "./i18n";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const today = new Date();
  const lang = (argOf("lang") as Lang) || langForDay(today);

  // Calculer le numéro de semaine
  const week = Math.ceil((today.getDate() - today.getDay() + 1) / 7);

  console.log(`Zine propagande — semaine ${week} (${lang})`);

  // Générer le Zine PDF
  const pdfPath = await generateZinePDF({
    week,
    lang,
    outDir: path.resolve("export"),
  });

  if (dry) {
    console.log(`[DRY MODE] Zine prêt à poster sur Bluesky`);
    return;
  }

  // Convertir PDF → PNG (première page) pour Bluesky
  const pngPath = pdfPath.replace(/\.pdf$/, ".png");
  console.log(`Conversion PDF → PNG...`);
  execSync(`convert -density 150 "${pdfPath}[0]" "${pngPath}"`, { stdio: "pipe" });

  // Poster sur Bluesky (couverture Zine + caption)
  const caption = `📰 ZINE RECTA — Semaine ${week}\n\nPropagande hebdomadaire du C.G.U.\nFeuilleton narratif procédural.\n8 pages — Format DIY imprimable.\n\n🔗 robotariis.bsky.social`;

  try {
    const png = fs.readFileSync(pngPath);
    const uri = await bluesky.postImage(env, png, caption, "Zine Recta couverture");
    console.log(`✓ bluesky : ${uri}`);
  } catch (e) {
    console.error(`✗ bluesky : ${(e as Error).message}`);
    throw e;
  }

  console.log(`Zine disponible : ${pdfPath}`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
