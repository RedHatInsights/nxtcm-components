import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-charts.css';
import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?url';
import yamlWorkerUrl from 'monaco-yaml/yaml.worker.js?url';

import { applyRosaHcpMonacoYamlDiagnostics } from '../packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/RosaHcpYamlMonacoLoader';

window.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string): Worker {
    if (label === 'yaml') {
      return new Worker(yamlWorkerUrl, { type: 'module' });
    }
    return new Worker(editorWorkerUrl, { type: 'module' });
  },
};

void applyRosaHcpMonacoYamlDiagnostics();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'pf-v6-theme-dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
  ],
};

export default preview;
