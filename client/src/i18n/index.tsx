import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import en, { type Translations } from './en';
import fr from './fr';
import ar from './ar';

type Locale = 'en' | 'fr' | 'ar';

const LOCALES: Record<Locale, Translations> = { en: en as Translations, fr: fr as Translations, ar: ar as Translations };

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType>({ locale: 'en', t: en, setLocale: () => {}, isRTL: false });

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(
    () => (localStorage.getItem('locale') as Locale) || 'en'
  );

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  };

  const isRTL = locale === 'ar';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
  }, [locale, isRTL]);

  return (
    <I18nContext.Provider value={{ locale, t: LOCALES[locale], setLocale, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
