import type { Meta, StoryObj } from '@storybook/react';
import type { WizardSubmit } from '@patternfly-labs/react-form-wizard';
import { RosaWizard } from './RosaWizard';
import type {
  OIDCConfig,
  OpenShiftVersionsData,
  Role,
  Resource,
  RosaWizardFormData,
  ValidationResource,
  VPC,
  WizardStepsData,
} from '..';

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
});

const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

const mockValidationResource = (): ValidationResource => ({
  error: null,
  isFetching: false,
});

const oidcConfigs: OIDCConfig[] = [
  {
    label: 'default-oidc',
    value: 'default-oidc',
    issuer_url: 'https://oidc.example.com/default-oidc',
  },
];

const versionsData: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.16.2', value: '4.16.2' },
  default: { label: 'OpenShift 4.16.0', value: '4.16.0' },
  releases: [{ label: 'OpenShift 4.15.8', value: '4.15.8' }],
};

const roles: Role[] = [
  {
    installerRole: { label: 'installer-role', value: 'installer-role', roleVersion: '4.16.0' },
    supportRole: [{ label: 'support-role', value: 'support-role' }],
    workerRole: [{ label: 'worker-role', value: 'worker-role' }],
  },
];

const vpcList: VPC[] = [
  {
    id: 'vpc-123456',
    name: 'example-vpc',
    aws_subnets: [
      {
        subnet_id: 'subnet-private-a',
        name: 'example-subnet-private1-us-east-1a',
        availability_zone: 'us-east-1a',
      },
      {
        subnet_id: 'subnet-public-a',
        name: 'example-subnet-public1-us-east-1a',
        availability_zone: 'us-east-1a',
      },
    ],
  },
];

const wizardStepsData: WizardStepsData = {
  basicSetupStep: {
    clusterNameValidation: mockValidationResource(),
    userRole: mockValidationResource(),
    versions: mockFetchResource(versionsData),
    awsInfrastructureAccounts: mockResource([{ label: 'aws-account-1', value: 'aws-account-1' }]),
    awsBillingAccounts: mockResource([{ label: 'billing-account-1', value: 'billing-account-1' }]),
    regions: mockFetchResource([{ label: 'US East 1', value: 'us-east-1' }]),
    roles: mockFetchResource<Role[], [awsAccount: string]>(roles),
    oidcConfig: mockResource(oidcConfigs),
    machineTypes: mockResource([
      {
        id: 'm5a.xlarge',
        label: 'm5a.xlarge',
        description: '4 vCPU 16 GiB RAM',
        value: 'm5a.xlarge',
      },
    ]),
    vpcList: mockResource(vpcList),
    subnets: mockResource([]),
    securityGroups: mockResource([]),
  },
};

// cast only on the prop: react-form-wizard still types submit as unknown
const integrationContractOnSubmit = async (data: RosaWizardFormData): Promise<void> => {
  void data.cluster;
};

const meta: Meta<typeof RosaWizard> = {
  title: 'Wizards/CreateRosaWizard (main)/Integration Contract',
  component: RosaWizard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Type-safe integration contract for consumers.

- Input contract: \`WizardStepsData\`
- Output contract on submit: \`RosaWizardFormData\`
- Source of truth for exported types: \`src/components/Wizards/index.ts\`

This story keeps \`wizardsStepsData\` and the submit handler body typed like consumer code (\`WizardWrapper\` uses the same \`RosaWizardFormData\` shape). The handler is cast to \`WizardSubmit\` only at the prop boundary because react-form-wizard types submit as \`unknown\`.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RosaWizard>;

export const TypedConsumerExample: Story = {
  args: {
    title: 'Typed ROSA Wizard Integration',
    wizardsStepsData: wizardStepsData,
    onSubmit: integrationContractOnSubmit as WizardSubmit,
    onCancel: () => {
      void 0;
    },
  },
};
