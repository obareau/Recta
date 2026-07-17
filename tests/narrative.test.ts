import { novaProclamation, stageFor, fractalWord, fractalize, NOVA_STAGES } from "../src/fractal";
import { characterTransmission, CHARACTERS, NOVA7, ORACULUM } from "../src/senders";
import { madnessFor, storyDayFor, actFor, narrativeBeat, senderForDay } from "../src/narrative";
import { rngFor } from "../src/rng";

describe("folie de NOVA-7 (montée narrative)", () => {
  test("la folie croît avec le jour de récit et plafonne à 1", () => {
    const e = "2026-07-01";
    const m0 = madnessFor(new Date("2026-07-01"), e);
    const m50 = madnessFor(new Date("2026-08-20"), e);
    const m200 = madnessFor(new Date("2027-01-17"), e);
    expect(m0).toBeLessThan(m50);
    expect(m50).toBeLessThan(m200);
    expect(m200).toBeLessThanOrEqual(1);
    expect(m0).toBeGreaterThanOrEqual(0);
  });
  test("storyDay ne devient jamais négatif avant l'epoch", () => {
    expect(storyDayFor(new Date("2026-06-01"), "2026-07-01")).toBe(0);
  });
  test("les stades couvrent tout l'intervalle 0..1 dans l'ordre", () => {
    const seen = [0, 0.3, 0.5, 0.8, 0.95].map(stageFor);
    expect(seen).toEqual([...NOVA_STAGES]);
  });
  test("les actes basculent au bon seuil", () => {
    expect(actFor(0.1)).toContain("I");
    expect(actFor(0.5)).toContain("II");
    expect(actFor(0.8)).toContain("III");
  });
});

describe("langage fractal", () => {
  test("mot fractal : profondeur = imbrication (auto-réplication)", () => {
    const shallow = fractalWord(rngFor("x", "a"), 0.9, 0);
    const deep = fractalWord(rngFor("x", "a"), 0.9, 3);
    expect(deep.length).toBeGreaterThan(shallow.length);
    expect(deep).toContain("⟨");
  });
  test("fractalize n'altère rien à folie nulle, contamine à folie haute", () => {
    const t = "La détention des récepteurs est soumise à déclaration.";
    expect(fractalize(t, rngFor("s", "r"), 0)).toBe(t);
    expect(fractalize(t, rngFor("s", "r"), 0.9)).not.toBe(t);
  });
  test("proclamation : déterministe, jamais vide, signature présente", () => {
    for (const m of [0.1, 0.5, 0.97]) {
      const a = novaProclamation("jour-7", m);
      const b = novaProclamation("jour-7", m);
      expect(a).toEqual(b);
      expect(a.body.length).toBeGreaterThan(0);
      expect(a.signature.length).toBeGreaterThan(0);
    }
  });
  test("à l'apothéose, la voix devient première personne divine", () => {
    // Sur plusieurs jours, au moins une proclamation affirme « JE SUIS ».
    const bodies = Array.from({ length: 8 }, (_, i) => novaProclamation(`d${i}`, 0.97).body);
    expect(bodies.some((b) => /JE SUIS/i.test(b))).toBe(true);
  });
});

describe("émetteurs (personnages canon)", () => {
  test("les noms ne sont jamais vides et restent canon", () => {
    for (const s of [ORACULUM, NOVA7, ...CHARACTERS]) {
      expect(s.name.length).toBeGreaterThan(0);
    }
    for (const c of CHARACTERS) {
      expect(c.roles?.fr?.length ?? 0).toBeGreaterThan(0);
    }
    expect(CHARACTERS.map((c) => c.name)).toContain("L1L1TH");
    expect(NOVA7.name).toBe("NOVA-7");
  });
  test("transmission de personnage : corps + devise non vides, sans fuite", () => {
    for (let i = 0; i < 20; i++) {
      const t = characterTransmission(CHARACTERS[i % CHARACTERS.length], `s${i}`, i / 20, "fr");
      expect(t.corps).not.toMatch(/[{}]/);
      expect(t.corps.length).toBeGreaterThan(0);
      expect(t.devise.length).toBeGreaterThan(0);
    }
  });
});

describe("beat narratif (feuilleton)", () => {
  test("déterministe par jour", () => {
    const d = new Date("2026-09-01");
    expect(narrativeBeat(d).communique.corps).toBe(narrativeBeat(d).communique.corps);
  });
  test("NOVA-7 apparaît de plus en plus quand la folie monte", () => {
    // Échantillonne 60 jours à folie basse vs haute : plus de NOVA-7 en haut.
    const count = (mad: number): number => {
      let n = 0;
      for (let i = 0; i < 60; i++) {
        const d = new Date(2026, 8, 1 + i);
        if (senderForDay(d, mad).kind === "nova7") n++;
      }
      return n;
    };
    expect(count(0.9)).toBeGreaterThan(count(0.05));
  });
  test("un beat NOVA-7 porte l'accent violet et référence l'Atlas", () => {
    const beat = narrativeBeat(new Date("2026-09-01"), { forceSender: NOVA7, madness: 0.9 });
    expect(beat.communique.emitter?.accent).toBe("#c07cff");
    expect(beat.communique.refs).toContain("nova-7");
  });
});
