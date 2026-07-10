/**
 * Playwright CT mount target for footer step-validation tests.
 * Keep a single mount export in this file (see Details.spec-helpers / NumberInput.spec).
 */
import React, { useCallback, useMemo } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { Wizard, WizardStep } from '@patternfly/react-core';

import {
  type AwsBillingAccountsResource,
  type AwsInfrastructureAccountsResource,
  type RegionsResource,
  type RolesResource,
  type ROSAHCPCluster,
  type VersionsResource,
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
import { createRosaHcpWizardFooter, rosaHcpWizardFooter } from './RosaHcpWizardFooter';
import { FOOTER_CT_BASE_FORM_VALUES } from './rosaHcpWizardFooter.ctDefaults';
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

export type RosaHcpWizardValidationMountProps = {
  defaultValues?: Partial<ROSAHCPCluster>;
  /** When provided, a real footer is wired so onSubmit receives the YAML string. */
  onSubmit?: (yamlString: string) => Promise<void>;
};

/** Minimal YAML stub returned by getYaml when onSubmit is wired in tests. */
const STUB_FORM_YAML = 'kind: ROSAControlPlane\nmetadata:\n  name: stub';

export const RosaHcpWizardValidationMount: React.FC<RosaHcpWizardValidationMountProps> = ({
  defaultValues = {},
  onSubmit,
}) => {
  const resolver = useMemo(
    () => createClusterValidationResolver(defaultRosaHcpWizardValidatorStrings),
    []
  );
  const getFormYaml = useCallback(() => STUB_FORM_YAML, []);
  const footer = useMemo(
    () => (onSubmit ? createRosaHcpWizardFooter(onSubmit, getFormYaml) : rosaHcpWizardFooter),
    [onSubmit, getFormYaml]
  );

  const methods = useForm<ROSAHCPCluster>({
    defaultValues: { ...FOOTER_CT_BASE_FORM_VALUES, ...defaultValues },
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
        <Wizard height={720} footer={footer} isVisitRequired>
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
