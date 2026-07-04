// Publication d'une MICRO-NOUVELLE (ticket thermique du Distributeur d'Histoires
// Courtes). Sortie quotidienne ; la langue tourne FR→EN→ES→IT→JA avec le jour
// du récit, pour nourrir le public multilingue avec le feuilleton.
//
//   npm run micropub               # poste la micro-nouvelle du jour
//   npm run micropub -- --lang=ja  # force la langue
//   npm run micropub -- --dry
//
// Secrets dans ~/.config/recta/env. Voir src/social/env.ts.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { microNouvelleFor } from "./micronouvelle";
import { GGR_MENTION, type Lang } from "./i18n";
import { langForDay } from "./narrative";
import { loadEnv } from "./social/env";
import { broadcast, networksFromArgs, type Captions } from "./social/broadcast";

const INTRO: Record<Lang, string> = {
  fr: "Une micro-nouvelle du Distributeur d'Histoires Courtes — univers ROBOTARIIS.",
  en: "A micro-story from the Short Story Dispenser — the ROBOTARIIS universe.",
  es: "Un microrrelato del Dispensador de Relatos Breves — universo ROBOTARIIS.",
  it: "Un microracconto dal Distributore di Racconti Brevi — universo ROBOTARIIS.",
  ja: "ショートショート配給機より、ひとつの物語 — ROBOTARIIS の宇宙。",
};

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main(): Promise<void> {
  const env = loadEnv();
  const dry = process.argv.includes("--dry");
  const networks = networksFromArgs(process.argv);
  const today = new Date();
  const lang = (argOf("lang") as Lang) || langForDay(today);
  const seed = argOf("seed") || `micro:${today.toISOString().slice(0, 10)}`;
  const mn = microNouvelleFor(seed, lang);

  // 1. Rendre le ticket thermique.
  const png = path.resolve("export", `micro-${today.toISOString().slice(0, 10)}-${lang}.png`);
  execFileSync("npx", ["electron", ".", "--no-sandbox", "--micro", `--microout=${png}`, `--lang=${lang}`, `--seed=${seed}`], { stdio: "inherit" });
  if (!fs.existsSync(png)) throw new Error(`Ticket introuvable : ${png}`);

  // 2. Légende dans la langue du tirage (même texte sur tous les réseaux).
  const caption =
    `${mn.title}\n\n${INTRO[lang]} ${mn.reading}\n\n${mn.body}\n\n${GGR_MENTION[lang]}\n▸ robotariis.com`;
  const caps: Captions = { fr: caption, en: caption, alt: mn.body };

  console.log(`Micro-nouvelle (${lang}) : « ${mn.title} » — ${mn.ticket}.`);
  const results = await broadcast(env, fs.readFileSync(png), caps, networks, { dry });
  if (results.filter((r) => !r.ok).length === results.length) {
    throw new Error("Aucun réseau n'a accepté la micro-nouvelle.");
  }
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
