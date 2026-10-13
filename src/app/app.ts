import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet, type ActivatedRouteSnapshot } from '@angular/router';
import { filter } from 'rxjs';

import { DarstellungDienst } from './daten/darstellung';
import { InventarDienst } from './daten/inventar-dienst';
import { Uhr } from './daten/uhr';
import { zahlen } from './fach/auswertung';
import { naviZustand, type NaviZustand } from './navi-zustand';
import { DarstellungWahl } from './teile/darstellung-wahl/darstellung-wahl';
import { Fuss } from './teile/fuss/fuss';
import { Marke } from './teile/marke/marke';
import { Zeichen, type ZeichenName } from './teile/zeichen/zeichen';
import { TEXTE } from './texte/de-CH';

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

@Component({
  selector: 'ki-root',
  imports: [RouterOutlet, RouterLink, Marke, Zeichen, DarstellungWahl, Fuss],
  templateUrl: './app.html',
  host: { class: 'app', '[class.app--ablauf]': 'ablauf()' },
})
export class App {
  protected readonly t = TEXTE.app;
  protected readonly eintraege = EINTRAEGE;
  protected readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  /** Im Ablauf (Formular) blendet das Handy Kopf und Tab-Leiste aus. */
  protected readonly ablauf = signal(false);
  /** Leer bis zur ersten Navigation, damit kein Eintrag vorschnell markiert ist. */
  private readonly pfad = signal('');
  protected readonly zustand = computed<Record<string, NaviZustand>>(() => {
    const pfad = this.pfad();
    return Object.fromEntries(EINTRAEGE.map((e) => [e.pfad, naviZustand(e.pfad, pfad)] as const));
  });
  protected readonly aufMehr = computed(() => this.pfad() === '/mehr');
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
