import { communiqueFor, numeroFor } from "../src/logic";

describe("Communiqués de la Rectitude", () => {
  const d = new Date(2026, 6, 3, 10, 0, 0);

  test("déterministe : même seed + même sel → même communiqué", () => {
    expect(communiqueFor("recta:x", d, 3)).toEqual(communiqueFor("recta:x", d, 3));
  });

  test("le sel change le communiqué (série du jour)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) seen.add(communiqueFor("recta:x", d, i).corps);
    expect(seen.size).toBeGreaterThanOrEqual(15);
  });

  test("aucun trou de gabarit ne fuit, élision correcte", () => {
    for (let i = 0; i < 40; i++) {
      const c = communiqueFor("recta:y", d, i);
      expect(c.corps).not.toMatch(/[{}]/);
      expect(c.corps).not.toMatch(/\bde les\b/);
      expect(c.type.length).toBeGreaterThan(0);
      expect(c.devise.length).toBeGreaterThan(0);
    }
  });

  test("numéro administratif : année + jour de l'année + lettre", () => {
    expect(numeroFor(d, 0)).toBe("26-184/A");
    expect(numeroFor(d, 1)).toBe("26-184/B");
  });
});

describe("note vault (lore + Atlas)", () => {
  const { vaultNote, communiqueFor } = require("../src/logic");
  const d = new Date(2026, 6, 3, 10, 0, 0);

  test("frontmatter conforme aux conventions du vault", () => {
    const c = communiqueFor("recta:test", d, 2);
    const note = vaultNote(c, d);
    for (const field of ["name:", "type: communique", "statut: canonique", "epoque: ere-fragmentation", "date_creation: 2026-07-03", "connecte: [cgu-rectitude"]) {
      expect(note.content).toContain(field);
    }
    expect(note.content).toContain(c.corps);
    expect(note.content).toContain(c.devise);
    expect(note.filename).toMatch(/^com-[a-z0-9-]+\.md$/);
  });

  test("les lieux Atlas cités deviennent des relations connecte", () => {
    // Cherche un sel dont le corps cite un lieu référencé.
    for (let i = 0; i < 60; i++) {
      const c = communiqueFor("recta:refs", d, i);
      if (c.refs.length > 0) {
        const note = vaultNote(c, d);
        expect(note.content).toContain(`connecte: [cgu-rectitude, ${c.refs[0]}`);
        return;
      }
    }
    throw new Error("aucun communiqué avec lieu référencé en 60 tirages");
  });
});
