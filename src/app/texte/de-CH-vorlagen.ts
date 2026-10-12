/** Texte der Vorlagen je Werkzeug; Stand der Angaben siehe VORLAGEN_STAND. */
export const VORLAGEN_TEXTE = {
  titel: 'Vorlage verwenden',
  einleitung: (stand: string) =>
    `Für bekannte Werkzeuge kann das KI-Inventar einige Antworten vorschlagen, Stand der Angaben ${stand}. Es füllt nur Fragen, die noch offen sind; den Standort wählst du selbst.`,
  uebernehmen: (variante: string) => `Vorlage «${variante}» übernehmen`,
  uebernommen: (werkzeug: string, variante: string) =>
    `Vorlage übernommen: ${werkzeug}, ${variante}. Prüfe die Antworten in den nächsten Fragen; Bedingungen ändern sich.`,
  quellen: 'Quellen',
  chatgptPrivat: {
    variante: 'Free, Plus oder Pro mit privatem Konto',
    hinweis:
      'Das Training mit Eingaben läuft, bis jemand «Improve the model for everyone» in den Einstellungen ausschaltet. Einen Vertrag zur Auftragsbearbeitung gibt es für private Konten nicht. Vertragspartner für die Schweiz ist OpenAI Ireland Ltd; bearbeitet wird auch in den USA.',
  },
  chatgptFirma: {
    variante: 'Business oder Enterprise',
    hinweis:
      'Daten aus Business und Enterprise nutzt OpenAI nach eigener Angabe nicht zum Training. Ein Data Processing Addendum lässt sich abschliessen; prüft, ob es für euch gilt. Vertragspartner für die Schweiz ist OpenAI Ireland Ltd; bearbeitet wird auch in den USA.',
  },
  copilotFirma: {
    variante: 'mit Geschäftskonto (Microsoft 365)',
    hinweis:
      'Eingaben, Antworten und Daten aus Microsoft Graph trainieren laut Microsoft keine Basismodelle. Es gelten die Product Terms und das Data Protection Addendum von Microsoft. Modelle von Anthropic laufen dort ausserhalb der EU Data Boundary.',
  },
  claudePrivat: {
    variante: 'Free, Pro oder Max',
    hinweis:
      'Seit Herbst 2025 entscheidet jedes private Konto selbst, ob Chats zum Training dienen; wer zustimmt, dessen Chats bleiben bis zu fünf Jahre gespeichert. Prüft die Einstellung «Help improve Claude». Einen Vertrag zur Auftragsbearbeitung gibt es für private Konten nicht. Zuständig für die Schweiz ist Anthropic Ireland, Limited.',
  },
  claudeFirma: {
    variante: 'Team, Enterprise oder API',
    hinweis:
      'Für Team, Enterprise und die API gelten die Commercial Terms von Anthropic; Eingaben dienen dort nicht zum Training. Die Bedingungen für die Auftragsbearbeitung gehören zu diesen Verträgen; prüft, ob sie für euch gelten.',
  },
  geminiPrivat: {
    variante: 'Gemini-App mit privatem Google-Konto',
    hinweis:
      'Mit eingeschalteter Gemini-Apps-Aktivität verwendet Google Chats auch, um Produkte und Modelle zu verbessern. Menschliche Prüferinnen und Prüfer können Chats lesen, auch wenn die Aktivität ausgeschaltet ist. Einen Vertrag zur Auftragsbearbeitung gibt es für private Konten nicht.',
  },
  geminiWorkspace: {
    variante: 'in Google Workspace',
    hinweis:
      'Gemini in Workspace verwendet Eingaben, Inhalte und Antworten laut Google nicht ohne Erlaubnis zum Training. Für die Daten gilt das Cloud Data Processing Addendum von Google; prüft, ob es für euer Konto gilt.',
  },
  deeplFree: {
    variante: 'Gratisversion',
    hinweis:
      'Texte der Gratisversion speichert DeepL eine Zeit lang, um seine Modelle zu trainieren, und rät, keine Personendaten einzugeben. DeepL SE hat den Sitz in Köln (Deutschland).',
  },
  deeplPro: {
    variante: 'DeepL Pro',
    hinweis:
      'Mit DeepL Pro werden Texte nicht dauerhaft gespeichert und nicht zum Verbessern verwendet. Einen Vertrag zur Auftragsbearbeitung sehen die Pro-Bedingungen vor (Anfrage an privacy@deepl.com). DeepL SE hat den Sitz in Köln (Deutschland).',
  },
} as const;
