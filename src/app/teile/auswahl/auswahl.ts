import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface Option<T> {
  wert: T;
  text: string;
}

/** Eine Frage mit Auswahl als Gruppe grosser Tippflächen (Radio-Knöpfe). */
@Component({
  selector: 'ki-auswahl',
  imports: [ReactiveFormsModule],
  template: `
    <fieldset class="wahl" [attr.aria-describedby]="hilfe() ? name() + '-hilfe' : null">
      <legend class="wahl__frage">{{ frage() }}</legend>
      @if (hilfe()) {
        <p class="feld__hilfe" [id]="name() + '-hilfe'">{{ hilfe() }}</p>
      }
      <div class="wahl__optionen" [class.wahl__optionen--zeile]="zeile()">
        @for (option of optionen(); track option.text) {
          <label class="wahl__option">
            <input type="radio" [name]="name()" [value]="option.wert" [formControl]="steuerung()" />
            {{ option.text }}
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class Auswahl<T> {
  readonly steuerung = input.required<FormControl<T | null>>();
  readonly optionen = input.required<readonly Option<T>[]>();
  readonly frage = input.required<string>();
  readonly name = input.required<string>();
  readonly hilfe = input<string>();
  readonly zeile = input(false);
}

/** Wandelt eine Beschriftungstabelle in Optionen um, in der Reihenfolge der Werte. */
export function optionen<K extends string>(
  werte: readonly K[],
  texte: Record<K, string>,
): Option<K>[] {
  return werte.map((wert) => ({ wert, text: texte[wert] }));
}

export const JA_NEIN_OPTIONEN: readonly Option<boolean>[] = [
  { wert: true, text: 'Ja' },
  { wert: false, text: 'Nein' },
];
