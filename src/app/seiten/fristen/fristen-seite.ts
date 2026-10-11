import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { datumCh } from '../../fach/datum';
import { FRISTEN, giltSchon, type Frist } from '../../fach/fristen';
import { TEXTE } from '../../texte/de-CH';

/** Die Fristen als Zeitachse, mit einer Marke für heute. */
@Component({
  selector: 'ki-fristen-seite',
  imports: [NgTemplateOutlet],
  templateUrl: './fristen-seite.html',
})
export class FristenSeite {
  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.fristen;
  protected readonly titel = TEXTE.titel.fristen;
  protected readonly quelleText = TEXTE.status.quelle;
  protected readonly neuerTab = TEXTE.status.neuerTab;
  protected readonly heute = datumCh(this.uhr.heute());

  protected readonly werkzeuge = computed(() => this.dienst.inventar().werkzeuge.length);
  protected readonly mitEu = computed(
    () => this.dienst.inventar().werkzeuge.filter((w) => w.euBezug === true).length,
  );

  protected readonly vorbei = FRISTEN.filter((f) => giltSchon(f, this.uhr.heute()));
  protected readonly kommend = FRISTEN.filter((f) => !giltSchon(f, this.uhr.heute()));

  protected datum(frist: Frist) {
    return frist.ungefaehr ?? datumCh(frist.datum);
  }
}
