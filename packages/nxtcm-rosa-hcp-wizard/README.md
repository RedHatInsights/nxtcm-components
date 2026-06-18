# @redhat-cloud-services/nxtcm-rosa-hcp-wizard

PatternFly wizard for ROSA HCP cluster creation in ACM and OCM.

## YAML editor

Pass `yaml` on `RosaHCPWizard` to enable **Edit in YAML** on the Review step and the YAML editor flow.

```tsx
<RosaHCPWizard yaml onSubmit={...} onCancel={...} wizardData={...} />
```

## Host integration: `configureRosaHcpMonaco`

The YAML step uses PatternFly `CodeEditor`, which wraps `@monaco-editor/react`. By default that loader fetches Monaco from a **CDN** (jsDelivr). Host apps like ACM already bundle `monaco-editor` via webpack (often a **different version**). Two Monaco instances at runtime causes worker failures, console errors (`Script error.`, `Unexpected usage`), and a broken editor.

Call the exported helper **once before the YAML editor can mount** so PatternFly uses the host’s bundled Monaco instead of the CDN copy:

```tsx
import { useEffect } from 'react';
import {
  RosaHCPWizard,
  configureRosaHcpMonaco,
} from '@redhat-cloud-services/nxtcm-rosa-hcp-wizard';

export function RosaHCPWizardPage() {
  useEffect(() => {
    configureRosaHcpMonaco();
  }, []);

  return (
    <RosaHCPWizard
      yaml
      title="Create ROSA HCP cluster"
      onSubmit={async (data) => {
        /* create cluster */
      }}
      onCancel={() => {
        /* navigate away */
      }}
      wizardData={{
        /* fetch hooks, validation, etc. */
      }}
    />
  );
}
```

Import from the published **`dist`** entry in production. Call `configureRosaHcpMonaco()` on every route that renders `RosaHCPWizard` with `yaml`.

## Peer dependencies

The host must provide (already satisfied in ACM today):

| Package | Purpose |
| --- | --- |
| `monaco-editor` | `^0.34.1` — bundled by the host |
| `@monaco-editor/react` | `^4.6.0` — used by PatternFly CodeEditor and `configureRosaHcpMonaco` |
| `@patternfly/react-code-editor` | `^6.4.0` — YAML step `CodeEditor` (host provides; matches ACM) |

`monaco-yaml` is **not** shipped in the wizard bundle; it is optional and only loaded in Storybook/Vite dev for schema completion/hover. YAML validation in the wizard uses Ajv and works without it.

## Local development (linked checkout)

When developing against a sibling `nxtcm-components` checkout, the host needs a TypeScript path alias **and** a webpack `resolve.alias` for `@redhat-cloud-services/nxtcm-rosa-hcp-wizard`. Rebuild the wizard after changes:

```bash
npm run build -w @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```
