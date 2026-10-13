/** Was ein Eintrag der Navigation gerade ist, als Wert für `aria-current`. */
export type NaviZustand = 'page' | 'true' | null;

/** Seiten, die am Handy unter «Mehr» liegen; dort bleibt «Mehr» markiert. */
const UNTER_MEHR = ['/verzeichnis', '/daten', '/impressum', '/datenschutz'];

/**
 * «page» auf der Seite des Eintrags selbst, «true» in ihrem Bereich: Ein Werkzeug
 * gehört zur Übersicht, Verzeichnis, Daten und Rechtliches am Handy zu «Mehr».
 * `pfad` ist die Adresse ohne Abfrage und Anker.
 */
export function naviZustand(ziel: string, pfad: string): NaviZustand {
  if (ziel === '/' ? pfad === '/' : pfad === ziel || pfad.startsWith(`${ziel}/`)) return 'page';
  if (ziel === '/' && pfad.startsWith('/werkzeug/')) return 'true';
  if (ziel === '/mehr' && UNTER_MEHR.some((p) => pfad === p || pfad.startsWith(`${p}/`))) return 'true';
  return null;
}
