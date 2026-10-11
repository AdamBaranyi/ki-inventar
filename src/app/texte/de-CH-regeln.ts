/**
 * Titel und Begründung je Regel. Rechtsstand geprüft am 11.10.2026 gegen
 * fedlex (DSG, Stand 07.07.2025) und EUR-Lex (KI-VO 2024/1689, geändert durch
 * 2026/1744). Weicht etwas ab, gilt die Quelle.
 */
export const REGEL_TEXTE = {
  R1: {
    titel: 'Datenschutzerklärung ergänzen',
    grund:
      'In die Eingaben gelangen Personendaten. Die Datenschutzerklärung nennt das Werkzeug, den Zweck und den Anbieter als Empfänger, bei Bekanntgabe ins Ausland auch den Staat.',
  },
  R2: {
    titel: 'Vertrag zur Auftragsbearbeitung abschliessen',
    grund:
      'Der Anbieter bearbeitet Personendaten in deinem Auftrag. Ohne Vertrag zur Auftragsbearbeitung (AVV) dürfen keine Personendaten hinein; bis dahin ohne Personendaten arbeiten.',
  },
  R3: {
    titel: 'Bekanntgabe ins Ausland prüfen',
    grundUsa:
      'Der Anbieter sitzt in den USA. Personendaten dürfen nur hin, wenn er unter dem Swiss-U.S. Data Privacy Framework zertifiziert ist oder Garantien wie Standardvertragsklauseln bestehen.',
    grund:
      'Der Anbieter sitzt ausserhalb der Schweiz und des EWR, oder der Standort ist offen. Personendaten nur in Staaten mit angemessenem Schutz (Liste des Bundesrats) oder mit Garantien wie Standardvertragsklauseln.',
  },
  R4: {
    titel: 'Besonders schützenswerte Daten absichern',
    grund:
      'Daten über Gesundheit, Religion, Herkunft, Biometrie oder Strafverfahren brauchen eine ausdrückliche Einwilligung oder eine gesetzliche Grundlage. Eine Datenschutz-Folgenabschätzung prüfen.',
  },
  R5: {
    titel: 'Training mit eigenen Eingaben ausschliessen',
    grund:
      'Personendaten oder Geschäftsgeheimnisse könnten ins Training des Anbieters fliessen. In den Einstellungen oder im Vertrag ausschliessen, sonst solche Daten nicht eingeben.',
  },
  R6: {
    titel: 'Firmenkonto statt privater Konten',
    grund:
      'Private oder kostenlose Konten mit Personendaten oder Geschäftsgeheimnissen entziehen sich der Kontrolle der Firma. Ein Firmenkonto mit Vertrag und eine Weisung an die Mitarbeitenden schaffen Ordnung.',
  },
  R7: {
    titel: 'Automatisierte Entscheidungen offenlegen',
    grund:
      'Das Werkzeug entscheidet über Personen ohne menschliche Prüfung. Betroffene informieren, ihnen ermöglichen, ihren Standpunkt darzulegen, und auf Verlangen eine Überprüfung durch einen Menschen anbieten.',
  },
  R8: {
    titel: 'Datenschutz-Folgenabschätzung durchführen',
    grund:
      'Personendaten im Personalwesen, bei Entscheidungen über Personen, mit besonders schützenswerten Daten oder im Kundenkontakt mit vielen Betroffenen können ein hohes Risiko bedeuten. Vorher abschätzen und festhalten.',
  },
  R9: {
    titel: 'KI-Inhalte kennzeichnen',
    grundEu:
      'Ausgaben gehen an Kundinnen, Kunden oder die Öffentlichkeit. Mit EU-Bezug ist das seit 02.08.2026 Pflicht: Hinweis im Chatbot, Deepfakes und KI-Texte zu Fragen von öffentlichem Interesse offenlegen. Die maschinenlesbare Markierung ist Sache des Anbieters (Übergang bis 02.12.2026 für Systeme, die vorher auf dem Markt waren).',
    grund:
      'Ausgaben gehen an Kundinnen, Kunden oder die Öffentlichkeit. Ohne EU-Bezug gilt die KI-Verordnung nicht; Kennzeichnen ist eine Empfehlung, weil der EDÖB Transparenz über den KI-Einsatz verlangt.',
  },
  R10: {
    titel: 'KI-Kompetenz fördern',
    grundEu:
      'Die Mitarbeitenden sind nicht geschult. Mit EU-Bezug ist das Pflicht: Anbieter und Betreiber ergreifen Massnahmen für die KI-Kompetenz ihres Personals (seit 02.02.2025; seit 27.07.2026 ohne garantiertes Niveau).',
    grund:
      'Die Mitarbeitenden sind nicht geschult. Ohne EU-Bezug ist das eine Empfehlung: Eine kurze Schulung zu Datenschutz, Grenzen und Fehlern des Werkzeugs senkt das Risiko.',
  },
  R11: {
    titel: 'Hochrisiko-Einstufung prüfen',
    grund:
      'Einsatz im Personalwesen, bei Entscheidungen über Personen, zur Kreditwürdigkeit oder in der Bildung kann mit EU-Bezug nach Anhang III hochriskant sein. Die Pflichten für Betreiber (Art. 26) gelten ab 02.12.2027.',
  },
  R12: {
    titel: 'Einsatz stoppen und rechtlich prüfen',
    grund:
      'Emotionserkennung am Arbeitsplatz, Social Scoring und biometrische Kategorisierung sind in der EU seit 02.02.2025 verboten. Einsatz sofort stoppen und Fachberatung beiziehen.',
  },
  R13: {
    titel: 'Verantwortliche Person benennen',
    grund:
      'Für das Werkzeug ist niemand verantwortlich eingetragen. Eine Person hält den Eintrag aktuell und beantwortet Fragen dazu.',
  },
  R14: {
    titel: 'Eintrag jährlich überprüfen',
    grund:
      'Anbieter ändern Bedingungen, Standorte und Einstellungen. Den Eintrag einmal im Jahr durchgehen und als erledigt markieren.',
  },
} as const;
