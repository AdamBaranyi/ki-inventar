import { describe, expect, it } from 'vitest';

import { passendeVorlagen, VORLAGEN, wendeAn } from './vorlagen';
import { neuesWerkzeug, type Antworten } from './werkzeug';

function antworten(teil: Partial<Antworten> = {}): Antworten {
  const { id: _i, pruefungen: _p, erfasst: _e, geaendert: _g, ...rest } = neuesWerkzeug('a', 'X', new Date());
  return { ...rest, ...teil };
}

describe('Vorlagen', () => {
  it('findet Vorlagen am Namen, ohne Rücksicht auf Gross- und Kleinschreibung', () => {
    expect(passendeVorlagen('ChatGPT Team').map((v) => v.id)).toEqual(['chatgpt-privat', 'chatgpt-firma']);
    expect(passendeVorlagen('  deepl ').map((v) => v.id)).toEqual(['deepl-free', 'deepl-pro']);
    expect(passendeVorlagen('Micro').map((v) => v.id)).toEqual(['copilot-firma']);
  });

  it('schlägt erst ab drei Zeichen und nur bei Bekanntem etwas vor', () => {
    expect(passendeVorlagen('Ch')).toEqual([]);
    expect(passendeVorlagen('Notion KI')).toEqual([]);
  });

  it('füllt nur offene Antworten und lässt Beantwortetes stehen', () => {
    const chatgpt = VORLAGEN.find((v) => v.id === 'chatgpt-privat')!;
    expect(wendeAn(antworten(), chatgpt)).toMatchObject({ anbieter: 'OpenAI', zugang: 'privat', training: 'nein', avv: 'nein' });
    const schonBeantwortet = antworten({ anbieter: 'OpenAI Ireland Ltd', zugang: 'enterprise', avv: 'ja' });
    expect(wendeAn(schonBeantwortet, chatgpt)).toMatchObject({
      anbieter: 'OpenAI Ireland Ltd',
      zugang: 'enterprise',
      training: 'nein',
      avv: 'ja',
    });
  });

  it('setzt nie den Standort, die Personendaten oder den Zweck', () => {
    for (const vorlage of VORLAGEN) {
      const neu = wendeAn(antworten(), vorlage);
      expect(neu.standort, vorlage.id).toBeNull();
      expect(neu.personendaten, vorlage.id).toBeNull();
      expect(neu.kategorie, vorlage.id).toBeNull();
    }
  });

  it('belegt jede Vorlage mit mindestens einer Quelle über https', () => {
    for (const vorlage of VORLAGEN) {
      expect(vorlage.quellen.length, vorlage.id).toBeGreaterThan(0);
      for (const quelle of vorlage.quellen) expect(quelle.url, vorlage.id).toMatch(/^https:\/\//);
    }
    expect(new Set(VORLAGEN.map((v) => v.id)).size).toBe(VORLAGEN.length);
  });
});
