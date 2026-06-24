import type { UseFormSetValue } from 'react-hook-form';

import { applyWizardFieldMetaChangeEffects } from './applyWizardFieldMetaChangeEffects';
import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';
import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import { applyWizardFieldDerivedSync } from './wizardFieldDerivedSyncs';
import type { ROSAHCPCluster, ROSAHCPWizardData, VPC } from '../types';
import fixtures from '../ROSAHCPWizard.fixtures';
import { getWizardFieldSyncsForSourceField } from '../yupSchemas';

const autoscalingSyncRules = getWizardFieldSyncsForSourceField('autoscaling');
const cidrDefaultSyncRules = getWizardFieldSyncsForSourceField('cidr_default');

jest.mock('./resetFieldsToDefaultValues', () => ({
  resetFieldsToDefaultValues: jest.fn(),
}));

jest.mock('./syncFieldsOnSourceChange', () => ({
  syncFieldsOnSourceChange: jest.fn(),
}));

jest.mock('./wizardFieldDerivedSyncs', () => {
  const actual = jest.requireActual<typeof import('./wizardFieldDerivedSyncs')>(
    './wizardFieldDerivedSyncs'
  );
  return {
    ...actual,
    applyWizardFieldDerivedSync: jest.fn(),
  };
});

const resetFieldsToDefaultValuesMock = resetFieldsToDefaultValues as jest.MockedFunction<
  typeof resetFieldsToDefaultValues
>;
const syncFieldsOnSourceChangeMock = syncFieldsOnSourceChange as jest.MockedFunction<
  typeof syncFieldsOnSourceChange
>;
const applyWizardFieldDerivedSyncMock = applyWizardFieldDerivedSync as jest.MockedFunction<
  typeof applyWizardFieldDerivedSync
>;

function makeWizardData(
  overrides: Partial<{
    vpcListFetch: jest.Mock;
    vpcListData: VPC[];
    machineTypesFetch: jest.Mock;
    regionsFetch: jest.Mock;
  }> = {}
): ROSAHCPWizardData {
  return {
    awsInfrastructureAccounts: { data: [], error: null, isFetching: false },
    awsBillingAccounts: { data: [], error: null, isFetching: false },
    regions: {
      data: [],
      error: null,
      isFetching: false,
      fetch: overrides.regionsFetch ?? jest.fn(),
    },
    versions: { data: { releases: [] }, error: null, isFetching: false, fetch: jest.fn() },
    machineTypes: {
      data: [],
      error: null,
      isFetching: false,
      fetch: overrides.machineTypesFetch ?? jest.fn(),
    },
    roles: {
      data: fixtures.mockRoles,
      error: null,
      isFetching: false,
      fetch: jest.fn(),
      ocmRoleError: null,
      userRoleError: null,
    },
    oidcConfig: { data: [], error: null, isFetching: false, fetch: jest.fn() },
    vpcList: {
      data: overrides.vpcListData ?? [],
      error: null,
      isFetching: false,
      fetch: overrides.vpcListFetch ?? jest.fn(),
    },
    subnets: { data: [], error: null, isFetching: false },
    securityGroups: { data: [], error: null, isFetching: false },
    clusterNameValidation: { error: null, isFetching: false },
  };
}

describe('applyWizardFieldMetaChangeEffects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refetches resources on initial value without resetting dependents', () => {
    const vpcListFetch = jest.fn();
    const machineTypesFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'region',
      formValues: {
        region: 'us-east-1',
        associated_aws_id: 'aws-123',
        installer_role_arn: 'arn:aws:iam::role/installer',
        selected_vpc: 'vpc-123',
      },
      previousValue: undefined,
      currentValue: 'us-east-1',
      wizardData: makeWizardData({ vpcListFetch, machineTypesFetch }),
      setValue,
    });

    expect(vpcListFetch).toHaveBeenCalledTimes(1);
    expect(vpcListFetch).toHaveBeenCalledWith({
      account_id: 'aws-123',
      role_arn: 'arn:aws:iam::role/installer',
      region: 'us-east-1',
    });
    expect(machineTypesFetch).not.toHaveBeenCalled();
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
  });

  it('skips composed vpcList refetch when a required field is empty', () => {
    const vpcListFetch = jest.fn();
    const machineTypesFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'region',
      formValues: {
        region: 'us-east-1',
        associated_aws_id: '',
        installer_role_arn: 'arn:aws:iam::role/installer',
        selected_vpc: 'vpc-123',
      },
      previousValue: undefined,
      currentValue: 'us-east-1',
      wizardData: makeWizardData({ vpcListFetch, machineTypesFetch }),
      setValue,
    });

    expect(vpcListFetch).not.toHaveBeenCalled();
    expect(machineTypesFetch).not.toHaveBeenCalled();
  });

  it('resets dependents and refetches when a tracked field changes', () => {
    const vpcListFetch = jest.fn();
    const machineTypesFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'region',
      formValues: {
        region: 'us-west-2',
        associated_aws_id: 'aws-123',
        installer_role_arn: 'arn:aws:iam::role/installer',
        selected_vpc: 'vpc-123',
      },
      previousValue: 'us-east-1',
      currentValue: 'us-west-2',
      wizardData: makeWizardData({ vpcListFetch, machineTypesFetch }),
      setValue,
    });

    expect(vpcListFetch).toHaveBeenCalledTimes(1);
    expect(vpcListFetch).toHaveBeenCalledWith({
      account_id: 'aws-123',
      role_arn: 'arn:aws:iam::role/installer',
      region: 'us-west-2',
    });
    expect(machineTypesFetch).not.toHaveBeenCalled();
    expect(resetFieldsToDefaultValuesMock).toHaveBeenCalledWith(
      setValue,
      [
        'selected_vpc',
        'machine_pools_subnets',
        'security_groups_worker',
        'cluster_privacy_public_subnet_id',
      ],
      {},
      {
        region: 'us-west-2',
        associated_aws_id: 'aws-123',
        installer_role_arn: 'arn:aws:iam::role/installer',
        selected_vpc: 'vpc-123',
      }
    );
  });

  it('resets no_proxy_domains when http_proxy_url changes', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'http_proxy_url',
      formValues: { http_proxy_url: '' },
      previousValue: 'http://proxy.example.com:8080',
      currentValue: '',
      wizardData: makeWizardData(),
      setValue,
    });

    expect(resetFieldsToDefaultValuesMock).toHaveBeenCalledWith(
      setValue,
      ['no_proxy_domains'],
      {},
      { http_proxy_url: '' }
    );
  });

  it('syncs CIDR defaults when cidr_default is re-checked', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'cidr_default',
      formValues: { cidr_default: true },
      previousValue: false,
      currentValue: true,
      wizardData: makeWizardData(),
      setValue,
    });

    expect(syncFieldsOnSourceChangeMock).toHaveBeenCalledWith(
      setValue,
      cidrDefaultSyncRules,
      true,
      undefined
    );
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
  });

  it('does not reset CIDR fields when cidr_default is unchecked', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'cidr_default',
      formValues: { cidr_default: false },
      previousValue: true,
      currentValue: false,
      wizardData: makeWizardData(),
      setValue,
    });

    expect(syncFieldsOnSourceChangeMock).toHaveBeenCalledWith(
      setValue,
      cidrDefaultSyncRules,
      false,
      undefined
    );
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
  });

  it('syncs autoscaling dependent fields when autoscaling toggles', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'autoscaling',
      formValues: { autoscaling: true },
      previousValue: false,
      currentValue: true,
      wizardData: makeWizardData(),
      setValue,
    });

    expect(syncFieldsOnSourceChangeMock).toHaveBeenCalledWith(
      setValue,
      autoscalingSyncRules,
      true,
      undefined
    );
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
  });

  it('clears inactive autoscaling fields on initial mount without applying setDefaults', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'autoscaling',
      formValues: { autoscaling: true },
      previousValue: undefined,
      currentValue: true,
      wizardData: makeWizardData(),
      setValue,
    });

    expect(syncFieldsOnSourceChangeMock).toHaveBeenCalledWith(
      setValue,
      autoscalingSyncRules,
      true,
      {
        clearOnly: true,
        shouldDirty: false,
      }
    );
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
  });

  it('does not sync autoscaling setDefaults on initial mount when autoscaling is disabled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'autoscaling',
      formValues: { autoscaling: false },
      previousValue: undefined,
      currentValue: false,
      wizardData: makeWizardData(),
      setValue,
    });

    expect(syncFieldsOnSourceChangeMock).toHaveBeenCalledWith(
      setValue,
      autoscalingSyncRules,
      false,
      { clearOnly: true, shouldDirty: false }
    );
  });

  it('applies derived sync when installer role changes', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const installerArn = fixtures.mockRoles[0].installerRole.value;
    const wizardData = makeWizardData();

    applyWizardFieldMetaChangeEffects({
      sourceField: 'installer_role_arn',
      formValues: { installer_role_arn: installerArn },
      previousValue: '',
      currentValue: installerArn,
      wizardData,
      setValue,
    });

    expect(applyWizardFieldDerivedSyncMock).toHaveBeenCalledWith({
      syncKey: 'installerRoleDependentRoles',
      currentValue: installerArn,
      formValues: { installer_role_arn: installerArn },
      wizardData,
      setValue,
    });
  });

  it('applies derived sync on initial mount when installer role is prefilled', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const installerArn = fixtures.mockRoles[0].installerRole.value;
    const wizardData = makeWizardData();

    applyWizardFieldMetaChangeEffects({
      sourceField: 'installer_role_arn',
      formValues: { installer_role_arn: installerArn },
      previousValue: undefined,
      currentValue: installerArn,
      wizardData,
      setValue,
    });

    expect(applyWizardFieldDerivedSyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        syncKey: 'installerRoleDependentRoles',
        currentValue: installerArn,
        wizardData,
      })
    );
  });

  it('does not run effects when the source value is semantically unchanged', () => {
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const vpcListFetch = jest.fn();

    applyWizardFieldMetaChangeEffects({
      sourceField: 'selected_vpc',
      formValues: {
        selected_vpc: 'vpc-abc',
        security_groups_worker: ['sg-1'],
      },
      previousValue: { id: 'vpc-abc', name: 'my-vpc', aws_subnets: [] },
      currentValue: 'vpc-abc',
      wizardData: makeWizardData({ vpcListFetch }),
      setValue,
    });

    expect(vpcListFetch).not.toHaveBeenCalled();
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
    expect(syncFieldsOnSourceChangeMock).not.toHaveBeenCalled();
    expect(applyWizardFieldDerivedSyncMock).not.toHaveBeenCalled();
  });

  it('passes argFromField to fetch and skips empty args', () => {
    const regionsFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'associated_aws_id',
      formValues: { associated_aws_id: '' },
      previousValue: '123',
      currentValue: '',
      wizardData: makeWizardData({ regionsFetch }),
      setValue,
    });

    expect(regionsFetch).not.toHaveBeenCalled();
  });

  it('resolves availability zones from VPC list when selected_vpc is a string id', () => {
    const machineTypesFetch = jest.fn();
    const vpcListFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const vpcListData: VPC[] = [
      {
        id: 'vpc-123',
        name: 'test-vpc',
        aws_subnets: [
          { subnet_id: 'sub-1', name: 's1', availability_zone: 'us-east-1a', public: true },
          { subnet_id: 'sub-2', name: 's2', availability_zone: 'us-east-1b', public: false },
          { subnet_id: 'sub-3', name: 's3', availability_zone: 'us-east-1a', public: false },
        ],
      },
    ];

    applyWizardFieldMetaChangeEffects({
      sourceField: 'region',
      formValues: {
        region: 'us-east-1',
        associated_aws_id: 'aws-123',
        installer_role_arn: 'arn:aws:iam::role/installer',
        selected_vpc: 'vpc-123',
      },
      previousValue: undefined,
      currentValue: 'us-east-1',
      wizardData: makeWizardData({ machineTypesFetch, vpcListFetch, vpcListData }),
      setValue,
    });

    expect(machineTypesFetch).toHaveBeenCalledTimes(1);
    expect(machineTypesFetch).toHaveBeenCalledWith({
      role_arn: 'arn:aws:iam::role/installer',
      region: 'us-east-1',
      availability_zones: ['us-east-1a', 'us-east-1b'],
    });
  });

  it('resolves availability zones from VPC object when selected_vpc is already resolved', () => {
    const machineTypesFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const vpcObj: VPC = {
      id: 'vpc-456',
      name: 'resolved-vpc',
      aws_subnets: [
        { subnet_id: 'sub-a', name: 'sa', availability_zone: 'us-west-2a', public: true },
        { subnet_id: 'sub-b', name: 'sb', availability_zone: 'us-west-2b', public: false },
      ],
    };

    applyWizardFieldMetaChangeEffects({
      sourceField: 'selected_vpc',
      formValues: {
        selected_vpc: vpcObj,
        installer_role_arn: 'arn:aws:iam::role/installer',
        region: 'us-west-2',
      },
      previousValue: '',
      currentValue: vpcObj,
      wizardData: makeWizardData({ machineTypesFetch }),
      setValue,
    });

    expect(machineTypesFetch).toHaveBeenCalledTimes(1);
    expect(machineTypesFetch).toHaveBeenCalledWith({
      role_arn: 'arn:aws:iam::role/installer',
      region: 'us-west-2',
      availability_zones: ['us-west-2a', 'us-west-2b'],
    });
  });

  it('skips machineTypes refetch when VPC has no subnets', () => {
    const machineTypesFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;
    const vpcListData: VPC[] = [{ id: 'vpc-empty', name: 'empty-vpc', aws_subnets: [] }];

    applyWizardFieldMetaChangeEffects({
      sourceField: 'region',
      formValues: {
        region: 'us-east-1',
        associated_aws_id: 'aws-123',
        installer_role_arn: 'arn:aws:iam::role/installer',
        selected_vpc: 'vpc-empty',
      },
      previousValue: undefined,
      currentValue: 'us-east-1',
      wizardData: makeWizardData({ machineTypesFetch, vpcListData }),
      setValue,
    });

    expect(machineTypesFetch).not.toHaveBeenCalled();
  });
});
