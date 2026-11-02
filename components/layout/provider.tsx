"use client";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { en, type Dictionary } from "@/lib/i18n/en";
import { ta } from "@/lib/i18n/ta";
const LanguageContext = createContext<{
  language: "en" | "ta";
  t: Dictionary;
  toggle: () => void;
}>({ language: "en", t: en, toggle: () => {} });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getLanguage,
    () => "en" as const,
  );
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider
      value={{
        language,
        t: language === "en" ? en : ta,
        toggle: () => {
          localStorage.setItem("svg-language", language === "en" ? "ta" : "en");
          window.dispatchEvent(new Event("svg-language"));
        },
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
function getLanguage(): "en" | "ta" {
  return localStorage.getItem("svg-language") === "ta" ? "ta" : "en";
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("svg-language", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("svg-language", callback);
  };
}
