import { KALENDER as K } from '../texte/de-CH-kalender';
import { plusTage } from './datum';
import type { Inventar } from './inventar';
import { REGELN } from './regeln';

/** Nach so vielen Tagen ist die jährliche Überprüfung (R14) wieder offen. */
const JAEHRLICH = REGELN.find((r) => r.id === 'R14')?.gueltigTage ?? 365;

export interface Termin {
  werkzeugId: string;
  name: string;
  /** JJJJ-MM-TT */
  faellig: string;
}

/**
 * Wann die jährliche Überprüfung je Werkzeug wieder fällig wird. Termine gibt es
 * nur für Werkzeuge, deren Überprüfung festgehalten ist und noch nicht abgelaufen.
 */
export function jahresTermine(inventar: Inventar, heute: string): { termine: Termin[]; ohneTermin: number } {
  const termine: Termin[] = [];
  for (const w of inventar.werkzeuge) {
    const pruefung = w.pruefungen.R14;
    const faellig = pruefung ? plusTage(pruefung.datum, JAEHRLICH) : null;
    if (faellig && faellig > heute) termine.push({ werkzeugId: w.id, name: w.name, faellig });
  }
  termine.sort((a, b) => a.faellig.localeCompare(b.faellig) || a.name.localeCompare(b.name, 'de-CH'));
  return { termine, ohneTermin: inventar.werkzeuge.length - termine.length };
}

/**
 * Kalenderdatei nach RFC 5545: je Termin ein ganztägiger Eintrag mit Erinnerung
 * um 9 Uhr. `basis` ist die Adresse der App, für den Link zum Werkzeug.
 */
export function alsIcs(termine: readonly Termin[], jetzt: Date, basis: string): string {
  const stempel = jetzt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const zeilen = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${K.produkt}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const t of termine) {
    const titel = text(K.titel(t.name));
    zeilen.push(
      'BEGIN:VEVENT',
      `UID:${t.werkzeugId}-r14-${t.faellig}@ki-inventar`,
      `DTSTAMP:${stempel}`,
      `DTSTART;VALUE=DATE:${kompakt(t.faellig)}`,
      `DTEND;VALUE=DATE:${kompakt(plusTage(t.faellig, 1))}`,
      `SUMMARY:${titel}`,
      `DESCRIPTION:${text(K.beschreibung)}`,
      `URL:${new URL(`werkzeug/${encodeURIComponent(t.werkzeugId)}`, basis).href}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${titel}`,
      'TRIGGER:PT9H',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  zeilen.push('END:VCALENDAR');
  return `${zeilen.map(falten).join('\r\n')}\r\n`;
}

const kompakt = (iso: string) => iso.replaceAll('-', '');

/** Text nach RFC 5545: Backslash, Strichpunkt, Komma und Zeilenumbruch maskiert. */
export function text(wert: string): string {
  return wert
    .replace(/[\\;,]/g, (zeichen) => `\\${zeichen}`)
    .replace(/\r?\n/g, '\\n')
    .replace(/[\u0000-\u001f\u007f]/g, '');
}

const KODIERER = new TextEncoder();

/** Zeilen über 75 Bytes werden gefaltet; ein Zeichen wird dabei nie geteilt. */
export function falten(zeile: string): string {
  const teile: string[] = [];
  let aktuell = '';
  let bytes = 0;
  for (const zeichen of zeile) {
    const laenge = KODIERER.encode(zeichen).length;
    if (bytes + laenge > (teile.length === 0 ? 75 : 74)) {
      teile.push(aktuell);
      aktuell = '';
      bytes = 0;
    }
    aktuell += zeichen;
    bytes += laenge;
  }
  teile.push(aktuell);
  return teile.join('\r\n ');
}
