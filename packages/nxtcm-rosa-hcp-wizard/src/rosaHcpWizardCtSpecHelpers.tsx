import rosaHcpWizardFixtures from './ROSAHCPWizard.fixtures';
import { useWizardFieldMetaChangeEffects } from './fieldMetaChangeEffects/useWizardFieldMetaChangeEffects';

import type { MachineTypesResource, ROSAHCPWizardData, VpcListResource } from './types';

const noopFetch = async (): Promise<void> => {};
const defaultMachineTypesFetch = async (_region: string): Promise<void> => {};

/** Minimal {@link ROSAHCPWizardData} for step-isolated Playwright CT mounts using meta change effects. */
export function makeDefaultRosaHcpCtWizardData(
  overrides: Partial<ROSAHCPWizardData> = {}
): ROSAHCPWizardData {
  return {
    awsInfrastructureAccounts: { data: [], error: null, isFetching: false },
    awsBillingAccounts: { data: [], error: null, isFetching: false },
    regions: { data: [], error: null, isFetching: false, fetch: noopFetch },
    versions: { data: { releases: [] }, error: null, isFetching: false, fetch: noopFetch },
    machineTypes: {
      data: [],
      error: null,
      isFetching: false,
      fetch: defaultMachineTypesFetch,
    },
    roles: { data: [], error: null, isFetching: false, fetch: noopFetch },
    oidcConfig: { data: [], error: null, isFetching: false },
    vpcList: { data: [], error: null, isFetching: false, fetch: noopFetch },
    subnets: { data: [], error: null, isFetching: false },
    securityGroups: { data: [], error: null, isFetching: false },
    clusterNameValidation: { error: null, isFetching: false },
    ...overrides,
  };
}

/** Playwright CT: VPC list resource with fixture data and a no-op fetch unless overridden. */
export function makeVpcListResource(overrides?: Partial<VpcListResource>): VpcListResource {
  return {
    data: overrides?.data ?? rosaHcpWizardFixtures.mockVPCs,
    isFetching: overrides?.isFetching ?? false,
    error: overrides?.error ?? null,
    fetch: overrides?.fetch ?? noopFetch,
  };
}

/** Playwright CT: machine types resource with fixture data and a no-op fetch unless overridden. */
export function makeMachineTypesResource(
  overrides?: Partial<MachineTypesResource>
): MachineTypesResource {
  return {
    data: overrides?.data ?? rosaHcpWizardFixtures.mockMachineTypes,
    isFetching: overrides?.isFetching ?? false,
    error: overrides?.error ?? null,
    fetch: overrides?.fetch ?? defaultMachineTypesFetch,
  };
}

type WizardFieldMetaChangeEffectsCtHarnessProps = {
  wizardData: ROSAHCPWizardData;
};

/**
 * Playwright CT only: mounts {@link useWizardFieldMetaChangeEffects} for step-isolated tests.
 * Production uses the hook directly in {@link ROSAHCPWizardBody}.
 */
export function WizardFieldMetaChangeEffectsCtHarness({
  wizardData,
}: WizardFieldMetaChangeEffectsCtHarnessProps): null {
  useWizardFieldMetaChangeEffects(wizardData);
  return null;
}
