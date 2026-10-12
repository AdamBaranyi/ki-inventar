import { beginntMit, geheZu, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

/** Dunkel nach der Einstellung des Geräts: dieselben Grundregeln, auch der Kontrast (axe). */
test.use({ colorScheme: 'dark' });

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

function farben(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const stil = getComputedStyle(document.body);
    return { grund: stil.backgroundColor, text: stil.color };
  });
}

test('dunkel: jeder Bildschirm hält Kontrast und Grundregeln', async ({ page, gesehen }) => {
  await oeffne(page);
  expect(await farben(page)).toEqual({ grund: 'rgb(18, 19, 21)', text: 'rgb(238, 236, 230)' });
  await pruefeBildschirm(page, gesehen, 'Start leer, dunkel');

  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
  await pruefeBildschirm(page, gesehen, 'Übersicht, dunkel');

  // Ein Stopp (R12) zeigt das Rot: Otter nutzt in diesem Test verbotene Praktiken.
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

  for (const [ziel, titel] of [
    ['Prüfpunkte', 'Prüfpunkte'],
    ['Fristen', 'Fristen'],
    ['Daten sichern', 'Daten sichern'],
    ['Verzeichnis', 'Verzeichnis'],
  ] as const) {
    await geheZu(page, ziel);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(titel);
    await pruefeBildschirm(page, gesehen, `${titel}, dunkel`);
  }
});

test('dunkel gedruckt bleibt das Verzeichnis hell', async ({ page }) => {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await geheZu(page, 'Verzeichnis');
  await page.emulateMedia({ media: 'print' });
  expect(await farben(page)).toEqual({ grund: 'rgb(255, 255, 255)', text: 'rgb(21, 23, 27)' });
});
