/**
 * Alle Texte der Oberfläche an einer Stelle (Deutsch, Schweiz). Fragen und
 * Antworten: de-CH-fragen.ts, Regeln: de-CH-regeln.ts, Rechtliches:
 * de-CH-rechtliches.ts. Eine weitere Sprache bekommt dieselben Dateien.
 */
export const RECHTSSTAND = '11.10.2026';
export const QUELLCODE = 'https://github.com/AdamBaranyi/ki-inventar';

export const TEXTE = {
  app: {
    name: 'KI-Inventar',
    zusatz: 'für Schweizer KMU',
    zumInhalt: 'Zum Inhalt springen',
    navigation: 'Hauptnavigation',
    nav: {
      uebersicht: 'Übersicht',
      pruefpunkte: 'Prüfpunkte',
      fristen: 'Fristen',
      verzeichnis: 'Verzeichnis',
      daten: 'Daten sichern',
      mehr: 'Mehr',
    },
    offenZahl: 'offen',
    lokal: 'Alles bleibt in diesem Browser: kein Konto, kein Server.',
    keineRechtsberatung:
      'Keine Rechtsberatung. Das KI-Inventar übersetzt deine Angaben in Prüfpunkte; verbindlich sind der Gesetzestext und eine Fachberatung.',
    rechtsstand: `Rechtsstand geprüft am ${RECHTSSTAND}.`,
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    quellcode: 'Quellcode',
  },
  titel: {
    uebersicht: 'KI-Inventar für Schweizer KMU',
    neu: 'Werkzeug erfassen',
    bearbeiten: 'Werkzeug bearbeiten',
    karte: 'Werkzeug',
    pruefpunkte: 'Prüfpunkte',
    fristen: 'Fristen',
    verzeichnis: 'Verzeichnis',
    daten: 'Daten sichern',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    mehr: 'Mehr',
    nichtGefunden: 'Seite nicht gefunden',
  },
  uebersicht: {
    titel: 'KI-Werkzeuge',
    einleitung:
      'Erfasse jedes KI-Werkzeug, das in deiner Firma genutzt wird, mit zehn Fragen. Daraus entstehen Prüfpunkte mit Grund und Gesetzesstelle, nach DSG und EU-KI-Verordnung.',
    lokal: 'Alles bleibt in diesem Browser: kein Konto, kein Server, keine Übermittlung.',
    untertitel: (werkzeuge: number, personendaten: number) => {
      const anzahl = werkzeuge === 1 ? '1 Werkzeug' : `${werkzeuge} Werkzeuge`;
      if (personendaten === 0) return `${anzahl}, keines mit Personendaten`;
      if (personendaten === werkzeuge) return `${anzahl}, ${werkzeuge === 1 ? 'mit' : 'alle mit'} Personendaten`;
      return `${anzahl}, ${personendaten} davon mit Personendaten`;
    },
    erfassen: 'Werkzeug erfassen',
    sichern: 'Sichern',
    naechstes: 'Als Nächstes',
    fristen: 'Fristen',
    alleFristen: 'Alle Fristen',
    heute: 'Heute',
    schritteTitel: 'So geht es',
    schritte: [
      ['Werkzeug erfassen', 'Zehn Fragen, etwa fünf Minuten je Werkzeug.'],
      ['Prüfpunkte abarbeiten', 'Jeder Punkt nennt Grund und Gesetzesstelle.'],
      ['Verzeichnis drucken', 'Oder als Datei sichern, für Excel oder als PDF.'],
    ],
    beispiel: 'Beispiel laden',
    beispielHinweis: 'Das Beispiel zeigt eine erfundene Treuhandfirma mit sieben Werkzeugen.',
    liste: 'Werkzeuge',
    leer: 'Noch kein Werkzeug erfasst.',
    stopp: 'Einsatz stoppen',
    offenPille: (n: number) => `${n} offen`,
    alleErledigt: 'erledigt',
    fehlend: (n: number) => (n === 1 ? '1 Antwort offen' : `${n} Antworten offen`),
    standort: {
      ch: 'Schweiz',
      eu: 'EU',
      usa: 'USA',
      andere: 'anderes Land',
      unbekannt: 'Standort unbekannt',
    },
  },
  fortschritt: {
    vonGesamt: (gesamt: number) => `von ${gesamt} Prüfpunkten erledigt`,
    vonKurz: (gesamt: number) => `von ${gesamt} erledigt`,
    offen: (offen: number, sofort: number, hoch: number) => {
      if (offen === 0) return 'Nichts offen';
      const dringend = [sofort ? `${sofort} sofort` : '', hoch ? `${hoch} hoch` : ''].filter(Boolean);
      return dringend.length ? `${offen} offen, davon ${dringend.join(', ')}` : `${offen} offen`;
    },
    erledigt: (n: number) => `${n} erledigt`,
  },
  formular: {
    einleitung:
      'Zehn Fragen, jede Antwort speichert sich sofort. Was du nicht weisst, bleibt bei «Weiss ich nicht» und lässt sich später ergänzen.',
    weissNicht: 'Weiss ich nicht',
    frageVon: (nummer: number, gesamt: number) => `Frage ${nummer} von ${gesamt}`,
    weiter: 'Weiter',
    zurueck: 'Zurück',
    fertig: 'Fertig',
    schliessen: 'Schliessen',
    gespeichert: 'Gespeichert',
    wartet: 'Speichert ab dem Namen',
    ungueltig: 'Nicht gespeichert',
    verweigert: 'Speichern verweigert',
    nameFehlt: 'Gib dem Werkzeug einen Namen.',
    zuLang: (max: number) => `Höchstens ${max} Zeichen.`,
    ganzzahl: 'Bitte eine ganze Zahl ab 0 eingeben.',
    zuGross: (max: string) => `Höchstens ${max}.`,
    offenTitel: 'Noch offen',
    offenLeer: 'Alle Fragen sind beantwortet.',
    nichtGefundenTitel: 'Werkzeug nicht gefunden',
    nichtGefunden: 'Dieses Werkzeug gibt es in diesem Browser nicht (mehr).',
    zurUebersicht: 'Zur Übersicht',
  },
  karte: {
    zurUebersicht: 'Übersicht',
    bearbeiten: 'Bearbeiten',
    aendern: 'Ändern',
    loeschen: 'Werkzeug löschen',
    loeschenTitel: (name: string) => `«${name}» löschen?`,
    loeschenText:
      'Das Werkzeug und der Stand seiner Prüfpunkte verschwinden aus diesem Browser. Eine heruntergeladene Sicherung bleibt unberührt.',
    loeschenJa: 'Löschen',
    abbrechen: 'Abbrechen',
    pruefpunkte: 'Prüfpunkte',
    keinePunkte: 'Zu diesem Werkzeug gibt es keine Prüfpunkte.',
    antworten: 'Antworten',
    merkmaleTitel: 'Merkmale',
    offen: 'noch offen',
    erfasst: (datum: string) => `Erfasst am ${datum}`,
    merkmale: {
      standort: { ch: 'Schweiz', eu: 'EU oder EWR', usa: 'USA', andere: 'Anderes Land' },
      personendaten: { nein: 'Keine Personendaten', ja: 'Personendaten', besonders: 'Besonders schützenswerte Daten' },
      zugang: { privat: 'Private Konten', firma: 'Firmenkonto', enterprise: 'Enterprise-Vertrag' },
      avv: { ja: 'AVV vorhanden', nein: 'Kein AVV', unklar: 'AVV unklar' },
      euBezug: 'EU-Bezug',
    },
  },
  darstellung: {
    titel: 'Darstellung',
    optionen: { hell: 'Hell', dunkel: 'Dunkel', system: 'System' },
  },
  mehr: {
    verzeichnis: 'Druckansicht, auch als PDF',
    daten: 'Sicherung, Tabelle für Excel, Wiederherstellen',
    impressum: 'Wer das KI-Inventar macht',
    datenschutz: 'Was im Browser gespeichert wird',
    quellcode: 'Quellcode',
    quellcodeText: 'Öffentlich auf GitHub',
  },
  pruefpunkte: {
    einleitung: 'Alle Prüfpunkte über alle Werkzeuge, das Dringende zuerst.',
    filter: 'Anzeigen',
    nurOffene: 'Nur offene',
    alle: 'Alle',
    leer: 'Keine offenen Prüfpunkte.',
    leerOhneWerkzeuge: 'Noch kein Werkzeug erfasst; Prüfpunkte entstehen aus den Antworten.',
    anzahl: (n: number) => (n === 1 ? '1 Punkt' : `${n} Punkte`),
  },
  fristen: {
    einleitung:
      'Wann die EU-KI-Verordnung was verlangt und seit wann das Datenschutzgesetz gilt. Die EU-Pflichten treffen ein Schweizer Unternehmen, sobald Ausgaben in der EU genutzt werden oder Kundschaft dort sitzt.',
    beiDir: (n: number) =>
      n === 1 ? 'Bei dir hat 1 Werkzeug EU-Bezug.' : `Bei dir haben ${n} Werkzeuge EU-Bezug.`,
    keinEu: 'Keines deiner Werkzeuge hat EU-Bezug; die EU-Fristen betreffen dich derzeit nicht direkt.',
    heute: (datum: string) => `Heute, ${datum}`,
    giltSeit: 'gilt',
    kommt: 'kommt',
    geplant: 'geplant',
    betrifft: 'Betrifft',
    eu: 'EU-Bezug nötig',
    schweiz: 'Schweiz',
  },
  daten: {
    einleitung:
      'Alles liegt nur in diesem Browser. Wer die Website-Daten löscht oder das Gerät wechselt, verliert es. Darum regelmässig sichern.',
    ort: 'Gespeichert im Speicher dieses Browsers (localStorage), Schlüssel «ki-inventar».',
    fluechtig:
      'Dieser Browser erlaubt der Seite keinen dauerhaften Speicher. Was du erfasst, ist nach dem Schliessen weg; sichere es als Datei.',
    sichernTitel: 'Sichern',
    sichernText: 'Eine JSON-Datei mit allen Werkzeugen und dem Stand der Prüfpunkte. Damit lässt sich alles wiederherstellen.',
    sichern: 'Sicherung herunterladen (JSON)',
    tabelleTitel: 'Als Tabelle',
    tabelleText: 'Eine CSV-Datei für Excel: eine Zeile je Werkzeug, mit offenen und erledigten Prüfpunkten.',
    tabelle: 'Tabelle herunterladen (CSV)',
    leerHinweis: 'Noch nichts erfasst; es gibt nichts zu sichern.',
    art12Titel: 'Bearbeitungsverzeichnis',
    art12Text:
      'Ein Entwurf des Verzeichnisses der Bearbeitungstätigkeiten nach Art. 12 DSG, als CSV für Excel: eine Zeile je Werkzeug mit Personendaten. Was das KI-Inventar nicht weiss, etwa die Aufbewahrungsdauer, steht als «zu ergänzen» da.',
    art12Pflicht:
      'Firmen mit weniger als 250 Mitarbeitenden sind von der Pflicht befreit, ausser sie bearbeiten besonders schützenswerte Personendaten in grossem Umfang oder führen ein Profiling mit hohem Risiko durch.',
    art12Quelle: 'https://www.fedlex.admin.ch/eli/cc/2022/568/de#art_24',
    art12QuelleText: 'Art. 24 Datenschutzverordnung (DSV)',
    art12Besondere: (n: number) =>
      n === 1
        ? 'In 1 Werkzeug gelangen besonders schützenswerte Personendaten. Geschieht das in grossem Umfang, gilt die Pflicht auch unter 250 Mitarbeitenden.'
        : `In ${n} Werkzeugen gelangen besonders schützenswerte Personendaten. Geschieht das in grossem Umfang, gilt die Pflicht auch unter 250 Mitarbeitenden.`,
    art12Knopf: 'Entwurf herunterladen (CSV)',
    art12Leer: 'Kein Werkzeug nimmt Personendaten auf; es gibt nichts zu verzeichnen.',
    kalenderTitel: 'Erinnerung im Kalender',
    kalenderText:
      'Eine Kalenderdatei mit einem Termin je Werkzeug für den Tag, an dem die jährliche Überprüfung wieder fällig wird. Grundlage ist das Datum, an dem «Eintrag jährlich überprüfen» erledigt wurde.',
    kalenderOhne: (n: number) =>
      n === 1
        ? 'Bei 1 Werkzeug ist die Überprüfung noch nicht festgehalten oder schon wieder fällig; es bekommt keinen Termin.'
        : `Bei ${n} Werkzeugen ist die Überprüfung noch nicht festgehalten oder schon wieder fällig; sie bekommen keinen Termin.`,
    kalenderKnopf: (n: number) => (n === 1 ? 'Termin herunterladen (.ics)' : `${n} Termine herunterladen (.ics)`),
    wiederTitel: 'Wiederherstellen',
    wiederText: 'Ersetzt alles in diesem Browser durch den Inhalt einer Sicherung.',
    wahl: 'Sicherung wählen',
    zuGross: 'Die Datei ist grösser als 1 MB und damit keine Sicherung des KI-Inventars.',
    wiederOk: (n: number) => `Sicherung wiederhergestellt: ${n === 1 ? '1 Werkzeug' : `${n} Werkzeuge`}.`,
    ersetzenTitel: 'Alles ersetzen?',
    ersetzenText: (jetzt: number, neu: number) =>
      `In diesem Browser stehen ${jetzt} Werkzeuge. Die Sicherung enthält ${neu}. Was jetzt hier steht, geht verloren.`,
    ersetzen: 'Ersetzen',
    loeschenTitel: 'Alles löschen',
    loeschenText: 'Entfernt alle Werkzeuge und den Firmennamen aus diesem Browser.',
    loeschen: 'Alle Daten in diesem Browser löschen',
    loeschenFrage: 'Wirklich alles löschen?',
    loeschenWarnung: 'Das lässt sich nicht rückgängig machen. Lade vorher eine Sicherung herunter.',
    loeschenJa: 'Alles löschen',
    geloescht: 'Alle Daten in diesem Browser sind gelöscht.',
    abbrechen: 'Abbrechen',
  },
  verzeichnis: {
    einleitung:
      'So sieht das Verzeichnis gedruckt aus. Über «Drucken» lässt es sich auch als PDF sichern.',
    firma: 'Name der Firma (steht im Kopf)',
    drucken: 'Drucken',
    titel: 'Verzeichnis der KI-Werkzeuge',
    stand: (datum: string, werkzeuge: number, offen: number) =>
      `Stand ${datum}, ${werkzeuge} ${werkzeuge === 1 ? 'Werkzeug' : 'Werkzeuge'}, ${offen} offene Prüfpunkte`,
    tabelle: 'Übersicht der Werkzeuge',
    spalten: ['Werkzeug', 'Anbieter, Standort', 'Zweck', 'Verantwortlich', 'Personendaten', 'Offen'],
    punkteTitel: 'Prüfpunkte je Werkzeug',
    leer: 'Noch kein Werkzeug erfasst.',
    offen: 'offen',
    erledigt: (datum: string) => `erledigt ${datum}`,
    nichtZutreffend: (begruendung: string) => `trifft nicht zu: ${begruendung}`,
    tabellenBereich: 'Tabelle, seitlich verschiebbar',
  },
  status: {
    offen: 'Offen',
    erledigt: 'Erledigt',
    nichtZutreffend: 'Trifft nicht zu',
    erledigtAm: (datum: string) => `Erledigt am ${datum}`,
    nichtZutreffendAm: (datum: string) => `Trifft nicht zu, festgehalten am ${datum}`,
    wiederOffen: (datum: string) =>
      `Zuletzt erledigt am ${datum}; nach einem Jahr wieder fällig.`,
    alsErledigt: 'Erledigt',
    trifftNichtZu: 'Trifft nicht zu',
    wiederOeffnen: 'Wieder öffnen',
    begruendung: 'Warum trifft der Punkt nicht zu?',
    begruendungFehlt: 'Bitte kurz begründen, warum der Punkt nicht zutrifft.',
    speichern: 'Begründung speichern',
    abbrechen: 'Abbrechen',
    quelle: 'Quelle',
    quellen: 'Quellen',
    neuerTab: '(öffnet in neuem Tab)',
    werkzeug: 'Werkzeug',
    dringlichkeit: {
      hoechste: 'Sofort',
      hoch: 'Hoch',
      mittel: 'Mittel',
      niedrig: 'Niedrig',
    },
  },
} as const;

export { FRAGEN, OPTIONEN, ANGABEN, JA_NEIN } from './de-CH-fragen';
export { REGEL_TEXTE } from './de-CH-regeln';
