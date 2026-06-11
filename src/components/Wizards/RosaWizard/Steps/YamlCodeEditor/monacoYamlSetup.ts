import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?url';
import yamlWorkerUrl from 'monaco-yaml/yaml.worker.js?url';

loader.config({ monaco });

export function setupMonacoEnvironment(): void {
  if (typeof window === 'undefined') return;
  window.MonacoEnvironment = {
    getWorker: (_: string, label: string) =>
      new Worker(label === 'yaml' ? yamlWorkerUrl : editorWorkerUrl, { type: 'module' }),
  };
}
