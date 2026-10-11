import { Location } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { fehlendeAngaben } from '../../fach/auswertung';
import { GRENZEN } from '../../fach/werkzeug';
import { Auswahl } from '../../teile/auswahl/auswahl';
import { ANGABEN, FRAGEN, TEXTE } from '../../texte/de-CH';
import { antwortenAus, antwortenAusFormular, baueFormular } from './formular-modell';
import { AUSWAHL_OPTIONEN } from './formular-optionen';

type Zustand = 'wartet' | 'gespeichert' | 'ungueltig' | 'verweigert';

/** Erfassen und Bearbeiten eines Werkzeugs; jede gültige Änderung wird sofort gespeichert. */
@Component({
  selector: 'ki-werkzeug-formular',
  imports: [ReactiveFormsModule, RouterLink, Auswahl],
  templateUrl: './werkzeug-formular.html',
})
export class WerkzeugFormular implements OnInit {
  /** Aus der Route; fehlt beim Erfassen. */
  readonly id = input<string>();

  private readonly dienst = inject(InventarDienst);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly title = inject(Title);

  protected readonly t = TEXTE.formular;
  protected readonly f = FRAGEN;
  protected readonly o = AUSWAHL_OPTIONEN;
  protected readonly grenzen = GRENZEN;
  protected readonly form = baueFormular();
  protected readonly werkzeugId = signal<string | null>(null);
  protected readonly zustand = signal<Zustand>('wartet');
  protected readonly versucht = signal(false);
  protected readonly nichtGefunden = signal(false);
  private readonly werte = signal(this.form.getRawValue());
  protected readonly fehlend = computed(() =>
    fehlendeAngaben(this.werte()).map((feld) => ANGABEN[feld]),
  );
  protected readonly ueberschrift = computed(() =>
    this.werkzeugId() ? TEXTE.titel.bearbeiten : TEXTE.titel.neu,
  );

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.speichere());
  }

  ngOnInit() {
    const id = this.id();
    if (!id) return;
    const werkzeug = this.dienst.werkzeug(id);
    if (!werkzeug) {
      this.nichtGefunden.set(true);
      return;
    }
    this.werkzeugId.set(id);
    this.form.setValue(antwortenAus(werkzeug), { emitEvent: false });
    this.werte.set(this.form.getRawValue());
    this.zustand.set('gespeichert');
    this.title.setTitle(`${werkzeug.name} bearbeiten – ${TEXTE.app.name}`);
  }

  /** Fehlertext eines Textfelds, sobald es berührt oder «Fertig» gedrückt wurde. */
  protected fehler(feld: 'name' | 'anbieter' | 'zweck' | 'abteilungen' | 'anzahl' | 'verantwortlich') {
    const steuerung = this.form.controls[feld];
    if (steuerung.valid || !(steuerung.touched || this.versucht())) return null;
    if (steuerung.hasError('required')) return this.t.nameFehlt;
    if (steuerung.hasError('maxlength')) return this.t.zuLang(GRENZEN[feld]);
    if (steuerung.hasError('max')) return this.t.zuGross(GRENZEN.anzahl.toLocaleString('de-CH'));
    return this.t.ganzzahl;
  }

  protected fertig() {
    this.versucht.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const id = this.werkzeugId();
    if (id) void this.router.navigate(['/werkzeug', id]);
  }

  private speichere() {
    this.werte.set(this.form.getRawValue());
    if (this.form.invalid) {
      this.zustand.set('ungueltig');
      return;
    }
    const antworten = antwortenAusFormular(this.form);
    let id = this.werkzeugId();
    if (!id) {
      id = this.dienst.erfasse(antworten.name);
      this.werkzeugId.set(id);
      this.location.replaceState(`/werkzeug/${id}/bearbeiten`);
    }
    this.zustand.set(this.dienst.aendere(id, antworten) ? 'gespeichert' : 'verweigert');
  }
}
