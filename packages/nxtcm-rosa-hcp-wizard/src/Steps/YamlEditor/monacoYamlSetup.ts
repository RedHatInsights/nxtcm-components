import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?url';
import yamlWorkerUrl from 'monaco-yaml/yaml.worker.js?url';

export function setupMonacoEnvironmentIfNeeded(): void {
  if (typeof window === 'undefined' || typeof window.MonacoEnvironment?.getWorker === 'function') {
    return;
  }

  window.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string): Worker {
      if (label === 'yaml') {
        return new Worker(yamlWorkerUrl, { type: 'module' });
      }
      return new Worker(editorWorkerUrl, { type: 'module' });
    },
  };
}
