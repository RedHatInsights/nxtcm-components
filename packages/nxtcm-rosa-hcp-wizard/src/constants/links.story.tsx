/**
 * Playwright CT mount harness for the useGetDocsVersion hook.
 * Renders named documentation links so tests can check destinations and accessibility.
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
    <ul>
      {Object.entries(links).map(([key, url]) => (
        <li key={key}>
          <a href={url}>{key.replaceAll('_', ' ')}</a>
        </li>
      ))}
    </ul>
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
