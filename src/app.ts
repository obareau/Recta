// Recta — aperçu, régénération, export PNG.
// En mode batch (Electron), window.batchRender(i) rend et renvoie un dataURL.

import { communiqueFor } from "./logic";
import { drawPiratePoster, drawPoster, FORMATS, type PosterFormat } from "./poster";
import { drawBanner, drawInvite, drawLogo } from "./brand";
import { pirateFor } from "./pirate-content";

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

// Export par lot : 10 communiqués téléchargés d'affilée (le navigateur
// demandera une fois l'autorisation des téléchargements multiples).
$("btnBatch").addEventListener("click", async () => {
  const info = $("batchInfo");
  const stamp = new Date().toISOString().slice(0, 10);
  const startSalt = salt + 1;
  for (let i = 0; i < 10; i++) {
    salt = startSalt + i;
    render(salt, format);
    info.textContent = `Diffusion ${i + 1}/10…`;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `communique-recta-${stamp}-${String(i + 1).padStart(2, "0")}.png`;
    a.click();
    await new Promise((r) => setTimeout(r, 350)); // laisse respirer le navigateur
  }
  info.textContent = "10 communiqués diffusés. La Rectitude vous remercie.";
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

// Identité visuelle (logo + bannière) — appelé par le main en mode --brand.
declare global {
  interface Window { renderBrand: () => { logo: string; banner: string } }
}
window.renderBrand = () => {
  const off = document.createElement("canvas");
  const octx = off.getContext("2d")!;
  off.width = 500; off.height = 500;
  drawLogo(octx, 500);
  const logo = off.toDataURL("image/png");
  off.width = 1640; off.height = 624;
  drawBanner(octx, 1640, 624);
  const banner = off.toDataURL("image/png");
  return { logo, banner };
};

// Affiche pirate détournée (Nova 7 / Renégats) — appelé par --pirate.
declare global {
  interface Window { renderPirate: (seed: string, fmt?: PosterFormat) => string }
}
window.renderPirate = (seed, fmt = "carre") => {
  const { w, h } = FORMATS[fmt];
  canvas.width = w; canvas.height = h;
  drawPiratePoster(ctx, pirateFor(seed), fmt);
  return canvas.toDataURL("image/png");
};

// Affiche d'invitation — appelé par --invite.
declare global {
  interface Window { renderInvite: () => string }
}
window.renderInvite = () => {
  canvas.width = 1080; canvas.height = 1080;
  drawInvite(ctx, 1080);
  return canvas.toDataURL("image/png");
};

render(salt, format);
