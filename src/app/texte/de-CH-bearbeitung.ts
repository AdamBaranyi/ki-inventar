/** Texte für den Entwurf des Verzeichnisses der Bearbeitungstätigkeiten (Art. 12 DSG). */
export const BEARBEITUNG = {
  kopf: [
    'Bearbeitung (Werkzeug)',
    'Verantwortlicher',
    'Ansprechperson',
    'Bearbeitungszweck',
    'Kategorien betroffener Personen',
    'Kategorien bearbeiteter Personendaten',
    'Kategorien der Empfänger',
    'Aufbewahrungsdauer',
    'Massnahmen zur Datensicherheit',
    'Bekanntgabe ins Ausland',
  ],
  ergaenzen: 'zu ergänzen',
  betroffene: {
    personal: 'Bewerbende, Mitarbeitende (prüfen)',
    entscheidungen: 'Personen, über die entschieden wird (prüfen)',
    kredit: 'Kundinnen und Kunden, Antragstellende (prüfen)',
    bildung: 'Lernende, Teilnehmende (prüfen)',
    kundenkontakt: 'Kundinnen und Kunden, Interessierte (prüfen)',
  },
  daten: {
    ja: 'Personendaten (Art präzisieren)',
    besonders: 'Personendaten, auch besonders schützenswerte (Art präzisieren)',
    offen: 'unklar, ob Personendaten hineingelangen, zu ergänzen',
  },
  empfaenger: (anbieter: string, avv: string) =>
    `Anbieter als Auftragsbearbeiter: ${anbieter || 'zu ergänzen'}, ${avv}`,
  avv: { ja: 'Vertrag zur Auftragsbearbeitung abgeschlossen', nein: 'kein Vertrag zur Auftragsbearbeitung', offen: 'Vertrag zur Auftragsbearbeitung unklar' },
  aufbewahrung: 'zu ergänzen (wenn möglich Dauer oder Kriterien)',
  sicherheit: {
    zugang: { privat: 'private Konten (durch Firmenkonten ersetzen)', firma: 'Firmenkonto', enterprise: 'Enterprise-Vertrag' },
    trainingAus: 'Training mit Eingaben ausgeschlossen',
    trainingAn: 'Training mit Eingaben nicht ausgeschlossen',
    geschult: 'Mitarbeitende geschult',
    erfasst: (teile: string) => `Erfasst: ${teile}. Weitere Massnahmen zu ergänzen`,
  },
  ausland: {
    ch: 'keine (Anbieter in der Schweiz)',
    eu: 'EU oder EWR: angemessener Datenschutz (Anhang 1 DSV)',
    usa: 'USA: angemessen nur mit Zertifizierung nach dem Swiss-U.S. Data Privacy Framework, sonst Garantie nach Art. 16 Abs. 2 DSG zu ergänzen',
    andere: 'Staat und Garantien nach Art. 16 Abs. 2 DSG zu ergänzen',
    unbekannt: 'Standort unklar, Staat und Garantien zu ergänzen',
  },
} as const;
