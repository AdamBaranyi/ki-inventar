import { FormBuilder, Validators, type AbstractControl, type ValidationErrors } from '@angular/forms';

import {
  GRENZEN,
  type Antworten,
  type Kategorie,
  type Standort,
  type Werkzeug,
} from '../../fach/werkzeug';

const fb = new FormBuilder();
const nn = fb.nonNullable;

/** Nur Leerzeichen zählen nicht als Name. */
export function nichtLeer(feld: AbstractControl<string>): ValidationErrors | null {
  return feld.value.trim() === '' ? { required: true } : null;
}

export function ganzzahl(feld: AbstractControl<number | null>): ValidationErrors | null {
  return feld.value === null || Number.isInteger(feld.value) ? null : { ganzzahl: true };
}

/** Ein Steuerelement je Antwort; Auswahlfragen beginnen offen (null). */
export function baueFormular() {
  return fb.group({
    name: nn.control('', [nichtLeer, Validators.maxLength(GRENZEN.name)]),
    anbieter: nn.control('', Validators.maxLength(GRENZEN.anbieter)),
    standort: fb.control<Standort | null>(null),
    kategorie: fb.control<Kategorie | null>(null),
    zweck: nn.control('', Validators.maxLength(GRENZEN.zweck)),
    abteilungen: nn.control('', Validators.maxLength(GRENZEN.abteilungen)),
    anzahl: fb.control<number | null>(null, [
      Validators.min(0),
      Validators.max(GRENZEN.anzahl),
      ganzzahl,
    ]),
    verantwortlich: nn.control('', Validators.maxLength(GRENZEN.verantwortlich)),
    zugang: fb.control<Antworten['zugang']>(null),
    personendaten: fb.control<Antworten['personendaten']>(null),
    geheimnisse: fb.control<boolean | null>(null),
    training: fb.control<Antworten['training']>(null),
    avv: fb.control<Antworten['avv']>(null),
    ausgabenDritte: fb.control<boolean | null>(null),
    entscheidungen: fb.control<boolean | null>(null),
    euBezug: fb.control<boolean | null>(null),
    geschult: fb.control<boolean | null>(null),
    verboten: fb.control<boolean | null>(null),
  });
}

export type Formular = ReturnType<typeof baueFormular>;

/** Die Antworten für das Formular; «unbekannt» und «unklar» erscheinen als «Weiss ich nicht». */
export function antwortenAus(werkzeug: Werkzeug): Antworten {
  const { id: _id, pruefungen: _p, erfasst: _e, geaendert: _g, ...antworten } = werkzeug;
  return {
    ...antworten,
    standort: antworten.standort === 'unbekannt' ? null : antworten.standort,
    training: antworten.training === 'unbekannt' ? null : antworten.training,
    avv: antworten.avv === 'unklar' ? null : antworten.avv,
  };
}

/** Die Werte des Formulars, Texte ohne Leerzeichen am Rand. */
export function antwortenAusFormular(form: Formular): Antworten {
  const werte = form.getRawValue();
  return {
    ...werte,
    name: werte.name.trim(),
    anbieter: werte.anbieter.trim(),
    zweck: werte.zweck.trim(),
    abteilungen: werte.abteilungen.trim(),
    verantwortlich: werte.verantwortlich.trim(),
  };
}
