import { VORLAGEN_TEXTE as V } from '../texte/de-CH-vorlagen';
import type { Quelle } from './regeln';
import type { Antworten } from './werkzeug';

/** Was eine Vorlage eintragen darf. Den Standort nie: Vertragspartner und Ort der Bearbeitung weichen ab. */
export type VorlagenAntworten = Partial<Pick<Antworten, 'anbieter' | 'zugang' | 'training' | 'avv'>>;

export interface Vorlage {
  id: string;
  werkzeug: string;
  variante: string;
  /** Kleingeschrieben; ein Name passt, wenn er eines davon enthält. */
  suchbegriffe: readonly string[];
  antworten: VorlagenAntworten;
  hinweis: string;
  quellen: readonly Quelle[];
}

/** Geprüft am 12.10.2026; Anbieter ändern ihre Bedingungen, darum steht das Datum im Formular. */
export const VORLAGEN_STAND = '2026-10-12';

const Q = {
  openaiDaten: { text: 'OpenAI, Data Controls FAQ', url: 'https://help.openai.com/en/articles/7730893-data-controls-faq' },
  openaiEu: { text: 'OpenAI, EU Terms of Use', url: 'https://openai.com/policies/eu-terms-of-use/' },
  openaiFirma: { text: 'OpenAI, Business data privacy', url: 'https://openai.com/business-data/' },
  microsoft: {
    text: 'Microsoft Learn, Data, Privacy, and Security for Microsoft Copilot',
    url: 'https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy',
  },
  anthropic: { text: 'Anthropic, Updates to Consumer Terms', url: 'https://www.anthropic.com/news/updates-to-our-consumer-terms' },
  anthropicFirma: { text: 'Anthropic, Commercial Terms', url: 'https://www.anthropic.com/legal/commercial-terms' },
  geminiApps: { text: 'Google, Gemini Apps Privacy Hub', url: 'https://support.google.com/gemini/answer/13594961' },
  geminiWorkspace: { text: 'Google, Generative AI in Workspace Privacy Hub', url: 'https://support.google.com/a/answer/15706919' },
  deepl: { text: 'DeepL, Datenschutzerklärung', url: 'https://www.deepl.com/de/privacy' },
  deeplPro: { text: 'DeepL Pro, Datensicherheit', url: 'https://www.deepl.com/de/pro-data-security' },
} satisfies Record<string, Quelle>;

export const VORLAGEN: readonly Vorlage[] = [
  {
    id: 'chatgpt-privat',
    werkzeug: 'ChatGPT',
    variante: V.chatgptPrivat.variante,
    suchbegriffe: ['chatgpt', 'openai'],
    antworten: { anbieter: 'OpenAI', zugang: 'privat', training: 'nein', avv: 'nein' },
    hinweis: V.chatgptPrivat.hinweis,
    quellen: [Q.openaiDaten, Q.openaiEu],
  },
  {
    id: 'chatgpt-firma',
    werkzeug: 'ChatGPT',
    variante: V.chatgptFirma.variante,
    suchbegriffe: ['chatgpt', 'openai'],
    antworten: { anbieter: 'OpenAI', zugang: 'firma', training: 'ja' },
    hinweis: V.chatgptFirma.hinweis,
    quellen: [Q.openaiFirma, Q.openaiEu],
  },
  {
    id: 'copilot-firma',
    werkzeug: 'Microsoft Copilot',
    variante: V.copilotFirma.variante,
    suchbegriffe: ['copilot', 'microsoft'],
    antworten: { anbieter: 'Microsoft', zugang: 'firma', training: 'ja' },
    hinweis: V.copilotFirma.hinweis,
    quellen: [Q.microsoft],
  },
  {
    id: 'claude-privat',
    werkzeug: 'Claude',
    variante: V.claudePrivat.variante,
    suchbegriffe: ['claude', 'anthropic'],
    antworten: { anbieter: 'Anthropic', zugang: 'privat', avv: 'nein' },
    hinweis: V.claudePrivat.hinweis,
    quellen: [Q.anthropic],
  },
  {
    id: 'claude-firma',
    werkzeug: 'Claude',
    variante: V.claudeFirma.variante,
    suchbegriffe: ['claude', 'anthropic'],
    antworten: { anbieter: 'Anthropic', zugang: 'firma', training: 'ja' },
    hinweis: V.claudeFirma.hinweis,
    quellen: [Q.anthropic, Q.anthropicFirma],
  },
  {
    id: 'gemini-privat',
    werkzeug: 'Gemini',
    variante: V.geminiPrivat.variante,
    suchbegriffe: ['gemini', 'google'],
    antworten: { anbieter: 'Google', zugang: 'privat', avv: 'nein' },
    hinweis: V.geminiPrivat.hinweis,
    quellen: [Q.geminiApps],
  },
  {
    id: 'gemini-workspace',
    werkzeug: 'Gemini',
    variante: V.geminiWorkspace.variante,
    suchbegriffe: ['gemini', 'google'],
    antworten: { anbieter: 'Google', zugang: 'firma', training: 'ja' },
    hinweis: V.geminiWorkspace.hinweis,
    quellen: [Q.geminiWorkspace],
  },
  {
    id: 'deepl-free',
    werkzeug: 'DeepL',
    variante: V.deeplFree.variante,
    suchbegriffe: ['deepl'],
    antworten: { anbieter: 'DeepL SE', zugang: 'privat', training: 'nein', avv: 'nein' },
    hinweis: V.deeplFree.hinweis,
    quellen: [Q.deepl],
  },
  {
    id: 'deepl-pro',
    werkzeug: 'DeepL',
    variante: V.deeplPro.variante,
    suchbegriffe: ['deepl'],
    antworten: { anbieter: 'DeepL SE', zugang: 'firma', training: 'ja' },
    hinweis: V.deeplPro.hinweis,
    quellen: [Q.deeplPro, Q.deepl],
  },
];

/** Vorlagen, deren Suchbegriff im Namen steckt; erst ab drei Zeichen. */
export function passendeVorlagen(name: string): Vorlage[] {
  const gesucht = name.trim().toLocaleLowerCase('de-CH');
  if (gesucht.length < 3) return [];
  return VORLAGEN.filter((v) => v.suchbegriffe.some((begriff) => gesucht.includes(begriff) || begriff.startsWith(gesucht)));
}

/**
 * Trägt die Antworten einer Vorlage ein, aber nur, wo noch nichts steht:
 * Was jemand schon beantwortet hat, überschreibt keine Vorlage.
 */
export function wendeAn(antworten: Antworten, vorlage: Vorlage): Antworten {
  const neu = { ...antworten };
  const { anbieter, zugang, training, avv } = vorlage.antworten;
  if (anbieter !== undefined && neu.anbieter.trim() === '') neu.anbieter = anbieter;
  if (zugang !== undefined && neu.zugang === null) neu.zugang = zugang;
  if (training !== undefined && neu.training === null) neu.training = training;
  if (avv !== undefined && neu.avv === null) neu.avv = avv;
  return neu;
}
