import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { InventarDienst } from '../../daten/inventar-dienst';
import { Uhr } from '../../daten/uhr';
import { datumCh } from '../../fach/datum';
import type { Pruefpunkt as Punkt } from '../../fach/regeln';
import { GRENZEN } from '../../fach/werkzeug';
import { TEXTE } from '../../texte/de-CH';
import { Zeichen } from '../zeichen/zeichen';

/**
 * Ein Prüfpunkt als Zeile einer Checkliste: Kreis, Titel, Stand. Antippen klappt
 * Grund, Quelle und die Knöpfe auf (Muster «Akkordeon»: Überschrift mit Knopf).
 */
@Component({
  selector: 'ki-pruefpunkt',
  imports: [ReactiveFormsModule, Zeichen],
  templateUrl: './pruefpunkt.html',
})
export class Pruefpunkt {
  readonly punkt = input.required<Punkt>();
  /** In der Gesamtliste steht das Werkzeug dabei. */
  readonly mitWerkzeug = input(false);
  /** Aufgeklappt beginnen, etwa wenn die Adresse auf den Punkt zeigt. */
  readonly aufgeklappt = input(false);

  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.status;
  protected readonly offen = linkedSignal(() => this.aufgeklappt());
  protected readonly begruenden = signal(false);
  protected readonly versucht = signal(false);
  protected readonly begruendung = new FormControl('', { nonNullable: true });
  protected readonly grenze = GRENZEN.begruendung;

  protected readonly kennung = computed(() => `punkt-${this.punkt().werkzeugId}-${this.punkt().regel}`);
  protected readonly datum = computed(() => datumCh(this.punkt().datum ?? ''));
  protected readonly zuletzt = computed(() => datumCh(this.punkt().zuletzt ?? ''));
  protected readonly stopp = computed(() => this.punkt().regel === 'R12');

  /** Unter dem Titel: Dringlichkeit, solange offen, sonst wann erledigt. */
  protected readonly stand = computed(() => {
    const p = this.punkt();
    if (p.status === 'erledigt') return this.t.erledigtAm(this.datum());
    if (p.status === 'nicht-zutreffend') return this.t.nichtZutreffendAm(this.datum());
    return this.t.dringlichkeit[p.dringlichkeit];
  });

  protected umschalten() {
    this.offen.update((offen) => !offen);
  }

  protected fehlt() {
    return this.versucht() && this.begruendung.value.trim() === '';
  }

  protected erledige() {
    this.setze({ status: 'erledigt', begruendung: '', datum: this.uhr.heute() });
  }

  protected oeffne() {
    this.begruenden.set(false);
    this.dienst.setzePruefung(this.punkt().werkzeugId, this.punkt().regel, null);
    this.fokussiere('button');
  }

  protected zeigeBegruendung() {
    this.begruenden.set(true);
    this.fokussiere('textarea');
  }

  protected speichereBegruendung() {
    this.versucht.set(true);
    const text = this.begruendung.value.trim().slice(0, this.grenze);
    if (!text) {
      this.fokussiere('textarea');
      return;
    }
    this.begruenden.set(false);
    this.setze({ status: 'nicht-zutreffend', begruendung: text, datum: this.uhr.heute() });
  }

  protected abbrechen() {
    this.begruenden.set(false);
    this.versucht.set(false);
    this.fokussiere('button');
  }

  private setze(pruefung: { status: 'erledigt' | 'nicht-zutreffend'; begruendung: string; datum: string }) {
    this.dienst.setzePruefung(this.punkt().werkzeugId, this.punkt().regel, pruefung);
    this.fokussiere('button');
  }

  /**
   * Nach dem Umschalten verschwindet der gedrückte Knopf; der Fokus bleibt beim
   * Punkt. Fällt der Punkt aus einer gefilterten Liste, geht er zum nächsten.
   */
  private fokussiere(element: 'button' | 'textarea') {
    const kennung = this.kennung();
    const naechster = document.getElementById(kennung)?.closest('li')?.nextElementSibling;
    const ersatz = naechster?.querySelector('article')?.id;
    requestAnimationFrame(() => {
      const ziel =
        document.querySelector<HTMLElement>(`#${kennung} .punkt__aktionen ${element}`) ??
        (ersatz ? document.querySelector<HTMLElement>(`#${ersatz} .punkt__schalter`) : null) ??
        document.querySelector<HTMLElement>('main h1');
      ziel?.focus({ preventScroll: ziel.tagName === 'H1' });
    });
  }
}
