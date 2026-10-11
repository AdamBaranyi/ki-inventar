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
    path: '**',
    title: titel(TEXTE.titel.nichtGefunden),
    loadComponent: () => import('./seiten/nicht-gefunden/nicht-gefunden').then((m) => m.NichtGefunden),
  },
];
