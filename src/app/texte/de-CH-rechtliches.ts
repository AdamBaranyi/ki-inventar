/** Impressum und Datenschutzerklärung. Stand 11.10.2026. */
export interface Abschnitt {
  titel: string;
  absaetze: readonly string[];
  links?: readonly { text: string; href: string }[];
}

const WEBSITE_IMPRESSUM = 'https://adambaranyi.xyz/de/impressum/';

export const IMPRESSUM: readonly Abschnitt[] = [
  {
    titel: 'Betreiber',
    absaetze: [
      'Adam Baranyi, Luzern, Schweiz.',
      'Postadresse und E-Mail stehen im Impressum von adambaranyi.xyz.',
    ],
    links: [{ text: 'Impressum von adambaranyi.xyz', href: WEBSITE_IMPRESSUM }],
  },
  {
    titel: 'Keine Rechtsberatung',
    absaetze: [
      'Das KI-Inventar ist ein kostenloses Hilfsmittel. Es übersetzt deine Angaben in Prüfpunkte und nennt die Gesetzesstellen dazu. Verbindlich sind der Gesetzestext und eine Fachberatung. Für die Vollständigkeit und Richtigkeit der Prüfpunkte gibt es keine Gewähr.',
      'Rechtsstand geprüft am 11.10.2026 gegen fedlex (Datenschutzgesetz, SR 235.1) und EUR-Lex (Verordnung (EU) 2024/1689, geändert durch Verordnung (EU) 2026/1744).',
    ],
  },
  {
    titel: 'Quellcode und Schrift',
    absaetze: [
      'Der Quellcode liegt öffentlich auf GitHub. Die Schrift Mona Sans steht unter der SIL Open Font License 1.1 und wird mit der App ausgeliefert.',
    ],
    links: [
      { text: 'Quellcode auf GitHub', href: 'https://github.com/AdamBaranyi/ki-inventar' },
      { text: 'Lizenz der Schrift', href: 'schrift-lizenz.txt' },
    ],
  },
  {
    titel: 'Links',
    absaetze: [
      'Für die Inhalte verlinkter Seiten, etwa fedlex, EUR-Lex oder die Seiten der Anbieter in den Vorlagen, sind ausschliesslich deren Betreiber verantwortlich.',
    ],
  },
];

export const DATENSCHUTZ: readonly Abschnitt[] = [
  {
    titel: 'Kurz',
    absaetze: [
      'Was du im KI-Inventar erfasst, bleibt in deinem Browser. Es gibt kein Konto, keinen Server für deine Daten, keine Cookies, kein Tracking und keine Schriften oder Skripte von Dritten.',
    ],
  },
  {
    titel: 'Verantwortlich',
    absaetze: ['Adam Baranyi, Luzern, Schweiz. Kontakt über das Impressum von adambaranyi.xyz.'],
    links: [{ text: 'Impressum von adambaranyi.xyz', href: WEBSITE_IMPRESSUM }],
  },
  {
    titel: 'Was im Browser gespeichert wird',
    absaetze: [
      'Deine Angaben und der Stand der Prüfpunkte liegen im lokalen Speicher dieses Browsers (localStorage) unter dem Schlüssel «ki-inventar». Lassen sich gespeicherte Daten nicht lesen und beginnst du neu, kommen sie unter «ki-inventar-unlesbar» beiseite.',
      'Der Speicher ist für die Funktion nötig: Ohne ihn wäre alles beim Schliessen weg. Die Daten verlassen dein Gerät nur, wenn du selbst eine Sicherung oder Tabelle herunterlädst.',
      'Löschen kannst du alles unter «Daten» mit «Alle Daten in diesem Browser löschen» oder über die Website-Daten in den Einstellungen deines Browsers.',
    ],
  },
  {
    titel: 'Hosting',
    absaetze: [
      'Die Seite liegt bei GitHub Pages (GitHub, Inc., USA). Beim Aufruf verarbeitet GitHub technisch nötige Daten wie die IP-Adresse und den Zeitpunkt, um die Seite auszuliefern und vor Missbrauch zu schützen. Das ist eine Bekanntgabe in die USA. Einzelheiten stehen in der Datenschutzerklärung von GitHub.',
    ],
    links: [
      {
        text: 'Datenschutzerklärung von GitHub',
        href: 'https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement',
      },
    ],
  },
  {
    titel: 'Links zu Gesetzestexten und Anbietern',
    absaetze: [
      'Die Quellen der Prüfpunkte verweisen auf fedlex und EUR-Lex, die Vorlagen auf Seiten der Anbieter wie OpenAI, Microsoft, Anthropic, Google und DeepL. Erst wenn du einen solchen Link öffnest, ruft dein Browser die fremde Seite auf; dort gilt deren Datenschutzerklärung.',
    ],
  },
  {
    titel: 'Deine Rechte',
    absaetze: [
      'Über deine Daten im Browser verfügst du selbst. Zu den Daten, die beim Hosting entstehen, kannst du Auskunft verlangen; wende dich dafür an den Verantwortlichen oder an GitHub.',
    ],
  },
];
