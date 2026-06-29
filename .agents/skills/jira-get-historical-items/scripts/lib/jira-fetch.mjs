import { jiraAuthHeaders } from './jira-auth.mjs';

const DEFAULT_FIELDS = ['summary', 'description', 'status', 'resolution', 'issuetype', 'created'];

/**
 * @param {Response} res
 * @param {string} context
 */
async function readJsonOrThrow(res, context) {
  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.errorMessages?.join('; ') || parsed.message || text;
    } catch {
      // keep raw text
    }
    throw new Error(`${context}: HTTP ${res.status} — ${detail}`);
  }
  return text ? JSON.parse(text) : null;
}

/**
 * @param {object} auth
 * @param {string} jql
 * @param {string[]} fields
 * @param {number} [maxResults]
 */
export async function searchIssueKeys(auth, jql, fields, maxResults = 100) {
  const keys = [];
  const pageSize = Math.min(maxResults, 100);
  let nextPageToken;

  while (keys.length < maxResults) {
    const remaining = maxResults - keys.length;
    const limit = Math.min(pageSize, remaining);

    const body = {
      jql,
      maxResults: limit,
      fields,
    };
    if (nextPageToken) {
      body.nextPageToken = nextPageToken;
    }

    const res = await fetch(`${auth.baseUrl}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: jiraAuthHeaders(auth),
      body: JSON.stringify(body),
    });

    const data = await readJsonOrThrow(res, 'JQL search');
    const issues = data.issues ?? [];

    for (const issue of issues) {
      if (issue.key) keys.push(issue.key);
    }

    if (issues.length === 0 || keys.length >= maxResults) {
      break;
    }

    nextPageToken = data.nextPageToken;
    if (!nextPageToken) break;
  }

  return keys;
}

/**
 * @param {object} auth
 * @param {string} issueKey
 */
async function fetchChangelogPage(auth, issueKey, startAt, maxResults = 100) {
  const url = new URL(`${auth.baseUrl}/rest/api/3/issue/${issueKey}/changelog`);
  url.searchParams.set('startAt', String(startAt));
  url.searchParams.set('maxResults', String(maxResults));

  const res = await fetch(url, { headers: jiraAuthHeaders(auth) });
  return readJsonOrThrow(res, `changelog for ${issueKey}`);
}

/**
 * @param {object} auth
 * @param {string} issueKey
 */
async function fetchFullChangelog(auth, issueKey) {
  const first = await fetchChangelogPage(auth, issueKey, 0);
  const histories = [...(first.values ?? [])];
  const total = first.total ?? histories.length;

  for (let startAt = histories.length; startAt < total; startAt += first.maxResults ?? 100) {
    const page = await fetchChangelogPage(auth, issueKey, startAt);
    histories.push(...(page.values ?? []));
  }

  return {
    startAt: 0,
    maxResults: histories.length,
    total,
    histories,
  };
}

/**
 * @param {object} auth
 * @param {string} issueKey
 * @param {string[]} fields
 */
export async function fetchIssueWithChangelog(auth, issueKey, fields) {
  const url = new URL(`${auth.baseUrl}/rest/api/3/issue/${issueKey}`);
  url.searchParams.set('expand', 'changelog');
  url.searchParams.set('fields', fields.join(','));

  const res = await fetch(url, { headers: jiraAuthHeaders(auth) });
  const issue = await readJsonOrThrow(res, `issue ${issueKey}`);

  const expanded = issue.changelog;
  const needsMore =
    expanded &&
    typeof expanded.total === 'number' &&
    Array.isArray(expanded.histories) &&
    expanded.total > expanded.histories.length;

  if (needsMore || !expanded?.histories?.length) {
    issue.changelog = await fetchFullChangelog(auth, issueKey);
  }

  return {
    key: issue.key,
    fields: issue.fields,
    changelog: issue.changelog,
  };
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T, index: number) => Promise<unknown>} fn
 */
export async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export function buildFieldList(storyPointsField) {
  return [...DEFAULT_FIELDS, storyPointsField];
}
