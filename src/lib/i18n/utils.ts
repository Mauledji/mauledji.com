import { en } from './en';
import { es } from './es';

export const languages = { en, es } as const;
export type Language = keyof typeof languages;
export type Translations = typeof en;

// Tipo que valida estructura sin comparar valores literales
type DeepString<T> =
  T extends string ? string :
  T extends readonly (infer U)[] ? DeepString<U>[] :
  T extends object ? { [K in keyof T]: DeepString<T[K]> } :
  T;

export type TranslationShape = DeepString<typeof en>;

export function getLang(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang === 'es') return 'es';
  return 'en';
}

export function t(lang: Language): Translations {
  return languages[lang] as unknown as Translations;
}
