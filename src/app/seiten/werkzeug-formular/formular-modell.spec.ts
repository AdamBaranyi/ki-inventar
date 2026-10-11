import { describe, expect, it } from 'vitest';

import { beispielInventar } from '../../fach/beispiel';
import { antwortenAus, antwortenAusFormular, baueFormular } from './formular-modell';

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
});
