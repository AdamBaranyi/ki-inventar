import { REGEL_TEXTE as T } from '../texte/de-CH-regeln';
import { tageZwischen } from './datum';
import type { Kategorie, Pruefung, RegelId, Werkzeug } from './werkzeug';

export type Dringlichkeit = 'hoechste' | 'hoch' | 'mittel' | 'niedrig';
export type Status = 'offen' | 'erledigt' | 'nicht-zutreffend';

export interface Quelle {
  readonly text: string;
  readonly url?: string;
}

export interface Regel {
  readonly id: RegelId;
  readonly dringlichkeit: Dringlichkeit;
  readonly quellen: readonly Quelle[];
  /** Nach so vielen Tagen ist «erledigt» wieder offen. */
  readonly gueltigTage?: number;
  gilt(w: Werkzeug): boolean;
  grund(w: Werkzeug): string;
}

export interface Pruefpunkt {
  readonly regel: RegelId;
  readonly werkzeugId: string;
  readonly werkzeugName: string;
  readonly titel: string;
  readonly grund: string;
  readonly quellen: readonly Quelle[];
  readonly dringlichkeit: Dringlichkeit;
  readonly status: Status;
  readonly begruendung?: string;
  readonly datum?: string;
  /** Bei einem wieder geöffneten Punkt: wann er zuletzt erledigt war. */
  readonly zuletzt?: string;
}

const FEDLEX = 'https://www.fedlex.admin.ch/eli/cc/2022/491/de';
const EURLEX = 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/deu';

const dsg = (artikel: number, absatz = ''): Quelle => ({
  text: `DSG Art. ${artikel}${absatz}`,
  url: `${FEDLEX}#art_${artikel}`,
});
const kivo = (artikel: number): Quelle => ({
  text: `KI-VO Art. ${artikel}`,
  url: `${EURLEX}#art_${artikel}`,
});
const ANHANG_III: Quelle = { text: 'KI-VO Anhang III', url: `${EURLEX}#anx_III` };
const PRAXIS: Quelle = { text: 'gute Praxis' };

/** Kategorien, die Anhang III der KI-VO als Hochrisiko-Bereiche nennt. */
const HOCHRISIKO = new Set<Kategorie | null>(['personal', 'entscheidungen', 'kredit', 'bildung']);
/** Kategorien mit vielen oder verletzlichen Betroffenen (Datenschutz-Folgenabschätzung). */
const HEIKEL = new Set<Kategorie | null>(['personal', 'entscheidungen', 'kundenkontakt']);

// «Personendaten» heisst wie in R1 «≠ nein»: Eine offene Antwort zählt vorsichtig.
const mitPersonendaten = (w: Werkzeug) => w.personendaten !== 'nein';
const mitGeheimnissen = (w: Werkzeug) => w.geheimnisse === true;
const vertraulich = (w: Werkzeug) => mitPersonendaten(w) || mitGeheimnissen(w);
const ausserhalbChEu = (w: Werkzeug) => w.standort !== 'ch' && w.standort !== 'eu';

const fest = (text: string) => () => text;
const jeNachEu = (eu: string, sonst: string) => (w: Werkzeug) => (w.euBezug === true ? eu : sonst);

export const REGELN: readonly Regel[] = [
  {
    id: 'R1',
    dringlichkeit: 'mittel',
    quellen: [dsg(19)],
    gilt: mitPersonendaten,
    grund: fest(T.R1.grund),
  },
  {
    id: 'R2',
    dringlichkeit: 'hoch',
    quellen: [dsg(9)],
    gilt: (w) => mitPersonendaten(w) && w.avv !== 'ja',
    grund: fest(T.R2.grund),
  },
  {
    id: 'R3',
    dringlichkeit: 'hoch',
    quellen: [dsg(16), dsg(17)],
    gilt: (w) => mitPersonendaten(w) && ausserhalbChEu(w),
    grund: (w) => (w.standort === 'usa' ? T.R3.grundUsa : T.R3.grund),
  },
  {
    id: 'R4',
    dringlichkeit: 'hoch',
    quellen: [dsg(6, ' Abs. 7'), dsg(22)],
    gilt: (w) => w.personendaten === 'besonders',
    grund: fest(T.R4.grund),
  },
  {
    id: 'R5',
    dringlichkeit: 'mittel',
    quellen: [dsg(7), dsg(8)],
    gilt: (w) => w.training !== 'ja' && vertraulich(w),
    grund: fest(T.R5.grund),
  },
  {
    id: 'R6',
    dringlichkeit: 'mittel',
    quellen: [dsg(8)],
    gilt: (w) => w.zugang === 'privat' && vertraulich(w),
    grund: fest(T.R6.grund),
  },
  {
    id: 'R7',
    dringlichkeit: 'hoch',
    quellen: [dsg(21)],
    gilt: (w) => w.entscheidungen === true,
    grund: fest(T.R7.grund),
  },
  {
    id: 'R8',
    dringlichkeit: 'mittel',
    quellen: [dsg(22)],
    gilt: (w) => mitPersonendaten(w) && (HEIKEL.has(w.kategorie) || w.personendaten === 'besonders'),
    grund: fest(T.R8.grund),
  },
  {
    id: 'R9',
    dringlichkeit: 'mittel',
    quellen: [kivo(50)],
    gilt: (w) => w.ausgabenDritte === true,
    grund: jeNachEu(T.R9.grundEu, T.R9.grund),
  },
  {
    id: 'R10',
    dringlichkeit: 'mittel',
    quellen: [kivo(4)],
    gilt: (w) => w.geschult !== true,
    grund: jeNachEu(T.R10.grundEu, T.R10.grund),
  },
  {
    id: 'R11',
    dringlichkeit: 'mittel',
    quellen: [kivo(26), ANHANG_III],
    gilt: (w) => w.euBezug === true && HOCHRISIKO.has(w.kategorie),
    grund: fest(T.R11.grund),
  },
  {
    id: 'R12',
    dringlichkeit: 'hoechste',
    quellen: [kivo(5)],
    gilt: (w) => w.verboten === true,
    grund: fest(T.R12.grund),
  },
  {
    id: 'R13',
    dringlichkeit: 'niedrig',
    quellen: [PRAXIS],
    gilt: (w) => w.verantwortlich.trim() === '',
    grund: fest(T.R13.grund),
  },
  {
    id: 'R14',
    dringlichkeit: 'niedrig',
    quellen: [PRAXIS],
    gueltigTage: 365,
    gilt: () => true,
    grund: fest(T.R14.grund),
  },
];

/** Die Prüfpunkte eines Werkzeugs: jede Regel, die greift, mit ihrem Stand. */
export function pruefpunkte(w: Werkzeug, heute: string): Pruefpunkt[] {
  return REGELN.filter((r) => r.gilt(w)).map((r) => ({
    regel: r.id,
    werkzeugId: w.id,
    werkzeugName: w.name,
    titel: T[r.id].titel,
    grund: r.grund(w),
    quellen: r.quellen,
    dringlichkeit: r.dringlichkeit,
    ...stand(r, w.pruefungen[r.id], heute),
  }));
}

function stand(r: Regel, pruefung: Pruefung | undefined, heute: string) {
  if (!pruefung) return { status: 'offen' as const };
  if (r.gueltigTage !== undefined && tageZwischen(pruefung.datum, heute) >= r.gueltigTage) {
    return { status: 'offen' as const, zuletzt: pruefung.datum };
  }
  return { status: pruefung.status, begruendung: pruefung.begruendung, datum: pruefung.datum };
}
