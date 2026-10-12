import { Component, inject, input } from '@angular/core';

import { DARSTELLUNGEN, DarstellungDienst } from '../../daten/darstellung';
import { TEXTE } from '../../texte/de-CH';

/** Umschalter hell, dunkel, wie das Gerät. `name` trennt die Gruppen, wenn zwei sichtbar sind. */
@Component({
  selector: 'ki-darstellung-wahl',
  template: `
    <fieldset class="darstellung">
      <legend class="darstellung__titel">{{ t.titel }}</legend>
      <div class="umschalter darstellung__wahl">
        @for (darstellung of darstellungen; track darstellung) {
          <label class="umschalter__wahl">
            <input
              type="radio"
              [name]="name()"
              [checked]="dienst.wahl() === darstellung"
              (change)="dienst.waehle(darstellung)"
            />
            {{ t.optionen[darstellung] }}
          </label>
        }
      </div>
    </fieldset>
  `,
})
export class DarstellungWahl {
  readonly name = input.required<string>();
  protected readonly dienst = inject(DarstellungDienst);
  protected readonly darstellungen = DARSTELLUNGEN;
  protected readonly t = TEXTE.darstellung;
}
