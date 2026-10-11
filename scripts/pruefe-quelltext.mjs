#!/usr/bin/env node
/**
 * Regeln, die kein Compiler prüft:
 * 1. Höchstens 400 Zeilen je eigener Datei.
 * 2. Zod nur über src/app/zod.ts (dort wird «jitless» gesetzt, sonst CSP-Verstoss).
 * 3. Keine Stile in Komponenten und keine style-Attribute: Angular legt
 *    Komponenten-Stile als <style> an, die CSP (style-src 'self') verbietet das.
 * 4. Keine Schrift unter 16 px in den Stylesheets.
 * Exit 1 mit einer Zeile je Fund.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const WURZEL = join(import.meta.dirname, '..');
const ORDNER = ['src', 'e2e', 'scripts'];
const ENDUNGEN = /\.(ts|html|css|mjs|sh|yml)$/;
const MAX_ZEILEN = 400;

function dateien(ordner) {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return ENDUNGEN.test(name) ? [pfad] : [];
  });
}

const regeln = [
  {
    gilt: () => true,
    pruefe: (text) => {
      const zeilen = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
      return zeilen > MAX_ZEILEN ? `${zeilen} Zeilen (höchstens ${MAX_ZEILEN})` : null;
    },
  },
  {
    gilt: (pfad) => pfad.startsWith('src/') && pfad.endsWith('.ts') && pfad !== 'src/app/zod.ts',
    pruefe: (text) => (/from ['"]zod(\/[^'"]*)?['"]/.test(text) ? 'importiert zod direkt statt über src/app/zod.ts' : null),
  },
  {
    gilt: (pfad) => pfad.startsWith('src/') && pfad.endsWith('.ts'),
    pruefe: (text) =>
      /\bstyleUrls?\s*:|\bstyles\s*:\s*[[`'"]/.test(text) ? 'Komponente mit eigenen Stilen (CSP)' : null,
  },
  {
    gilt: (pfad) => pfad.startsWith('src/') && /\.(html|ts)$/.test(pfad),
    pruefe: (text) => (/\sstyle\s*=\s*["']/.test(text) ? 'style-Attribut (CSP)' : null),
  },
  {
    gilt: (pfad) => pfad.endsWith('.css'),
    pruefe: (text) => {
      const klein = [...text.matchAll(/font-size:\s*([\d.]+)(px|rem|em)/g)].filter(([, wert, einheit]) =>
        einheit === 'px' ? Number(wert) < 16 : Number(wert) < 1,
      );
      return klein.length ? `Schrift unter 16 px: ${klein.map((k) => k[0]).join(', ')}` : null;
    },
  },
];

const funde = [];
for (const datei of ORDNER.flatMap((o) => dateien(join(WURZEL, o)))) {
  const pfad = relative(WURZEL, datei);
  const text = readFileSync(datei, 'utf8');
  for (const regel of regeln) {
    const fund = regel.gilt(pfad) ? regel.pruefe(text) : null;
    if (fund) funde.push(`${pfad}: ${fund}`);
  }
}

if (funde.length) {
  console.error(funde.join('\n'));
  process.exit(1);
}
console.log('Quelltext-Regeln eingehalten.');
