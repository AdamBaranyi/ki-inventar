import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { lage, zahlen } from '../../fach/auswertung';
import { OPTIONEN, TEXTE } from '../../texte/de-CH';
import { LageChips } from '../../teile/lage-chips/lage-chips';

@Component({
  selector: 'ki-uebersicht',
  imports: [RouterLink, LageChips],
  templateUrl: './uebersicht.html',
})
export class Uebersicht {
  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.uebersicht;

  protected readonly leer = computed(() => this.dienst.inventar().werkzeuge.length === 0);
  protected readonly zahlen = computed(() => zahlen(this.dienst.inventar(), this.uhr.heute()));

  protected readonly ueberschrift = computed(() => {
    const firma = this.dienst.inventar().firma;
    return firma ? this.t.titelFirma(firma) : this.t.titel;
  });

  protected readonly zeilen = computed(() =>
    [...this.dienst.inventar().werkzeuge]
      .sort((a, b) => a.name.localeCompare(b.name, 'de-CH'))
      .map((w) => ({
        id: w.id,
        name: w.name,
        meta: [w.anbieter, w.kategorie ? OPTIONEN.kategorie[w.kategorie] : '']
          .filter(Boolean)
          .join(', '),
        lage: lage(w, this.uhr.heute()),
      })),
  );

  protected ladeBeispiel() {
    this.dienst.ladeBeispiel();
  }
}
