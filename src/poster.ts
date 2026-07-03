// Rendu des affiches de communiqué — canvas, style écran phosphore C.G.U.

import type { Communique } from "./logic";

export type PosterFormat = "carre" | "story";

export const FORMATS: Record<PosterFormat, { w: number; h: number }> = {
  carre: { w: 1080, h: 1080 },   // post réseau
  story: { w: 1080, h: 1920 },   // story / écran vertical
};

const C0 = "#040804";
const C1 = "#1e4a24";
const C2 = "#5fae4e";
const C3 = "#d8ff9a";

export type Measure = (text: string) => number;

/** Coupe un mot trop large en tronçons qui tiennent (retour ligne forcé). */
function hardBreak(measure: Measure, word: string, maxWidth: number): string[] {
  if (measure(word) <= maxWidth) return [word];
  const parts: string[] = [];
  let chunk = "";
  for (const ch of word) {
    // Le tiret de césure compte dans la largeur — sinon il fait déborder.
    if (measure(chunk + ch + "-") > maxWidth && chunk) {
      parts.push(chunk + "-");
      chunk = ch;
    } else {
      chunk += ch;
    }
  }
  if (chunk) parts.push(chunk);
  return parts;
}

/** Découpe en lignes ≤ maxWidth — aucun débordement possible. */
export function wrapText(measure: Measure, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const raw of text.split(" ")) {
    for (const w of hardBreak(measure, raw, maxWidth)) {
      const probe = line ? `${line} ${w}` : w;
      if (measure(probe) > maxWidth && line) {
        lines.push(line);
        line = w;
      } else {
        line = probe;
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Ajuste la taille de police jusqu'à ce que le bloc tienne en largeur ET
 * en hauteur. Renvoie la taille retenue et les lignes.
 */
export function fitBlock(
  measureAt: (size: number) => Measure,
  text: string, maxWidth: number, maxHeight: number,
  baseSize: number, lineHRatio: number, minSize: number,
): { size: number; lines: string[]; lineH: number } {
  let size = baseSize;
  for (;;) {
    const lines = wrapText(measureAt(size), text, maxWidth);
    const lineH = size * lineHRatio;
    if (lines.length * lineH <= maxHeight || size <= minSize) {
      return { size, lines, lineH };
    }
    size = Math.max(minSize, size * 0.92);
  }
}

function measurerFor(ctx: CanvasRenderingContext2D, style: (size: number) => string): (size: number) => Measure {
  return (size) => {
    ctx.font = style(size);
    return (t) => ctx.measureText(t).width;
  };
}

/** L'œil de la Rectitude — l'emblème des bannières, en grand. */
function drawEmblem(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.save();
  ctx.strokeStyle = C2;
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = C3;
  ctx.fill();
  ctx.fillStyle = C0;
  ctx.fillRect(cx - r * 0.45, cy - r * 0.08, r * 0.9, r * 0.16); // la pupille barrée
  ctx.restore();
}

export function drawPoster(ctx: CanvasRenderingContext2D, c: Communique, format: PosterFormat): void {
  const { w, h } = FORMATS[format];
  const M = Math.round(w * 0.07); // marge

  ctx.fillStyle = C0;
  ctx.fillRect(0, 0, w, h);

  // Double cadre administratif.
  ctx.strokeStyle = C2;
  ctx.lineWidth = 6;
  ctx.strokeRect(M * 0.5, M * 0.5, w - M, h - M);
  ctx.lineWidth = 2;
  ctx.strokeRect(M * 0.68, M * 0.68, w - M * 1.36, h - M * 1.36);

  const cx = w / 2;
  let y = format === "story" ? h * 0.16 : h * 0.15;

  const frameW = w - M * 2.2; // largeur utile à l'intérieur du double cadre

  // En-tête institutionnel — réduit jusqu'à tenir dans le cadre.
  ctx.textAlign = "center";
  ctx.fillStyle = C2;
  const h1 = fitBlock(measurerFor(ctx, (s) => `bold ${Math.round(s)}px monospace`),
    "CONSEIL DES GOUVERNANCES UNIES", frameW, w * 0.04, w * 0.031, 1.2, w * 0.018);
  ctx.font = `bold ${Math.round(h1.size)}px monospace`;
  ctx.fillText(h1.lines[0], cx, y);
  y += w * 0.038;
  const h2 = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    `L'ORACULUM — DIFFUSION OBLIGATOIRE — COMMUNIQUÉ N° ${c.numero}`, frameW, w * 0.03, w * 0.023, 1.2, w * 0.014);
  ctx.font = `${Math.round(h2.size)}px monospace`;
  ctx.fillText(h2.lines[0], cx, y);

  // Emblème.
  y += w * 0.13;
  drawEmblem(ctx, cx, y, w * 0.07);
  y += w * 0.15;

  // Type en très grand — jamais plus de 2 lignes, jamais hors cadre.
  ctx.fillStyle = C3;
  const title = fitBlock(measurerFor(ctx, (s) => `bold ${Math.round(s)}px monospace`),
    c.type, w - M * 2.6, w * 0.2, w * 0.072, 1.18, w * 0.04);
  ctx.font = `bold ${Math.round(title.size)}px monospace`;
  for (const line of title.lines) {
    ctx.fillText(line, cx, y);
    y += title.lineH;
  }
  y += w * 0.02;

  // Filet.
  ctx.strokeStyle = C1;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.18, y);
  ctx.lineTo(cx + w * 0.18, y);
  ctx.stroke();
  y += w * 0.075;

  // Corps du communiqué — taille réduite jusqu'à tenir dans l'espace restant.
  const deviseTop = h - M * 2.6; // zone réservée à la devise (au-dessus du pied de page)
  ctx.fillStyle = C2;
  const body = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    c.corps, w - M * 3, Math.max(w * 0.06, deviseTop - y - w * 0.02), w * 0.037, 1.48, w * 0.02);
  ctx.font = `${Math.round(body.size)}px monospace`;
  for (const line of body.lines) {
    ctx.fillText(line, cx, y);
    y += body.lineH;
  }

  // Devise — zone dédiée. Sa largeur s'arrête AVANT le tampon RECTA :
  // en carré, la bande basse est étroite et le texte passait dessous.
  const stampCx = w - M * 2.1;
  const stampR = w * 0.075;
  const deviseMaxW = Math.min(w - M * 3.6, 2 * (stampCx - stampR - w * 0.025 - cx));
  ctx.fillStyle = C3;
  const devise = fitBlock(measurerFor(ctx, (s) => `italic ${Math.round(s)}px monospace`),
    c.devise, deviseMaxW, w * 0.09, w * 0.032, 1.3, w * 0.016);
  ctx.font = `italic ${Math.round(devise.size)}px monospace`;
  // Ancrée par le BAS de sa bande : deux lignes montent, elles ne
  // descendent jamais sur robotariis.com.
  const deviseBottom = h - M * 1.85;
  let dy = Math.min(Math.max(y + w * 0.04, deviseTop), deviseBottom - (devise.lines.length - 1) * devise.lineH);
  for (const line of devise.lines) {
    ctx.fillText(line, cx, dy);
    dy += devise.lineH;
  }

  // Le teaser : l'appel du monde d'à côté.
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.033)}px monospace`;
  ctx.fillText("robotariis.com", cx, h - M * 1.35);
  ctx.fillStyle = C1;
  const foot = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    "émis en Omniglossa Recta — archive non autorisée de l'univers ROBOTARIIS", frameW, w * 0.03, w * 0.019, 1.2, w * 0.012);
  ctx.font = `${Math.round(foot.size)}px monospace`;
  ctx.fillText(foot.lines[0], cx, h - M * 1.02);

  // Mention légale en caractères minuscules — vous n'aviez qu'à lire la loi.
  ctx.fillStyle = C1;
  ctx.globalAlpha = 0.75;
  const tiny = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    c.mention, frameW, w * 0.02, w * 0.0115, 1.2, w * 0.008);
  ctx.font = `${Math.round(tiny.size)}px monospace`;
  ctx.fillText(tiny.lines[0], cx, h - M * 0.8);
  ctx.globalAlpha = 1;

  // Tampon de conformité — AU PREMIER PLAN, par-dessus tout le texte,
  // légèrement de travers : l'administration tamponne en dernier.
  ctx.save();
  ctx.translate(stampCx, h - M * 2.3);
  ctx.rotate(-0.22);
  ctx.strokeStyle = C2;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.075, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `bold ${Math.round(w * 0.026)}px monospace`;
  ctx.fillStyle = C2;
  ctx.fillText("RECTA", 0, -w * 0.005);
  ctx.font = `${Math.round(w * 0.017)}px monospace`;
  ctx.fillText("CONFORME", 0, w * 0.025);
  ctx.restore();

  // Scanlines CRT.
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let sy2 = 0; sy2 < h; sy2 += 3) ctx.fillRect(0, sy2, w, 1);
}
