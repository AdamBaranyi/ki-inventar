import { describe, expect, it } from 'vitest';

import { beispielInventar } from '../../fach/beispiel';
import { neuesWerkzeug } from '../../fach/werkzeug';
import { antwortenAus, antwortenAusFormular, baueFormular } from './formular-modell';
import { AUSWAHL_OPTIONEN, WEISS_NICHT } from './formular-optionen';
import { fehlerImSchritt, SCHRITTE, schrittNummer } from './schritte';

describe('Formular', () => {
  it('verlangt einen Namen, auch wenn nur Leerzeichen dastehen', () => {
    const form = baueFormular();
    form.controls.name.setValue('   ');
    expect(form.controls.name.errors).toEqual({ required: true });
    form.controls.name.setValue('DeepL');
    expect(form.valid).toBe(true);
  });

  it('begrenzt den Namen auf 80 Zeichen', () => {
    const form = baueFormular();
    form.controls.name.setValue('x'.repeat(81));
    expect(form.controls.name.hasError('maxlength')).toBe(true);
  });

  it('nimmt nur ganze Zahlen ab 0 als Zahl der Nutzenden', () => {
    const form = baueFormular();
    for (const [wert, fehler] of [
      [1.5, 'ganzzahl'],
      [-1, 'min'],
      [100_001, 'max'],
    ] as const) {
      form.controls.anzahl.setValue(wert);
      expect(form.controls.anzahl.hasError(fehler), String(wert)).toBe(true);
    }
    form.controls.anzahl.setValue(12);
    expect(form.controls.anzahl.valid).toBe(true);
  });

  it('beginnt mit offenen Auswahlfragen', () => {
    expect(baueFormular().getRawValue().standort).toBeNull();
  });

  it('übernimmt alle Antworten eines Werkzeugs und gibt sie unverändert zurück', () => {
    const werkzeug = beispielInventar().werkzeuge[0]!;
    const form = baueFormular();
    form.setValue(antwortenAus(werkzeug));
    expect(antwortenAusFormular(form)).toEqual(antwortenAus(werkzeug));
  });

  it('entfernt Leerzeichen am Rand der Texte', () => {
    const form = baueFormular();
    form.patchValue({ name: '  Otter ', verantwortlich: ' Lea Muster  ' });
    expect(antwortenAusFormular(form)).toMatchObject({ name: 'Otter', verantwortlich: 'Lea Muster' });
  });

  it('zeigt ältere Antworten «unbekannt» und «unklar» als «Weiss ich nicht» (offen)', () => {
    const werkzeug = {
      ...neuesWerkzeug('a', 'A', new Date('2026-10-11T08:00:00Z')),
      standort: 'unbekannt' as const,
      training: 'unbekannt' as const,
      avv: 'unklar' as const,
    };
    expect(antwortenAus(werkzeug)).toMatchObject({ standort: null, training: null, avv: null });
  });
});

describe('«Weiss ich nicht»', () => {
  it('steht bei jeder Auswahl ausser dem Zweck, als letzte Möglichkeit', () => {
    const { kategorie, ...mitWeissNicht } = AUSWAHL_OPTIONEN;
    for (const [frage, liste] of Object.entries(mitWeissNicht)) {
      expect(liste.at(-1), frage).toBe(WEISS_NICHT);
    }
    expect(kategorie).not.toContain(WEISS_NICHT);
  });

  it('ersetzt «unbekannt» und «unklar»; das Formular bietet sie nicht mehr an', () => {
    const werte = [...AUSWAHL_OPTIONEN.standort, ...AUSWAHL_OPTIONEN.training, ...AUSWAHL_OPTIONEN.avv].map(
      (o) => o.wert,
    );
    expect(werte).not.toContain('unbekannt');
    expect(werte).not.toContain('unklar');
  });
});

describe('Schritte', () => {
  it('liest die Nummer aus der Adresse und begrenzt sie auf 1 bis 10', () => {
    for (const [wert, nummer] of [
      ['5', 5],
      ['10', 10],
      ['11', 10],
      ['0', 1],
      ['-3', 1],
      ['2.5', 1],
      ['x', 1],
      [undefined, 1],
    ] as const) {
      expect(schrittNummer(wert), String(wert)).toBe(nummer);
    }
  });

  it('verteilt jedes Feld des Formulars auf genau einen Schritt', () => {
    const felder = SCHRITTE.flatMap((s) => s.felder);
    expect([...felder].sort()).toEqual(Object.keys(baueFormular().controls).sort());
  });

  it('meldet nur die Fehler des gefragten Schritts', () => {
    const form = baueFormular();
    form.controls.anzahl.setValue(1.5);
    expect(fehlerImSchritt(form, 1)).toEqual(['name']);
    form.controls.name.setValue('Otter');
    expect(fehlerImSchritt(form, 1)).toEqual([]);
    expect(fehlerImSchritt(form, 3)).toEqual(['anzahl']);
  });
});
