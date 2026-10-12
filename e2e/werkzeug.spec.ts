import type { Page } from '@playwright/test';

import { beginntMit, oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

const HEUTE = new Date('2026-10-11T10:00:00+02:00');

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: HEUTE });
});

async function beispielUndWerkzeug(page: Page, name: string) {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await page.getByRole('link', { name: beginntMit(name) }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
}

function punkt(page: Page, titel: string) {
  return page.getByRole('article', { name: titel });
}

/** Klappt einen Prüfpunkt auf und gibt ihn zurück. */
async function aufklappen(page: Page, titel: string) {
  const artikel = punkt(page, titel);
  await artikel.getByRole('button', { name: beginntMit(titel) }).click();
  return artikel;
}

function weiter(page: Page) {
  return page.getByRole('button', { name: 'Weiter' }).click();
}

test.describe('Werkzeug erfassen', () => {
  test('fragt Schritt für Schritt, speichert ab dem Namen und behält jede Antwort', async ({
    page,
    gesehen,
  }) => {
    await oeffne(page, 'werkzeug/neu');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug und Anbieter');
    await expect(page.getByText('Frage 1 von 10')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Speichert ab dem Namen');
    await expect(page.getByRole('radio', { name: 'Weiss ich nicht' })).toBeChecked();
    await pruefeBildschirm(page, gesehen, 'Formular, Frage 1');

    await page.getByLabel('Name des Werkzeugs').fill('Notion KI');
    await expect(page.getByRole('status')).toHaveText('Gespeichert');
    await expect(page).toHaveURL(/\/werkzeug\/[0-9a-f-]{36}\/bearbeiten$/);
    await page.getByRole('radio', { name: 'USA' }).check();

    await weiter(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zweck');
    await expect(page).toHaveURL(/\?frage=2$/);
    await expect(page.getByText('Frage 2 von 10, Notion KI')).toBeVisible();
    await expect(page).toHaveTitle('Frage 2 von 10: Zweck – Notion KI – KI-Inventar');
    await weiter(page);
    await weiter(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zugang');
    await weiter(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Personendaten');
    await page.getByRole('radio', { name: 'Ja', exact: true }).check();
    await pruefeBildschirm(page, gesehen, 'Formular, Frage 5');

    await page.reload({ waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Personendaten');
    await expect(page.getByRole('radio', { name: 'Ja', exact: true })).toBeChecked();
    await page.getByRole('button', { name: 'Zurück' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Zugang');
    await expect(page.getByRole('radio', { name: 'Weiss ich nicht' })).toBeChecked();

    for (let i = 0; i < 6; i += 1) await weiter(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('EU, Schulung, Verbote');
    await expect(page.getByText('Noch offen:')).toBeVisible();
    await page.getByRole('button', { name: 'Fertig' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notion KI');
    const ausland = await aufklappen(page, 'Bekanntgabe ins Ausland prüfen');
    await expect(ausland).toContainText('Data Privacy Framework');
    await pruefeBildschirm(page, gesehen, 'Werkzeug neu');
  });

  test('«Weiter» verlangt einen Namen und eine ganze Zahl, ohne zu speichern', async ({ page, gesehen }) => {
    await oeffne(page, 'werkzeug/neu');
    await weiter(page);
    await expect(page.getByText('Gib dem Werkzeug einen Namen.')).toBeVisible();
    await expect(page.getByLabel('Name des Werkzeugs')).toBeFocused();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug und Anbieter');

    await page.getByLabel('Name des Werkzeugs').fill('Perplexity');
    await weiter(page);
    await weiter(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wer nutzt es');
    await page.getByLabel('Ungefähre Zahl der Nutzenden').fill('1.5');
    await weiter(page);
    await expect(page.getByText('Bitte eine ganze Zahl ab 0 eingeben.')).toBeVisible();
    await expect(page.getByLabel('Ungefähre Zahl der Nutzenden')).toBeFocused();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wer nutzt es');
    await expect(page.getByRole('status')).toHaveText('Nicht gespeichert');
    await pruefeBildschirm(page, gesehen, 'Formular mit Fehlern');
  });

  test('am Handy ohne Tab-Leiste, mit eigener Leiste unten', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Am Desktop bleibt die Seitenleiste.');
    await oeffne(page, 'werkzeug/neu');
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeHidden();
    const leiste = await page.getByRole('button', { name: 'Weiter' }).boundingBox();
    const hoehe = page.viewportSize()?.height ?? 0;
    expect(leiste && leiste.y + leiste.height).toBeLessThanOrEqual(hoehe);
    expect(leiste && leiste.y).toBeGreaterThan(hoehe - 120);
  });

  test('«Ändern» führt zur passenden Frage, «Schliessen» zurück zum Werkzeug', async ({ page }) => {
    await beispielUndWerkzeug(page, 'ChatGPT');
    await page.getByRole('region', { name: 'Wer nutzt es' }).getByRole('link', { name: 'Ändern' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wer nutzt es');
    await expect(page).toHaveURL(/\/bearbeiten\?frage=3$/);
    await page.getByRole('link', { name: 'Schliessen' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('ChatGPT');
  });

  test('zeigt für eine unbekannte Kennung «Werkzeug nicht gefunden»', async ({ page }) => {
    await oeffne(page, 'werkzeug/gibt-es-nicht');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug nicht gefunden');
  });
});

test.describe('Werkzeug', () => {
  test('erledigt einen Punkt und öffnet ihn wieder', async ({ page, gesehen }) => {
    await beispielUndWerkzeug(page, 'ChatGPT');
    await expect(page.getByText('0 von 8 erledigt')).toBeVisible();
    const avv = await aufklappen(page, 'Vertrag zur Auftragsbearbeitung abschliessen');
    await avv.getByRole('button', { name: 'Erledigt' }).click();
    await expect(avv).toContainText('Erledigt am 11.10.2026');
    await expect(avv.getByRole('button', { name: 'Wieder öffnen' })).toBeFocused();
    await expect(page.getByText('1 von 8 erledigt')).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Werkzeug mit erledigtem Punkt');

    await avv.getByRole('button', { name: 'Wieder öffnen' }).click();
    await expect(avv.getByRole('button', { name: 'Erledigt' })).toBeVisible();
  });

  test('verlangt eine Begründung für «Trifft nicht zu»', async ({ page, gesehen }) => {
    await beispielUndWerkzeug(page, 'ChatGPT');
    const schulung = await aufklappen(page, 'KI-Kompetenz fördern');
    await schulung.getByRole('button', { name: 'Trifft nicht zu' }).click();
    await schulung.getByRole('button', { name: 'Begründung speichern' }).click();
    await expect(schulung.getByText('Bitte kurz begründen, warum der Punkt nicht zutrifft.')).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Begründung fehlt');

    await schulung.getByLabel('Warum trifft der Punkt nicht zu?').fill('Nur eine Person, intern geschult');
    await schulung.getByRole('button', { name: 'Begründung speichern' }).click();
    await expect(schulung).toContainText('«Nur eine Person, intern geschult»');
    await expect(schulung).toContainText('Trifft nicht zu, festgehalten am 11.10.2026');
  });

  test('löscht ein Werkzeug erst nach Bestätigung', async ({ page }) => {
    await beispielUndWerkzeug(page, 'Otter');
    await page.getByRole('button', { name: 'Werkzeug löschen' }).click();
    const dialog = page.getByRole('dialog', { name: '«Otter» löschen?' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Werkzeug löschen' }).click();
    await dialog.getByRole('button', { name: 'Löschen' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
    await expect(page.getByRole('link', { name: beginntMit('Otter') })).toHaveCount(0);
  });
});
