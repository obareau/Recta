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

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
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

  // En-tête institutionnel.
  ctx.textAlign = "center";
  ctx.fillStyle = C2;
  ctx.font = `bold ${Math.round(w * 0.031)}px monospace`;
  ctx.fillText("CONSEIL DES GOUVERNANCES UNIES", cx, y);
  y += w * 0.038;
  ctx.font = `${Math.round(w * 0.023)}px monospace`;
  ctx.fillText(`L'ORACULUM — DIFFUSION OBLIGATOIRE — COMMUNIQUÉ N° ${c.numero}`, cx, y);

  // Emblème.
  y += w * 0.13;
  drawEmblem(ctx, cx, y, w * 0.07);
  y += w * 0.15;

  // Type en très grand.
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.072)}px monospace`;
  for (const line of wrap(ctx, c.type, w - M * 3)) {
    ctx.fillText(line, cx, y);
    y += w * 0.085;
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

  // Corps du communiqué — la taille s'adapte à l'espace restant.
  const bottomLimit = h - M * 2.6; // au-dessus de la devise et du pied de page
  ctx.fillStyle = C2;
  let bodySize = w * 0.037;
  let lineH = w * 0.055;
  ctx.font = `${Math.round(bodySize)}px monospace`;
  let lines = wrap(ctx, c.corps, w - M * 3.2);
  if (y + lines.length * lineH > bottomLimit) {
    bodySize = w * 0.03;
    lineH = w * 0.045;
    ctx.font = `${Math.round(bodySize)}px monospace`;
    lines = wrap(ctx, c.corps, w - M * 3);
  }
  for (const line of lines) {
    ctx.fillText(line, cx, y);
    y += lineH;
  }

  // Devise — ancrée en zone basse, jamais en collision avec le pied de page.
  ctx.fillStyle = C3;
  ctx.font = `italic ${Math.round(w * 0.032)}px monospace`;
  ctx.fillText(c.devise, cx, Math.max(y + w * 0.04, h - M * 2.15));

  // Tampon de conformité, légèrement de travers — l'administration est humaine.
  const sx = w - M * 2.1;
  const sy = h - M * 2.3;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(-0.22);
  ctx.strokeStyle = C2;
  ctx.globalAlpha = 0.8;
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

  // Le teaser : l'appel du monde d'à côté.
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.033)}px monospace`;
  ctx.fillText("robotariis.com", cx, h - M * 1.35);
  ctx.fillStyle = C1;
  ctx.font = `${Math.round(w * 0.019)}px monospace`;
  ctx.fillText("émis en Omniglossa Recta — archive non autorisée de l'univers ROBOTARIIS", cx, h - M * 0.95);

  // Scanlines CRT.
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let sy2 = 0; sy2 < h; sy2 += 3) ctx.fillRect(0, sy2, w, 1);
}
