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
