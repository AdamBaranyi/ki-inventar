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
    path: '**',
    title: titel(TEXTE.titel.nichtGefunden),
    loadComponent: () => import('./seiten/nicht-gefunden/nicht-gefunden').then((m) => m.NichtGefunden),
  },
];
