/** Texte der Kalenderdatei für die jährliche Überprüfung. */
export const KALENDER = {
  produkt: '-//Adam Baranyi//KI-Inventar//DE',
  titel: (name: string) => `KI-Inventar: «${name}» jährlich überprüfen`,
  beschreibung:
    'Im KI-Inventar prüfen, ob die Antworten zu diesem Werkzeug noch stimmen. Danach den Prüfpunkt «Eintrag jährlich überprüfen» als erledigt markieren.',
} as const;
