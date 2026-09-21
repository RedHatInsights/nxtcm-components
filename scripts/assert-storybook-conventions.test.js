const fs = require('node:fs');
const path = require('node:path');
const { parseStorySource } = require('./storybook-convention-parser');

describe('Storybook convention parser fixtures', () => {
  it('parses valid inline export default meta', () => {
    const code = `
      export default {
        title: 'Components/Dashboard/Sample',
        tags: ['autodocs'],
      };
      export const Default = {};
    `;
    const parsed = parseStorySource(code);
    expect(parsed.title).toBe('Components/Dashboard/Sample');
    expect(parsed.tags).toEqual(['autodocs']);
    expect(parsed.hasDefaultExport).toBe(true);
  });

  it('parses const meta exported as default', () => {
    const code = `
      const meta = {
        title: 'Internal/Form Elements/TextInput',
        tags: ['autodocs', 'internal'],
      };
      export default meta;
      export const Default: Story = {};
      export const Another = {};
    `;
    const parsed = parseStorySource(code);
    expect(parsed.title).toBe('Internal/Form Elements/TextInput');
    expect(parsed.tags).toEqual(['autodocs', 'internal']);
    expect(parsed.hasDefaultExport).toBe(true);
  });

  it('detects re-exported Default', () => {
    const code = `
      const meta = {
        title: 'Components/Dashboard/LoadingPanel',
        tags: ['autodocs'],
      };
      export default meta;
      const Success = {};
      export { Success as Default };
    `;
    const parsed = parseStorySource(code);
    expect(parsed.hasDefaultExport).toBe(true);
  });

  it('parses non-TSX story formats (JavaScript / JSX / MJS)', () => {
    const jsCode = `
      const meta = {
        title: 'Components/Dashboard/JsWidget',
        tags: ['autodocs'],
      };
      export default meta;
      export const Default = {
        render: () => <div>JS Story</div>
      };
    `;
    const parsed = parseStorySource(jsCode);
    expect(parsed.title).toBe('Components/Dashboard/JsWidget');
    expect(parsed.tags).toEqual(['autodocs']);
    expect(parsed.hasDefaultExport).toBe(true);
  });

  it('throws when title is missing in meta', () => {
    const code = `
      const meta = {
        tags: ['autodocs'],
      };
      export default meta;
      export const Default = {};
    `;
    expect(() => parseStorySource(code)).toThrow('CSF meta is missing a title property');
  });

  it('throws when CSF meta object cannot be found', () => {
    const code = `
      export const Default = {};
    `;
    expect(() => parseStorySource(code)).toThrow('Could not find CSF meta object');
  });
});

describe('Storybook repository story convention contract (Layer B)', () => {
  const rootDir = path.resolve(__dirname, '..');

  const EXPECTED_PUBLIC_STORIES = {
    'packages/nxtcm-dashboard/src/Dashboard.stories.tsx': 'Components/Dashboard/Dashboard',
    'packages/nxtcm-dashboard/src/CostManagement/CostManagement.stories.tsx':
      'Components/Dashboard/CostManagement',
    'packages/nxtcm-dashboard/src/NotificationsPanel/NotificationsPanel.stories.tsx':
      'Components/Dashboard/NotificationsPanel',
    'packages/nxtcm-dashboard/src/StorageCard/StorageCard.stories.tsx':
      'Components/Dashboard/StorageCard',
    'packages/nxtcm-dashboard/src/CVECard/CVECard.stories.tsx': 'Components/Dashboard/CVECard',
    'packages/nxtcm-dashboard/src/UpgradeRisks/UpgradeRisks.stories.tsx':
      'Components/Dashboard/UpgradeRisks',
    'packages/nxtcm-dashboard/src/ClusterRecommendations/ClusterRecommendations.stories.tsx':
      'Components/Dashboard/ClusterRecommendations',
    'packages/nxtcm-dashboard/src/Subscriptions/Subscriptions.stories.tsx':
      'Components/Dashboard/Subscriptions',
    'packages/nxtcm-dashboard/src/LoadingPanel/LoadingPanel.stories.tsx':
      'Components/Dashboard/LoadingPanel',
    'packages/nxtcm-dashboard/src/TotalClusters/TotalClusters.stories.tsx':
      'Components/Dashboard/TotalClusters',
    'packages/nxtcm-dashboard/src/TotalClusters/ClusterProviders.stories.tsx':
      'Components/Dashboard/ClusterProviders',
    'packages/nxtcm-dashboard/src/Telemetry/Telemetry.stories.tsx':
      'Components/Dashboard/Telemetry',
    'packages/nxtcm-dashboard/src/UpdateStatus/UpdateStatus.stories.tsx':
      'Components/Dashboard/UpdateStatus',
    'packages/nxtcm-dashboard/src/ExpiredTrials/ExpiredTrials.stories.tsx':
      'Components/Dashboard/ExpiredTrials',
    'packages/nxtcm-dashboard/src/ResourceUtilization/ResourceUtilization.stories.tsx':
      'Components/Dashboard/ResourceUtilization',
    'packages/nxtcm-dashboard/src/AdvisorRecommendations/AdvisorSeverity.stories.tsx':
      'Components/Dashboard/AdvisorSeverity',
    'packages/nxtcm-dashboard/src/AdvisorRecommendations/AdvisorCategories.stories.tsx':
      'Components/Dashboard/AdvisorCategories',
    'packages/nxtcm-dashboard/src/ClustersWithIssues/ClustersWithIssues.stories.tsx':
      'Components/Dashboard/ClustersWithIssues',
    'packages/nxtcm-rosa-hcp-wizard/src/ROSAHCPWizard.stories.tsx': 'Wizards/RosaHCPWizard',
  };

  const allStoryFiles = fs
    .globSync('**/*.stories.{js,jsx,mjs,ts,tsx}', {
      cwd: rootDir,
      exclude: (p) =>
        p.includes('node_modules') || p.includes('dist') || p.includes('storybook-static'),
    })
    .map((p) => p.replace(/\\/g, '/'));

  it('ensures no stories exist outside packages/', () => {
    const invalidFiles = allStoryFiles.filter(
      (f) =>
        !f.startsWith('packages/nxtcm-dashboard/src/') &&
        !f.startsWith('packages/nxtcm-rosa-hcp-wizard/src/')
    );
    expect(invalidFiles).toEqual([]);
  });

  allStoryFiles.forEach((file) => {
    describe(`Story file: ${file}`, () => {
      const code = fs.readFileSync(path.resolve(rootDir, file), 'utf8');
      const meta = parseStorySource(code);

      it('includes autodocs tag', () => {
        expect(meta.tags).toContain('autodocs');
      });

      it('exports a Default story', () => {
        expect(meta.hasDefaultExport).toBe(true);
      });

      const isPublic = Boolean(EXPECTED_PUBLIC_STORIES[file]);

      if (isPublic) {
        it('is classified as public and matches expected public title without internal tag', () => {
          expect(meta.tags).not.toContain('internal');
          expect(meta.title).toBe(EXPECTED_PUBLIC_STORIES[file]);
        });
      } else {
        it('is classified as internal with internal tag and Internal/ title prefix', () => {
          expect(meta.tags).toContain('internal');
          expect(meta.title.startsWith('Internal/')).toBe(true);

          if (file.includes('/WizFields/')) {
            expect(meta.title.startsWith('Internal/Form Elements/Connected Form Elements/')).toBe(
              true
            );
          } else if (file.includes('/Fields/')) {
            expect(meta.title.startsWith('Internal/Form Elements/')).toBe(true);
          }
        });
      }
    });
  });
});
