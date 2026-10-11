import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ki-nicht-gefunden',
  imports: [RouterLink],
  template: `
    <section class="stapel">
      <h1 tabindex="-1">Seite nicht gefunden</h1>
      <p>Diese Adresse gibt es im KI-Inventar nicht.</p>
      <p><a class="knopf knopf--zweit" routerLink="/">Zur Übersicht</a></p>
    </section>
  `,
})
export class NichtGefunden {}
