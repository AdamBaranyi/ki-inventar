import type { Routes } from '@angular/router';

import { TEXTE } from './texte/de-CH';

const titel = (seite: string) => `${seite} – ${TEXTE.app.name}`;

export const routes: Routes = [
  {
    path: '',
    title: TEXTE.titel.uebersicht,
    loadComponent: () => import('./seiten/uebersicht/uebersicht').then((m) => m.Uebersicht),
  },
  {
    path: 'werkzeug/neu',
    title: titel(TEXTE.titel.neu),
    loadComponent: () =>
      import('./seiten/werkzeug-formular/werkzeug-formular').then((m) => m.WerkzeugFormular),
  },
  {
    path: 'werkzeug/:id',
    title: titel(TEXTE.titel.karte),
    loadComponent: () => import('./seiten/werkzeug-karte/werkzeug-karte').then((m) => m.WerkzeugKarte),
  },
  {
    path: 'werkzeug/:id/bearbeiten',
    title: titel(TEXTE.titel.bearbeiten),
    loadComponent: () =>
      import('./seiten/werkzeug-formular/werkzeug-formular').then((m) => m.WerkzeugFormular),
  },
  {
    path: 'pruefpunkte',
    title: titel(TEXTE.titel.pruefpunkte),
    loadComponent: () =>
      import('./seiten/pruefpunkte/pruefpunkte-seite').then((m) => m.PruefpunkteSeite),
  },
  {
    path: 'fristen',
    title: titel(TEXTE.titel.fristen),
    loadComponent: () => import('./seiten/fristen/fristen-seite').then((m) => m.FristenSeite),
  },
  {
    path: 'verzeichnis',
    title: titel(TEXTE.titel.verzeichnis),
    loadComponent: () => import('./seiten/verzeichnis/verzeichnis').then((m) => m.Verzeichnis),
  },
  {
    path: 'daten',
    title: titel(TEXTE.titel.daten),
    loadComponent: () => import('./seiten/daten/daten-seite').then((m) => m.DatenSeite),
  },
  {
    path: 'impressum',
    title: titel(TEXTE.titel.impressum),
    data: { seite: 'impressum' },
    loadComponent: () => import('./seiten/rechtliches/rechts-seite').then((m) => m.RechtsSeite),
  },
  {
    path: 'datenschutz',
    title: titel(TEXTE.titel.datenschutz),
    data: { seite: 'datenschutz' },
    loadComponent: () => import('./seiten/rechtliches/rechts-seite').then((m) => m.RechtsSeite),
  },
  {
    path: '**',
    title: titel(TEXTE.titel.nichtGefunden),
    loadComponent: () => import('./seiten/nicht-gefunden/nicht-gefunden').then((m) => m.NichtGefunden),
  },
];
