#!/usr/bin/env node
/**
 * Liefert den Build so aus wie GitHub Pages: unter /ki-inventar/, unbekannte
 * Pfade mit Status 404 und dem Inhalt von 404.html. So prüfen die Browser-Tests
 * genau das, was live läuft. Aufruf: node scripts/server.mjs [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const WURZEL = normalize(join(import.meta.dirname, '..', 'dist', 'ki-inventar', 'browser'));
const PRAEFIX = '/ki-inventar/';
const PORT = Number(process.argv[2] ?? 4300);

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

/** Pfad innerhalb des Builds oder null, wenn er hinausführt. */
function datei(pfad) {
  const ziel = normalize(join(WURZEL, decodeURIComponent(pfad)));
  return ziel === WURZEL || ziel.startsWith(WURZEL + sep) ? ziel : null;
}

async function finde(pfad) {
  const ziel = datei(pfad.endsWith('/') ? `${pfad}index.html` : pfad);
  if (!ziel) return null;
  try {
    return (await stat(ziel)).isFile() ? ziel : null;
  } catch {
    return null;
  }
}

async function antworte(anfrage, antwort) {
  const { pathname } = new URL(anfrage.url ?? '/', 'http://localhost');
  if (!pathname.startsWith(PRAEFIX)) {
    antwort.writeHead(pathname === '/ki-inventar' ? 301 : 404, { Location: PRAEFIX }).end();
    return;
  }
  const gefunden = await finde(pathname.slice(PRAEFIX.length - 1));
  const ziel = gefunden ?? join(WURZEL, '404.html');
  const inhalt = await readFile(ziel);
  antwort.writeHead(gefunden ? 200 : 404, {
    'Content-Type': TYPEN[extname(ziel)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  antwort.end(inhalt);
}

createServer((anfrage, antwort) => {
  antworte(anfrage, antwort).catch((fehler) => {
    antwort.writeHead(500).end(String(fehler));
  });
}).listen(PORT, () => console.log(`Prüfserver auf http://localhost:${PORT}${PRAEFIX}`));
