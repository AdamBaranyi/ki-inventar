import { describe, expect, it } from 'vitest';

import { naviZustand } from './navi-zustand';

describe('naviZustand', () => {
  it('markiert die offene Seite', () => {
    expect(naviZustand('/', '/')).toBe('page');
    expect(naviZustand('/pruefpunkte', '/pruefpunkte')).toBe('page');
    expect(naviZustand('/mehr', '/mehr')).toBe('page');
  });

  it('die Übersicht gilt nur für «/» selbst als Seite', () => {
    expect(naviZustand('/', '/pruefpunkte')).toBeNull();
    expect(naviZustand('/', '/fristen')).toBeNull();
  });

  it('ein Werkzeug und sein Formular gehören zum Bereich der Übersicht', () => {
    expect(naviZustand('/', '/werkzeug/abc')).toBe('true');
    expect(naviZustand('/', '/werkzeug/neu')).toBe('true');
    expect(naviZustand('/', '/werkzeug/abc/bearbeiten')).toBe('true');
    expect(naviZustand('/pruefpunkte', '/werkzeug/abc')).toBeNull();
  });

  it('am Handy bleibt «Mehr» unter Verzeichnis, Daten und Rechtlichem markiert', () => {
    for (const pfad of ['/verzeichnis', '/daten', '/impressum', '/datenschutz']) {
      expect(naviZustand('/mehr', pfad)).toBe('true');
    }
    expect(naviZustand('/mehr', '/fristen')).toBeNull();
    expect(naviZustand('/mehr', '/datenschutzerklaerung')).toBeNull();
  });

  it('ein Name, der nur gleich beginnt, ist nicht dieselbe Seite', () => {
    expect(naviZustand('/daten', '/datenschutz')).toBeNull();
    expect(naviZustand('/fristen', '/fristen-alt')).toBeNull();
  });
});
