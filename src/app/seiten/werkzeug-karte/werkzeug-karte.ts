import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { lage, nachDringlichkeit } from '../../fach/auswertung';
import { datumCh } from '../../fach/datum';
import { pruefpunkte } from '../../fach/regeln';
import { LageChips } from '../../teile/lage-chips/lage-chips';
import { Pruefpunkt } from '../../teile/pruefpunkt/pruefpunkt';
import { OPTIONEN, TEXTE } from '../../texte/de-CH';
import { antwortZeilen } from './antwort-zeilen';

/** Die Karteikarte eines Werkzeugs: Prüfpunkte zuerst, darunter die Antworten. */
@Component({
  selector: 'ki-werkzeug-karte',
  imports: [RouterLink, LageChips, Pruefpunkt],
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

  protected readonly werkzeug = computed(() =>
    this.dienst.inventar().werkzeuge.find((w) => w.id === this.id()),
  );
  protected readonly punkte = computed(() => {
    const w = this.werkzeug();
    return w ? nachDringlichkeit(pruefpunkte(w, this.uhr.heute())) : [];
  });
  protected readonly lage = computed(() => {
    const w = this.werkzeug();
    return w ? lage(w, this.uhr.heute()) : null;
  });
  protected readonly antworten = computed(() => {
    const w = this.werkzeug();
    return w ? antwortZeilen(w) : [];
  });
  protected readonly meta = computed(() => {
    const w = this.werkzeug();
    if (!w) return '';
    return [w.kategorie ? OPTIONEN.kategorie[w.kategorie] : '', TEXTE.karte.erfasst(datumCh(w.erfasst))]
      .filter(Boolean)
      .join(', ');
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const w = this.werkzeug();
      if (w) title.setTitle(`${w.name} – ${TEXTE.app.name}`);
    });
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
