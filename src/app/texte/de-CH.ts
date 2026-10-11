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
      daten: 'Daten',
    },
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
    nichtGefunden: 'Seite nicht gefunden',
  },
  uebersicht: {
    titel: 'KI-Werkzeuge',
    titelFirma: (firma: string) => `KI-Werkzeuge der ${firma}`,
    einleitung:
      'Erfasse jedes KI-Werkzeug, das in deiner Firma genutzt wird, mit zehn Fragen. Daraus entstehen Prüfpunkte mit Grund und Gesetzesstelle, nach DSG und EU-KI-Verordnung.',
    lokal: 'Alles bleibt in diesem Browser: kein Konto, kein Server, keine Übermittlung.',
    zahlen: 'Stand',
    werkzeuge: (n: number) => (n === 1 ? 'Werkzeug' : 'Werkzeuge'),
    offen: (n: number) => (n === 1 ? 'offener Prüfpunkt' : 'offene Prüfpunkte'),
    personendaten: 'mit Personendaten',
    erfassen: 'Werkzeug erfassen',
    beispiel: 'Beispiel laden',
    beispielHinweis: 'Das Beispiel zeigt eine erfundene Treuhandfirma mit sieben Werkzeugen.',
    liste: 'Erfasste Werkzeuge',
    leer: 'Noch kein Werkzeug erfasst.',
    stopp: 'Einsatz stoppen',
    offenChip: (n: number) => `${n} offen`,
    alleErledigt: 'Alles erledigt',
    fehlend: (n: number) => (n === 1 ? '1 Angabe fehlt' : `${n} Angaben fehlen`),
  },
  formular: {
    einleitung:
      'Zehn Fragen, alles speichert sich von selbst. Was du nicht weisst, lässt du offen; offene Antworten zählen vorsichtig.',
    fertig: 'Fertig',
    zurueck: 'Zurück zum Werkzeug',
    gespeichert: 'Automatisch gespeichert.',
    wartet: 'Wird gespeichert, sobald der Name steht.',
    ungueltig: 'Nicht gespeichert: Bitte die markierten Angaben prüfen.',
    verweigert: 'Nicht gespeichert: Der Browser hat das Speichern verweigert.',
    nameFehlt: 'Gib dem Werkzeug einen Namen.',
    zuLang: (max: number) => `Höchstens ${max} Zeichen.`,
    ganzzahl: 'Bitte eine ganze Zahl ab 0 eingeben.',
    zuGross: (max: string) => `Höchstens ${max}.`,
    offenTitel: 'Noch nicht beantwortet',
    offenLeer: 'Alle Fragen sind beantwortet.',
    nichtGefundenTitel: 'Werkzeug nicht gefunden',
    nichtGefunden: 'Dieses Werkzeug gibt es in diesem Browser nicht (mehr).',
    zurUebersicht: 'Zur Übersicht',
  },
  karte: {
    bearbeiten: 'Bearbeiten',
    loeschen: 'Werkzeug löschen',
    loeschenTitel: (name: string) => `«${name}» löschen?`,
    loeschenText:
      'Das Werkzeug und der Stand seiner Prüfpunkte verschwinden aus diesem Browser. Eine heruntergeladene Sicherung bleibt unberührt.',
    loeschenJa: 'Löschen',
    abbrechen: 'Abbrechen',
    pruefpunkte: 'Prüfpunkte',
    keinePunkte: 'Zu diesem Werkzeug gibt es keine Prüfpunkte.',
    antworten: 'Antworten',
    offen: 'noch offen',
    erfasst: (datum: string) => `Erfasst am ${datum}`,
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
  status: {
    offen: 'Offen',
    erledigt: 'Erledigt',
    nichtZutreffend: 'Trifft nicht zu',
    erledigtAm: (datum: string) => `Erledigt am ${datum}`,
    nichtZutreffendAm: (datum: string) => `Trifft nicht zu, festgehalten am ${datum}`,
    wiederOffen: (datum: string) =>
      `Zuletzt erledigt am ${datum}; nach einem Jahr wieder fällig.`,
    alsErledigt: 'Als erledigt markieren',
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
