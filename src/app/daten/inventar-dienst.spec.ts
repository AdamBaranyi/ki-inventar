import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { beispielInventar } from '../fach/beispiel';
import { leeresInventar } from '../fach/inventar';
import { InventarDienst } from './inventar-dienst';
import { FluechtigerSpeicher, SCHLUESSEL, SCHLUESSEL_DEFEKT, SPEICHER } from './speicher';
import { Uhr } from './uhr';

class FesteUhr extends Uhr {
  override jetzt() {
    return new Date('2026-10-11T08:00:00.000Z');
  }
}

/** Ein Speicher, der beim Schreiben voll ist. */
class VollerSpeicher extends FluechtigerSpeicher {
  override setItem(): void {
    throw new DOMException('voll', 'QuotaExceededError');
  }
}

let speicher: FluechtigerSpeicher;

function dienst(mit: Storage = speicher): InventarDienst {
  TestBed.configureTestingModule({
    providers: [
      { provide: SPEICHER, useValue: mit },
      { provide: Uhr, useClass: FesteUhr },
    ],
  });
  return TestBed.inject(InventarDienst);
}

const gespeichert = () => JSON.parse(speicher.getItem(SCHLUESSEL) ?? 'null');

beforeEach(() => {
  speicher = new FluechtigerSpeicher();
});

describe('InventarDienst', () => {
  it('beginnt ohne gespeicherte Daten mit einem leeren Inventar', () => {
    expect(dienst().inventar()).toEqual(leeresInventar());
  });

  it('lädt, was im Speicher steht', () => {
    speicher.setItem(SCHLUESSEL, JSON.stringify(beispielInventar()));
    expect(dienst().inventar().werkzeuge).toHaveLength(7);
  });

  it('speichert ein neues Werkzeug sofort', () => {
    const d = dienst();
    const id = d.erfasse('ChatGPT');
    expect(gespeichert().werkzeuge).toMatchObject([
      { id, name: 'ChatGPT', erfasst: '2026-10-11', standort: null },
    ]);
  });

  it('speichert geänderte Antworten mit Zeitstempel', () => {
    const d = dienst();
    const id = d.erfasse('DeepL');
    const { id: _, pruefungen, erfasst, geaendert, ...antworten } = d.werkzeug(id)!;
    d.aendere(id, { ...antworten, standort: 'eu', anzahl: 4 });
    expect(gespeichert().werkzeuge[0]).toMatchObject({
      standort: 'eu',
      anzahl: 4,
      geaendert: '2026-10-11T08:00:00.000Z',
    });
  });

  it('verwirft eine ungültige Änderung, statt sie zu speichern', () => {
    const d = dienst();
    const id = d.erfasse('DeepL');
    const { id: _, pruefungen, erfasst, geaendert, ...antworten } = d.werkzeug(id)!;
    expect(d.aendere(id, { ...antworten, name: 'x'.repeat(81) })).toBe(false);
    expect(gespeichert().werkzeuge[0].name).toBe('DeepL');
  });

  it('setzt und löscht den Status eines Prüfpunkts', () => {
    const d = dienst();
    const id = d.erfasse('Otter');
    d.setzePruefung(id, 'R1', { status: 'erledigt', begruendung: '', datum: '2026-10-11' });
    expect(gespeichert().werkzeuge[0].pruefungen).toEqual({
      R1: { status: 'erledigt', begruendung: '', datum: '2026-10-11' },
    });
    d.setzePruefung(id, 'R1', null);
    expect(gespeichert().werkzeuge[0].pruefungen).toEqual({});
  });

  it('löscht ein Werkzeug', () => {
    const d = dienst();
    const id = d.erfasse('Canva');
    d.loesche(id);
    expect(gespeichert().werkzeuge).toEqual([]);
  });

  it('lädt das Beispiel und ersetzt alles', () => {
    const d = dienst();
    d.erfasse('Eigenes');
    d.ladeBeispiel();
    expect(gespeichert().firma).toBe('Muster Treuhand AG');
    expect(gespeichert().werkzeuge).toHaveLength(7);
  });
});

describe('InventarDienst mit unlesbaren Daten', () => {
  beforeEach(() => {
    speicher.setItem(SCHLUESSEL, '{"version":1,"werkzeuge":"kaputt"}');
  });

  it('meldet den Fehler und überschreibt nichts', () => {
    const d = dienst();
    expect(d.ladeFehler()).toContain('passt nicht');
    d.erfasse('Neu');
    expect(speicher.getItem(SCHLUESSEL)).toBe('{"version":1,"werkzeuge":"kaputt"}');
  });

  it('legt die unlesbaren Daten beiseite, bevor neu begonnen wird', () => {
    const d = dienst();
    d.ersetzeAlles(leeresInventar());
    expect(speicher.getItem(SCHLUESSEL_DEFEKT)).toBe('{"version":1,"werkzeuge":"kaputt"}');
    expect(d.ladeFehler()).toBeNull();
    expect(gespeichert()).toEqual(leeresInventar());
  });
});

describe('InventarDienst mit vollem Speicher', () => {
  it('meldet, dass nicht gespeichert wurde', () => {
    const d = dienst(new VollerSpeicher());
    d.erfasse('Neu');
    expect(d.speicherFehler()).toBe(true);
  });
});
