/**
 * @company GIVC
 * @author Engr. Sahar AlHaddad <saharalhaddad2011@gmail.com>
 * @created 2025-05-25
 * @modified 
 */

import React, { createContext, useState, useContext } from 'react';
//import { Language } from '../types/Language';

//type Language = 'en' | 'ar';

const LanguageContext = createContext<{
  language: string;
  setLanguage: (lang: string) => void;
}>({
  language: sessionStorage.getItem("lang") || "en",
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>(sessionStorage.getItem("lang") || "en");
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);