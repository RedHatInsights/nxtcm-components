import { existsSync } from 'fs';
import { dirname, isAbsolute, resolve } from 'path';

export function resolvePath(pathValue, baseDir = process.cwd()) {
  if (!pathValue) {
    throw new Error('Missing required path argument');
  }
  return isAbsolute(pathValue) ? pathValue : resolve(baseDir, pathValue);
}

export function resolveInputPath(pathValue, baseDir = process.cwd()) {
  const resolved = resolvePath(pathValue, baseDir);
  if (!existsSync(resolved)) {
    throw new Error(`Input file not found: ${resolved}`);
  }
  return resolved;
}

export function defaultWorkspaceDir(inputPath) {
  return dirname(resolvePath(inputPath));
}
