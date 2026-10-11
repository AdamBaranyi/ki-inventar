/** Bietet Text als Datei zum Herunterladen an, ohne Server. */
export function herunterladen(dateiname: string, inhalt: string, typ: string): void {
  const url = URL.createObjectURL(new Blob([inhalt], { type: typ }));
  const link = document.createElement('a');
  link.href = url;
  link.download = dateiname;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Höchstens 1 MB: Eine Sicherung mit 500 Werkzeugen bleibt weit darunter. */
export const MAX_SICHERUNG_BYTES = 1_000_000;
