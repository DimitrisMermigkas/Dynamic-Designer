import { useSelector } from "react-redux";

const translations = require("./DesignerTranslations.t.js");

type Language = "en" | "el";

// Pure function for translation logic
const translate = (key: string, language: Language = "en"): string => {
  // Split the key by dots to handle nested objects
  const k = key.split(".")[2];

  // Start with the translations object
  let current: any = translations;

  // Traverse the object using the keys

  if (current && typeof current === "object" && k in current) {
    current = current[k];
  } else {
    console.warn(`Translation key "${key}" not found`);
    return key; // Return the key if translation is not found
  }

  // If we found the translation object, return the language-specific value
  if (current && typeof current === "object" && language in current) {
    return current[language];
  }

  console.warn(`Language "${language}" not found for key "${key}"`);
  return key; // Return the key if language is not found
};

// Custom hook for translations
export const useTranslation = () => {
  const language = useSelector((state: any) => state.language) as Language;

  return {
    t: (key: string) => translate(key, language),
    language,
  };
};

// Example usage in a component:
// const MyComponent = () => {
//   const { t } = useTranslation();
//   return <div>{t('screens')}</div>;
// };

// Example usage:
// getTranslation('screens', 'en') // returns "Screens"
// getTranslation('screens', 'el') // returns "Οθόνες"
// getTranslation('newTemplateName', 'en') // returns "Enter screen name..."
