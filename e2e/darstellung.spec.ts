import type { Page } from '@playwright/test';

import { beginntMit, geheZu, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

/**
 * Darstellung hell (Vorgabe), dunkel oder wie das Gerät. Das Gerät ist hier
 * dunkel eingestellt, damit «hell» und «System» etwas beweisen.
 */
test.use({ colorScheme: 'dark' });

const HELL = { grund: 'rgb(244, 242, 237)', text: 'rgb(21, 23, 27)' };
const DUNKEL = { grund: 'rgb(18, 19, 21)', text: 'rgb(238, 236, 230)' };

function farben(page: Page) {
  return page.evaluate(() => {
    const stil = getComputedStyle(document.body);
    return { grund: stil.backgroundColor, text: stil.color };
  });
}

/** Wählt eine Darstellung; am Handy liegt der Umschalter unter «Mehr». */
async function waehle(page: Page, darstellung: 'Hell' | 'Dunkel' | 'System') {
  const gruppe = page.getByRole('group', { name: 'Darstellung' });
  if (!(await gruppe.isVisible())) await geheZu(page, 'Mehr');
  await page.getByRole('group', { name: 'Darstellung' }).getByRole('radio', { name: darstellung }).check();
}

function vorgewaehlt(page: Page, darstellung: 'dunkel' | 'system') {
  return page.addInitScript((wert) => localStorage.setItem('ki-inventar-darstellung', wert), darstellung);
}

test('hell ist die Vorgabe, auch auf einem dunkel eingestellten Gerät', async ({ page, gesehen }) => {
  await oeffne(page);
  expect(await farben(page)).toEqual(HELL);
  await pruefeBildschirm(page, gesehen, 'Start hell auf dunklem Gerät');
});

test('«Dunkel» gilt sofort und bleibt nach dem Neuladen', async ({ page, gesehen }) => {
  await oeffne(page);
  await waehle(page, 'Dunkel');
  await expect.poll(() => farben(page)).toEqual(DUNKEL);
  await pruefeBildschirm(page, gesehen, 'Umschalter dunkel');
  await page.reload({ waitUntil: 'commit' });
  await page.getByRole('heading', { level: 1 }).waitFor();
  await expect.poll(() => farben(page)).toEqual(DUNKEL);
});

test('«System» folgt dem Gerät', async ({ page }) => {
  await oeffne(page);
  await waehle(page, 'System');
  await expect.poll(() => farben(page)).toEqual(DUNKEL);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => farben(page)).toEqual(HELL);
});

test('dunkel ohne Aufblitzen: Die Wahl gilt, bevor die App startet', async ({ page }) => {
  await vorgewaehlt(page, 'dunkel');
  // Die App wird zurückgehalten, bis die Farben gemessen sind: Was jetzt gilt,
  // hat allein public/darstellung.js gesetzt.
  let freigeben = () => {};
  const zurueckgehalten = new Promise<void>((weiter) => (freigeben = weiter));
  await page.route(/main-[A-Za-z0-9_-]+\.js$/, async (route) => {
    await zurueckgehalten;
    await route.continue();
  });
  try {
    await page.goto('', { waitUntil: 'commit' });
    await page.waitForFunction(() => getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)');
    expect(await page.locator('h1').count()).toBe(0);
    expect(await farben(page)).toEqual(DUNKEL);
  } finally {
    freigeben();
  }
});

test('dunkel: Übersicht und Werkzeug halten den Kontrast', async ({ page, gesehen }) => {
  await vorgewaehlt(page, 'dunkel');
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
  await pruefeBildschirm(page, gesehen, 'Übersicht dunkel');
  await page.getByRole('link', { name: beginntMit('ChatGPT') }).click();
  const avv = page.getByRole('article', { name: 'Vertrag zur Auftragsbearbeitung abschliessen' });
  await avv.getByRole('button', { name: beginntMit('Vertrag zur Auftragsbearbeitung abschliessen') }).click();
  await expect(avv.getByRole('button', { name: 'Erledigt' })).toBeVisible();
  await pruefeBildschirm(page, gesehen, 'Werkzeug dunkel');
});

test('dunkel: Formular und Daten halten den Kontrast', async ({ page, gesehen }) => {
  await vorgewaehlt(page, 'dunkel');
  await oeffne(page, 'werkzeug/neu');
  await page.getByLabel('Name des Werkzeugs').fill('ChatGPT');
  await expect(page.getByRole('heading', { name: 'Vorlage verwenden' })).toBeVisible();
  await pruefeBildschirm(page, gesehen, 'Formular dunkel');
  await page.goto('daten', { waitUntil: 'commit' });
  await page.getByRole('heading', { level: 1 }).waitFor();
  await pruefeBildschirm(page, gesehen, 'Daten dunkel');
});

test('gedruckt bleibt alles hell, auch wenn dunkel gewählt ist', async ({ page }) => {
  await vorgewaehlt(page, 'dunkel');
  await oeffne(page, 'verzeichnis');
  await page.emulateMedia({ media: 'print' });
  expect(await farben(page)).toEqual({ grund: 'rgb(255, 255, 255)', text: HELL.text });
});
