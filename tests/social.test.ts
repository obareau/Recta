import { clamp, graphemeLength } from "../src/social/text";
import { langForDate, captionFor, networksFromArgs, type Captions } from "../src/social/broadcast";
import { BSKY_LIMIT } from "../src/social/bluesky";
import { MASTO_LIMIT } from "../src/social/mastodon";
import { communiqueCaptions, tactiqueCaptions, pirateCaptions } from "../src/i18n-captions";
import { communiqueFor } from "../src/logic";
import { resolveTactique } from "../src/tactiques-gen";
import { pirateFor } from "../src/pirate-content";

describe("clamp (limites de caractères)", () => {
  test("laisse intacte une chaîne courte", () => {
    expect(clamp("court", 300)).toBe("court");
  });
  test("tronque à la limite avec ellipsis", () => {
    const long = "mot ".repeat(200);
    const out = clamp(long, BSKY_LIMIT);
    expect(graphemeLength(out)).toBeLessThanOrEqual(BSKY_LIMIT);
    expect(out.endsWith("…")).toBe(true);
  });
  test("ne coupe pas en plein milieu d'un mot quand un espace est proche", () => {
    const src = "alpha bravo charlie delta echo foxtrot";
    const out = clamp(src, 20).replace(/…$/, "");
    // Le dernier mot conservé doit être un mot complet de la source.
    const lastWord = out.trim().split(" ").pop()!;
    expect(src.split(" ")).toContain(lastWord);
  });
});

describe("alternance FR/EN déterministe", () => {
  test("jour pair = FR, impair = EN", () => {
    expect(langForDate(new Date(2026, 6, 4))).toBe("fr");
    expect(langForDate(new Date(2026, 6, 5))).toBe("en");
  });
  test("Facebook reste toujours FR", () => {
    const caps: Captions = { fr: "FR", en: "EN", alt: "a" };
    expect(captionFor("facebook", caps, new Date(2026, 6, 5))).toBe("FR");
    expect(captionFor("bluesky", caps, new Date(2026, 6, 5))).toBe("EN");
    expect(captionFor("bluesky", caps, new Date(2026, 6, 4))).toBe("FR");
  });
});

describe("networksFromArgs", () => {
  test("défaut : les trois", () => {
    expect(networksFromArgs([])).toEqual(["facebook", "bluesky", "mastodon"]);
  });
  test("filtre --net=", () => {
    expect(networksFromArgs(["--net=bluesky,mastodon"])).toEqual(["bluesky", "mastodon"]);
  });
  test("ignore les réseaux inconnus", () => {
    expect(networksFromArgs(["--net=bluesky,twitter"])).toEqual(["bluesky"]);
  });
});

describe("légendes bilingues respectent les limites après composition", () => {
  const d = new Date(2026, 6, 5, 10, 0, 0);
  test("communiqué : EN clampable sans fuite de gabarit", () => {
    for (let i = 0; i < 20; i++) {
      const caps = communiqueCaptions(communiqueFor("recta:soc", d, i));
      for (const s of [caps.fr, caps.en, caps.alt]) expect(s).not.toMatch(/[{}]/);
      expect(graphemeLength(clamp(caps.en, BSKY_LIMIT))).toBeLessThanOrEqual(BSKY_LIMIT);
      expect(clamp(caps.fr, MASTO_LIMIT).length).toBeLessThanOrEqual(MASTO_LIMIT);
    }
  });
  test("tactique : légendes non vides FR + EN", () => {
    for (let i = 0; i < 20; i++) {
      const caps = tactiqueCaptions(resolveTactique(`t:${i}`));
      expect(caps.fr.length).toBeGreaterThan(0);
      expect(caps.en.length).toBeGreaterThan(0);
      expect(caps.en).not.toMatch(/[{}]/);
    }
  });
  test("pirate : EN aligné sur FR (même nombre de lignes), pas de trou", () => {
    for (let i = 0; i < 20; i++) {
      const p = pirateFor(`p:${i}`);
      expect(p.linesEn.length).toBe(p.lines.length);
      const caps = pirateCaptions(p);
      expect(caps.en).toContain(p.signEn);
      expect(caps.en).not.toMatch(/undefined/);
    }
  });
});
