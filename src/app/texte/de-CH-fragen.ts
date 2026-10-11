/** Die zehn Fragen je Werkzeug und die Beschriftung jeder Antwort. */
export const OPTIONEN = {
  standort: {
    ch: 'Schweiz',
    eu: 'EU oder EWR',
    usa: 'USA',
    andere: 'Anderes Land',
    unbekannt: 'Unbekannt',
  },
  kategorie: {
    texte: 'Texte und Mails',
    uebersetzung: 'Übersetzung',
    medien: 'Bilder, Video, Audio',
    code: 'Programmcode',
    daten: 'Auswertung von Daten',
    kundenkontakt: 'Kundenkontakt, Chatbot',
    personal: 'Personal und Bewerbungen',
    entscheidungen: 'Entscheidungen über Personen',
    kredit: 'Kreditwürdigkeit',
    bildung: 'Bildung und Prüfungen',
    anderes: 'Anderes',
  },
  zugang: {
    privat: 'Private oder kostenlose Konten',
    firma: 'Firmenkonto',
    enterprise: 'Enterprise-Vertrag',
  },
  personendaten: {
    nein: 'Nein',
    ja: 'Ja',
    besonders: 'Ja, auch besonders schützenswerte',
  },
  training: {
    ja: 'Ja, ausgeschlossen',
    nein: 'Nein',
    unbekannt: 'Unbekannt',
  },
  avv: {
    ja: 'Ja',
    nein: 'Nein',
    unklar: 'Unklar',
  },
} as const;

export const JA_NEIN = { ja: 'Ja', nein: 'Nein', offen: 'offen' } as const;

export const FRAGEN = {
  q1: {
    titel: 'Werkzeug und Anbieter',
    name: 'Name des Werkzeugs',
    anbieter: 'Anbieter',
    standort: 'Wo sitzt der Anbieter?',
    standortHilfe: 'Massgebend ist die Firma, mit der ihr den Vertrag habt.',
  },
  q2: {
    titel: 'Zweck',
    kategorie: 'Wofür wird es eingesetzt?',
    zweck: 'Kurz beschrieben',
    zweckHilfe: 'Zum Beispiel: Entwürfe für Offerten, Protokolle von Sitzungen.',
  },
  q3: {
    titel: 'Wer nutzt es',
    abteilungen: 'Abteilungen oder Teams',
    anzahl: 'Ungefähre Zahl der Nutzenden',
    verantwortlich: 'Verantwortliche Person',
  },
  q4: { titel: 'Zugang', frage: 'Wie greifen die Mitarbeitenden zu?' },
  q5: {
    titel: 'Personendaten',
    frage: 'Gelangen Personendaten in die Eingaben?',
    hilfe:
      'Besonders schützenswert sind Daten über Gesundheit, Religion, Herkunft, Biometrie oder Strafverfahren.',
  },
  q6: { titel: 'Geschäftsgeheimnisse', frage: 'Gelangen Geschäftsgeheimnisse oder Kundendaten hinein?' },
  q7: {
    titel: 'Training',
    frage: 'Ist das Training mit euren Eingaben ausgeschlossen?',
    hilfe: 'Steht in den Einstellungen des Kontos oder im Vertrag.',
  },
  q8: {
    titel: 'Vertrag zur Auftragsbearbeitung',
    frage: 'Gibt es mit dem Anbieter einen Vertrag zur Auftragsbearbeitung (AVV)?',
  },
  q9: {
    titel: 'Ausgaben und Entscheidungen',
    ausgaben: 'Gehen Ausgaben an Dritte, etwa Texte, Bilder oder Chatbot-Antworten für Kundschaft oder Öffentlichkeit?',
    entscheidungen: 'Entscheidet das Werkzeug über Personen, ohne dass ein Mensch prüft?',
  },
  q10: {
    titel: 'EU, Schulung, Verbote',
    eu: 'Werden Ausgaben in der EU genutzt, oder sitzen Kundinnen und Kunden dort?',
    geschult: 'Sind die Mitarbeitenden für das Werkzeug geschult?',
    verboten:
      'Nutzt es Emotionserkennung am Arbeitsplatz, Social Scoring oder biometrische Kategorisierung?',
  },
} as const;

/** Kurze Namen der Angaben, etwa für «Es fehlen: …» und die Tabelle. */
export const ANGABEN = {
  standort: 'Standort',
  kategorie: 'Zweck',
  zugang: 'Zugang',
  personendaten: 'Personendaten',
  geheimnisse: 'Geschäftsgeheimnisse',
  training: 'Training',
  avv: 'AVV',
  ausgabenDritte: 'Ausgaben an Dritte',
  entscheidungen: 'Entscheidungen über Personen',
  euBezug: 'EU-Bezug',
  geschult: 'Schulung',
  verboten: 'Verbotene Praktiken',
} as const;
