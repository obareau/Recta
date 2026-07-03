import { fitBlock, wrapText, type Measure } from "../src/poster";

// Mesure factice : 10 px par caractère, proportionnelle à la taille.
const measureAt = (size: number): Measure => (t) => t.length * size * 0.6;

describe("wrap sans débordement", () => {
  const m = measureAt(16); // ~9.6 px/car

  test("coupe sur les espaces sous la largeur max", () => {
    const lines = wrapText(m, "la rectitude ne pardonne pas l'écart", 120);
    for (const l of lines) expect(m(l)).toBeLessThanOrEqual(120);
    expect(lines.join(" ").replace(/- /g, "")).toContain("rectitude");
  });

  test("retour ligne FORCÉ : un mot plus large que la colonne est césuré", () => {
    const lines = wrapText(m, "Antidésobéissancement", 60);
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines) expect(m(l)).toBeLessThanOrEqual(60);
    expect(lines.slice(0, -1).every((l) => l.endsWith("-"))).toBe(true);
  });

  test("jamais de ligne vide", () => {
    for (const text of ["", "a", "mot unique"]) {
      for (const l of wrapText(m, text, 100)) expect(l.length).toBeGreaterThan(0);
    }
  });
});

describe("fitBlock : tient en largeur ET en hauteur", () => {
  test("réduit la taille jusqu'à rentrer dans la boîte", () => {
    const long = "Le Conseil convie la population des blocs d'habitation Est à la récitation collective des Vertus Recta. La présence est libre. L'absence est consignée.";
    const r = fitBlock(measureAt, long, 300, 200, 40, 1.5, 8);
    expect(r.size).toBeLessThan(40);
    expect(r.lines.length * r.lineH).toBeLessThanOrEqual(200);
    for (const l of r.lines) expect(measureAt(r.size)(l)).toBeLessThanOrEqual(300);
  });

  test("respecte la taille plancher sans boucler à l'infini", () => {
    const r = fitBlock(measureAt, "x".repeat(2000), 100, 50, 30, 1.4, 12);
    expect(r.size).toBe(12);
  });

  test("texte court : garde la taille de base", () => {
    const r = fitBlock(measureAt, "ALERTE", 500, 300, 40, 1.2, 8);
    expect(r.size).toBe(40);
  });
});
