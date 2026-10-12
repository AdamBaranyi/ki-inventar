import { Component, computed, input } from '@angular/core';

import type { Fortschritt } from '../../fach/auswertung';
import { TEXTE } from '../../texte/de-CH';

/**
 * Wie viele Prüfpunkte geklärt sind: Zahl, Balken aus Tinte und Leuchtstift, Legende.
 * Der Balken ist Schmuck für das Auge; dasselbe steht als Text daneben.
 */
@Component({
  selector: 'ki-fortschritt',
  host: { class: 'karte fortschritt', '[class.fortschritt--klein]': 'klein()' },
  template: `
    @let s = stand();
    <p class="fortschritt__satz">
      <span class="fortschritt__zahl">{{ s.erledigt }}</span>&ngsp;<span>{{ satz() }}</span>
    </p>
    <div class="balken" aria-hidden="true">
      @if (s.erledigt > 0) {
        <span class="balken__teil balken__teil--erledigt" [style.flex-grow]="s.erledigt"></span>
      }
      @if (s.offen > 0) {
        <span class="balken__teil balken__teil--offen" [style.flex-grow]="s.offen"></span>
      }
    </div>
    @if (!klein()) {
      <ul class="legende">
        <li><span class="legende__punkt legende__punkt--offen"></span>{{ offenText() }}</li>
        <li><span class="legende__punkt legende__punkt--erledigt"></span>{{ t.erledigt(s.erledigt) }}</li>
      </ul>
    }
  `,
})
export class FortschrittKarte {
  readonly stand = input.required<Fortschritt>();
  /** Klein auf der Seite eines Werkzeugs: ohne Legende, Satz kürzer. */
  readonly klein = input(false);
  protected readonly t = TEXTE.fortschritt;
  protected readonly satz = computed(() =>
    this.klein() ? this.t.vonKurz(this.stand().gesamt) : this.t.vonGesamt(this.stand().gesamt),
  );
  protected readonly offenText = computed(() => {
    const s = this.stand();
    return this.t.offen(s.offen, s.sofort, s.hoch);
  });
}
