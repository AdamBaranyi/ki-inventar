import { inject, Injectable, signal } from '@angular/core';

import { beispielInventar } from '../fach/beispiel';
import { inventarSchema, leeresInventar, type Inventar } from '../fach/inventar';
import {
  neuesWerkzeug,
  type Antworten,
  type Pruefung,
  type RegelId,
  type Werkzeug,
} from '../fach/werkzeug';
import { ladeInventar, legeUnlesbaresBeiseite, speichereInventar, SPEICHER } from './speicher';
import { Uhr } from './uhr';

/**
 * Das Inventar als Signal. Jede Änderung wird sofort im Browser gespeichert,
 * aber nur, wenn das Ergebnis dem Schema entspricht: Was gespeichert ist, muss
 * beim nächsten Laden wieder lesbar sein.
 */
@Injectable({ providedIn: 'root' })
export class InventarDienst {
  private readonly speicher = inject(SPEICHER);
  private readonly uhr = inject(Uhr);
  private readonly geladen = ladeInventar(this.speicher);
  private readonly stand = signal<Inventar>(this.geladen.inventar);

  readonly inventar = this.stand.asReadonly();
  /** Gesetzt, wenn gespeicherte Daten unlesbar sind; dann wird nichts überschrieben. */
  readonly ladeFehler = signal<string | null>(this.geladen.fehler);
  readonly speicherFehler = signal(false);

  werkzeug(id: string): Werkzeug | undefined {
    return this.stand().werkzeuge.find((w) => w.id === id);
  }

  erfasse(name: string): string {
    const id = crypto.randomUUID();
    const neu = neuesWerkzeug(id, name, this.uhr.jetzt());
    this.schreibe({ ...this.stand(), werkzeuge: [...this.stand().werkzeuge, neu] });
    return id;
  }

  aendere(id: string, antworten: Antworten): boolean {
    const geaendert = this.uhr.jetzt().toISOString();
    return this.ersetzeWerkzeug(id, (w) => ({ ...w, ...antworten, geaendert }));
  }

  setzePruefung(id: string, regel: RegelId, pruefung: Pruefung | null): boolean {
    return this.ersetzeWerkzeug(id, (w) => {
      const { [regel]: _, ...rest } = w.pruefungen;
      return { ...w, pruefungen: pruefung ? { ...rest, [regel]: pruefung } : rest };
    });
  }

  loesche(id: string): boolean {
    const werkzeuge = this.stand().werkzeuge.filter((w) => w.id !== id);
    return this.schreibe({ ...this.stand(), werkzeuge });
  }

  setzeFirma(firma: string): boolean {
    return this.schreibe({ ...this.stand(), firma });
  }

  ladeBeispiel(): boolean {
    return this.ersetzeAlles(beispielInventar());
  }

  allesLoeschen(): boolean {
    return this.ersetzeAlles(leeresInventar());
  }

  /** Ersetzt den ganzen Stand; unlesbare Daten kommen vorher beiseite. */
  ersetzeAlles(inventar: Inventar): boolean {
    if (this.ladeFehler()) {
      legeUnlesbaresBeiseite(this.speicher);
      this.ladeFehler.set(null);
    }
    return this.schreibe(inventar);
  }

  private ersetzeWerkzeug(id: string, aenderung: (w: Werkzeug) => Werkzeug): boolean {
    const werkzeuge = this.stand().werkzeuge.map((w) => (w.id === id ? aenderung(w) : w));
    return this.schreibe({ ...this.stand(), werkzeuge });
  }

  private schreibe(neu: Inventar): boolean {
    if (this.ladeFehler() || !inventarSchema.safeParse(neu).success) return false;
    this.stand.set(neu);
    this.speicherFehler.set(!speichereInventar(this.speicher, neu));
    return true;
  }
}
