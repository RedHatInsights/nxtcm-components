# ROSA HCP Wizard — Integration Guide for ACM/OCM Consumers

This guide covers the typed interfaces that ACM and OCM applications use when integrating the ROSA HCP cluster creation wizard from `nxtcm-components`.

## Overview

The wizard accepts structured data describing AWS accounts, OpenShift versions, VPCs, roles, and other configuration options. On submit, it returns the full cluster configuration the user built. Both the input and output shapes are fully typed so consumers get compile-time validation and autocomplete.

All types referenced below are exported from the library:

```ts
import type {
  WizardStepsData,
  BasicSetupStepProps,
  ClusterFormData,
  RosaWizardFormData,
  WizardCallbackFunctions,
  WizardType,
  SelectDropdownType,
  MachineTypesDropdownType,
  VPC,
  Subnet,
  Role,
  OpenShiftVersionsData,
  OIDCConfig,
} from 'nxtcm-components';
```

## Rendering the Wizard

```tsx
import { WizardWrapper } from 'nxtcm-components';

<WizardWrapper
  type="rosa-hcp"
  title="Create ROSA HCP cluster"
  wizardsStepsData={stepsData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

`type` is a union of `'rosa-hcp' | 'rosa-yaml-editor'`. The first renders the standard step-by-step wizard, the second adds a YAML editor step before review.

## Input: `WizardStepsData`

This is the top-level shape passed via the `wizardsStepsData` prop.

```ts
type WizardStepsData = {
  basicSetupStep: BasicSetupStepProps;
  callbackFunctions?: WizardCallbackFunctions;
};
```

### `BasicSetupStepProps`

All the dropdown and selection data the wizard needs to render its steps.

```ts
type BasicSetupStepProps = {
  /** Optional. OpenShift version select uses grouped sections (latest / default / previous). */
  versions?: {
    data: OpenShiftVersionsData;
    isFetching: boolean;
    error: null | string;
    fetch?: () => Promise<void>;
  };
  awsInfrastructureAccounts: SelectDropdownType[];
  awsBillingAccounts: SelectDropdownType[];
  regions: SelectDropdownType[];
  vpcList: VPC[];
  roles: {
    data: Role[];
    isFetching: boolean;
    error: null | string;
    fetch?: (awsAccount: string) => Promise<void>;
  };
  oicdConfig: OIDCConfig[];
  machineTypes: MachineTypesDropdownType[];
};
```

`OpenShiftVersionsData` is a structured object (not a flat list):

```ts
type OpenShiftVersionsData = {
  default?: SelectDropdownType;   // when omitted, no "Default" section is shown
  latest?: SelectDropdownType;     // when omitted, no "Latest" section is shown
  releases: SelectDropdownType[]; // when both default/latest omitted, this group is labeled "Releases"; otherwise "Previous releases"
};
```

### Option types

Most dropdowns use `SelectDropdownType`:

```ts
type SelectDropdownType = {
  label: string;       // display text
  value: string;       // stored value
  description?: string; // optional secondary text
};
```

Machine types have an extra `id` field:

```ts
type MachineTypesDropdownType = {
  id: string;
  label: string;
  description: string;
  value: string;
};
```

### VPC and Subnet data

```ts
type VPC = {
  id: string;
  name: string;
  aws_subnets: Subnet[];
};

type Subnet = {
  subnet_id: string;
  name: string;            // should contain 'private' or 'public' for filtering
  availability_zone: string;
};
```

The wizard filters subnets by name to separate private and public subnets. Subnet names containing `'private'` are used for machine pool selection, and those containing `'public'` are used for the public subnet dropdown when the cluster is set to external access.

### Roles

Account roles are passed as an array of `Role` entries (installer + related support/worker options per installer ARN):

```ts
type Role = {
  installerRole: SelectDropdownType & { roleVersion?: string; disabled?: boolean };
  supportRole: SelectDropdownType[];
  workerRole: SelectDropdownType[];
};
```

The wizard expects `basicSetupStep.roles` with `data`, `isFetching`, `error`, and optional `fetch(awsAccount)`.

### OIDC Config

```ts
type OIDCConfig = {
  label: string;
  value: string;
  issuer_url: string; // shown as description in the dropdown
};
```

### Callback Functions (optional)

```ts
type WizardCallbackFunctions = {
  onAWSAccountChange?: (value: unknown) => void;
  refreshAwsAccountDataCallback?: () => void;
  refreshAwsBillingAccountCallback?: () => void;
};
```

- `onAWSAccountChange` fires when the user selects a different AWS infrastructure account. Use this to reload roles, VPCs, or other account-dependent data.
- `refreshAwsAccountDataCallback` is wired to the refresh button on the AWS infrastructure account dropdown.
- `refreshAwsBillingAccountCallback` is wired to the refresh button on the AWS billing account dropdown.

## Output: `ClusterFormData`

The `onSubmit` callback receives the full form state wrapped as `RosaWizardFormData`:

```ts
type RosaWizardFormData = {
  cluster: ClusterFormData;
};
```

`ClusterFormData` contains every field the wizard collects:

```ts
type ClusterFormData = {
  // details
  name?: string;
  cluster_version?: string;
  associated_aws_id?: string;
  billing_account_id?: string;
  region?: string;

  // roles and policies
  installer_role_arn?: string;
  support_role_arn?: string;
  worker_role_arn?: string;
  byo_oidc_config_id?: string;
  custom_operator_roles_prefix?: string;

  // machine pools
  selected_vpc?: string;
  machine_pools_subnets?: MachinePoolSubnetEntry[];
  machine_type?: string;
  autoscaling?: boolean;
  nodes_compute?: number;
  min_replicas?: number;
  max_replicas?: number;
  compute_root_volume?: number;
  imds?: string;

  // networking
  cluster_privacy?: 'external' | 'internal';
  cluster_privacy_public_subnet_id?: string;
  cidr_default?: boolean;
  network_machine_cidr?: string;
  network_service_cidr?: string;
  network_pod_cidr?: string;
  network_host_prefix?: string;
  configure_proxy?: boolean;

  // proxy (only present if configure_proxy is true)
  http_proxy_url?: string;
  https_proxy_url?: string;
  no_proxy_domains?: string;
  additional_trust_bundle?: string;

  // encryption
  encryption_keys?: 'default' | 'custom';
  kms_key_arn?: string;
  etcd_encryption?: boolean;
  etcd_key_arn?: string;

  // cluster updates
  upgrade_policy?: 'automatic' | 'manual';
  upgrade_schedule?: string; // cron format, e.g. "00 14 * * 3"
};
```

All fields are optional because the user fills them in progressively. By the time `onSubmit` fires, required fields will have been validated by the wizard's built-in validation.

## Full Example

```tsx
import { WizardWrapper } from 'nxtcm-components';
import type {
  WizardStepsData,
  ClusterFormData,
} from 'nxtcm-components';

function CreateClusterPage() {
  const stepsData: WizardStepsData = {
    basicSetupStep: {
      versions: {
        data: {
          latest: { label: 'OpenShift 4.15.2', value: '4.15.2' },
          default: { label: 'OpenShift 4.14.8', value: '4.14.8' },
          releases: [{ label: 'OpenShift 4.14.0', value: '4.14.0' }],
        },
        isFetching: false,
        error: null,
      },
      awsInfrastructureAccounts: [
        { label: 'prod-account (123456789)', value: '123456789' },
      ],
      awsBillingAccounts: [
        { label: 'billing-main (987654321)', value: '987654321' },
      ],
      regions: [
        { label: 'US East (N. Virginia)', value: 'us-east-1' },
        { label: 'US West (Oregon)', value: 'us-west-2' },
      ],
      vpcList: [
        {
          id: 'vpc-abc123',
          name: 'production-vpc',
          aws_subnets: [
            { subnet_id: 'subnet-priv1', name: 'private-us-east-1a', availability_zone: 'us-east-1a' },
            { subnet_id: 'subnet-pub1', name: 'public-us-east-1a', availability_zone: 'us-east-1a' },
          ],
        },
      ],
      roles: {
        data: [
          {
            installerRole: {
              label: 'ManagedOpenShift-Installer-Role',
              value: 'arn:aws:iam::role/installer',
            },
            supportRole: [{ label: 'ManagedOpenShift-Support-Role', value: 'arn:aws:iam::role/support' }],
            workerRole: [{ label: 'ManagedOpenShift-Worker-Role', value: 'arn:aws:iam::role/worker' }],
          },
        ],
        isFetching: false,
        error: null,
      },
      oicdConfig: [
        { label: 'oidc-abc123', value: 'abc123', issuer_url: 'https://oidc.example.com' },
      ],
      machineTypes: [
        { id: 'm5.xlarge', label: 'm5.xlarge', description: '4 vCPU, 16 GiB', value: 'm5.xlarge' },
        { id: 'm5.2xlarge', label: 'm5.2xlarge', description: '8 vCPU, 32 GiB', value: 'm5.2xlarge' },
      ],
    },
    callbackFunctions: {
      onAWSAccountChange: (accountId) => {
        // reload roles, VPCs, etc. for the selected account
      },
      refreshAwsAccountDataCallback: () => {
        // re-fetch AWS infrastructure accounts
      },
      refreshAwsBillingAccountCallback: () => {
        // re-fetch AWS billing accounts
      },
    },
  };

  const handleSubmit = async (data: unknown) => {
    const { cluster } = data as { cluster: ClusterFormData };
    // cluster.name, cluster.region, cluster.machine_type, etc.
    // are all typed and available here
    await createCluster(cluster);
  };

  return (
    <WizardWrapper
      type="rosa-hcp"
      title="Create ROSA HCP cluster"
      wizardsStepsData={stepsData}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/clusters')}
    />
  );
}
```
