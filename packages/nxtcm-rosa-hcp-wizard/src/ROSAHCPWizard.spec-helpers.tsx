import React from 'react';
import { RosaHCPWizard } from './ROSAHCPWizard';
import type { RosaHCPWizardProps, ROSAHCPWizardData } from './types';

export const mockWizardData: ROSAHCPWizardData = {
  machineTypes: {
    data: [],
    error: null,
    isFetching: false,
    fetch: async () => {},
  },
  vpcList: {
    data: [],
    error: null,
    isFetching: false,
    fetch: async () => {},
  },
  versions: {
    data: {
      latest: { label: '4.16.2', value: '4.16.2' },
      default: { label: '4.15.0', value: '4.15.0' },
      releases: [],
    },
    error: null,
    isFetching: false,
    fetch: async () => {},
  },
  awsInfrastructureAccounts: {
    data: [],
    error: null,
    isFetching: false,
  },
  awsBillingAccounts: {
    data: [],
    error: null,
    isFetching: false,
  },
  regions: {
    data: [],
    error: null,
    isFetching: false,
    fetch: async () => {},
  },
  roles: {
    data: [],
    error: null,
    isFetching: false,
    ocmRoleError: null,
    userRoleError: null,
    ocmRoleARN: null,
    fetch: async () => {},
  },
  oidcConfig: {
    data: [],
    error: null,
    isFetching: false,
    fetch: async () => {},
  },
  subnets: {
    data: [],
    error: null,
    isFetching: false,
  },
  securityGroups: {
    data: [],
    error: null,
    isFetching: false,
  },
  clusterNameValidation: {
    error: null,
    isFetching: false,
  },
};

export interface ROSAHCPWizardMountProps {
  wizardProps?: Partial<RosaHCPWizardProps>;
}

const defaultWizardProps: RosaHCPWizardProps = {
  wizardData: mockWizardData,
  onSubmit: async () => {},
  onCancel: () => {},
  title: 'Create ROSA HCP Cluster',
  resourceGenerator: {
    renderYaml: () => 'kind: Cluster',
    validateYaml: () => [],
  },
};

export const ROSAHCPWizardMount: React.FC<ROSAHCPWizardMountProps> = ({ wizardProps = {} }) => {
  return <RosaHCPWizard {...defaultWizardProps} {...wizardProps} />;
};
