# Stand

## Meilenstein MVP (11.10.2026): live

Live auf https://adambaranyi.github.io/ki-inventar/, gebaut und geprüft von der CI auf `main`.

**Fertig**
- Übersicht mit drei Zahlen, Liste der Werkzeuge mit Status, «Werkzeug erfassen», «Beispiel laden».
- Formular mit zehn Fragen, Autosave, Validierung (Name, Länge, ganze Zahl), offene Angaben.
- 14 Regeln als reine Funktionen, je Regel Tests (greift, greift nicht) und eine Sabotage; Status
  offen, erledigt, trifft nicht zu (mit Begründung); jährliche Prüfung läuft nach 365 Tagen ab.
- Gesamtliste der Prüfpunkte nach Dringlichkeit, Fristen als Zeitachse mit Marke für heute.
- Sicherung (JSON), Tabelle (CSV mit BOM, Formeln entschärft), Wiederherstellen mit Rückfrage,
  alles löschen, Druckansicht A4 mit Seitenzahl.
- Impressum (Name, Ort, Verweis auf das volle Impressum der Website), Datenschutz.
- Rechtsstand gegen fedlex und EUR-Lex geprüft am 11.10.2026; dabei gefunden: Der Digital-Omnibus
  hat Art. 4 (KI-Kompetenz) zu einer Pflicht zu Massnahmen ohne garantiertes Niveau gemacht (R10).
- CI: Audit ab high, gitleaks über alle Commits, Quelltext-Regeln, Vitest, Skript-Tests, Build,
  Playwright in drei Breiten, danach Deploy auf Pages. Täglicher Sicherheitslauf meldet per Issue.
  Dependabot wöchentlich (Bun) und monatlich (Actions), sieben Tage Wartezeit.

## Als Nächstes

1. Adams Gerätetest am iPhone (Safari): eigenes Werkzeug erfassen, Prüfpunkt erledigen, Sicherung
   herunterladen, Druckansicht als PDF.
2. Lizenz: erledigt am 11.10.2026, «Alle Rechte vorbehalten» wie Tallyroom und Hundebüechli (`LICENSE`).
3. Browser-Lauf mit WebKit und Firefox (`playwright.browsers.config.ts`) vor dem nächsten Deploy.
4. Erinnerungs-Workflows (wöchentlich offene PRs, monatliche Checkliste) wie in Tallyroom.
5. Subdomain `ki-inventar.adambaranyi.xyz` auf vps1 mit Caddy und Sicherheits-Headern; DNS-Eintrag
   setzt Adam.

## Vorgemerkt, nicht im MVP

Mehrsprachigkeit (FR, IT, EN), Vorlagen je bekanntem Werkzeug (Standort und Trainings-Einstellung
von ChatGPT, Copilot, Claude, Gemini, DeepL als Vorschlag), Team-Sync mit Server, Import aus Excel,
Bearbeitungsverzeichnis nach Art. 12 DSG, PDF-Erzeugung ohne Browserdruck, Erinnerung zur jährlichen
Prüfung, Dunkelmodus (Token sind dafür angelegt).

## Aufgefallen

- Zod 4 über einen weitergereichten Namensraum (`export { z }`) lässt sich nicht verkleinern: 453 kB
  statt 111 kB. Darum `export * from 'zod'` in `src/app/zod.ts` und `import * as z`.
- Angulars Option `subresourceIntegrity` legt eine Import-Map als Inline-Skript an; die CSP blockt sie.
- Im Handy-Profil von Playwright wächst `window.innerWidth` mit überbreitem Inhalt mit; Querscrollen
  darum gegen `clientWidth` messen. Gefunden, weil eine Sabotage grün blieb.
- GitHub Pages liefert tiefe Links als 404.html mit Status 404; Chromium meldet das als
  Konsolenfehler. Der Test filtert genau diese Meldung zum Hauptdokument.
