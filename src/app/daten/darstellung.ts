import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

import { SPEICHER } from './speicher';

export const DARSTELLUNGEN = ['hell', 'dunkel', 'system'] as const;
export type Darstellung = (typeof DARSTELLUNGEN)[number];

/** Derselbe Schlüssel wie in public/darstellung.js, das vor dem Zeichnen läuft. */
export const SCHLUESSEL_DARSTELLUNG = 'ki-inventar-darstellung';

const FARBE_LEISTE = { hell: '#f4f2ed', dunkel: '#121315' } as const;

/** Hell ist die Vorgabe; alles Unbekannte zählt als hell. */
export function liesDarstellung(wert: string | null): Darstellung {
  return wert === 'dunkel' || wert === 'system' ? wert : 'hell';
}

/**
 * Hell, dunkel oder wie das Gerät. Die Wahl steht als `data-darstellung` an
 * `<html>`; die Farben schalten über `color-scheme` (token.css). Gemerkt wird sie
 * je Browser, wie das Inventar.
 */
@Injectable({ providedIn: 'root' })
export class DarstellungDienst {
  private readonly speicher = inject(SPEICHER);
  private readonly dokument = inject(DOCUMENT);
  private readonly dunklesGeraet = this.dokument.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
  readonly wahl = signal<Darstellung>(liesDarstellung(this.lies()));

  constructor() {
    effect(() => this.wende(this.wahl()));
    this.dunklesGeraet?.addEventListener('change', () => this.wende(this.wahl()));
  }

  waehle(darstellung: Darstellung) {
    this.wahl.set(darstellung);
    try {
      this.speicher.setItem(SCHLUESSEL_DARSTELLUNG, darstellung);
    } catch {
      // Gesperrter Speicher: Die Wahl gilt bis zum Schliessen.
    }
  }

  private lies(): string | null {
    try {
      return this.speicher.getItem(SCHLUESSEL_DARSTELLUNG);
    } catch {
      return null;
    }
  }

  /** Setzt die Wahl an `<html>` und färbt die Leiste des Browsers passend. */
  private wende(darstellung: Darstellung) {
    this.dokument.documentElement.setAttribute('data-darstellung', darstellung);
    const dunkel = darstellung === 'dunkel' || (darstellung === 'system' && !!this.dunklesGeraet?.matches);
    this.dokument
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dunkel ? FARBE_LEISTE.dunkel : FARBE_LEISTE.hell);
  }
}
