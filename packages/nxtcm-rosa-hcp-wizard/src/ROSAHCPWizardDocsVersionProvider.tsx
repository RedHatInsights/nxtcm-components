import { createContext, useContext } from 'react';

export const DocsVersionContext = createContext<string[] | undefined>([]);

interface WizardDocsVersionProviderProps {
  docsVersions?: string[];
  children: React.ReactNode;
}

export const DocsVersionProvider = ({ docsVersions, children }: WizardDocsVersionProviderProps) => (
  <DocsVersionContext.Provider value={docsVersions}>{children}</DocsVersionContext.Provider>
);

export const useDocsVersions = (): string[] => useContext(DocsVersionContext) ?? [];
