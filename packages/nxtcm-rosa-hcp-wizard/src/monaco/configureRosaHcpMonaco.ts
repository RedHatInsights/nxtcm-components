import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

let configured = false;

/**
 * Point PatternFly CodeEditor at the host's bundled Monaco (avoids CDN duplicate).
 * Call once before the ROSA HCP YAML editor mounts (e.g. when rendering RosaHCPWizard with `yaml`).
 */
export function configureRosaHcpMonaco(): void {
  if (configured || !loader) {
    return;
  }
  loader.config({ monaco });
  configured = true;
}
