// Import styles, initialize component theme here.
import '@patternfly/react-core/dist/styles/base.css';

/**
 * Stryker sets __STRYKER_ACTIVE_MUTANT__ in Node when using the command runner.
 * Playwright CT executes components in the browser, so we mirror that env into
 * globalThis before any instrumented module loads (see playwright-ct.config.ts define).
 */
function initializeStrykerActiveMutant(): void {
  const activeMutant = import.meta.env.STRYKER_ACTIVE_MUTANT as string | undefined;

  if (!activeMutant) {
    return;
  }

  const globalScope = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
    __stryker__?: { activeMutant?: string };
  };

  globalScope.process = globalScope.process ?? { env: {} };
  globalScope.process.env = globalScope.process.env ?? {};
  globalScope.process.env.__STRYKER_ACTIVE_MUTANT__ = activeMutant;
  globalScope.__stryker__ = globalScope.__stryker__ ?? {};
  globalScope.__stryker__.activeMutant = activeMutant;
}

initializeStrykerActiveMutant();
