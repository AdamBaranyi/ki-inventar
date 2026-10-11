import { geheZu, oeffne, ohneDruckdialog } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-11T10:00:00+02:00') });
});

test('Beispiel laden, bearbeiten, erledigen, drucken, exportieren, neu laden: derselbe Stand', async ({
  page,
  gesehen,
}, testInfo) => {
  await ohneDruckdialog(page);
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();

  // Werkzeug bearbeiten: ChatGPT bekommt eine verantwortliche Person.
  await page.getByRole('link', { name: 'ChatGPT', exact: true }).click();
  await page.getByRole('link', { name: 'Bearbeiten' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug bearbeiten');
  await page.getByRole('textbox', { name: 'Verantwortliche Person', exact: true }).fill('Lea Muster');
  await expect(page.getByRole('status')).toHaveText('Automatisch gespeichert.');
  await page.getByRole('button', { name: 'Fertig' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ChatGPT');
  await expect(page.getByRole('article', { name: 'Datenschutzerklärung ergänzen' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Verantwortliche Person benennen' })).toHaveCount(0);

  // Prüfpunkt erledigen.
  const avv = page.getByRole('article', { name: 'Vertrag zur Auftragsbearbeitung abschliessen' });
  await avv.getByRole('button', { name: 'Als erledigt markieren' }).click();
  await expect(avv).toContainText('Erledigt am 11.10.2026');

  // Drucken: Druckansicht, Kopf mit Firma und Datum, Druckdialog aufgerufen.
  await geheZu(page, 'Verzeichnis');
  await expect(page.getByRole('heading', { name: 'Verzeichnis der KI-Werkzeuge' })).toBeVisible();
  await expect(page.getByText('Stand 11.10.2026, 7 Werkzeuge, 33 offene Prüfpunkte')).toBeVisible();
  await pruefeBildschirm(page, gesehen, 'Verzeichnis');
  await page.getByRole('button', { name: 'Drucken' }).click();
  expect(await page.evaluate(() => (window as unknown as { __gedruckt: number }).__gedruckt)).toBe(1);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Drucken' })).toBeHidden();
  await expect(page.getByText('Muster Treuhand AG').first()).toBeVisible();
  await testInfo.attach('druckansicht', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page.emulateMedia({ media: 'screen' });

  // Exportieren.
  await geheZu(page, 'Daten');
  const [datei] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Sicherung herunterladen (JSON)' }).click(),
  ]);
  expect(datei.suggestedFilename()).toBe('ki-inventar-2026-10-11.json');

  // Neu laden: derselbe Stand.
  await page.reload({ waitUntil: 'commit' });
  await geheZu(page, 'Übersicht');
  await expect(page.getByRole('list', { name: 'Stand' }).getByRole('listitem')).toHaveText([
    '7 Werkzeuge',
    '33 offene Prüfpunkte',
    '6 mit Personendaten',
  ]);

  // Keine Anfrage hat das Gerät mit Daten verlassen: nur GET an den eigenen Ursprung.
  expect(gesehen.fremdeAnfragen).toEqual([]);
  expect(gesehen.anfragen.filter((a) => a.methode !== 'GET')).toEqual([]);
});
