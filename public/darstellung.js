// Setzt die gewählte Darstellung, bevor die Seite gezeichnet wird: kein kurzes
// Aufblitzen in der falschen Farbe. Als Datei, weil die CSP Inline-Skripte sperrt.
// Dieselben Werte und derselbe Schlüssel wie src/app/daten/darstellung.ts.
(function () {
  var wahl = 'hell';
  try {
    var gespeichert = localStorage.getItem('ki-inventar-darstellung');
    if (gespeichert === 'dunkel' || gespeichert === 'system') wahl = gespeichert;
  } catch (e) {
    // Gesperrter Speicher: dann gilt die Vorgabe.
  }
  document.documentElement.setAttribute('data-darstellung', wahl);
})();
