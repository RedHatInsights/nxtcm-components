import '@patternfly/react-core/dist/styles/base.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RosaWizard } from '../src/components/Wizards/RosaWizard/RosaWizard';

const mockVersions = {
  data: {
    default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
    latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
    others: [
      { label: 'OpenShift 4.11.5', value: '4.11.5' },
      { label: 'OpenShift 4.10.8', value: '4.10.8' },
    ],
  },
  error: null,
  isFetching: false,
  fetch: async () => {},
};

const mockAwsInfrastructureAccounts = {
  data: [
    { label: 'AWS Account - Production (123456789012)', value: 'aws-prod-123456789012' },
    { label: 'AWS Account - Staging (234567890123)', value: 'aws-staging-234567890123' },
    { label: 'AWS Account - Development (345678901234)', value: 'aws-dev-345678901234' },
  ],
  error: null,
  isFetching: false,
};

const mockAwsBillingAccounts = {
  data: [
    { label: 'Billing Account - Main (123456789012)', value: 'billing-main-123456789012' },
    {
      label: 'Billing Account - Secondary (234567890123)',
      value: 'billing-secondary-234567890123',
    },
  ],
  error: null,
  isFetching: false,
};

const mockRegions = {
  data: [
    { label: 'US East (N. Virginia)', value: 'us-east-1' },
    { label: 'US East (Ohio)', value: 'us-east-2' },
    { label: 'US West (N. California)', value: 'us-west-1' },
  ],
  error: null,
  isFetching: false,
  fetch: async () => {},
};

const mockRoles = {
  data: [
    {
      installerRole: {
        label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
        value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Installer-Role',
      },
      supportRole: [
        {
          label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Support-Role',
          value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Support-Role',
        },
      ],
      workerRole: [
        {
          label: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
          value: 'arn:aws:iam::123456789012:role/ManagedOpenShift-HCP-ROSA-Worker-Role',
        },
      ],
    },
  ],
  error: null,
  isFetching: false,
  fetch: async () => {},
};

const mockOidcConfig = {
  data: [
    {
      label: 'oidc-config-test-id-1',
      value: 'oidc-config-test-id-1',
      issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-1',
    },
    {
      label: 'oidc-config-test-id-2',
      value: 'oidc-config-test-id-2',
      issuer_url: 'https://oidc.os1.devshift.org/oidc-config-test-id-2',
    },
  ],
  error: null,
  isFetching: false,
};

const mockMachineTypes = {
  data: [
    {
      id: 'm5a.xlarge',
      label: 'm5a.xlarge',
      description: '4 vCPU 16 GiB RAM',
      value: 'm5a.xlarge',
    },
    {
      id: 'm6a.xlarge',
      label: 'm6a.xlarge',
      description: '4 vCPU 16 GiB RAM',
      value: 'm6a.xlarge',
    },
  ],
  error: null,
  isFetching: false,
};

const mockVPCs = {
  data: [
    {
      name: 'test-vpc-1',
      id: 'vpc-01496860a4b0475a3',
      aws_subnets: [
        {
          subnet_id: 'subnet-0cd89766e94deb008',
          name: 'test-1-subnet-public1-us-east-1b',
          availability_zone: 'us-east-1b',
        },
        {
          subnet_id: 'subnet-032asd766e94deb008',
          name: 'test-1-subnet-private1-us-east-1a',
          availability_zone: 'us-east-1a',
        },
        {
          subnet_id: 'subnet-032as34ty2a6e94deb008',
          name: 'test-1-subnet-public1-us-east-1a',
          availability_zone: 'us-east-1a',
        },
        {
          subnet_id: 'subnet-03aas45qwe94deb008',
          name: 'test-1-subnet-private1-us-east-1b',
          availability_zone: 'us-east-1b',
        },
        {
          subnet_id: 'subnet-03azxc15qwe94deb008',
          name: 'test-1-subnet-public1-us-east-1c',
          availability_zone: 'us-east-1c',
        },
        {
          subnet_id: 'subnet-03aas45qzxc123deb008',
          name: 'test-1-subnet-private1-us-east-1c',
          availability_zone: 'us-east-1c',
        },
      ],
      aws_security_groups: [
        { id: 'sg-0a1b2c3d4e5f00001', name: 'default' },
        { id: 'sg-0a1b2c3d4e5f00002', name: 'k8s-traffic-rules' },
      ],
    },
    {
      name: 'test-2-vpc',
      id: 'vpc-9866ceabc28332c7144',
      aws_subnets: [
        {
          name: 'test-subnet-private1-us-east-1a',
          availability_zone: 'us-east-1a',
          subnet_id: 'subnet-0b5b55dvdv12236d',
        },
        {
          name: 'test-subnet-public1-us-east-1a',
          availability_zone: 'us-east-1a',
          subnet_id: 'subnet-0b5b33hgvdv12236d',
        },
      ],
    },
  ],
  error: null,
  isFetching: false,
};

const mockSubnets = {
  data: [] as { subnet_id: string; name: string; availability_zone: string }[],
  error: null,
  isFetching: false,
};

const mockSecurityGroups = {
  data: [] as { id: string; name: string }[],
  error: null,
  isFetching: false,
};

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <RosaWizard
      title="Create ROSA Cluster"
      onSubmit={async () => {}}
      onCancel={() => {}}
      wizardsStepsData={{
        basicSetupStep: {
          clusterNameValidation: { error: null, isFetching: false },
          userRole: { error: null, isFetching: false },
          versions: mockVersions,
          awsInfrastructureAccounts: mockAwsInfrastructureAccounts,
          awsBillingAccounts: mockAwsBillingAccounts,
          regions: mockRegions,
          roles: mockRoles,
          oidcConfig: mockOidcConfig,
          vpcList: mockVPCs,
          subnets: mockSubnets,
          securityGroups: mockSecurityGroups,
          machineTypes: mockMachineTypes,
        },
      }}
    />
  );
}
