import { FRAGEN } from '../../texte/de-CH';
import type { Formular } from './formular-modell';

export type Feld = keyof Formular['controls'];

export interface Schritt {
  titel: string;
  felder: readonly Feld[];
}

/** Die zehn Fragen als Schritte, je ein Bildschirm; Felder in der Reihenfolge der Anzeige. */
export const SCHRITTE: readonly Schritt[] = [
  { titel: FRAGEN.q1.titel, felder: ['name', 'anbieter', 'standort'] },
  { titel: FRAGEN.q2.titel, felder: ['kategorie', 'zweck'] },
  { titel: FRAGEN.q3.titel, felder: ['abteilungen', 'anzahl', 'verantwortlich'] },
  { titel: FRAGEN.q4.titel, felder: ['zugang'] },
  { titel: FRAGEN.q5.titel, felder: ['personendaten'] },
  { titel: FRAGEN.q6.titel, felder: ['geheimnisse'] },
  { titel: FRAGEN.q7.titel, felder: ['training'] },
  { titel: FRAGEN.q8.titel, felder: ['avv'] },
  { titel: FRAGEN.q9.titel, felder: ['ausgabenDritte', 'entscheidungen'] },
  { titel: FRAGEN.q10.titel, felder: ['euBezug', 'geschult', 'verboten'] },
];

/** Die Nummer aus der Adresse (?frage=5), begrenzt auf 1 bis 10; alles andere ist 1. */
export function schrittNummer(wert: string | null | undefined): number {
  const zahl = Number(wert);
  if (!Number.isInteger(zahl)) return 1;
  return Math.min(Math.max(zahl, 1), SCHRITTE.length);
}

/** Die Felder eines Schritts, die einen Fehler haben, in der Reihenfolge der Anzeige. */
export function fehlerImSchritt(form: Formular, nummer: number): Feld[] {
  return (SCHRITTE[nummer - 1]?.felder ?? []).filter((feld) => form.controls[feld].invalid);
}
