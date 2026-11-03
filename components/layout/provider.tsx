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
    getServerLanguage,
  );
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider
      value={{
        language,
        t: language === "en" ? en : ta,
        toggle: () => {
          if (typeof window === "undefined") return;
          fallbackLanguage = language === "en" ? "ta" : "en";
          try {
            window.localStorage.setItem("svg-language", fallbackLanguage);
          } catch {
            // Keep switching available when browser storage is blocked.
          }
          window.dispatchEvent(new Event("svg-language"));
        },
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
let fallbackLanguage: "en" | "ta" = "en";
function getServerLanguage(): "en" | "ta" {
  return "en";
}
function getLanguage(): "en" | "ta" {
  if (typeof window === "undefined") return getServerLanguage();
  try {
    fallbackLanguage = window.localStorage.getItem("svg-language") === "ta" ? "ta" : "en";
  } catch {
    // Use the in-memory selection when storage is unavailable.
  }
  return fallbackLanguage;
}
function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("svg-language", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("svg-language", callback);
  };
}
