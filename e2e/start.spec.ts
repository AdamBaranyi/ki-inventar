import { beginntMit, cspVerstoesse, oeffne, sichtbarBis } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

test.describe('Startseite', () => {
  test('leer: Einleitung, zwei Wege und alle Grundregeln', async ({ page, gesehen }) => {
    await oeffne(page);
    await expect(page).toHaveTitle('KI-Inventar für Schweizer KMU');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KI-Werkzeuge');
    await expect(page.getByRole('link', { name: 'Werkzeug erfassen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Beispiel laden' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'So geht es' })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toContainText('Keine Rechtsberatung.');
    await pruefeBildschirm(page, gesehen, 'Start leer');
  });

  test('zeigt beide Wege ohne Scrollen, über der Tab-Leiste', async ({ page }) => {
    await oeffne(page);
    const bis = await sichtbarBis(page);
    for (const ziel of [
      page.getByRole('link', { name: 'Werkzeug erfassen' }),
      page.getByRole('button', { name: 'Beispiel laden' }),
    ]) {
      const box = await ziel.boundingBox();
      expect(box && box.y + box.height).toBeLessThanOrEqual(bis);
    }
  });

  test('mit Beispiel: Fortschritt, nächste Punkte, Werkzeuge und Fristen', async ({ page, gesehen }) => {
    await oeffne(page);
    await page.getByRole('button', { name: 'Beispiel laden' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
    await expect(page.getByText('7 Werkzeuge, 6 davon mit Personendaten')).toBeVisible();
    await expect(page.getByText('5 von 40 Prüfpunkten erledigt')).toBeVisible();
    await expect(page.getByText('35 offen, davon 8 hoch')).toBeVisible();

    const naechstes = page.getByRole('region', { name: 'Als Nächstes' }).getByRole('link');
    await expect(naechstes).toHaveCount(3);
    await expect(naechstes.first()).toHaveAccessibleName(
      /^Automatisierte Entscheidungen offenlegen ?, Bewerbungs-Screening, hoch$/,
    );
    const werkzeuge = page.getByRole('region', { name: 'Werkzeuge' }).getByRole('link');
    await expect(werkzeuge).toHaveCount(7);
    await expect(werkzeuge.last()).toHaveAccessibleName(/^Otter ?, Otter\.ai, USA ?, 1 Antwort offen ?, 10 offen$/);
    await expect(page.getByRole('region', { name: 'Fristen' }).getByRole('listitem').nth(1)).toHaveText(
      'Heute 11.10.2026',
    );
    await pruefeBildschirm(page, gesehen, 'Start mit Beispiel');
  });

  test('«Als Nächstes» öffnet das Werkzeug mit dem Punkt aufgeklappt', async ({ page, gesehen }) => {
    await oeffne(page);
    await page.getByRole('button', { name: 'Beispiel laden' }).click();
    await page.getByRole('region', { name: 'Als Nächstes' }).getByRole('link').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bewerbungs-Screening');
    const punkt = page.getByRole('article', { name: 'Automatisierte Entscheidungen offenlegen' });
    await expect(punkt.getByRole('button', { name: beginntMit('Automatisierte Entscheidungen offenlegen') }))
      .toHaveAttribute('aria-expanded', 'true');
    await expect(punkt.getByRole('button', { name: 'Erledigt' })).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Werkzeug mit aufgeklapptem Punkt');
  });

  test('am Handy: Tab-Leiste mit vier Zielen, der Rest unter «Mehr»', async ({ page, gesehen, isMobile }) => {
    test.skip(!isMobile, 'Die Tab-Leiste gibt es nur am Handy.');
    await oeffne(page);
    const navi = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(navi.getByRole('link')).toHaveText(['Übersicht', 'Prüfpunkte', 'Fristen', 'Mehr']);
    await expect(navi.getByRole('link', { name: 'Übersicht' })).toHaveAttribute('aria-current', 'page');

    await navi.getByRole('link', { name: 'Mehr' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mehr');
    const ziele = page.getByRole('main').getByRole('link');
    await expect(ziele).toHaveCount(5);
    await pruefeBildschirm(page, gesehen, 'Mehr');

    await ziele.first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Verzeichnis');
    await expect(navi.getByRole('link', { name: 'Mehr' })).toHaveClass(/navi__link--bereich/);
  });

  test('am Desktop: Seitenleiste mit fünf Zielen und der Zahl offener Punkte', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Am Handy gibt es die Tab-Leiste.');
    await oeffne(page);
    const navi = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(navi.getByRole('link')).toHaveText([
      'Übersicht',
      'Prüfpunkte',
      'Fristen',
      'Verzeichnis',
      'Daten sichern',
    ]);
    await page.getByRole('button', { name: 'Beispiel laden' }).click();
    await expect(navi.getByRole('link', { name: 'Prüfpunkte, 35 offen' })).toBeVisible();
  });

  test('lädt Mona Sans aus dem eigenen Build; Tabellenziffern sind gleich breit', async ({ page }) => {
    await oeffne(page);
    const schrift = await page.evaluate(async () => {
      await document.fonts.load('600 46px "Mona Sans"');
      const breite = (text: string) => {
        const el = document.createElement('span');
        el.className = 'zahl fortschritt__zahl';
        el.textContent = text;
        el.setAttribute('aria-hidden', 'true');
        document.body.append(el);
        const w = el.getBoundingClientRect().width;
        el.remove();
        return w;
      };
      return {
        geladen: document.fonts.check('600 46px "Mona Sans"'),
        familie: getComputedStyle(document.body).fontFamily,
        einsen: breite('1111111111'),
        nullen: breite('0000000000'),
      };
    });
    expect(schrift.geladen).toBe(true);
    // Chromium schreibt den Namen in Anführungszeichen, WebKit ohne.
    expect(schrift.familie).toMatch(/^"?Mona Sans"?,/);
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
