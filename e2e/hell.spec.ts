import { oeffne } from './hilfen';
import { expect, pruefeBildschirm, test } from './qualitaet';

/**
 * Das KI-Inventar bleibt hell, auch wenn das Gerät dunkel eingestellt ist
 * (Adams Entscheid vom 12.10.2026: die helle Fassung wirkt besser).
 */
test.use({ colorScheme: 'dark' });

test('bleibt hell, auch auf einem dunkel eingestellten Gerät', async ({ page, gesehen }) => {
  await oeffne(page);
  await page.getByRole('button', { name: 'Beispiel laden' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Muster Treuhand AG');
  const farben = await page.evaluate(() => {
    const stil = getComputedStyle(document.body);
    return { grund: stil.backgroundColor, text: stil.color, schema: getComputedStyle(document.documentElement).colorScheme };
  });
  expect(farben).toEqual({ grund: 'rgb(244, 242, 237)', text: 'rgb(21, 23, 27)', schema: 'light' });
  await pruefeBildschirm(page, gesehen, 'Übersicht auf dunklem Gerät');
});
