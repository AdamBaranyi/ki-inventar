const TAG_MS = 86_400_000;

/** Ganze Tage von `von` bis `bis`, beide im Format JJJJ-MM-TT. */
export function tageZwischen(von: string, bis: string): number {
  return Math.round((Date.parse(`${bis}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / TAG_MS);
}

/** «2026-10-11» wird «11.10.2026». */
export function datumCh(iso: string): string {
  const [jahr, monat, tag] = iso.slice(0, 10).split('-');
  return `${tag}.${monat}.${jahr}`;
}

/** Ein Datum plus Tage, wieder als JJJJ-MM-TT. */
export function plusTage(iso: string, tage: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + tage * TAG_MS).toISOString().slice(0, 10);
}
