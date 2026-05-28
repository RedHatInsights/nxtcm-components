/**
 * Playwright CT mount target for footer step-validation tests.
 * Keep a single mount export in this file (see Details.spec-helpers / NumberInput.spec).
 */
import React, { useMemo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Wizard, WizardStep } from '@patternfly/react-core';

import type { ClusterFormData } from '@/components/Wizards/types';
import { ClusterEncryptionKeys, ClusterNetwork, ClusterUpgrade } from '@/components/Wizards/types';
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
import { RosaHcpWizardValidationProvider } from '../rosaHcpWizardValidationContext';
import fixtures from '../ROSAHCPWizard.fixtures';
import { clusterValidationSchema } from '../yupSchemas';
import type { ValidationSchemaContext } from '../yupSchemas/types';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { withRosaCt } from '../components/WizFields/wizFieldCtSpecHelpers';
import { makeVpcListResource } from '../rosaHcpWizardCtSpecHelpers';
import type {
  AwsBillingAccountsResource,
  AwsInfrastructureAccountsResource,
  RegionsResource,
  RolesResource,
  VersionsResource,
} from '../types';

const DEFAULT_ROSA_HCP_CT_FORM_VALUES: Partial<ClusterFormData> = {
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
  defaultValues?: Partial<ClusterFormData>;
};

export const RosaHcpWizardValidationMount: React.FC<RosaHcpWizardValidationMountProps> = ({
  defaultValues = {},
}) => {
  const validationContext = useMemo<ValidationSchemaContext>(
    () => ({
      msgs: defaultRosaHcpWizardValidatorStrings,
      maxRootDiskSize: 16384,
      maxAutoscalingNodes: 500,
      machinePoolsNumber: 1,
    }),
    []
  );

  const methods = useForm<ClusterFormData>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: yupResolver(clusterValidationSchema) as Resolver<ClusterFormData>,
    context: validationContext,
    mode: 'onTouched',
  });

  const sl = defaultRosaHcpWizardStrings.wizard.stepLabels;

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
      <RosaHcpWizardValidationProvider>
        <Wizard height={720} footer={rosaHcpWizardFooter}>
          <WizardStep
            isExpandable
            name={sl.basicSetup}
            id={STEP_IDS.BASIC_SETUP}
            steps={[
              <WizardStep key={STEP_IDS.DETAILS} name={sl.details} id={STEP_IDS.DETAILS}>
                <Details
                  versions={versionsProps}
                  awsInfrastructureAccounts={awsInfra}
                  awsBillingAccounts={awsBilling}
                  regions={regionsProps}
                  roles={rolesProps}
                  vpcList={vpcListProps}
                />
              </WizardStep>,
              <WizardStep
                key={STEP_IDS.ROLES_AND_POLICIES}
                name={sl.rolesAndPolicies}
                id={STEP_IDS.ROLES_AND_POLICIES}
              >
                <RolesAndPolicies roles={rolesProps} oidcConfig={oidcProps} />
              </WizardStep>,
            ]}
          />
          <WizardStep
            isExpandable
            name={sl.additionalSetup}
            id={STEP_IDS.OPTIONAL_SETUP}
            steps={[
              <WizardStep
                key={STEP_IDS.ENCRYPTION}
                name={sl.encryptionOptional}
                id={STEP_IDS.ENCRYPTION}
              >
                <Encryption />
              </WizardStep>,
              <WizardStep
                key={STEP_IDS.CLUSTER_UPDATES}
                name={sl.clusterUpdatesOptional}
                id={STEP_IDS.CLUSTER_UPDATES}
              >
                <ClusterUpdates />
              </WizardStep>,
            ]}
          />
          <WizardStep name={sl.review} id={STEP_IDS.REVIEW} key={STEP_IDS.REVIEW}>
            <Review vpcList={vpcListProps} />
          </WizardStep>
        </Wizard>
      </RosaHcpWizardValidationProvider>
    </FormProvider>
  );
};
