// Pré-génération des affiches à venir — à lancer aux heures creuses.
//   npm run pregen               # rend les 7 prochains jours manquants
//   npm run pregen -- --days=14
//   npm run pregen -- --force    # re-rend même si le PNG existe
//
// Pourquoi : le rendu Electron (un Chromium complet par affiche) est le seul
// poste coûteux du pipeline, et son coût monte avec la folie — la densité
// fractale croît sur les 100 jours de campagne. Lancé à l'heure de publication,
// il s'est fait tuer par l'OOM killer le 14 juil. (recta-tactique, recta-micro),
// pendant que les HybR1D/R3N3G4T — qui publient des images déjà faites — ne
// bronchaient pas. La leçon était dans le code.
//
// Les seeds sont déterministes (seed = date), donc l'affiche rendue aujourd'hui
// pour le 20 est *exactement* celle qui serait sortie le 20 à la volée. Seule
// la publication porte une date, narrativement — le moment du rendu n'existe pas.
//
// Une seule affiche à la fois, jamais en parallèle : le but est d'étaler, pas
// de déplacer le pic.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { LANGS } from "./i18n";
import { pick, rngFor } from "./rng";

// Electron doit être appelé par son chemin réel : sur robdev (headless, Garuda),
// `npx electron` ne résout pas le binaire et il n'y a pas de serveur X — d'où
// xvfb-run. Sur une machine avec affichage, xvfb-run est absent et inutile.
const ELECTRON = path.resolve("node_modules/electron/dist/electron");
const HAS_XVFB = (() => {
  try {
    execFileSync("sh", ["-c", "command -v xvfb-run"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

function render(args: string[]): void {
  const cmd = HAS_XVFB ? "xvfb-run" : ELECTRON;
  const argv = HAS_XVFB ? ["-a", ELECTRON, ...args] : args;
  execFileSync(cmd, argv, { stdio: ["ignore", "ignore", "inherit"] });
}

function argNum(flag: string, def: number): number {
  const a = process.argv.find((x) => x.startsWith(`--${flag}=`));
  const n = a ? parseInt(a.slice(flag.length + 3), 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : def;
}

// ⚠️ Doit reproduire EXACTEMENT la seed de scripts/broadcast.sh :
//     --seed=tactique:$(date +%Y-%m-%dT%H)
// L'heure en fait partie (le timer tombe à 13:00, RandomizedDelaySec ne dépasse
// pas l'heure). Une seed qui diffère d'un caractère produit un autre nom de
// fichier, donc un cache qui ne sert jamais et un rendu Electron quand même.
const PUBLISH_HOUR = "13";

function seedFor(d: Date): string {
  return `tactique:${d.toISOString().slice(0, 10)}T${PUBLISH_HOUR}`;
}

function pngFor(seed: string): string {
  return path.resolve("export", `tactique-${seed.replace(/[^a-z0-9]+/gi, "-")}.png`);
}

// ⚠️ Doit reproduire EXACTEMENT ce que fait src/micro-publish.ts, sinon le
// pré-rendu produit un fichier que la publication ne cherchera jamais : même
// seed (`micro:<date>`), même tirage de langue (rngFor(seed,"micro-lang")),
// même nom (`micro-<date>-<lang>.png`).
function microSeedFor(d: Date): string {
  return `micro:${d.toISOString().slice(0, 10)}`;
}

function microPngFor(d: Date): string {
  const seed = microSeedFor(d);
  const lang = pick(rngFor(seed, "micro-lang"), LANGS);
  return path.resolve("export", `micro-${d.toISOString().slice(0, 10)}-${lang}.png`);
}

async function main(): Promise<void> {
  const days = argNum("days", 7);
  const force = process.argv.includes("--force");
  fs.mkdirSync(path.resolve("export"), { recursive: true });

  const only = process.argv.find((x) => x.startsWith("--only="))?.slice(7);
  const doTactique = !only || only === "tactique";
  const doMicro = !only || only === "micro";

  let rendered = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + i);
    const day = d.toISOString().slice(0, 10);

    const jobs: { kind: string; png: string; args: string[] }[] = [];
    if (doTactique) {
      const seed = seedFor(d);
      jobs.push({ kind: "tactique", png: pngFor(seed), args: [".", "--no-sandbox", `--tactique=${seed}`, `--tactiqueout=${pngFor(seed)}`] });
    }
    if (doMicro) {
      const seed = microSeedFor(d);
      const png = microPngFor(d);
      const lang = path.basename(png).replace(/\.png$/, "").split("-").pop()!;
      jobs.push({ kind: "micro", png, args: [".", "--no-sandbox", "--micro", `--microout=${png}`, `--lang=${lang}`, `--seed=${seed}`] });
    }

    for (const j of jobs) {
      if (fs.existsSync(j.png) && !force) {
        skipped++;
        continue;
      }
      process.stdout.write(`[pregen] ${day} ${j.kind} … `);
      const t0 = Date.now();
      try {
        render(j.args);
        if (!fs.existsSync(j.png)) throw new Error("PNG absent après rendu");
        console.log(`ok (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
        rendered++;
      } catch (e) {
        // Un jour qui échoue ne doit pas emporter les suivants : la publication
        // retombera sur le rendu à la volée pour celui-là.
        console.log(`ÉCHEC — ${(e as Error).message}`);
        failed++;
      }
    }
  }

  console.log(`[pregen] ${rendered} rendue(s), ${skipped} en cache, ${failed} échec(s), sur ${days} jour(s).`);
}

main().catch((e) => {
  console.error(`ÉCHEC : ${(e as Error).message}`);
  process.exit(1);
});
