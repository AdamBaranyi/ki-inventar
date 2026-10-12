import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { InventarDienst } from '../../daten/inventar-dienst';
import { fehlendeAngaben } from '../../fach/auswertung';
import { datumCh } from '../../fach/datum';
import { passendeVorlagen, VORLAGEN_STAND, wendeAn, type Vorlage } from '../../fach/vorlagen';
import { GRENZEN } from '../../fach/werkzeug';
import { Auswahl } from '../../teile/auswahl/auswahl';
import { Zeichen } from '../../teile/zeichen/zeichen';
import { ANGABEN, FRAGEN, TEXTE } from '../../texte/de-CH';
import { VORLAGEN_TEXTE } from '../../texte/de-CH-vorlagen';
import { antwortenAus, antwortenAusFormular, baueFormular } from './formular-modell';
import { AUSWAHL_OPTIONEN } from './formular-optionen';
import { fehlerImSchritt, SCHRITTE, schrittNummer } from './schritte';

type Zustand = 'wartet' | 'gespeichert' | 'ungueltig' | 'verweigert';
type Textfeld = 'name' | 'anbieter' | 'zweck' | 'abteilungen' | 'anzahl' | 'verantwortlich';

/**
 * Erfassen und Bearbeiten eines Werkzeugs, eine Frage je Bildschirm (?frage=1 bis 10).
 * Jede gültige Änderung wird sofort gespeichert; der Name legt das Werkzeug an.
 */
@Component({
  selector: 'ki-werkzeug-formular',
  imports: [ReactiveFormsModule, RouterLink, Auswahl, Zeichen],
  templateUrl: './werkzeug-formular.html',
})
export class WerkzeugFormular implements OnInit {
  /** Aus der Route; fehlt beim Erfassen. */
  readonly id = input<string>();
  /** Aus der Adresse (?frage=5). */
  readonly frage = input<string>();

  private readonly dienst = inject(InventarDienst);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly ansicht = inject(ChangeDetectorRef);

  protected readonly t = TEXTE.formular;
  protected readonly neuerTab = TEXTE.status.neuerTab;
  protected readonly f = FRAGEN;
  protected readonly o = AUSWAHL_OPTIONEN;
  protected readonly schritte = SCHRITTE;
  protected readonly form = baueFormular();
  protected readonly werkzeugId = signal<string | null>(null);
  protected readonly zustand = signal<Zustand>('wartet');
  protected readonly versucht = signal(false);
  protected readonly nichtGefunden = signal(false);
  private readonly werte = signal(this.form.getRawValue());

  /** Solange kein Werkzeug gespeichert ist, gibt es nur den ersten Schritt. */
  protected readonly schritt = computed(() => (this.werkzeugId() ? schrittNummer(this.frage()) : 1));
  protected readonly titel = computed(() => SCHRITTE[this.schritt() - 1]?.titel ?? '');
  protected readonly letzter = computed(() => this.schritt() === SCHRITTE.length);
  protected readonly ort = computed(() =>
    [this.t.frageVon(this.schritt(), SCHRITTE.length), this.werte().name.trim()].filter(Boolean).join(', '),
  );
  protected readonly fehlend = computed(() =>
    fehlendeAngaben(this.werte()).map((feld) => ANGABEN[feld]),
  );
  protected readonly schliessenZiel = computed(() => {
    const id = this.werkzeugId();
    return id ? ['/werkzeug', id] : ['/'];
  });
  protected readonly standText = computed(() => this.t[this.zustand()]);
  protected readonly v = VORLAGEN_TEXTE;
  protected readonly vorlagenStand = datumCh(VORLAGEN_STAND);
  /** Vorschläge für bekannte Werkzeuge, nur in der ersten Frage. */
  protected readonly vorlagen = computed(() => (this.schritt() === 1 ? passendeVorlagen(this.werte().name) : []));
  protected readonly gewaehlt = signal<Vorlage | null>(null);

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.speichere());
    const title = inject(Title);
    effect(() => {
      const name = this.werte().name.trim();
      const frage = `${this.t.frageVon(this.schritt(), SCHRITTE.length)}: ${this.titel()}`;
      title.setTitle([frage, name, TEXTE.app.name].filter(Boolean).join(' – '));
    });
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
  }

  /** Fehlertext eines Textfelds, sobald es berührt oder «Weiter» gedrückt wurde. */
  protected fehler(feld: Textfeld) {
    const steuerung = this.form.controls[feld];
    if (steuerung.valid || !(steuerung.touched || this.versucht())) return null;
    if (steuerung.hasError('required')) return this.t.nameFehlt;
    if (steuerung.hasError('maxlength')) return this.t.zuLang(GRENZEN[feld]);
    if (steuerung.hasError('max')) return this.t.zuGross(GRENZEN.anzahl.toLocaleString('de-CH'));
    return this.t.ganzzahl;
  }

  /** Trägt die Antworten einer Vorlage ein, wo noch nichts steht; das speichert sich wie jede Änderung. */
  protected uebernehme(vorlage: Vorlage) {
    const { anbieter, zugang, training, avv } = wendeAn(antwortenAusFormular(this.form), vorlage);
    this.form.patchValue({ anbieter, zugang, training, avv });
    this.gewaehlt.set(vorlage);
  }

  /** «Weiter» prüft nur die Felder dieses Schritts; nach dem letzten geht es zum Werkzeug. */
  protected weiter() {
    const nummer = this.schritt();
    const fehler = fehlerImSchritt(this.form, nummer);
    if (fehler.length) {
      this.versucht.set(true);
      for (const feld of fehler) this.form.controls[feld].markAsTouched();
      // Sofort zeichnen, dann fokussieren: ohne Warten auf ein Animationsbild,
      // das je nach Browser vor oder nach dem Zeichnen kommt.
      this.ansicht.detectChanges();
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const id = this.werkzeugId();
    if (!id) return;
    if (nummer === SCHRITTE.length) void this.router.navigate(['/werkzeug', id]);
    else this.geheZu(id, nummer + 1);
  }

  protected zurueck() {
    const id = this.werkzeugId();
    if (id && this.schritt() > 1) this.geheZu(id, this.schritt() - 1);
  }

  private geheZu(id: string, nummer: number) {
    void this.router.navigate(['/werkzeug', id, 'bearbeiten'], { queryParams: { frage: nummer } });
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
