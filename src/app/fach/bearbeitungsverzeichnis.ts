import { BEARBEITUNG as B } from '../texte/de-CH-bearbeitung';
import { OPTIONEN } from '../texte/de-CH-fragen';
import { csvTabelle } from './csv';
import type { Inventar } from './inventar';
import type { Kategorie, Werkzeug } from './werkzeug';

/** Vorschlag für die betroffenen Personen, nur wo der Zweck sie nahelegt. */
const BETROFFENE: Partial<Record<Kategorie, string>> = B.betroffene;

/**
 * Entwurf des Verzeichnisses der Bearbeitungstätigkeiten nach Art. 12 Abs. 2 DSG:
 * eine Zeile je Werkzeug, in das Personendaten gelangen (oder bei dem es offen
 * ist). Was das Inventar nicht weiss, steht als «zu ergänzen» da.
 */
export function bearbeitungen(inventar: Inventar): Werkzeug[] {
  return inventar.werkzeuge
    .filter((w) => w.personendaten !== 'nein')
    .sort((a, b) => a.name.localeCompare(b.name, 'de-CH'));
}

/** Je Werkzeug die Angaben in der Reihenfolge der Spalten (`BEARBEITUNG.kopf`). */
export function verzeichnisZeilen(inventar: Inventar): string[][] {
  return bearbeitungen(inventar).map((w) => zeile(w, inventar.firma));
}

export function alsBearbeitungsverzeichnis(inventar: Inventar): string {
  return csvTabelle([B.kopf, ...verzeichnisZeilen(inventar)]);
}

function zeile(w: Werkzeug, firma: string): string[] {
  return [
    w.name,
    firma || B.ergaenzen,
    w.verantwortlich || B.ergaenzen,
    zweck(w),
    (w.kategorie && BETROFFENE[w.kategorie]) || B.ergaenzen,
    w.personendaten === 'besonders' ? B.daten.besonders : w.personendaten === 'ja' ? B.daten.ja : B.daten.offen,
    B.empfaenger(w.anbieter, w.avv === 'ja' ? B.avv.ja : w.avv === 'nein' ? B.avv.nein : B.avv.offen),
    B.aufbewahrung,
    sicherheit(w),
    B.ausland[w.standort ?? 'unbekannt'],
  ];
}

function zweck(w: Werkzeug): string {
  const teile = [w.kategorie ? OPTIONEN.kategorie[w.kategorie] : '', w.zweck].filter(Boolean);
  return teile.length ? teile.join(': ') : B.ergaenzen;
}

/** Was die Antworten über die Datensicherheit schon sagen (Art. 12 Abs. 2 Bst. f DSG). */
function sicherheit(w: Werkzeug): string {
  const teile = [
    w.zugang ? B.sicherheit.zugang[w.zugang] : '',
    w.training === 'ja' ? B.sicherheit.trainingAus : w.training === 'nein' ? B.sicherheit.trainingAn : '',
    w.geschult === true ? B.sicherheit.geschult : '',
  ].filter(Boolean);
  return teile.length ? B.sicherheit.erfasst(teile.join(', ')) : B.ergaenzen;
}

/** Wie viele Werkzeuge besonders schützenswerte Personendaten aufnehmen (Ausnahme von Art. 24 DSV). */
export function mitBesonderenDaten(inventar: Inventar): number {
  return inventar.werkzeuge.filter((w) => w.personendaten === 'besonders').length;
}
