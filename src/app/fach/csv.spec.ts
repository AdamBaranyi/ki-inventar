import { describe, expect, it } from 'vitest';

import { beispielInventar } from './beispiel';
import { alsCsv, csvFeld } from './csv';
import { leeresInventar } from './inventar';
import { neuesWerkzeug } from './werkzeug';

const HEUTE = '2026-10-11';
const KOPF =
  'Werkzeug;Anbieter;Standort;Zweck;Beschreibung;Abteilungen;Nutzende;Verantwortlich;Zugang;' +
  'Personendaten;Geschäftsgeheimnisse;Training ausgeschlossen;AVV;Ausgaben an Dritte;' +
  'Entscheidungen über Personen;EU-Bezug;Geschult;Verbotene Praktiken;Offene Prüfpunkte;' +
  'Erledigte Prüfpunkte;Nicht zutreffend';

const zeilen = (csv: string) => csv.replace(/^﻿/, '').split('\r\n');

describe('alsCsv', () => {
  it('beginnt mit BOM und Kopfzeile, damit Excel Umlaute und Spalten erkennt', () => {
    const csv = alsCsv(leeresInventar(), HEUTE);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(zeilen(csv)).toEqual([KOPF]);
  });

  it('schreibt je Werkzeug eine Zeile mit lesbaren Antworten', () => {
    const [, chatgpt] = zeilen(alsCsv(beispielInventar(), HEUTE));
    expect(chatgpt).toBe(
      'ChatGPT;OpenAI;USA;Texte und Mails;Entwürfe für Mails und Offerten, Zusammenfassungen von Dokumenten;' +
        'Treuhand, Sekretariat;9;;Private oder kostenlose Konten;Ja;Ja;Unbekannt;Nein;Nein;Nein;Nein;Nein;Nein;' +
        'Datenschutzerklärung ergänzen | Vertrag zur Auftragsbearbeitung abschliessen | ' +
        'Bekanntgabe ins Ausland prüfen | Training mit eigenen Eingaben ausschliessen | ' +
        'Firmenkonto statt privater Konten | KI-Kompetenz fördern | Verantwortliche Person benennen | ' +
        'Eintrag jährlich überprüfen;;',
    );
  });

  it('trennt erledigte und nicht zutreffende Punkte', () => {
    const csv = zeilen(alsCsv(beispielInventar(), HEUTE));
    const canva = csv.find((z) => z.startsWith('Canva KI;'))?.split(';') ?? [];
    expect(canva.at(-1)).toBe('KI-Inhalte kennzeichnen');
    expect(canva.at(-3)).toBe('KI-Kompetenz fördern | Eintrag jährlich überprüfen');
  });

  it('schreibt offene Antworten als «offen»', () => {
    const inventar = { ...leeresInventar(), werkzeuge: [neuesWerkzeug('n', 'Neu', new Date())] };
    const felder = zeilen(alsCsv(inventar, HEUTE))[1]?.split(';') ?? [];
    expect(felder.slice(8, 18)).toEqual(Array(10).fill('offen'));
  });
});

describe('csvFeld', () => {
  it('setzt Felder mit Trennzeichen, Anführungszeichen oder Umbruch in Anführungszeichen', () => {
    expect(csvFeld('a;b')).toBe('"a;b"');
    expect(csvFeld('sagt "Hallo"')).toBe('"sagt ""Hallo"""');
    expect(csvFeld('Zeile 1\nZeile 2')).toBe('"Zeile 1\nZeile 2"');
    expect(csvFeld('gewöhnlich')).toBe('gewöhnlich');
  });

  it('entschärft Formeln, damit Excel sie nicht ausführt', () => {
    expect(csvFeld('=HYPERLINK("https://example.org")')).toBe(`"'=HYPERLINK(""https://example.org"")"`);
    expect(csvFeld('+41 41 000 00 00')).toBe("'+41 41 000 00 00");
    expect(csvFeld('-1')).toBe("'-1");
    expect(csvFeld('@SUMME(A1)')).toBe("'@SUMME(A1)");
    expect(csvFeld('\tTab')).toBe("'\tTab");
  });
});
