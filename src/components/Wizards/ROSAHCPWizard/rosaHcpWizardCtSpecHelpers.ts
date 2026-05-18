import rosaHcpWizardFixtures from './ROSAHCPWizard.fixtures';

import type { MachineTypesResource, VpcListResource } from './types';

const defaultVpcListFetch = async (): Promise<void> => {};
const defaultMachineTypesFetch = async (_region: string): Promise<void> => {};

/** Playwright CT: VPC list resource with fixture data and a no-op fetch unless overridden. */
export function makeVpcListResource(overrides?: Partial<VpcListResource>): VpcListResource {
  return {
    data: overrides?.data ?? rosaHcpWizardFixtures.mockVPCs,
    isFetching: overrides?.isFetching ?? false,
    error: overrides?.error ?? null,
    fetch: overrides?.fetch ?? defaultVpcListFetch,
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
