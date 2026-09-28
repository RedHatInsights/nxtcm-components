const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'assert-storybook-public.mjs');

const ALL_REQUIRED_TITLES = [
  'Components/Dashboard/AdvisorCategories',
  'Components/Dashboard/AdvisorSeverity',
  'Components/Dashboard/CVECard',
  'Components/Dashboard/ClusterProviders',
  'Components/Dashboard/ClusterRecommendations',
  'Components/Dashboard/ClustersWithIssues',
  'Components/Dashboard/CostManagement',
  'Components/Dashboard/Dashboard',
  'Components/Dashboard/ExpiredTrials',
  'Components/Dashboard/LoadingPanel',
  'Components/Dashboard/NotificationsPanel',
  'Components/Dashboard/ResourceUtilization',
  'Components/Dashboard/StorageCard',
  'Components/Dashboard/Subscriptions',
  'Components/Dashboard/Telemetry',
  'Components/Dashboard/TotalClusters',
  'Components/Dashboard/UpdateStatus',
  'Components/Dashboard/UpgradeRisks',
  'Wizards/RosaHCPWizard',
];

function createValidEntries() {
  const entries = {};
  ALL_REQUIRED_TITLES.forEach((title, idx) => {
    const id = `entry-${idx}`;
    entries[id] = {
      id,
      title,
      name: 'Default',
      type: 'story',
      tags: ['autodocs'],
    };
  });
  return entries;
}

function runAssertScript(indexContent, customDir) {
  const tempDir = customDir || fs.mkdtempSync(path.join(os.tmpdir(), 'assert-sb-public-'));
  const indexPath = path.join(tempDir, 'index.json');

  if (indexContent !== null) {
    if (typeof indexContent === 'string') {
      fs.writeFileSync(indexPath, indexContent, 'utf8');
    } else {
      fs.writeFileSync(indexPath, JSON.stringify(indexContent), 'utf8');
    }
  }

  let exitCode = 0;
  let stdout = '';
  let stderr = '';

  try {
    stdout = execFileSync(process.execPath, [SCRIPT_PATH, '--dir', tempDir], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err) {
    exitCode = err.status ?? 1;
    stdout = err.stdout?.toString() || '';
    stderr = err.stderr?.toString() || '';
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  return { exitCode, stdout, stderr };
}

describe('assert-storybook-public script (Layer C)', () => {
  it('exits 0 for valid public-only index with all required titles', () => {
    const validIndex = {
      v: 5,
      entries: createValidEntries(),
    };

    const result = runAssertScript(validIndex);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Storybook public assertion PASSED');
  });

  it('exits 0 when index contains internal stories alongside required titles', () => {
    const entries = createValidEntries();
    entries['internal-entry'] = {
      id: 'internal-textinput',
      title: 'Internal/Form Elements/TextInput',
      name: 'Default',
      type: 'story',
      tags: ['autodocs', 'internal'],
    };

    const result = runAssertScript({ v: 5, entries });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Storybook public assertion PASSED');
  });

  it('exits 1 when required public title Wizards/RosaHCPWizard is missing', () => {
    const entries = createValidEntries();
    const wizardKey = Object.keys(entries).find(
      (k) => entries[k].title === 'Wizards/RosaHCPWizard'
    );
    if (wizardKey) {
      delete entries[wizardKey];
    }

    const result = runAssertScript({ v: 5, entries });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Missing required public story title: "Wizards/RosaHCPWizard"');
  });

  it('exits 1 when index file is missing', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'assert-sb-missing-'));
    const result = runAssertScript(null, tempDir);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Storybook index not found');
  });
});
