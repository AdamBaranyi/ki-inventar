# KI-Inventar

Kostenloses Verzeichnis der KI-Werkzeuge eines Schweizer KMU. Jedes Werkzeug wird mit zehn Fragen
erfasst; daraus entstehen Prüfpunkte mit Grund und Gesetzesstelle nach dem Datenschutzgesetz (DSG)
und der EU-KI-Verordnung, dazu die Fristen der KI-Verordnung. Alles bleibt im Browser: kein Konto,
kein Server, keine Übermittlung.

**Live:** https://adambaranyi.github.io/ki-inventar/

**Keine Rechtsberatung.** Das Werkzeug übersetzt Angaben in Prüfpunkte; verbindlich sind der
Gesetzestext und eine Fachberatung. Rechtsstand geprüft am 11.10.2026 gegen fedlex und EUR-Lex.

## Lokal starten

```bash
bun install
bun run start
```

## Prüfen

```bash
bun run check
```

`check` führt Quelltext-Regeln, Unit-Tests (Vitest), die Tests der Sicherheitsskripte, den Build und
die Browser-Tests (Playwright, 375, 390 und 1280 px) aus. `bun run sabotage` baut Fehler in die
Regeln ein und verlangt, dass ein Test rot wird.

Sicherheit: [docs/SECURITY.md](docs/SECURITY.md).
