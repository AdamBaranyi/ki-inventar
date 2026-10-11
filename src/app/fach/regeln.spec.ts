import { describe, expect, it } from 'vitest';

import { pruefpunkte, REGELN } from './regeln';
import { neuesWerkzeug, type RegelId, type Werkzeug } from './werkzeug';

const HEUTE = '2026-10-11';

/** Ein Werkzeug, bei dem ausser der jährlichen Prüfung keine Regel greift. */
function sicher(teil: Partial<Werkzeug> = {}): Werkzeug {
  return {
    ...neuesWerkzeug('w1', 'Testwerkzeug', new Date('2026-10-11T08:00:00Z')),
    anbieter: 'Beispiel AG',
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

const regeln = (w: Werkzeug) => pruefpunkte(w, HEUTE).map((p) => p.regel);

interface Fall {
  regel: RegelId;
  greift: Partial<Werkzeug>[];
  greiftNicht: Partial<Werkzeug>[];
}

// Je Regel die Fälle aus der Tabelle im Masterprompt. «≠» lässt eine offene
// Antwort (null) greifen, «=» nicht: Unbeantwortet zählt vorsichtig.
const FAELLE: Fall[] = [
  {
    regel: 'R1',
    greift: [{ personendaten: 'ja' }, { personendaten: 'besonders' }, { personendaten: null }],
    greiftNicht: [{ personendaten: 'nein' }],
  },
  {
    regel: 'R2',
    greift: [
      { personendaten: 'ja', avv: 'nein' },
      { personendaten: 'ja', avv: 'unklar' },
      { personendaten: 'besonders', avv: null },
    ],
    greiftNicht: [
      { personendaten: 'ja', avv: 'ja' },
      { personendaten: 'nein', avv: 'nein' },
    ],
  },
  {
    regel: 'R3',
    greift: [
      { personendaten: 'ja', standort: 'usa' },
      { personendaten: 'ja', standort: 'andere' },
      { personendaten: 'ja', standort: 'unbekannt' },
      { personendaten: 'ja', standort: null },
    ],
    greiftNicht: [
      { personendaten: 'ja', standort: 'ch' },
      { personendaten: 'ja', standort: 'eu' },
      { personendaten: 'nein', standort: 'usa' },
    ],
  },
  {
    regel: 'R4',
    greift: [{ personendaten: 'besonders' }],
    greiftNicht: [{ personendaten: 'ja' }, { personendaten: null }],
  },
  {
    regel: 'R5',
    greift: [
      { training: 'nein', personendaten: 'ja' },
      { training: 'unbekannt', geheimnisse: true },
      { training: null, personendaten: 'ja' },
    ],
    greiftNicht: [
      { training: 'ja', personendaten: 'ja', geheimnisse: true },
      { training: 'nein', personendaten: 'nein', geheimnisse: false },
    ],
  },
  {
    regel: 'R6',
    greift: [
      { zugang: 'privat', personendaten: 'ja' },
      { zugang: 'privat', geheimnisse: true },
    ],
    greiftNicht: [
      { zugang: 'firma', personendaten: 'ja', geheimnisse: true },
      { zugang: 'privat', personendaten: 'nein', geheimnisse: false },
      { zugang: null, personendaten: 'ja' },
    ],
  },
  {
    regel: 'R7',
    greift: [{ entscheidungen: true }],
    greiftNicht: [{ entscheidungen: false }, { entscheidungen: null }],
  },
  {
    regel: 'R8',
    greift: [
      { personendaten: 'ja', kategorie: 'personal' },
      { personendaten: 'ja', kategorie: 'entscheidungen' },
      { personendaten: 'besonders' },
      { personendaten: 'ja', kategorie: 'kundenkontakt' },
    ],
    greiftNicht: [
      { personendaten: 'ja', kategorie: 'texte' },
      { personendaten: 'nein', kategorie: 'personal' },
    ],
  },
  {
    regel: 'R9',
    greift: [{ ausgabenDritte: true }],
    greiftNicht: [{ ausgabenDritte: false }, { ausgabenDritte: null }],
  },
  {
    regel: 'R10',
    greift: [{ geschult: false }, { geschult: null }],
    greiftNicht: [{ geschult: true }],
  },
  {
    regel: 'R11',
    greift: [
      { euBezug: true, kategorie: 'personal' },
      { euBezug: true, kategorie: 'entscheidungen' },
      { euBezug: true, kategorie: 'kredit' },
      { euBezug: true, kategorie: 'bildung' },
    ],
    greiftNicht: [
      { euBezug: false, kategorie: 'personal' },
      { euBezug: null, kategorie: 'bildung' },
      { euBezug: true, kategorie: 'kundenkontakt' },
    ],
  },
  {
    regel: 'R12',
    greift: [{ verboten: true }],
    greiftNicht: [{ verboten: false }, { verboten: null }],
  },
  {
    regel: 'R13',
    greift: [{ verantwortlich: '' }, { verantwortlich: '   ' }],
    greiftNicht: [{ verantwortlich: 'Lea Muster' }],
  },
];

describe('pruefpunkte', () => {
  it('liefert für ein sicheres Werkzeug nur die jährliche Prüfung', () => {
    expect(regeln(sicher())).toEqual(['R14']);
  });

  for (const fall of FAELLE) {
    describe(fall.regel, () => {
      for (const teil of fall.greift) {
        it(`greift bei ${JSON.stringify(teil)}`, () => {
          expect(regeln(sicher(teil))).toContain(fall.regel);
        });
      }
      for (const teil of fall.greiftNicht) {
        it(`greift nicht bei ${JSON.stringify(teil)}`, () => {
          expect(regeln(sicher(teil))).not.toContain(fall.regel);
        });
      }
    });
  }

  it('ordnet die Punkte nach Regelnummer', () => {
    const w = sicher({ personendaten: 'ja', avv: 'nein', standort: 'usa', verantwortlich: '' });
    expect(regeln(w)).toEqual(['R1', 'R2', 'R3', 'R13', 'R14']);
  });

  it('wertet ein frisch erfasstes Werkzeug vorsichtig aus', () => {
    const w = neuesWerkzeug('neu', 'Neu', new Date('2026-10-11T08:00:00Z'));
    expect(regeln(w)).toEqual(['R1', 'R2', 'R3', 'R5', 'R10', 'R13', 'R14']);
  });
});

describe('Status der Prüfpunkte', () => {
  const punkt = (w: Werkzeug, regel: RegelId) =>
    pruefpunkte(w, HEUTE).find((p) => p.regel === regel);

  it('ist offen, solange nichts gespeichert ist', () => {
    expect(punkt(sicher({ personendaten: 'ja' }), 'R1')?.status).toBe('offen');
  });

  it('übernimmt «erledigt» mit Datum', () => {
    const w = sicher({
      personendaten: 'ja',
      pruefungen: { R1: { status: 'erledigt', begruendung: '', datum: '2026-09-15' } },
    });
    expect(punkt(w, 'R1')).toMatchObject({ status: 'erledigt', datum: '2026-09-15' });
  });

  it('übernimmt «nicht zutreffend» mit Begründung', () => {
    const w = sicher({
      personendaten: 'ja',
      pruefungen: {
        R1: { status: 'nicht-zutreffend', begruendung: 'Nur Testdaten', datum: '2026-09-15' },
      },
    });
    expect(punkt(w, 'R1')).toMatchObject({
      status: 'nicht-zutreffend',
      begruendung: 'Nur Testdaten',
    });
  });

  it('zeigt einen gespeicherten Status nicht, wenn die Regel nicht mehr greift', () => {
    const w = sicher({
      pruefungen: { R1: { status: 'erledigt', begruendung: '', datum: '2026-09-15' } },
    });
    expect(regeln(w)).not.toContain('R1');
  });

  it('hält die jährliche Prüfung 364 Tage für erledigt', () => {
    const w = sicher({
      pruefungen: { R14: { status: 'erledigt', begruendung: '', datum: '2025-10-12' } },
    });
    expect(punkt(w, 'R14')?.status).toBe('erledigt');
  });

  it('öffnet die jährliche Prüfung nach 365 Tagen wieder und nennt das letzte Datum', () => {
    const w = sicher({
      pruefungen: { R14: { status: 'erledigt', begruendung: '', datum: '2025-10-11' } },
    });
    expect(punkt(w, 'R14')).toMatchObject({ status: 'offen', zuletzt: '2025-10-11' });
  });

  it('lässt andere erledigte Punkte nicht ablaufen', () => {
    const w = sicher({
      personendaten: 'ja',
      pruefungen: { R1: { status: 'erledigt', begruendung: '', datum: '2020-01-01' } },
    });
    expect(punkt(w, 'R1')?.status).toBe('erledigt');
  });
});

describe('Dringlichkeit und Quellen', () => {
  it('folgt der festen Einteilung', () => {
    const einteilung = Object.fromEntries(REGELN.map((r) => [r.id, r.dringlichkeit]));
    expect(einteilung).toEqual({
      R1: 'mittel',
      R2: 'hoch',
      R3: 'hoch',
      R4: 'hoch',
      R5: 'mittel',
      R6: 'mittel',
      R7: 'hoch',
      R8: 'mittel',
      R9: 'mittel',
      R10: 'mittel',
      R11: 'mittel',
      R12: 'hoechste',
      R13: 'niedrig',
      R14: 'niedrig',
    });
  });

  it('nennt je Regel die Gesetzesstelle', () => {
    const stellen = Object.fromEntries(
      REGELN.map((r) => [r.id, r.quellen.map((q) => q.text).join(', ')]),
    );
    expect(stellen).toEqual({
      R1: 'DSG Art. 19',
      R2: 'DSG Art. 9',
      R3: 'DSG Art. 16, DSG Art. 17',
      R4: 'DSG Art. 6 Abs. 7, DSG Art. 22',
      R5: 'DSG Art. 7, DSG Art. 8',
      R6: 'DSG Art. 8',
      R7: 'DSG Art. 21',
      R8: 'DSG Art. 22',
      R9: 'KI-VO Art. 50',
      R10: 'KI-VO Art. 4',
      R11: 'KI-VO Art. 26, KI-VO Anhang III',
      R12: 'KI-VO Art. 5',
      R13: 'gute Praxis',
      R14: 'gute Praxis',
    });
  });

  it('verlinkt das DSG auf fedlex und die KI-VO auf EUR-Lex', () => {
    const urls = REGELN.flatMap((r) => r.quellen.map((q) => q.url));
    expect(urls).toContain('https://www.fedlex.admin.ch/eli/cc/2022/491/de#art_19');
    expect(urls).toContain('https://eur-lex.europa.eu/eli/reg/2024/1689/oj/deu#art_50');
    expect(urls).toContain('https://eur-lex.europa.eu/eli/reg/2024/1689/oj/deu#anx_III');
  });
});

describe('Begründung je Lage', () => {
  const grund = (w: Werkzeug, regel: RegelId) =>
    pruefpunkte(w, HEUTE).find((p) => p.regel === regel)?.grund ?? '';

  it('nennt bei Anbietern in den USA das Data Privacy Framework', () => {
    expect(grund(sicher({ personendaten: 'ja', standort: 'usa' }), 'R3')).toContain(
      'Data Privacy Framework',
    );
    expect(grund(sicher({ personendaten: 'ja', standort: 'andere' }), 'R3')).not.toContain(
      'Data Privacy Framework',
    );
  });

  it('spricht bei EU-Bezug von Pflicht, sonst von Empfehlung (Kennzeichnung)', () => {
    expect(grund(sicher({ ausgabenDritte: true, euBezug: true }), 'R9')).toContain('Pflicht');
    expect(grund(sicher({ ausgabenDritte: true, euBezug: false }), 'R9')).toContain(
      'Empfehlung',
    );
  });

  it('spricht bei EU-Bezug von Pflicht, sonst von Empfehlung (KI-Kompetenz)', () => {
    expect(grund(sicher({ geschult: false, euBezug: true }), 'R10')).toContain('Pflicht');
    expect(grund(sicher({ geschult: false, euBezug: false }), 'R10')).toContain('Empfehlung');
  });
});
