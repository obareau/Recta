import { LANGS, GGR_MENTION, elide, expandLang } from "../src/i18n";
import { microNouvelleFor, uiFor } from "../src/micronouvelle";
import { rngFor } from "../src/rng";

describe("socle i18n", () => {
  test("6 langues, mention GGR non vide pour chacune", () => {
    expect([...LANGS]).toEqual(["fr", "en", "es", "it", "de", "ja"]);
    for (const l of LANGS) {
      expect(GGR_MENTION[l].length).toBeGreaterThan(0);
      // La mention porte bien l'idée « obsolète / non maintenu / erreur ».
      expect(GGR_MENTION[l]).toMatch(/obsol|旧式|保守|error|erreu|errori|veraltet|Fehler/i);
    }
  });
  test("élision française : de+voyelle, de le → du", () => {
    expect(elide("de le calcul", "fr")).toBe("du calcul");
    expect(elide("de les fluxes", "fr")).toBe("des fluxes");
  });
  test("élision à le → au / à les → aux (le \\b avant « à » ne matche pas)", () => {
    expect(elide("remise à le Chronographe", "fr")).toBe("remise au Chronographe");
    expect(elide("remise à les Docks", "fr")).toBe("remise aux Docks");
    // ne casse pas un mot contenant « à » suivi de « le » sans espace intercalé.
    expect(elide("déjà le moment", "fr")).toBe("déjà le moment");
  });
  test("expandLang ne laisse aucun trou et capitalise les slots Majuscules", () => {
    const lex = { mot: ["éveil", "doute"] };
    const out = expandLang("{Mot} contre {mot}", lex, rngFor("s", "d"), "fr");
    expect(out).not.toMatch(/[{}]/);
    expect(out[0]).toBe(out[0].toUpperCase());
  });
});

describe("micro-nouvelles (5 langues)", () => {
  test("déterministe par seed + langue", () => {
    for (const l of LANGS) {
      expect(microNouvelleFor("x", l)).toEqual(microNouvelleFor("x", l));
    }
  });
  test("aucune fuite de gabarit, titre + corps non vides, ticket présent", () => {
    for (const l of LANGS) {
      for (let i = 0; i < 15; i++) {
        const mn = microNouvelleFor(`s${i}`, l);
        expect(mn.body).not.toMatch(/[{}]/);
        expect(mn.title.length).toBeGreaterThan(0);
        expect(mn.body.length).toBeGreaterThan(0);
        expect(mn.ticket).toContain(uiFor(l).ticket);
      }
    }
  });
  test("japonais : pas de particule doublée でで", () => {
    for (let i = 0; i < 30; i++) {
      expect(microNouvelleFor(`ja${i}`, "ja").body).not.toContain("でで");
    }
  });
  test("les langues produisent des textes distincts", () => {
    const bodies = LANGS.map((l) => microNouvelleFor("même-seed", l).body);
    expect(new Set(bodies).size).toBe(LANGS.length);
  });
});
