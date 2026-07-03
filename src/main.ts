// Recta — Electron : fenêtre de prévisualisation, et mode batch qui
// exporte automatiquement N affiches PNG dans un dossier.
//
//   electron . --n=5 --outdir=/chemin/vers/dossier [--format=story]

import { app, BrowserWindow } from "electron";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";
import { communiqueFor, vaultNote } from "./logic";

const argOf = (name: string): string | undefined =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

function runBatch(count: number): void {
  const outDir = path.resolve(argOf("outdir") ?? "export");
  const format = argOf("format") === "story" ? "story" : "carre";
  // Archivage lore : chaque communiqué écrit aussi sa note vault
  // (frontmatter maison, relations Atlas). --vault=off pour désactiver.
  const vaultArg = argOf("vault") ?? path.join(os.homedir(), "robotariis-writing", "com-recta");
  const vaultDir = vaultArg === "off" ? null : path.resolve(vaultArg);
  fs.mkdirSync(outDir, { recursive: true });
  if (vaultDir) fs.mkdirSync(vaultDir, { recursive: true });
  const win = new BrowserWindow({ show: false, width: 1200, height: 1200 });
  void win.loadFile(path.join(__dirname, "index.html"));
  win.webContents.once("did-finish-load", () => {
    setTimeout(async () => {
      const today = new Date();
      const stamp = today.toISOString().slice(0, 10);
      const written: string[] = [];
      for (let i = 0; i < count; i++) {
        const dataUrl: string = await win.webContents.executeJavaScript(
          `window.batchRender(${i}, ${JSON.stringify(format)})`,
        );
        const file = path.join(outDir, `communique-recta-${stamp}-${String(i + 1).padStart(2, "0")}.png`);
        fs.writeFileSync(file, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
        written.push(file);
        if (vaultDir) {
          // Même seed que la page : la note vault reproduit le communiqué à l'identique.
          const c = communiqueFor(`recta:${today.toDateString()}`, today, i);
          const note = vaultNote(c, today);
          const notePath = path.join(vaultDir, note.filename);
          fs.writeFileSync(notePath, note.content, "utf-8");
          written.push(notePath);
        }
      }
      for (const f of written) console.log(f);
      console.log(`${count} communiqué(s) exporté(s) — PNG dans ${outDir}${vaultDir ? `, notes lore dans ${vaultDir}` : ""}`);
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

app.whenReady().then(() => {
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
