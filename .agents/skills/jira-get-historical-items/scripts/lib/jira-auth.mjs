/**
 * Jira REST auth: CLI flags → env vars → optional env file.
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';
import { JIRA_SITE } from './constants.mjs';

const SITE_ENV_KEYS = ['JIRA_SITE', 'ATLASSIAN_SITE'];
const EMAIL_ENV_KEYS = ['JIRA_EMAIL', 'ATLASSIAN_EMAIL'];
const TOKEN_ENV_KEYS = ['JIRA_API_TOKEN', 'ATLASSIAN_API_TOKEN', 'JIRA_TOKEN'];

function expandHome(pathValue) {
  if (!pathValue) return pathValue;
  return pathValue.startsWith('~/') ? resolve(homedir(), pathValue.slice(2)) : pathValue;
}

function firstEnv(keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

/**
 * @param {string} pathValue
 */
function loadEnvFile(pathValue) {
  const resolved = resolve(expandHome(pathValue));
  if (!existsSync(resolved)) {
    throw new Error(`Env file not found: ${resolved}`);
  }

  const vars = {};
  for (const line of readFileSync(resolved, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function pickFromMap(map, keys) {
  for (const key of keys) {
    const value = map[key]?.trim();
    if (value) return value;
  }
  return '';
}

/**
 * @param {{
 *   site?: string,
 *   email?: string,
 *   token?: string,
 *   envFile?: string,
 * }} options
 * @returns {{ site: string, email: string, token: string, baseUrl: string }}
 */
export function resolveJiraAuth(options = {}) {
  const fromEnvFile = options.envFile ? loadEnvFile(options.envFile) : {};

  const site =
    options.site?.trim() ||
    firstEnv(SITE_ENV_KEYS) ||
    pickFromMap(fromEnvFile, SITE_ENV_KEYS) ||
    JIRA_SITE;

  const email =
    options.email?.trim() || firstEnv(EMAIL_ENV_KEYS) || pickFromMap(fromEnvFile, EMAIL_ENV_KEYS);

  const token =
    options.token?.trim() || firstEnv(TOKEN_ENV_KEYS) || pickFromMap(fromEnvFile, TOKEN_ENV_KEYS);

  const normalizedSite = site.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!email || !token) {
    throw new Error(
      'Missing Jira API credentials.\n' +
        'Provide credentials using one of:\n' +
        '  • --env-file ~/.config/jira-fetch.env\n' +
        '  • export JIRA_EMAIL and JIRA_API_TOKEN\n' +
        'See jira-get-historical-items/CLI.md (First-time setup)'
    );
  }

  return {
    site: normalizedSite,
    email,
    token,
    baseUrl: `https://${normalizedSite}`,
  };
}

/**
 * @param {{ email: string, token: string }} auth
 */
export function jiraAuthHeaders(auth) {
  const encoded = Buffer.from(`${auth.email}:${auth.token}`).toString('base64');
  return {
    Authorization: `Basic ${encoded}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}
