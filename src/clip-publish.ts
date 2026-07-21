// Diffusion du clip vidéo Recta (title→reveal→tactique→glitch pirate→outro,
// ~23s, dist/clip.js) — Facebook + Bluesky + Mastodon. Le rendu (Electron +
// Canvas + MediaRecorder) reste géré par main.ts:runClip() — ce script se
// contente de le lancer en sous-processus, de récupérer le .mp4 produit,
// puis de le publier via broadcastVideo (même orchestrateur que les affiches,
// routé vers postVideo de chaque client).
//
//   npm run clippub                 # génère + poste le clip du jour
//   npm run clippub -- --dry        # génère sans poster

import * as fs from "node:fs";
import { execFileSync } from "node:child_process";
import { loadEnv } from "./social/env";
import { broadcastVideo, networksFromArgs, type Captions } from "./social/broadcast";
import { GGR_MENTION } from "./i18n";
import type { Lang } from "./i18n";
import { langForDay } from "./narrative";

const CLIP_CAPTIONS: Record<Lang, { title: string; body: string }> = {
  fr: { title: "Signal capté", body: "Transmission Robōtariis — extrait narratif." },
  en: { title: "Signal caught", body: "Robōtariis transmission — narrative excerpt." },
  es: { title: "Señal captada", body: "Transmisión Robōtariis — extracto narrativo." },
  it: { title: "Segnale captato", body: "Trasmissione Robōtariis — estratto narrativo." },
  de: { title: "Signal empfangen", body: "Robōtariis-Übertragung — narrativer Ausschnitt." },
  ja: { title: "信号を捕捉", body: "ロボタリス伝送 — 物語の抜粋。" },
};

function captions(lang: Lang): Captions {
  const c = CLIP_CAPTIONS[lang];
  const fr = `${CLIP_CAPTIONS.fr.title} — ${CLIP_CAPTIONS.fr.body}\n\n${GGR_MENTION.fr}`;
  const en = `${CLIP_CAPTIONS.en.title} — ${CLIP_CAPTIONS.en.body}\n\n${GGR_MENTION.en}`;
  const alt = `${c.title} — ${c.body}`;
  return { fr, en, alt };
}

async function main(): Promise<void> {
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);
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

  const env = loadEnv();
  const caps = captions(lang);
  const mp4 = fs.readFileSync(mp4Path);

  const results = await broadcastVideo(env, mp4, caps, networks, { dry });
  if (!dry && results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté le clip.");
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
