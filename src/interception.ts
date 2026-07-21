// Interception Recta — extraction d'un échange de banter Subwave (deux DJ
// synthétiques qui se répondent) + tracklist du moment, présentée comme un
// signal capté par l'Oraculum sur les fréquences surveillées.
//
// Source : ~/subwave/state/sessions/*.json (un fichier par session de show).
// Chaque message porte { t, role, kind, text, meta }. On cherche une suite
// consécutive de messages kind:"banter" impliquant deux personas différents,
// puis on retrouve le morceau qui jouait à ce moment (le dernier kind:"play"
// avant le début de l'échange) ainsi que les 2-3 morceaux qui ont suivi, pour
// la tracklist.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const SESSIONS_DIR = path.join(os.homedir(), "subwave", "state", "sessions");

export interface InterceptionLine {
  persona: string;
  text: string;
}

export interface TracklistEntry {
  title: string;
  artist: string;
}

export interface Interception {
  showName: string;
  topic: string;
  lines: InterceptionLine[];
  tracklist: TracklistEntry[];
  capturedAt: string; // ISO du début de l'échange
}

interface SessionMessage {
  t: string;
  role: string;
  kind: string;
  text: string;
  meta?: Record<string, unknown>;
}

interface SessionFile {
  show?: { id?: string; name?: string; topic?: string };
  messages?: SessionMessage[];
}

/** Parse "▶ "Titre" by Artiste" en {title, artist} — format exact de Subwave. */
function parsePlayLine(text: string): TracklistEntry | null {
  const m = text.match(/^▶\s+"(.+)"\s+by\s+(.+)$/);
  return m ? { title: m[1], artist: m[2] } : null;
}

/** Cherche la plus longue suite consécutive de banters à 2 personas dans une session. */
function bestExchange(messages: SessionMessage[]): { start: number; end: number; personas: string[] } | null {
  let best: { start: number; end: number; personas: string[] } | null = null;
  let i = 0;
  while (i < messages.length) {
    if (messages[i].kind !== "banter") { i++; continue; }
    const start = i;
    const personas = new Set<string>();
    while (i < messages.length && messages[i].kind === "banter") {
      const name = (messages[i].meta as { personaName?: string } | undefined)?.personaName;
      if (name) personas.add(name);
      i++;
    }
    const end = i;
    // On ne garde que les échanges à VRAIMENT deux voix (le sel du banter).
    if (personas.size >= 2 && (!best || end - start > best.end - best.start)) {
      best = { start, end, personas: [...personas] };
    }
  }
  return best;
}

/** Dernier morceau joué avant l'index donné (kind:"play"). */
function trackBefore(messages: SessionMessage[], idx: number): TracklistEntry | null {
  for (let i = idx - 1; i >= 0; i--) {
    if (messages[i].kind === "play") return parsePlayLine(messages[i].text);
  }
  return null;
}

/** Les N morceaux qui suivent l'index donné (kind:"play"), dans l'ordre. */
function tracksAfter(messages: SessionMessage[], idx: number, n: number): TracklistEntry[] {
  const out: TracklistEntry[] = [];
  for (let i = idx; i < messages.length && out.length < n; i++) {
    if (messages[i].kind === "play") {
      const t = parsePlayLine(messages[i].text);
      if (t) out.push(t);
    }
  }
  return out;
}

/**
 * Trouve la meilleure interception disponible parmi les sessions récentes
 * (les `lookbackDays` derniers jours). Retourne null si aucun banter à deux
 * voix n'est trouvé (rare, mais possible sur des shows solo uniquement).
 */
export function findInterception(lookbackDays = 3): Interception | null {
  if (!fs.existsSync(SESSIONS_DIR)) return null;
  const files = fs.readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(SESSIONS_DIR, f))
    .filter((f) => {
      const age = Date.now() - fs.statSync(f).mtimeMs;
      return age <= lookbackDays * 24 * 3600 * 1000;
    })
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  for (const file of files) {
    let session: SessionFile;
    try {
      session = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      continue;
    }
    const messages = session.messages ?? [];
    const ex = bestExchange(messages);
    if (!ex || ex.end - ex.start < 2) continue;

    const lines: InterceptionLine[] = messages.slice(ex.start, ex.end)
      .filter((m) => m.kind === "banter")
      .map((m) => ({
        persona: ((m.meta as { personaName?: string } | undefined)?.personaName ?? "?").toUpperCase(),
        text: m.text,
      }));

    const before = trackBefore(messages, ex.start);
    const after = tracksAfter(messages, ex.end, 3);
    const tracklist = [before, ...after].filter((t): t is TracklistEntry => !!t)
      .filter((t, i, arr) => arr.findIndex((x) => x.title === t.title) === i) // dédupe
      .slice(0, 4);

    return {
      showName: session.show?.name ?? "?",
      topic: session.show?.topic ?? "",
      lines,
      tracklist,
      capturedAt: messages[ex.start]?.t ?? new Date().toISOString(),
    };
  }
  return null;
}
