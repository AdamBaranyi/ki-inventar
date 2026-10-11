import { Injectable } from '@angular/core';

import { isoDatum } from '../fach/werkzeug';

/** Die Zeit an einer Stelle, damit Tests sie festhalten können. */
@Injectable({ providedIn: 'root' })
export class Uhr {
  jetzt(): Date {
    return new Date();
  }

  heute(): string {
    return isoDatum(this.jetzt());
  }
}
