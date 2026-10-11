import { AxeBuilder } from '@axe-core/playwright';
import { expect, test as basis, type Page } from '@playwright/test';

import {
  beobachte,
  cspVerstoesse,
  kleineSchrift,
  kleineZiele,
  querscrollen,
  type Beobachtung,
} from './hilfen';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Test mit Beobachtung ab dem ersten Aufruf. */
export const test = basis.extend<{ gesehen: Beobachtung }>({
  gesehen: async ({ page, baseURL }, verwende) => {
    await verwende(await beobachte(page, baseURL ?? 'http://localhost:4300/ki-inventar/'));
  },
});

export { expect };

/**
 * Was auf jedem Bildschirm gilt: kein Querscrollen, keine Schrift unter 16 px,
 * Tippflächen ab 44 px, axe ohne Befund, keine Anfrage an fremde Ursprünge,
 * kein CSP-Verstoss, kein Fehler in der Konsole.
 */
export async function pruefeBildschirm(page: Page, gesehen: Beobachtung, name: string) {
  expect(await querscrollen(page), `${name}: kein Querscrollen`).toBeLessThanOrEqual(0);
  expect(await kleineSchrift(page), `${name}: keine Schrift unter 16 px`).toEqual([]);
  expect(await kleineZiele(page), `${name}: Tippflächen ab 44 × 44 px`).toEqual([]);
  const axe = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(
    axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    `${name}: axe ohne Befund`,
  ).toEqual([]);
  expect(gesehen.fremdeAnfragen, `${name}: keine Anfragen an fremde Ursprünge`).toEqual([]);
  expect(await cspVerstoesse(page), `${name}: keine CSP-Verstösse`).toEqual([]);
  expect(gesehen.fehler, `${name}: keine Fehler in der Konsole`).toEqual([]);
}
