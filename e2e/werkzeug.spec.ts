import type { Page } from '@playwright/test';

import { oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

const HEUTE = new Date('2026-10-11T10:00:00+02:00');

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: HEUTE });
});

async function beispielUndWerkzeug(page: Page, name: string) {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await page.getByRole('link', { name, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
}

function punkt(page: Page, titel: string) {
  return page.getByRole('article', { name: titel });
}

test.describe('Werkzeug erfassen', () => {
  test('speichert ab dem Namen und behält die Antworten nach dem Neuladen', async ({ page, gesehen }) => {
    await oeffne(page, 'werkzeug/neu');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug erfassen');
    await pruefeBildschirm(page, gesehen, 'Formular leer');

    await page.getByLabel('Name des Werkzeugs').fill('Notion KI');
    await expect(page.getByRole('status')).toHaveText('Automatisch gespeichert.');
    await expect(page).toHaveURL(/\/werkzeug\/[0-9a-f-]{36}\/bearbeiten$/);

    await page.getByRole('radio', { name: 'USA' }).check();
    const personendaten = page.getByRole('group', { name: 'Gelangen Personendaten in die Eingaben?' });
    await personendaten.getByRole('radio', { name: 'Ja', exact: true }).check();

    await page.reload({ waitUntil: 'commit' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug bearbeiten');
    await expect(page.getByLabel('Name des Werkzeugs')).toHaveValue('Notion KI');
    await expect(page.getByRole('radio', { name: 'USA' })).toBeChecked();

    await page.getByRole('button', { name: 'Fertig' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notion KI');
    await expect(punkt(page, 'Bekanntgabe ins Ausland prüfen')).toContainText('Data Privacy Framework');
    await pruefeBildschirm(page, gesehen, 'Karteikarte neu');
  });

  test('meldet fehlenden Namen und ungültige Zahl, ohne zu speichern', async ({ page, gesehen }) => {
    await oeffne(page, 'werkzeug/neu');
    await page.getByRole('button', { name: 'Fertig' }).click();
    await expect(page.getByText('Gib dem Werkzeug einen Namen.')).toBeVisible();
    await expect(page.getByLabel('Name des Werkzeugs')).toBeFocused();

    await page.getByLabel('Name des Werkzeugs').fill('Perplexity');
    await page.getByLabel('Ungefähre Zahl der Nutzenden').fill('1.5');
    await page.getByLabel('Ungefähre Zahl der Nutzenden').blur();
    await expect(page.getByText('Bitte eine ganze Zahl ab 0 eingeben.')).toBeVisible();
    await expect(page.getByRole('status')).toHaveText(
      'Nicht gespeichert: Bitte die markierten Angaben prüfen.',
    );
    await pruefeBildschirm(page, gesehen, 'Formular mit Fehlern');
  });

  test('zeigt für eine unbekannte Kennung «Werkzeug nicht gefunden»', async ({ page }) => {
    await oeffne(page, 'werkzeug/gibt-es-nicht');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Werkzeug nicht gefunden');
  });
});

test.describe('Karteikarte', () => {
  test('erledigt einen Punkt und öffnet ihn wieder', async ({ page, gesehen }) => {
    await beispielUndWerkzeug(page, 'ChatGPT');
    const avv = punkt(page, 'Vertrag zur Auftragsbearbeitung abschliessen');
    await avv.getByRole('button', { name: 'Als erledigt markieren' }).click();
    await expect(avv).toContainText('Erledigt am 11.10.2026');
    await expect(avv.getByRole('button', { name: 'Wieder öffnen' })).toBeFocused();
    await pruefeBildschirm(page, gesehen, 'Karteikarte mit erledigtem Punkt');

    await avv.getByRole('button', { name: 'Wieder öffnen' }).click();
    await expect(avv.getByRole('button', { name: 'Als erledigt markieren' })).toBeVisible();
  });

  test('verlangt eine Begründung für «Trifft nicht zu»', async ({ page, gesehen }) => {
    await beispielUndWerkzeug(page, 'ChatGPT');
    const schulung = punkt(page, 'KI-Kompetenz fördern');
    await schulung.getByRole('button', { name: 'Trifft nicht zu' }).click();
    await schulung.getByRole('button', { name: 'Begründung speichern' }).click();
    await expect(schulung.getByText('Bitte kurz begründen, warum der Punkt nicht zutrifft.')).toBeVisible();
    await pruefeBildschirm(page, gesehen, 'Begründung fehlt');

    await schulung.getByLabel('Warum trifft der Punkt nicht zu?').fill('Nur eine Person, intern geschult');
    await schulung.getByRole('button', { name: 'Begründung speichern' }).click();
    await expect(schulung).toContainText('«Nur eine Person, intern geschult»');
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
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KI-Werkzeuge der Muster Treuhand AG');
    await expect(page.getByRole('link', { name: 'Otter', exact: true })).toHaveCount(0);
  });
});
