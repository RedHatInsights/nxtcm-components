import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?url';
import yamlWorkerUrl from 'monaco-yaml/yaml.worker.js?url';

export function isMonacoWorkerEnvironmentConfigured(): boolean {
  return typeof window !== 'undefined' && typeof window.MonacoEnvironment?.getWorker === 'function';
}

export function setupMonacoEnvironmentIfNeeded(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const existingGetWorker = window.MonacoEnvironment?.getWorker;

  window.MonacoEnvironment = {
    ...window.MonacoEnvironment,
    getWorker(moduleId: string, label: string): Worker | Promise<Worker> {
      if (label === 'yaml') {
        return new Worker(yamlWorkerUrl, { type: 'module' });
      }
      if (typeof existingGetWorker === 'function') {
        return existingGetWorker.call(window.MonacoEnvironment, moduleId, label);
      }
      return new Worker(editorWorkerUrl, { type: 'module' });
    },
  };
}
