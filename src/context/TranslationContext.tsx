import React from 'react';

/**
 * Translation function type that takes a string key and returns a translated string.
 * The key is typically the English text that serves as both the default and the lookup key.
 */
export type TranslationFunction = (key: string) => string;

const defaultTranslate: TranslationFunction = (key: string) => key;

const TranslationContext = React.createContext<TranslationFunction>(defaultTranslate);

export interface TranslationProviderProps {
  /**
   * Optional translation function. If not provided, defaults to identity function
   * that returns the key (English text) as-is.
   */
  translate?: TranslationFunction;
  children: React.ReactNode;
}

/**
 * Provider component that makes translation function available to all child components.
 *
 * @example
 * ```tsx
 * <TranslationProvider translate={(key) => myI18n.t(key)}>
 *   <App />
 * </TranslationProvider>
 * ```
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  translate,
  children,
}) => {
  const translationFunction = translate || defaultTranslate;

  return (
    <TranslationContext.Provider value={translationFunction}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const t = React.useContext(TranslationContext);
  return { t };
};
