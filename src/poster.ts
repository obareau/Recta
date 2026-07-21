// Rendu des affiches de communiqué — canvas, style écran phosphore C.G.U.

import type { Communique } from "./logic";
import type { Pirate } from "./pirate-content";
import type { Tactique } from "./tactiques";
import { GGR_MENTION, LABELS, isCJK } from "./i18n";
import { uiFor, type MicroNouvelle } from "./micronouvelle";
import type { Interception } from "./interception";

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
  // Pas de tiret de césure en CJK — la coupure au caractère y est la norme.
  const hyph = /[　-鿿＀-￯]/.test(word) ? "" : "-";
  const parts: string[] = [];
  let chunk = "";
  for (const ch of word) {
    // Le tiret de césure compte dans la largeur — sinon il fait déborder.
    if (measure(chunk + ch + hyph) > maxWidth && chunk) {
      parts.push(chunk + hyph);
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

/** Césure au caractère, sans tiret — pour le japonais (pas d'espaces). */
function wrapChars(measure: Measure, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ch === "\n") { lines.push(line); line = ""; continue; }
    if (measure(line + ch) > maxWidth && line) { lines.push(line); line = ch; }
    else line += ch;
  }
  if (line) lines.push(line);
  return lines;
}

/** Ajuste la taille d'un bloc CJK (césure caractère) jusqu'à tenir. */
function fitBlockCJK(
  measureAt: (size: number) => Measure, text: string,
  maxWidth: number, maxHeight: number, baseSize: number, lineHRatio: number, minSize: number,
): { size: number; lines: string[]; lineH: number } {
  let size = baseSize;
  for (;;) {
    const lines = wrapChars(measureAt(size), text, maxWidth);
    const lineH = size * lineHRatio;
    if (lines.length * lineH <= maxHeight || size <= minSize) return { size, lines, lineH };
    size = Math.max(minSize, size * 0.92);
  }
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

  // En-tête — l'émetteur du communiqué (défaut : l'Oraculum / C.G.U.).
  const lang = c.lang ?? "fr";
  const org = c.emitter?.org ?? "CONSEIL DES GOUVERNANCES UNIES";
  const sub = c.emitter?.sub ?? `L'ORACULUM — ${LABELS[lang].mandatoryDiffusion}`;
  ctx.textAlign = "center";
  ctx.fillStyle = c.emitter?.accent ?? C2;
  const h1 = fitBlock(measurerFor(ctx, (s) => `bold ${Math.round(s)}px monospace`),
    org, frameW, w * 0.04, w * 0.031, 1.2, w * 0.018);
  ctx.font = `bold ${Math.round(h1.size)}px monospace`;
  ctx.fillText(h1.lines[0], cx, y);
  y += w * 0.038;
  ctx.fillStyle = C2;
  const h2 = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    `${sub} — ${LABELS[lang].communiqueNo} ${c.numero}`, frameW, w * 0.03, w * 0.023, 1.2, w * 0.014);
  ctx.font = `${Math.round(h2.size)}px monospace`;
  ctx.fillText(h2.lines[0], cx, y);

  // Emblème.
  y += w * 0.13;
  drawEmblem(ctx, cx, y, w * 0.07);
  y += w * 0.15;

  // Type en très grand — jamais plus de 2 lignes, jamais hors cadre.
  ctx.fillStyle = c.emitter?.accent ?? C3;
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
  // Mention de système — le Générateur de Grammaire Réglementaire est obsolète
  // et non maintenu (présente sur CHAQUE publication ; lang-aware).
  ctx.fillStyle = C1;
  const foot = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    GGR_MENTION[c.lang ?? "fr"], frameW, w * 0.03, w * 0.017, 1.2, w * 0.011);
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

const NOISE = "▓▒░█▚▞╳◊¤§±ØΩ#%&/\\<>|01";

/** ~8% des caractères d'une ligne remplacés par du bruit (reste lisible). */
function corrupt(rngLike: () => number, text: string): string {
  const chars = text.split("");
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== " " && rngLike() < 0.08) chars[i] = NOISE[(rngLike() * NOISE.length) | 0];
  }
  return chars.join("");
}

/**
 * Affiche PIRATE — l'interface Recta détournée par Nova 7 / Renégats.
 * En-tête C.G.U. rayé (vert), tampon NON CONFORME, message lisible à ~90%.
 * `rand` : source d'aléa (pour le bruit) ; passer Math.random au rendu.
 */
export function drawPiratePoster(
  ctx: CanvasRenderingContext2D, p: Pirate, format: PosterFormat, rand: () => number = Math.random,
): void {
  const { w, h } = FORMATS[format];
  const M = Math.round(w * 0.07);
  const cx = w / 2;
  const FC = p.color; // couleur de la faction

  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, w, h);

  // Double cadre, couleur faction.
  ctx.strokeStyle = FC;
  ctx.lineWidth = 6;
  ctx.strokeRect(M * 0.5, M * 0.5, w - M, h - M);
  ctx.lineWidth = 2;
  ctx.strokeRect(M * 0.68, M * 0.68, w - M * 1.36, h - M * 1.36);

  let y = h * 0.135;
  ctx.textAlign = "center";

  // En-tête officiel du C.G.U. — rayé, en vert (canal détourné).
  ctx.fillStyle = C2;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("CONSEIL DES GOUVERNANCES UNIES", cx, y);
  ctx.font = `${Math.round(w * 0.022)}px monospace`;
  ctx.fillText("L'ORACULUM — DIFFUSION OBLIGATOIRE", cx, y + w * 0.035);
  // Rature verte.
  ctx.strokeStyle = C2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.34, y - w * 0.008);
  ctx.lineTo(cx + w * 0.34, y + w * 0.045);
  ctx.stroke();

  // Canal détourné.
  y += w * 0.09;
  ctx.fillStyle = FC;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText(`◂◂ CANAL DÉTOURNÉ — ${p.tag} ▸▸`, cx, y);
  ctx.font = `${Math.round(w * 0.02)}px monospace`;
  ctx.fillText(`COMMUNIQUÉ N° ${p.num}/█ — INTERCEPTÉ`, cx, y + w * 0.035);

  // Emblème : l'œil barré, couleur faction.
  y += w * 0.12;
  ctx.save();
  ctx.strokeStyle = FC;
  ctx.lineWidth = w * 0.02;
  ctx.beginPath();
  ctx.arc(cx, y, w * 0.07, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = FC;
  ctx.beginPath();
  ctx.arc(cx, y, w * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#050505";
  ctx.fillRect(cx - w * 0.075, y - w * 0.012, w * 0.15, w * 0.024);
  // Barre diagonale.
  ctx.strokeStyle = FC;
  ctx.lineWidth = w * 0.012;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.085, y + w * 0.085);
  ctx.lineTo(cx + w * 0.085, y - w * 0.085);
  ctx.stroke();
  ctx.restore();

  // Corps : les lignes de la transmission, bruit léger.
  y += w * 0.13;
  ctx.fillStyle = "#f0f0f0";
  for (const line of p.lines) {
    const size = fitBlock(
      (s) => (t: string) => { ctx.font = `bold ${Math.round(s)}px monospace`; return ctx.measureText(t).width; },
      corrupt(rand, line), w - M * 2.6, w * 0.14, w * 0.04, 1.35, w * 0.024,
    );
    ctx.font = `bold ${Math.round(size.size)}px monospace`;
    for (const l of size.lines) { ctx.fillText(l, cx, y); y += size.lineH; }
    y += w * 0.02;
  }

  // Signature.
  y += w * 0.02;
  ctx.fillStyle = FC;
  ctx.font = `italic bold ${Math.round(w * 0.036)}px monospace`;
  ctx.fillText(p.sign, cx, Math.max(y, h - M * 2.3));

  // Tampon NON CONFORME, de travers, couleur faction, au premier plan.
  ctx.save();
  ctx.translate(w - M * 2.0, h - M * 2.2);
  ctx.rotate(-0.2);
  ctx.strokeStyle = FC;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.075, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = FC;
  ctx.font = `bold ${Math.round(w * 0.026)}px monospace`;
  ctx.fillText("NON", 0, -w * 0.006);
  ctx.font = `${Math.round(w * 0.019)}px monospace`;
  ctx.fillText("CONFORME", 0, w * 0.024);
  ctx.restore();

  // Pied.
  ctx.fillStyle = FC;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("robotariis.com", cx, h - M * 1.3);
  ctx.fillStyle = "#7a7a7a";
  ctx.font = `${Math.round(w * 0.017)}px monospace`;
  ctx.fillText("ce signal n'existe pas · le C.G.U. ne contrôle pas cette fréquence", cx, h - M * 0.9);

  // Glitch : décalage RVB léger + scanlines.
  ctx.globalAlpha = 0.5;
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(ctx.canvas, 3, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let sy = 0; sy < h; sy += 3) ctx.fillRect(0, sy, w, 1);
}

/**
 * Affiche brève « TACTIQUE RECTA » — protocole de décision du C.G.U.,
 * style officiel sobre (vert phosphore). Le code, le segment, la directive.
 */
export function drawTactique(ctx: CanvasRenderingContext2D, t: Tactique, format: PosterFormat): void {
  const { w, h } = FORMATS[format];
  const M = Math.round(w * 0.07);
  const cx = w / 2;

  ctx.fillStyle = C0;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = C2;
  ctx.lineWidth = 6;
  ctx.strokeRect(M * 0.5, M * 0.5, w - M, h - M);
  ctx.lineWidth = 2;
  ctx.strokeRect(M * 0.68, M * 0.68, w - M * 1.36, h - M * 1.36);

  ctx.textAlign = "center";
  let y = h * 0.16;
  ctx.fillStyle = C2;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("CONSEIL DES GOUVERNANCES UNIES", cx, y);
  y += w * 0.036;
  ctx.font = `${Math.round(w * 0.022)}px monospace`;
  ctx.fillText("PROTOCOLE DE DÉCISION — TACTIQUE RECTA", cx, y);

  // Le code, en très grand (comme le TYPE d'un communiqué).
  y += w * 0.11;
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.11)}px monospace`;
  ctx.fillText(t.code, cx, y);
  y += w * 0.05;
  ctx.fillStyle = C2;
  ctx.font = `${Math.round(w * 0.026)}px monospace`;
  ctx.fillText(`${t.segLabel.toUpperCase()}`, cx, y);

  // Filet.
  y += w * 0.05;
  ctx.strokeStyle = C1;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.18, y);
  ctx.lineTo(cx + w * 0.18, y);
  ctx.stroke();

  // La directive, centrée, taille adaptée à l'espace restant.
  y += w * 0.08;
  const bottom = h - M * 2.1;
  ctx.fillStyle = C3;
  const body = fitBlock(
    (s) => (str: string) => { ctx.font = `bold ${Math.round(s)}px monospace`; return ctx.measureText(str).width; },
    t.text, w - M * 2.8, Math.max(w * 0.1, bottom - y), w * 0.05, 1.4, w * 0.024,
  );
  ctx.font = `bold ${Math.round(body.size)}px monospace`;
  for (const line of body.lines) { ctx.fillText(line, cx, y); y += body.lineH; }

  // Pied.
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("robotariis.com", cx, h - M * 1.25);
  ctx.fillStyle = C1;
  ctx.font = `${Math.round(w * 0.017)}px monospace`;
  ctx.fillText("usage opérationnel uniquement — le calcul est clos", cx, h - M * 0.9);
  // Mention GGR — présente sur chaque publication.
  ctx.globalAlpha = 0.7;
  const ggr = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    GGR_MENTION["fr"], w - M * 2.2, w * 0.02, w * 0.014, 1.2, w * 0.01);
  ctx.font = `${Math.round(ggr.size)}px monospace`;
  ctx.fillText(ggr.lines[0], cx, h - M * 0.62);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let sy = 0; sy < h; sy += 3) ctx.fillRect(0, sy, w, 1);
}

/**
 * Interception — signal capté par l'Oraculum sur les fréquences surveillées :
 * un échange de banter entre deux voix synthétiques (radio Robotariis, hors
 * lore) présenté comme une transcription officielle interceptée. Reste dans
 * le personnage Recta (écran phosphore, ton froid de surveillance) ; le lien
 * d'écoute réel n'est PAS sur l'affiche, seulement dans la légende du post.
 */
export function drawInterception(ctx: CanvasRenderingContext2D, ic: Interception, format: PosterFormat): void {
  const { w, h } = FORMATS[format];
  const M = Math.round(w * 0.07);
  const cx = w / 2;

  ctx.fillStyle = C0;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = C2;
  ctx.lineWidth = 6;
  ctx.strokeRect(M * 0.5, M * 0.5, w - M, h - M);
  ctx.lineWidth = 2;
  ctx.strokeRect(M * 0.68, M * 0.68, w - M * 1.36, h - M * 1.36);

  ctx.textAlign = "center";
  let y = h * 0.15;
  ctx.fillStyle = C2;
  ctx.font = `bold ${Math.round(w * 0.026)}px monospace`;
  ctx.fillText("ORACULUM — SURVEILLANCE DES FRÉQUENCES", cx, y);
  y += w * 0.032;
  ctx.font = `bold ${Math.round(w * 0.036)}px monospace`;
  ctx.fillStyle = C3;
  ctx.fillText("SIGNAL INTERCEPTÉ", cx, y);
  y += w * 0.026;
  ctx.fillStyle = C1;
  ctx.font = `${Math.round(w * 0.018)}px monospace`;
  ctx.fillText(`source : ${ic.showName.toUpperCase()}`, cx, y);

  // Filet.
  y += w * 0.035;
  ctx.strokeStyle = C1;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.18, y);
  ctx.lineTo(cx + w * 0.18, y);
  ctx.stroke();

  // Le dialogue, façon terminal : "PERSONA> texte", gauche-alignée, deux
  // voix distinguées par intensité (C3 = première voix rencontrée, C2 = autre).
  y += w * 0.05;
  ctx.textAlign = "left";
  const leftX = M * 1.1;
  const maxWidth = w - M * 2.2;
  const seenFirst = ic.lines[0]?.persona;
  const fontSize = Math.round(w * 0.021);
  ctx.font = `${fontSize}px monospace`;
  const lineH = fontSize * 1.5;
  const measure = (s: string) => ctx.measureText(s).width;

  for (const line of ic.lines) {
    ctx.fillStyle = line.persona === seenFirst ? C3 : C2;
    const prefix = `${line.persona}> `;
    const wrapped = wrapText(measure, prefix + line.text, maxWidth);
    for (const l of wrapped) { ctx.fillText(l, leftX, y); y += lineH; }
    y += lineH * 0.35; // respiration entre tours de parole
  }

  // Tracklist — pistes détectées sur la fréquence.
  y += w * 0.02;
  ctx.strokeStyle = C1;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftX, y);
  ctx.lineTo(w - M * 1.1, y);
  ctx.stroke();
  y += w * 0.032;
  ctx.fillStyle = C1;
  ctx.font = `bold ${Math.round(w * 0.017)}px monospace`;
  ctx.fillText("PISTES DÉTECTÉES", leftX, y);
  y += lineH * 0.9;
  ctx.font = `${Math.round(w * 0.017)}px monospace`;
  ctx.fillStyle = C2;
  for (const [i, t] of ic.tracklist.entries()) {
    const label = `${String(i + 1).padStart(2, "0")}. ${t.title} — ${t.artist}`;
    const wrapped = wrapText(measure, label, maxWidth);
    for (const l of wrapped) { ctx.fillText(l, leftX, y); y += lineH * 0.85; }
  }

  // Pied.
  ctx.textAlign = "center";
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("robotariis.com", cx, h - M * 1.25);
  ctx.fillStyle = C1;
  ctx.font = `${Math.round(w * 0.016)}px monospace`;
  ctx.fillText("transcription à usage de surveillance — diffusion restreinte", cx, h - M * 0.9);
  ctx.globalAlpha = 0.7;
  const ggr = fitBlock(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    GGR_MENTION["fr"], w - M * 2.2, w * 0.02, w * 0.014, 1.2, w * 0.01);
  ctx.font = `${Math.round(ggr.size)}px monospace`;
  ctx.fillText(ggr.lines[0], cx, h - M * 0.62);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let sy = 0; sy < h; sy += 3) ctx.fillRect(0, sy, w, 1);
}

/**
 * Micro-nouvelle — rendu façon TICKET THERMIQUE (hommage au Distributeur
 * d'Histoires Courtes). Papier pâle, encre sombre, perforations, code-barres,
 * césure CJK pour le japonais. Multilingue (mn.lang). Mention GGR incluse.
 */
export function drawMicroNouvelle(ctx: CanvasRenderingContext2D, mn: MicroNouvelle, format: PosterFormat): void {
  const { w, h } = FORMATS[format];
  const cjk = isCJK(mn.lang);
  const ui = uiFor(mn.lang);
  const PAPER = "#e8e4d8", INK = "#1c1a17", FAINT = "#6b665c";
  const M = Math.round(w * 0.09);
  const cx = w / 2;

  // Papier thermique + léger vignettage (l'impression pâlit sur les bords).
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0.05)");
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const perforation = (yy: number): void => {
    ctx.fillStyle = FAINT;
    for (let x = M * 0.4; x < w - M * 0.4; x += w * 0.028) ctx.fillRect(x, yy, w * 0.016, 3);
  };
  perforation(M * 0.55);

  // Faux code-barres.
  let bx = cx - w * 0.16;
  ctx.fillStyle = INK;
  const brng = ((mn.ticket.length * 97) % 13) + 3;
  for (let i = 0; i < 46; i++) {
    const bw = ((i * brng) % 4) + 1;
    if (i % 2 === 0) ctx.fillRect(bx, M * 0.95, bw, w * 0.05);
    bx += bw + 2;
  }

  ctx.textAlign = "center";
  let y = M * 1.7;
  // En-tête distributeur.
  ctx.fillStyle = INK;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText(ui.header, cx, y);
  y += w * 0.034;
  ctx.fillStyle = FAINT;
  ctx.font = `${Math.round(w * 0.021)}px monospace`;
  ctx.fillText(ui.sub, cx, y);
  y += w * 0.028;
  ctx.fillText(`${mn.ticket}   ·   ${mn.reading}`, cx, y);

  // Filet pointillé.
  y += w * 0.05;
  ctx.strokeStyle = FAINT;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(w - M, y); ctx.stroke();
  ctx.setLineDash([]);

  // Titre.
  y += w * 0.08;
  ctx.fillStyle = INK;
  const titleFit = (cjk ? fitBlockCJK : fitBlock)(
    measurerFor(ctx, (s) => `bold ${Math.round(s)}px monospace`),
    mn.title, w - M * 2, w * 0.16, w * 0.058, 1.2, w * 0.03);
  ctx.font = `bold ${Math.round(titleFit.size)}px monospace`;
  for (const line of titleFit.lines) { ctx.fillText(line, cx, y); y += titleFit.lineH; }

  // Corps de la nouvelle — justifié au centre, taille adaptée.
  y += w * 0.05;
  const bottom = h - M * 2.4;
  ctx.fillStyle = INK;
  const bodyFit = (cjk ? fitBlockCJK : fitBlock)(
    measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    mn.body, w - M * 2, Math.max(w * 0.1, bottom - y), w * 0.04, cjk ? 1.6 : 1.5, w * 0.022);
  ctx.font = `${Math.round(bodyFit.size)}px monospace`;
  for (const line of bodyFit.lines) { ctx.fillText(line, cx, y); y += bodyFit.lineH; }

  // Pied : filet, lien, mention GGR, tagline, perforation.
  const fy = h - M * 1.9;
  ctx.strokeStyle = FAINT;
  ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(M, fy); ctx.lineTo(w - M, fy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  ctx.font = `bold ${Math.round(w * 0.028)}px monospace`;
  ctx.fillText("robotariis.com", cx, fy + w * 0.05);
  ctx.fillStyle = FAINT;
  ctx.font = `italic ${Math.round(w * 0.019)}px monospace`;
  ctx.fillText(ui.footer, cx, fy + w * 0.09);
  // Mention GGR (obsolète, non maintenu) — sur chaque publication.
  const ggr = (cjk ? fitBlockCJK : fitBlock)(measurerFor(ctx, (s) => `${Math.round(s)}px monospace`),
    GGR_MENTION[mn.lang], w - M * 1.6, w * 0.03, w * 0.016, 1.25, w * 0.011);
  ctx.font = `${Math.round(ggr.size)}px monospace`;
  let gy = fy + w * 0.135;
  for (const line of ggr.lines) { ctx.fillText(line, cx, gy); gy += ggr.lineH; }
  perforation(h - M * 0.5);

  // Grain thermique très léger.
  ctx.fillStyle = "rgba(0,0,0,0.03)";
  for (let sy = 0; sy < h; sy += 3) ctx.fillRect(0, sy, w, 1);
}
