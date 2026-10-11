import type { Werkzeug } from '../../fach/werkzeug';
import { ANGABEN, JA_NEIN, OPTIONEN } from '../../texte/de-CH';

export interface AntwortZeile {
  frage: string;
  antwort: string;
  offen: boolean;
}

const jaNein = (wert: boolean | null) => (wert === null ? null : wert ? JA_NEIN.ja : JA_NEIN.nein);
const wahl = <K extends string>(texte: Record<K, string>, wert: K | null) =>
  wert === null ? null : texte[wert];

/** Die Antworten eines Werkzeugs als Liste für die Karteikarte. */
export function antwortZeilen(w: Werkzeug): AntwortZeile[] {
  const zeilen: [string, string | null][] = [
    ['Anbieter', w.anbieter || null],
    [ANGABEN.standort, wahl(OPTIONEN.standort, w.standort)],
    [ANGABEN.kategorie, wahl(OPTIONEN.kategorie, w.kategorie)],
    ['Beschreibung', w.zweck || null],
    ['Abteilungen', w.abteilungen || null],
    ['Nutzende', w.anzahl === null ? null : String(w.anzahl)],
    ['Verantwortlich', w.verantwortlich || null],
    [ANGABEN.zugang, wahl(OPTIONEN.zugang, w.zugang)],
    [ANGABEN.personendaten, wahl(OPTIONEN.personendaten, w.personendaten)],
    [ANGABEN.geheimnisse, jaNein(w.geheimnisse)],
    ['Training ausgeschlossen', wahl(OPTIONEN.training, w.training)],
    [ANGABEN.avv, wahl(OPTIONEN.avv, w.avv)],
    [ANGABEN.ausgabenDritte, jaNein(w.ausgabenDritte)],
    [ANGABEN.entscheidungen, jaNein(w.entscheidungen)],
    [ANGABEN.euBezug, jaNein(w.euBezug)],
    ['Geschult', jaNein(w.geschult)],
    [ANGABEN.verboten, jaNein(w.verboten)],
  ];
  return zeilen.map(([frage, antwort]) => ({
    frage,
    antwort: antwort ?? 'noch offen',
    offen: antwort === null,
  }));
}
