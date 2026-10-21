/**
 * Eingebaute Fehler, die ein Test finden muss. Je Eintrag: Datei, genau einmal
 * vorkommender Suchtext, Ersatz und der Befehl, der danach rot sein muss.
 */
const UNIT = 'bunx ng test --watch=false';
const R = 'src/app/fach/regeln.ts';

/** `(w) => a` wird `(w) => !(a)`, ein Funktionsname `f` wird `(w) => !f(w)`. */
function umgekehrt(bedingung) {
  const pfeil = bedingung.match(/^(\(w?\)) => (.*)$/s);
  return pfeil ? `${pfeil[1]} => !(${pfeil[2]})` : `(w) => !${bedingung}(w)`;
}

/** Kehrt die Bedingung einer Regel um. */
function umkehren(regel, bedingung) {
  return {
    gruppe: 'regeln',
    name: `${regel}: Bedingung umgekehrt`,
    datei: R,
    suche: `gilt: ${bedingung},`,
    ersatz: `gilt: ${umgekehrt(bedingung)},`,
    befehl: UNIT,
  };
}

function ersetze(gruppe, name, datei, suche, ersatz, befehl = UNIT) {
  return { gruppe, name, datei, suche, ersatz, befehl };
}

const BAU = 'bun run build > /dev/null 2>&1';
const E2E = (datei, projekt = 'desktop') => `${BAU} && ./node_modules/.bin/playwright test ${datei} --project=${projekt}`;
const PRUEFE = 'node scripts/pruefe-quelltext.mjs';
const ABBILD = 'bash scripts/abbild-pruefen.sh';
const SKRIPTE = 'bun run test:skripte';
const MELDUNG = 'scripts/sicherheits-meldung.sh';
const FORMULAR = 'src/app/seiten/werkzeug-formular/werkzeug-formular.ts';
const AUSWERTUNG = 'src/app/fach/auswertung.ts';

export const SABOTAGEN = [
  umkehren('R1', 'mitPersonendaten'),
  umkehren('R2', "(w) => mitPersonendaten(w) && w.avv !== 'ja'"),
  umkehren('R3', '(w) => mitPersonendaten(w) && ausserhalbChEu(w)'),
  umkehren('R4', "(w) => w.personendaten === 'besonders'"),
  umkehren('R5', "(w) => w.training !== 'ja' && vertraulich(w)"),
  umkehren('R6', "(w) => w.zugang === 'privat' && vertraulich(w)"),
  umkehren('R7', '(w) => w.entscheidungen === true'),
  umkehren(
    'R8',
    "(w) => mitPersonendaten(w) && (HEIKEL.has(w.kategorie) || w.personendaten === 'besonders')",
  ),
  umkehren('R9', '(w) => w.ausgabenDritte === true'),
  umkehren('R10', '(w) => w.geschult !== true'),
  umkehren('R11', '(w) => w.euBezug === true && HOCHRISIKO.has(w.kategorie)'),
  umkehren('R12', '(w) => w.verboten === true'),
  umkehren('R13', "(w) => w.verantwortlich.trim() === ''"),
  umkehren('R14', '() => true'),
  ersetze('regeln', 'R2: «und» zu «oder»', R, "mitPersonendaten(w) && w.avv !== 'ja'", "mitPersonendaten(w) || w.avv !== 'ja'"),
  ersetze('regeln', 'Offene Antwort zählt nicht mehr vorsichtig', R, "w.personendaten !== 'nein';", "w.personendaten === 'ja' || w.personendaten === 'besonders';"),
  ersetze('regeln', 'R3: EU zählt als Ausland', R, "w.standort !== 'ch' && w.standort !== 'eu'", "w.standort !== 'ch'"),
  ersetze('regeln', 'R8: Kundenkontakt fehlt', R, "'entscheidungen', 'kundenkontakt'", "'entscheidungen'"),
  ersetze('regeln', 'R11: Bildung fehlt', R, "'kredit', 'bildung'", "'kredit'"),
  ersetze('regeln', 'R14: läuft nie ab', R, 'gueltigTage: 365,', 'gueltigTage: 366,'),
  ersetze('regeln', 'R3: USA-Text für alle', R, "w.standort === 'usa' ? T.R3.grundUsa", 'true ? T.R3.grundUsa'),
  ersetze('regeln', 'R12 nicht mehr am dringendsten', R, "dringlichkeit: 'hoechste'", "dringlichkeit: 'hoch'"),
  ersetze('regeln', 'Gespeicherter Status ignoriert', R, 'return { status: pruefung.status,', "return { status: 'offen' as const,"),
  ersetze('regeln', 'Fortschritt: «trifft nicht zu» zählt als offen', AUSWERTUNG, 'erledigt: punkte.length - offene.length,', "erledigt: punkte.filter((p) => p.status === 'erledigt').length,"),
  ersetze('regeln', '«Als Nächstes» nicht nach Dringlichkeit', AUSWERTUNG, "return nachDringlichkeit(punkte.filter((p) => p.status === 'offen')).slice(0, anzahl);", "return punkte.filter((p) => p.status === 'offen').slice(0, anzahl);"),
  ersetze('regeln', 'Älteres «unbekannt» zählt als beantwortet', AUSWERTUNG, "const UNKLAR: readonly unknown[] = [null, 'unbekannt', 'unklar'];", 'const UNKLAR: readonly unknown[] = [null];'),

  // Formular: Schritte und «Weiss ich nicht»
  ersetze('formular', '«Weiss ich nicht» fehlt beim Zugang', 'src/app/seiten/werkzeug-formular/formular-optionen.ts', 'zugang: [...optionen(ZUGAENGE, OPTIONEN.zugang), WEISS_NICHT],', 'zugang: optionen(ZUGAENGE, OPTIONEN.zugang),'),
  ersetze('formular', 'Schritt über 10 hinaus', 'src/app/seiten/werkzeug-formular/schritte.ts', 'return Math.min(Math.max(zahl, 1), SCHRITTE.length);', 'return Math.max(zahl, 1);'),
  ersetze('formular', 'Älteres «unbekannt» nicht als «Weiss ich nicht»', 'src/app/seiten/werkzeug-formular/formular-modell.ts', "standort: antworten.standort === 'unbekannt' ? null : antworten.standort,", 'standort: antworten.standort,'),
  ersetze('formular', 'Vorlage überschreibt Antworten', 'src/app/fach/vorlagen.ts', 'if (zugang !== undefined && neu.zugang === null) neu.zugang = zugang;', 'if (zugang !== undefined) neu.zugang = zugang;'),
  ersetze('formular', 'Vorlage setzt den Standort', 'src/app/fach/vorlagen.ts', '  return neu;', "  return { ...neu, standort: 'usa' };"),
  ersetze('formular', 'Vorlage taucht im Formular nicht auf', 'src/app/seiten/werkzeug-formular/werkzeug-formular.html', '@if (vorlagen().length) {', '@if (vorlagen().length > 99) {', E2E('e2e/werkzeug.spec.ts')),
  ersetze('formular', 'Fehler im Schritt bekommt keinen Fokus', FORMULAR, "      document.querySelector<HTMLElement>('[aria-invalid=\"true\"]')?.focus();\n", '', E2E('e2e/werkzeug.spec.ts')),
  ersetze('formular', 'Fehlermeldung schon beim Verlassen des Feldes', FORMULAR, 'if (steuerung.valid || !this.versucht()) return null;', 'if (steuerung.valid || !(steuerung.touched || this.versucht())) return null;', E2E('e2e/werkzeug.spec.ts')),
  ersetze('formular', '«Weiter» prüft den Schritt nicht', FORMULAR, 'const fehler = fehlerImSchritt(this.form, nummer);', 'const fehler: ReturnType<typeof fehlerImSchritt> = [];', E2E('e2e/werkzeug.spec.ts')),

  // Daten: Speichern, Laden, Tabelle
  ersetze('daten', 'Ungültiges wird trotzdem gespeichert', 'src/app/daten/inventar-dienst.ts', "if (this.ladeFehler() || !inventarSchema.safeParse(neu).success) return false;", 'if (this.ladeFehler()) return false;'),
  ersetze('daten', 'Unlesbare Daten werden überschrieben', 'src/app/daten/inventar-dienst.ts', 'if (this.ladeFehler() || !inventarSchema', 'if (!inventarSchema'),
  ersetze('daten', 'Unlesbares nicht beiseitegelegt', 'src/app/daten/inventar-dienst.ts', '      legeUnlesbaresBeiseite(this.speicher);\n', ''),
  ersetze('daten', 'CSV: Formel mit «=» nicht entschärft', 'src/app/fach/csv.ts', '/^[=+\\-@\\t\\r]/', '/^[+\\-@\\t\\r]/'),
  ersetze('daten', 'CSV: ohne BOM', 'src/app/fach/csv.ts', 'return `${BOM}${', 'return `${'),
  ersetze('daten', 'Bearbeitungsverzeichnis mit Werkzeugen ohne Personendaten', 'src/app/fach/bearbeitungsverzeichnis.ts', ".filter((w) => w.personendaten !== 'nein')", '.filter(() => true)'),
  ersetze('daten', 'Bearbeitungsverzeichnis: EU ohne angemessenen Datenschutz', 'src/app/fach/bearbeitungsverzeichnis.ts', "B.ausland[w.standort ?? 'unbekannt']", "B.ausland[w.standort === 'eu' ? 'andere' : (w.standort ?? 'unbekannt')]"),
  ersetze('daten', 'Kalender: Termin einen Tag zu früh', 'src/app/fach/kalender.ts', 'plusTage(pruefung.datum, JAEHRLICH)', 'plusTage(pruefung.datum, JAEHRLICH - 1)'),
  ersetze('daten', 'Kalender: Komma nicht maskiert', 'src/app/fach/kalender.ts', '.replace(/[\\\\;,]/g', '.replace(/[\\\\;]/g'),
  ersetze('daten', 'Kalender: lange Zeilen nicht gefaltet', 'src/app/fach/kalender.ts', '(teile.length === 0 ? 75 : 74)', '(teile.length === 0 ? 7500 : 7400)'),
  ersetze('daten', 'Kalender: Knopf fehlt auf der Seite', 'src/app/seiten/daten/daten-seite.html', '@if (termine().termine.length > 0) {', '@if (termine().termine.length > 99) {', E2E('e2e/daten.spec.ts')),

  // Quelltext-Regeln
  ersetze('quelltext', 'Datei über 400 Zeilen', 'src/app/fach/datum.ts', 'const TAG_MS = 86_400_000;', `const TAG_MS = 86_400_000;${'\n'.repeat(400)}`, PRUEFE),
  ersetze('quelltext', 'Zod direkt importiert', 'src/app/fach/inventar.ts', "import * as z from '../zod';", "import * as z from 'zod';", PRUEFE),
  ersetze('quelltext', 'Komponente mit eigenen Stilen', 'src/app/seiten/nicht-gefunden/nicht-gefunden.ts', "selector: 'ki-nicht-gefunden',", "selector: 'ki-nicht-gefunden',\n  styles: ['h1 { color: red }'],", PRUEFE),
  ersetze('quelltext', 'Schrift 14 px im Stylesheet', 'src/styles/bedienung.css', '  font-size: var(--text-s);\n  font-weight: 650;\n  line-height: 1.5;', '  font-size: 14px;\n  font-weight: 650;\n  line-height: 1.5;', PRUEFE),

  // Browser: jede Grundregel muss auf dem echten Build brechen
  ersetze('browser', 'Zod ohne jitless (CSP-Verstoss)', 'src/app/zod.ts', 'config({ jitless: true });', 'config({});', E2E('e2e/start.spec.ts')),
  ersetze('browser', 'Bild von fremdem Ursprung', 'src/index.html', '<ki-root></ki-root>', '<ki-root></ki-root><img src="https://example.org/punkt.gif" alt="">', E2E('e2e/start.spec.ts')),
  ersetze('browser', 'Schrift unter 16 px, am Quelltext vorbei', 'src/styles/bedienung.css', '  font-size: var(--text-s);\n  font-weight: 650;\n  line-height: 1.5;', '  font-size: calc(var(--text-s) - 2px);\n  font-weight: 650;\n  line-height: 1.5;', E2E('e2e/start.spec.ts')),
  ersetze('browser', 'Tippflächen 40 px', 'src/styles/token.css', '--tippflaeche: 48px;', '--tippflaeche: 40px;', E2E('e2e/start.spec.ts')),
  ersetze('browser', 'Tabelle schiebt die Seite in die Breite', 'src/app/seiten/verzeichnis/verzeichnis.css', '  margin-top: var(--a-5);\n  overflow-x: auto;', '  margin-top: var(--a-5);', E2E('e2e/kette.spec.ts', 'handy-390')),
  ersetze('browser', 'Feld ohne Beschriftung (axe)', 'src/app/seiten/werkzeug-formular/werkzeug-formular.html', 'for="f-anbieter"', 'for="f-anbieterx"', E2E('e2e/werkzeug.spec.ts')),
  ersetze('browser', 'Kein Autosave', FORMULAR, 'subscribe(() => this.speichere());', 'subscribe(() => this.werte.set(this.form.getRawValue()));', E2E('e2e/werkzeug.spec.ts')),
  ersetze('browser', 'Druck zeigt die Navigation', 'src/styles/druck.css', '  .seitenleiste,\n', '', E2E('e2e/kette.spec.ts')),
  ersetze('browser', 'Blatt dehnt sich mit der Tabelle', 'src/app/seiten/verzeichnis/verzeichnis.css', '.blatt {\n  min-width: 0;\n', '.blatt {\n', E2E('e2e/kette.spec.ts', 'handy-390')),
  ersetze('browser', 'Tab-Leiste bleibt im Ablauf', 'src/app/rahmen.css', '.app--ablauf .kopf,\n.app--ablauf .navi {\n  display: none;\n}', '.app--ablauf .kopf {\n  display: none;\n}', E2E('e2e/werkzeug.spec.ts', 'handy-390')),
  ersetze('browser', 'Punkt aus der Adresse bleibt zu', 'src/app/seiten/werkzeug-karte/werkzeug-karte.html', '[aufgeklappt]="fragment() === kennung(punkt)"', '[aufgeklappt]="false"', E2E('e2e/start.spec.ts')),
  ersetze('browser', 'Seitenleiste ohne Zahl offener Punkte im Namen', 'src/app/app.html', '[attr.aria-label]="eintrag.pfad', '[attr.data-name]="eintrag.pfad', E2E('e2e/start.spec.ts')),
  ersetze('browser', 'Ohne 404.html für tiefe Links', 'scripts/nach-build.mjs', "copyFileSync(index, join(ZIEL, '404.html'));", '', E2E('e2e/werkzeug.spec.ts')),
  // Täglicher Alarm: nur das eigene Issue zählt, kein Lockvogel
  ersetze('sicherheit', 'Meldung ohne Autor-Prüfung', MELDUNG, ' and .author.login == \\"app/github-actions\\"', '', SKRIPTE),
  ersetze('sicherheit', 'Meldung ohne Label-Prüfung', MELDUNG, ' and any(.labels[]; .name == \\"$label\\")', '', SKRIPTE),
  ersetze('sicherheit', 'Meldung folgt jedem Issue gleichen Titels', MELDUNG, 'select(.title == \\"$titel\\" and .author.login == \\"app/github-actions\\" and any(.labels[]; .name == \\"$label\\"))', 'select(.title == \\"$titel\\")', SKRIPTE),
  ersetze('abbild', 'Abbild: CSP ohne frame-ancestors', 'infra/Caddyfile', "; frame-ancestors 'none'\"", '"', ABBILD),
  ersetze('abbild', 'Abbild: tiefe Links ohne index.html', 'infra/Caddyfile', '\ttry_files {path} /index.html\n', '', ABBILD),
  ersetze('abbild', 'Abbild: index.html im Cache', 'infra/Caddyfile', 'header @ohneHash Cache-Control "no-cache"', 'header @ohneHash Cache-Control "max-age=3600"', ABBILD),
  ersetze('regeln', 'Darstellung: Vorgabe System statt hell', 'src/app/daten/darstellung.ts', "return wert === 'dunkel' || wert === 'system' ? wert : 'hell';", "return wert === 'dunkel' || wert === 'hell' ? wert : 'system';"),
  ersetze('browser', 'Darstellung wird nicht gemerkt', 'src/app/daten/darstellung.ts', '      this.speicher.setItem(SCHLUESSEL_DARSTELLUNG, darstellung);\n', '', E2E('e2e/darstellung.spec.ts')),
  ersetze('browser', 'Darstellung blitzt hell auf (frühes Skript fehlt)', 'src/index.html', '  <script src="darstellung.js"></script>\n', '', E2E('e2e/darstellung.spec.ts')),
  ersetze('browser', 'Druck dunkel', 'src/styles/druck.css', '  :root,\n  :root[data-darstellung] {\n    color-scheme: light;\n  }\n', '', E2E('e2e/darstellung.spec.ts')),
  // Rahmen: schmale Seiten mittig, Rechtliches in der Seitenleiste, Menü
  ersetze('browser', 'Schmale Seiten kleben links', 'src/app/rahmen.css', '.inhalt > * > :is(section, article) {\n  margin-inline: auto;', '.inhalt > * > :is(section, article) {\n  margin-inline: 0;', E2E('e2e/rahmen.spec.ts')),
  ersetze('browser', 'Rechtliches fehlt in der Seitenleiste', 'src/app/app.html', '    <ki-fuss kurz />\n', '', E2E('e2e/rahmen.spec.ts')),
  ersetze('browser', 'Gewählter Menüpunkt wieder blass', 'src/app/rahmen.css', '    background: var(--tinte);\n    color: var(--auf-tinte);\n    font-weight: 620;', '    background: var(--grund);\n    color: var(--tinte);\n    font-weight: 620;', E2E('e2e/rahmen.spec.ts')),
  ersetze('browser', 'Maus nimmt dem gewählten Punkt die Tinte', 'src/app/rahmen.css', '.navi__link:not(.navi__link--aktiv, .navi__link--bereich):hover', '.navi__link:hover', E2E('e2e/rahmen.spec.ts')),
  ersetze('regeln', 'Werkzeug ohne Bereich «Übersicht»', 'src/app/navi-zustand.ts', "  if (ziel === '/' && pfad.startsWith('/werkzeug/')) return 'true';\n", ''),
  ersetze('browser', '«Mehr» zeigt das Rechtliche doppelt', 'src/app/app.html', '[links]="!aufMehr()"', '[links]="true"', E2E('e2e/rahmen.spec.ts', 'handy-390')),
  ersetze('browser', 'Fokus bleibt nicht beim Punkt', 'src/app/teile/pruefpunkt/pruefpunkt.ts', '      ziel?.focus({ preventScroll', '      void ({ preventScroll', E2E('e2e/werkzeug.spec.ts')),
];
