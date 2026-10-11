import * as z from '../zod';
import { werkzeugSchema } from './werkzeug';

/** Gespeicherter Stand im Browser und Inhalt der Sicherung (JSON). */
export const inventarSchema = z.object({
  version: z.literal(1),
  firma: z.string().trim().max(120),
  werkzeuge: z.array(werkzeugSchema).max(500),
});

export type Inventar = z.infer<typeof inventarSchema>;

export function leeresInventar(): Inventar {
  return { version: 1, firma: '', werkzeuge: [] };
}

export type Gelesen = { ok: true; inventar: Inventar } | { ok: false; fehler: string };

/** Liest ein Inventar aus Text (Speicher oder Sicherungsdatei) und prüft es. */
export function liesInventar(text: string): Gelesen {
  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    return { ok: false, fehler: 'Der Inhalt ist kein gültiges JSON.' };
  }
  const ergebnis = inventarSchema.safeParse(daten);
  if (ergebnis.success) return { ok: true, inventar: ergebnis.data };
  const erstes = ergebnis.error.issues[0];
  const stelle = erstes?.path.length ? ` (Feld ${erstes.path.join('.')})` : '';
  return { ok: false, fehler: `Der Inhalt passt nicht zum Aufbau des KI-Inventars${stelle}.` };
}
