// Pont CLI pour la galerie Iris — génère un aperçu ou publie un avis R3N3G4T
// pour UNE photo précise choisie dans l'UI (au lieu du tirage aléatoire dans
// _classees fait par renegat-publish.ts). Toujours en JSON sur stdout, pensé
// pour être appelé en sous-processus depuis backend/main.py (Iris).
//
//   tsx src/renegat-cli.ts --image=<chemin> --dry                  # aperçu
//   tsx src/renegat-cli.ts --image=<chemin> --numero=421 --lang=fr # publie
//
// Le --numero de l'aperçu doit être renvoyé tel quel à l'appel de publication
// pour que la légende générée soit identique à ce que l'utilisateur a validé.

import * as fs from "fs";
import { loadEnv } from "./social/env";
import { generateRenegatCaption, loadRenegatImage } from "./renegats";
import { hasBeenPosted, addToCache } from "./renegat-cache";
import { postRenegat } from "./renegat-broadcast";
import { langForDay } from "./narrative";
import type { Lang } from "./i18n";

function argOf(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

/** Sidecar écrit par Iris (backend/organizer.py) à côté de la photo classée —
 * on y ajoute un champ renegat_posted pour que la galerie affiche un marqueur
 * "déjà publié" et évite les doublons accidentels. */
function markPosted(imagePath: string, info: Record<string, unknown>): void {
  const sidecarPath = imagePath.replace(/\.[^.]+$/, ".json");
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
  } catch {
    // Pas de sidecar (photo pas passée par le pipeline Iris) — on en crée un minimal.
  }
  existing.renegat_posted = info;
  fs.writeFileSync(sidecarPath, JSON.stringify(existing, null, 2));
}

async function main(): Promise<void> {
  const imagePath = argOf("image");
  if (!imagePath) throw new Error("--image=<chemin> requis");
  if (!fs.existsSync(imagePath)) throw new Error(`Photo introuvable : ${imagePath}`);

  const dry = process.argv.includes("--dry");
  const lang = (argOf("lang") as Lang) || langForDay(new Date());
  const numeroArg = argOf("numero");
  const seed = `renegat:iris:${imagePath}`;
  const numero = numeroArg ? parseInt(numeroArg, 10) : 100 + Math.floor(Math.random() * 900);

  const { caption } = generateRenegatCaption(seed, numero, lang, imagePath);

  if (dry) {
    console.log(JSON.stringify({ numero, lang, caption, imagePath }));
    return;
  }

  if (hasBeenPosted(numero)) {
    console.log(JSON.stringify({ error: `Avis # ${numero} déjà posté (numéro en collision).` }));
    process.exitCode = 1;
    return;
  }

  const png = loadRenegatImage(imagePath);
  const alt = `R3N3G4T wanted notice #${numero}`;
  const results = await postRenegat(loadEnv(), png, caption, alt);
  const posted = results.some((r) => r.ok);

  if (posted) {
    const timestamp = new Date().toISOString();
    addToCache({ numero, seed, timestamp, uri: results.find((r) => r.ok)?.id || "?" });
    markPosted(imagePath, { numero, lang, timestamp, results });
  }

  console.log(JSON.stringify({ numero, lang, caption, imagePath, posted, results }));
  if (!posted) process.exitCode = 1;
}

main().catch((e) => {
  console.log(JSON.stringify({ error: (e as Error).message }));
  process.exit(1);
});
