import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';

import { herunterladen, MAX_SICHERUNG_BYTES } from '../../daten/herunterladen';
import { InventarDienst } from '../../daten/inventar-dienst';
import { FluechtigerSpeicher, SPEICHER } from '../../daten/speicher';
import { Uhr } from '../../daten/uhr';
import { alsBearbeitungsverzeichnis, bearbeitungen, mitBesonderenDaten } from '../../fach/bearbeitungsverzeichnis';
import { alsCsv } from '../../fach/csv';
import { liesInventar, type Inventar } from '../../fach/inventar';
import { alsIcs, jahresTermine } from '../../fach/kalender';
import { TEXTE } from '../../texte/de-CH';

interface Meldung {
  art: 'ok' | 'fehler';
  text: string;
}

/** Sichern, als Tabelle herunterladen, wiederherstellen und alles löschen. */
@Component({
  selector: 'ki-daten-seite',
  templateUrl: './daten-seite.html',
})
export class DatenSeite {
  private readonly dienst = inject(InventarDienst);
  private readonly uhr = inject(Uhr);
  protected readonly t = TEXTE.daten;
  protected readonly titel = TEXTE.titel.daten;
  protected readonly neuerTab = TEXTE.status.neuerTab;
  protected readonly fluechtig = inject(SPEICHER) instanceof FluechtigerSpeicher;
  protected readonly meldung = signal<Meldung | null>(null);
  protected readonly wartend = signal<Inventar | null>(null);
  protected readonly anzahl = computed(() => this.dienst.inventar().werkzeuge.length);
  protected readonly mitPersonendaten = computed(() => bearbeitungen(this.dienst.inventar()).length);
  protected readonly besondere = computed(() => mitBesonderenDaten(this.dienst.inventar()));
  protected readonly termine = computed(() => jahresTermine(this.dienst.inventar(), this.uhr.heute()));
  private readonly ersetzenDialog = viewChild<ElementRef<HTMLDialogElement>>('ersetzenDialog');
  private readonly loeschenDialog = viewChild<ElementRef<HTMLDialogElement>>('loeschenDialog');

  protected sichere() {
    const inhalt = { ...this.dienst.inventar(), exportiert: this.uhr.jetzt().toISOString() };
    herunterladen(this.dateiname('json'), JSON.stringify(inhalt, null, 2), 'application/json');
  }

  protected tabelle() {
    herunterladen(this.dateiname('csv'), alsCsv(this.dienst.inventar(), this.uhr.heute()), 'text/csv;charset=utf-8');
  }

  protected bearbeitungsverzeichnis() {
    herunterladen(
      this.dateiname('csv', 'bearbeitungsverzeichnis'),
      alsBearbeitungsverzeichnis(this.dienst.inventar()),
      'text/csv;charset=utf-8',
    );
  }

  protected kalender() {
    const ics = alsIcs(this.termine().termine, this.uhr.jetzt(), document.baseURI);
    herunterladen(this.dateiname('ics', 'termine'), ics, 'text/calendar;charset=utf-8');
  }

  protected async waehle(ereignis: Event) {
    const feld = ereignis.target as HTMLInputElement;
    const datei = feld.files?.[0];
    feld.value = '';
    if (!datei) return;
    if (datei.size > MAX_SICHERUNG_BYTES) {
      this.meldung.set({ art: 'fehler', text: this.t.zuGross });
      return;
    }
    const gelesen = liesInventar(await datei.text());
    if (!gelesen.ok) {
      this.meldung.set({ art: 'fehler', text: gelesen.fehler });
      return;
    }
    this.wartend.set(gelesen.inventar);
    if (this.anzahl() === 0) this.ersetze();
    else this.ersetzenDialog()?.nativeElement.showModal();
  }

  protected ersetze() {
    const inventar = this.wartend();
    this.ersetzenDialog()?.nativeElement.close();
    if (!inventar) return;
    this.wartend.set(null);
    if (this.dienst.ersetzeAlles(inventar)) {
      this.meldung.set({ art: 'ok', text: this.t.wiederOk(inventar.werkzeuge.length) });
    }
  }

  protected frageLoeschen() {
    this.loeschenDialog()?.nativeElement.showModal();
  }

  protected loesche() {
    this.loeschenDialog()?.nativeElement.close();
    if (this.dienst.allesLoeschen()) this.meldung.set({ art: 'ok', text: this.t.geloescht });
  }

  protected schliesse(dialog: HTMLDialogElement) {
    dialog.close();
    this.wartend.set(null);
  }

  private dateiname(endung: 'json' | 'csv' | 'ics', art = '') {
    return `ki-inventar-${art ? `${art}-` : ''}${this.uhr.heute()}.${endung}`;
  }
}
