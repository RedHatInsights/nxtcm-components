#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads the version field from a workspace package.json.
 * Returns null if the file cannot be read.
 */
function readPackageVersion(rootDir, packageDir) {
  try {
    const raw = fs.readFileSync(path.join(rootDir, packageDir, 'package.json'), 'utf8');
    return JSON.parse(raw).version ?? null;
  } catch {
    return null;
  }
}

/**
 * Builds a metadata object from the current environment and workspace versions.
 * Exported for testing.
 */
export function buildMetadata(rootDir = process.cwd(), env = process.env) {
  return {
    deploymentType: env.STORYBOOK_DEPLOYMENT_TYPE || 'local',
    dashboardVersion: readPackageVersion(rootDir, 'packages/nxtcm-dashboard') || 'unknown',
    wizardVersion: readPackageVersion(rootDir, 'packages/nxtcm-rosa-hcp-wizard') || 'unknown',
    commitSha: env.STORYBOOK_COMMIT_SHA || '',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Writes metadata JSON to the target directory.
 * Returns the written file path.
 */
export function writeMetadata(outDir, metadata) {
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'storybook-metadata.json');
  fs.writeFileSync(outPath, JSON.stringify(metadata, null, 2) + '\n');
  return outPath;
}

// Direct execution
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('write-storybook-metadata.mjs') ||
    process.argv[1].endsWith('write-storybook-metadata'));

if (isDirectExecution) {
  const outDir = process.argv[2] || 'storybook-static';
  const metadata = buildMetadata();
  const outPath = writeMetadata(outDir, metadata);
  console.log(`Wrote ${outPath}`);
  console.log(JSON.stringify(metadata, null, 2));
}
