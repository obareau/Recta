// Générateur de vidéo télématique années 80 — communiqués Recta.
// Terminal simulé monoespace vert/noir + typewriter + scanlines CRT.
//
// Usage interne : appelé par video-publish.ts

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PNG = require("pngjs").PNG;

const COLS = 80;
const ROWS = 24;
const CHAR_W = 8; // pixel width per char
const CHAR_H = 16; // pixel height per char
const VIDEO_W = COLS * CHAR_W; // 640
const VIDEO_H = ROWS * CHAR_H; // 384

// Couleurs RGB
const GREEN = { r: 0, g: 255, b: 0, a: 255 };
const BLACK = { r: 0, g: 0, b: 0, a: 255 };

interface VideoGenOptions {
  text: string;
  pirate?: boolean;
  outDir?: string;
}

/** Corrompt le texte façon Renégat. */
function corruptText(text: string, intensity: number = 0.15): string {
  const glyphChars = "█▓▒░◻◼⬛◆●○◎";
  let result = text;
  for (let i = 0; i < text.length; i++) {
    if (Math.random() < intensity) {
      const glyph = glyphChars[Math.floor(Math.random() * glyphChars.length)];
      result = result.slice(0, i) + glyph + result.slice(i + 1);
    }
  }
  return result;
}

/** Formate le texte en lignes terminal. */
function formatTerminal(text: string, cols: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    for (let i = 0; i < para.length; i += cols) {
      lines.push(para.slice(i, i + cols).padEnd(cols));
    }
  }
  return lines;
}

/** Génère une frame PNG du terminal. */
function generateFrame(lines: string[], charsVisible: number, pirate: boolean): Buffer {
  const png = new PNG({ width: VIDEO_W, height: VIDEO_H });

  // Remplir de noir
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = BLACK.r;
    png.data[i + 1] = BLACK.g;
    png.data[i + 2] = BLACK.b;
    png.data[i + 3] = BLACK.a;
  }

  // Dessiner du texte simplifié (carrés verts pour les caractères)
  let visibleChars = 0;
  for (let row = 0; row < lines.length && row < ROWS; row++) {
    let line = lines[row];
    if (pirate && Math.random() < 0.2) line = corruptText(line, 0.25);

    for (let col = 0; col < line.length && visibleChars < charsVisible; col++) {
      if (line[col] !== " ") {
        // Dessiner un petit carré vert pour chaque caractère non-espace
        const x = col * CHAR_W + 2;
        const y = row * CHAR_H + 2;
        for (let dy = 0; dy < CHAR_H - 4 && y + dy < VIDEO_H; dy++) {
          for (let dx = 0; dx < CHAR_W - 4 && x + dx < VIDEO_W; dx++) {
            const idx = ((y + dy) * VIDEO_W + (x + dx)) * 4;
            png.data[idx] = GREEN.r;
            png.data[idx + 1] = GREEN.g;
            png.data[idx + 2] = GREEN.b;
            png.data[idx + 3] = GREEN.a;
          }
        }
      }
      visibleChars++;
    }
  }

  // Scanlines CRT
  for (let y = 0; y < VIDEO_H; y += 2) {
    for (let x = 0; x < VIDEO_W; x++) {
      const idx = (y * VIDEO_W + x) * 4;
      png.data[idx] = Math.floor(png.data[idx] * 0.9);
      png.data[idx + 1] = Math.floor(png.data[idx + 1] * 0.9);
      png.data[idx + 2] = Math.floor(png.data[idx + 2] * 0.9);
    }
  }

  // Flicker si pirate
  if (pirate && Math.random() < 0.3) {
    for (let i = 0; i < png.data.length; i += 4) {
      png.data[i + 1] = Math.min(255, png.data[i + 1] + 20);
    }
  }

  return PNG.sync.write(png);
}

/**
 * Génère une vidéo MP4 télématique.
 * Retourne le chemin du fichier MP4.
 */
export async function generateVideoMP4(opts: VideoGenOptions): Promise<string> {
  const outDir = opts.outDir || path.resolve("export");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const framesDir = path.join(outDir, ".video-frames");
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true });
  fs.mkdirSync(framesDir);

  const lines = formatTerminal(opts.text, COLS);
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);

  const charsPerFrame = totalChars / (25 * 15); // 15 frames = ~0.6s
  const totalFrames = Math.ceil(totalChars / charsPerFrame) + 25;

  console.log(`Vidéo : ${totalChars} chars @ ${charsPerFrame.toFixed(1)}/frame = ${(totalFrames / 25).toFixed(1)}s`);

  // Générer les frames
  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    const charsVisible = Math.floor(frameIdx * charsPerFrame);
    const png = generateFrame(lines, charsVisible, opts.pirate || false);
    const framePath = path.join(framesDir, `frame-${String(frameIdx).padStart(4, "0")}.png`);
    fs.writeFileSync(framePath, png);
  }

  // Encoder avec ffmpeg
  const mp4Path = path.join(outDir, `video-${Date.now()}.mp4`);
  const ffmpegCmd = [
    `ffmpeg -framerate 25`,
    `-i "${path.join(framesDir, "frame-%04d.png")}"`,
    `-c:v libx264 -preset ultrafast -crf 28`,
    `-vf "scale=320:240"`,
    `"${mp4Path}"`,
  ].join(" ");

  execSync(ffmpegCmd, { stdio: "inherit" });
  fs.rmSync(framesDir, { recursive: true });

  return mp4Path;
}
