import { describe, expect, it } from 'vitest';

import {
  allePruefpunkte,
  fehlendeAngaben,
  fortschritt,
  lage,
  nachDringlichkeit,
  naechste,
  zahlen,
} from './auswertung';
import { beispielInventar } from './beispiel';
import { leeresInventar, type Inventar } from './inventar';
import { neuesWerkzeug, type Werkzeug } from './werkzeug';

const HEUTE = '2026-10-11';
const JETZT = new Date('2026-10-11T08:00:00Z');

function werkzeug(id: string, name: string, teil: Partial<Werkzeug> = {}): Werkzeug {
  return {
    ...neuesWerkzeug(id, name, JETZT),
    standort: 'ch',
    kategorie: 'texte',
    verantwortlich: 'Lea Muster',
    zugang: 'enterprise',
    personendaten: 'nein',
    geheimnisse: false,
    training: 'ja',
    avv: 'ja',
    ausgabenDritte: false,
    entscheidungen: false,
    euBezug: false,
    geschult: true,
    verboten: false,
    ...teil,
  };
}

function inventar(...werkzeuge: Werkzeug[]): Inventar {
  return { ...leeresInventar(), werkzeuge };
}

describe('zahlen', () => {
  it('zählt Werkzeuge, offene Prüfpunkte und Werkzeuge mit Personendaten', () => {
    const a = werkzeug('a', 'A', { personendaten: 'ja', avv: 'nein' }); // R1, R2, R14
    const b = werkzeug('b', 'B', { personendaten: 'besonders' }); // R1, R4, R8, R14
    const c = werkzeug('c', 'C', {
      pruefungen: { R14: { status: 'erledigt', begruendung: '', datum: HEUTE } },
    });
    expect(zahlen(inventar(a, b, c), HEUTE)).toEqual({ werkzeuge: 3, offen: 7, personendaten: 2 });
  });

  it('zählt eine offene Antwort zu Personendaten nicht als «mit Personendaten»', () => {
    const offen = werkzeug('a', 'A', { personendaten: null });
    expect(zahlen(inventar(offen), HEUTE).personendaten).toBe(0);
  });

  it('ist bei leerem Inventar überall null', () => {
    expect(zahlen(leeresInventar(), HEUTE)).toEqual({ werkzeuge: 0, offen: 0, personendaten: 0 });
  });
});

describe('nachDringlichkeit', () => {
  it('sortiert nach Dringlichkeit, dann Werkzeug, dann Regelnummer', () => {
    const zeta = werkzeug('z', 'Zeta', { verboten: true, personendaten: 'ja', avv: 'nein' });
    const alpha = werkzeug('a', 'Alpha', { personendaten: 'ja', avv: 'nein', standort: 'usa' });
    const reihe = nachDringlichkeit(allePruefpunkte([zeta, alpha], HEUTE)).map(
      (p) => `${p.werkzeugName} ${p.regel}`,
    );
    expect(reihe).toEqual([
      'Zeta R12',
      'Alpha R2',
      'Alpha R3',
      'Zeta R2',
      'Alpha R1',
      'Zeta R1',
      'Alpha R14',
      'Zeta R14',
    ]);
  });

  it('ordnet R10 nach R9, nicht nach R1', () => {
    const w = werkzeug('a', 'A', { ausgabenDritte: true, geschult: false });
    const reihe = nachDringlichkeit(allePruefpunkte([w], HEUTE)).map((p) => p.regel);
    expect(reihe).toEqual(['R9', 'R10', 'R14']);
  });
});

describe('lage', () => {
  it('meldet einen Stopp, solange R12 offen ist', () => {
    expect(lage(werkzeug('a', 'A', { verboten: true }), HEUTE)).toMatchObject({ stopp: true });
  });

  it('zählt nur offene Punkte', () => {
    const w = werkzeug('a', 'A', {
      personendaten: 'ja',
      pruefungen: { R1: { status: 'erledigt', begruendung: '', datum: HEUTE } },
    });
    expect(lage(w, HEUTE)).toEqual({ offen: 1, stopp: false, fehlend: 0 });
  });
});

describe('fehlendeAngaben', () => {
  it('nennt jede unbeantwortete Auswahl', () => {
    const w = werkzeug('a', 'A', { standort: null, geschult: null });
    expect(fehlendeAngaben(w)).toEqual(['standort', 'geschult']);
  });

  it('ist bei einem neuen Werkzeug vollständig offen', () => {
    expect(fehlendeAngaben(neuesWerkzeug('n', 'N', JETZT))).toHaveLength(12);
  });

  it('zählt ältere Antworten «unbekannt» und «unklar» wie «Weiss ich nicht»', () => {
    const w = werkzeug('a', 'A', { standort: 'unbekannt', training: 'unbekannt', avv: 'unklar' });
    expect(fehlendeAngaben(w)).toEqual(['standort', 'training', 'avv']);
  });
});

describe('fortschritt', () => {
  const beispiel = () => allePruefpunkte(beispielInventar().werkzeuge, HEUTE);

  it('zählt «trifft nicht zu» als geklärt, wie «erledigt»', () => {
    expect(fortschritt(beispiel())).toEqual({ gesamt: 40, erledigt: 5, offen: 35, sofort: 0, hoch: 8 });
  });

  it('zählt einen offenen Stopp (R12) als «sofort»', () => {
    const punkte = allePruefpunkte([werkzeug('a', 'A', { verboten: true })], HEUTE);
    expect(fortschritt(punkte)).toMatchObject({ offen: 2, sofort: 1, hoch: 0 });
  });

  it('ist ohne Punkte leer', () => {
    expect(fortschritt([])).toEqual({ gesamt: 0, erledigt: 0, offen: 0, sofort: 0, hoch: 0 });
  });
});

describe('naechste', () => {
  it('nimmt die dringendsten offenen Punkte, das Dringende zuerst', () => {
    const punkte = allePruefpunkte(
      [
        werkzeug('a', 'Alpha', { geschult: false }),
        werkzeug('b', 'Beta', { verboten: true, personendaten: 'ja', avv: 'nein' }),
      ],
      HEUTE,
    );
    expect(naechste(punkte, 3).map((p) => `${p.werkzeugName} ${p.regel}`)).toEqual([
      'Beta R12',
      'Beta R2',
      'Alpha R10',
    ]);
  });

  it('lässt Erledigtes weg', () => {
    const w = werkzeug('a', 'A', {
      pruefungen: { R14: { status: 'erledigt', begruendung: '', datum: HEUTE } },
    });
    expect(naechste(allePruefpunkte([w], HEUTE), 3)).toEqual([]);
  });
});
