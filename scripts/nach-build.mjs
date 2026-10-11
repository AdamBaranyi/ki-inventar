#!/usr/bin/env node
/**
 * Nach `ng build`: GitHub Pages kennt keine Weiterleitung auf index.html. Für
 * unbekannte Pfade liefert es 404.html aus; als Kopie von index.html startet
 * dort die App und zeigt die verlangte Seite. `.nojekyll` verhindert, dass
 * Pages Dateien mit Unterstrich weglässt.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ZIEL = 'dist/ki-inventar/browser';
const index = join(ZIEL, 'index.html');

if (!existsSync(index)) {
  console.error(`${index} fehlt. Zuerst «ng build» laufen lassen.`);
  process.exit(1);
}
copyFileSync(index, join(ZIEL, '404.html'));
writeFileSync(join(ZIEL, '.nojekyll'), '');
console.log('404.html und .nojekyll angelegt.');
