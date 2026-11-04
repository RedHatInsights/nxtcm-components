/**
 * Playwright CT mount targets for {@link ROSAHCPWizardBody}.
 */
import React from 'react';

import fixtures from './ROSAHCPWizard.fixtures';
import { RosaHcpWizardFormProvider } from './RosaHcpWizardFormProvider';
import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { createAcmCapaGenerator } from './test/acmGeneratorFixtures/acmCapaGenerator';
import capiClusterSchema from './test/acmGeneratorFixtures/schemas/capiClusterSchema.json';
import managedClusterSchema from './test/acmGeneratorFixtures/schemas/managedClusterSchema.json';
import rosaClusterSchema from './test/acmGeneratorFixtures/schemas/rosaClusterSchema.json';
import rosaControlPlaneSchema from './test/acmGeneratorFixtures/schemas/rosaControlPlaneSchema.json';
import { makeMachineTypesResource, makeVpcListResource } from './test/rosaHcpWizardCtSpecHelpers';
import type { ROSAHCPWizardData, RosaHCPWizardProps } from './types';

const noopFetch = async (): Promise<void> => {};

function makeMinimalRosaHcpWizardData(overrides?: Partial<ROSAHCPWizardData>): ROSAHCPWizardData {
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
    clusterNameValidation: fixtures.mockValidationResource(),
    ...overrides,
  };
}

const defaultWizardProps: RosaHCPWizardProps = {
  title: 'Create ROSA Cluster',
  wizardData: makeMinimalRosaHcpWizardData(),
  onSubmit: async () => {},
  onCancel: () => {},
  resourceGenerator: createAcmCapaGenerator([
    { kind: 'ROSAControlPlane', schema: rosaControlPlaneSchema, primary: true },
    { kind: 'ManagedCluster', schema: managedClusterSchema },
    { kind: 'Cluster', schema: capiClusterSchema },
    { kind: 'ROSACluster', schema: rosaClusterSchema },
  ]),
};

export type RosaHcpWizardBodyMountProps = Partial<RosaHCPWizardProps>;

function RosaHcpWizardBodyMountComponent(props: RosaHcpWizardBodyMountProps = {}) {
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
    <RosaHcpWizardBodyMountComponent
      {...props}
      onSubmitError={submitError}
      onBackToReviewStep={() => setSubmitError(false)}
    />
  );
}

type BrowserProps = NonNullable<React.ComponentProps<typeof RosaHcpWizardBodyMountComponent>>;

export type RosaHcpWizardBodyMountGalleryProps = Omit<
  BrowserProps,
  'onCancel' | 'onBackToReviewStep'
> & {
  onCancel?: boolean;
  onBackToReviewStep?: boolean;
};

export function RosaHcpWizardBodyMount(
  props: RosaHcpWizardBodyMountGalleryProps
): React.ReactElement {
  const [onCancelCalls, setOnCancelCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onCancel']>>[]
  >([]);
  const [onBackToReviewStepCalls, setOnBackToReviewStepCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onBackToReviewStep']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onCancel: props.onCancel
        ? () => {
            setOnCancelCalls((calls) => [...calls, []]);
          }
        : undefined,
      onBackToReviewStep: props.onBackToReviewStep
        ? () => {
            setOnBackToReviewStepCalls((calls) => [...calls, []]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <RosaHcpWizardBodyMountComponent {...browserProps} />
      <div hidden>
        <input data-testid="onCancel-calls" readOnly value={JSON.stringify(onCancelCalls)} />
        <input data-testid="onCancel-count" readOnly value={String(onCancelCalls.length)} />
        <input
          data-testid="onBackToReviewStep-calls"
          readOnly
          value={JSON.stringify(onBackToReviewStepCalls)}
        />
        <input
          data-testid="onBackToReviewStep-count"
          readOnly
          value={String(onBackToReviewStepCalls.length)}
        />
      </div>
    </>
  );
}
