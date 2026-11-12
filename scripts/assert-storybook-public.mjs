#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

export const REQUIRED_PUBLIC_TITLES = [
  'Components/Dashboard/AdvisorCategories',
  'Components/Dashboard/AdvisorSeverity',
  'Components/Dashboard/CVECard',
  'Components/Dashboard/ClusterProviders',
  'Components/Dashboard/ClusterRecommendations',
  'Components/Dashboard/ClustersWithIssues',
  'Components/Dashboard/CostManagement',
  'Components/Dashboard/Dashboard',
  'Components/Dashboard/ExpiredTrials',
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

export function validateStorybookIndex(indexData) {
  const errors = [];

  if (!indexData || typeof indexData !== 'object' || !indexData.entries) {
    errors.push('Invalid Storybook index format: missing "entries" object');
    return { valid: false, errors };
  }

  const entries = Object.values(indexData.entries);
  const foundTitles = new Set();

  for (const entry of entries) {
    if (entry.title) {
      foundTitles.add(entry.title);
    }
  }

  for (const requiredTitle of REQUIRED_PUBLIC_TITLES) {
    if (!foundTitles.has(requiredTitle)) {
      errors.push(`Missing required public story title: "${requiredTitle}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    totalEntries: entries.length,
    publicTitlesCount: foundTitles.size,
  };
}

const VALID_DEPLOYMENT_TYPES = ['release', 'preview', 'local'];

export function validateMetadata(metadata) {
  const errors = [];

  if (!metadata || typeof metadata !== 'object') {
    errors.push('Invalid metadata: not an object');
    return { valid: false, errors };
  }

  if (!VALID_DEPLOYMENT_TYPES.includes(metadata.deploymentType)) {
    errors.push(
      `Invalid deploymentType: "${metadata.deploymentType}" (expected one of: ${VALID_DEPLOYMENT_TYPES.join(', ')})`
    );
  }

  if (!metadata.dashboardVersion || metadata.dashboardVersion === 'unknown') {
    errors.push('Missing or unknown dashboardVersion');
  }

  if (!metadata.wizardVersion || metadata.wizardVersion === 'unknown') {
    errors.push('Missing or unknown wizardVersion');
  }

  if (!metadata.timestamp) {
    errors.push('Missing timestamp');
  }

  return { valid: errors.length === 0, errors };
}

export function validateCombinedSite(siteDir) {
  const errors = [];
  const requiredFiles = [
    'index.html',
    'index.json',
    'storybook-metadata.json',
    'next/index.html',
    'next/index.json',
    'next/storybook-metadata.json',
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(siteDir, file))) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate root metadata is release type
  try {
    const rootMeta = JSON.parse(
      fs.readFileSync(path.join(siteDir, 'storybook-metadata.json'), 'utf8')
    );
    if (rootMeta.deploymentType !== 'release' && rootMeta.deploymentType !== 'local') {
      errors.push(
        `Root metadata deploymentType should be "release" or "local", got "${rootMeta.deploymentType}"`
      );
    }
  } catch (err) {
    errors.push(`Failed to parse root storybook-metadata.json: ${err.message}`);
  }

  // Validate next metadata is preview type
  try {
    const nextMeta = JSON.parse(
      fs.readFileSync(path.join(siteDir, 'next', 'storybook-metadata.json'), 'utf8')
    );
    if (nextMeta.deploymentType !== 'preview') {
      errors.push(
        `Preview metadata deploymentType should be "preview", got "${nextMeta.deploymentType}"`
      );
    }
  } catch (err) {
    errors.push(`Failed to parse next/storybook-metadata.json: ${err.message}`);
  }

  // Validate both index.json files have required stories
  try {
    const rootIndex = JSON.parse(fs.readFileSync(path.join(siteDir, 'index.json'), 'utf8'));
    const rootResult = validateStorybookIndex(rootIndex);
    if (!rootResult.valid) {
      errors.push(...rootResult.errors.map((e) => `Root: ${e}`));
    }
  } catch (err) {
    errors.push(`Failed to parse root index.json: ${err.message}`);
  }

  try {
    const nextIndex = JSON.parse(fs.readFileSync(path.join(siteDir, 'next', 'index.json'), 'utf8'));
    const nextResult = validateStorybookIndex(nextIndex);
    if (!nextResult.valid) {
      errors.push(...nextResult.errors.map((e) => `Preview: ${e}`));
    }
  } catch (err) {
    errors.push(`Failed to parse next/index.json: ${err.message}`);
  }

  return { valid: errors.length === 0, errors };
}

export function runAssert(targetDir = 'storybook-static') {
  const indexPath = path.resolve(process.cwd(), targetDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    console.error(`Error: Storybook index not found at ${indexPath}`);
    process.exit(1);
  }

  let indexData;
  try {
    const raw = fs.readFileSync(indexPath, 'utf8');
    indexData = JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading or parsing ${indexPath}: ${err.message}`);
    process.exit(1);
  }

  const result = validateStorybookIndex(indexData);

  if (!result.valid) {
    console.error(`Storybook public assertion FAILED with ${result.errors.length} error(s):`);
    result.errors.forEach((err) => console.error(` - ${err}`));
    process.exit(1);
  }

  console.log(
    `Storybook public assertion PASSED (${result.totalEntries} entries across ${result.publicTitlesCount} titles). All required public stories present.`
  );
}

const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('assert-storybook-public.mjs') ||
    process.argv[1].endsWith('assert-storybook-public'));

if (isDirectExecution) {
  const dirArgIndex = process.argv.indexOf('--dir');
  const targetDir =
    dirArgIndex !== -1 && process.argv[dirArgIndex + 1]
      ? process.argv[dirArgIndex + 1]
      : 'storybook-static';
  runAssert(targetDir);
}
