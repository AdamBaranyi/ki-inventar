import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, skip } from 'rxjs';

import { InventarDienst } from './daten/inventar-dienst';
import { Marke } from './teile/marke/marke';
import { QUELLCODE, TEXTE } from './texte/de-CH';

@Component({
  selector: 'ki-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Marke],
  templateUrl: './app.html',
})
export class App {
  protected readonly t = TEXTE.app;
  protected readonly quellcode = QUELLCODE;
  protected readonly dienst = inject(InventarDienst);
  /** Nur am Handy: Die Navigation klappt hinter «Menü» auf. */
  protected readonly menueOffen = signal(false);

  constructor() {
    // Nach einem Seitenwechsel steht der Fokus auf der neuen Überschrift, damit
    // ein Screenreader sie ansagt. Der erste Aufbau bleibt unberührt.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menueOffen.set(false);
        requestAnimationFrame(fokusAufTitel);
      });
  }

  protected schliesseMenue() {
    if (!this.menueOffen()) return;
    this.menueOffen.set(false);
    document.querySelector<HTMLElement>('.menue-knopf')?.focus();
  }

  protected zumInhalt(ereignis: Event) {
    ereignis.preventDefault();
    document.getElementById('inhalt')?.focus();
  }
}

function fokusAufTitel() {
  document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
}
