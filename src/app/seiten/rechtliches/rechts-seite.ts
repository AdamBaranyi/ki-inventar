import { Component, computed, input } from '@angular/core';

import { DATENSCHUTZ, IMPRESSUM } from '../../texte/de-CH-rechtliches';
import { TEXTE } from '../../texte/de-CH';

/** Impressum oder Datenschutz; welche Seite, steht in den Daten der Route. */
@Component({
  selector: 'ki-rechts-seite',
  template: `
    <section class="rechts-seite">
      <h1 tabindex="-1">{{ titel() }}</h1>
      @for (abschnitt of abschnitte(); track abschnitt.titel) {
        <section class="rechts-seite__abschnitt">
          <h2>{{ abschnitt.titel }}</h2>
          @for (absatz of abschnitt.absaetze; track $index) {
            <p>{{ absatz }}</p>
          }
          @if (abschnitt.links?.length) {
            <ul class="rechts-seite__links">
              @for (link of abschnitt.links; track link.href) {
                <li><a [href]="link.href" rel="noopener noreferrer">{{ link.text }}</a></li>
              }
            </ul>
          }
        </section>
      }
    </section>
  `,
})
export class RechtsSeite {
  readonly seite = input.required<'impressum' | 'datenschutz'>();
  protected readonly titel = computed(() => TEXTE.titel[this.seite()]);
  protected readonly abschnitte = computed(() => (this.seite() === 'impressum' ? IMPRESSUM : DATENSCHUTZ));
}
