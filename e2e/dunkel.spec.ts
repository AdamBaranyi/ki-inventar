import type { Page } from '@playwright/test';

import { beginntMit, geheZu, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

/**
 * Dunkel nach der Einstellung des Geräts: dieselben Grundregeln, auch der
 * Kontrast (axe). Je Bildschirm ein eigener Test, damit keiner auf langsamen
 * Rechnern an die Zeitgrenze stösst.
 */
test.use({ colorScheme: 'dark' });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

function farben(page: Page) {
  return page.evaluate(() => {
    const stil = getComputedStyle(document.body);
    return { grund: stil.backgroundColor, text: stil.color };
  });
}

async function mitBeispiel(page: Page) {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
}

test('dunkel: Start leer und mit Beispiel', async ({ page, gesehen }) => {
  await oeffne(page);
  expect(await farben(page)).toEqual({ grund: 'rgb(18, 19, 21)', text: 'rgb(238, 236, 230)' });
  await pruefeBildschirm(page, gesehen, 'Start leer, dunkel');
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
  await pruefeBildschirm(page, gesehen, 'Übersicht, dunkel');
});

test('dunkel: Formular und Werkzeug mit Stopp (Rot)', async ({ page, gesehen }) => {
  await mitBeispiel(page);
  // Otter nutzt in diesem Test verbotene Praktiken, damit das Rot erscheint.
  await page.getByRole('link', { name: beginntMit('Otter') }).click();
  await page.getByRole('region', { name: 'EU, Schulung, Verbote' }).getByRole('link', { name: 'Ändern' }).click();
  await page.getByRole('group', { name: /Emotionserkennung/ }).getByRole('radio', { name: 'Ja', exact: true }).check();
  await expect(page.getByRole('status')).toHaveText('Gespeichert');
  await pruefeBildschirm(page, gesehen, 'Formular, dunkel');
  await page.getByRole('link', { name: 'Schliessen' }).click();
  const stopp = page.getByRole('article', { name: 'Einsatz stoppen und rechtlich prüfen' });
  await stopp.getByRole('button', { name: beginntMit('Einsatz stoppen und rechtlich prüfen') }).click();
  await expect(stopp.getByRole('button', { name: 'Erledigt' })).toBeVisible();
  await pruefeBildschirm(page, gesehen, 'Werkzeug mit Stopp, dunkel');
});

for (const ziel of ['Prüfpunkte', 'Fristen', 'Daten sichern', 'Verzeichnis'] as const) {
  test(`dunkel: ${ziel}`, async ({ page, gesehen }) => {
    await mitBeispiel(page);
    await geheZu(page, ziel);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(ziel);
    await pruefeBildschirm(page, gesehen, `${ziel}, dunkel`);
  });
}

test('dunkel gedruckt bleibt das Verzeichnis hell', async ({ page }) => {
  await mitBeispiel(page);
  await geheZu(page, 'Verzeichnis');
  await page.emulateMedia({ media: 'print' });
  expect(await farben(page)).toEqual({ grund: 'rgb(255, 255, 255)', text: 'rgb(21, 23, 27)' });
});
