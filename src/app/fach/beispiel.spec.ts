import { describe, expect, it } from 'vitest';

import { allePruefpunkte } from './auswertung';
import { beispielInventar } from './beispiel';
import { inventarSchema } from './inventar';
import { REGEL_IDS } from './werkzeug';

describe('Beispiel «Muster Treuhand AG»', () => {
  it('besteht die Prüfung des Speicherformats', () => {
    expect(inventarSchema.safeParse(beispielInventar()).success).toBe(true);
  });

  it('hat sieben Werkzeuge mit eindeutigen Kennungen', () => {
    const ids = beispielInventar().werkzeuge.map((w) => w.id);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
  });

  it('zeigt jede Regel ausser dem Stopp (R12) mindestens einmal', () => {
    const vorhanden = new Set(
      allePruefpunkte(beispielInventar().werkzeuge, '2026-10-11').map((p) => p.regel),
    );
    expect([...REGEL_IDS].filter((id) => !vorhanden.has(id))).toEqual(['R12']);
  });

  it('liefert bei jedem Aufruf eine eigene Kopie', () => {
    const erstes = beispielInventar();
    erstes.werkzeuge[0]!.name = 'geändert';
    expect(beispielInventar().werkzeuge[0]!.name).toBe('ChatGPT');
  });
});
