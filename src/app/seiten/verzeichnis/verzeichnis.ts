import { Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { lage, nachDringlichkeit, zahlen } from '../../fach/auswertung';
import { datumCh } from '../../fach/datum';
import { pruefpunkte, type Pruefpunkt } from '../../fach/regeln';
import { OPTIONEN, TEXTE } from '../../texte/de-CH';

/** Die Druckansicht: Kopf mit Firma und Datum, Tabelle, Prüfpunkte je Werkzeug. */
@Component({
  selector: 'ki-verzeichnis',
  imports: [ReactiveFormsModule],
  templateUrl: './verzeichnis.html',
})
export class Verzeichnis {
  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.verzeichnis;
  protected readonly seitenTitel = TEXTE.titel.verzeichnis;
  protected readonly hinweis = TEXTE.app.keineRechtsberatung;
  protected readonly rechtsstand = TEXTE.app.rechtsstand;
  protected readonly heute = datumCh(this.uhr.heute());
  protected readonly firma = new FormControl(this.dienst.inventar().firma, { nonNullable: true });

  protected readonly stand = computed(() => {
    const z = zahlen(this.dienst.inventar(), this.uhr.heute());
    return this.t.stand(this.heute, z.werkzeuge, z.offen);
  });

  protected readonly werkzeuge = computed(() =>
    [...this.dienst.inventar().werkzeuge]
      .sort((a, b) => a.name.localeCompare(b.name, 'de-CH'))
      .map((w) => ({
        id: w.id,
        name: w.name,
        anbieter: [w.anbieter, w.standort ? OPTIONEN.standort[w.standort] : ''].filter(Boolean).join(', '),
        zweck: w.kategorie ? OPTIONEN.kategorie[w.kategorie] : '',
        verantwortlich: w.verantwortlich,
        personendaten: w.personendaten ? OPTIONEN.personendaten[w.personendaten] : '',
        offen: lage(w, this.uhr.heute()).offen,
        punkte: nachDringlichkeit(pruefpunkte(w, this.uhr.heute())),
      })),
  );

  constructor() {
    this.firma.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((firma) => this.dienst.setzeFirma(firma.trim().slice(0, 120)));
  }

  protected punktStand(punkt: Pruefpunkt): string {
    if (punkt.status === 'erledigt') return this.t.erledigt(datumCh(punkt.datum ?? ''));
    if (punkt.status === 'nicht-zutreffend') return this.t.nichtZutreffend(punkt.begruendung ?? '');
    return this.t.offen;
  }

  protected drucke() {
    window.print();
  }

}
