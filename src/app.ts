// Recta — aperçu, régénération, export PNG.
// En mode batch (Electron), window.batchRender(i) rend et renvoie un dataURL.

import { communiqueFor } from "./logic";
import { drawPoster, FORMATS, type PosterFormat } from "./poster";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>("poster");
const ctx = canvas.getContext("2d")!;
let salt = Math.floor(Math.random() * 100000); // page sociale : chaque visiteur voit le sien
let format: PosterFormat = "carre";

function render(currentSalt: number, fmt: PosterFormat): void {
  const { w, h } = FORMATS[fmt];
  canvas.width = w;
  canvas.height = h;
  const today = new Date();
  const c = communiqueFor(`recta:${today.toDateString()}`, today, currentSalt);
  drawPoster(ctx, c, fmt);
}

$("btnNew").addEventListener("click", () => {
  salt++;
  render(salt, format);
});

$<HTMLSelectElement>("format").addEventListener("change", (e) => {
  format = (e.target as HTMLSelectElement).value as PosterFormat;
  render(salt, format);
});

$("btnSave").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = `communique-recta-${Date.now()}.png`;
  a.click();
});

// ── Mode batch (piloté par le main Electron) ─────────────────────────
declare global {
  interface Window {
    batchRender: (i: number, fmt?: PosterFormat) => string;
  }
}
window.batchRender = (i, fmt = "carre") => {
  render(i, fmt);
  return canvas.toDataURL("image/png");
};

render(salt, format);
