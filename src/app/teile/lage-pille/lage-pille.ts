import { Component, input } from '@angular/core';

import type { Lage } from '../../fach/auswertung';
import { TEXTE } from '../../texte/de-CH';

/** Stand eines Werkzeugs in einer Pille: Stopp, offene Punkte oder erledigt. */
@Component({
  selector: 'ki-lage-pille',
  template: `
    @if (lage().stopp) {
      <span class="pille pille--stopp">{{ t.stopp }}</span>
    } @else if (lage().offen > 0) {
      <span class="pille pille--offen">{{ t.offenPille(lage().offen) }}</span>
    } @else {
      <span class="pille pille--erledigt">{{ t.alleErledigt }}</span>
    }
  `,
})
export class LagePille {
  readonly lage = input.required<Lage>();
  protected readonly t = TEXTE.uebersicht;
}
