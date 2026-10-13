import type { Page } from '@playwright/test';

import { beginntMit, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

const TINTE = 'rgb(21, 23, 27)';
const GRUND = 'rgb(244, 242, 237)';

/** Freier Raum links und rechts der Seitenspalte, innerhalb des Inhaltsbereichs. */
function raender(page: Page) {
  return page.evaluate(() => {
    const inhalt = document.querySelector('main');
    const spalte = inhalt?.querySelector('h1')?.closest('main > * > *');
    if (!inhalt || !spalte) return null;
    const stil = getComputedStyle(inhalt);
    const aussen = inhalt.getBoundingClientRect();
    const innen = spalte.getBoundingClientRect();
    return {
      links: Math.round(innen.left - aussen.left - parseFloat(stil.paddingLeft)),
      rechts: Math.round(aussen.right - parseFloat(stil.paddingRight) - innen.right),
    };
  });
}

test.describe('Rahmen am Desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'Seitenleiste und breiter Inhalt gibt es nur am Desktop.');

  test('schmale Seiten stehen mittig neben der Seitenleiste', async ({ page }) => {
    for (const pfad of ['', 'pruefpunkte', 'fristen', 'daten', 'impressum', 'werkzeug/neu', 'gibt-es-nicht']) {
      await oeffne(page, pfad);
      const rand = await raender(page);
      expect(rand?.links, `/${pfad}: Platz links`).toBeGreaterThan(100);
      expect(Math.abs((rand?.links ?? 0) - (rand?.rechts ?? 1000)), `/${pfad}: links wie rechts`).toBeLessThanOrEqual(1);
    }
  });

  test('ein Werkzeug steht mittig, die Übersicht nutzt die ganze Breite', async ({ page }) => {
    await oeffne(page);
    await page.getByRole('button', { name: 'Beispiel laden' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
    expect(await raender(page)).toEqual({ links: 0, rechts: 0 });

    await page.getByRole('region', { name: 'Werkzeuge' }).getByRole('link', { name: beginntMit('ChatGPT') }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('ChatGPT');
    const rand = await raender(page);
    expect(rand?.links).toBeGreaterThan(100);
    expect(Math.abs((rand?.links ?? 0) - (rand?.rechts ?? 1000))).toBeLessThanOrEqual(1);
  });

  test('Rechtliches steht unten in der Seitenleiste, unter dem Inhalt kein zweiter Fuss', async ({
    page,
    gesehen,
  }) => {
    await oeffne(page);
    const fuss = page.getByRole('contentinfo');
    await expect(fuss).toHaveCount(1);
    await expect(fuss).toContainText('Keine Rechtsberatung.');
    await expect(fuss).toContainText('Rechtsstand geprüft am');
    await expect(fuss.getByRole('link')).toHaveText(['Impressum', 'Datenschutz', 'Quellcode']);
    const box = await fuss.boundingBox();
    const fenster = page.viewportSize();
    expect(box && box.x + box.width, 'in der Seitenleiste').toBeLessThanOrEqual(256);
    expect(box && fenster && box.y + box.height, 'ganz sichtbar, ohne Scrollen').toBeLessThanOrEqual(
      fenster?.height ?? 0,
    );
    await pruefeBildschirm(page, gesehen, 'Seitenleiste mit Rechtlichem');
  });

  test('der gewählte Menüpunkt steht in Tinte, auch unter der Maus', async ({ page }) => {
    await oeffne(page, 'fristen');
    const navi = page.getByRole('navigation', { name: 'Hauptnavigation' });
    const fristen = navi.getByRole('link', { name: 'Fristen' });
    await expect(fristen).toHaveAttribute('aria-current', 'page');
    await expect(fristen).toHaveCSS('background-color', TINTE);
    await fristen.hover();
    await expect(fristen).toHaveCSS('background-color', TINTE);

    const andere = navi.getByRole('link', { name: 'Verzeichnis' });
    await andere.hover();
    await expect(andere).toHaveCSS('background-color', GRUND);
  });
});

test.describe('Rahmen am Handy', () => {
  test.skip(({ isMobile }) => !isMobile, 'Tab-Leiste und «Mehr» gibt es nur am Handy.');

  test('Rechtliches steht ausführlich unter dem Inhalt', async ({ page }) => {
    await oeffne(page);
    const fuss = page.getByRole('contentinfo');
    await expect(fuss).toHaveCount(1);
    await expect(fuss).toContainText('verbindlich sind der Gesetzestext und eine Fachberatung');
    await expect(fuss.getByRole('link')).toHaveText(['Impressum', 'Datenschutz', 'Quellcode']);
    const unten = await fuss.boundingBox();
    const inhalt = await page.getByRole('main').boundingBox();
    expect(unten && inhalt && unten.y >= inhalt.y + inhalt.height).toBe(true);
  });

  test('«Mehr» zeigt zwei Gruppen mit bündigen Texten und das Rechtliche nur einmal', async ({
    page,
    gesehen,
  }) => {
    await oeffne(page, 'mehr');
    const gruppen = page.getByRole('main').getByRole('list');
    await expect(gruppen).toHaveCount(2);
    for (const gruppe of await gruppen.all()) {
      const links = await gruppe
        .locator('.zeile__titel')
        .evaluateAll((titel) => titel.map((t) => Math.round(t.getBoundingClientRect().left)));
      expect(new Set(links).size, 'Titel einer Gruppe beginnen bündig').toBe(1);
    }
    for (const name of ['Impressum', 'Datenschutz', 'Quellcode']) {
      await expect(page.getByRole('link', { name: beginntMit(name) }), name).toHaveCount(1);
    }
    await expect(page.getByRole('contentinfo')).toContainText('Keine Rechtsberatung.');
    await pruefeBildschirm(page, gesehen, 'Mehr in zwei Gruppen');
  });
});

test('auf einem Werkzeug bleibt «Übersicht» als Bereich markiert', async ({ page }) => {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  const navi = page.getByRole('navigation', { name: 'Hauptnavigation' });
  const uebersicht = navi.getByRole('link', { name: 'Übersicht' });
  await expect(uebersicht).toHaveAttribute('aria-current', 'page');

  await page.getByRole('region', { name: 'Werkzeuge' }).getByRole('link', { name: beginntMit('ChatGPT') }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ChatGPT');
  await expect(uebersicht).toHaveAttribute('aria-current', 'true');
  await expect(navi.locator('[aria-current]')).toHaveCount(1);
});
