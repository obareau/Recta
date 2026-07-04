// La Console — générateur vidéo télématique années 80 (monoespace vert/noir).
// Terminal simulé + typewriter animation + scanlines CRT + piratage Renégat.
//
// Réutilisable pour : communiqués, NOVA-7, transmissions, intrusions, etc.
// Usage : appelé par console-publish.ts

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const COLS = 80;
const ROWS = 24;
const FONT_SIZE = 14;
const LINE_HEIGHT = 18;
const CHAR_WIDTH = 9; // monoespace
const SVG_WIDTH = COLS * CHAR_WIDTH;
const SVG_HEIGHT = ROWS * LINE_HEIGHT;

interface VideoGenOptions {
  text: string;
  pirate?: boolean;
  outDir?: string;
}

/** Échappe les caractères spéciaux XML/SVG. */
function escapeSvg(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

/** Génère une frame SVG du terminal. */
function generateFrameSvg(
  lines: string[],
  charsVisible: number,
  pirate: boolean
): string {
  let textElements = "";
  let visibleChars = 0;

  for (let row = 0; row < lines.length && row < ROWS; row++) {
    let line = lines[row];
    if (pirate && Math.random() < 0.2) line = corruptText(line, 0.25);

    // Afficher la ligne caractère par caractère jusqu'à charsVisible
    let displayLine = "";
    for (let col = 0; col < line.length && visibleChars < charsVisible; col++) {
      displayLine += line[col];
      visibleChars++;
    }

    const y = 20 + row * LINE_HEIGHT;
    textElements += `<text x="10" y="${y}" font-family="'Courier New', monospace" font-size="${FONT_SIZE}" fill="#00ff00" white-space="pre">${escapeSvg(
      displayLine
    )}</text>`;

    if (visibleChars >= charsVisible) break;
  }

  // Flicker si pirate
  const flicker = pirate && Math.random() < 0.3 ? 'opacity="0.9"' : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg" ${flicker}>
  <!-- Fond noir -->
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#000000"/>
  <!-- Scanlines CRT -->
  ${Array.from({ length: ROWS }, (_, i) => `<line x1="0" y1="${i * LINE_HEIGHT}" x2="${SVG_WIDTH}" y2="${i * LINE_HEIGHT}" stroke="#000000" stroke-width="2" opacity="0.15"/>`).join("\n  ")}
  <!-- Texte vert monoespace -->
  ${textElements}
</svg>`;
}

/**
 * Génère une vidéo MP4 télématique.
 * Retourne le chemin du fichier MP4.
 */
export async function generateVideoMP4(opts: VideoGenOptions): Promise<string> {
  const outDir = opts.outDir || path.resolve("export");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const framesDir = path.join(outDir, ".console-frames");
  if (fs.existsSync(framesDir)) fs.rmSync(framesDir, { recursive: true });
  fs.mkdirSync(framesDir);

  const lines = formatTerminal(opts.text, COLS);
  const totalChars = lines.reduce((sum, line) => sum + line.length, 0);

  const charsPerFrame = totalChars / (25 * 15); // 15 frames = ~0.6s typewriter
  const totalFrames = Math.ceil(totalChars / charsPerFrame) + 25;

  console.log(`La Console : ${totalChars} chars @ ${charsPerFrame.toFixed(1)}/frame = ${(totalFrames / 25).toFixed(1)}s`);

  // Générer les frames SVG → MP4 directement via ffmpeg (plus rapide)
  // Créer des fichiers SVG temporaires
  const svgDir = path.join(framesDir, "svg");
  fs.mkdirSync(svgDir);

  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    const charsVisible = Math.floor(frameIdx * charsPerFrame);
    const svg = generateFrameSvg(lines, charsVisible, opts.pirate || false);
    const svgPath = path.join(svgDir, `frame-${String(frameIdx).padStart(4, "0")}.svg`);
    fs.writeFileSync(svgPath, svg);
  }

  // Encoder en MP4 avec ffmpeg (SVG → PNG → H264)
  const mp4Path = path.join(outDir, `console-${Date.now()}.mp4`);
  const ffmpegCmd = [
    `ffmpeg -framerate 25`,
    `-pattern_type glob -i "${path.join(svgDir, "*.svg")}"`,
    `-vf "scale=320:240"`,
    `-c:v libx264 -preset ultrafast -crf 28`,
    `-y "${mp4Path}"`,
  ].join(" ");

  console.log("Encodage vidéo...");
  execSync(ffmpegCmd, { stdio: "inherit" });
  fs.rmSync(framesDir, { recursive: true });

  return mp4Path;
}
