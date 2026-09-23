import { loader } from '@monaco-editor/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
import YamlWorker from 'monaco-yaml/yaml.worker.js?worker';

import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-charts.css';

window.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string): Worker {
    if (label === 'yaml') {
      return new YamlWorker();
    }
    return new EditorWorker();
  },
};
loader.config({ monaco });

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
