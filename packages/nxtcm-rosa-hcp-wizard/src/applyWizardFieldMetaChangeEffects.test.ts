import type { UseFormSetValue } from 'react-hook-form';

import { applyWizardFieldMetaChangeEffects } from './applyWizardFieldMetaChangeEffects';
import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';
import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import type { ROSAHCPCluster, ROSAHCPWizardData } from './types';
import { getWizardFieldSyncsForSourceField } from './yupSchemas';

const autoscalingSyncRules = getWizardFieldSyncsForSourceField('autoscaling');

jest.mock('./resetFieldsToDefaultValues', () => ({
  resetFieldsToDefaultValues: jest.fn(),
}));

jest.mock('./syncFieldsOnSourceChange', () => ({
  syncFieldsOnSourceChange: jest.fn(),
}));

const resetFieldsToDefaultValuesMock = resetFieldsToDefaultValues as jest.MockedFunction<
  typeof resetFieldsToDefaultValues
>;
const syncFieldsOnSourceChangeMock = syncFieldsOnSourceChange as jest.MockedFunction<
  typeof syncFieldsOnSourceChange
>;

function makeWizardData(
  overrides: Partial<{
    vpcListFetch: jest.Mock;
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
    roles: { data: [], error: null, isFetching: false, fetch: jest.fn() },
    oidcConfig: { data: [], error: null, isFetching: false },
    vpcList: {
      data: [],
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
      formValues: { region: 'us-east-1' },
      previousValue: undefined,
      currentValue: 'us-east-1',
      wizardData: makeWizardData({ vpcListFetch, machineTypesFetch }),
      setValue,
    });

    expect(vpcListFetch).toHaveBeenCalledTimes(1);
    expect(vpcListFetch).toHaveBeenCalledWith();
    expect(machineTypesFetch).toHaveBeenCalledWith('us-east-1');
    expect(resetFieldsToDefaultValuesMock).not.toHaveBeenCalled();
  });

  it('resets dependents and refetches when a tracked field changes', () => {
    const vpcListFetch = jest.fn();
    const machineTypesFetch = jest.fn();
    const setValue = jest.fn() as jest.MockedFunction<UseFormSetValue<Partial<ROSAHCPCluster>>>;

    applyWizardFieldMetaChangeEffects({
      sourceField: 'region',
      formValues: { region: 'us-west-2' },
      previousValue: 'us-east-1',
      currentValue: 'us-west-2',
      wizardData: makeWizardData({ vpcListFetch, machineTypesFetch }),
      setValue,
    });

    expect(vpcListFetch).toHaveBeenCalledTimes(1);
    expect(vpcListFetch).toHaveBeenCalledWith();
    expect(machineTypesFetch).toHaveBeenCalledWith('us-west-2');
    expect(resetFieldsToDefaultValuesMock).toHaveBeenCalledWith(setValue, [
      'selected_vpc',
      'machine_pools_subnets',
      'security_groups_worker',
      'cluster_privacy_public_subnet_id',
    ]);
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

    expect(resetFieldsToDefaultValuesMock).toHaveBeenCalledWith(setValue, ['no_proxy_domains']);
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
});
