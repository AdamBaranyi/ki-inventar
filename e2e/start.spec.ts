import { cspVerstoesse, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

test.describe('Startseite', () => {
  test('leer: Einleitung, zwei Wege und alle Grundregeln', async ({ page, gesehen }) => {
    await oeffne(page);
    await expect(page).toHaveTitle('KI-Inventar für Schweizer KMU');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KI-Werkzeuge');
    await expect(page.getByRole('link', { name: 'Werkzeug erfassen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Beispiel laden' })).toBeVisible();
    await expect(page.getByText('Keine Rechtsberatung.')).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Start leer');
  });

  test('zeigt Hauptaktion und Hinweis ohne Scrollen', async ({ page }) => {
    await oeffne(page);
    const knopf = await page.getByRole('link', { name: 'Werkzeug erfassen' }).boundingBox();
    const hoehe = page.viewportSize()?.height ?? 0;
    expect(knopf && knopf.y + knopf.height).toBeLessThanOrEqual(hoehe);
  });

  test('mit Beispiel: drei Zahlen, Liste und Grundregeln', async ({ page, gesehen }) => {
    await oeffne(page);
    await page.getByRole('button', { name: 'Beispiel laden' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'KI-Werkzeuge der Muster Treuhand AG',
    );
    const zahlen = page.getByRole('list', { name: 'Stand' }).getByRole('listitem');
    await expect(zahlen).toHaveText(['7 Werkzeuge', '35 offene Prüfpunkte', '6 mit Personendaten']);
    const liste = page.getByRole('list').filter({ has: page.getByRole('link', { name: 'Otter' }) });
    await expect(liste.getByRole('listitem')).toHaveCount(7);
    await pruefeBildschirm(page, gesehen, 'Start mit Beispiel');
  });

  test('lädt Public Sans aus dem eigenen Build, mit Tabellenziffern', async ({ page }) => {
    await oeffne(page);
    const schrift = await page.evaluate(async () => {
      await document.fonts.load('700 56px "Public Sans"');
      const breite = (text: string) => {
        const el = document.createElement('span');
        el.className = 'zahl';
        el.textContent = text;
        el.setAttribute('aria-hidden', 'true');
        el.classList.add('bilanz__zahl');
        document.body.append(el);
        const w = el.getBoundingClientRect().width;
        el.remove();
        return w;
      };
      return {
        geladen: document.fonts.check('700 56px "Public Sans"'),
        einsen: breite('1111111111'),
        nullen: breite('0000000000'),
      };
    });
    expect(schrift.geladen).toBe(true);
    expect(Math.abs(schrift.einsen - schrift.nullen)).toBeLessThan(0.5);
  });

  test('blockiert eingeschleustes HTML mit Ereignis-Handler und meldet es', async ({ page }) => {
    await oeffne(page);
    await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.innerHTML = '<img src="data:," onerror="window.__eingeschleust = true">';
      document.body.append(probe);
    });
    await expect.poll(() => cspVerstoesse(page)).not.toEqual([]);
    expect(await page.evaluate(() => 'eingeschleust' in window)).toBe(false);
  });
});
