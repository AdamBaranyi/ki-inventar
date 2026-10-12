# Stand

## Eigener Server (live seit 12.10.2026)

Live auf https://ki-inventar.adambaranyi.xyz, Stand `b2e61f1`, Zertifikat von Let's Encrypt (bis
10.01.2027). Abnahme von aussen am 12.10.2026: 14 von 14 Prüfungen grün (HTTPS, Umleitung von HTTP,
HSTS, CSP mit `frame-ancestors`, `nosniff`, Referrer, Rahmen, kein `Server`/`Via`, Cache, Basis,
tiefe Links); im Browser (Chromium, WebKit) keine CSP-Verstösse, keine Fehler. Tallyroom und
Evidarium liefen nach dem Neustart des Proxys weiter.

Aufbau, wie vorbereitet:

`ki-inventar.adambaranyi.xyz` auf vps1, hinter dem Caddy von Tallyroom (PR
AdamBaranyi/tallyroom#32). Abbild aus `infra/Dockerfile` (Node und Bun bauen, Caddy liefert aus),
`infra/compose.prod.yml` hängt den Dienst als `ki-inventar-web` ins Netz `tallyroom-prod_default`.
CI baut das Abbild und prüft es von aussen. Ausrollen (durch Adam, erledigt):

1. DNS: A-Eintrag `ki-inventar` → `185.150.28.175` im FSIT-cPanel (kein AAAA, IPv6 ist kaputt).
2. Tallyroom-PR mergen, in `/opt/tallyroom/infra/.env.production`
   `KI_INVENTAR_SITE_ADDRESS=ki-inventar.adambaranyi.xyz` eintragen, `sudo /opt/tallyroom/infra/deploy.sh`.
3. `sudo git clone https://github.com/AdamBaranyi/ki-inventar.git /opt/ki-inventar`,
   dann `sudo /opt/ki-inventar/infra/deploy.sh`.
4. Abnahme von aussen: Seite, Kopfzeilen, Zertifikat.

Spätere Updates: `sudo /opt/ki-inventar/infra/deploy.sh`; Tallyroom muss dafür nicht neu
ausgerollt werden. Offen: Entscheid, ob GitHub Pages bleibt. Daten wandern nicht von selbst: Sie
liegen je Adresse im Browser; umziehen mit «Sicherung herunterladen» und «Sicherung wählen».

## Version 1.0 (12.10.2026)

- **Vorlagen** für ChatGPT, Microsoft Copilot, Claude, Gemini und DeepL, je privat und Firma:
  Anbieter, Zugang, Training, AVV als Vorschlag, mit Hinweis und Quellen. Geprüft am 12.10.2026:
  Anthropic (Consumer Terms 2025), DeepL (Datenschutzerklärung, Pro), Microsoft (Copilot-Datenschutz,
  Stand 08.10.2026) direkt; OpenAI und Google nur über Suchauszüge, die Seiten blockten den Abruf.
  Den Standort setzt keine Vorlage.
- **Frage 1** fragt jetzt nach dem Ort der Bearbeitung statt nur nach dem Vertragspartner: Bei
  ChatGPT ist der Vertragspartner in Irland, bearbeitet wird auch in den USA; R3 soll greifen.
- **Bearbeitungsverzeichnis** (Art. 12 DSG) als CSV-Entwurf; Text zu Art. 24 DSV gegen fedlex
  geprüft (DSV Stand 01.12.2025).
- **Kalender** (.ics) für die jährliche Überprüfung.
- **Darstellung:** zuerst automatisch nach dem Gerät; am 12.10.2026 ersetzt durch einen Umschalter
  Hell (Vorgabe), Dunkel, System (Adams Wunsch). `public/darstellung.js` setzt die Wahl vor dem
  Zeichnen, die Farben tragen ihren hellen und dunklen Wert (`light-dark()`).
- **Fehlermeldungen im Formular** erscheinen erst nach «Weiter»: Beim Verlassen des Feldes schoben
  sie den Knopf zwischen Drücken und Loslassen der Maus weg (gefunden im Lauf mit Firefox).
- **Erinnerungen** per Issue: wöchentlich offene Pull Requests, monatlich Wartung.
- Tests: 144 Unit-Tests, 95 Browser-Tests (davon 6 dunkel), 62 Sabotagen.

## Gestaltung «Prüfpult» (12.10.2026)

Umbau nach der freigegebenen Stilprobe (`~/Code/portfolio/design/ki-inventar/`):

- App-Rahmen: am Handy Tab-Leiste mit vier Zielen (Übersicht, Prüfpunkte, Fristen, Mehr), am Desktop
  Seitenleiste mit der Zahl offener Punkte. Im Formular fallen Kopf und Tab-Leiste am Handy weg.
- Übersicht: Fortschritt («5 von 40 Prüfpunkten erledigt») mit Balken, «Als Nächstes» mit den drei
  dringendsten Punkten (öffnet das Werkzeug mit dem Punkt aufgeklappt), Werkzeuge mit Monogramm und
  Stand, kurze Fristen mit «Heute». Leer: Einleitung, zwei Wege, drei Schritte.
- Werkzeug: Merkmale als Chips, Fortschritt, Prüfpunkte als Checkliste zum Aufklappen, Antworten je
  Frage mit «Ändern» direkt zum passenden Schritt.
- Formular: eine Frage je Bildschirm (`?frage=1` bis `10`), Striche als Fortschritt, «Zurück» und
  «Weiter» unten, «Weiss ich nicht» bei jeder Auswahl ausser dem Zweck. Ältere Antworten «unbekannt»
  und «unklar» erscheinen als «Weiss ich nicht» und zählen als offene Antwort.
- Schrift Mona Sans (OFL, lokal), Überschriften breit gesetzt; eigene Bildzeichen als SVG-Pfade.
  Tabellenziffern nur in der Tabelle des Verzeichnisses (die von Mona Sans haben eine Code-Form).
- Tests: 126 Unit-Tests, 83 Browser-Tests in drei Breiten, 53 Sabotagen, alle rot.

## Meilenstein MVP (11.10.2026): live

Live auf https://adambaranyi.github.io/ki-inventar/, gebaut und geprüft von der CI auf `main`.

**Fertig**
- Übersicht mit Zahlen, Liste der Werkzeuge mit Status, «Werkzeug erfassen», «Beispiel laden».
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

1. Adams Gerätetest am iPhone (Safari): Werkzeug mit Vorlage erfassen, Prüfpunkt erledigen,
   Sicherung und Kalender herunterladen, Druckansicht als PDF.
2. Subdomain `ki-inventar.adambaranyi.xyz` auf vps1 mit Caddy und Sicherheits-Headern; DNS-Eintrag
   und sudo-Befehle durch Adam.
3. Browser-Lauf mit WebKit und Firefox (`playwright.browsers.config.ts`) vor jedem Deploy.

## Vorgemerkt, nicht im MVP

Mehrsprachigkeit (FR, IT, EN; die Rechtstexte brauchen dafür die amtlichen Fassungen von DSG und
KI-VO), Team-Sync mit Server, Import aus Excel, PDF-Erzeugung ohne Browserdruck.

## Aufgefallen

- Zod 4 über einen weitergereichten Namensraum (`export { z }`) lässt sich nicht verkleinern: 453 kB
  statt 111 kB. Darum `export * from 'zod'` in `src/app/zod.ts` und `import * as z`.
- Angulars Option `subresourceIntegrity` legt eine Import-Map als Inline-Skript an; die CSP blockt sie.
- Im Handy-Profil von Playwright wächst `window.innerWidth` mit überbreitem Inhalt mit; Querscrollen
  darum gegen `clientWidth` messen. Gefunden, weil eine Sabotage grün blieb.
- GitHub Pages liefert tiefe Links als 404.html mit Status 404; Chromium meldet das als
  Konsolenfehler. Der Test filtert genau diese Meldung zum Hauptdokument.
