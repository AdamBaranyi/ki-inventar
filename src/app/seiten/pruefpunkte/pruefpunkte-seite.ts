import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { allePruefpunkte, nachDringlichkeit } from '../../fach/auswertung';
import type { Dringlichkeit } from '../../fach/regeln';
import { Pruefpunkt } from '../../teile/pruefpunkt/pruefpunkt';
import { TEXTE } from '../../texte/de-CH';

const STUFEN: Dringlichkeit[] = ['hoechste', 'hoch', 'mittel', 'niedrig'];

/** Alle Prüfpunkte über alle Werkzeuge, nach Dringlichkeit gruppiert. */
@Component({
  selector: 'ki-pruefpunkte-seite',
  imports: [RouterLink, Pruefpunkt],
  templateUrl: './pruefpunkte-seite.html',
})
export class PruefpunkteSeite {
  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.pruefpunkte;
  protected readonly titel = TEXTE.titel.pruefpunkte;
  protected readonly erfassen = TEXTE.uebersicht.erfassen;
  protected readonly stufenTitel = TEXTE.status.dringlichkeit;
  protected readonly nurOffene = signal(true);
  protected readonly ohneWerkzeuge = computed(() => this.dienst.inventar().werkzeuge.length === 0);

  protected readonly gruppen = computed(() => {
    const punkte = nachDringlichkeit(allePruefpunkte(this.dienst.inventar().werkzeuge, this.uhr.heute()))
      .filter((p) => !this.nurOffene() || p.status === 'offen');
    return STUFEN.map((stufe) => ({ stufe, punkte: punkte.filter((p) => p.dringlichkeit === stufe) }))
      .filter((gruppe) => gruppe.punkte.length > 0);
  });
}
