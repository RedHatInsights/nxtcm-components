import { readFileSync } from 'fs';

/**
 * @param {string | number | import('fs').PathLike} path
 * @param {{ label?: string }} [options]
 */
export function readJsonFile(path, { label = String(path) } = {}) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read input file: ${label} — ${message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON in input file: ${label} — ${message}`);
  }
}
