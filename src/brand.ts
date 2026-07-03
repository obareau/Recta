// Identité visuelle C.G.U. — logo (profil) et bannière (couverture).
// Emblème de la Rectitude : l'œil barré, cerclé, sur écran phosphore.

const C0 = "#040804";
const C1 = "#1e4a24";
const C2 = "#5fae4e";
const C3 = "#d8ff9a";

/** L'œil de la Rectitude — cercle + pupille claire barrée d'un trait sombre. */
function emblem(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.save();
  // Halo externe.
  ctx.strokeStyle = C1;
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
  ctx.stroke();
  // Anneau principal.
  ctx.strokeStyle = C2;
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Iris rempli.
  ctx.fillStyle = C3;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.46, 0, Math.PI * 2);
  ctx.fill();
  // Pupille barrée (la marque de la Rectitude).
  ctx.fillStyle = C0;
  ctx.fillRect(cx - r * 0.46, cy - r * 0.085, r * 0.92, r * 0.17);
  ctx.restore();
}

function scanlines(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 0.16): void {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
}

/** Grille radar en fond, légère — écran de contrôle du C.G.U. */
function radarGrid(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(95,174,78,0.10)";
  ctx.lineWidth = 1;
  const step = Math.round(w / 26);
  for (let x = 0; x <= w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y <= h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
}

/** Logo de profil — carré, emblème centré + sigle C.G.U. (Facebook : 500×500). */
export function drawLogo(ctx: CanvasRenderingContext2D, size = 500): void {
  const w = size, h = size, cx = w / 2;
  ctx.fillStyle = C0;
  ctx.fillRect(0, 0, w, h);
  radarGrid(ctx, w, h);
  // Cadre circulaire (le profil sera rogné en rond).
  ctx.strokeStyle = C2;
  ctx.lineWidth = w * 0.015;
  ctx.beginPath();
  ctx.arc(cx, h / 2, w * 0.46, 0, Math.PI * 2);
  ctx.stroke();
  emblem(ctx, cx, h * 0.42, w * 0.2);
  ctx.textAlign = "center";
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.15)}px monospace`;
  ctx.fillText("C.G.U.", cx, h * 0.78);
  ctx.fillStyle = C2;
  ctx.font = `${Math.round(w * 0.045)}px monospace`;
  ctx.fillText("RECTITUDE", cx, h * 0.87);
  scanlines(ctx, w, h);
}

/** Bannière de couverture — Facebook 1640×624 (zone sûre centrale). */
export function drawBanner(ctx: CanvasRenderingContext2D, w = 1640, h = 624): void {
  ctx.fillStyle = C0;
  ctx.fillRect(0, 0, w, h);
  radarGrid(ctx, w, h);

  // Double cadre administratif.
  const m = Math.round(h * 0.06);
  ctx.strokeStyle = C2;
  ctx.lineWidth = 5;
  ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);
  ctx.lineWidth = 2;
  ctx.strokeRect(m + 10, m + 10, w - 2 * m - 20, h - 2 * m - 20);

  // Emblème à gauche.
  const cy = h / 2;
  emblem(ctx, w * 0.2, cy, h * 0.26);

  // Titre à droite de l'emblème.
  ctx.textAlign = "left";
  const tx = w * 0.34;
  const rightLimit = w - m - 16;
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(h * 0.19)}px monospace`;
  ctx.fillText("ROBOTARIIS", tx, cy - h * 0.02);
  // Sous-titres : taille réduite au besoin pour ne jamais déborder du cadre.
  const fit = (text: string, base: number): number => {
    let s = base;
    ctx.font = `${Math.round(s)}px monospace`;
    while (tx + ctx.measureText(text).width > rightLimit && s > h * 0.03) {
      s *= 0.95;
      ctx.font = `${Math.round(s)}px monospace`;
    }
    return s;
  };
  const sub = "C.G.U. — DIRECTION DE LA RECTITUDE";
  ctx.fillStyle = C2;
  fit(sub, h * 0.062);
  ctx.fillText(sub, tx, cy + h * 0.11);
  const teaser = "communiqués officiels de l'Oraculum  ▸  robotariis.com";
  ctx.fillStyle = C1;
  fit(teaser, h * 0.05);
  ctx.fillText(teaser, tx, cy + h * 0.22);

  scanlines(ctx, w, h, 0.13);
}

/**
 * Affiche d'invitation — carré 1080, style C.G.U. « convocation ».
 * Le Conseil vous convoque à rejoindre la fréquence : sarcasme officiel.
 */
export function drawInvite(ctx: CanvasRenderingContext2D, size = 1080): void {
  const w = size, h = size, cx = w / 2;
  const M = Math.round(w * 0.07);
  ctx.fillStyle = C0;
  ctx.fillRect(0, 0, w, h);
  radarGrid(ctx, w, h);
  ctx.strokeStyle = C2;
  ctx.lineWidth = 6;
  ctx.strokeRect(M * 0.5, M * 0.5, w - M, h - M);
  ctx.lineWidth = 2;
  ctx.strokeRect(M * 0.68, M * 0.68, w - M * 1.36, h - M * 1.36);

  ctx.textAlign = "center";
  let y = h * 0.15;
  ctx.fillStyle = C2;
  ctx.font = `bold ${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("CONSEIL DES GOUVERNANCES UNIES", cx, y);
  y += w * 0.036;
  ctx.font = `${Math.round(w * 0.022)}px monospace`;
  ctx.fillText("AVIS DE CONVOCATION — PRÉSENCE RECOMMANDÉE", cx, y);

  y += w * 0.12;
  emblem(ctx, cx, y, w * 0.11);

  y += w * 0.19;
  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.062)}px monospace`;
  ctx.fillText("REJOIGNEZ", cx, y);
  ctx.fillText("LA FRÉQUENCE", cx, y + w * 0.075);

  y += w * 0.16;
  ctx.fillStyle = C2;
  ctx.font = `${Math.round(w * 0.03)}px monospace`;
  ctx.fillText("Abonnez-vous à la Page Robotariis.", cx, y);
  ctx.fillText("Un communiqué diffusé chaque jour.", cx, y + w * 0.045);
  ctx.fillStyle = C1;
  ctx.font = `italic ${Math.round(w * 0.023)}px monospace`;
  ctx.fillText("l'absence est consignée.", cx, y + w * 0.092);

  ctx.fillStyle = C3;
  ctx.font = `bold ${Math.round(w * 0.032)}px monospace`;
  ctx.fillText("facebook · robotariis.com", cx, h - M * 1.25);
  ctx.fillStyle = C1;
  ctx.font = `${Math.round(w * 0.018)}px monospace`;
  ctx.fillText("univers de science-fiction — œuvre de l'Oraculum", cx, h - M * 0.85);

  scanlines(ctx, w, h, 0.15);
}
