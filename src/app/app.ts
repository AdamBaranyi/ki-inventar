import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  type ActivatedRouteSnapshot,
} from '@angular/router';
import { filter } from 'rxjs';

import { DarstellungDienst } from './daten/darstellung';
import { InventarDienst } from './daten/inventar-dienst';
import { Uhr } from './daten/uhr';
import { zahlen } from './fach/auswertung';
import { DarstellungWahl } from './teile/darstellung-wahl/darstellung-wahl';
import { Marke } from './teile/marke/marke';
import { Zeichen, type ZeichenName } from './teile/zeichen/zeichen';
import { QUELLCODE, TEXTE } from './texte/de-CH';

interface Eintrag {
  pfad: string;
  text: string;
  zeichen: ZeichenName;
  /** «breit» nur in der Seitenleiste, «handy» nur in der Tab-Leiste. */
  wo: 'immer' | 'breit' | 'handy';
}

const NAV = TEXTE.app.nav;
const EINTRAEGE: readonly Eintrag[] = [
  { pfad: '/', text: NAV.uebersicht, zeichen: 'start', wo: 'immer' },
  { pfad: '/pruefpunkte', text: NAV.pruefpunkte, zeichen: 'punkte', wo: 'immer' },
  { pfad: '/fristen', text: NAV.fristen, zeichen: 'fristen', wo: 'immer' },
  { pfad: '/verzeichnis', text: NAV.verzeichnis, zeichen: 'druck', wo: 'breit' },
  { pfad: '/daten', text: NAV.daten, zeichen: 'daten', wo: 'breit' },
  { pfad: '/mehr', text: NAV.mehr, zeichen: 'mehr', wo: 'handy' },
];

/** Seiten, die am Handy unter «Mehr» liegen; dort bleibt «Mehr» markiert. */
const UNTER_MEHR = ['/verzeichnis', '/daten', '/impressum', '/datenschutz'];

@Component({
  selector: 'ki-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Marke, Zeichen, DarstellungWahl],
  templateUrl: './app.html',
  host: { class: 'app', '[class.app--ablauf]': 'ablauf()' },
})
export class App {
  protected readonly t = TEXTE.app;
  protected readonly quellcode = QUELLCODE;
  protected readonly eintraege = EINTRAEGE;
  protected readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  /** Im Ablauf (Formular) blendet das Handy Kopf und Tab-Leiste aus. */
  protected readonly ablauf = signal(false);
  private readonly pfad = signal('/');
  protected readonly unterMehr = computed(() => UNTER_MEHR.some((p) => this.pfad().startsWith(p)));
  protected readonly offen = computed(() => zahlen(this.dienst.inventar(), this.uhr.heute()).offen);

  constructor() {
    // Hält `data-darstellung` an <html> mit der Wahl im Einklang (public/darstellung.js setzt sie zuerst).
    inject(DarstellungDienst);
    const router = inject(Router);
    let erste = true;
    router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.pfad.set(e.urlAfterRedirects.split(/[?#]/)[0] ?? '/');
        this.ablauf.set(tiefste(router.routerState.snapshot.root).data['ablauf'] === true);
        // Nach einem Seitenwechsel steht der Fokus auf der neuen Überschrift, damit
        // ein Screenreader sie ansagt. Der erste Aufbau bleibt unberührt.
        if (!erste) requestAnimationFrame(fokusAufTitel);
        erste = false;
      });
  }

  protected zumInhalt(ereignis: Event) {
    ereignis.preventDefault();
    document.getElementById('inhalt')?.focus();
  }
}

function tiefste(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return route.firstChild ? tiefste(route.firstChild) : route;
}

function fokusAufTitel() {
  document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
}
