// Publication HybR1D — portrait rallié/aligné, Bluesky + Mastodon
//
//   npm run hybrid                 # poste un HybR1D (anti-doublon par image)
//   npm run hybrid -- --dry        # montre sans poster
//   npm run hybrid -- --force      # ignore l'anti-doublon

import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import { loadEnv } from "./social/env";
import * as bluesky from "./social/bluesky";
import * as mastodon from "./social/mastodon";
import {
  generateHybridCaption,
  listHybridImages,
} from "./hybrids";
import { pickUnusedImage, addToCache } from "./hybrid-cache";
import { langForDay } from "./narrative";
import type { Lang } from "./i18n";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

/** Normalise n'importe quelle image source en JPEG < 1 Mo (limite Bluesky). */
function toJpeg(srcPath: string): Buffer {
  const outDir = path.resolve("export");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `hybrid-${Date.now()}.jpg`);
  // Redimensionne (max 1440), qualité 88, retire les métadonnées.
  execFileSync("convert", [
    srcPath,
    "-resize", "1440x1440>",
    "-quality", "88",
    "-strip",
    outPath,
  ]);
  const buf = fs.readFileSync(outPath);
  fs.rmSync(outPath, { force: true });
  return buf;
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const force = process.argv.includes("--force");
  const lang = (argOf("lang") as Lang) || langForDay(new Date());
  const seed = argOf("seed") || `hybrid:${Date.now()}`;

  const images = listHybridImages();
  const imagePath = force
    ? images[Math.floor(Math.random() * images.length)]
    : pickUnusedImage(images);

  const { numero, caption } = generateHybridCaption(seed, undefined, lang, imagePath);
  console.log(`HybR1D aligné — # ${numero} (${lang})`);
  console.log(`Image: ${path.basename(imagePath)}`);

  if (dry) {
    console.log(`\n─── BLUESKY / MASTODON ───\n${caption}`);
    return;
  }

  const jpeg = toJpeg(imagePath);
  const alt = `HybR1D aligned portrait #${numero}`;
  const env = loadEnv();
  let lastUri: string | undefined;
  let posted = false;

  for (const network of ["bluesky", "mastodon"] as const) {
    try {
      const uri =
        network === "bluesky"
          ? await bluesky.postImages(env, [{ png: jpeg, alt }], caption)
          : await mastodon.postImage(env, jpeg, caption, alt);
      console.log(`✓ ${network} : ${uri}`);
      lastUri = uri;
      posted = true;
    } catch (e) {
      console.error(`✗ ${network} : ${(e as Error).message}`);
    }
  }

  if (!posted) throw new Error("Aucun réseau n'a accepté le HybR1D.");

  addToCache({
    image: path.basename(imagePath),
    numero,
    timestamp: new Date().toISOString(),
    uri: lastUri || "?",
  });
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
