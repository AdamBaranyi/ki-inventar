import * as z from '../zod';

/** Antwortmöglichkeiten der zehn Fragen. `null` heisst: noch nicht beantwortet. */
export const STANDORTE = ['ch', 'eu', 'usa', 'andere', 'unbekannt'] as const;
export const KATEGORIEN = [
  'texte',
  'uebersetzung',
  'medien',
  'code',
  'daten',
  'kundenkontakt',
  'personal',
  'entscheidungen',
  'kredit',
  'bildung',
  'anderes',
] as const;
export const ZUGAENGE = ['privat', 'firma', 'enterprise'] as const;
export const PERSONENDATEN = ['nein', 'ja', 'besonders'] as const;
export const TRAINING = ['ja', 'nein', 'unbekannt'] as const;
export const AVV = ['ja', 'nein', 'unklar'] as const;

export const REGEL_IDS = [
  'R1',
  'R2',
  'R3',
  'R4',
  'R5',
  'R6',
  'R7',
  'R8',
  'R9',
  'R10',
  'R11',
  'R12',
  'R13',
  'R14',
] as const;

/** Längen an einer Stelle, für Schema und Formular. */
export const GRENZEN = {
  name: 80,
  anbieter: 80,
  zweck: 500,
  abteilungen: 200,
  verantwortlich: 80,
  anzahl: 100_000,
  begruendung: 500,
} as const;

const text = (max: number) => z.string().trim().max(max);
const janein = z.boolean().nullable();

export const pruefungSchema = z.object({
  status: z.enum(['erledigt', 'nicht-zutreffend']),
  begruendung: text(GRENZEN.begruendung),
  datum: z.iso.date(),
});

export const werkzeugSchema = z.object({
  id: z.string().min(1).max(64),
  name: text(GRENZEN.name).min(1),
  anbieter: text(GRENZEN.anbieter),
  standort: z.enum(STANDORTE).nullable(),
  kategorie: z.enum(KATEGORIEN).nullable(),
  zweck: text(GRENZEN.zweck),
  abteilungen: text(GRENZEN.abteilungen),
  anzahl: z.number().int().min(0).max(GRENZEN.anzahl).nullable(),
  verantwortlich: text(GRENZEN.verantwortlich),
  zugang: z.enum(ZUGAENGE).nullable(),
  personendaten: z.enum(PERSONENDATEN).nullable(),
  geheimnisse: janein,
  training: z.enum(TRAINING).nullable(),
  avv: z.enum(AVV).nullable(),
  ausgabenDritte: janein,
  entscheidungen: janein,
  euBezug: janein,
  geschult: janein,
  verboten: janein,
  pruefungen: z.partialRecord(z.enum(REGEL_IDS), pruefungSchema),
  erfasst: z.iso.date(),
  geaendert: z.iso.datetime(),
});

export type Werkzeug = z.infer<typeof werkzeugSchema>;
export type Pruefung = z.infer<typeof pruefungSchema>;
export type RegelId = (typeof REGEL_IDS)[number];
export type Standort = (typeof STANDORTE)[number];
export type Kategorie = (typeof KATEGORIEN)[number];

/** Die Felder, die das Formular bearbeitet. */
export type Antworten = Omit<Werkzeug, 'id' | 'pruefungen' | 'erfasst' | 'geaendert'>;

/** Ein frisch erfasstes Werkzeug: alles offen ausser dem Namen. */
export function neuesWerkzeug(id: string, name: string, jetzt: Date): Werkzeug {
  return {
    id,
    name,
    anbieter: '',
    standort: null,
    kategorie: null,
    zweck: '',
    abteilungen: '',
    anzahl: null,
    verantwortlich: '',
    zugang: null,
    personendaten: null,
    geheimnisse: null,
    training: null,
    avv: null,
    ausgabenDritte: null,
    entscheidungen: null,
    euBezug: null,
    geschult: null,
    verboten: null,
    pruefungen: {},
    erfasst: isoDatum(jetzt),
    geaendert: jetzt.toISOString(),
  };
}

/** Kalenderdatum im Format JJJJ-MM-TT, nach der Uhr des Geräts. */
export function isoDatum(datum: Date): string {
  const zwei = (zahl: number) => String(zahl).padStart(2, '0');
  return `${datum.getFullYear()}-${zwei(datum.getMonth() + 1)}-${zwei(datum.getDate())}`;
}
