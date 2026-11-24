/**
 * LAYER    shared/i18n
 * ROLE     i18next setup: every user-facing string lives in locales/<lang>/<namespace>.json (one namespace
 *          per feature + common). Components render t(key); keys come from their .data.json files.
 * RULES    A key exists in EVERY locale. The detected language is not persisted (no storage writes).
 *          Add a namespace here when a feature adds its locale files.
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { env } from '../lib/env';
import enCommon from './locales/en/common.json';
import enHello from './locales/en/hello.json';
import enProfile from './locales/en/profile.json';
import enServerStatus from './locales/en/serverStatus.json';
import frCommon from './locales/fr/common.json';
import frHello from './locales/fr/hello.json';
import frProfile from './locales/fr/profile.json';
import frServerStatus from './locales/fr/serverStatus.json';

export const resources = {
  en: { common: enCommon, hello: enHello, profile: enProfile, serverStatus: enServerStatus },
  fr: { common: frCommon, hello: frHello, profile: frProfile, serverStatus: frServerStatus },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'fr'],
    fallbackLng: env.defaultLocale,
    ns: ['common', 'hello', 'serverStatus', 'profile'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: { order: ['querystring', 'navigator'], caches: [] },
  });

export { i18n };
