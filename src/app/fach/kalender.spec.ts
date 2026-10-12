import { describe, expect, it } from 'vitest';

import { beispielInventar } from './beispiel';
import { leeresInventar, type Inventar } from './inventar';
import { alsIcs, falten, jahresTermine, text, type Termin } from './kalender';
import { neuesWerkzeug, type Werkzeug } from './werkzeug';

const HEUTE = '2026-10-12';
const JETZT = new Date('2026-10-12T08:30:00Z');
const BASIS = 'https://ki-inventar.example/';

function mitPruefung(id: string, datum: string, status: 'erledigt' | 'nicht-zutreffend' = 'erledigt'): Werkzeug {
  return { ...neuesWerkzeug(id, `Werkzeug ${id}`, JETZT), pruefungen: { R14: { status, begruendung: '', datum } } };
}

function inventar(...werkzeuge: Werkzeug[]): Inventar {
  return { ...leeresInventar(), werkzeuge };
}

describe('jahresTermine', () => {
  it('setzt den Termin ein Jahr nach der festgehaltenen Überprüfung', () => {
    const { termine, ohneTermin } = jahresTermine(beispielInventar(), HEUTE);
    expect(termine).toEqual([{ werkzeugId: 'beispiel-copilot', name: 'Microsoft Copilot', faellig: '2027-09-15' }]);
    expect(ohneTermin).toBe(6);
  });

  it('lässt abgelaufene Überprüfungen weg; sie sind schon wieder offen', () => {
    const { termine, ohneTermin } = jahresTermine(inventar(mitPruefung('a', '2025-10-12')), HEUTE);
    expect(termine).toEqual([]);
    expect(ohneTermin).toBe(1);
  });

  it('nimmt auch «trifft nicht zu» und sortiert nach Datum', () => {
    const { termine } = jahresTermine(
      inventar(mitPruefung('a', '2026-10-01'), mitPruefung('b', '2026-03-01', 'nicht-zutreffend')),
      HEUTE,
    );
    expect(termine.map((t) => t.faellig)).toEqual(['2027-03-01', '2027-10-01']);
  });
});

describe('alsIcs', () => {
  const termin: Termin = { werkzeugId: 'beispiel-copilot', name: 'Microsoft Copilot', faellig: '2027-09-15' };
  const zeilen = (ics: string) => ics.replace(/\r\n /g, '').split('\r\n');

  it('schreibt einen ganztägigen Termin mit Erinnerung, Zeilenende CRLF', () => {
    const ics = alsIcs([termin], JETZT, BASIS);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/\n/);
    expect(zeilen(ics)).toEqual(
      expect.arrayContaining([
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'UID:beispiel-copilot-r14-2027-09-15@ki-inventar',
        'DTSTAMP:20261012T083000Z',
        'DTSTART;VALUE=DATE:20270915',
        'DTEND;VALUE=DATE:20270916',
        'SUMMARY:KI-Inventar: «Microsoft Copilot» jährlich überprüfen',
        'URL:https://ki-inventar.example/werkzeug/beispiel-copilot',
        'TRIGGER:PT9H',
      ]),
    );
  });

  it('ist ohne Termine ein leerer, gültiger Kalender', () => {
    expect(zeilen(alsIcs([], JETZT, BASIS))).toEqual([
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Adam Baranyi//KI-Inventar//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'END:VCALENDAR',
      '',
    ]);
  });

  it('maskiert Komma, Strichpunkt, Backslash und Zeilenumbrüche im Namen', () => {
    expect(text('A, B; C\\D\nE')).toBe('A\\, B\\; C\\\\D\\nE');
    const ics = alsIcs([{ ...termin, name: 'Neu\nBEGIN:VEVENT' }], JETZT, BASIS);
    expect(zeilen(ics).filter((z) => z === 'BEGIN:VEVENT')).toHaveLength(1);
  });

  it('faltet lange Zeilen nach 75 Bytes, ohne ein Zeichen zu teilen', () => {
    const lang = `SUMMARY:${'Überprüfung «ä» '.repeat(12)}`;
    const gefaltet = falten(lang);
    for (const teil of gefaltet.split('\r\n')) {
      expect(new TextEncoder().encode(teil).length).toBeLessThanOrEqual(75);
    }
    expect(gefaltet.replace(/\r\n /g, '')).toBe(lang);
  });
});
