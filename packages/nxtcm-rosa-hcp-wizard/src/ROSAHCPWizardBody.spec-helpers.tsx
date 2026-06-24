/**
 * Playwright CT mount targets for {@link ROSAHCPWizardBody}.
 */
import React from 'react';

import fixtures from './ROSAHCPWizard.fixtures';
import { RosaHcpWizardFormProvider } from './RosaHcpWizardFormProvider';
import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { makeMachineTypesResource, makeVpcListResource } from './test/rosaHcpWizardCtSpecHelpers';
import type { RosaHCPWizardProps, ROSAHCPWizardData } from './types';

const noopFetch = async (): Promise<void> => {};

export function makeMinimalRosaHcpWizardData(
  overrides?: Partial<ROSAHCPWizardData>
): ROSAHCPWizardData {
  return {
    awsInfrastructureAccounts: fixtures.mockResource(fixtures.mockAwsInfrastructureAccounts),
    awsBillingAccounts: fixtures.mockResource(fixtures.mockAwsBillingAccounts),
    regions: {
      ...fixtures.mockFetchResource(fixtures.mockRegions),
      fetch: noopFetch,
    },
    versions: {
      ...fixtures.mockFetchResource(fixtures.mockVersionsData),
      fetch: noopFetch,
    },
    machineTypes: makeMachineTypesResource(),
    roles: {
      ...fixtures.mockFetchResource(fixtures.mockRoles),
      fetch: noopFetch,
      ocmRoleError: null,
      ocmRoleARN: null,
      userRoleError: null,
    },
    oidcConfig: {
      ...fixtures.mockFetchResource(fixtures.mockOicdConfig),
      fetch: noopFetch,
    },
    vpcList: makeVpcListResource(),
    subnets: fixtures.mockResource([]),
    securityGroups: fixtures.mockResource(fixtures.mockSecurityGroups),
    clusterNameValidation: fixtures.mockValidationResource(),
    ...overrides,
  };
}

const defaultWizardProps: RosaHCPWizardProps = {
  title: 'Create ROSA Cluster',
  wizardData: makeMinimalRosaHcpWizardData(),
  onSubmit: async () => {},
  onCancel: () => {},
};

export type RosaHcpWizardBodyMountProps = Partial<RosaHCPWizardProps>;

export function RosaHcpWizardBodyMount(props: RosaHcpWizardBodyMountProps = {}) {
  return (
    <RosaHcpWizardStringsProvider>
      <RosaHcpWizardFormProvider {...defaultWizardProps} {...props} />
    </RosaHcpWizardStringsProvider>
  );
}

/** Starts in submit error state and clears error when "Back to the wizard" is clicked. */
export function RosaHcpWizardBodyErrorThenBackMount(props: RosaHcpWizardBodyMountProps = {}) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(
    'There has been an error creating the cluster'
  );

  return (
    <RosaHcpWizardBodyMount
      {...props}
      onSubmitError={submitError}
      onBackToReviewStep={() => setSubmitError(false)}
    />
  );
}
