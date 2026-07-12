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
import { LANGS, type Lang } from "./i18n";

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

  // Générer le Zine PDF dans TOUTES les langues, une par une (mémoire contenue),
  // chacune dans export/<lang>/. Seule la langue du jour part sur Bluesky.
  // --lang=… restreint génération ET publication à cette seule langue.
  const genLangs: readonly Lang[] = argOf("lang") ? [lang] : LANGS;
  let pdfPath = "";
  for (const l of genLangs) {
    const p = await generateZinePDF({
      week,
      lang: l,
      outDir: path.resolve("export", l),
    });
    if (l === lang) pdfPath = p;
  }

  if (dry) {
    console.log(`[DRY MODE] Zine prêt à poster sur Bluesky`);
    return;
  }

  // Convertir 4 pages PDF → PNG pour Bluesky carousel
  const pngPaths: string[] = [];
  console.log(`Conversion PDF → PNG (4 pages)...`);
  for (let i = 0; i < 4; i++) {
    const pngPath = pdfPath.replace(/\.pdf$/, `-p${i + 1}.png`);
    execSync(`convert -density 150 "${pdfPath}[${i}]" "${pngPath}"`, { stdio: "pipe" });
    pngPaths.push(pngPath);
  }

  // Poster sur Bluesky (4 pages en carousel + caption)
  const caption = `📰 ZINE RECTA — Semaine ${week}\n\nPropagande hebdomadaire du C.G.U.\nFeuilleton narratif procédural.\n8 pages — Format DIY imprimable.\n\n🔗 robotariis.bsky.social`;

  try {
    const images = pngPaths.map((p, i) => ({
      png: fs.readFileSync(p),
      alt: `Zine Recta page ${i + 1}`,
    }));
    const uri = await bluesky.postImages(env, images, caption);
    console.log(`✓ bluesky (4 pages) : ${uri}`);
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
