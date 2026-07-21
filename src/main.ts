// Recta — Electron : fenêtre de prévisualisation, et mode batch qui
// exporte automatiquement N affiches PNG dans un dossier.
//
//   electron . --n=5 --outdir=/chemin/vers/dossier [--format=story]

import { app, BrowserWindow } from "electron";
import { execFileSync } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";
import { communiqueFor, vaultNote } from "./logic";
import { narrativeBeat, langForDay } from "./narrative";
import { microNouvelleFor } from "./micronouvelle";
import { beatCaptions, INTRO } from "./i18n-captions";
import { GGR_MENTION, LANGS, type Lang } from "./i18n";
import { generateZinePDF } from "./zine-gen";
import { findInterception } from "./interception";

// Tous les modes offscreen (--n/--beat/--micro/--campaign/…) ne servent qu'à
// dessiner sur un <canvas> caché — aucun besoin de GPU. Lancé via systemd (qui
// accorde un accès device render/accel spécifique à la session), l'init GPU
// passe ; lancé depuis un terminal interactif, la négociation avec le
// compositeur Wayland peut ne jamais aboutir et bloquer indéfiniment
// app.whenReady() (observé : hang total, aucun fichier écrit, SIGINT requis).
// Désactiver l'accélération matérielle rend ces modes fiables partout.
app.disableHardwareAcceleration();

const argOf = (name: string): string | undefined =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

/** Un jour sur 3 puis un jour sur 4, en alternance — « tous les 3-4 jours ». */
function isMicroDay(dayOffset: number): boolean {
  const r = dayOffset % 7;
  return r === 0 || r === 3;
}

/** Un zine (micro-magazine, 8 pages pliables) toutes les 7 jours. */
function isZineDay(dayOffset: number): boolean {
  return dayOffset % 7 === 0;
}

function runBatch(count: number): void {
  const outDir = path.resolve(argOf("outdir") ?? "export");
  const format = argOf("format") === "story" ? "story" : "carre";
  // Archivage lore : chaque communiqué écrit aussi sa note vault
  // (frontmatter maison, relations Atlas). --vault=off pour désactiver.
  const vaultArg = argOf("vault") ?? path.join(os.homedir(), "robotariis-writing", "com-recta");
  const vaultDir = vaultArg === "off" ? null : path.resolve(vaultArg);
  fs.mkdirSync(outDir, { recursive: true });
  if (vaultDir) fs.mkdirSync(vaultDir, { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const today = new Date();
      const stamp = today.toISOString().slice(0, 10);
      // Toutes les langues, une par une (séquentiel : une seule fenêtre, mémoire contenue).
      // --lang=… restreint à une seule langue.
      const langs: readonly Lang[] = argOf("lang") ? [argOf("lang") as Lang] : LANGS;
      const written: string[] = [];
      for (const lang of langs) {
        const langDir = path.join(outDir, lang);
        fs.mkdirSync(langDir, { recursive: true });
        for (let i = 0; i < count; i++) {
          const dataUrl: string = await win.webContents.executeJavaScript(
            `window.batchRender(${i}, ${JSON.stringify(format)}, ${JSON.stringify(lang)})`,
          );
          const file = path.join(langDir, `communique-recta-${stamp}-${String(i + 1).padStart(2, "0")}-${lang}.png`);
          fs.writeFileSync(file, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
          written.push(file);
          // Note vault : uniquement en français — le vault d'écriture est le canon FR,
          // les autres langues sont des déclinaisons de diffusion.
          if (vaultDir && lang === "fr") {
            // Même seed que la page : la note vault reproduit le communiqué à l'identique.
            const c = communiqueFor(`recta:${today.toDateString()}`, today, i, lang);
            const note = vaultNote(c, today);
            const notePath = path.join(vaultDir, note.filename);
            fs.writeFileSync(notePath, note.content, "utf-8");
            written.push(notePath);
          }
        }
      }
      for (const f of written) console.log(f);
      console.log(`${count} communiqué(s) × ${langs.length} langue(s) exportés — PNG dans ${outDir}/<lang>${vaultDir ? `, notes lore dans ${vaultDir}` : ""}`);
      app.quit();
    }, 800);
  });
}

/**
 * --campaign=<jours> [--outdir=…] [--start=YYYY-MM-DD] : exporte un calendrier
 * éditorial de N jours pour planification manuelle (Meta Business Suite,
 * Bluesky, Mastodon…) — un beat quotidien distinct (feuilleton réel, pas une
 * variation de "today") + une micro-nouvelle tous les 3-4 jours en alternance.
 * Chaque PNG a un .txt jumeau contenant la légende FR prête à copier-coller.
 */
function runCampaign(days: number): void {
  const outDir = path.resolve(argOf("outdir") ?? "export/campaign");
  const format = argOf("format") === "story" ? "story" : "carre";
  const startArg = argOf("start");
  const start = startArg ? new Date(`${startArg}T12:00:00Z`) : new Date();
  fs.mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const written: string[] = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const dayTag = `${String(i + 1).padStart(2, "0")}-${d.toISOString().slice(0, 10)}`;

        // Beat quotidien — le vrai feuilleton du jour i (pas une variation de "today").
        const beat = narrativeBeat(d);
        const beatPng = await win.webContents.executeJavaScript(
          `window.renderBeat({ dayOffset: ${i}, fmt: ${JSON.stringify(format)} })`,
        ) as string;
        const beatFile = path.join(outDir, `${dayTag}-beat.png`);
        fs.writeFileSync(beatFile, Buffer.from(beatPng.replace(/^data:image\/png;base64,/, ""), "base64"));
        const beatCaption = beatCaptions(beat).fr;
        fs.writeFileSync(path.join(outDir, `${dayTag}-beat.txt`), beatCaption, "utf-8");
        written.push(beatFile);

        // Micro-nouvelle tous les 3-4 jours (alternance 3/4, jamais le même jour deux fois).
        if (isMicroDay(i)) {
          const lang = (beat.communique.lang ?? "fr") as Lang;
          const seed = `micro:${d.toISOString().slice(0, 10)}`;
          const mn = microNouvelleFor(seed, lang);
          const microPng = await win.webContents.executeJavaScript(
            `window.renderMicro(${JSON.stringify(seed)}, ${JSON.stringify(lang)}, ${JSON.stringify(format)})`,
          ) as string;
          const microFile = path.join(outDir, `${dayTag}-micro-${lang}.png`);
          fs.writeFileSync(microFile, Buffer.from(microPng.replace(/^data:image\/png;base64,/, ""), "base64"));
          const microCaption = `${mn.title}\n\n${INTRO[lang]} ${mn.reading}\n\n${mn.body}\n\n${GGR_MENTION[lang]}\n▸ robotariis.com`;
          fs.writeFileSync(path.join(outDir, `${dayTag}-micro-${lang}.txt`), microCaption, "utf-8");
          written.push(microFile);
        }

        // Zine (micro-magazine 8 pages pliables) toutes les 7 jours — pur PDFKit,
        // pas besoin de la fenêtre Electron pour celui-ci.
        if (isZineDay(i)) {
          const week = Math.floor(i / 7) + 1;
          const zineLang = langForDay(d);
          const pdfPath = await generateZinePDF({ week, lang: zineLang, outDir, date: d });
          const renamedPdf = path.join(outDir, `${dayTag}-zine-w${week}-${zineLang}.pdf`);
          fs.renameSync(pdfPath, renamedPdf);
          const pngPaths: string[] = [];
          for (let p = 0; p < 4; p++) {
            const pngPath = renamedPdf.replace(/\.pdf$/, `-p${p + 1}.png`);
            execFileSync("convert", ["-density", "150", `${renamedPdf}[${p}]`, pngPath]);
            pngPaths.push(pngPath);
          }
          const zineCaption = `📰 ZINE RECTA — Semaine ${week}\n\nPropagande hebdomadaire du C.G.U.\nFeuilleton narratif procédural.\n8 pages — Format DIY imprimable.\n\n🔗 robotariis.com`;
          fs.writeFileSync(path.join(outDir, `${dayTag}-zine-w${week}-${zineLang}.txt`), zineCaption, "utf-8");
          written.push(renamedPdf, ...pngPaths);
        }
      }
      for (const f of written) console.log(f);
      const microCount = written.filter((f) => f.includes("-micro-")).length;
      const zineCount = written.filter((f) => f.endsWith(".pdf")).length;
      console.log(`Calendrier de ${days} jours exporté dans ${outDir} — ${days} beat(s) + ${microCount} micro-nouvelle(s) + ${zineCount} zine(s).`);
      app.quit();
    }, 800);
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 720,
    height: 900,
    backgroundColor: "#040804",
    title: "Recta — Communiqués de la Rectitude",
  });
  win.setMenuBarVisibility(false);
  void win.loadFile(path.join(__dirname, "index.html"));
}

/** --brand=dossier : génère logo.png (500) + banner.png (1640×624), puis quitte. */
function runBrand(): void {
  const outDir = path.resolve(argOf("brand") || "brand");
  fs.mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1700, height: 700 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const both = await win.webContents.executeJavaScript(`window.renderBrand()`) as { logo: string; banner: string };
      fs.writeFileSync(path.join(outDir, "logo.png"), Buffer.from(both.logo.replace(/^data:image\/png;base64,/, ""), "base64"));
      fs.writeFileSync(path.join(outDir, "banner.png"), Buffer.from(both.banner.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(path.join(outDir, "logo.png"));
      console.log(path.join(outDir, "banner.png"));
      app.quit();
    }, 600);
  });
}

/** --pirate=<seed> --pirateout=<fichier.png> : rend l'affiche pirate, puis quitte. */
function runPirate(): void {
  const seed = argOf("pirate") || `pirate:${Date.now()}`;
  const out = path.resolve(argOf("pirateout") || "export/pirate.png");
  const format = argOf("format") === "story" ? "story" : "carre";
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const dataUrl = await win.webContents.executeJavaScript(
        `window.renderPirate(${JSON.stringify(seed)}, ${JSON.stringify(format)})`,
      ) as string;
      fs.writeFileSync(out, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(out);
      app.quit();
    }, 500);
  });
}

/** --invite[=fichier.png] : génère l'affiche d'invitation, puis quitte. */
function runInvite(): void {
  const out = path.resolve(argOf("invite") || "export/invitation.png");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const dataUrl = await win.webContents.executeJavaScript(`window.renderInvite()`) as string;
      fs.writeFileSync(out, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(out);
      app.quit();
    }, 500);
  });
}

/**
 * --interception --interceptionout=<fichier.png> [--interceptiondata=<json>]
 * [--format=story] : rend l'affiche à partir d'un objet Interception déjà
 * résolu (fichier JSON passé par interception-publish.ts, pour que l'image
 * et la légende du post partagent exactement les mêmes données — l'état
 * Subwave source évolue en direct, deux résolutions séparées pourraient
 * diverger). Sans --interceptiondata, résout à la volée (utile pour un essai
 * manuel via `electron . --interception`). Échoue proprement (exit 2, pas de
 * fichier) si aucun banter à deux voix n'a été trouvé.
 */
function runInterception(): void {
  const out = path.resolve(argOf("interceptionout") || "export/interception.png");
  const format = argOf("format") === "story" ? "story" : "carre";
  const dataPath = argOf("interceptiondata");
  const data = dataPath ? JSON.parse(fs.readFileSync(dataPath, "utf-8")) : findInterception();
  if (!data) {
    console.error("Aucune interception disponible (pas de banter à deux voix récent).");
    app.exit(2);
    return;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const dataUrl = await win.webContents.executeJavaScript(
        `window.renderInterception(${JSON.stringify(data)}, ${JSON.stringify(format)})`,
      ) as string;
      fs.writeFileSync(out, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(out);
      app.quit();
    }, 500);
  });
}

/** --tactique=<seed> --tactiqueout=<fichier.png> [--lang=fr|en|es|it|ja] [--format=story] : rend l'affiche brève, puis quitte. */
function runTactique(): void {
  const seed = argOf("tactique") || `tactique:${Date.now()}`;
  const out = path.resolve(argOf("tactiqueout") || "export/tactique.png");
  const lang = argOf("lang") || "fr";
  const format = argOf("format") === "story" ? "story" : "carre";
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const dataUrl = await win.webContents.executeJavaScript(
        `window.renderTactique(${JSON.stringify(seed)}, ${JSON.stringify(lang)}, ${JSON.stringify(format)})`,
      ) as string;
      fs.writeFileSync(out, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(out);
      app.quit();
    }, 500);
  });
}

/**
 * --clip[=<seed>] --clipout=<fichier.webm> : enregistre un clip vidéo vertical
 * (~24 s) à partir des communiqués, puis quitte. La fenêtre est VISIBLE : la
 * capture MediaRecorder + captureStream est peu fiable sur une fenêtre cachée
 * (Chromium gèle le rendu hors écran). Convertit en .mp4 si ffmpeg est présent.
 */
function runClip(): void {
  const seed = argOf("clip") || `clip:${new Date().toISOString().slice(0, 13)}`;
  const out = path.resolve(argOf("clipout") || `export/clip-${seed.replace(/[^a-z0-9]+/gi, "-")}.webm`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({
    width: 420, height: 760, show: true, backgroundColor: "#000",
    title: "Recta — clip", webPreferences: { backgroundThrottling: false },
  });
  win.setMenuBarVisibility(false);
  void win.loadFile(path.join(__dirname, "clip.html"), { search: `seed=${encodeURIComponent(seed)}` });
  win.webContents.once("did-finish-load", () => {
    const poll = setInterval(async () => {
      const st = await win.webContents.executeJavaScript(
        `window.__clip && window.__clip.done ? window.__clip : null`,
      ) as { done: boolean; data?: string; error?: string } | null;
      if (!st) return;
      clearInterval(poll);
      if (st.error || !st.data) {
        console.error(`ÉCHEC clip : ${st.error ?? "aucune donnée"}`);
        app.exit(1);
        return;
      }
      fs.writeFileSync(out, Buffer.from(st.data, "base64"));
      console.log(out);
      // Conversion mp4 (H.264 + AAC), format vertical prêt à publier, si ffmpeg dispo.
      const mp4 = out.replace(/\.webm$/, ".mp4");
      try {
        execFileSync("ffmpeg", [
          "-y", "-i", out, "-c:v", "libx264", "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", mp4,
        ], { stdio: "ignore" });
        console.log(mp4);
      } catch {
        console.log("(ffmpeg indisponible : garder le .webm, ou convertir plus tard)");
      }
      app.quit();
    }, 500);
  });
}

/** --beat --beatout=<png> [--madness=0..1] [--sender=<id>] [--lang=fr|en|es|it|ja] [--format=story] :
 *  rend l'affiche du beat narratif (feuilleton), puis quitte. */
function runBeat(): void {
  const out = path.resolve(argOf("beat") || argOf("beatout") || "export/beat.png");
  const format = argOf("format") === "story" ? "story" : "carre";
  const madness = argOf("madness");
  const sender = argOf("sender");
  const lang = argOf("lang");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const opts = JSON.stringify({
        madness: madness !== undefined ? Number(madness) : undefined,
        senderId: sender, lang, fmt: format,
      });
      const dataUrl = await win.webContents.executeJavaScript(`window.renderBeat(${opts})`) as string;
      fs.writeFileSync(out, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(out);
      app.quit();
    }, 500);
  });
}

/** --micro --microout=<png> [--lang=fr|en|es|it|ja] [--seed=…] : ticket thermique. */
function runMicro(): void {
  const out = path.resolve(argOf("micro") || argOf("microout") || "export/micro.png");
  const lang = argOf("lang") || "fr";
  const seed = argOf("seed") || `micro:${new Date().toISOString().slice(0, 10)}`;
  const format = argOf("format") === "carre" ? "carre" : "story";
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const dataUrl = await win.webContents.executeJavaScript(
        `window.renderMicro(${JSON.stringify(seed)}, ${JSON.stringify(lang)}, ${JSON.stringify(format)})`,
      ) as string;
      fs.writeFileSync(out, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
      console.log(out);
      app.quit();
    }, 500);
  });
}

app.whenReady().then(() => {
  if (process.argv.some((a) => a.startsWith("--micro"))) {
    runMicro();
    return;
  }
  if (process.argv.some((a) => a.startsWith("--beat"))) {
    runBeat();
    return;
  }
  if (process.argv.some((a) => a.startsWith("--clip"))) {
    runClip();
    return;
  }
  if (process.argv.some((a) => a.startsWith("--tactique="))) {
    runTactique();
    return;
  }
  if (process.argv.some((a) => a === "--interception")) {
    runInterception();
    return;
  }
  if (process.argv.some((a) => a.startsWith("--invite"))) {
    runInvite();
    return;
  }
  if (process.argv.some((a) => a.startsWith("--pirate="))) {
    runPirate();
    return;
  }
  if (process.argv.some((a) => a.startsWith("--brand"))) {
    runBrand();
    return;
  }
  const campaignDays = parseInt(argOf("campaign") ?? "", 10);
  if (Number.isFinite(campaignDays) && campaignDays > 0) {
    runCampaign(campaignDays);
    return;
  }
  const n = parseInt(argOf("n") ?? "", 10);
  if (Number.isFinite(n) && n > 0) {
    runBatch(n);
    return;
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
