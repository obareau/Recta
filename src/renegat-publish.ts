// Publication avis de recherche R3N3G4TS (Bluesky + Mastodon)
//
//   npm run renegat                    # poste un avis (anti-doublons)
//   npm run renegat -- --dry           # montre l'avis sans rien poster
//   npm run renegat -- --force         # force un nouvel avis même si cache plein

import { loadEnv } from "./social/env";
import { generateRenegatCaption, loadRenegatImage } from "./renegats";
import { findUniqueNumero, hasBeenPosted, addToCache } from "./renegat-cache";
import { postRenegat } from "./renegat-broadcast";
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

  // 4. Publier sur Facebook + Bluesky + Mastodon
  const env = loadEnv();
  const alt = `R3N3G4T wanted notice #${numero}`;
  const results = await postRenegat(env, png, caption, alt);
  const posted = results.some((r) => r.ok);
  const lastUri = results.find((r) => r.ok)?.id;

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
