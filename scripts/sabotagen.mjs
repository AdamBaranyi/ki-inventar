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
];
