import { booleanAttribute, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { QUELLCODE, TEXTE } from '../../texte/de-CH';

/**
 * Hinweis «keine Rechtsberatung», Rechtsstand und Links. Steht zweimal im Rahmen:
 * kurz in der Seitenleiste (Desktop) und ausführlich unter dem Inhalt (Handy);
 * das CSS zeigt je Breite einen.
 */
@Component({
  selector: 'ki-fuss',
  imports: [RouterLink],
  template: `
    <footer class="fuss" [class.fuss--kurz]="kurz()">
      <p class="fuss__rechtsberatung">{{ kurz() ? t.keineRechtsberatungKurz : t.keineRechtsberatung }}</p>
      <p>{{ t.rechtsstand }}</p>
      @if (links()) {
        <ul class="fuss__links">
          <li><a routerLink="/impressum">{{ t.impressum }}</a></li>
          <li><a routerLink="/datenschutz">{{ t.datenschutz }}</a></li>
          <li><a [href]="quellcode" rel="noopener">{{ t.quellcode }}</a></li>
        </ul>
      }
    </footer>
  `,
})
export class Fuss {
  readonly kurz = input(false, { transform: booleanAttribute });
  /** Auf «Mehr» stehen die Links schon in der Liste darüber. */
  readonly links = input(true);
  protected readonly t = TEXTE.app;
  protected readonly quellcode = QUELLCODE;
}
