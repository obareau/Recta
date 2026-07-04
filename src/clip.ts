// Générateur de clip vidéo vertical (1080×1920, ~24 s) — teaser à partir
// des COMMUNIQUÉS de la Rectitude. Réutilise drawPoster / drawTactique /
// drawPiratePoster (format "story") + une nappe audio « diffusion » seedée.
//
// Scénario : carte-titre (3 s) → communiqué révélé (8 s) → tactique (4 s) →
// intrusion pirate glitchée (5 s) → outro robotariis.com (3 s).
//
// Piloté par le main Electron : canvas capturé (captureStream) + audio
// (BroadcastBed) → MediaRecorder → webm base64 exposé sur window.__clip.

import { communiqueFor } from "./logic";
import { resolveTactique } from "./tactiques-gen";
import { pirateFor } from "./pirate-content";
import { drawPoster, drawPiratePoster, drawTactique, FORMATS } from "./poster";
import { BroadcastBed } from "./clip-audio";
import { rngFor } from "./rng";

declare global {
  interface Window { __clip?: { done: boolean; data?: string; error?: string }; }
}
window.__clip = { done: false };

const D = { intro: 3000, com: 8000, tac: 4000, pir: 5000, outro: 3000 };
const TOTAL = D.intro + D.com + D.tac + D.pir + D.outro;
const GREEN = "#6bd06b";

const seed = new URLSearchParams(location.search).get("seed") || `clip:${Date.now()}`;
const canvas = document.getElementById("stage") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const W = canvas.width, H = canvas.height;
const prng = rngFor(seed, "clip");
const today = new Date();

// Scènes pré-rendues sur un canvas offscreen "story" (1080×1920).
const off = document.createElement("canvas");
off.width = FORMATS.story.w; off.height = FORMATS.story.h;
const octx = off.getContext("2d")!;

function renderCommunique(): void { drawPoster(octx, communiqueFor(seed, today, 0), "story"); }
function renderTactique(): void { drawTactique(octx, resolveTactique(`${seed}:tac`), "story"); }
function renderPirate(): void { drawPiratePoster(octx, pirateFor(`${seed}:pir`), "story"); }

function setStatus(s: string): void {
  const el = document.getElementById("status");
  if (el) el.textContent = s;
}

// ── Effets ───────────────────────────────────────────────────────────
function scanlines(): void {
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
}

/** Affiche l'offscreen entier, cadré (l'affiche story fait déjà 1080×1920). */
function blit(): void { ctx.drawImage(off, 0, 0, W, H); }

function drawTitle(p: number): void {
  ctx.fillStyle = "#04120a"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.globalAlpha = Math.min(1, p * 3);
  ctx.strokeStyle = GREEN; ctx.lineWidth = 4;
  ctx.strokeRect(120, H / 2 - 260, W - 240, 320);
  ctx.fillStyle = GREEN;
  ctx.font = "bold 110px monospace";
  ctx.fillText("C.G.U.", W / 2, H / 2 - 120);
  ctx.font = "38px monospace";
  ctx.fillStyle = "#bfe";
  ctx.fillText("COMMUNIQUÉ DE LA RECTITUDE", W / 2, H / 2 - 30);
  ctx.font = "30px monospace";
  ctx.fillStyle = "rgba(191,238,221,0.6)";
  ctx.fillText("diffusion du jour", W / 2, H / 2 + 200);
  ctx.globalAlpha = 1;
  scanlines();
}

/** Révélation verticale du communiqué (le voile se retire de haut en bas). */
function drawReveal(p: number): void {
  blit();
  const veil = H * (1 - Math.min(1, p * 1.15));
  ctx.fillStyle = "#04120a";
  ctx.fillRect(0, H - veil, W, veil);
  // Ligne de balayage lumineuse en tête du voile.
  ctx.fillStyle = "rgba(107,208,107,0.5)";
  ctx.fillRect(0, H - veil - 3, W, 6);
  scanlines();
}

function drawStill(): void { blit(); scanlines(); }

function drawGlitch(p: number): void {
  blit();
  const n = 8 + Math.floor(prng() * 8);
  for (let i = 0; i < n; i++) {
    const y = prng() * H, h = 6 + prng() * 70;
    try {
      const slice = ctx.getImageData(0, y, W, h);
      ctx.putImageData(slice, (prng() - 0.5) * 140, y);
    } catch { /* hors cadre : ignore */ }
  }
  ctx.fillStyle = `rgba(240,160,32,${0.06 + 0.05 * Math.sin(p * 40)})`;
  ctx.fillRect(0, 0, W, H);
  scanlines();
}

function drawOutro(p: number): void {
  ctx.fillStyle = "#04120a"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.globalAlpha = Math.min(1, p * 4);
  ctx.fillStyle = GREEN;
  ctx.font = "bold 80px monospace";
  ctx.fillText("robotariis.com", W / 2, H / 2 - 10);
  ctx.font = "36px monospace";
  ctx.fillStyle = "rgba(191,238,221,0.7)";
  ctx.fillText("l'univers ROBOTARIIS", W / 2, H / 2 + 80);
  ctx.globalAlpha = 1;
  scanlines();
}

// ── Timeline ─────────────────────────────────────────────────────────
const bed = new BroadcastBed(seed);
let pirateArmed = false;
let sceneReady = { com: false, tac: false, pir: false };

let t0 = 0;
function frame(now: number): void {
  if (!t0) t0 = now;
  const e = now - t0;
  const tCom = D.intro, tTac = tCom + D.com, tPir = tTac + D.tac, tOut = tPir + D.pir;

  if (e < tCom) {
    drawTitle(e / D.intro);
  } else if (e < tTac) {
    if (!sceneReady.com) { renderCommunique(); sceneReady.com = true; }
    drawReveal((e - tCom) / D.com);
  } else if (e < tPir) {
    if (!sceneReady.tac) { renderTactique(); sceneReady.tac = true; }
    drawStill();
  } else if (e < tOut) {
    if (!sceneReady.pir) { renderPirate(); sceneReady.pir = true; }
    if (!pirateArmed) { bed.setPirate(true); pirateArmed = true; }
    drawGlitch((e - tPir) / D.pir);
  } else {
    drawOutro((e - tOut) / D.outro);
  }
  if (e < TOTAL) requestAnimationFrame(frame);
}

// ── Capture ──────────────────────────────────────────────────────────
async function record(): Promise<void> {
  try {
    bed.start();
    const audio = bed.captureStream();
    const vstream = canvas.captureStream(30);
    const stream = new MediaStream([
      ...vstream.getVideoTracks(),
      ...audio.getAudioTracks(),
    ]);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus" : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
    rec.onstop = async () => {
      bed.stop();
      const blob = new Blob(chunks, { type: "video/webm" });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      window.__clip = { done: true, data: btoa(bin) };
      setStatus("clip prêt");
    };
    rec.start();
    requestAnimationFrame(frame);
    setStatus("enregistrement…");
    setTimeout(() => rec.stop(), TOTAL + 250);
  } catch (e) {
    window.__clip = { done: true, error: (e as Error).message };
    setStatus(`erreur : ${(e as Error).message}`);
  }
}

void record();
