import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import {
  isMonacoWorkerEnvironmentConfigured,
  setupMonacoEnvironmentIfNeeded,
} from './Steps/YamlEditor/monacoYamlSetup';

let configured = false;
let monacoYamlLanguageSupportEnabled = false;

/** Whether monaco-yaml hover/completion may be registered. */
export function isMonacoYamlLanguageSupportEnabled(): boolean {
  return monacoYamlLanguageSupportEnabled;
}

function isLikelyWebpackHostRuntime(): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  const hostWindow = globalThis.window as unknown as Record<string, unknown>;

  if (typeof hostWindow.__webpack_require__ === 'function') {
    return true;
  }

  // Webpack 5 uses names like webpackChunk<appName>, not webpackChunk.
  return Object.getOwnPropertyNames(hostWindow).some((key) => key.startsWith('webpackChunk'));
}

function isViteDevRuntime(): boolean {
  return typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
}

/** Configure Monaco for the ROSA HCP YAML editor. Safe to call multiple times. */
export function configureRosaHcpMonaco(): void {
  if (configured) {
    return;
  }

  loader?.config({ monaco });

  if (globalThis.window === undefined) {
    return;
  }

  // monaco-yaml only works with a dedicated yaml worker; enable in Vite dev only.
  monacoYamlLanguageSupportEnabled = !isLikelyWebpackHostRuntime() && isViteDevRuntime();

  if (monacoYamlLanguageSupportEnabled) {
    setupMonacoEnvironmentIfNeeded();
    if (!isMonacoWorkerEnvironmentConfigured()) {
      return;
    }
  }

  configured = true;
}
