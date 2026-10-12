import { Component, computed, input } from '@angular/core';

/**
 * Eigene Bildzeichen, je ein Pfad auf 24 × 24, gezeichnet mit der Textfarbe.
 * Keine Bibliothek: Rechtecke und Kreise sind als Pfad geschrieben.
 */
interface Zeichnung {
  d: string;
  /** Strichstärke, wenn sie von 1,8 abweicht. */
  breite?: number;
}

const ZEICHEN = {
  start: {
    d:
      'M5.5 3.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z' +
      'M15.5 3.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z' +
      'M5.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z' +
      'M15.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z',
  },
  punkte: {
    d: 'M3.4 7a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0M3.4 17a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0M11 7h9M11 17h9',
  },
  fristen: {
    d: 'M6.5 5h11a3 3 0 0 1 3 3v9.5a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM3.5 10h17M8 3v4M16 3v4',
  },
  mehr: { d: 'M5 12h.01M12 12h.01M19 12h.01', breite: 3.4 },
  druck: { d: 'M7 9V3.5h10V9M7 17H4.5V9h15v8H17M7 14h10v6.5H7z' },
  daten: { d: 'M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3' },
  plus: { d: 'M12 5v14M5 12h14', breite: 2.2 },
  haken: { d: 'M5 12.5l4.5 4.5L19 7.5', breite: 2.6 },
  strich: { d: 'M7.5 12h9', breite: 2.6 },
  ausruf: { d: 'M12 6.5v7M12 17.5h.01', breite: 2.8 },
  weiter: { d: 'M9 5l7 7-7 7', breite: 2 },
  zurueck: { d: 'M15 5l-7 7 7 7', breite: 2 },
  zu: { d: 'M6 6l12 12M18 6L6 18', breite: 2 },
} as const satisfies Record<string, Zeichnung>;

export type ZeichenName = keyof typeof ZEICHEN;

@Component({
  selector: 'ki-zeichen',
  host: { class: 'zeichen' },
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        [attr.d]="pfad().d"
        fill="none"
        stroke="currentColor"
        [attr.stroke-width]="breite()"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class Zeichen {
  readonly name = input.required<ZeichenName>();
  protected readonly pfad = computed<Zeichnung>(() => ZEICHEN[this.name()]);
  protected readonly breite = computed(() => this.pfad().breite ?? 1.8);
}
