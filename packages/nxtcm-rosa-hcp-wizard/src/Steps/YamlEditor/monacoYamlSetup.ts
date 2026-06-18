function hostProvidesMonacoWorkers(): boolean {
  const env = window.MonacoEnvironment;
  return typeof env?.getWorker === 'function' || typeof env?.getWorkerUrl === 'function';
}

let setupPromise: Promise<void> | null = null;

export function setupMonacoEnvironmentIfNeeded(): Promise<void> {
  if (typeof window === 'undefined' || hostProvidesMonacoWorkers()) {
    return Promise.resolve();
  }

  if (setupPromise) {
    return setupPromise;
  }

  // Dynamic imports only for Vite/Storybook — avoid pulling monaco-yaml into webpack hosts.
  setupPromise = (async () => {
    const [{ default: editorWorkerUrl }, { default: yamlWorkerUrl }] = await Promise.all([
      import('monaco-editor/esm/vs/editor/editor.worker.js?url'),
      import('monaco-yaml/yaml.worker.js?url'),
    ]);

    window.MonacoEnvironment = {
      getWorker(_moduleId: string, label: string): Worker {
        if (label === 'yaml') {
          return new Worker(yamlWorkerUrl, { type: 'module' });
        }
        return new Worker(editorWorkerUrl, { type: 'module' });
      },
    };
  })();

  return setupPromise;
}
