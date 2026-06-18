function hostProvidesMonacoWorkers(): boolean {
  const env = window.MonacoEnvironment;
  return typeof env?.getWorker === 'function' || typeof env?.getWorkerUrl === 'function';
}

export function setupMonacoEnvironmentIfNeeded(): void {
  if (typeof window === 'undefined' || hostProvidesMonacoWorkers()) {
    return;
  }

  // Dynamic imports only for Vite/Storybook — avoid pulling monaco-yaml into webpack hosts.
  void (async () => {
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
}
