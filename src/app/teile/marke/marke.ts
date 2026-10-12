import { Component } from '@angular/core';

/** Eine Karteikarte, deren erste Zeile mit Leuchtstift markiert ist. */
@Component({
  selector: 'ki-marke',
  template: `
    <svg class="marke" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="3" y="6" width="26" height="20" rx="4" fill="#ffffff" stroke="#15171b" stroke-width="2.5" />
      <rect x="7" y="10.5" width="15" height="5" rx="1.5" fill="#ffe15a" />
      <path d="M8 13h12M8 20.5h9" stroke="#15171b" stroke-width="2" stroke-linecap="round" />
    </svg>
  `,
})
export class Marke {}
