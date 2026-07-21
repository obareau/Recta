// Diffusion du clip vidéo Recta (title→reveal→tactique→glitch pirate→outro,
// ~23s, dist/clip.js) — Bluesky uniquement (Mastodon refuse ce format, cf.
// console-publish.ts). Le rendu (Electron + Canvas + MediaRecorder) reste
// géré par main.ts:runClip() — ce script se contente de le lancer en
// sous-processus, de récupérer le .mp4 produit, puis de le publier.
//
//   npm run clippub                 # génère + poste le clip du jour
//   npm run clippub -- --dry        # génère sans poster

import * as fs from "node:fs";
import { execFileSync } from "node:child_process";
import { loadEnv } from "./social/env";
import * as bluesky from "./social/bluesky";
import { GGR_MENTION } from "./i18n";
import type { Lang } from "./i18n";
import { langForDay } from "./narrative";

const CLIP_CAPTIONS: Record<Lang, string> = {
  fr: "Signal capté — transmission Robōtariis",
  en: "Signal caught — Robōtariis transmission",
  es: "Señal captada — transmisión Robōtariis",
  it: "Segnale captato — trasmissione Robōtariis",
  de: "Signal empfangen — Robōtariis-Übertragung",
  ja: "信号を捕捉 — ロボタリス伝送",
};

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const seed = `clip:${new Date().toISOString().slice(0, 10)}`;
  const lang = langForDay(new Date());

  console.log(`Génération du clip (seed=${seed})…`);
  const out = execFileSync(
    "npx",
    ["electron", ".", "--no-sandbox", `--clip=${seed}`],
    { encoding: "utf-8" },
  );

  const mp4Path = out.trim().split("\n").reverse().find((l) => l.endsWith(".mp4"));
  if (!mp4Path) {
    throw new Error(`Aucun .mp4 trouvé dans la sortie de runClip :\n${out}`);
  }
  console.log(`Clip généré : ${mp4Path}`);

  if (dry) {
    console.log(`[DRY MODE] Clip prêt à poster sur Bluesky`);
    return;
  }

  const env = loadEnv();
  const caption = `${CLIP_CAPTIONS[lang]}\n\n${GGR_MENTION[lang]}`;
  const mp4 = fs.readFileSync(mp4Path);

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
