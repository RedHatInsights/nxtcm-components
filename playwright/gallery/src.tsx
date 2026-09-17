import '@patternfly/react-core/dist/styles/base.css';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
import YamlWorker from 'monaco-yaml/yaml.worker.js?worker';
import React, { type ComponentType } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

type StoryProps = Record<string, unknown>;
type Story = ComponentType<StoryProps>;
type StoryModule = Record<string, unknown>;
type MountRequest = { story: string; props?: StoryProps };

const modules = import.meta.glob<StoryModule>('../../packages/*/src/**/*.story.tsx');
const stories = new Map<string, () => Promise<StoryModule>>();

for (const [modulePath, loadModule] of Object.entries(modules)) {
  const match = modulePath.match(/^\.\.\/\.\.\/packages\/([^/]+)\/src\/(.+)\.story\.tsx$/);
  if (!match) continue;
  const [, workspace, storyPath] = match;
  stories.set(`${workspace}/${storyPath}`, loadModule);
}

let root: Root | undefined;

function initializeStrykerActiveMutant(): void {
  const activeMutant = import.meta.env.STRYKER_ACTIVE_MUTANT as string | undefined;
  if (!activeMutant) return;
  const scope = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
    __stryker__?: { activeMutant?: string };
  };
  scope.process = scope.process ?? { env: {} };
  scope.process.env = scope.process.env ?? {};
  scope.process.env.__STRYKER_ACTIVE_MUTANT__ = activeMutant;
  scope.__stryker__ = scope.__stryker__ ?? {};
  scope.__stryker__.activeMutant = activeMutant;
}

window.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string): Worker {
    return label === 'yaml' ? new YamlWorker() : new EditorWorker();
  },
};
loader.config({ monaco });
initializeStrykerActiveMutant();

async function mount({ story, props = {} }: MountRequest): Promise<void> {
  const separator = story.lastIndexOf('/');
  if (separator < 1 || separator === story.length - 1) {
    throw new Error(`Invalid story ID "${story}". Expected <workspace>/<path>/<export>.`);
  }
  const moduleId = story.slice(0, separator);
  const exportName = story.slice(separator + 1);
  const loadModule = stories.get(moduleId);
  if (!loadModule) {
    throw new Error(`Unknown story ID "${story}" (module "${moduleId}" was not discovered).`);
  }
  const storyModule = await loadModule();
  const StoryExport = storyModule[exportName];
  if (typeof StoryExport !== 'function') {
    throw new Error(`Story "${story}" does not identify a component function export.`);
  }
  const container = document.querySelector<HTMLElement>('#root');
  if (!container) throw new Error('Gallery root element #root is missing.');
  root = root ?? createRoot(container);
  try {
    flushSync(() => root?.render(React.createElement(StoryExport as Story, props)));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to render story "${story}": ${message}`);
  }
}

async function unmount(): Promise<void> {
  root?.unmount();
  root = undefined;
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

Object.assign(window, { mount, unmount });

declare global {
  interface Window {
    MonacoEnvironment: { getWorker(moduleId: string, label: string): Worker };
    mount(request: MountRequest): Promise<void>;
    unmount(): Promise<void>;
  }
}
