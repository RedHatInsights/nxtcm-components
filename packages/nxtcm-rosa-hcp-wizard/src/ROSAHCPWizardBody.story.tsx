/**
 * Playwright CT mount targets for {@link ROSAHCPWizardBody}.
 */
import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { FOOTER_CT_BASE_FORM_VALUES } from './Footer/rosaHcpWizardFooter.ctDefaults';
import { VALID_REVIEW_SUBMIT_FORM_VALUES } from './Footer/rosaHcpWizardFooter.test-data';
import fixtures from './ROSAHCPWizard.fixtures';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { DocsVersionProvider } from './ROSAHCPWizardDocsVersionProvider';
import { RosaHcpWizardFormProvider } from './RosaHcpWizardFormProvider';
import { RosaHcpWizardValidationProvider } from './rosaHcpWizardValidationContext';
import { mockOpenShiftVersionsData, mockRoles } from './Steps/BasicSetup/Details/Details.fixtures';
import { defaultRosaHcpWizardValidatorStrings } from './stringsProvider/rosaHcpWizardStrings.defaults';
import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { createAcmCapaGenerator } from './test/acmGeneratorFixtures/acmCapaGenerator';
import capiClusterSchema from './test/acmGeneratorFixtures/schemas/capiClusterSchema.json';
import managedClusterSchema from './test/acmGeneratorFixtures/schemas/managedClusterSchema.json';
import rosaClusterSchema from './test/acmGeneratorFixtures/schemas/rosaClusterSchema.json';
import rosaControlPlaneSchema from './test/acmGeneratorFixtures/schemas/rosaControlPlaneSchema.json';
import { makeMachineTypesResource, makeVpcListResource } from './test/rosaHcpWizardCtSpecHelpers';
import type { ROSAHCPCluster, ROSAHCPWizardData, RosaHCPWizardProps } from './types';
import { createClusterValidationResolver } from './utilities/clusterValidationResolver';
import { WizardConfigProvider } from './WizardConfigContext';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';

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

/** Lets tests enter the submission-error view after the wizard has rendered. */
export function RosaHcpWizardBodyErrorTransitionMount(
  props: RosaHcpWizardBodyMountProps = {}
): React.ReactElement {
  const [submitError, setSubmitError] = React.useState<string | boolean>(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setSubmitError('There has been an error creating the cluster')}
      >
        Simulate submission error
      </button>
      <RosaHcpWizardBodyMountComponent
        {...props}
        onSubmitError={submitError}
        onBackToReviewStep={() => setSubmitError(false)}
      />
    </>
  );
}

/** Uses schema-valid YAML so tests can complete the editor submission path. */
export function RosaHcpWizardBodyYamlApplyMount(props: RosaHcpWizardBodyMountProps = {}) {
  return (
    <RosaHcpWizardBodyMountComponent
      {...props}
      resourceGenerator={{
        ...defaultWizardProps.resourceGenerator,
        resourceSchemas: [],
        validateYaml: () => [],
      }}
    />
  );
}

/** Reports a submit error without rejecting the submit promise. */
export function RosaHcpWizardBodyYamlApplyErrorMount(props: RosaHcpWizardBodyMountProps = {}) {
  const [submitError, setSubmitError] = React.useState<string | boolean>(false);

  return (
    <RosaHcpWizardBodyYamlApplyMount
      {...props}
      onSubmitError={submitError}
      onSubmit={() => {
        setSubmitError('There has been an error creating the cluster');
        return Promise.resolve();
      }}
      onBackToReviewStep={() => setSubmitError(false)}
    />
  );
}

/** Holds a real submission pending so CT can inspect the full-screen loading view. */
export function RosaHcpWizardBodyPendingSubmissionMount(): React.ReactElement {
  const [submitError, setSubmitError] = React.useState<string | boolean>(false);
  const [submittedYaml, setSubmittedYaml] = React.useState('');
  const resolveSubmissionRef = React.useRef<(() => void) | null>(null);
  const resolver = React.useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );
  const methods = useForm<Partial<ROSAHCPCluster>>({
    defaultValues: {
      ...getClusterValidationSchemaDefaultValues(),
      ...FOOTER_CT_BASE_FORM_VALUES,
      ...VALID_REVIEW_SUBMIT_FORM_VALUES,
      cluster_version: '4.16.0',
    },
    resolver,
    mode: 'onTouched',
  });
  const onSubmit = React.useCallback((yaml: string): Promise<void> => {
    setSubmittedYaml(yaml);
    return new Promise<void>((resolve) => {
      resolveSubmissionRef.current = resolve;
    });
  }, []);
  const finishSubmission = (error: boolean): void => {
    if (error) setSubmitError('There has been an error creating the cluster');
    resolveSubmissionRef.current?.();
    resolveSubmissionRef.current = null;
  };

  return (
    <>
      <RosaHcpWizardStringsProvider>
        <DocsVersionProvider>
          <WizardConfigProvider config={{}}>
            <FormProvider {...methods}>
              <RosaHcpWizardValidationProvider>
                <ROSAHCPWizardBody
                  {...defaultWizardProps}
                  enableAllWizardNavSteps
                  onSubmit={onSubmit}
                  onSubmitError={submitError}
                  onBackToReviewStep={() => setSubmitError(false)}
                  wizardData={{
                    ...defaultWizardProps.wizardData,
                    versions: {
                      ...defaultWizardProps.wizardData.versions,
                      data: mockOpenShiftVersionsData,
                    },
                    roles: { ...defaultWizardProps.wizardData.roles, data: mockRoles },
                  }}
                  resourceGenerator={{
                    ...defaultWizardProps.resourceGenerator,
                    resourceSchemas: [],
                    validateYaml: () => [],
                  }}
                />
              </RosaHcpWizardValidationProvider>
            </FormProvider>
          </WizardConfigProvider>
        </DocsVersionProvider>
      </RosaHcpWizardStringsProvider>
      <button type="button" onClick={() => finishSubmission(false)} disabled={!submittedYaml}>
        Finish submission successfully
      </button>
      <button type="button" onClick={() => finishSubmission(true)} disabled={!submittedYaml}>
        Finish submission with error
      </button>
      <input data-testid="submitted-yaml" readOnly hidden value={submittedYaml} />
    </>
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
