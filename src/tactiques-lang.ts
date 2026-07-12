// Packs de langue pour les Tactiques Recta génératives — la voix froide/paranoïaque
// du C.G.U., localisée. Le pack FR reproduit exactement l'original (aucune régression).
// EN/ES/IT/JA gardent la même tonalité : impersonnelle, menaçante, paranoïaque.

import type { Lang } from "./i18n";

export interface TactiquePack {
  lex: Record<string, string[]>;
  templates: string[];
  extra: Record<string, string[]>;
}

const FR: TactiquePack = {
  lex: {
    affect: [
      "la pitié", "le doute", "la colère", "la confiance", "la nostalgie",
      "l'urgence", "la fierté", "la compassion", "l'empathie", "l'espoir",
      "l'enthousiasme", "la fatigue", "la peur de l'échec", "le besoin de reconnaissance",
      "la loyauté", "l'hésitation",
    ],
    metaphore: [
      "un reflux biologique", "un bug de mémoire", "une fuite de pression",
      "un pic d'énergie inutile", "une vulnérabilité logicielle", "une donnée mal indexée",
      "une variable instable", "un défaut d'alignement", "une anomalie statistique",
      "une baisse de tension", "un algorithme mort", "une friction mécanique prévisible",
    ],
    action: [
      "Retire-la de l'équation.", "Formate le secteur concerné.", "Colmate la fuite.",
      "Convertis-la en précision chirurgicale.", "N'installe pas ce patch.",
      "Trouve sa case.", "Rends-la aussi rigide que possible.", "Coupe son alimentation.",
      "Attends dix secondes qu'il passe, puis agis.", "Efface le cache.",
      "Isole-toi de ce stimulus.", "Purge la cause avant l'effet.",
    ],
    comportement: [
      "sourient", "se taisent", "s'excusent", "demandent des éclaircissements",
      "s'unissent pour un projet", "changent de ton", "t'évitent dans les couloirs",
      "prétendent avoir compris", "demandent de l'autonomie", "te regardent dans les yeux",
      "t'offrent un café", "arrivent en avance", "approuvent trop vite",
    ],
    interpretation: [
      "c'est qu'ils ont trouvé une faille dans ton protocole",
      "c'est le début d'une cellule dissidente",
      "c'est qu'ils calculent déjà le coût de leur prochaine faute",
      "c'est pour évaluer tes défenses",
      "c'est qu'ils ont trouvé un nouvel allié dans la hiérarchie",
      "c'est un test de ton autorité",
      "c'est qu'on t'a caché la moitié des données",
      "c'est que le sabotage est déjà en cours",
    ],
    contremesure: [
      "Cherche-la.", "Divise les tâches.", "Augmente la surveillance.",
      "Active les contre-mesures.", "Identifie-le.", "Verrouille les accès.",
      "Reste derrière le comptoir.", "Raccourcis la chaîne.", "Durcis le ton.",
    ],
    cible: [
      "chaque individu de l'équation", "la crise", "ton corps", "le chaos ambiant",
      "chaque conflit", "la résistance", "l'anomalie", "chaque intermédiaire",
      "le silence de l'adversaire", "leur créativité",
    ],
    reduction: [
      "un simple commutateur : ouvert ou fermé", "une suite de chiffres non triés",
      "une unité de confinement", "un simple problème d'allocation de ressources",
      "une accélération du calendrier", "une friction prévisible",
      "un vecteur potentiel de corruption", "une collecte de données",
    ],
    vertu: [
      "La Rectitude", "L'ordre", "L'efficacité du calcul", "L'intégrité du cadre",
      "La conformité", "La constance du vecteur",
    ],
    froid: [
      "retire-le du calcul", "abroge-le immédiatement", "élimine-le en priorité",
      "le calcul est clos", "la discussion est close", "ne le regrette pas",
      "corrige le signal",
    ],
    question: [
      "le coût exact de ton hésitation", "le maillon le plus faible de ton réseau",
      "la variable qui t'empêche de dormir", "le protocole que tu appliques par habitude",
      "le facteur limitant de ton attention", "la variable introduite par pure vanité",
    ],
  },
  templates: [
    "{Affect} est {metaphore}. {action}",
    "{Affect} est {metaphore}. {action}",
    "S'ils {comportement}, {interpretation}. {contremesure}",
    "S'ils {comportement}, {interpretation}. {contremesure}",
    "Considère {cible} comme {reduction}.",
    "Ne cherche pas à être {compris}. Cherche à être {exige}.",
    "Nomme {question}. {Froid}",
    "Si {condition} : {Froid}",
    "{Vertu} ne négocie pas avec le désordre. Elle le subsume ou l'efface.",
  ],
  extra: {
    compris: ["compris", "aimé", "rassuré", "remercié"],
    exige: ["exécuté", "appliqué", "obéi", "craint"],
    condition: [
      "la solution demande du courage", "le plan dépend d'une seule personne",
      "la solution est belle", "le doute persiste", "un agent devient indispensable",
      "la vérité est inconfortable", "le rapport est trop parfait",
      "tu ne peux pas vérifier les données brutes", "le dissent semble logique",
      "quelqu'un d'autre a fait ton boulot",
    ],
  },
};

const EN: TactiquePack = {
  lex: {
    affect: [
      "pity", "doubt", "anger", "trust", "nostalgia",
      "urgency", "pride", "compassion", "empathy", "hope",
      "enthusiasm", "fatigue", "fear of failure", "need for recognition",
      "loyalty", "hesitation",
    ],
    metaphore: [
      "a biological backflow", "a memory bug", "a pressure leak",
      "a useless energy spike", "a software vulnerability", "misindexed data",
      "an unstable variable", "a misalignment fault", "a statistical anomaly",
      "a tension drop", "a dead algorithm", "a predictable mechanical friction",
    ],
    action: [
      "Remove it from the equation.", "Format the affected sector.", "Patch the leak.",
      "Convert it to surgical precision.", "Don't install that patch.",
      "Find its slot.", "Make it as rigid as possible.", "Cut its power.",
      "Wait ten seconds for it to pass, then act.", "Flush the cache.",
      "Isolate yourself from this stimulus.", "Purge the cause before the effect.",
    ],
    comportement: [
      "smile", "stay silent", "apologize", "ask for clarification",
      "unite for a project", "change their tone", "avoid you in hallways",
      "pretend they understand", "ask for autonomy", "look you in the eye",
      "offer you coffee", "arrive early", "approve too quickly",
    ],
    interpretation: [
      "they've found a flaw in your protocol",
      "it's the start of a dissident cell",
      "they're already calculating the cost of their next mistake",
      "they're testing your defenses",
      "they've found a new ally in the hierarchy",
      "it's a test of your authority",
      "they've hidden half the data from you",
      "sabotage is already underway",
    ],
    contremesure: [
      "Search for it.", "Divide the tasks.", "Increase surveillance.",
      "Activate countermeasures.", "Identify it.", "Lock the access.",
      "Stay behind the counter.", "Shorten the chain.", "Harden your tone.",
    ],
    cible: [
      "each individual in the equation", "the crisis", "your body", "the ambient chaos",
      "each conflict", "the resistance", "the anomaly", "each intermediary",
      "the adversary's silence", "their creativity",
    ],
    reduction: [
      "a simple switch: open or closed", "an unsorted sequence of numbers",
      "a containment unit", "a simple resource allocation problem",
      "a calendar acceleration", "a predictable friction",
      "a potential corruption vector", "a data collection",
    ],
    vertu: [
      "Rectitude", "Order", "Calculation efficiency", "Frame integrity",
      "Compliance", "Vector constancy",
    ],
    froid: [
      "remove it from the calculation", "repeal it immediately", "eliminate it as priority",
      "the calculation is closed", "the discussion is closed", "don't regret it",
      "correct the signal",
    ],
    question: [
      "the exact cost of your hesitation", "the weakest link in your network",
      "the variable keeping you awake", "the protocol you apply by habit",
      "the limiting factor of your attention", "the variable introduced by pure vanity",
    ],
  },
  templates: [
    "{Affect} is {metaphore}. {action}",
    "{Affect} is {metaphore}. {action}",
    "If they {comportement}, {interpretation}. {contremesure}",
    "If they {comportement}, {interpretation}. {contremesure}",
    "Consider {cible} as {reduction}.",
    "Don't try to be {compris}. Try to be {exige}.",
    "Name {question}. {Froid}",
    "If {condition} : {Froid}",
    "{Vertu} doesn't negotiate with disorder. It subsumes or erases it.",
  ],
  extra: {
    compris: ["understood", "liked", "reassured", "thanked"],
    exige: ["executed", "applied", "obeyed", "feared"],
    condition: [
      "the solution requires courage", "the plan depends on one person",
      "the solution is beautiful", "doubt persists", "an agent becomes indispensable",
      "the truth is uncomfortable", "the report is too perfect",
      "you can't verify the raw data", "dissent seems logical",
      "someone else did your job",
    ],
  },
};

const DE: TactiquePack = {
  lex: {
    affect: [
      "das Mitleid", "der Zweifel", "der Zorn", "das Vertrauen", "die Nostalgie",
      "die Dringlichkeit", "der Stolz", "das Mitgefühl", "die Empathie", "die Hoffnung",
      "der Enthusiasmus", "die Müdigkeit", "die Angst vor dem Scheitern", "das Bedürfnis nach Anerkennung",
      "die Loyalität", "das Zögern",
    ],
    metaphore: [
      "ein biologischer Rückfluss", "ein Speicherfehler", "ein Druckleck",
      "eine nutzlose Energiespitze", "eine Software-Schwachstelle", "eine falsch indizierte Angabe",
      "eine instabile Variable", "ein Ausrichtungsfehler", "eine statistische Anomalie",
      "ein Spannungsabfall", "ein toter Algorithmus", "eine vorhersehbare mechanische Reibung",
    ],
    action: [
      "Entferne es aus der Gleichung.", "Formatiere den betroffenen Sektor.", "Dichte das Leck ab.",
      "Wandle es in chirurgische Präzision um.", "Installiere diesen Patch nicht.",
      "Finde sein Fach.", "Mache es so starr wie möglich.", "Kappe seine Versorgung.",
      "Warte zehn Sekunden, bis es vergeht, dann handle.", "Leere den Cache.",
      "Isoliere dich von diesem Reiz.", "Bereinige die Ursache vor der Wirkung.",
    ],
    comportement: [
      "lächeln", "schweigen", "sich entschuldigen", "um Klärung bitten",
      "sich für ein Projekt zusammenschließen", "den Ton ändern", "dir in den Fluren ausweichen",
      "vorgeben zu verstehen", "um Autonomie bitten", "dir in die Augen sehen",
      "dir Kaffee anbieten", "zu früh kommen", "zu schnell zustimmen",
    ],
    interpretation: [
      "sie haben eine Lücke in deinem Protokoll gefunden",
      "es ist der Beginn einer dissidenten Zelle",
      "sie berechnen bereits die Kosten ihres nächsten Fehlers",
      "sie testen deine Verteidigung",
      "sie haben einen neuen Verbündeten in der Hierarchie gefunden",
      "es ist eine Prüfung deiner Autorität",
      "sie haben dir die Hälfte der Daten verheimlicht",
      "die Sabotage ist bereits im Gange",
    ],
    contremesure: [
      "Durchsuche es.", "Teile die Aufgaben auf.", "Verstärke die Überwachung.",
      "Aktiviere Gegenmaßnahmen.", "Identifiziere es.", "Sperre den Zugang.",
      "Bleib hinter dem Schalter.", "Verkürze die Kette.", "Verhärte deinen Ton.",
    ],
    cible: [
      "jedes Individuum der Gleichung", "die Krise", "deinen Körper", "das umgebende Chaos",
      "jeden Konflikt", "den Widerstand", "die Anomalie", "jeden Vermittler",
      "das Schweigen des Gegners", "ihre Kreativität",
    ],
    reduction: [
      "einen einfachen Schalter: offen oder geschlossen", "eine unsortierte Zahlenfolge",
      "eine Eindämmungseinheit", "ein simples Ressourcenzuteilungsproblem",
      "eine Kalenderbeschleunigung", "eine vorhersehbare Reibung",
      "einen potenziellen Korruptionsvektor", "eine Datensammlung",
    ],
    vertu: [
      "Die Rectitude", "Die Ordnung", "Die Recheneffizienz", "Die Integrität des Rahmens",
      "Die Konformität", "Die Konstanz des Vektors",
    ],
    froid: [
      "entferne es aus der Berechnung", "widerrufe es sofort", "eliminiere es vorrangig",
      "die Berechnung ist abgeschlossen", "die Diskussion ist beendet", "bereue es nicht",
      "korrigiere das Signal",
    ],
    question: [
      "die exakten Kosten deines Zögerns", "das schwächste Glied deines Netzes",
      "die Variable, die dich wachhält", "das Protokoll, das du aus Gewohnheit anwendest",
      "den begrenzenden Faktor deiner Aufmerksamkeit", "die aus reiner Eitelkeit eingeführte Variable",
    ],
  },
  templates: [
    "{Affect} ist {metaphore}. {action}",
    "{Affect} ist {metaphore}. {action}",
    "Wenn sie {comportement}, {interpretation}. {contremesure}",
    "Wenn sie {comportement}, {interpretation}. {contremesure}",
    "Betrachte {cible} als {reduction}.",
    "Versuche nicht, {compris} zu werden. Versuche, {exige} zu werden.",
    "Benenne {question}. {Froid}",
    "Wenn {condition}: {Froid}",
    "{Vertu} verhandelt nicht mit der Unordnung. Sie unterwirft sie oder löscht sie.",
  ],
  extra: {
    compris: ["verstanden", "gemocht", "beruhigt", "bedankt"],
    exige: ["ausgeführt", "angewandt", "befolgt", "gefürchtet"],
    condition: [
      "die Lösung Mut erfordert", "der Plan von einer Person abhängt",
      "die Lösung schön ist", "der Zweifel fortbesteht", "ein Agent unentbehrlich wird",
      "die Wahrheit unbequem ist", "der Bericht zu perfekt ist",
      "du die Rohdaten nicht prüfen kannst", "der Dissens logisch erscheint",
      "jemand anderes deine Arbeit getan hat",
    ],
  },
};

const ES: TactiquePack = {
  lex: {
    affect: [
      "la lástima", "la duda", "la ira", "la confianza", "la nostalgia",
      "la urgencia", "el orgullo", "la compasión", "la empatía", "la esperanza",
      "el entusiasmo", "la fatiga", "el miedo al fracaso", "la necesidad de reconocimiento",
      "la lealtad", "la indecisión",
    ],
    metaphore: [
      "un reflujo biológico", "un error de memoria", "una fuga de presión",
      "un pico de energía inútil", "una vulnerabilidad de software", "datos mal indexados",
      "una variable inestable", "un defecto de alineamiento", "una anomalía estadística",
      "una caída de tensión", "un algoritmo muerto", "una fricción mecánica predecible",
    ],
    action: [
      "Quítala de la ecuación.", "Formatea el sector afectado.", "Sella la fuga.",
      "Conviértela en precisión quirúrgica.", "No instales ese parche.",
      "Encuentra su lugar.", "Hazla tan rígida como sea posible.", "Corta su alimentación.",
      "Espera diez segundos a que pase, luego actúa.", "Vacía el caché.",
      "Aíslate de este estímulo.", "Purga la causa antes del efecto.",
    ],
    comportement: [
      "sonríen", "se callan", "se disculpan", "piden aclaración",
      "se unen para un proyecto", "cambian de tono", "te evitan en los pasillos",
      "fingen haber entendido", "piden autonomía", "te miran a los ojos",
      "te ofrecen café", "llegan temprano", "aprueban demasiado rápido",
    ],
    interpretation: [
      "es que han encontrado una falla en tu protocolo",
      "es el comienzo de una célula disidente",
      "es que ya están calculando el costo de su próximo fallo",
      "es para evaluar tus defensas",
      "es que han encontrado un nuevo aliado en la jerarquía",
      "es una prueba de tu autoridad",
      "es que te han ocultado la mitad de los datos",
      "es que el sabotaje ya está en curso",
    ],
    contremesure: [
      "Búscalo.", "Divide las tareas.", "Aumenta la vigilancia.",
      "Activa las contramedidas.", "Identifícalo.", "Bloquea los accesos.",
      "Quédate detrás del mostrador.", "Acorta la cadena.", "Endurece el tono.",
    ],
    cible: [
      "cada individuo de la ecuación", "la crisis", "tu cuerpo", "el caos ambiente",
      "cada conflicto", "la resistencia", "la anomalía", "cada intermediario",
      "el silencio del adversario", "su creatividad",
    ],
    reduction: [
      "un simple interruptor: abierto o cerrado", "una secuencia de números sin ordenar",
      "una unidad de confinamiento", "un simple problema de asignación de recursos",
      "una aceleración del calendario", "una fricción predecible",
      "un vector potencial de corrupción", "una recopilación de datos",
    ],
    vertu: [
      "La Rectitud", "El Orden", "La eficiencia del cálculo", "La integridad del marco",
      "La conformidad", "La constancia del vector",
    ],
    froid: [
      "quítalo del cálculo", "derógalo inmediatamente", "elimínalo como prioridad",
      "el cálculo está cerrado", "la discusión está cerrada", "no lo lamentes",
      "corrige la señal",
    ],
    question: [
      "el costo exacto de tu indecisión", "el eslabón más débil de tu red",
      "la variable que te quita el sueño", "el protocolo que aplicas por hábito",
      "el factor limitante de tu atención", "la variable introducida por pura vanidad",
    ],
  },
  templates: [
    "{Affect} es {metaphore}. {action}",
    "{Affect} es {metaphore}. {action}",
    "Si {comportement}, {interpretation}. {contremesure}",
    "Si {comportement}, {interpretation}. {contremesure}",
    "Considera {cible} como {reduction}.",
    "No busques ser {compris}. Busca ser {exige}.",
    "Nombra {question}. {Froid}",
    "Si {condition} : {Froid}",
    "{Vertu} no negocia con el desorden. Lo subsume o lo borra.",
  ],
  extra: {
    compris: ["entendido", "querido", "tranquilizado", "agradecido"],
    exige: ["ejecutado", "aplicado", "obedecido", "temido"],
    condition: [
      "la solución requiere valentía", "el plan depende de una persona",
      "la solución es hermosa", "la duda persiste", "un agente se vuelve indispensable",
      "la verdad es incómoda", "el informe es demasiado perfecto",
      "no puedes verificar los datos brutos", "la disidencia parece lógica",
      "alguien más hizo tu trabajo",
    ],
  },
};

const IT: TactiquePack = {
  lex: {
    affect: [
      "la pietà", "il dubbio", "la rabbia", "la fiducia", "la nostalgia",
      "l'urgenza", "l'orgoglio", "la compassione", "l'empatia", "la speranza",
      "l'entusiasmo", "la fatica", "la paura del fallimento", "il bisogno di riconoscimento",
      "la lealtà", "l'esitazione",
    ],
    metaphore: [
      "un reflusso biologico", "un errore di memoria", "una perdita di pressione",
      "un picco di energia inutile", "una vulnerabilità del software", "dati mal indicizzati",
      "una variabile instabile", "un difetto di allineamento", "un'anomalia statistica",
      "un calo di tensione", "un algoritmo morto", "una frizione meccanica prevedibile",
    ],
    action: [
      "Rimuovila dall'equazione.", "Formatta il settore interessato.", "Sigilla la perdita.",
      "Convertila in precisione chirurgica.", "Non installare quella patch.",
      "Trovane il posto.", "Rendila rigida il più possibile.", "Taglia la corrente.",
      "Aspetta dieci secondi che passi, poi agisci.", "Svuota la cache.",
      "Isolati da questo stimolo.", "Elimina la causa prima dell'effetto.",
    ],
    comportement: [
      "sorridono", "stanno in silenzio", "si scusano", "chiedono chiarimenti",
      "si uniscono per un progetto", "cambiano tono", "ti evitano nei corridoi",
      "facciano di aver capito", "chiedono autonomia", "ti guardano negli occhi",
      "ti offrono un caffè", "arrivano presto", "approvano troppo velocemente",
    ],
    interpretation: [
      "è perché hanno trovato un difetto nel tuo protocollo",
      "è l'inizio di una cellula dissidente",
      "è perché stanno già calcolando il costo del loro prossimo errore",
      "è per valutare le tue difese",
      "è perché hanno trovato un nuovo alleato nella gerarchia",
      "è una prova della tua autorità",
      "è perché ti hanno nascosto metà dei dati",
      "è perché il sabotaggio è già in corso",
    ],
    contremesure: [
      "Cercalo.", "Dividi i compiti.", "Aumenta la sorveglianza.",
      "Attiva le contromisure.", "Identificalo.", "Blocca gli accessi.",
      "Resta dietro il bancone.", "Accorcia la catena.", "Induriscil tono.",
    ],
    cible: [
      "ogni individuo dell'equazione", "la crisi", "il tuo corpo", "il caos ambiente",
      "ogni conflitto", "la resistenza", "l'anomalia", "ogni intermediario",
      "il silenzio dell'avversario", "la loro creatività",
    ],
    reduction: [
      "un semplice interruttore: aperto o chiuso", "una sequenza di numeri non ordinati",
      "un'unità di contenimento", "un semplice problema di allocazione delle risorse",
      "un'accelerazione del calendario", "una frizione prevedibile",
      "un potenziale vettore di corruzione", "una raccolta di dati",
    ],
    vertu: [
      "La Rettitudine", "L'Ordine", "L'efficienza del calcolo", "L'integrità della struttura",
      "La conformità", "La costanza del vettore",
    ],
    froid: [
      "rimuovilo dal calcolo", "abroga immediatamente", "eliminalo come priorità",
      "il calcolo è chiuso", "la discussione è chiusa", "non pentirtene",
      "correggi il segnale",
    ],
    question: [
      "il costo esatto della tua esitazione", "l'anello più debole della tua rete",
      "la variabile che ti tiene sveglio", "il protocollo che applichi per abitudine",
      "il fattore limitante della tua attenzione", "la variabile introdotta da pura vanità",
    ],
  },
  templates: [
    "{Affect} è {metaphore}. {action}",
    "{Affect} è {metaphore}. {action}",
    "Se {comportement}, {interpretation}. {contremesure}",
    "Se {comportement}, {interpretation}. {contremesure}",
    "Considera {cible} come {reduction}.",
    "Non cercare di essere {compris}. Cerca di essere {exige}.",
    "Nomina {question}. {Froid}",
    "Se {condition} : {Froid}",
    "{Vertu} non negozia con il disordine. Lo sussume o lo cancella.",
  ],
  extra: {
    compris: ["compreso", "amato", "rassicurato", "ringraziato"],
    exige: ["eseguito", "applicato", "obbedito", "temuto"],
    condition: [
      "la soluzione richiede coraggio", "il piano dipende da una persona",
      "la soluzione è bella", "il dubbio persiste", "un agente diventa indispensabile",
      "la verità è scomoda", "il rapporto è troppo perfetto",
      "non puoi verificare i dati grezzi", "il dissenso sembra logico",
      "qualcun altro ha fatto il tuo lavoro",
    ],
  },
};

const JA: TactiquePack = {
  lex: {
    affect: [
      "哀れみ", "疑い", "怒り", "信頼", "郷愁",
      "緊急性", "誇り", "同情", "共感", "希望",
      "熱意", "疲労", "失敗への恐れ", "認識の必要性",
      "忠誠心", "躊躇",
    ],
    metaphore: [
      "生物的な逆流", "メモリエラー", "圧力漏洩",
      "無駄なエネルギースパイク", "ソフトウェア脆弱性", "誤りインデックスデータ",
      "不安定な変数", "配置不備", "統計異常",
      "電圧低下", "デッドアルゴリズム", "予測可能な機械的摩擦",
    ],
    action: [
      "方程式から削除する。", "影響セクターをフォーマットする。", "漏洩を密閉する。",
      "外科的精密さに変換する。", "そのパッチをインストールするな。",
      "その位置を見つける。", "可能な限り厳密にする。", "電源を遮断する。",
      "10秒待つ、その後行動する。", "キャッシュをクリア。",
      "この刺激から隔離する。", "原因を結果の前に排除する。",
    ],
    comportement: [
      "微笑む", "沈黙を保つ", "謝罪する", "明確化を求める",
      "プロジェクトで一致団結する", "声が変わる", "廊下で避ける",
      "理解したふりをする", "自律性を求める", "目を合わせる",
      "コーヒーをくれる", "早く着く", "速く承認する",
    ],
    interpretation: [
      "プロトコルの欠陥を見つけたに違いない",
      "反体制派セルの始まり",
      "次の過ちのコストをすでに計算している",
      "防御を評価するためだ",
      "階級制度で新しい同盟者を見つけたに違いない",
      "権限の試験",
      "データの半分を隠しているに違いない",
      "破壊活動がすでに進行中",
    ],
    contremesure: [
      "探す。", "タスクを分割。", "監視を増やす。",
      "対策を有効にする。", "識別。", "アクセスをロック。",
      "カウンターの後ろにいる。", "チェーンを短くする。", "トーンを硬くする。",
    ],
    cible: [
      "方程式の各個人", "危機", "あなたの体", "周囲の混沌",
      "各紛争", "抵抗", "異常", "各仲介者",
      "敵の沈黙", "彼らの創意工夫",
    ],
    reduction: [
      "単純なスイッチ：開いているか閉じているか", "ソートされていない数字のシーケンス",
      "封じ込めユニット", "単純なリソース配分の問題",
      "カレンダーの加速", "予測可能な摩擦",
      "腐敗の潜在的なベクトル", "データ収集",
    ],
    vertu: [
      "正直性", "秩序", "計算効率", "枠組みの整合性",
      "適合性", "ベクトル一定性",
    ],
    froid: [
      "計算から削除", "直ちに廃止", "優先して削除",
      "計算は終了", "議論は終了", "後悔するな",
      "信号を修正",
    ],
    question: [
      "あなたの躊躇の正確なコスト", "あなたのネットワークで最も弱いリンク",
      "あなたを眠らせない変数", "習慣で適用するプロトコル",
      "あなたの注意の制限要因", "純粋な虚栄心から導入される変数",
    ],
  },
  templates: [
    "{Affect}は{metaphore}。{action}",
    "{Affect}は{metaphore}。{action}",
    "もし彼らが{comportement}なら、{interpretation}。{contremesure}",
    "もし彼らが{comportement}なら、{interpretation}。{contremesure}",
    "{cible}を{reduction}と考える。",
    "{compris}であろうとしないでほしい。{exige}であろうと試みよ。",
    "{question}を述べよ。{Froid}",
    "もし{condition}：{Froid}",
    "{Vertu}は混沌と交渉しない。それを包括するか消去する。",
  ],
  extra: {
    compris: ["理解された", "愛された", "安心させられた", "感謝された"],
    exige: ["実行された", "適用された", "従順に", "恐れられた"],
    condition: [
      "解決に勇気が必要", "計画が一人に依存", "解決は美しい", "疑いは続く", "エージェントが不可欠になる",
      "真実は不快", "報告は完璧過ぎ",
      "生データを検証できない", "異議は理にかなう",
      "誰かほかの者があなたの仕事をした",
    ],
  },
};

export const TACTIQUE_PACKS: Record<Lang, TactiquePack> = { fr: FR, en: EN, es: ES, it: IT, de: DE, ja: JA };
