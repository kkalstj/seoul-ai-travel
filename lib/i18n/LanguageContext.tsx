'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, Locale } from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

var LanguageContext = createContext<LanguageContextType>({
  locale: 'ko',
  setLocale: function() {},
  t: function(key: string) { return key; },
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  var [locale, setLocaleState] = useState<Locale>('ko');

  useEffect(function() {
    var saved = localStorage.getItem('locale') as Locale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }

  function t(key: string): string {
    return translations[locale][key] || translations['ko'][key] || key;
  }

  return (
    <LanguageContext.Provider value={{ locale: locale, setLocale: setLocale, t: t }}>
      {children}
    </LanguageContext.Provider>
  );
}
