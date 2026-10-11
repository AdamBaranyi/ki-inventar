import { InjectionToken } from '@angular/core';

import { leeresInventar, liesInventar, type Inventar } from '../fach/inventar';

export const SCHLUESSEL = 'ki-inventar';
/** Hier landen unlesbare Daten, bevor neu begonnen wird. */
export const SCHLUESSEL_DEFEKT = 'ki-inventar-unlesbar';

/** Der Speicher des Browsers; im Test ein eigener. */
export const SPEICHER = new InjectionToken<Storage>('Speicher', {
  providedIn: 'root',
  factory: browserSpeicher,
});

function browserSpeicher(): Storage {
  try {
    localStorage.getItem(SCHLUESSEL);
    return localStorage;
  } catch {
    // Gesperrter Speicher (etwa Einstellungen im Browser): Die App läuft weiter,
    // vergisst aber alles beim Schliessen. Die Daten-Seite sagt das.
    return new FluechtigerSpeicher();
  }
}

export class FluechtigerSpeicher implements Storage {
  private readonly werte = new Map<string, string>();
  get length() {
    return this.werte.size;
  }
  clear() {
    this.werte.clear();
  }
  getItem(schluessel: string) {
    return this.werte.get(schluessel) ?? null;
  }
  key(index: number) {
    return [...this.werte.keys()][index] ?? null;
  }
  removeItem(schluessel: string) {
    this.werte.delete(schluessel);
  }
  setItem(schluessel: string, wert: string) {
    this.werte.set(schluessel, wert);
  }
}

export interface Geladen {
  inventar: Inventar;
  fehler: string | null;
}

export function ladeInventar(speicher: Storage): Geladen {
  const roh = speicher.getItem(SCHLUESSEL);
  if (roh === null) return { inventar: leeresInventar(), fehler: null };
  const gelesen = liesInventar(roh);
  return gelesen.ok
    ? { inventar: gelesen.inventar, fehler: null }
    : { inventar: leeresInventar(), fehler: gelesen.fehler };
}

/** Gibt `false` zurück, wenn der Browser das Schreiben verweigert (voll, gesperrt). */
export function speichereInventar(speicher: Storage, inventar: Inventar): boolean {
  try {
    speicher.setItem(SCHLUESSEL, JSON.stringify(inventar));
    return true;
  } catch {
    return false;
  }
}

export function legeUnlesbaresBeiseite(speicher: Storage): void {
  const roh = speicher.getItem(SCHLUESSEL);
  if (roh !== null) speicher.setItem(SCHLUESSEL_DEFEKT, roh);
}
