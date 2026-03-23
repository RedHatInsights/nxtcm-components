# ROSA HCP Wizard Integration Quick-Start

Use this page as a quick integration checklist. Detailed typed contract examples live in Storybook and compile-checked example files so they stay aligned with code.

## Use These as Source of Truth

- Typed Storybook contract example:
  - `src/components/Wizards/RosaWizard/RosaWizardIntegrationContract.stories.tsx`
- Compile-only typed integration example:
  - `src/examples/rosaWizardIntegration.example.tsx`
- Exported types and public API surface:
  - `src/components/Wizards/index.ts`
  - `src/components/Wizards/types.ts`

## Minimal Integration Shape

`WizardWrapper` types `onSubmit` as `(data: RosaWizardFormData) => Promise<void>` (not `unknown`). The prop name is `wizardsStepsData` (matches `RosaWizard`).

```tsx
import { WizardWrapper } from 'nxtcm-components';
import type { RosaWizardFormData, WizardStepsData } from 'nxtcm-components';

function CreateRosaHcpCluster() {
  const wizardsStepsData: WizardStepsData = {
    basicSetupStep: {
      clusterNameValidation: { error: null, isFetching: false },
      userRole: { error: null, isFetching: false },
      versions: {
        data: {
          latest: { label: 'OpenShift 4.16.2', value: '4.16.2' },
          default: { label: 'OpenShift 4.16.0', value: '4.16.0' },
          others: [{ label: 'OpenShift 4.15.8', value: '4.15.8' }],
        },
        error: null,
        isFetching: false,
        fetch: async () => {},
      },
      awsInfrastructureAccounts: { data: [], error: null, isFetching: false },
      awsBillingAccounts: { data: [], error: null, isFetching: false },
      regions: { data: [], error: null, isFetching: false },
      roles: { data: [], error: null, isFetching: false, fetch: async (_awsAccount: string) => {} },
      oidcConfig: { data: [], error: null, isFetching: false },
      machineTypes: { data: [], error: null, isFetching: false },
      vpcList: { data: [], error: null, isFetching: false },
      subnets: { data: [], error: null, isFetching: false },
      securityGroups: { data: [], error: null, isFetching: false },
    },
  };

  const onSubmit = async (data: RosaWizardFormData): Promise<void> => {
    void data.cluster;
  };

  return (
    <WizardWrapper
      type="rosa-hcp"
      title="Create ROSA HCP cluster"
      wizardsStepsData={wizardsStepsData}
      onSubmit={onSubmit}
      onCancel={() => undefined}
    />
  );
}
```

## Notes

- `BasicSetupStepProps` requires `versions.fetch()` and `roles.fetch(awsAccount)`; other resources use optional `fetch` on `Resource` when refresh is supported.
- Machine UI still reads subnets from `vpcList.data[].aws_subnets` today; `subnets` and `securityGroups` are separate `Resource` shapes for future separation without another top-level API reshape.
- Subnet names are filtered by substring: names containing `private` drive machine pool subnets; names containing `public` drive the public subnet dropdown when cluster privacy is external.
- `WizardType` includes `rosa-yaml-editor`, but `WizardWrapper` currently only renders `rosa-hcp`; other values return `null` until that path is wired.
- Keep validation wiring and per-field async behavior (for example cluster name uniqueness) in the host app as those flows are implemented field-by-field.
- Prefer updating the Storybook contract story and compile-only example when the integration shape evolves; keep this file concise.
