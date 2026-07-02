/**
 * Playwright CT mount target for footer step-validation tests.
 * Keep a single mount export in this file (see Details.spec-helpers / NumberInput.spec).
 */
import React, { useMemo } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Wizard, WizardStep } from '@patternfly/react-core';

import {
  ClusterEncryptionKeys,
  ClusterNetwork,
  ClusterUpgrade,
  type ROSAHCPCluster,
} from '../types';
import { Details } from '../Steps/BasicSetup/Details/Details';
import { MachinePools } from '../Steps/BasicSetup/MachinePools/MachinePools';
import { Networking } from '../Steps/BasicSetup/Networking/Networking';
import { mockSubnets } from '../Steps/BasicSetup/Networking/Networking.fixtures';
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
import { createClusterValidationResolver } from '../utilities/clusterValidationResolver';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../stringsProvider/rosaHcpWizardStrings.defaults';
import { withRosaCt } from '../components/WizFields/wizFieldCtSpecHelpers';
import {
  makeDefaultRosaHcpCtWizardData,
  makeMachineTypesResource,
  makeVpcListResource,
  WizardFieldMetaChangeEffectsRunner,
} from '../test/rosaHcpWizardCtSpecHelpers';
import type {
  AwsBillingAccountsResource,
  AwsInfrastructureAccountsResource,
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
};

export const RosaHcpWizardValidationMount: React.FC<RosaHcpWizardValidationMountProps> = ({
  defaultValues = {},
}) => {
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...DEFAULT_ROSA_HCP_CT_FORM_VALUES, ...defaultValues },
    resolver: resolver as Resolver<ROSAHCPCluster>,
    mode: 'onTouched',
  });

  const sl = defaultRosaHcpWizardStrings.wizard.stepLabels;

  const versionsProps = useMemo<VersionsResource>(
    () => ({
      data: mockOpenShiftVersionsData,
      isFetching: false,
      fetch: async () => {},
      error: null,
    }),
    []
  );

  const awsInfra = useMemo<AwsInfrastructureAccountsResource>(
    () => ({
      data: mockAwsInfrastructureAccounts,
      isFetching: false,
      fetch: async () => {},
      error: null,
    }),
    []
  );

  const awsBilling = useMemo<AwsBillingAccountsResource>(
    () => ({
      data: mockAwsBillingAccounts,
      isFetching: false,
      fetch: async () => {},
      error: null,
    }),
    []
  );

  const regionsProps = useMemo<RegionsResource>(
    () => ({
      data: mockRegions,
      isFetching: false,
      fetch: async (_awsAccount: string) => {},
      error: null,
    }),
    []
  );

  const rolesProps = useMemo<RolesResource>(
    () => ({
      data: mockRoles,
      isFetching: false,
      fetch: async (_awsAccount: string) => {},
      error: null,
      ocmRoleError: null,
      userRoleError: null,
      ocmRoleARN: null,
    }),
    []
  );

  const oidcProps = useMemo(
    () => ({
      data: fixtures.mockOicdConfig,
      error: null,
      isFetching: false,
      fetch: async () => {},
    }),
    []
  );

  const vpcListProps = useMemo(() => makeVpcListResource(), []);
  const machineTypesProps = useMemo(() => makeMachineTypesResource(), []);
  const subnetsProps = useMemo(
    () => ({
      data: mockSubnets,
      error: null,
      isFetching: false,
    }),
    []
  );

  const wizardData = useMemo(
    () =>
      makeDefaultRosaHcpCtWizardData({
        awsInfrastructureAccounts: awsInfra,
        awsBillingAccounts: awsBilling,
        regions: regionsProps,
        versions: versionsProps,
        roles: rolesProps,
        oidcConfig: oidcProps,
        machineTypes: machineTypesProps,
        vpcList: vpcListProps,
        subnets: subnetsProps,
      }),
    [
      awsBilling,
      awsInfra,
      machineTypesProps,
      oidcProps,
      regionsProps,
      rolesProps,
      subnetsProps,
      versionsProps,
      vpcListProps,
    ]
  );

  return withRosaCt(
    <FormProvider {...methods}>
      <RosaHcpWizardValidationProvider>
        <WizardFieldMetaChangeEffectsRunner wizardData={wizardData} />
        <Wizard height={720} footer={rosaHcpWizardFooter} isVisitRequired>
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
                />
              </WizardStep>,
              <WizardStep
                key={STEP_IDS.ROLES_AND_POLICIES}
                name={sl.rolesAndPolicies}
                id={STEP_IDS.ROLES_AND_POLICIES}
              >
                <RolesAndPolicies roles={rolesProps} oidcConfig={oidcProps} />
              </WizardStep>,
              <WizardStep
                key={STEP_IDS.MACHINE_POOLS}
                name={sl.machinePools}
                id={STEP_IDS.MACHINE_POOLS}
              >
                <MachinePools vpcList={vpcListProps} machineTypes={machineTypesProps} />
              </WizardStep>,
              <WizardStep name={sl.networking} id={STEP_IDS.NETWORKING} key={STEP_IDS.NETWORKING}>
                <Networking vpcList={vpcListProps} subnets={subnetsProps} />
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
