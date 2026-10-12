import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Zeichen, type ZeichenName } from '../../teile/zeichen/zeichen';
import { QUELLCODE, TEXTE } from '../../texte/de-CH';

interface Ziel {
  pfad: string;
  titel: string;
  text: string;
  zeichen?: ZeichenName;
}

const M = TEXTE.mehr;
const ZIELE: readonly Ziel[] = [
  { pfad: '/verzeichnis', titel: TEXTE.app.nav.verzeichnis, text: M.verzeichnis, zeichen: 'druck' },
  { pfad: '/daten', titel: TEXTE.app.nav.daten, text: M.daten, zeichen: 'daten' },
  { pfad: '/impressum', titel: TEXTE.titel.impressum, text: M.impressum },
  { pfad: '/datenschutz', titel: TEXTE.titel.datenschutz, text: M.datenschutz },
];

/** Am Handy der vierte Tab: was in der Seitenleiste des Desktops steht, und das Rechtliche. */
@Component({
  selector: 'ki-mehr-seite',
  imports: [RouterLink, Zeichen],
  template: `
    <section class="mehr-seite">
      <h1 tabindex="-1">{{ titel }}</h1>
      <ul class="karte zeilen">
        @for (ziel of ziele; track ziel.pfad) {
          <li>
            <a class="zeile" [routerLink]="ziel.pfad">
              @if (ziel.zeichen; as zeichen) {
                <ki-zeichen class="mehr-seite__zeichen" [name]="zeichen" />
              }
              <span class="zeile__text">
                <span class="zeile__titel">{{ ziel.titel }}<span class="unsichtbar">,</span></span>
                <span class="zeile__meta">{{ ziel.text }}</span>
              </span>
              <ki-zeichen class="zeile__pfeil" name="weiter" />
            </a>
          </li>
        }
        <li>
          <a class="zeile" [href]="quellcode" rel="noopener">
            <span class="zeile__text">
              <span class="zeile__titel">{{ m.quellcode }}<span class="unsichtbar">,</span></span>
              <span class="zeile__meta">{{ m.quellcodeText }}</span>
            </span>
            <ki-zeichen class="zeile__pfeil" name="weiter" />
          </a>
        </li>
      </ul>
      <p class="leise">{{ lokal }}</p>
    </section>
  `,
})
export class MehrSeite {
  protected readonly titel = TEXTE.titel.mehr;
  protected readonly ziele = ZIELE;
  protected readonly m = M;
  protected readonly quellcode = QUELLCODE;
  protected readonly lokal = TEXTE.app.lokal;
}
