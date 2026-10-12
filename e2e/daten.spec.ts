import { readFile } from 'node:fs/promises';

import type { Page } from '@playwright/test';

import { geheZu, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

async function mitBeispielAufDaten(page: Page) {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await geheZu(page, 'Daten sichern');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Daten sichern');
}

async function herunterladen(page: Page, knopf: string) {
  const [datei] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: knopf }).click(),
  ]);
  return { name: datei.suggestedFilename(), inhalt: await readFile((await datei.path()) ?? '', 'utf8') };
}

async function waehleDatei(page: Page, name: string, inhalt: string) {
  await page.getByLabel('Sicherung wählen').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(inhalt),
  });
}

test.describe('Daten', () => {
  test('sichert als JSON und als Tabelle für Excel', async ({ page, gesehen }) => {
    await mitBeispielAufDaten(page);
    await pruefeBildschirm(page, gesehen, 'Daten mit Beispiel');

    const json = await herunterladen(page, 'Sicherung herunterladen (JSON)');
    expect(json.name).toBe('ki-inventar-2026-10-11.json');
    expect(JSON.parse(json.inhalt)).toMatchObject({ version: 1, firma: 'Muster Treuhand AG' });

    const csv = await herunterladen(page, 'Tabelle herunterladen (CSV)');
    expect(csv.name).toBe('ki-inventar-2026-10-11.csv');
    expect(csv.inhalt.startsWith('\uFEFFWerkzeug;Anbieter;')).toBe(true);
    expect(csv.inhalt.split('\r\n')).toHaveLength(8);
  });

  test('stellt eine Sicherung wieder her, nach Rückfrage, wenn schon Daten da sind', async ({ page }) => {
    await mitBeispielAufDaten(page);
    const json = await herunterladen(page, 'Sicherung herunterladen (JSON)');
    const kleiner = JSON.parse(json.inhalt);
    kleiner.werkzeuge = kleiner.werkzeuge.slice(0, 2);

    await waehleDatei(page, 'sicherung.json', JSON.stringify(kleiner));
    const dialog = page.getByRole('dialog', { name: 'Alles ersetzen?' });
    await expect(dialog).toContainText('In diesem Browser stehen 7 Werkzeuge. Die Sicherung enthält 2.');
    await dialog.getByRole('button', { name: 'Ersetzen' }).click();
    await expect(page.getByText('Sicherung wiederhergestellt: 2 Werkzeuge.')).toBeVisible();
  });

  test('weist eine Datei ab, die keine Sicherung ist, und lässt alles stehen', async ({ page, gesehen }) => {
    await mitBeispielAufDaten(page);
    await waehleDatei(page, 'falsch.json', '{"version":1,"werkzeuge":[{"name":""}]}');
    await expect(page.getByText(/passt nicht zum Aufbau des KI-Inventars \(Feld/)).toBeVisible();
    await waehleDatei(page, 'kaputt.json', 'kein json');
    await expect(page.getByText('Der Inhalt ist kein gültiges JSON.')).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Daten mit Fehlermeldung');
    await geheZu(page, 'Übersicht');
    await expect(page.getByText('7 Werkzeuge, 6 davon mit Personendaten')).toBeVisible();
  });

  test('löscht alles erst nach Bestätigung', async ({ page }) => {
    await mitBeispielAufDaten(page);
    await page.getByRole('button', { name: 'Alle Daten in diesem Browser löschen' }).click();
    const dialog = page.getByRole('dialog', { name: 'Wirklich alles löschen?' });
    await dialog.getByRole('button', { name: 'Alles löschen' }).click();
    await expect(page.getByText('Alle Daten in diesem Browser sind gelöscht.')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('ki-inventar'))).toBe(
      '{"version":1,"firma":"","werkzeuge":[]}',
    );
  });
});

test.describe('Rechtliches', () => {
  for (const [link, titel] of [
    ['Impressum', 'Impressum'],
    ['Datenschutz', 'Datenschutz'],
  ] as const) {
    test(`${titel}: erreichbar über den Fuss und ohne Befund`, async ({ page, gesehen }) => {
      await oeffne(page);
      await page.getByRole('contentinfo').getByRole('link', { name: link }).click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
      await expect(page).toHaveTitle(`${titel} – KI-Inventar`);
      await pruefeBildschirm(page, gesehen, titel);
    });
  }

  test('Datenschutz nennt den Speicherort und das Hosting', async ({ page }) => {
    await oeffne(page, 'datenschutz');
    await expect(page.getByRole('main')).toContainText('unter dem Schlüssel «ki-inventar»');
    await expect(page.getByRole('main')).toContainText('GitHub Pages (GitHub, Inc., USA)');
  });
});
