// Cross-post beat/avis sur X (Twitter)
//
//   npm run cross-post-x -- --beat
//   npm run cross-post-x -- --avis

import { loadEnv } from "./social/env";
import { postTweet } from "./social/twitter";
import { narrativeBeat, langForDay } from "./narrative";
import { beatCaptions } from "./i18n-captions";
import { generateRenegatCaption } from "./renegats";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const isBeat = process.argv.includes("--beat");
  const isAvis = process.argv.includes("--avis");

  if (!isBeat && !isAvis) {
    throw new Error("Spécifier --beat ou --avis");
  }

  const today = new Date();
  let text: string;

  if (isBeat) {
    const lang = langForDay(today);
    const beat = narrativeBeat(today, { lang });
    const caps = beatCaptions(beat);
    text =
      `📡 RECTA — Acte ${beat.act}\n\n` +
      `${beat.communique.type}\n` +
      `${beat.communique.corps.slice(0, 200)}...\n\n` +
      `🔗 En direct: https://bsky.app/profile/robotariis.bsky.social\n` +
      `#ScienceFiction #Dystopia #GenerativeArt`;
  } else {
    const seed = `xpost:${today.toISOString().split("T")[0]}`;
    const { numero, caption } = generateRenegatCaption(seed);
    text =
      `🚨 WANTED: R3N3G4T\n` +
      `# ${numero}\n\n` +
      `Outlaw frequency detected.\n\n` +
      `🔗 Voir les avis: https://bsky.app/profile/robotariis.bsky.social\n` +
      `#R3N3G4TS #Wanted`;
  }

  console.log("Text à poster:");
  console.log(text);

  if (dry) {
    console.log("\n(--dry mode)");
    return;
  }

  const env = loadEnv();
  try {
    const url = await postTweet(env, text);
    console.log(`\n✓ Posté : ${url}`);
  } catch (e) {
    throw new Error(`X post échoué : ${(e as Error).message}`);
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
