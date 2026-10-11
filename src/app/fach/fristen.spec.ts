import { describe, expect, it } from 'vitest';

import { FRISTEN, giltSchon } from './fristen';

describe('Fristen', () => {
  it('stehen in zeitlicher Reihenfolge', () => {
    const daten = FRISTEN.map((f) => f.datum);
    expect(daten).toEqual([...daten].sort());
  });

  it('enthalten die geprüften Daten der KI-VO nach dem Digital-Omnibus', () => {
    expect(FRISTEN.map((f) => f.datum)).toEqual([
      '2023-09-01',
      '2025-02-02',
      '2025-08-02',
      '2026-07-27',
      '2026-08-02',
      '2026-12-02',
      '2026-12-31',
      '2027-12-02',
      '2028-08-02',
    ]);
  });

  it('kennzeichnen nur DSG und Schweizer Gesetz als ohne EU-Bezug', () => {
    expect(FRISTEN.filter((f) => !f.eu).map((f) => f.datum)).toEqual(['2023-09-01', '2026-12-31']);
  });

  it('gelten ab dem Tag selbst', () => {
    const transparenz = FRISTEN.find((f) => f.datum === '2026-08-02')!;
    expect(giltSchon(transparenz, '2026-08-01')).toBe(false);
    expect(giltSchon(transparenz, '2026-08-02')).toBe(true);
  });

  it('lassen einen geplanten Termin nie als geltend erscheinen', () => {
    const geplant = FRISTEN.find((f) => f.ungefaehr)!;
    expect(giltSchon(geplant, '2030-01-01')).toBe(false);
  });
});
