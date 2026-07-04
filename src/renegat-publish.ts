// Publication avis de recherche R3N3G4TS sur Bluesky
//
//   npm run renegat                    # poste un avis aléatoire
//   npm run renegat -- --dry           # montre l'avis sans rien poster
//   npm run renegat -- --seed=xyz      # seed déterministe

import { loadEnv } from "./social/env";
import { postImage } from "./social/bluesky";
import { generateRenegatCaption, loadRenegatImage } from "./renegats";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const seed = argOf("seed") || `renegat:${Date.now()}`;

  // 1. Générer avis de recherche
  const { imagePath, numero, caption } = generateRenegatCaption(seed);
  console.log(`Avis de recherche — # ${numero}`);
  console.log(`Image: ${imagePath}`);

  if (dry) {
    console.log(`\n─── BLUESKY ───\n${caption}\n[image] ${imagePath}`);
    return;
  }

  // 2. Charger image
  const png = loadRenegatImage(imagePath);

  // 3. Publier
  const env = loadEnv();
  try {
    const uri = await postImage(env, png, caption, `R3N3G4T wanted notice #${numero}`);
    console.log(`✓ Posté : ${uri}`);
  } catch (e) {
    throw new Error(`Publication échouée : ${(e as Error).message}`);
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
