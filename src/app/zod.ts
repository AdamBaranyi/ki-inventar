import { config } from 'zod';

// Zod v4 prüft beim ersten Schema, ob `new Function` erlaubt ist. Die CSP der
// Seite verbietet das und meldet den Versuch als Verstoss, auch wenn Zod den
// Fehler selbst auffängt. Darum vor jedem Schema abschalten. Alle anderen
// Dateien importieren Zod von hier (geprüft in scripts/pruefe-quelltext.mjs),
// und zwar als `import * as z`: Nur so kann der Build ungenutzte Teile weglassen.
config({ jitless: true });

export * from 'zod';
