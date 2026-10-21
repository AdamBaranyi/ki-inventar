import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * Schritte des täglichen Sicherheitslaufs im Ablauf statt im Text: Der run-Block
 * kommt aus .github/workflows/sicherheit-taeglich.yml und läuft so, wie GitHub ihn
 * ohne «shell:» ausführt (bash -e, ohne pipefail). bun ist die Attrappe aus
 * scripts/attrappen/, GITHUB_OUTPUT und GITHUB_STEP_SUMMARY sind Dateien.
 */
const SKRIPTE = dirname(fileURLToPath(import.meta.url));
const ATTRAPPEN = join(SKRIPTE, 'attrappen');
const WORKFLOW = join(SKRIPTE, '..', '.github', 'workflows', 'sicherheit-taeglich.yml');

const ESC = '\u001b';
/** Ein Befund, gefärbt wie von bun audit 1.3.14. */
const BEFUND_FARBIG = `${ESC}[1mproxy-addr${ESC}[0m  >=1.1.0 <2.0.8
  @angular/build › vite
  ${ESC}[31mcritical${ESC}[0m: proxy-addr vulnerable to IP spoofing - https://github.com/advisories/GHSA-jqcg-44mw-7w3h
`;

/** @type {string} */
let dir;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'tageslauf-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

/**
 * Der run-Block eines Schritts, ohne den gemeinsamen Einzug.
 * @param {string} name
 */
function runBlock(name) {
  const zeilen = readFileSync(WORKFLOW, 'utf8').split('\n');
  const tiefe = (/** @type {string} */ z) => z.length - z.trimStart().length;
  const start = zeilen.findIndex((z) => z.trim() === `- name: ${name}`);
  const run = zeilen.findIndex((z, i) => i > start && /^\s+run: \|$/.test(z));
  if (start < 0 || run < 0 || zeilen.slice(start + 1, run).some((z) => /^\s+- /.test(z))) {
    throw new Error(`Schritt «${name}» mit «run: |» fehlt im Workflow`);
  }
  const block = [];
  for (const zeile of zeilen.slice(run + 1)) {
    if (zeile.trim() !== '' && tiefe(zeile) <= tiefe(zeilen[run] ?? '')) break;
    block.push(zeile);
  }
  const einzug = Math.min(...block.filter((z) => z.trim() !== '').map(tiefe));
  return block.map((z) => z.slice(einzug)).join('\n');
}

/**
 * Führt einen Schritt aus; der Arbeitsordner trägt eine Kopie von scripts/audit.sh.
 * @param {string} name
 */
function schritt(name) {
  mkdirSync(join(dir, 'scripts'));
  copyFileSync(join(SKRIPTE, 'audit.sh'), join(dir, 'scripts', 'audit.sh'));
  writeFileSync(join(dir, 'schritt.sh'), runBlock(name));
  return spawnSync('bash', ['-e', join(dir, 'schritt.sh')], {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${ATTRAPPEN}:${process.env.PATH}`,
      ATTRAPPE_DIR: dir,
      GITHUB_OUTPUT: join(dir, 'github-output'),
      GITHUB_STEP_SUMMARY: join(dir, 'zusammenfassung.md'),
    },
  });
}

const lies = (/** @type {string} */ datei) => readFileSync(join(dir, datei), 'utf8');

describe('sicherheit-taeglich.yml', () => {
  it('«Befunde sammeln» hält den Exit-Code und schreibt Bericht und Zusammenfassung ohne Farbcodes', () => {
    writeFileSync(join(dir, 'ausgabe'), BEFUND_FARBIG);
    writeFileSync(join(dir, 'exit'), '1');
    const ergebnis = schritt('Befunde sammeln, ab moderat');

    expect(ergebnis.status, ergebnis.stderr).toBe(0);
    expect(lies('github-output')).toContain('status=1');
    expect(lies('audit.txt')).toContain('critical: proxy-addr vulnerable to IP spoofing');
    expect(lies('audit.txt')).not.toContain(ESC);
    expect(lies('zusammenfassung.md')).toContain('bun audit v1.3.14 (0d9b296a)');
    expect(lies('zusammenfassung.md')).not.toContain(ESC);
  });

  it('«Alle Befunde zur Ansicht» schreibt ohne Farbcodes in die Zusammenfassung', () => {
    writeFileSync(join(dir, 'ausgabe'), BEFUND_FARBIG);
    writeFileSync(join(dir, 'exit'), '1');
    const ergebnis = schritt('Alle Befunde zur Ansicht');

    expect(ergebnis.status, ergebnis.stderr).toBe(0);
    expect(lies('zusammenfassung.md')).toContain('GHSA-jqcg-44mw-7w3h');
    expect(lies('zusammenfassung.md')).not.toContain(ESC);
  });
});
