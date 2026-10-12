import { describe, expect, it } from 'vitest';

import {
  alsBearbeitungsverzeichnis,
  bearbeitungen,
  mitBesonderenDaten,
  verzeichnisZeilen,
} from './bearbeitungsverzeichnis';
import { beispielInventar } from './beispiel';
import { leeresInventar, type Inventar } from './inventar';
import { neuesWerkzeug, type Werkzeug } from './werkzeug';

const JETZT = new Date('2026-10-12T08:00:00Z');
const zeilen = (csv: string) => csv.replace(/^﻿/, '').split('\r\n');

function werkzeug(teil: Partial<Werkzeug>): Werkzeug {
  return { ...neuesWerkzeug('a', 'Notion KI', JETZT), ...teil };
}

function inventar(firma: string, ...werkzeuge: Werkzeug[]): Inventar {
  return { ...leeresInventar(), firma, werkzeuge };
}

describe('Bearbeitungsverzeichnis (Art. 12 DSG)', () => {
  it('führt die Angaben nach Art. 12 Abs. 2 als Spalten, mit BOM für Excel', () => {
    const csv = alsBearbeitungsverzeichnis(leeresInventar());
    expect(csv.startsWith('﻿')).toBe(true);
    expect(zeilen(csv)[0]).toBe(
      'Bearbeitung (Werkzeug);Verantwortlicher;Ansprechperson;Bearbeitungszweck;' +
        'Kategorien betroffener Personen;Kategorien bearbeiteter Personendaten;Kategorien der Empfänger;' +
        'Aufbewahrungsdauer;Massnahmen zur Datensicherheit;Bekanntgabe ins Ausland',
    );
  });

  it('nimmt jedes Werkzeug mit Personendaten auf, auch wenn es offen ist, aber keines ohne', () => {
    const beispiel = beispielInventar();
    expect(bearbeitungen(beispiel).map((w) => w.name)).toEqual([
      'Bewerbungs-Screening',
      'Chatbot auf der Website',
      'ChatGPT',
      'DeepL',
      'Microsoft Copilot',
      'Otter',
    ]);
    const offen = inventar('', werkzeug({ personendaten: null }), { ...werkzeug({ personendaten: 'nein' }), id: 'b' });
    expect(bearbeitungen(offen)).toHaveLength(1);
  });

  it('übernimmt, was bekannt ist, und markiert den Rest als «zu ergänzen»', () => {
    const w = werkzeug({
      anbieter: 'Notion Labs',
      standort: 'usa',
      kategorie: 'personal',
      zweck: 'Notizen aus Bewerbungsgesprächen',
      verantwortlich: 'Lea Muster',
      zugang: 'firma',
      personendaten: 'besonders',
      training: 'ja',
      avv: 'nein',
      geschult: true,
    });
    expect(verzeichnisZeilen(inventar('Muster AG', w))).toEqual([
      [
        'Notion KI',
        'Muster AG',
        'Lea Muster',
        'Personal und Bewerbungen: Notizen aus Bewerbungsgesprächen',
        'Bewerbende, Mitarbeitende (prüfen)',
        'Personendaten, auch besonders schützenswerte (Art präzisieren)',
        'Anbieter als Auftragsbearbeiter: Notion Labs, kein Vertrag zur Auftragsbearbeitung',
        'zu ergänzen (wenn möglich Dauer oder Kriterien)',
        'Erfasst: Firmenkonto, Training mit Eingaben ausgeschlossen, Mitarbeitende geschult. Weitere Massnahmen zu ergänzen',
        'USA: angemessen nur mit Zertifizierung nach dem Swiss-U.S. Data Privacy Framework, sonst Garantie nach Art. 16 Abs. 2 DSG zu ergänzen',
      ],
    ]);
  });

  it('nennt ohne Antworten überall «zu ergänzen» und einen offenen Standort', () => {
    const [zeile] = verzeichnisZeilen(inventar('', werkzeug({})));
    expect(zeile?.slice(0, 5)).toEqual(['Notion KI', 'zu ergänzen', 'zu ergänzen', 'zu ergänzen', 'zu ergänzen']);
    expect(zeile?.at(-1)).toBe('Standort unklar, Staat und Garantien zu ergänzen');
  });

  it('wertet die EU als angemessen und die Schweiz als keine Bekanntgabe ins Ausland', () => {
    const ausland = (standort: Werkzeug['standort']) =>
      verzeichnisZeilen(inventar('', werkzeug({ standort })))[0]?.at(-1);
    expect(ausland('eu')).toBe('EU oder EWR: angemessener Datenschutz (Anhang 1 DSV)');
    expect(ausland('ch')).toBe('keine (Anbieter in der Schweiz)');
    expect(ausland('andere')).toBe('Staat und Garantien nach Art. 16 Abs. 2 DSG zu ergänzen');
  });

  it('zählt Werkzeuge mit besonders schützenswerten Personendaten', () => {
    expect(mitBesonderenDaten(beispielInventar())).toBe(1);
  });
});
