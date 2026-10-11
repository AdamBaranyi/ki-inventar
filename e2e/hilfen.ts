import type { Page } from '@playwright/test';

/**
 * Prüfhilfen für jeden Bildschirm, übernommen aus Hundebüechli und angepasst:
 * Tippflächen ab 44 px, Beschriftung zählt zur Tippfläche ihres Feldes.
 */

export interface Beobachtung {
  fehler: string[];
  fremdeAnfragen: string[];
  anfragen: { methode: string; url: string }[];
}

/**
 * GitHub Pages liefert tiefe Links als 404.html mit Status 404 aus; die App
 * startet dort trotzdem. Chromium meldet den Status als Konsolenfehler. Nur
 * genau diese Meldung zum Hauptdokument fällt weg, jede andere bleibt.
 */
const PAGES_RUECKFALL = 'Failed to load resource: the server responded with a status of 404 (Not Found)';

/** Beobachtet die Seite von Anfang an: Konsolenfehler, Anfragen, CSP-Verstösse. */
export async function beobachte(page: Page, basis: string): Promise<Beobachtung> {
  const gesehen: Beobachtung = { fehler: [], fremdeAnfragen: [], anfragen: [] };
  const eigen = new URL(basis).origin;
  page.on('pageerror', (fehler) => gesehen.fehler.push(String(fehler)));
  const rueckfall = new Set<string>();
  page.on('response', (antwort) => {
    if (antwort.request().isNavigationRequest() && antwort.status() === 404) rueckfall.add(antwort.url());
  });
  page.on('console', (meldung) => {
    if (meldung.type() !== 'error') return;
    if (meldung.text() === PAGES_RUECKFALL && rueckfall.has(meldung.location().url)) return;
    gesehen.fehler.push(meldung.text());
  });
  page.on('request', (anfrage) => {
    const url = anfrage.url();
    gesehen.anfragen.push({ methode: anfrage.method(), url });
    if (url.startsWith('data:') || url.startsWith('blob:')) return;
    if (new URL(url).origin !== eigen) gesehen.fremdeAnfragen.push(url);
  });
  await page.addInitScript(() => {
    const liste: string[] = [];
    Object.defineProperty(window, '__cspVerstoesse', { value: liste });
    document.addEventListener('securitypolicyviolation', (e) => {
      liste.push(`${e.violatedDirective}: ${e.blockedURI || 'inline'}`);
    });
  });
  return gesehen;
}

export function cspVerstoesse(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __cspVerstoesse: string[] }).__cspVerstoesse);
}

/** Öffnet eine Seite und wartet auf ihre Überschrift und die Schrift. */
export async function oeffne(page: Page, pfad = '') {
  await page.goto(pfad, { waitUntil: 'commit' });
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/** Sichtbare Texte kleiner als 16 px. */
export function kleineSchrift(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const funde: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      const mitText = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
      );
      if (!mitText || el.closest('script, style, title, noscript, .unsichtbar')) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const stil = getComputedStyle(el);
      if (stil.visibility === 'hidden' || stil.display === 'none') continue;
      const groesse = parseFloat(stil.fontSize);
      if (groesse < 16) funde.push(`${el.tagName} «${el.textContent?.trim().slice(0, 30)}» ${groesse}px`);
    }
    return funde;
  });
}

/** Bedienelemente mit weniger als 44 × 44 px; ein Feld zählt mit seiner Beschriftung. */
export function kleineZiele(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const funde: string[] = [];
    const auswahl = 'a[href], button, input, textarea, select, summary, [role="button"]';
    for (const el of document.querySelectorAll<HTMLElement>(auswahl)) {
      if (el.closest('.unsichtbar') || (el.matches('.sprung') && document.activeElement !== el)) continue;
      const ziel = el.matches('input') ? (el.closest('label') ?? el) : el;
      const box = ziel.getBoundingClientRect();
      if (box.width === 0 && box.height === 0) continue;
      if (box.width < 44 || box.height < 44) {
        const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30);
        funde.push(`${el.tagName} «${name}» ${Math.round(box.width)}×${Math.round(box.height)}`);
      }
    }
    return funde;
  });
}

/** Wie weit die Seite breiter ist als das Fenster; mehr als 0 heisst Querscrollen. */
export function querscrollen(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

/** Der Druckdialog hält Tests an; im Test zählt er nur mit. */
export async function ohneDruckdialog(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __gedruckt: number }).__gedruckt = 0;
    window.print = () => {
      (window as unknown as { __gedruckt: number }).__gedruckt += 1;
    };
  });
}

/** Folgt einem Link der Hauptnavigation; am Handy klappt vorher das Menü auf. */
export async function geheZu(page: Page, name: string) {
  const menue = page.getByRole('button', { name: 'Menü', exact: true });
  if (await menue.isVisible()) await menue.click();
  await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
  await page.getByRole('heading', { level: 1 }).first().waitFor();
}
