#!/usr/bin/env node
/**
 * Sabotage-Runde: baut je Eintrag aus scripts/sabotagen.mjs einen Fehler ein,
 * führt den zugehörigen Testbefehl aus und verlangt, dass er rot wird. Danach
 * kommt die Datei aus einer Kopie zurück, geprüft Byte für Byte.
 *
 * Aufruf: node scripts/sabotage.mjs [gruppe]   (ohne Gruppe: alle)
 * Exit 1, sobald eine Sabotage grün bleibt oder ihr Suchtext nicht genau
 * einmal vorkommt (sonst veraltet die Liste still).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SABOTAGEN } from './sabotagen.mjs';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');

function vorkommen(text, suche) {
  return text.split(suche).length - 1;
}

// Ein Fehler, den schon der Übersetzer fängt, sagt nichts über die Tests: Die
// Sabotage muss übersetzen, sonst ist sie falsch gewählt.
const BAUFEHLER = /\[ERROR\]|bundle generation failed|error TS\d+/i;

function laufe(befehl) {
  const ergebnis = spawnSync(befehl, { cwd: WURZEL, shell: true, encoding: 'utf8' });
  const ausgabe = `${ergebnis.stdout}${ergebnis.stderr}`;
  if (ergebnis.status === 0) return 'blieb grün';
  return BAUFEHLER.test(ausgabe) ? 'baut nicht (Sabotage falsch gewählt)' : null;
}

function sabotiere(eintrag) {
  const pfad = join(WURZEL, eintrag.datei);
  const original = readFileSync(pfad, 'utf8');
  const anzahl = vorkommen(original, eintrag.suche);
  if (anzahl !== 1) return `Suchtext ${anzahl}-mal statt einmal gefunden`;
  writeFileSync(pfad, original.replace(eintrag.suche, eintrag.ersatz));
  try {
    return laufe(eintrag.befehl);
  } finally {
    writeFileSync(pfad, original);
    if (readFileSync(pfad, 'utf8') !== original) throw new Error(`${eintrag.datei} nicht zurückgesetzt`);
  }
}

const gruppe = process.argv[2];
const liste = SABOTAGEN.filter((s) => !gruppe || s.gruppe === gruppe);
let fehler = 0;
for (const eintrag of liste) {
  const befund = sabotiere(eintrag);
  console.log(`${befund ? 'FEHLER' : 'rot   '}  ${eintrag.name}${befund ? ` – ${befund}` : ''}`);
  if (befund) fehler += 1;
}
console.log(`\n${liste.length - fehler} von ${liste.length} Sabotagen wurden rot.`);
process.exit(fehler === 0 && liste.length > 0 ? 0 : 1);
