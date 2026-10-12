import { JA_NEIN, OPTIONEN } from '../texte/de-CH-fragen';
import type { Inventar } from './inventar';
import { pruefpunkte, type Pruefpunkt, type Status } from './regeln';
import type { Werkzeug } from './werkzeug';

/** Byte Order Mark: Excel erkennt die Datei damit als UTF-8 (Umlaute). */
const BOM = '\uFEFF';

const KOPF = [
  'Werkzeug',
  'Anbieter',
  'Standort',
  'Zweck',
  'Beschreibung',
  'Abteilungen',
  'Nutzende',
  'Verantwortlich',
  'Zugang',
  'Personendaten',
  'Geschäftsgeheimnisse',
  'Training ausgeschlossen',
  'AVV',
  'Ausgaben an Dritte',
  'Entscheidungen über Personen',
  'EU-Bezug',
  'Geschult',
  'Verbotene Praktiken',
  'Offene Prüfpunkte',
  'Erledigte Prüfpunkte',
  'Nicht zutreffend',
];

/** Die Tabelle der Werkzeuge: eine Zeile je Werkzeug, mit dem Stand der Prüfpunkte. */
export function alsCsv(inventar: Inventar, heute: string): string {
  return csvTabelle([KOPF, ...inventar.werkzeuge.map((w) => zeile(w, heute))]);
}

/**
 * Tabelle für Excel: Semikolon als Trenner (Schweizer Einstellung), BOM für
 * die Umlaute, Zeilenende CRLF.
 */
export function csvTabelle(zeilen: readonly (readonly string[])[]): string {
  return `${BOM}${zeilen.map((felder) => felder.map(csvFeld).join(';')).join('\r\n')}`;
}

function zeile(w: Werkzeug, heute: string): string[] {
  const punkte = pruefpunkte(w, heute);
  return [
    w.name,
    w.anbieter,
    wahl(OPTIONEN.standort, w.standort),
    wahl(OPTIONEN.kategorie, w.kategorie),
    w.zweck,
    w.abteilungen,
    w.anzahl === null ? '' : String(w.anzahl),
    w.verantwortlich,
    wahl(OPTIONEN.zugang, w.zugang),
    wahl(OPTIONEN.personendaten, w.personendaten),
    jaNein(w.geheimnisse),
    wahl(OPTIONEN.training, w.training),
    wahl(OPTIONEN.avv, w.avv),
    jaNein(w.ausgabenDritte),
    jaNein(w.entscheidungen),
    jaNein(w.euBezug),
    jaNein(w.geschult),
    jaNein(w.verboten),
    titel(punkte, 'offen'),
    titel(punkte, 'erledigt'),
    titel(punkte, 'nicht-zutreffend'),
  ];
}

function wahl<K extends string>(beschriftung: Record<K, string>, wert: K | null): string {
  return wert === null ? JA_NEIN.offen : beschriftung[wert];
}

function jaNein(wert: boolean | null): string {
  if (wert === null) return JA_NEIN.offen;
  return wert ? JA_NEIN.ja : JA_NEIN.nein;
}

function titel(punkte: Pruefpunkt[], status: Status): string {
  return punkte
    .filter((p) => p.status === status)
    .map((p) => p.titel)
    .join(' | ');
}

/**
 * Ein Feld der Tabelle. Beginnt es mit einem Zeichen, das Excel als Formel
 * liest, steht ein Apostroph davor; sonst liesse sich über einen Namen wie
 * «=HYPERLINK(…)» etwas in die Tabelle schmuggeln.
 */
export function csvFeld(wert: string): string {
  const entschaerft = /^[=+\-@\t\r]/.test(wert) ? `'${wert}` : wert;
  return /[";\r\n]/.test(entschaerft) ? `"${entschaerft.replaceAll('"', '""')}"` : entschaerft;
}
