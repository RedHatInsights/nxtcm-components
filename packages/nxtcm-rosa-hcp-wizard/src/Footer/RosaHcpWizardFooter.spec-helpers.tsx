/**
 * Playwright CT mount target for footer step-validation tests.
 * Keep a single mount export in this file (see Details.spec-helpers / NumberInput.spec).
 */
import React, { useEffect, useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Wizard, WizardStep } from '@patternfly/react-core';

import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type ROSAHCPCluster,
} from '../types';
import { Details } from '../Steps/BasicSetup/Details/Details';
import { RolesAndPolicies } from '../Steps/BasicSetup/RolesAndPolicies/RolesAndPolicies';
import { Encryption } from '../Steps/OptionalSetup/Encryption/Encryption';
import { ClusterUpdates } from '../Steps/OptionalSetup/ClusterUpdates/ClusterUpdates';
import { Review } from '../Steps/Review/Review';
import {
  mockAwsBillingAccounts,
  mockAwsInfrastructureAccounts,
  mockOpenShiftVersionsData,
  mockRegions,
  mockRoles,
} from '../Steps/BasicSetup/Details/Details.fixtures';
import { STEP_IDS } from '../constants';
import { rosaHcpWizardFooter } from './RosaHcpWizardFooter';
import {
  getRosaHcpFooterCtStartIndex,
  ROSA_HCP_PENDING_CLUSTER_NAME_UNIQUENESS_CHECK,
} from './rosaHcpWizardFooter.spec-data';
import { buildRosaHcpWizardStepLayout } from '../rosaHcpWizardStepLayout';
import { useRosaHcpWizardStepNavDisabledLookup } from '../useRosaHcpWizardStepNavDisabledLookup';
import {
  RosaHcpWizardValidationProvider,
  useRosaHcpWizardStepStatusLookup,
  useRosaHcpWizardValidation,
} from '../rosaHcpWizardValidationContext';
import fixtures from '../ROSAHCPWizard.fixtures';
import { clusterValidationSchema } from '../yupSchemas';
import type { ValidationSchemaContext } from '../yupSchemas/types';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { withRosaCt } from '../components/WizFields/wizFieldCtSpecHelpers';
import { makeVpcListResource } from '../test/rosaHcpWizardCtSpecHelpers';
import type {
  AwsBillingAccountsResource,
  AwsInfrastructureAccountsResource,
  CheckClusterNameUniqueness,
  RegionsResource,
  RolesResource,
  VersionsResource,
} from '../types';

const DEFAULT_ROSA_HCP_CT_FORM_VALUES: Partial<ROSAHCPCluster> = {
  associated_aws_id: '',
  byo_oidc_config_id: '',
  custom_operator_roles_prefix: '',
  encryption_keys: ClusterEncryptionKeys.default,
  etcd_encryption: false,
  configure_proxy: false,
  cidr_default: true,
  network_machine_cidr: '10.0.0.0/16',
  network_service_cidr: '172.30.0.0/16',
  network_pod_cidr: '10.128.0.0/14',
  network_host_prefix: '/23',
  autoscaling: false,
  nodes_compute: 2,
  upgrade_policy: ClusterUpgrade.automatic,
  cluster_privacy: ClusterNetwork.external,
  compute_root_volume: 300,
  billing_account_id: '',
  region: '',
  name: '',
  cluster_version: '',
  installer_role_arn: '',
  support_role_arn: '',
  worker_role_arn: '',
};

export type RosaHcpWizardValidationMountProps = {
  defaultValues?: Partial<ROSAHCPCluster>;
  /** Opens the wizard on this step (defaults to Details). */
  initialStepId?: string;
  /** Marks steps as visited for left-nav enablement (defaults to Details only). */
  initialVisitedStepIds?: readonly string[];
  /**
   * CT-only: wires a never-resolving cluster name uniqueness check on Details.
   * Prefer this boolean over passing `checkClusterNameUniqueness` from tests — Playwright CT
   * may not forward callback props reliably.
   */
  clusterNameUniquenessPending?: boolean;
};

type RosaHcpWizardValidationWizardProps = {
  sl: (typeof defaultRosaHcpWizardStrings)['wizard']['stepLabels'];
  startIndex: number;
  initialStepId: string;
  versionsProps: VersionsResource;
  awsInfra: AwsInfrastructureAccountsResource;
  awsBilling: AwsBillingAccountsResource;
  regionsProps: RegionsResource;
  rolesProps: RolesResource;
  oidcProps: {
    data: typeof fixtures.mockOicdConfig;
    error: null;
    isFetching: boolean;
    fetch: () => Promise<void>;
  };
  vpcListProps: ReturnType<typeof makeVpcListResource>;
  checkClusterNameUniqueness?: CheckClusterNameUniqueness;
};

const layoutWithoutProxy = buildRosaHcpWizardStepLayout({ includeClusterWideProxy: false });

const ROSA_HCP_VALIDATION_MOUNT_CHILD_STEP_IDS = {
  [STEP_IDS.BASIC_SETUP]: [STEP_IDS.DETAILS, STEP_IDS.ROLES_AND_POLICIES],
  [STEP_IDS.OPTIONAL_SETUP]: layoutWithoutProxy.childStepIdsByParent[STEP_IDS.OPTIONAL_SETUP],
} as const;

function RosaHcpWizardValidationWizard({
  sl,
  startIndex,
  initialStepId,
  versionsProps,
  awsInfra,
  awsBilling,
  regionsProps,
  rolesProps,
  oidcProps,
  vpcListProps,
  checkClusterNameUniqueness,
}: RosaHcpWizardValidationWizardProps) {
  const statusForStep = useRosaHcpWizardStepStatusLookup(ROSA_HCP_VALIDATION_MOUNT_CHILD_STEP_IDS);
  const isNavDisabledForStep = useRosaHcpWizardStepNavDisabledLookup({
    includeClusterWideProxy: false,
    childStepIdsByParent: ROSA_HCP_VALIDATION_MOUNT_CHILD_STEP_IDS,
  });
  const { onWizardStepChange } = useRosaHcpWizardValidation();

  useEffect(() => {
    onWizardStepChange(initialStepId);
    // CT-only: align validation context with Wizard `startIndex` on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the seeded step
  }, []);

  return (
    <Wizard
      height={720}
      startIndex={startIndex}
      footer={rosaHcpWizardFooter}
      onStepChange={(_event, currentStep) => {
        onWizardStepChange(String(currentStep.id));
      }}
    >
      <WizardStep
        isExpandable
        name={sl.basicSetup}
        id={STEP_IDS.BASIC_SETUP}
        status={statusForStep(STEP_IDS.BASIC_SETUP)}
        isDisabled={isNavDisabledForStep(STEP_IDS.BASIC_SETUP)}
        steps={[
          <WizardStep
            key={STEP_IDS.DETAILS}
            name={sl.details}
            id={STEP_IDS.DETAILS}
            status={statusForStep(STEP_IDS.DETAILS)}
            isDisabled={isNavDisabledForStep(STEP_IDS.DETAILS)}
          >
            <Details
              versions={versionsProps}
              awsInfrastructureAccounts={awsInfra}
              awsBillingAccounts={awsBilling}
              regions={regionsProps}
              roles={rolesProps}
              checkClusterNameUniqueness={checkClusterNameUniqueness}
            />
          </WizardStep>,
          <WizardStep
            key={STEP_IDS.ROLES_AND_POLICIES}
            name={sl.rolesAndPolicies}
            id={STEP_IDS.ROLES_AND_POLICIES}
            status={statusForStep(STEP_IDS.ROLES_AND_POLICIES)}
            isDisabled={isNavDisabledForStep(STEP_IDS.ROLES_AND_POLICIES)}
          >
            <RolesAndPolicies roles={rolesProps} oidcConfig={oidcProps} />
          </WizardStep>,
        ]}
      />
      <WizardStep
        isExpandable
        name={sl.additionalSetup}
        id={STEP_IDS.OPTIONAL_SETUP}
        status={statusForStep(STEP_IDS.OPTIONAL_SETUP)}
        isDisabled={isNavDisabledForStep(STEP_IDS.OPTIONAL_SETUP)}
        steps={[
          <WizardStep
            key={STEP_IDS.ENCRYPTION}
            name={sl.encryptionOptional}
            id={STEP_IDS.ENCRYPTION}
            status={statusForStep(STEP_IDS.ENCRYPTION)}
            isDisabled={isNavDisabledForStep(STEP_IDS.ENCRYPTION)}
          >
            <Encryption />
          </WizardStep>,
          <WizardStep
            key={STEP_IDS.CLUSTER_UPDATES}
            name={sl.clusterUpdatesOptional}
            id={STEP_IDS.CLUSTER_UPDATES}
            status={statusForStep(STEP_IDS.CLUSTER_UPDATES)}
            isDisabled={isNavDisabledForStep(STEP_IDS.CLUSTER_UPDATES)}
          >
            <ClusterUpdates />
          </WizardStep>,
        ]}
      />
      <WizardStep
        name={sl.review}
        id={STEP_IDS.REVIEW}
        key={STEP_IDS.REVIEW}
        status={statusForStep(STEP_IDS.REVIEW)}
        isDisabled={isNavDisabledForStep(STEP_IDS.REVIEW)}
      >
        <Review vpcList={vpcListProps} />
      </WizardStep>
    </Wizard>
  );
}

export const RosaHcpWizardValidationMount: React.FC<RosaHcpWizardValidationMountProps> = ({
  defaultValues = {},
  initialStepId,
  initialVisitedStepIds,
  clusterNameUniquenessPending = false,
}) => {
  const checkClusterNameUniqueness = useMemo(
    () =>
      clusterNameUniquenessPending ? ROSA_HCP_PENDING_CLUSTER_NAME_UNIQUENESS_CHECK : undefined,
    [clusterNameUniquenessPending]
  );
  const validationContext = useMemo<ValidationSchemaContext>(
    () => ({
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize: 16384,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
    }),
    []
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ROSAHCPCluster>,
    context: validationContext,
    mode: 'onTouched',
  });

  const sl = defaultRosaHcpWizardStrings.wizard.stepLabels;
  const startIndex = getRosaHcpFooterCtStartIndex(initialStepId);

  const versionsProps: VersionsResource = {
    data: mockOpenShiftVersionsData,
    isFetching: false,
    fetch: async () => {},
    error: null,
  };

  const awsInfra: AwsInfrastructureAccountsResource = {
    data: mockAwsInfrastructureAccounts,
    isFetching: false,
    fetch: async () => {},
    error: null,
  };

  const awsBilling: AwsBillingAccountsResource = {
    data: mockAwsBillingAccounts,
    isFetching: false,
    fetch: async () => {},
    error: null,
  };

  const regionsProps: RegionsResource = {
    data: mockRegions,
    isFetching: false,
    fetch: async (_awsAccount: string) => {},
    error: null,
  };

  const rolesProps: RolesResource = {
    data: mockRoles,
    isFetching: false,
    fetch: async (_awsAccount: string) => {},
    error: null,
  };

  const oidcProps = {
    data: fixtures.mockOicdConfig,
    error: null,
    isFetching: false,
    fetch: async () => {},
  };

  const vpcListProps = makeVpcListResource();

  return withRosaCt(
    <FormProvider {...methods}>
      <RosaHcpWizardValidationProvider
        initialActiveStepId={initialStepId ?? STEP_IDS.DETAILS}
        initialVisitedStepIds={initialVisitedStepIds ?? [STEP_IDS.DETAILS]}
      >
        <RosaHcpWizardValidationWizard
          sl={sl}
          startIndex={startIndex}
          initialStepId={initialStepId ?? STEP_IDS.DETAILS}
          versionsProps={versionsProps}
          awsInfra={awsInfra}
          awsBilling={awsBilling}
          regionsProps={regionsProps}
          rolesProps={rolesProps}
          oidcProps={oidcProps}
          vpcListProps={vpcListProps}
          checkClusterNameUniqueness={checkClusterNameUniqueness}
        />
      </RosaHcpWizardValidationProvider>
    </FormProvider>
  );
};
