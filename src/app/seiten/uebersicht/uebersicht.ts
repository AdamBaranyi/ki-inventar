import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { allePruefpunkte, fortschritt, lage, naechste, zahlen } from '../../fach/auswertung';
import { datumCh } from '../../fach/datum';
import { FRISTEN, giltSchon } from '../../fach/fristen';
import type { Pruefpunkt } from '../../fach/regeln';
import type { Werkzeug } from '../../fach/werkzeug';
import { FortschrittKarte } from '../../teile/fortschritt/fortschritt';
import { LagePille } from '../../teile/lage-pille/lage-pille';
import { Zeichen } from '../../teile/zeichen/zeichen';
import { TEXTE } from '../../texte/de-CH';

const STANDORT_KURZ = TEXTE.uebersicht.standort;

@Component({
  selector: 'ki-uebersicht',
  imports: [RouterLink, FortschrittKarte, LagePille, Zeichen],
  templateUrl: './uebersicht.html',
})
export class Uebersicht {
  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.uebersicht;
  protected readonly stufen = TEXTE.status.dringlichkeit;

  protected readonly leer = computed(() => this.dienst.inventar().werkzeuge.length === 0);
  private readonly punkte = computed(() =>
    allePruefpunkte(this.dienst.inventar().werkzeuge, this.uhr.heute()),
  );
  protected readonly fortschritt = computed(() => fortschritt(this.punkte()));
  protected readonly naechste = computed(() => naechste(this.punkte(), 3));

  protected readonly ueberschrift = computed(() => this.dienst.inventar().firma || this.t.titel);
  protected readonly untertitel = computed(() => {
    const z = zahlen(this.dienst.inventar(), this.uhr.heute());
    return this.t.untertitel(z.werkzeuge, z.personendaten);
  });

  protected readonly zeilen = computed(() =>
    [...this.dienst.inventar().werkzeuge]
      .sort((a, b) => a.name.localeCompare(b.name, 'de-CH'))
      .map((w) => ({
        id: w.id,
        name: w.name,
        initiale: w.name.trim().charAt(0).toLocaleUpperCase('de-CH'),
        meta: meta(w),
        lage: lage(w, this.uhr.heute()),
      })),
  );

  /** Die zuletzt in Kraft getretene Frist, heute und die nächsten zwei. */
  protected readonly fristen = computed(() => {
    const heute = this.uhr.heute();
    return {
      heute: datumCh(heute),
      vorbei: FRISTEN.filter((f) => giltSchon(f, heute)).slice(-1),
      kommend: FRISTEN.filter((f) => !giltSchon(f, heute)).slice(0, 2),
    };
  });

  protected datum(frist: (typeof FRISTEN)[number]) {
    return frist.ungefaehr ?? datumCh(frist.datum);
  }

  protected stufe(punkt: Pruefpunkt) {
    return this.stufen[punkt.dringlichkeit].toLocaleLowerCase('de-CH');
  }

  protected ladeBeispiel() {
    this.dienst.ladeBeispiel();
  }
}

function meta(w: Werkzeug): string {
  const standort = w.standort === null ? STANDORT_KURZ.unbekannt : STANDORT_KURZ[w.standort];
  return [w.anbieter, standort].filter(Boolean).join(', ');
}
