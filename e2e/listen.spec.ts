import type { Page } from '@playwright/test';

import { geheZu, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

async function mitBeispiel(page: Page, pfad: string) {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await geheZu(page, pfad);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(pfad);
}

test.describe('Prüfpunkte', () => {
  test('ohne Werkzeuge: Hinweis und Weg zum Erfassen', async ({ page, gesehen }) => {
    await oeffne(page, 'pruefpunkte');
    await expect(page.getByText('Noch kein Werkzeug erfasst; Prüfpunkte entstehen aus den Antworten.')).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Prüfpunkte leer');
  });

  test('gruppiert nach Dringlichkeit, das Dringende zuerst', async ({ page, gesehen }) => {
    await mitBeispiel(page, 'Prüfpunkte');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'Hoch 8 Punkte',
      'Mittel 19 Punkte',
      'Niedrig 8 Punkte',
    ]);
    await pruefeBildschirm(page, gesehen, 'Prüfpunkte mit Beispiel');
  });

  test('nimmt einen erledigten Punkt aus der Liste der offenen und zeigt ihn unter «Alle»', async ({ page }) => {
    await mitBeispiel(page, 'Prüfpunkte');
    const erster = page.getByRole('article').first();
    const titel = await erster.getByRole('heading', { level: 3 }).innerText();
    const zweiter = await page.getByRole('article').nth(1).getAttribute('id');
    await erster.getByRole('button', { name: 'Als erledigt markieren' }).click();

    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Hoch 7 Punkte');
    await expect(page.locator(`#${zweiter} button`).first()).toBeFocused();
    await page.getByRole('radio', { name: 'Alle' }).check();
    await expect(page.getByRole('article', { name: titel }).first()).toContainText('Erledigt am 11.10.2026');
  });
});

test.describe('Fristen', () => {
  test('zeigt die Zeitachse mit der Marke für heute', async ({ page, gesehen }) => {
    await oeffne(page, 'fristen');
    const eintraege = page.getByRole('main').getByRole('listitem');
    await expect(eintraege.nth(5)).toHaveText('Heute, 11.10.2026');
    await expect(eintraege.nth(4)).toContainText('02.08.2026');
    await expect(eintraege.nth(6)).toContainText('02.12.2026');
    await expect(eintraege.nth(4)).toContainText('gilt, EU-Bezug nötig');
    await expect(eintraege.nth(7)).toContainText('Ende 2026');
    await expect(eintraege.nth(7)).toContainText('geplant, Schweiz');
    await pruefeBildschirm(page, gesehen, 'Fristen');
  });

  test('sagt, wie viele eigene Werkzeuge EU-Bezug haben', async ({ page }) => {
    await mitBeispiel(page, 'Fristen');
    await expect(page.getByText('Bei dir haben 2 Werkzeuge EU-Bezug.')).toBeVisible();
  });
});
