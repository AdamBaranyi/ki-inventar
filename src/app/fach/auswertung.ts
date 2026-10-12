import type { Inventar } from './inventar';
import { pruefpunkte, type Dringlichkeit, type Pruefpunkt } from './regeln';
import type { Antworten, Werkzeug } from './werkzeug';

export interface Zahlen {
  werkzeuge: number;
  offen: number;
  personendaten: number;
}

/** Die drei Zahlen der Übersicht. */
export function zahlen(inventar: Inventar, heute: string): Zahlen {
  const { werkzeuge } = inventar;
  return {
    werkzeuge: werkzeuge.length,
    offen: allePruefpunkte(werkzeuge, heute).filter((p) => p.status === 'offen').length,
    personendaten: werkzeuge.filter((w) => w.personendaten === 'ja' || w.personendaten === 'besonders')
      .length,
  };
}

export function allePruefpunkte(werkzeuge: readonly Werkzeug[], heute: string): Pruefpunkt[] {
  return werkzeuge.flatMap((w) => pruefpunkte(w, heute));
}

const RANG: Record<Dringlichkeit, number> = { hoechste: 0, hoch: 1, mittel: 2, niedrig: 3 };
const nummer = (p: Pruefpunkt) => Number(p.regel.slice(1));

/** Dringendes zuerst, dann nach Werkzeug und Regelnummer. */
export function nachDringlichkeit(punkte: readonly Pruefpunkt[]): Pruefpunkt[] {
  return [...punkte].sort(
    (a, b) =>
      RANG[a.dringlichkeit] - RANG[b.dringlichkeit] ||
      a.werkzeugName.localeCompare(b.werkzeugName, 'de-CH') ||
      nummer(a) - nummer(b),
  );
}

export interface Fortschritt {
  gesamt: number;
  /** Erledigt oder «trifft nicht zu»: Der Punkt ist geklärt. */
  erledigt: number;
  offen: number;
  sofort: number;
  hoch: number;
}

/** Wie weit die Punkte geklärt sind, für den Balken auf Übersicht und Werkzeug. */
export function fortschritt(punkte: readonly Pruefpunkt[]): Fortschritt {
  const offene = punkte.filter((p) => p.status === 'offen');
  return {
    gesamt: punkte.length,
    erledigt: punkte.length - offene.length,
    offen: offene.length,
    sofort: offene.filter((p) => p.dringlichkeit === 'hoechste').length,
    hoch: offene.filter((p) => p.dringlichkeit === 'hoch').length,
  };
}

/** Die dringendsten offenen Punkte über alle Werkzeuge. */
export function naechste(punkte: readonly Pruefpunkt[], anzahl: number): Pruefpunkt[] {
  return nachDringlichkeit(punkte.filter((p) => p.status === 'offen')).slice(0, anzahl);
}

export interface Lage {
  offen: number;
  stopp: boolean;
  fehlend: number;
}

/** Was die Liste der Übersicht je Werkzeug zeigt. */
export function lage(w: Werkzeug, heute: string): Lage {
  const offene = pruefpunkte(w, heute).filter((p) => p.status === 'offen');
  return {
    offen: offene.length,
    stopp: offene.some((p) => p.regel === 'R12'),
    fehlend: fehlendeAngaben(w).length,
  };
}

const AUSWAHLEN = [
  'standort',
  'kategorie',
  'zugang',
  'personendaten',
  'geheimnisse',
  'training',
  'avv',
  'ausgabenDritte',
  'entscheidungen',
  'euBezug',
  'geschult',
  'verboten',
] as const satisfies readonly (keyof Antworten)[];

export type Auswahl = (typeof AUSWAHLEN)[number];

/** Ältere Einträge kennen «unbekannt» und «unklar» als eigene Antwort; sie zählen wie «Weiss ich nicht». */
const UNKLAR: readonly unknown[] = [null, 'unbekannt', 'unklar'];

/** Auswahlfragen ohne klare Antwort, in der Reihenfolge des Formulars. */
export function fehlendeAngaben(w: Readonly<Record<Auswahl, unknown>>): Auswahl[] {
  return AUSWAHLEN.filter((feld) => UNKLAR.includes(w[feld]));
}
