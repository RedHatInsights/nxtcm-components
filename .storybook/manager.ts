import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

interface StorybookMetadata {
  deploymentType: string;
  dashboardVersion: string;
  wizardVersion: string;
}

const metadata: StorybookMetadata = (
  window as unknown as { __STORYBOOK_METADATA__?: StorybookMetadata }
).__STORYBOOK_METADATA__ || { deploymentType: '', dashboardVersion: '', wizardVersion: '' };

function buildTitle(): string {
  let title = 'nxtcm-components';

  if (metadata.deploymentType === 'preview') {
    title += ' [Unreleased]';
  }

  const versions: string[] = [];
  if (metadata.dashboardVersion) versions.push(`Dashboard ${metadata.dashboardVersion}`);
  if (metadata.wizardVersion) versions.push(`Wizard ${metadata.wizardVersion}`);
  if (versions.length > 0) {
    title += `\n${versions.join(' · ')}`;
  }

  return title;
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

addons.setConfig({
  theme: create({
    base: prefersDark ? 'dark' : 'light',
    brandTitle: buildTitle(),
  }),
});

if (metadata.deploymentType === 'preview') {
  document.documentElement.classList.add('preview-banner-active');

  const banner = document.createElement('div');
  banner.setAttribute('data-testid', 'preview-banner');
  banner.textContent =
    '\u26A0 You are viewing unreleased documentation. Released docs are at the site root.';
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    zIndex: '9999',
    background: '#f0ab00',
    color: '#151515',
    textAlign: 'center',
    padding: '4px 12px',
    fontSize: '13px',
    fontFamily: 'RedHatText, Overpass, sans-serif',
  });
  document.body.prepend(banner);

  // Set CSS variable so the manager offset matches the actual banner height
  requestAnimationFrame(() => {
    const h = banner.offsetHeight;
    document.documentElement.style.setProperty('--preview-banner-height', `${h}px`);
  });
}
