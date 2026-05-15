import rosaWizardFixtures from '../RosaWizard/RosaWizard.fixtures';

import type { VpcListResource } from './types';

const defaultVpcListFetch = async (): Promise<void> => {};

/** Playwright CT: VPC list resource with fixture data and a no-op fetch unless overridden. */
export function makeVpcListResource(overrides?: Partial<VpcListResource>): VpcListResource {
  return {
    data: overrides?.data ?? rosaWizardFixtures.mockVPCs,
    isFetching: overrides?.isFetching ?? false,
    error: overrides?.error ?? null,
    fetch: overrides?.fetch ?? defaultVpcListFetch,
  };
}
