import type { Quelle } from './regeln';

export interface Frist {
  /** JJJJ-MM-TT; bei geplanten Terminen der späteste Tag. */
  readonly datum: string;
  /** Statt des Datums anzeigen, wenn der Tag noch nicht feststeht. */
  readonly ungefaehr?: string;
  readonly titel: string;
  readonly was: string;
  readonly betrifft: string;
  readonly eu: boolean;
  readonly quelle: Quelle;
}

const KIVO = 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj/deu';
const OMNIBUS = 'https://eur-lex.europa.eu/eli/reg/2026/1744/oj/deu';
const DSG = 'https://www.fedlex.admin.ch/eli/cc/2022/491/de';

/** Geprüft am 11.10.2026 gegen fedlex und EUR-Lex. */
export const FRISTEN: readonly Frist[] = [
  {
    datum: '2023-09-01',
    titel: 'Revidiertes Datenschutzgesetz',
    was: 'Das DSG gilt technologieneutral, also auch für KI-Werkzeuge.',
    betrifft: 'Immer, sobald Personendaten in ein Werkzeug gelangen.',
    eu: false,
    quelle: { text: 'DSG, SR 235.1', url: DSG },
  },
  {
    datum: '2025-02-02',
    titel: 'Verbote und KI-Kompetenz',
    was: 'Verbotene Praktiken wie Social Scoring oder Emotionserkennung am Arbeitsplatz; Massnahmen für die KI-Kompetenz des Personals.',
    betrifft: 'Dich, wenn Ausgaben in der EU genutzt werden oder Kundschaft dort sitzt.',
    eu: true,
    quelle: { text: 'KI-VO Art. 4 und 5', url: `${KIVO}#art_5` },
  },
  {
    datum: '2025-08-02',
    titel: 'Allzweckmodelle',
    was: 'Pflichten für Anbieter von KI-Modellen mit allgemeinem Verwendungszweck.',
    betrifft: 'Vor allem die Anbieter der Modelle, kaum die Firmen, die sie nutzen.',
    eu: true,
    quelle: { text: 'KI-VO Kapitel V', url: KIVO },
  },
  {
    datum: '2026-07-27',
    titel: 'Digital-Omnibus in Kraft',
    was: 'Die EU ändert die KI-Verordnung: Hochrisiko-Pflichten verschoben, KI-Kompetenz als Pflicht zu Massnahmen ohne garantiertes Niveau.',
    betrifft: 'Dich, wenn du EU-Bezug hast; die Daten unten folgen schon der Änderung.',
    eu: true,
    quelle: { text: 'Verordnung (EU) 2026/1744', url: OMNIBUS },
  },
  {
    datum: '2026-08-02',
    titel: 'Transparenz',
    was: 'Hinweis im Chatbot, Deepfakes und KI-Texte zu Fragen von öffentlichem Interesse offenlegen.',
    betrifft: 'Dich, wenn KI-Ausgaben an Personen in der EU gehen.',
    eu: true,
    quelle: { text: 'KI-VO Art. 50', url: `${KIVO}#art_50` },
  },
  {
    datum: '2026-12-02',
    titel: 'Markierung und zwei neue Verbote',
    was: 'Ende der Übergangsfrist für die maschinenlesbare Markierung bei Systemen, die vor dem 02.08.2026 auf dem Markt waren. Neu verboten: KI für intime Bilder ohne Einwilligung und für Darstellungen von Kindesmissbrauch.',
    betrifft: 'Die Markierung die Anbieter; die Verbote alle mit EU-Bezug.',
    eu: true,
    quelle: { text: 'Verordnung (EU) 2026/1744', url: OMNIBUS },
  },
  {
    datum: '2026-12-31',
    ungefaehr: 'Ende 2026',
    titel: 'KI-Gesetz Schweiz in der Vernehmlassung (geplant)',
    was: 'Der Bundesrat will die KI-Konvention des Europarats umsetzen und den Entwurf Ende 2026 in die Vernehmlassung geben.',
    betrifft: 'Noch niemanden; zum Vormerken.',
    eu: false,
    quelle: { text: 'Bundesrat, Entscheid vom 12.02.2025' },
  },
  {
    datum: '2027-12-02',
    titel: 'Hochrisiko nach Anhang III',
    was: 'Pflichten für Betreiber von Hochrisiko-KI, etwa im Personalwesen, bei Kreditwürdigkeit oder in der Bildung.',
    betrifft: 'Dich, wenn du solche Systeme mit EU-Bezug einsetzt.',
    eu: true,
    quelle: { text: 'KI-VO Art. 26 und Anhang III', url: `${KIVO}#anx_III` },
  },
  {
    datum: '2028-08-02',
    titel: 'Hochrisiko nach Anhang I',
    was: 'KI als Sicherheitsbauteil in regulierten Produkten wie Maschinen oder Medizinprodukten.',
    betrifft: 'Vor allem Hersteller solcher Produkte.',
    eu: true,
    quelle: { text: 'KI-VO Anhang I', url: `${KIVO}#anx_I` },
  },
];

/** «gilt» ab dem Tag selbst, vorher «kommt». */
export function giltSchon(frist: Frist, heute: string): boolean {
  return frist.ungefaehr === undefined && frist.datum <= heute;
}
