import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { fortschritt, nachDringlichkeit } from '../../fach/auswertung';
import { datumCh } from '../../fach/datum';
import { pruefpunkte, type Pruefpunkt as Punkt } from '../../fach/regeln';
import type { Werkzeug } from '../../fach/werkzeug';
import { FortschrittKarte } from '../../teile/fortschritt/fortschritt';
import { Pruefpunkt } from '../../teile/pruefpunkt/pruefpunkt';
import { Zeichen } from '../../teile/zeichen/zeichen';
import { TEXTE } from '../../texte/de-CH';
import { antwortGruppen } from './antwort-zeilen';

const M = TEXTE.karte.merkmale;

/** Die wichtigsten Antworten als Merkmale im Kopf, etwa «USA» oder «Kein AVV». */
function merkmale(w: Werkzeug): string[] {
  return [
    w.standort && w.standort !== 'unbekannt' ? M.standort[w.standort] : '',
    w.personendaten ? M.personendaten[w.personendaten] : '',
    w.zugang ? M.zugang[w.zugang] : '',
    w.avv ? M.avv[w.avv] : '',
    w.euBezug ? M.euBezug : '',
  ].filter(Boolean);
}

/** Ein Werkzeug: Kopf, Fortschritt, Prüfpunkte als Checkliste, darunter die Antworten. */
@Component({
  selector: 'ki-werkzeug-karte',
  imports: [RouterLink, FortschrittKarte, Pruefpunkt, Zeichen],
  templateUrl: './werkzeug-karte.html',
})
export class WerkzeugKarte {
  readonly id = input.required<string>();

  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  private readonly router = inject(Router);
  protected readonly t = TEXTE.karte;
  protected readonly f = TEXTE.formular;
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('loeschDialog');
  /** Zeigt die Adresse auf einen Punkt (#punkt-…), beginnt er aufgeklappt. */
  protected readonly fragment = toSignal(inject(ActivatedRoute).fragment);

  protected readonly werkzeug = computed(() =>
    this.dienst.inventar().werkzeuge.find((w) => w.id === this.id()),
  );
  protected readonly punkte = computed(() => {
    const w = this.werkzeug();
    return w ? nachDringlichkeit(pruefpunkte(w, this.uhr.heute())) : [];
  });
  protected readonly fortschritt = computed(() => fortschritt(this.punkte()));
  protected readonly merkmale = computed(() => {
    const w = this.werkzeug();
    return w ? merkmale(w) : [];
  });
  protected readonly gruppen = computed(() => {
    const w = this.werkzeug();
    return w ? antwortGruppen(w) : [];
  });
  protected readonly initiale = computed(() =>
    (this.werkzeug()?.name.trim().charAt(0) ?? '').toLocaleUpperCase('de-CH'),
  );
  protected readonly erfasst = computed(() => {
    const w = this.werkzeug();
    return w ? this.t.erfasst(datumCh(w.erfasst)) : '';
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const w = this.werkzeug();
      if (w) title.setTitle(`${w.name} – ${TEXTE.app.name}`);
    });
  }

  protected kennung(punkt: Punkt) {
    return `punkt-${punkt.werkzeugId}-${punkt.regel}`;
  }

  protected frageLoeschen() {
    this.dialog()?.nativeElement.showModal();
  }

  protected schliessen() {
    this.dialog()?.nativeElement.close();
  }

  protected loesche() {
    const w = this.werkzeug();
    this.schliessen();
    if (w && this.dienst.loesche(w.id)) void this.router.navigate(['/']);
  }
}
