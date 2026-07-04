// La Console — Publication vidéo télématique Recta (années 80 style)
// Bluesky + Mastodon
//
//   npm run console                 # poste la console du jour
//   npm run console -- --dry        # génère sans poster

import * as fs from "node:fs";
import * as path from "node:path";
import { narrativeBeat, langForDay } from "./narrative";
import { loadEnv } from "./social/env";
import { generateVideoMP4 } from "./console-gen";
import * as bluesky from "./social/bluesky";
import type { Lang } from "./i18n";
import { GGR_MENTION } from "./i18n";
import { rngFor } from "./rng";

const VIDEO_CAPTIONS: Record<Lang, string> = {
  fr: "Signal télématique détecté — Rectitude en direct",
  en: "Telematic signal detected — Rectitude live",
  es: "Señal telemática detectada — Rectitud en directo",
  it: "Segnale telematico rilevato — Rettitudine dal vivo",
  ja: "テレマティック信号検出 — 直伝された真実",
};

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const today = new Date();
  const lang = (argOf("lang") as Lang) || langForDay(today);
  const beat = narrativeBeat(today, { lang });

  // ~35% chance de piratage Renégat
  const seed = `video:${today.toISOString().slice(0, 10)}`;
  const rng = rngFor(seed, "pirate");
  const pirate = rng() < 0.35;

  // Contenu : communiqué du jour (corps simplifié)
  const videoText = `[${today.toISOString().slice(0, 10).toUpperCase()}]\n\n${beat.communique.corps}\n\n—\n${beat.communique.devise}${pirate ? "\n\n[◻ SIGNAL CORROMPU ◻]" : ""}`;

  console.log(`Vidéo télématique (${lang}) — ${pirate ? "PIRATÉE" : "nominale"}`);

  // Générer la vidéo MP4
  const videoPath = await generateVideoMP4({
    text: videoText,
    pirate,
    outDir: path.resolve("export"),
  });

  console.log(`Vidéo générée : ${videoPath}`);

  if (dry) {
    console.log(`[DRY MODE] Vidéo prête à poster sur Bluesky`);
    return;
  }

  // Publier sur Bluesky (Mastodon refuse vidéos télématiques)
  const caption = `${VIDEO_CAPTIONS[lang]}\n\n${GGR_MENTION[lang]}`;
  const mp4 = fs.readFileSync(videoPath);

  try {
    const uri = await bluesky.postVideo(env, mp4, caption);
    console.log(`✓ bluesky : ${uri}`);
  } catch (e) {
    console.error(`✗ bluesky : ${(e as Error).message}`);
    throw e;
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
