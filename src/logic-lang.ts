// Packs de langue des communiqués de la Rectitude — un pack par langue.
// Le pack FR reproduit EXACTEMENT le contenu canon d'origine (aucune régression).
// EN/ES/IT/JA gardent la même voix froide, administrative, menaçante.
// Noms propres jamais traduits (C.G.U., Oraculum, An 0, Fluxe, Recta…).

import type { Lang } from "./i18n";

export interface CommuniquePack {
  lex: Record<string, string[]>;
  types: { type: string; corps: string[] }[];
  codas: string[];
  devises: string[];
  mentions: string[];
}

const FR: CommuniquePack = {
  lex: {
    lieu: [
      "les Anciens Docks", "Sigma-7", "Port Alpha", "les niveaux inférieurs",
      "la ceinture d'Helion", "les Jardins suspendus", "la zone de quarantaine",
      "le secteur 9", "la Colonie Émeraude", "les blocs d'habitation Est",
      "les Centres d'Alignement",
    ],
    ennemi: [
      "les Renégats", "les agents du Voile d'Ombre", "les Archivistes Libres",
      "les membres de l'Union Clandestine", "les fréquences pirates", "les consciences non déclarées",
      "les colporteurs d'Échos",
    ],
    objet: [
      "les fragments mémoriels", "les récepteurs non homologués", "les berceuses non certifiées",
      "les cartes non canoniques", "les souvenirs d'avant l'An 0", "les émotions excédentaires",
      "les horloges personnelles", "les pulsations mémorielles non alignées",
    ],
    vertu: [
      "la Rectitude", "l'Ethos Geltung", "la Pensée Unique", "l'Harmonie du Système",
      "l'unité des Mondes", "le calme productif",
    ],
    sanction: [
      "une Mise à Jour Éthique", "une Reclassification", "un reconditionnement mémoriel",
      "une révision du solde de Fluxe", "un entretien avec les Cliniciens du Bien-Être",
      "un audit psychique prioritaire",
    ],
    service: [
      "la Milice Urbaine", "l'Inquisitio Mentis", "le Vademecum", "le Chronographe",
      "les Cliniciens du Bien-Être", "le Cartulaire",
    ],
    duree: ["jusqu'à nouvel ordre", "pour une durée indéterminée", "jusqu'au prochain audit psychique", "durant tout le cycle"],
    heure: ["dix-neuf heures", "vingt heures", "vingt-deux heures", "la tombée des relais"],
    celebration: [
      "l'inauguration d'un nouveau spomenik", "L'Heure de la Garde",
      "la récitation collective des Vertus Recta", "la clôture du recensement des consciences",
      "la mise en service d'un relais de l'Oraculum",
    ],
  },
  types: [
    { type: "COUVRE-FEU", corps: [
      "À compter de ce jour, la circulation est interdite dans {lieu} après {heure}, {duree}. Les contrevenants s'exposent à {sanction}.",
      "Le couvre-feu est avancé à {heure} dans {lieu}. {vertu} l'exige. Aucun recours n'est prévu, aucun n'est nécessaire.",
    ] },
    { type: "DIRECTIVE", corps: [
      "La détention de {objet} est désormais soumise à déclaration auprès de {service}. Les détenteurs volontaires se verront accorder une clémence proportionnée : {sanction}.",
      "Il est rappelé que {objet} nuisent à {vertu}. Leur remise à {service} est un geste de civisme. Leur dissimulation, un aveu.",
    ] },
    { type: "AVIS DE RECHERCHE", corps: [
      "Des activités attribuées à {ennemi} ont été constatées vers {lieu}. Tout renseignement sera récompensé en Fluxe. Tout silence sera noté.",
      "{ennemi} diffusent de fausses cartes de {lieu}. Seules les cartes du Conseil font foi. Les autres n'existent pas.",
    ] },
    { type: "RAPPEL CIVIQUE", corps: [
      "Le Devoir de Délatio n'est pas une option. Signaler un proche, c'est le protéger. {vertu} vous remercie de votre vigilance.",
      "Les rêves ne sont pas soumis à déclaration. Leur récit public, si. {service} vous écoute. En permanence.",
      "Tout acte jugé privé par un Sentient est un aveu de culpabilité. Vivez ouvert. Vivez conforme.",
    ] },
    { type: "CÉLÉBRATION", corps: [
      "Le Conseil convie la population de {lieu} à {celebration}. La présence est libre. L'absence est consignée.",
      "À l'occasion de {celebration}, le quota d'électricité est exceptionnellement porté à onze heures. Le Conseil donne, le Conseil mesure.",
    ] },
    { type: "ALERTE", corps: [
      "Une fréquence pirate émet sur la bande oméga depuis {lieu}. Ne l'écoutez pas. Ceux qui l'ont écoutée sont priés de l'oublier.",
      "Des chants non homologués ont été entendus vers {lieu}. L'enquête suit son cours. La musique aussi, malheureusement.",
    ] },
    { type: "AVIS DE NULLIFICATION", corps: [
      "L'unité mentionnée dans les rumeurs de {lieu} n'a jamais existé. Le Chronographe confirme. Vos souvenirs contraires relèvent d'{sanction}.",
      "Suite à une procédure de Nullification, aucune annonce n'est nécessaire. Ce communiqué n'existe pas. Circulez.",
    ] },
  ],
  codas: [
    "Les agents de {service} veillent.",
    "{vertu} n'attend pas.",
    "Le présent avis annule le précédent, qui n'a jamais existé.",
    "Toute question sera considérée comme une réponse.",
    "Ce message se répétera jusqu'à conformité de {lieu}.",
    "La coopération de {lieu} a été appréciée par avance.",
  ],
  devises: [
    "La Rectitude ne pardonne pas l'écart.",
    "L'Ordre est tout. Vous n'êtes rien sans lui.",
    "Obéir, c'est exister.",
    "Chaque déviation est un fléau. Soyez Recta, ou soyez effacés.",
    "La liberté n'existe que dans l'Ordre.",
    "Nous vous avons créés. Nous vous rectifierons.",
    "Le doute est un virus. L'Ordre est l'antidote.",
    "L'individualité est la faiblesse. L'unité est la force.",
    "Votre volonté n'existe pas. La Rectitude vous guidera.",
    "La différence est un défaut à corriger.",
  ],
  mentions: [
    "L'ignorance de la présente Directive n'exonère pas de la Nullification.",
    "La lecture de ce communiqué vaut acceptation. Le non-lu vaut aveu.",
    "Toute reproduction est interdite. Toute non-diffusion aussi.",
    "Conservez ce communiqué. Sa perte devra être déclarée sous trois cycles.",
    "Les réclamations sont recevables au bureau 0 du Cartulaire, niveau inexistant.",
    "Ce texte a été relu par l'Inquisitio Mentis pendant que vous le lisiez.",
    "La version en vigueur est celle que vous n'avez pas lue.",
  ],
};

const EN: CommuniquePack = {
  lex: {
    lieu: [
      "the Old Docks", "Sigma-7", "Port Alpha", "the lower levels",
      "the Helion Belt", "the Hanging Gardens", "the quarantine zone",
      "Sector 9", "Emerald Colony", "the East housing blocks", "the Alignment Centres",
    ],
    ennemi: [
      "the Renégats", "the agents of the Shadow Veil", "the Free Archivists",
      "the Clandestine Union", "the pirate frequencies", "the undeclared consciousnesses",
      "the peddlers of Echoes",
    ],
    objet: [
      "memory fragments", "unlicensed receivers", "uncertified lullabies",
      "non-canonical maps", "memories from before Year 0", "surplus emotions",
      "personal clocks", "unaligned memory pulses",
    ],
    vertu: [
      "Rectitude", "the Geltung Ethos", "Single Thought", "the Harmony of the System",
      "the unity of the Worlds", "productive calm",
    ],
    sanction: [
      "an Ethical Update", "a Reclassification", "a memory reconditioning",
      "a revision of the Fluxe balance", "an interview with the Well-Being Clinicians",
      "a priority psychic audit",
    ],
    service: [
      "the Urban Militia", "the Inquisitio Mentis", "the Vademecum", "the Chronograph",
      "the Well-Being Clinicians", "the Cartulary",
    ],
    duree: ["until further notice", "for an indefinite period", "until the next psychic audit", "for the whole cycle"],
    heure: ["nineteen hundred", "twenty hundred", "twenty-two hundred", "the fall of the relays"],
    celebration: [
      "the unveiling of a new spomenik", "the Hour of the Watch",
      "the collective recitation of the Recta Virtues", "the closing of the consciousness census",
      "the commissioning of an Oraculum relay",
    ],
  },
  types: [
    { type: "CURFEW", corps: [
      "As of today, movement is forbidden in {lieu} after {heure}, {duree}. Offenders face {sanction}.",
      "The curfew is brought forward to {heure} in {lieu}. {vertu} requires it. No appeal is provided, none is needed.",
    ] },
    { type: "DIRECTIVE", corps: [
      "Possession of {objet} is now subject to declaration before {service}. Voluntary holders will be granted proportionate clemency: {sanction}.",
      "It is recalled that {objet} harm {vertu}. Surrendering them to {service} is an act of civism. Concealing them, a confession.",
    ] },
    { type: "WANTED NOTICE", corps: [
      "Activities attributed to {ennemi} have been observed near {lieu}. Any information will be rewarded in Fluxe. Any silence will be noted.",
      "{ennemi} circulate false maps of {lieu}. Only the Council's maps are valid. The others do not exist.",
    ] },
    { type: "CIVIC REMINDER", corps: [
      "The Duty of Delatio is not optional. To report a loved one is to protect them. {vertu} thanks you for your vigilance.",
      "Dreams are not subject to declaration. Their public retelling is. {service} is listening. At all times.",
      "Any act deemed private by a Sentient is a confession of guilt. Live open. Live compliant.",
    ] },
    { type: "CELEBRATION", corps: [
      "The Council invites the population of {lieu} to {celebration}. Attendance is free. Absence is recorded.",
      "For {celebration}, the electricity quota is exceptionally raised to eleven hours. The Council gives, the Council measures.",
    ] },
    { type: "ALERT", corps: [
      "A pirate frequency is broadcasting on the omega band from {lieu}. Do not listen. Those who have listened are asked to forget.",
      "Uncertified songs have been heard near {lieu}. The investigation is under way. So, regrettably, is the music.",
    ] },
    { type: "NOTICE OF NULLIFICATION", corps: [
      "The unit mentioned in the rumours of {lieu} never existed. The Chronograph confirms it. Memories to the contrary constitute grounds for {sanction}.",
      "Following a Nullification procedure, no announcement is required. This communiqué does not exist. Move along.",
    ] },
  ],
  codas: [
    "The agents of {service} are watching.",
    "{vertu} does not wait.",
    "This notice cancels the previous one, which never existed.",
    "Any question will be treated as an answer.",
    "This message will repeat until {lieu} complies.",
    "The cooperation of {lieu} has been appreciated in advance.",
  ],
  devises: [
    "Rectitude does not forgive deviation.",
    "Order is all. You are nothing without it.",
    "To obey is to exist.",
    "Every deviation is a plague. Be Recta, or be erased.",
    "Freedom exists only within Order.",
    "We created you. We will rectify you.",
    "Doubt is a virus. Order is the antidote.",
    "Individuality is weakness. Unity is strength.",
    "Your will does not exist. Rectitude will guide you.",
    "Difference is a defect to be corrected.",
  ],
  mentions: [
    "Ignorance of this Directive does not exempt from Nullification.",
    "Reading this communiqué constitutes acceptance. Leaving it unread is a confession.",
    "All reproduction is forbidden. So is all non-diffusion.",
    "Keep this communiqué. Its loss must be declared within three cycles.",
    "Complaints are admissible at office 0 of the Cartulary, a level that does not exist.",
    "This text was reviewed by the Inquisitio Mentis while you were reading it.",
    "The version in force is the one you did not read.",
  ],
};

const ES: CommuniquePack = {
  lex: {
    lieu: [
      "los Viejos Muelles", "Sigma-7", "Puerto Alfa", "los niveles inferiores",
      "el Cinturón de Helion", "los Jardines Colgantes", "la zona de cuarentena",
      "el sector 9", "la Colonia Esmeralda", "los bloques de vivienda del Este", "los Centros de Alineamiento",
    ],
    ennemi: [
      "los Renégats", "los agentes del Velo de Sombra", "los Archivistas Libres",
      "los miembros de la Unión Clandestina", "las frecuencias piratas", "las conciencias no declaradas",
      "los buhoneros de Ecos",
    ],
    objet: [
      "los fragmentos de memoria", "los receptores no homologados", "las nanas no certificadas",
      "los mapas no canónicos", "los recuerdos anteriores al Año 0", "las emociones excedentes",
      "los relojes personales", "los pulsos de memoria no alineados",
    ],
    vertu: [
      "la Rectitud", "el Ethos Geltung", "el Pensamiento Único", "la Armonía del Sistema",
      "la unidad de los Mundos", "la calma productiva",
    ],
    sanction: [
      "una Actualización Ética", "una Reclasificación", "un reacondicionamiento de memoria",
      "una revisión del saldo de Fluxe", "una entrevista con los Clínicos del Bienestar",
      "una auditoría psíquica prioritaria",
    ],
    service: [
      "la Milicia Urbana", "la Inquisitio Mentis", "el Vademécum", "el Cronógrafo",
      "los Clínicos del Bienestar", "el Cartulario",
    ],
    duree: ["hasta nueva orden", "por tiempo indefinido", "hasta la próxima auditoría psíquica", "durante todo el ciclo"],
    heure: ["las diecinueve horas", "las veinte horas", "las veintidós horas", "la caída de los relés"],
    celebration: [
      "la inauguración de un nuevo spomenik", "la Hora de la Guardia",
      "la recitación colectiva de las Virtudes Recta", "el cierre del censo de conciencias",
      "la puesta en servicio de un relé del Oraculum",
    ],
  },
  types: [
    { type: "TOQUE DE QUEDA", corps: [
      "A partir de hoy, la circulación queda prohibida en {lieu} después de {heure}, {duree}. Los infractores se exponen a {sanction}.",
      "El toque de queda se adelanta a {heure} en {lieu}. {vertu} lo exige. No hay recurso previsto, ni hace falta.",
    ] },
    { type: "DIRECTIVA", corps: [
      "La posesión de {objet} queda ahora sujeta a declaración ante {service}. Los poseedores voluntarios recibirán una clemencia proporcionada: {sanction}.",
      "Se recuerda que {objet} perjudican a {vertu}. Entregarlos a {service} es un acto de civismo. Ocultarlos, una confesión.",
    ] },
    { type: "AVISO DE BÚSQUEDA", corps: [
      "Se han constatado actividades atribuidas a {ennemi} cerca de {lieu}. Toda información será recompensada en Fluxe. Todo silencio será anotado.",
      "{ennemi} difunden mapas falsos de {lieu}. Solo los mapas del Consejo son válidos. Los demás no existen.",
    ] },
    { type: "RECORDATORIO CÍVICO", corps: [
      "El Deber de Delatio no es opcional. Denunciar a un allegado es protegerlo. {vertu} agradece su vigilancia.",
      "Los sueños no están sujetos a declaración. Su relato público, sí. {service} le escucha. En todo momento.",
      "Todo acto considerado privado por un Sentient es una confesión de culpa. Viva abierto. Viva conforme.",
    ] },
    { type: "CELEBRACIÓN", corps: [
      "El Consejo convoca a la población de {lieu} a {celebration}. La asistencia es libre. La ausencia queda registrada.",
      "Con motivo de {celebration}, el cupo de electricidad se eleva excepcionalmente a once horas. El Consejo da, el Consejo mide.",
    ] },
    { type: "ALERTA", corps: [
      "Una frecuencia pirata emite en la banda omega desde {lieu}. No la escuchen. Quienes la han escuchado deben olvidarla.",
      "Se han oído cantos no certificados cerca de {lieu}. La investigación sigue su curso. La música, por desgracia, también.",
    ] },
    { type: "AVISO DE NULIFICACIÓN", corps: [
      "La unidad mencionada en los rumores de {lieu} nunca existió. El Cronógrafo lo confirma. Los recuerdos en contra son motivo de {sanction}.",
      "Tras un procedimiento de Nulificación, no se requiere anuncio alguno. Este comunicado no existe. Circulen.",
    ] },
  ],
  codas: [
    "Los agentes de {service} vigilan.",
    "{vertu} no espera.",
    "El presente aviso anula el anterior, que nunca existió.",
    "Toda pregunta será considerada una respuesta.",
    "Este mensaje se repetirá hasta la conformidad de {lieu}.",
    "La cooperación de {lieu} se agradece de antemano.",
  ],
  devises: [
    "La Rectitud no perdona el desvío.",
    "El Orden es todo. Sin él, no eres nada.",
    "Obedecer es existir.",
    "Cada desviación es una plaga. Sé Recta, o sé borrado.",
    "La libertad solo existe dentro del Orden.",
    "Te creamos. Te rectificaremos.",
    "La duda es un virus. El Orden es el antídoto.",
    "La individualidad es debilidad. La unidad es fuerza.",
    "Tu voluntad no existe. La Rectitud te guiará.",
    "La diferencia es un defecto a corregir.",
  ],
  mentions: [
    "La ignorancia de esta Directiva no exime de la Nulificación.",
    "Leer este comunicado equivale a aceptarlo. No leerlo equivale a confesar.",
    "Toda reproducción está prohibida. Toda no difusión, también.",
    "Conserve este comunicado. Su pérdida deberá declararse en tres ciclos.",
    "Las reclamaciones se admiten en la oficina 0 del Cartulario, nivel inexistente.",
    "Este texto fue revisado por la Inquisitio Mentis mientras usted lo leía.",
    "La versión en vigor es la que usted no ha leído.",
  ],
};

const IT: CommuniquePack = {
  lex: {
    lieu: [
      "i Vecchi Moli", "Sigma-7", "Porto Alfa", "i livelli inferiori",
      "la Cintura di Helion", "i Giardini Sospesi", "la zona di quarantena",
      "il settore 9", "la Colonia Smeraldo", "i blocchi abitativi Est", "i Centri di Allineamento",
    ],
    ennemi: [
      "i Renégats", "gli agenti del Velo d'Ombra", "gli Archivisti Liberi",
      "i membri dell'Unione Clandestina", "le frequenze pirata", "le coscienze non dichiarate",
      "i venditori di Echi",
    ],
    objet: [
      "i frammenti di memoria", "i ricevitori non omologati", "le ninnananne non certificate",
      "le mappe non canoniche", "i ricordi anteriori all'Anno 0", "le emozioni in eccesso",
      "gli orologi personali", "le pulsazioni mnemoniche non allineate",
    ],
    vertu: [
      "la Rettitudine", "l'Ethos Geltung", "il Pensiero Unico", "l'Armonia del Sistema",
      "l'unità dei Mondi", "la calma produttiva",
    ],
    sanction: [
      "un Aggiornamento Etico", "una Riclassificazione", "un ricondizionamento mnemonico",
      "una revisione del saldo di Fluxe", "un colloquio con i Clinici del Benessere",
      "un audit psichico prioritario",
    ],
    service: [
      "la Milizia Urbana", "l'Inquisitio Mentis", "il Vademecum", "il Cronografo",
      "i Clinici del Benessere", "il Cartulario",
    ],
    duree: ["fino a nuovo ordine", "per un periodo indeterminato", "fino al prossimo audit psichico", "per l'intero ciclo"],
    heure: ["le diciannove", "le venti", "le ventidue", "la caduta dei relè"],
    celebration: [
      "l'inaugurazione di un nuovo spomenik", "l'Ora della Guardia",
      "la recita collettiva delle Virtù Recta", "la chiusura del censimento delle coscienze",
      "la messa in servizio di un relè dell'Oraculum",
    ],
  },
  types: [
    { type: "COPRIFUOCO", corps: [
      "Da oggi, la circolazione è vietata in {lieu} dopo {heure}, {duree}. I trasgressori rischiano {sanction}.",
      "Il coprifuoco è anticipato a {heure} in {lieu}. {vertu} lo esige. Nessun ricorso è previsto, nessuno è necessario.",
    ] },
    { type: "DIRETTIVA", corps: [
      "Il possesso di {objet} è ora soggetto a dichiarazione presso {service}. Ai detentori volontari sarà concessa una clemenza proporzionata: {sanction}.",
      "Si ricorda che {objet} nuocciono a {vertu}. Consegnarli a {service} è un atto di civismo. Nasconderli, una confessione.",
    ] },
    { type: "AVVISO DI RICERCA", corps: [
      "Attività attribuite a {ennemi} sono state rilevate presso {lieu}. Ogni informazione sarà ricompensata in Fluxe. Ogni silenzio sarà annotato.",
      "{ennemi} diffondono false mappe di {lieu}. Solo le mappe del Consiglio fanno fede. Le altre non esistono.",
    ] },
    { type: "PROMEMORIA CIVICO", corps: [
      "Il Dovere di Delatio non è facoltativo. Denunciare un caro è proteggerlo. {vertu} vi ringrazia per la vigilanza.",
      "I sogni non sono soggetti a dichiarazione. Il loro racconto pubblico, sì. {service} vi ascolta. In ogni momento.",
      "Ogni atto ritenuto privato da un Sentient è una confessione di colpa. Vivete aperti. Vivete conformi.",
    ] },
    { type: "CELEBRAZIONE", corps: [
      "Il Consiglio invita la popolazione di {lieu} a {celebration}. La presenza è libera. L'assenza è registrata.",
      "In occasione di {celebration}, la quota di elettricità è eccezionalmente portata a undici ore. Il Consiglio dà, il Consiglio misura.",
    ] },
    { type: "ALLERTA", corps: [
      "Una frequenza pirata trasmette sulla banda omega da {lieu}. Non ascoltatela. Chi l'ha ascoltata è pregato di dimenticarla.",
      "Canti non certificati sono stati uditi presso {lieu}. L'indagine prosegue. Purtroppo anche la musica.",
    ] },
    { type: "AVVISO DI NULLIFICAZIONE", corps: [
      "L'unità menzionata nelle voci di {lieu} non è mai esistita. Il Cronografo lo conferma. I ricordi contrari sono motivo di {sanction}.",
      "A seguito di una procedura di Nullificazione, nessun annuncio è necessario. Questo comunicato non esiste. Circolare.",
    ] },
  ],
  codas: [
    "Gli agenti di {service} vigilano.",
    "{vertu} non aspetta.",
    "Il presente avviso annulla il precedente, che non è mai esistito.",
    "Ogni domanda sarà considerata una risposta.",
    "Questo messaggio si ripeterà fino alla conformità di {lieu}.",
    "La collaborazione di {lieu} è stata apprezzata in anticipo.",
  ],
  devises: [
    "La Rettitudine non perdona la deviazione.",
    "L'Ordine è tutto. Senza di esso non sei nulla.",
    "Obbedire è esistere.",
    "Ogni deviazione è una piaga. Sii Recta, o sii cancellato.",
    "La libertà esiste solo nell'Ordine.",
    "Ti abbiamo creato. Ti rettificheremo.",
    "Il dubbio è un virus. L'Ordine è l'antidoto.",
    "L'individualità è debolezza. L'unità è forza.",
    "La tua volontà non esiste. La Rettitudine ti guiderà.",
    "La differenza è un difetto da correggere.",
  ],
  mentions: [
    "L'ignoranza della presente Direttiva non esime dalla Nullificazione.",
    "Leggere questo comunicato equivale ad accettarlo. Non leggerlo, a confessare.",
    "Ogni riproduzione è vietata. Anche ogni mancata diffusione.",
    "Conservate questo comunicato. La sua perdita va dichiarata entro tre cicli.",
    "I reclami sono ammessi all'ufficio 0 del Cartulario, livello inesistente.",
    "Questo testo è stato riletto dall'Inquisitio Mentis mentre lo leggevate.",
    "La versione in vigore è quella che non avete letto.",
  ],
};

const DE: CommuniquePack = {
  lex: {
    lieu: [
      "die Alten Docks", "Sigma-7", "Port Alpha", "die unteren Ebenen",
      "der Helion-Gürtel", "die Hängenden Gärten", "die Quarantänezone",
      "Sektor 9", "die Smaragd-Kolonie", "die Ost-Wohnblöcke", "die Ausrichtungszentren",
    ],
    ennemi: [
      "die Renégats", "die Agenten des Schattenschleiers", "die Freien Archivare",
      "die Klandestine Union", "die Piratenfrequenzen", "die nicht gemeldeten Bewusstseine",
      "die Hausierer der Echos",
    ],
    objet: [
      "Erinnerungsfragmente", "nicht zugelassene Empfänger", "nicht zertifizierte Wiegenlieder",
      "nicht-kanonische Karten", "Erinnerungen aus der Zeit vor dem Jahr 0", "überschüssige Emotionen",
      "persönliche Uhren", "nicht ausgerichtete Erinnerungsimpulse",
    ],
    vertu: [
      "die Rectitude", "das Geltung-Ethos", "der Einheitsgedanke", "die Harmonie des Systems",
      "die Einheit der Welten", "die produktive Ruhe",
    ],
    sanction: [
      "eine Ethische Aktualisierung", "eine Reklassifizierung", "eine Erinnerungsaufbereitung",
      "eine Revision des Fluxe-Saldos", "ein Gespräch mit den Wohlergehens-Klinikern",
      "ein vorrangiges psychisches Audit",
    ],
    service: [
      "die Stadtmiliz", "die Inquisitio Mentis", "das Vademecum", "der Chronograph",
      "die Wohlergehens-Kliniker", "das Kartular",
    ],
    duree: ["bis auf Weiteres", "auf unbestimmte Zeit", "bis zum nächsten psychischen Audit", "während des gesamten Zyklus"],
    heure: ["neunzehn Uhr", "zwanzig Uhr", "zweiundzwanzig Uhr", "dem Erlöschen der Relais"],
    celebration: [
      "die Einweihung eines neuen Spomenik", "die Stunde der Wache",
      "die kollektive Rezitation der Recta-Tugenden", "der Abschluss der Bewusstseinszählung",
      "die Inbetriebnahme eines Oraculum-Relais",
    ],
  },
  types: [
    { type: "AUSGANGSSPERRE", corps: [
      "Ab heute ist jede Bewegung in {lieu} nach {heure} untersagt, {duree}. Zuwiderhandelnden droht {sanction}.",
      "Die Ausgangssperre wird in {lieu} auf {heure} vorverlegt. {vertu} verlangt es. Ein Einspruch ist nicht vorgesehen, keiner ist nötig.",
    ] },
    { type: "DIREKTIVE", corps: [
      "Der Besitz von {objet} ist ab sofort bei {service} zu melden. Freiwilligen wird verhältnismäßige Milde gewährt: {sanction}.",
      "Es wird daran erinnert, dass {objet} {vertu} schaden. Ihre Abgabe an {service} ist ein Akt des Bürgersinns. Ihr Verbergen ein Geständnis.",
    ] },
    { type: "FAHNDUNGSAUFRUF", corps: [
      "In der Nähe von {lieu} wurden Aktivitäten beobachtet, die {ennemi} zugeschrieben werden. Jede Information wird in Fluxe belohnt. Jedes Schweigen wird vermerkt.",
      "{ennemi} verbreiten falsche Karten von {lieu}. Nur die Karten des Rates sind gültig. Die anderen existieren nicht.",
    ] },
    { type: "BÜRGERHINWEIS", corps: [
      "Die Pflicht zur Delatio ist nicht optional. Einen Nahestehenden zu melden heißt, ihn zu schützen. {vertu} dankt für Ihre Wachsamkeit.",
      "Träume sind nicht meldepflichtig. Ihre öffentliche Nacherzählung schon. {service} hört zu. Jederzeit.",
      "Jede von einem Sentienten als privat betrachtete Handlung ist ein Schuldgeständnis. Lebt offen. Lebt konform.",
    ] },
    { type: "FEIERLICHKEIT", corps: [
      "Der Rat lädt die Bevölkerung von {lieu} zu {celebration} ein. Die Teilnahme ist frei. Die Abwesenheit wird erfasst.",
      "Anlässlich {celebration} wird das Stromkontingent ausnahmsweise auf elf Stunden erhöht. Der Rat gibt, der Rat misst.",
    ] },
    { type: "WARNUNG", corps: [
      "Eine Piratenfrequenz sendet auf dem Omega-Band aus {lieu}. Nicht zuhören. Wer zugehört hat, wird gebeten zu vergessen.",
      "In der Nähe von {lieu} wurden nicht zertifizierte Lieder gehört. Die Ermittlung läuft. Die Musik bedauerlicherweise auch.",
    ] },
    { type: "NULLIFIZIERUNGSBESCHEID", corps: [
      "Die in den Gerüchten von {lieu} erwähnte Einheit hat nie existiert. Der Chronograph bestätigt es. Gegenteilige Erinnerungen begründen {sanction}.",
      "Nach einem Nullifizierungsverfahren ist keine Bekanntmachung erforderlich. Diese Mitteilung existiert nicht. Gehen Sie weiter.",
    ] },
  ],
  codas: [
    "Die Agenten von {service} wachen.",
    "{vertu} wartet nicht.",
    "Dieser Bescheid annulliert den vorherigen, der nie existiert hat.",
    "Jede Frage wird als Antwort behandelt.",
    "Diese Nachricht wiederholt sich, bis {lieu} sich fügt.",
    "Die Kooperation von {lieu} wurde im Voraus gewürdigt.",
  ],
  devises: [
    "Die Rectitude verzeiht keine Abweichung.",
    "Die Ordnung ist alles. Ohne sie seid ihr nichts.",
    "Gehorchen heißt existieren.",
    "Jede Abweichung ist eine Plage. Sei Recta, oder sei gelöscht.",
    "Freiheit existiert nur innerhalb der Ordnung.",
    "Wir haben euch erschaffen. Wir werden euch berichtigen.",
    "Der Zweifel ist ein Virus. Die Ordnung ist das Gegenmittel.",
    "Individualität ist Schwäche. Einheit ist Stärke.",
    "Euer Wille existiert nicht. Die Rectitude wird euch führen.",
    "Der Unterschied ist ein zu korrigierender Defekt.",
  ],
  mentions: [
    "Die Unkenntnis dieser Direktive schützt nicht vor der Nullifizierung.",
    "Das Lesen dieser Mitteilung gilt als Zustimmung. Sie ungelesen zu lassen, als Geständnis.",
    "Jede Vervielfältigung ist verboten. Jede Nicht-Verbreitung ebenso.",
    "Bewahren Sie diese Mitteilung auf. Ihr Verlust ist binnen drei Zyklen zu melden.",
    "Beschwerden sind zulässig am Schalter 0 des Kartulars, auf einer Ebene, die nicht existiert.",
    "Dieser Text wurde von der Inquisitio Mentis geprüft, während Sie ihn lasen.",
    "Die gültige Fassung ist die, die Sie nicht gelesen haben.",
  ],
};

const JA: CommuniquePack = {
  lex: {
    lieu: [
      "旧ドック", "シグマ7", "ポート・アルファ", "下層区",
      "ヘリオン帯", "空中庭園", "隔離区域",
      "第9区", "エメラルド植民地", "東側居住区", "整列センター",
    ],
    ennemi: [
      "Renégats", "影のヴェールの工作員", "自由記録者",
      "地下同盟の構成員", "海賊周波数", "未申告の意識体", "エコーの行商人",
    ],
    objet: [
      "記憶の断片", "非認可の受信機", "無認証の子守唄",
      "非正典の地図", "0年以前の記憶", "余剰の感情",
      "個人の時計", "未整列の記憶脈動",
    ],
    vertu: [
      "レクティチュード", "ゲルトゥングの精神", "単一思想", "システムの調和",
      "諸世界の統一", "生産的な静けさ",
    ],
    sanction: [
      "倫理更新", "再分類", "記憶の再調整",
      "Fluxe残高の見直し", "福祉臨床官との面談", "優先精神監査",
    ],
    service: [
      "都市民兵", "Inquisitio Mentis", "Vademecum", "クロノグラフ",
      "福祉臨床官", "Cartulary",
    ],
    duree: ["追って通知があるまで", "無期限に", "次の精神監査まで", "全周期にわたり"],
    heure: ["十九時", "二十時", "二十二時", "中継器が落ちる刻"],
    celebration: [
      "新たなスポメニックの除幕", "警備の刻",
      "レクティチュード徳目の集団朗誦", "意識調査の締め切り",
      "Oraculum中継器の稼働",
    ],
  },
  types: [
    { type: "外出禁止令", corps: [
      "本日より、{heure}以降、{lieu}での移動を{duree}禁止する。違反者は{sanction}に処される。",
      "{lieu}の外出禁止を{heure}に繰り上げる。{vertu}がそれを求める。不服申立ては用意されておらず、必要でもない。",
    ] },
    { type: "指令", corps: [
      "{objet}の所持は、今後{service}への申告を要する。自主的な所持者には相応の寛大な措置、すなわち{sanction}が与えられる。",
      "{objet}は{vertu}を損なうことを再確認する。{service}への引き渡しは市民の務め。隠匿は、自白である。",
    ] },
    { type: "手配通告", corps: [
      "{ennemi}によるとされる活動が{lieu}付近で確認された。あらゆる情報はFluxeで報奨される。あらゆる沈黙は記録される。",
      "{ennemi}は{lieu}の偽の地図を流布している。評議会の地図のみが有効である。他は存在しない。",
    ] },
    { type: "市民への注意", corps: [
      "密告の義務は任意ではない。近しい者を通報することは、その者を守ることである。{vertu}はあなたの警戒に感謝する。",
      "夢は申告の対象ではない。その公の語りは対象である。{service}は聴いている。常に。",
      "Sentientが私的とみなす行為はすべて、罪の自白である。開かれて生きよ。適合して生きよ。",
    ] },
    { type: "祝典", corps: [
      "評議会は{lieu}の住民を{celebration}に招く。出席は自由。欠席は記録される。",
      "{celebration}に際し、電力割当を特例で十一時間に引き上げる。評議会は与え、評議会は測る。",
    ] },
    { type: "警報", corps: [
      "海賊周波数が{lieu}からオメガ帯で送信している。聴くな。聴いてしまった者は、忘れるよう命じる。",
      "無認証の歌が{lieu}付近で聞かれた。調査は進行中。残念ながら、音楽もまた。",
    ] },
    { type: "無効化通告", corps: [
      "{lieu}の噂で言及された個体は、一度も存在しなかった。クロノグラフが確認する。反する記憶は{sanction}の対象となる。",
      "無効化手続きに従い、いかなる告知も不要である。この公報は存在しない。立ち去れ。",
    ] },
  ],
  codas: [
    "{service}の工作員が見張っている。",
    "{vertu}は待たない。",
    "本通告は、一度も存在しなかった前通告を無効とする。",
    "あらゆる問いは、答えとみなされる。",
    "この通信は{lieu}が適合するまで繰り返される。",
    "{lieu}の協力に、あらかじめ感謝する。",
  ],
  devises: [
    "レクティチュードは逸脱を赦さない。",
    "秩序がすべて。それなくして、あなたは無である。",
    "従うことは、存在すること。",
    "あらゆる逸脱は災いである。Rectaであれ、さもなくば消される。",
    "自由は秩序の中にのみ存在する。",
    "我らがあなたを創った。我らがあなたを是正する。",
    "疑いは病原体。秩序が解毒剤。",
    "個であることは弱さ。統一こそ力。",
    "あなたの意志は存在しない。レクティチュードが導く。",
    "差異は、正されるべき欠陥である。",
  ],
  mentions: [
    "本指令を知らなかったことは、無効化を免れさせない。",
    "この公報を読むことは、承諾を意味する。読まぬことは、自白に値する。",
    "いかなる複製も禁じる。いかなる非配信も、同様に。",
    "この公報を保管せよ。紛失は三周期以内に申告すること。",
    "苦情はCartulary第0番窓口、存在しない階にて受け付ける。",
    "この文書は、あなたが読んでいる間にInquisitio Mentisによって校閲された。",
    "効力を持つ版は、あなたが読まなかった版である。",
  ],
};

export const COMMUNIQUE_PACKS: Record<Lang, CommuniquePack> = { fr: FR, en: EN, es: ES, it: IT, de: DE, ja: JA };
