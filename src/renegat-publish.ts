// Publication avis de recherche R3N3G4TS (Bluesky + Mastodon)
//
//   npm run renegat                    # poste un avis (anti-doublons)
//   npm run renegat -- --dry           # montre l'avis sans rien poster
//   npm run renegat -- --force         # force un nouvel avis même si cache plein

import { loadEnv } from "./social/env";
import * as bluesky from "./social/bluesky";
import * as mastodon from "./social/mastodon";
import { generateRenegatCaption, loadRenegatImage } from "./renegats";
import { findUniqueNumero, hasBeenPosted, addToCache } from "./renegat-cache";
import { langForDay } from "./narrative";
import type { Lang } from "./i18n";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const force = process.argv.includes("--force");
  const seed = argOf("seed") || `renegat:${Date.now()}`;
  const lang = (argOf("lang") as Lang) || langForDay(new Date());

  // 1. Vérifier les doublons si pas --force
  let numero: number;
  if (!force && !argOf("seed")) {
    numero = findUniqueNumero();
  } else {
    // Si seed spécifié ou --force, générer normalement
    const { imagePath: _, numero: num } = generateRenegatCaption(seed, undefined, lang);
    numero = num;
    if (!force && hasBeenPosted(numero)) {
      throw new Error(`Avis # ${numero} déjà posté. Utilisez --force pour bypasser.`);
    }
  }

  // 2. Générer avis (avec le numéro choisi et langue du jour)
  const { imagePath, caption } = generateRenegatCaption(seed, numero, lang);
  console.log(`Avis de recherche — # ${numero} (${lang})`);
  console.log(`Image: ${imagePath}`);

  if (dry) {
    console.log(`\n─── BLUESKY / MASTODON ───\n${caption}\n[image] ${imagePath}`);
    return;
  }

  // 3. Charger image
  const png = loadRenegatImage(imagePath);

  // 4. Publier sur Bluesky + Mastodon
  const env = loadEnv();
  const alt = `R3N3G4T wanted notice #${numero}`;
  let lastUri: string | undefined;
  let posted = false;

  for (const network of ["bluesky", "mastodon"] as const) {
    try {
      const uri =
        network === "bluesky"
          ? await bluesky.postImage(env, png, caption, alt)
          : await mastodon.postImage(env, png, caption, alt);
      console.log(`✓ ${network} : ${uri}`);
      lastUri = uri;
      posted = true;
    } catch (e) {
      console.error(`✗ ${network} : ${(e as Error).message}`);
    }
  }

  if (!posted) {
    throw new Error("Aucun réseau n'a accepté la publication.");
  }

  // 5. Ajouter au cache
  addToCache({
    numero,
    seed,
    timestamp: new Date().toISOString(),
    uri: lastUri || "?",
  });
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
