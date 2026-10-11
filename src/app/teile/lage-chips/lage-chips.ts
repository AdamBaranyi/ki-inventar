import { Component, input } from '@angular/core';

import type { Lage } from '../../fach/auswertung';
import { TEXTE } from '../../texte/de-CH';

/** Status eines Werkzeugs in der Liste: Stopp, offene Punkte oder erledigt, dazu fehlende Angaben. */
@Component({
  selector: 'ki-lage-chips',
  host: { class: 'lage-chips' },
  template: `
    @if (lage().stopp) {
      <span class="chip chip--stopp">{{ t.stopp }}</span>
    } @else if (lage().offen > 0) {
      <span class="chip chip--offen">{{ t.offenChip(lage().offen) }}</span>
    } @else {
      <span class="chip chip--erledigt">{{ t.alleErledigt }}</span>
    }
    @if (lage().fehlend > 0) {
      <span class="chip chip--fehlend">{{ t.fehlend(lage().fehlend) }}</span>
    }
  `,
})
export class LageChips {
  readonly lage = input.required<Lage>();
  protected readonly t = TEXTE.uebersicht;
}
