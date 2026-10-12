import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { DarstellungDienst, liesDarstellung, SCHLUESSEL_DARSTELLUNG } from './darstellung';
import { FluechtigerSpeicher, SPEICHER } from './speicher';

function dienst(speicher: Storage): DarstellungDienst {
  TestBed.configureTestingModule({ providers: [{ provide: SPEICHER, useValue: speicher }] });
  return TestBed.inject(DarstellungDienst);
}

describe('Darstellung', () => {
  it('ist hell, solange nichts oder Unbekanntes gespeichert ist', () => {
    expect(liesDarstellung(null)).toBe('hell');
    expect(liesDarstellung('lila')).toBe('hell');
    expect(liesDarstellung('dunkel')).toBe('dunkel');
    expect(liesDarstellung('system')).toBe('system');
  });

  it('merkt sich die Wahl im Speicher des Browsers und setzt sie an <html>', () => {
    const speicher = new FluechtigerSpeicher();
    const d = dienst(speicher);
    d.waehle('dunkel');
    TestBed.tick();
    expect(speicher.getItem(SCHLUESSEL_DARSTELLUNG)).toBe('dunkel');
    expect(document.documentElement.getAttribute('data-darstellung')).toBe('dunkel');
  });

  it('beginnt mit der gespeicherten Wahl', () => {
    const speicher = new FluechtigerSpeicher();
    speicher.setItem(SCHLUESSEL_DARSTELLUNG, 'system');
    expect(dienst(speicher).wahl()).toBe('system');
  });
});
