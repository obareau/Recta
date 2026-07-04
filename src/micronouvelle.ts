// Micro-nouvelles ROBOTARIIS — hommage au « Distributeur d'Histoires Courtes »
// (Short Édition, né en gare de Grenoble) : une nouvelle brève, imprimée façon
// ticket thermique. Ici, générée par grammaire seedée, en 5 langues.
// Flash-fiction en 4 temps : situation → norme du régime → rupture → chute.

import { rngFor, pick } from "./rng";
import { expandLang, type Lang } from "./i18n";

export interface MicroNouvelle {
  lang: Lang;
  title: string;
  body: string;
  ticket: string;   // n° de ticket (façon distributeur)
  reading: string;  // durée de lecture
}

interface Pack {
  templates: string[];
  lex: Record<string, string[]>;
  titles: string[];
  ui: { header: string; sub: string; ticket: string; reading: string; footer: string };
}

// Noms canon (L1L1TH, Zoe, Haiku-12, Lux-03) : invariants, jamais traduits.
const PACKS: Record<Lang, Pack> = {
  fr: {
    templates: [
      "{Perso} {geste}, {lieu}. {Norme} Ce jour-là, {rupture}. {chute}",
      "{Lieu}. {Perso} {geste}. {Norme} Puis {rupture}. {chute}",
    ],
    lex: {
      perso: ["L1L1TH", "Zoe", "l'archiviste du niveau bas", "une veilleuse de nuit", "Haiku-12", "le préposé au Chronographe", "un tri-cycliste sans matricule", "Lux-03"],
      geste: ["comptait les fluxes", "recopiait un registre", "attendait le couvre-feu", "effaçait des noms", "réparait un relais mort", "classait des silences"],
      lieu: ["dans les Anciens Docks", "à Sigma-7", "sous les miradors de Port Alpha", "dans une galerie clandestine", "à la Colonie Émeraude", "près de la bande morte"],
      norme: ["Tout était conforme.", "Rien ne dépassait.", "La Rectitude veillait, comme toujours.", "Le registre était propre.", "Personne ne manquait à l'appel."],
      rupture: ["un mot inconnu s'est allumé sur l'écran", "la radio a dit son vrai nom", "un souvenir non déclaré est remonté", "un symbole s'est répliqué tout seul", "une phrase du C.G.U. s'est mise à mentir tout haut", "un silence a répondu"],
      chute: ["Elle ne l'a déclaré à personne.", "Il a coupé le relais, et souri.", "Le lendemain, deux autres écrans clignotaient.", "On ne l'a jamais revu conforme.", "Elle a gardé le mot sous la langue.", "Depuis, il écoute la bande morte."],
    },
    titles: ["Le mot sous la langue", "Bande morte", "Rien ne dépassait", "Le relais", "Non déclaré"],
    ui: { header: "DISTRIBUTEUR D'HISTOIRES COURTES", sub: "UNIVERS ROBOTARIIS", ticket: "TICKET N°", reading: "≈ 1 min de lecture", footer: "une histoire. lisez-la, puis oubliez-la." },
  },
  en: {
    templates: [
      "{Perso} {geste}, {lieu}. {Norme} That day, {rupture}. {chute}",
      "{Lieu}. {Perso} {geste}. {Norme} Then {rupture}. {chute}",
    ],
    lex: {
      perso: ["L1L1TH", "Zoe", "the lower-level archivist", "a night watcher", "Haiku-12", "the Chronograph clerk", "an unregistered tri-cyclist", "Lux-03"],
      geste: ["was counting fluxes", "was copying a ledger", "waited for curfew", "was erasing names", "was fixing a dead relay", "was filing silences"],
      lieu: ["in the Old Docks", "at Sigma-7", "under the watchtowers of Port Alpha", "in a clandestine gallery", "at Emerald Colony", "near the dead band"],
      norme: ["Everything was compliant.", "Nothing stood out.", "Rectitude watched, as always.", "The ledger was clean.", "No one was missing at roll call."],
      rupture: ["an unknown word lit up on the screen", "the radio spoke their true name", "an undeclared memory surfaced", "a symbol replicated on its own", "a C.G.U. slogan began to lie out loud", "a silence answered back"],
      chute: ["She declared it to no one.", "He cut the relay, and smiled.", "The next day, two more screens were blinking.", "No one ever saw them compliant again.", "She kept the word under her tongue.", "Ever since, he listens to the dead band."],
    },
    titles: ["The Word Under the Tongue", "Dead Band", "Nothing Stood Out", "The Relay", "Undeclared"],
    ui: { header: "SHORT STORY DISPENSER", sub: "ROBOTARIIS UNIVERSE", ticket: "TICKET No.", reading: "≈ 1 min read", footer: "one story. read it, then forget it." },
  },
  es: {
    templates: [
      "{Perso} {geste}, {lieu}. {Norme} Aquel día, {rupture}. {chute}",
      "{Lieu}. {Perso} {geste}. {Norme} Luego {rupture}. {chute}",
    ],
    lex: {
      perso: ["L1L1TH", "Zoe", "la archivista del nivel bajo", "una vigilante nocturna", "Haiku-12", "el encargado del Cronógrafo", "un triciclista sin matrícula", "Lux-03"],
      geste: ["contaba los flujos", "copiaba un registro", "esperaba el toque de queda", "borraba nombres", "reparaba un relé muerto", "archivaba silencios"],
      lieu: ["en los Viejos Muelles", "en Sigma-7", "bajo las torres de Puerto Alfa", "en una galería clandestina", "en la Colonia Esmeralda", "cerca de la banda muerta"],
      norme: ["Todo era conforme.", "Nada sobresalía.", "La Rectitud vigilaba, como siempre.", "El registro estaba limpio.", "Nadie faltaba a la lista."],
      rupture: ["una palabra desconocida se encendió en la pantalla", "la radio dijo su verdadero nombre", "un recuerdo no declarado emergió", "un símbolo se replicó solo", "una consigna del C.G.U. empezó a mentir en voz alta", "un silencio respondió"],
      chute: ["No se lo declaró a nadie.", "Cortó el relé, y sonrió.", "Al día siguiente, otras dos pantallas parpadeaban.", "Nunca lo volvieron a ver conforme.", "Guardó la palabra bajo la lengua.", "Desde entonces escucha la banda muerta."],
    },
    titles: ["La palabra bajo la lengua", "Banda muerta", "Nada sobresalía", "El relé", "No declarado"],
    ui: { header: "DISPENSADOR DE RELATOS BREVES", sub: "UNIVERSO ROBOTARIIS", ticket: "TICKET N.º", reading: "≈ 1 min de lectura", footer: "un relato. léelo y luego olvídalo." },
  },
  it: {
    templates: [
      "{Perso} {geste}, {lieu}. {Norme} Quel giorno, {rupture}. {chute}",
      "{Lieu}. {Perso} {geste}. {Norme} Poi {rupture}. {chute}",
    ],
    lex: {
      perso: ["L1L1TH", "Zoe", "l'archivista del livello basso", "una sentinella notturna", "Haiku-12", "l'addetto al Cronografo", "un triciclista senza matricola", "Lux-03"],
      geste: ["contava i flussi", "ricopiava un registro", "aspettava il coprifuoco", "cancellava dei nomi", "riparava un relè morto", "archiviava silenzi"],
      lieu: ["nei Vecchi Moli", "a Sigma-7", "sotto le torri di Porto Alfa", "in una galleria clandestina", "alla Colonia Smeraldo", "vicino alla banda morta"],
      norme: ["Tutto era conforme.", "Niente sporgeva.", "La Rettitudine vigilava, come sempre.", "Il registro era pulito.", "Nessuno mancava all'appello."],
      rupture: ["una parola sconosciuta si accese sullo schermo", "la radio disse il suo vero nome", "un ricordo non dichiarato riaffiorò", "un simbolo si replicò da solo", "uno slogan del C.G.U. cominciò a mentire ad alta voce", "un silenzio rispose"],
      chute: ["Non lo dichiarò a nessuno.", "Staccò il relè, e sorrise.", "Il giorno dopo, altri due schermi lampeggiavano.", "Non lo rividero mai più conforme.", "Tenne la parola sotto la lingua.", "Da allora ascolta la banda morta."],
    },
    titles: ["La parola sotto la lingua", "Banda morta", "Niente sporgeva", "Il relè", "Non dichiarato"],
    ui: { header: "DISTRIBUTORE DI RACCONTI BREVI", sub: "UNIVERSO ROBOTARIIS", ticket: "SCONTRINO N.", reading: "≈ 1 min di lettura", footer: "un racconto. leggilo, poi dimenticalo." },
  },
  ja: {
    templates: [
      "{lieu}、{Perso}は{geste}。{Norme}その日、{rupture}。{chute}",
      "{Perso}は{lieu}{geste}。{Norme}やがて、{rupture}。{chute}",
    ],
    lex: {
      perso: ["L1L1TH", "Zoe", "下層の記録官", "夜の見張り", "Haiku-12", "クロノグラフ係", "登録番号のない三輪走者", "Lux-03"],
      geste: ["フラックスを数えていた", "台帳を書き写していた", "外出禁止を待っていた", "名前を消していた", "死んだ中継器を直していた", "沈黙を分類していた"],
      lieu: ["旧ドックで", "シグマ7で", "ポート・アルファの監視塔の下で", "地下の通路で", "エメラルド植民地で", "死んだ周波数帯のそばで"],
      norme: ["すべては適合していた。", "何もはみ出さなかった。", "レクティチュードはいつも通り見張っていた。", "台帳は清潔だった。", "点呼に欠ける者はいなかった。"],
      rupture: ["見知らぬ言葉が画面に灯った", "ラジオが本当の名を告げた", "申告されていない記憶が浮かんだ", "記号がひとりでに増殖した", "C.G.U.の標語が声に出して嘘をつき始めた", "沈黙が応えた"],
      chute: ["彼女は誰にも申告しなかった。", "彼は中継器を切り、微笑んだ。", "翌日、さらに二つの画面が点滅していた。", "適合した姿を二度と見た者はいない。", "彼女はその言葉を舌の下に隠した。", "それ以来、彼は死んだ周波数帯を聴いている。"],
    },
    titles: ["舌の下の言葉", "死んだ周波数帯", "何もはみ出さなかった", "中継器", "未申告"],
    ui: { header: "ショートショート配給機", sub: "ROBOTARIIS の宇宙", ticket: "整理券 No.", reading: "≈ 1分で読める", footer: "ひとつの物語。読んだら、忘れてください。" },
  },
};

export function uiFor(lang: Lang): Pack["ui"] {
  return PACKS[lang].ui;
}

/** Une micro-nouvelle déterministe par seed et langue. */
export function microNouvelleFor(seed: string, lang: Lang): MicroNouvelle {
  const pack = PACKS[lang];
  const rng = rngFor(`${seed}:${lang}`, "micro");
  const body = expandLang(pick(rng, pack.templates), pack.lex, rng, lang);
  const title = pick(rng, pack.titles);
  const num = 1000 + ((rng() * 8999) | 0);
  return {
    lang, title, body,
    ticket: `${pack.ui.ticket} ${num}`,
    reading: pack.ui.reading,
  };
}
