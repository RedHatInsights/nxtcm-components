/**
 * Playwright CT mount harness for the useGetDocsVersion hook.
 * Renders each link key into a data-testid span so tests can assert resolved URLs.
 */
import React from 'react';

import { DocsVersionProvider } from '../ROSAHCPWizardDocsVersionProvider';
import { useGetDocsVersion } from './links';

export interface UseGetDocsVersionMountProps {
  /** Cluster version string passed to useGetDocsVersion (e.g. '4.16.2', '5.1.0'). */
  clusterVersion?: string;
  /** Published docs majors supplied to DocsVersionProvider. */
  docsVersions?: string[];
}

/** Inner component that calls the hook inside the DocsVersionProvider tree. */
const LinksRenderer: React.FC<{ clusterVersion?: string }> = ({ clusterVersion }) => {
  const links = useGetDocsVersion(clusterVersion);

  return (
    <div>
      {Object.entries(links).map(([key, url]) => (
        <span key={key} data-testid={key}>
          {url}
        </span>
      ))}
    </div>
  );
};

export const UseGetDocsVersionMount: React.FC<UseGetDocsVersionMountProps> = ({
  clusterVersion,
  docsVersions,
}) => (
  <DocsVersionProvider docsVersions={docsVersions}>
    <LinksRenderer clusterVersion={clusterVersion} />
  </DocsVersionProvider>
);
