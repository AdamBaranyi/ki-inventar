import type { Werkzeug } from '../../fach/werkzeug';
import { ANGABEN, FRAGEN, JA_NEIN, OPTIONEN } from '../../texte/de-CH';

export interface AntwortZeile {
  frage: string;
  antwort: string;
  offen: boolean;
}

export interface AntwortGruppe {
  /** Nummer des Schritts im Formular, für «Ändern». */
  nummer: number;
  titel: string;
  zeilen: AntwortZeile[];
}

const jaNein = (wert: boolean | null) => (wert === null ? null : wert ? JA_NEIN.ja : JA_NEIN.nein);
const wahl = <K extends string>(texte: Record<K, string>, wert: K | null) =>
  wert === null ? null : texte[wert];
const zeile = (frage: string, antwort: string | null): AntwortZeile => ({
  frage,
  antwort: antwort ?? 'noch offen',
  offen: antwort === null,
});

/** Die Antworten eines Werkzeugs, gruppiert wie die Schritte des Formulars. */
export function antwortGruppen(w: Werkzeug): AntwortGruppe[] {
  const gruppen: [string, AntwortZeile[]][] = [
    [FRAGEN.q1.titel, [zeile('Anbieter', w.anbieter || null), zeile(ANGABEN.standort, wahl(OPTIONEN.standort, w.standort))]],
    [FRAGEN.q2.titel, [zeile('Einsatz', wahl(OPTIONEN.kategorie, w.kategorie)), zeile('Beschreibung', w.zweck || null)]],
    [
      FRAGEN.q3.titel,
      [
        zeile('Abteilungen', w.abteilungen || null),
        zeile('Nutzende', w.anzahl === null ? null : w.anzahl.toLocaleString('de-CH')),
        zeile('Verantwortlich', w.verantwortlich || null),
      ],
    ],
    [FRAGEN.q4.titel, [zeile(ANGABEN.zugang, wahl(OPTIONEN.zugang, w.zugang))]],
    [FRAGEN.q5.titel, [zeile(ANGABEN.personendaten, wahl(OPTIONEN.personendaten, w.personendaten))]],
    [FRAGEN.q6.titel, [zeile(ANGABEN.geheimnisse, jaNein(w.geheimnisse))]],
    [FRAGEN.q7.titel, [zeile('Training ausgeschlossen', wahl(OPTIONEN.training, w.training))]],
    [FRAGEN.q8.titel, [zeile(ANGABEN.avv, wahl(OPTIONEN.avv, w.avv))]],
    [
      FRAGEN.q9.titel,
      [zeile(ANGABEN.ausgabenDritte, jaNein(w.ausgabenDritte)), zeile(ANGABEN.entscheidungen, jaNein(w.entscheidungen))],
    ],
    [
      FRAGEN.q10.titel,
      [
        zeile(ANGABEN.euBezug, jaNein(w.euBezug)),
        zeile('Geschult', jaNein(w.geschult)),
        zeile(ANGABEN.verboten, jaNein(w.verboten)),
      ],
    ],
  ];
  return gruppen.map(([titel, zeilen], index) => ({ nummer: index + 1, titel, zeilen }));
}
